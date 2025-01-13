<?php

namespace App\Http\Controllers;

use App\Http\Controllers\WebhookController;
use App\Models\Faculty;
use App\Models\User;
use Illuminate\Http\Request;

class FacultyController extends Controller
{
    protected $webhookController;

    public function __construct(WebhookController $webhookController)
    {
        $this->webhookController = $webhookController;
    }

    /**
     * GET all faculty users
     */
    public function index()
    {
        $users = User::with('faculty')->where('role', 'faculty')->get();
        return response()->json($users);
    }

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
            'faculty_type_id' => 'required|exists:faculty_type,faculty_type_id',
            'password' => 'required|string',
        ]);

        $user = User::create([
            'first_name' => $validatedData['first_name'],
            'middle_name' => $validatedData['middle_name'],
            'last_name' => $validatedData['last_name'],
            'suffix_name' => $validatedData['suffix_name'],
            'code' => $validatedData['code'],
            'email' => $validatedData['email'],
            'role' => 'faculty',
            'status' => $validatedData['status'],
            'password' => $validatedData['password'],
        ]);

        $faculty = $user->faculty()->create([
            'faculty_type_id' => $validatedData['faculty_type_id'],
        ]);

        $facultyType = $faculty->facultyType;

        // Send webhook to HRIS about new faculty
        $facultyData = [
            'faculty_code' => $validatedData['code'],
            'first_name' => $validatedData['first_name'],
            'middle_name' => $validatedData['middle_name'],
            'last_name' => $validatedData['last_name'],
            'name_extension' => $validatedData['suffix_name'],
            'email' => $validatedData['email'],
            'status' => $validatedData['status'],
            'faculty_type' => $facultyType->faculty_type,
        ];

        $this->webhookController->sendFacultyWebhook('faculty.created', $facultyData);

        return response()->json($user->load('faculty.facultyType'), 201);
    }

    /**
     * UPDATE existing faculty account and faculty details
     */
    public function update(Request $request, User $user)
    {
        if ($user->role !== 'faculty') {
            return response()->json(['message' => 'User is not a faculty member'], 400);
        }

        $validatedData = $request->validate([
            'first_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'last_name' => 'required|string',
            'suffix_name' => 'nullable|string',
            'email' => 'required|email',
            'status' => 'required|string',
            'faculty_type_id' => 'required|exists:faculty_type,faculty_type_id',
            'password' => 'nullable|string',
        ]);

        $user->update([
            'first_name' => $validatedData['first_name'],
            'middle_name' => $validatedData['middle_name'],
            'last_name' => $validatedData['last_name'],
            'suffix_name' => $validatedData['suffix_name'],
            'email' => $validatedData['email'],
            'status' => $validatedData['status'],
        ]);

        $user->faculty()->updateOrCreate(
            ['user_id' => $user->id],
            ['faculty_type_id' => $validatedData['faculty_type_id']]
        );

        // Get faculty type details for webhook
        $facultyType = $user->faculty->facultyType;

        // Send webhook to HRIS about faculty update
        $facultyData = [
            'faculty_code' => $user->code,
            'first_name' => $validatedData['first_name'],
            'middle_name' => $validatedData['middle_name'],
            'last_name' => $validatedData['last_name'],
            'name_extension' => $validatedData['suffix_name'],
            'email' => $validatedData['email'],
            'status' => $validatedData['status'],
            'faculty_type' => $facultyType->faculty_type,
        ];

        $this->webhookController->sendFacultyWebhook('faculty.updated', $facultyData);

        // If a password is provided, update it
        if (isset($validatedData['password'])) {
            $user->update(['password' => $validatedData['password']]);
        }

        return response()->json($user->load('faculty.facultyType'));
    }

    /**
     * DELETE a faculty user account
     */
    public function destroy(User $user)
    {
        if ($user->role !== 'faculty') {
            return response()->json(['message' => 'User is not a faculty member'], 400);
        }

        if ($user->faculty) {
            $user->faculty->delete();
        }
        $user->delete();

        return response()->json(null, 204);
    }

    /**
     * Retrieve detailed information for active faculty members.
     */
    public function getFacultyDetails()
    {
        $facultyDetails = Faculty::whereHas('user', function ($query) {
            $query->where('status', 'Active');
        })
            ->with(['user', 'facultyType'])
            ->get();

        $response = $facultyDetails->map(function ($faculty) {
            return [
                'faculty_id' => $faculty->id,
                'name' => $faculty->user->formatted_name ?? 'N/A',
                'code' => $faculty->user->code ?? 'N/A',
                'faculty_email' => $faculty->user->email ?? 'N/A',
                'faculty_type' => $faculty->facultyType->faculty_type ?? 'N/A',
                'faculty_units' => $faculty->faculty_units,
            ];
        })
            ->sortBy('name')
            ->values();

        return response()->json(['faculty' => $response], 200);
    }

}
