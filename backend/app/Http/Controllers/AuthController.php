<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use App\Models\Faculty;
use Laravel\Sanctum\PersonalAccessToken;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Handle login request.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // Validate incoming request
        $loginUserData = $request->validate([
            'faculty_code' => 'required|string',
            'faculty_password' => 'required|string'
        ]);

        // Find the faculty by faculty_code
        $faculty = Faculty::where('faculty_code', $loginUserData['faculty_code'])->first();

        // Check if faculty exists and password matches (plaintext comparison)
        if (!$faculty || $loginUserData['faculty_password'] !== $faculty->faculty_password) {
            return response()->json([
                'message' => 'Invalid Credentials'
            ], 401);
        }

        // Authenticate the user
        Auth::login($faculty);

        // Create a new Sanctum token with an expiration time
        $tokenResult = $faculty->createToken('faculty-token');
        $token = $tokenResult->plainTextToken;

        // // Fetch the token expiration time
        // $tokenModel = PersonalAccessToken::findToken($token);
        // $expiresAt = $tokenModel->expires_at;

        // Set token expiration (e.g., 1 hour from now)
        $expiration = Carbon::now()->addMinutes(1);

        // Update the token's expires_at attribute
        $tokenResult->accessToken->expires_at = $expiration;
        $tokenResult->accessToken->save();



        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'expires_at' => $expiration,
            'faculty' => [
                'faculty_id' => $faculty->faculty_id,
                'faculty_name' => $faculty->faculty_name,
                'faculty_code' => $faculty->faculty_code,
                'faculty_email' => $faculty->faculty_email,
                'faculty_type' => $faculty->faculty_type,
            ]
        ]);
    }

    /**
     * Handle logout request.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Ensure the user is authenticated
        if ($request->user()) {
            // Revoke the token that was used to authenticate the current request
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Logged out successfully.'
            ], 200);
        }

        return response()->json([
            'message' => 'Unauthenticated.'
        ], 401);
    }
}
