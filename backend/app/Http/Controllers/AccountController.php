<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    /**
     * ===================================
     * Admin/Superadmin Account Management
     * ===================================
     */

    /**
     * GET all admin and superadmin accounts
     */
    public function indexAdmins()
    {
        // Fetch users with roles 'admin' or 'super_admin'
        $admins = User::whereIn('role', ['admin', 'superadmin'])->get();
        return response()->json($admins);
    }

    /**
     * CREATE new admin/superadmin account
     */
    public function storeAdmin(Request $request)
    {
        $validatedData = $request->validate([
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'suffix_name' => 'nullable|string|max:255',
            'code' => 'required|string|max:255|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,superadmin',
            'status' => 'required|in:Active,Inactive',
        ]);

        $admin = User::create([
            'last_name' => $validatedData['last_name'],
            'first_name' => $validatedData['first_name'],
            'middle_name' => $validatedData['middle_name'],
            'suffix_name' => $validatedData['suffix_name'],
            'code' => $validatedData['code'],
            'email' => $validatedData['email'],
            'role' => $validatedData['role'],
            'password' => $validatedData['password'],
            'status' => $validatedData['status'],
        ]);

        return response()->json($admin, 201);
    }

    /**
     * UPDATE admin/superadmin account details
     */
    public function updateAdmin(Request $request, User $admin)
    {
        $validatedData = $request->validate([
            'last_name' => 'sometimes|required|string|max:255',
            'first_name' => 'sometimes|required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'suffix_name' => 'nullable|string|max:255',
            'code' => 'sometimes|required|string|max:255|unique:users,code,' . $admin->id,
            'email' => 'sometimes|required|email|unique:users,email,' . $admin->id,
            'password' => 'sometimes|string|min:8',
            'role' => 'sometimes|required|in:admin,superadmin',
            'status' => 'sometimes|required|in:Active,Inactive',
        ]);

        $changedFields = [];

        // Check each field for changes and update if necessary
        if (isset($validatedData['last_name']) && $admin->last_name != $validatedData['last_name']) {
            $admin->last_name = $validatedData['last_name'];
            $changedFields[] = 'last_name';
        }

        if (isset($validatedData['first_name']) && $admin->first_name != $validatedData['first_name']) {
            $admin->first_name = $validatedData['first_name'];
            $changedFields[] = 'first_name';
        }

        if (isset($validatedData['middle_name']) && $admin->middle_name != $validatedData['middle_name']) {
            $admin->middle_name = $validatedData['middle_name'];
            $changedFields[] = 'middle_name';
        }

        if (isset($validatedData['suffix_name']) && $admin->suffix_name != $validatedData['suffix_name']) {
            $admin->suffix_name = $validatedData['suffix_name'];
            $changedFields[] = 'suffix_name';
        }

        if (isset($validatedData['code']) && $admin->code != $validatedData['code']) {
            $admin->code = $validatedData['code'];
            $changedFields[] = 'code';
        }

        if (isset($validatedData['email']) && $admin->email != $validatedData['email']) {
            $admin->email = $validatedData['email'];
            $changedFields[] = 'email';
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
            $admin->password = $validatedData['password'];
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

    /**
     * DELETE an admin/superadmin account
     */
    public function destroyAdmin(User $admin)
    {
        if ($admin->role !== 'admin' && $admin->role !== 'superadmin') {
            return response()->json(['message' => 'User is not an admin'], 400);
        }

        $admin->delete();

        return response()->json(null, 204);
    }
}
