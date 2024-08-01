<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use App\Models\Faculty;

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
            'password' => 'required|string'
        ]);

        // Find the faculty by faculty_code
        $faculty = Faculty::where('faculty_code', $loginUserData['faculty_code'])->first();

        // Check if faculty exists and password matches (plaintext comparison)
        if (!$faculty || $loginUserData['password'] !== $faculty->faculty_password) {
            return response()->json([
                'message' => 'Invalid Credentials'
            ], 401);
        }

        // Store faculty data in session
        Session::put('faculty_id', $faculty->faculty_id);
        Session::put('faculty_code', $faculty->faculty_code);
        Session::put('faculty_email', $faculty->faculty_email);
        Session::put('faculty_type', $faculty->faculty_type);

        return response()->json([
            'message' => 'Login successful',
            'session_data' => Session::all()
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
        // Check if the session contains the necessary data
        if (!Session::has('faculty_id') || !Session::has('_token')) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Destroy the session
        Session::flush();

        return response()->json([
            'message' => 'Logged out successfully.'
        ], 200);
    }
}
