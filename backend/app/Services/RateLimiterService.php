<?php

namespace App\Services;

use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Cache;
use InvalidArgumentException;

class RateLimiterService
{
    /**
     * Default configuration for different rate limit types.
     *
     * Rate limit configuration for login:
     * - max_attempts: Maximum number of regular login attempts allowed
     * - decay_minutes: Duration in minutes before attempts counter resets
     * - ban_threshold: Number of lockouts that trigger a ban
     * - ban_duration: Duration in minutes that a ban lasts
     *
     * @var array<string, array<string, int>>
     */
    private const LIMITS = [
        'login' => [
            'max_attempts' => 5,
            'decay_minutes' => 5,
            'ban_threshold' => 3,
            'ban_duration' => 60,
        ],
    ];

    /**
     * Check if the given key has reached its rate limit, is locked, or banned.
     */
    public function tooManyAttempts(string $key, string $type = 'api'): bool
    {
        $this->validateType($type);

        // Check for ban first
        if ($this->isBanned($key)) {
            return true;
        }

        // Then check for regular lockout
        if ($this->isLocked($key)) {
            return true;
        }

        return $this->attempts($key) >= $this->maxAttempts($type);
    }

    /**
     * Increment the counter for a given key.
     */
    public function hit(string $key, string $type = 'api'): int
    {
        try {
            $this->validateType($type);

            if ($this->isBanned($key) || $this->isLocked($key)) {
                return $this->attempts($key);
            }

            $cacheKey = $this->attemptKey($key);
            $decaySeconds = $this->decayMinutes($type) * 60;
            $lockName = "lock:{$cacheKey}";

            $lock = Cache::lock($lockName, 5);

            try {
                $lock->block(3);

                $attempts = Cache::get($cacheKey, 0) + 1;
                Cache::put($cacheKey, $attempts, $decaySeconds);

                if ($attempts >= $this->maxAttempts($type)) {
                    $this->lockout($key, $type);
                }

                return $attempts;
            } catch (LockTimeoutException $e) {
                \Log::warning('Rate limiter lock timeout', [
                    'key' => $key,
                    'type' => $type,
                ]);
                return Cache::get($cacheKey, 0);
            } finally {
                optional($lock)->release();
            }
        } catch (\Exception $e) {
            \Log::error('Rate limiter error', [
                'key' => $key,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
            return 0;
        }
    }

    /**
     * Get the remaining time until available in seconds.
     */
    public function availableIn(string $key): int
    {
        // Check ban first
        $banExpiry = Cache::get($this->banKey($key));
        if ($banExpiry && $banExpiry > time()) {
            return $banExpiry - time();
        }

        // Then check regular lockout
        $lockExpiry = Cache::get($this->lockKey($key));
        if ($lockExpiry && $lockExpiry > time()) {
            return $lockExpiry - time();
        }

        return 0;
    }

    /**
     * Lock out or ban a key based on lockout history.
     */
    public function lockout(string $key, string $type = 'api'): void
    {
        $this->validateType($type);

        $lockoutCount = $this->incrementLockoutCount($key);

        if ($lockoutCount >= self::LIMITS[$type]['ban_threshold']) {
            $this->ban($key, $type);
        } else {
            $decaySeconds = self::LIMITS[$type]['decay_minutes'] * 60;
            Cache::put($this->lockKey($key), time() + $decaySeconds, $decaySeconds);

            \Log::warning('User locked out', [
                'key' => $key,
                'lockout_count' => $lockoutCount,
                'duration' => self::LIMITS[$type]['decay_minutes'],
            ]);
        }
    }

    /**
     * Ban a key for a longer duration.
     */
    private function ban(string $key, string $type): void
    {
        $banSeconds = self::LIMITS[$type]['ban_duration'] * 60;
        Cache::put($this->banKey($key), time() + $banSeconds, $banSeconds);

        \Log::warning('User banned due to multiple lockouts', [
            'key' => $key,
            'ban_duration' => self::LIMITS[$type]['ban_duration'],
        ]);
    }

    /**
     * Check if a key is currently banned.
     */
    private function isBanned(string $key): bool
    {
        $banExpiry = Cache::get($this->banKey($key));
        return $banExpiry && $banExpiry > time();
    }

    /**
     * Increment and get the lockout count for a key.
     */
    private function incrementLockoutCount(string $key): int
    {
        $lockoutKey = $this->lockoutCountKey($key);
        $count = Cache::get($lockoutKey, 0) + 1;

        // Store lockout count for 24 hours
        Cache::put($lockoutKey, $count, 60 * 24);

        return $count;
    }

    /**
     * Get message for current status (locked/banned).
     */
    public function getBlockMessage(string $key): string
    {
        if ($this->isBanned($key)) {
            return 'Account temporarily banned due to multiple failed login attempts. Please try again later.';
        }
        return 'Too many login attempts. Please try again later.';
    }

    // Add these new key methods
    private function banKey(string $key): string
    {
        return "limiter_ban_{$key}";
    }

    private function lockoutCountKey(string $key): string
    {
        return "limiter_lockout_count_{$key}";
    }

    /**
     * Get the remaining attempts for the given key before it is locked out.
     *
     * @param  string  $key
     * @param  string  $type
     * @return int
     */
    public function remaining(string $key, string $type = 'api'): int
    {
        $this->validateType($type);

        // If locked, no attempts remain.
        if ($this->isLocked($key)) {
            return 0;
        }

        return max(0, $this->maxAttempts($type) - $this->attempts($key));
    }

    /**
     * Wipe out all rate-limiting data (attempts and lock) for a given key.
     *
     * @param  string  $key
     * @return void
     */
    public function clear(string $key): void
    {
        Cache::forget($this->attemptKey($key));
        Cache::forget($this->lockKey($key));
    }

    /**
     * Get the current number of attempts for the given key.
     *
     * @param  string  $key
     * @return int
     */
    public function attempts(string $key): int
    {
        return Cache::get($this->attemptKey($key), 0);
    }

    /**
     * Get the maximum allowed attempts for the given type.
     *
     * @param  string  $type
     * @return int
     */
    public function maxAttempts(string $type): int
    {
        return self::LIMITS[$type]['max_attempts'];
    }

    /**
     * Get the decay duration (in minutes) for the given type.
     *
     * @param  string  $type
     * @return int
     */
    public function decayMinutes(string $type): int
    {
        return self::LIMITS[$type]['decay_minutes'];
    }

    /**
     * Determine if a key is currently locked.
     *
     * @param  string  $key
     * @return bool
     */
    public function isLocked(string $key): bool
    {
        // If the lock timestamp exists and is in the future, we consider it locked.
        $lockedUntil = Cache::get($this->lockKey($key));

        return !is_null($lockedUntil) && $lockedUntil > time();
    }

    /**
     * Validate that the requested rate limit type exists.
     *
     * @param  string  $type
     * @return void
     *
     * @throws InvalidArgumentException
     */
    private function validateType(string $type): void
    {
        if (!isset(self::LIMITS[$type])) {
            throw new InvalidArgumentException("Unknown rate limit type: {$type}");
        }
    }

    /**
     * Get the cache key for storing attempts.
     *
     * @param  string  $key
     * @return string
     */
    private function attemptKey(string $key): string
    {
        return "limiter_attempts_{$key}";
    }

    /**
     * Get the cache key for storing lock information.
     *
     * @param  string  $key
     * @return string
     */
    private function lockKey(string $key): string
    {
        return "limiter_locked_{$key}";
    }

    /**
     * Clean up expired rate limit data.
     */
    public function cleanup(string $key): void
    {
        if (!$this->isLocked($key) && $this->attempts($key) === 0) {
            $this->clear($key);
        }
    }
}
