<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faculty;

class SchedulingController extends Controller
{
    public function getFacultyDetails()
    {

        $facultyDetails = Faculty::with('user')->get();

        $response = $facultyDetails->map(function ($faculty) {
            return [
                'user_id' => $faculty->user->id ?? 'N/A',
                'name' => $faculty->user->name ?? 'N/A',
                'code' => $faculty->user->code ?? 'N/A',
                'email' => $faculty->faculty_email ?? 'N/A',
                'role' => $faculty->user->role ?? 'N/A',
                'faculty_type' => $faculty->faculty_type ?? 'N/A',
                'faculty_units' => $faculty->faculty_unit ?? 'N/A',
            ];
        });

        return response()->json(['faculty' => $response], 200);
    }


}

