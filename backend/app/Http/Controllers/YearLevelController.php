<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\YearLevel;

class YearLevelController extends Controller
{
    // List all year levels
    public function index()
    {
        $yearLevels = YearLevel::with('semesters')->get(); 
        return response()->json($yearLevels);
    }

    // Create a new year level
    public function store(Request $request)
    {
        $latestYearLevelId = YearLevel::max('year_level_id');

        $validatedData = $request->validate([
            'year' => 'required|integer|unique:year_levels,year,NULL,year_level_id,program_id,' . $request->program_id,
            'program_id' => 'required|integer|exists:programs,program_id',
        ]);

        $yearLevel = YearLevel::create($validatedData);

        return response()->json([
            'message' => 'Year Level created successfully',
            'latest_year_level_id' => $latestYearLevelId,
            'year_level' => $yearLevel
        ], 201);
    }

    // Show a specific year level
    public function show($id)
    {
        $yearLevel = YearLevel::with('semesters')->findOrFail($id);
        return response()->json($yearLevel);
    }

    // Update a year level
    public function update(Request $request, $id)
    {
        $yearLevel = YearLevel::findOrFail($id);

        $validatedData = $request->validate([
            'year' => 'required|integer|unique:year_levels,year,' . $id . ',year_level_id,program_id,' . $request->program_id,
            'program_id' => 'required|integer|exists:programs,program_id',
        ]);

        $yearLevel->update($validatedData);

        return response()->json([
            'message' => 'Year Level updated successfully',
            'year_level' => $yearLevel
        ], 200);
    }

    // Delete a year level
    public function destroy($id)
    {
        $yearLevel = YearLevel::findOrFail($id);
        $yearLevel->delete();

        return response()->json([
            'message' => 'Year Level deleted successfully'
        ], 200);
    }
}
