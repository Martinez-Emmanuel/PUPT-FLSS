<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Program;

class ProgramController extends Controller
{
    // List all programs
    public function index()
    {
        $programs = Program::with('curriculum', 'yearLevels')->get(); 
        return response()->json($programs);
    }

    // Create a new program
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'curriculum_id' => 'nullable|integer|exists:curricula,curriculum_id',
            'program_code' => 'required|string|max:10|unique:programs',
            'program_title' => 'required|string|max:100',
            'program_info' => 'required|string|max:255',
            'status' => 'required|in:active,inactive',
            'number_of_years' => 'required|integer|min:1',
        ]);

        $program = Program::create($validatedData);

        return response()->json([
            'message' => 'Program created successfully',
            'program' => $program
        ], 201);
    }

    // Show a specific program
    public function show($id)
    {
        $program = Program::with('curriculum', 'yearLevels')->findOrFail($id);
        return response()->json($program);
    }

    // Update a program
    public function update(Request $request, $id)
    {
        $program = Program::findOrFail($id);

        $validatedData = $request->validate([
            'curriculum_id' => 'nullable|integer|exists:curricula,curriculum_id',
            'program_code' => 'required|string|max:10|unique:programs,program_code,' . $program->program_id . ',program_id',
            'program_title' => 'required|string|max:100',
            'program_info' => 'required|string|max:255',
            'status' => 'required|in:active,inactive',
            'number_of_years' => 'required|integer|min:1',
        ]);

        $program->update($validatedData);

        return response()->json([
            'message' => 'Program updated successfully',
            'program' => $program
        ], 200);
    }

    // Delete a program
    public function destroy($id)
    {
        $program = Program::findOrFail($id);
        $program->delete();

        return response()->json([
            'message' => 'Program deleted successfully'
        ], 200);
    }
}
