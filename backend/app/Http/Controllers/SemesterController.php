<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Semester;

class SemesterController extends Controller
{
    // List all semesters
    public function index()
    {
        $semesters = Semester::with('yearLevel')->get(); 
        return response()->json($semesters);
    }

    // Create a new semester
    public function store(Request $request)
    {
        // Fetch the latest semester_id
        $latestSemesterId = Semester::max('semester_id');

        // Validate the incoming request data
        $validatedData = $request->validate([
            'year_level_id' => 'required|integer|exists:year_levels,year_level_id',
            'semester' => 'required|integer|unique:semesters,semester,NULL,semester_id,year_level_id,' . $request->year_level_id,
        ]);

        // Create a new semester
        $semester = Semester::create($validatedData);

        return response()->json([
            'message' => 'Semester created successfully',
            'latest_semester_id' => $latestSemesterId,
            'semester' => $semester
        ], 201);
    }

    // Show a specific semester
    public function show($id)
    {
        $semester = Semester::with('yearLevel')->findOrFail($id);
        return response()->json($semester);
    }

    // Update a semester
    public function update(Request $request, $id)
    {
        $semester = Semester::findOrFail($id);

        $validatedData = $request->validate([
            'year_level_id' => 'required|integer|exists:year_levels,year_level_id',
            'semester' => 'required|integer|unique:semesters,semester,' . $id . ',semester_id,year_level_id,' . $request->year_level_id,
        ]);

        $semester->update($validatedData);

        return response()->json([
            'message' => 'Semester updated successfully',
            'semester' => $semester
        ], 200);
    }

    // Delete a semester
    public function destroy($id)
    {
        $semester = Semester::findOrFail($id);
        $semester->delete();

        return response()->json([
            'message' => 'Semester deleted successfully'
        ], 200);
    }
}
