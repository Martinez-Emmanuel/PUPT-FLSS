<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\PreferencesSetting;
use App\Models\User;
use Illuminate\Http\Request;
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
        try {
            // Validate the incoming request
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:255|unique:users',
                'role' => 'required|in:super_admin,admin,faculty',
                'faculty_email' => 'required_if:role,faculty|email|unique:faculty,faculty_email',
                'faculty_type' => 'required_if:role,faculty',
                'faculty_units' => 'required_if:role,faculty',
                'password' => 'required|string|min:8',
                'status' => 'required|in:Active,Inactive',
            ]);

            // Create the user record without bcrypt
            $user = User::create([
                'name' => $validatedData['name'],
                'code' => $validatedData['code'],
                'role' => $validatedData['role'],
                'password' => $validatedData['password'], // No bcrypt
                'status' => $validatedData['status'],
            ]);

            // If the user role is 'faculty', create the related faculty record
            if ($validatedData['role'] === 'faculty') {
                $faculty = Faculty::create([
                    'user_id' => $user->id,
                    'faculty_email' => $validatedData['faculty_email'],
                    'faculty_type' => $validatedData['faculty_type'],
                    'faculty_units' => $validatedData['faculty_units'],
                ]);

                PreferencesSetting::create([
                    'faculty_id' => $faculty->id,
                    'is_enabled' => 0,
                ]);
            }

            // Return a success response with the created user data
            return response()->json([
                'status' => 'success',
                'message' => 'User created successfully',
                'data' => $user->load('faculty'),
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Return a structured validation error response
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error occurred',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // General error response for any other failures
            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred',
                'error_details' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, User $user)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|in:super_admin,admin,faculty',
            'faculty_email' => [
                'required_if:role,faculty',
                // Ignore current faculty's email to avoid 'unique' conflict
                Rule::unique('faculty', 'faculty_email')->ignore($user->faculty ? $user->faculty->id : null),
            ],
            'faculty_type' => 'required_if:role,faculty',
            'faculty_units' => 'required_if:role,faculty',
            'password' => 'sometimes|string|min:8',
            'status' => 'sometimes|required|in:Active,Inactive',
        ]);

        // Update user details
        $user->update([
            'name' => $validatedData['name'],
            'role' => $validatedData['role'],
            'status' => $validatedData['status'],
        ]);

        // If the role is faculty, update or create the faculty details
        if ($validatedData['role'] === 'faculty') {
            $user->faculty()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'faculty_email' => $validatedData['faculty_email'],
                    'faculty_type' => $validatedData['faculty_type'],
                    'faculty_units' => $validatedData['faculty_units'],
                ]
            );
        } else {
            // If the user is no longer a faculty, delete the faculty record
            if ($user->faculty) {
                $user->faculty->delete();
            }
        }

        // If a password is provided, update it without bcrypt
        if (isset($validatedData['password'])) {
            $user->update(['password' => $validatedData['password']]); // No bcrypt applied
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
            'status' => 'required|in:Active,Inactive',
        ]);

        // Create the user with the role provided in the request
        $admin = User::create([
            'name' => $validatedData['name'],
            'code' => $validatedData['code'],
            'role' => $validatedData['role'], // Role comes from the request
            'password' => $validatedData['password'], // Hash the password
            'status' => $validatedData['status'], // Set status
        ]);

        return response()->json($admin, 201);
    }

    public function updateAdmin(Request $request, User $admin)
    {
        // Validate the incoming request
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:users,code,' . $admin->id,
            'password' => 'sometimes|string|min:8',
            'role' => 'sometimes|required|in:admin,superadmin',
            'status' => 'sometimes|required|in:Active,Inactive',
        ]);

        // Initialize an array to store fields that have changed
        $changedFields = [];

        // Check each field for changes and update if necessary
        if (isset($validatedData['name'])) {
            $admin->name = $validatedData['name'];
            $changedFields[] = 'name';
        }

        if (isset($validatedData['code']) && $admin->code != $validatedData['code']) {
            $admin->code = $validatedData['code'];
            $changedFields[] = 'code';
        }

        if (isset($validatedData['role']) && $admin->role != $validatedData['role']) {
            $admin->role = $validatedData['role'];
            $changedFields[] = 'role';
        }

        if (isset($validatedData['status']) && $admin->status != $validatedData['status']) {
            $admin->status = $validatedData['status'];
            $changedFields[] = 'status';
        }

        if (isset($validatedData['password'])) {
            // If the password is being updated, hash it
            $admin->password = $validatedData['password']; // Hashing will be handled by setPasswordAttribute
            $changedFields[] = 'password';
        }

        if (empty($changedFields)) {
            return response()->json(['message' => 'No changes detected'], 422);
        }

        $admin->save();

        return response()->json([
            'message' => 'Admin updated successfully',
            'updated_fields' => $changedFields,
            'admin' => $admin,
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
