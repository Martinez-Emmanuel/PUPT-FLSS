<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::all();
        return response()->json($courses);
    }
    public function addCourse(Request $request)
    {
        $validatedData = $request->validate([
            'subject_code' => 'required|string|unique:courses',
            'subject_title' => 'required|string',
            'lec_hours' => 'required|integer',
            'lab_hours' => 'required|integer',
            'total_units' => 'required|integer',
        ]);

        $course = Course::create($validatedData);

        return response()->json([
            'message' => 'Course added successfully',
            'course' => $course
        ], 201);
    }
}
