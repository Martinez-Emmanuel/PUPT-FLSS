<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Carbon\Carbon;

class AuthController extends Controller
{
    // Login function
    public function login(Request $request)
    {
        $loginUserData = $request->validate([
            'code' => 'required|string',
            'password' => 'required|string'
        ]);

        // Check if the user exists and the password is correct
        $user = User::where('code', $loginUserData['code'])->first();

        if (!$user || !Hash::check($loginUserData['password'], $user->password)) {
            return response()->json(['message' => 'Invalid Credentials'], 401);
        }

        // Create token and login the user
        $tokenResult = $user->createToken('user-token');
        $token = $tokenResult->plainTextToken;
        $expiration = Carbon::now()->addHours(24);


        // Optionally, include faculty details if available
        $faculty = $user->faculty;  // Assuming the relationship exists in the User model

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'expires_at' => $expiration,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'code' => $user->code,
                'role' => $user->role,
                'faculty' => $faculty ? [
                    'faculty_email' => $faculty->faculty_email,
                    'faculty_type' => $faculty->faculty_type,
                    'faculty_unit' => $faculty->faculty_unit,
                ] : null,
            ]
        ]);
    }

    // Logout function
  // Logout function
public function logout(Request $request)
{
    $user = $request->user();

    if ($user) {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.'], 200);
    }

    return response()->json(['message' => 'Unauthenticated.'], 401);
}

}
