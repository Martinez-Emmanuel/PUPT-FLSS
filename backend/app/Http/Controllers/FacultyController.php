<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use Illuminate\Http\Request;

class FacultyController extends Controller
{
    /**
     * Get all faculties.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFaculty()
    {
        $faculties = Faculty::all();
        return response()->json($faculties);
    }
}
