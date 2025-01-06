<?php

namespace App\Http\Controllers;

use App\Http\Controllers\WebhookController;
use App\Models\Faculty;
use App\Models\User;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    protected $webhookController;

    /**
     * AccountController constructor.
     * @param WebhookController $webhookController
     * The webhook controller instance to be injected
     */
    public function __construct(WebhookController $webhookController)
    {
        $this->webhookController = $webhookController;
    }

    /**
     * GET all users with their faculty relationships
     */
    public function index()
    {
        $users = User::with('faculty')->get();
        return response()->json($users);
    }

    /**
     * =================================
     * Faculty Account Management
     * =================================
     */

    /**
     * CREATE new faculty account with optional faculty details
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'first_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'last_name' => 'required|string',
            'suffix_name' => 'nullable|string',
            'code' => 'required|string|unique:users',
            'email' => 'required|email|unique:users',
            'role' => 'required|string',
            'status' => 'required|string',
            'faculty_type' => 'required_if:role,faculty|string',
            'faculty_units' => 'required_if:role,faculty|numeric',
            'password' => 'required|string',
        ]);

        $user = User::create([
            'first_name' => $validatedData['first_name'],
            'middle_name' => $validatedData['middle_name'],
            'last_name' => $validatedData['last_name'],
            'suffix_name' => $validatedData['suffix_name'],
            'code' => $validatedData['code'],
            'email' => $validatedData['email'],
            'role' => $validatedData['role'],
            'status' => $validatedData['status'],
            'password' => $validatedData['password'],
        ]);

        if ($validatedData['role'] === 'faculty') {
            $user->faculty()->create([
                'faculty_type' => $validatedData['faculty_type'],
                'faculty_units' => $validatedData['faculty_units'],
            ]);

            // Send webhook to HRIS about new faculty
            $facultyData = [
                'faculty_code' => $validatedData['code'],
                'first_name' => $validatedData['first_name'],
                'middle_name' => $validatedData['middle_name'],
                'last_name' => $validatedData['last_name'],
                'name_extension' => $validatedData['suffix_name'],
                'email' => $validatedData['email'],
                'status' => $validatedData['status'],
                'faculty_type' => $validatedData['faculty_type'],
            ];

            $this->webhookController->sendFacultyWebhook('faculty.created', $facultyData);
        }

        return response()->json($user->load('faculty'), 201);
    }

    /**
     * UPDATE existing faculty account and faculty details
     */
    public function update(Request $request, User $user)
    {
        $validatedData = $request->validate([
            'first_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'last_name' => 'required|string',
            'suffix_name' => 'nullable|string',
            'email' => 'required|email',
            'role' => 'required|string',
            'status' => 'required|string',
            'faculty_type' => 'required_if:role,faculty|string',
            'faculty_units' => 'required_if:role,faculty|numeric',
            'password' => 'nullable|string',
        ]);

        $user->update([
            'first_name' => $validatedData['first_name'],
            'middle_name' => $validatedData['middle_name'],
            'last_name' => $validatedData['last_name'],
            'suffix_name' => $validatedData['suffix_name'],
            'email' => $validatedData['email'],
            'role' => $validatedData['role'],
            'status' => $validatedData['status'],
        ]);

        // If the role is faculty, update or create the faculty details
        if ($validatedData['role'] === 'faculty') {
            $user->faculty()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'faculty_type' => $validatedData['faculty_type'],
                    'faculty_units' => $validatedData['faculty_units'],
                ]
            );

            // Send webhook to HRIS about faculty update
            $facultyData = [
                'faculty_code' => $user->code,
                'first_name' => $validatedData['first_name'],
                'middle_name' => $validatedData['middle_name'],
                'last_name' => $validatedData['last_name'],
                'name_extension' => $validatedData['suffix_name'],
                'email' => $validatedData['email'],
                'status' => $validatedData['status'],
                'faculty_type' => $validatedData['faculty_type'],
            ];

            $this->webhookController->sendFacultyWebhook('faculty.updated', $facultyData);
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

    /**
     * DELETE a faculty user account
     */
    /*
    public function destroy(User $user)
    {
    if ($user->faculty) {
    $user->faculty->delete();
    }
    $user->delete();

    return response()->json(null, 204);
    }
     */

    /**
     * =================================
     * Admin Account Management
     * =================================
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
