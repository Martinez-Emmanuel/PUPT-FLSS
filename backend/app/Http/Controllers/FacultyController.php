<?php

namespace App\Http\Controllers;

use App\Models\Faculty;

class FacultyController extends Controller
{
    /**
     * Retrieve detailed information for active faculty members.
     */
    public function getFacultyDetails()
    {
        $facultyDetails = Faculty::whereHas('user', function ($query) {
            $query->where('status', 'Active');
        })->with('user')->get();

        $response = $facultyDetails->map(function ($faculty) {
            return [
                'faculty_id' => $faculty->id,
                'name' => $faculty->user->name ?? 'N/A',
                'code' => $faculty->user->code ?? 'N/A',
                'faculty_email' => $faculty->faculty_email ?? 'N/A',
                'faculty_type' => $faculty->faculty_type ?? 'N/A',
                'faculty_units' => $faculty->faculty_units ?? 'N/A',
            ];
        });

        return response()->json(['faculty' => $response], 200);
    }

}
