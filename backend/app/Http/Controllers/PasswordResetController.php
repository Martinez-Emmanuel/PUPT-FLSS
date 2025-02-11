<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Send a password reset link to the given user.
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // Check if user exists and is a faculty member
        $user = User::where('email', $request->email)
            ->where('role', 'faculty')
            ->first();

        if (! $user) {
            return response()->json([
                'message' => 'If a faculty account exists with this email, you will receive a password reset link shortly.',
            ], 200);
        }

        // Generate reset token
        $token = Password::createToken($user);

        // Send email with reset link
        Mail::send('emails.reset_password', [
            'faculty_name' => $user->first_name . ' ' . $user->last_name,
            'reset_link'   => config('app.frontend_url') . "/reset-password/{$token}?email=" . urlencode($user->email),
        ], function ($message) use ($user) {
            $message->to($user->email)
                ->subject('Reset Your PUPT-FLSS Password');
        });

        return response()->json([
            'message' => 'If a faculty account exists with this email, you will receive a password reset link shortly.',
        ], 200);
    }

    /**
     * Reset the user's password.
     */
    public function reset(Request $request)
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => 'required|min:8|max:128|confirmed',
        ]);

        // Check if user exists and is a faculty member
        $user = User::where('email', $request->email)
            ->where('role', 'faculty')
            ->first();

        if (! $user) {
            return response()->json(['message' => 'Invalid email address.'], 422);
        }

        // Verify token
        if (! Password::tokenExists($user, $request->token)) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 422);
        }

        $user->password = $request->password;

        $user->setRememberToken(Str::random(60));
        $user->save();

        // Delete the token
        Password::deleteToken($user);

        return response()->json(['message' => 'Password has been reset successfully.']);
    }

    /**
     * Verify if token is valid.
     */
    public function verifyToken(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)
            ->where('role', 'faculty')
            ->first();

        if (! $user || ! Password::tokenExists($user, $request->token)) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 422);
        }

        return response()->json(['message' => 'Token is valid.']);
    }
}
