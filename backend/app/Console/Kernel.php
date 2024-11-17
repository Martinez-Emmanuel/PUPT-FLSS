<?php

namespace App\Console;

use App\Console\Commands\DeployBackend;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Cpmmand to run when deploying for production
     */
    protected $commands = [
        DeployBackend::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('preferences:check-deadline')
        // ->everyMinute()
            ->dailyAt('00:01')
            ->timezone('Asia/Manila');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
