<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;


class AccountController extends Controller
{

    // public function __construct()
    // {
    //     $this->middleware('auth');
    //     $this->middleware('super_admin');
    // }

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
            'status' => 'required|in:active,inactive',
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'code' => $validatedData['code'],
            'role' => $validatedData['role'],
            'password' => $validatedData['password'], // No manual hashing needed
            'status' => $validatedData['status'], // Set status
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
            // 'code' => 'required|string|max:255|unique:users,code,' . $user->id,
            'role' => 'required|in:super_admin,admin,faculty',
            'faculty_email' => 'required_if:role,faculty|email|unique:faculty,faculty_email,' . optional($user->faculty)->id,
            'faculty_type' => 'required_if:role,faculty',
            'faculty_unit' => 'required_if:role,faculty',
            'password' => 'sometimes|string|min:8',
            'status' => 'sometimes|required|in:active,inactive', // Add validation for status
        ]);

        $user->update([
            'name' => $validatedData['name'],
            // 'code' => $validatedData['code'],
            'role' => $validatedData['role'],
            // No need to manually hash the password
            'status' => $validatedData['status'],
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

    //For Admin
    public function indexAdmins()
    {
        // Fetch users with roles 'admin' or 'super_admin'
        $admins = User::whereIn('role', ['admin', 'superadmin'])->get();
        return response()->json($admins);
    }

    public function storeAdmin(Request $request)
    {
        // Validate the incoming request
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,superadmin', // Restrict role to admin or super_admin
            'status' => 'required|in:active,inactive',
        ]);

        // Create the user with the role provided in the request
        $admin = User::create([
            'name' => $validatedData['name'],
            'code' => $validatedData['code'],
            'role' => $validatedData['role'], // Role comes from the request
            'password' => $validatedData['password'], // Hash the password
            'status' => $validatedData['status'],  // Set status
        ]);

        return response()->json($admin, 201);
    }


    public function updateAdmin(Request $request, User $admin)
    {
        // Validate the incoming request
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255',
            'password' => 'sometimes|required|string|min:8',
            'role' => 'sometimes|required|in:admin,superadmin',
            'status' => 'sometimes|required|in:active,inactive',
        ]);

        // Initialize an array to store fields that have changed
        $changedFields = [];

        // Check each field for changes and update if necessary
        foreach ($validatedData as $key => $value) {
            if ($key === 'password') {
                if (Hash::check($value, $admin->password)) {
                    // Password hasn't changed, so skip it
                    continue;
                }
                $admin->password = Hash::make($value);
                $changedFields[] = 'password';
            } elseif ($admin->$key != $value) {
                $admin->$key = $value;
                $changedFields[] = $key;
            }
        }

        if (empty($changedFields)) {
            return response()->json(['message' => 'No changes detected'], 422);
        }

        $admin->save();

        return response()->json([
            'message' => 'Admin updated successfully',
            'updated_fields' => $changedFields,
            'admin' => $admin
        ]);
    }


    // Delete an admin
    public function destroyAdmin(User $admin)
    {
        if ($admin->role !== 'admin' && $admin->role !== 'superadmin') {
            return response()->json(['message' => 'User is not an admin'], 400);
        }

        $admin->delete();

        return response()->json(null, 204);
    }

}