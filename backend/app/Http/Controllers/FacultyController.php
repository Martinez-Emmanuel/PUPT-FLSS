<?php

namespace App\Http\Controllers;

use App\Models\Faculty;

use Illuminate\Http\Request;

class FacultyController extends Controller
{
    public function getFaculty()
    {
        return response()->json(Faculty::all(), 200);
    }
}
