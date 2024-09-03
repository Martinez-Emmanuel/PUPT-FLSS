<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('super_admin');
    }

    public function index()
    {
        $users = User::with('faculty')->get();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:users',
            'role' => 'required|in:super_admin,admin,faculty',
            'faculty_email' => 'required_if:role,faculty|email|unique:faculty,faculty_email',
            'faculty_type' => 'required_if:role,faculty',
            'faculty_unit' => 'required_if:role,faculty',
            'password' => 'required|string|min:8',
        ]);
    
        $user = User::create([
            'name' => $validatedData['name'],
            'code' => $validatedData['code'],
            'role' => $validatedData['role'],
            'password' => $validatedData['password'], // No manual hashing needed
        ]);
    
        if ($validatedData['role'] === 'faculty') {
            Faculty::create([
                'user_id' => $user->id,
                'faculty_email' => $validatedData['faculty_email'],
                'faculty_type' => $validatedData['faculty_type'],
                'faculty_unit' => $validatedData['faculty_unit'],
            ]);
        }
    
        return response()->json($user, 201);
    }
    
    public function update(Request $request, User $user)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:users,code,' . $user->id,
            'role' => 'required|in:super_admin,admin,faculty',
            'faculty_email' => 'required_if:role,faculty|email|unique:faculty,faculty_email,' . optional($user->faculty)->id,
            'faculty_type' => 'required_if:role,faculty',
            'faculty_unit' => 'required_if:role,faculty',
            'password' => 'sometimes|string|min:8',
        ]);
    
        $user->update([
            'name' => $validatedData['name'],
            'code' => $validatedData['code'],
            'role' => $validatedData['role'],
            // No need to manually hash the password
        ]);
    
        if ($validatedData['role'] === 'faculty') {
            $user->faculty()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'faculty_email' => $validatedData['faculty_email'],
                    'faculty_type' => $validatedData['faculty_type'],
                    'faculty_unit' => $validatedData['faculty_unit'],
                ]
            );
        } else {
            if ($user->faculty) {
                $user->faculty->delete();
            }
        }
    
        if (isset($validatedData['password'])) {
            $user->update(['password' => $validatedData['password']]); // No manual hashing needed
        }
    
        return response()->json($user->load('faculty'));
    }
    

    public function destroy(User $user)
    {
        if ($user->faculty) {
            $user->faculty->delete();
        }
        $user->delete();
    
        return response()->json(null, 204);
    }

}