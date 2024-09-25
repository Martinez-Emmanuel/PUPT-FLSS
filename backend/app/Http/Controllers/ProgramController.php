<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Program;
use App\Models\Curriculum;

class ProgramController extends Controller
{
    public function index()
    {
        $programs = Program::with(['curricula', 'yearLevels'])->get();
    
        $formattedPrograms = $programs->map(function ($program) {
            // Sort curricula by curriculum_year in ascending order
            $sortedCurricula = $program->curricula->sortBy('curriculum_year');
    
            // Sort year levels by year in ascending order
            $sortedYearLevels = $program->yearLevels->sortBy('year');
    
            // Get the curriculum years as an array
            $curriculumYears = $sortedCurricula->pluck('curriculum_year')->toArray();
    
            // Format the program data including curricula_version
            return [
                'program_id' => $program->program_id,
                'program_code' => $program->program_code,
                'program_title' => $program->program_title,
                'program_info' => $program->program_info,
                'number_of_years' => $program->number_of_years,
                'curricula_version' => implode(', ', $curriculumYears), // Comma-separated list of curriculum years
                'status' => $program->status,
                'created_at' => $program->created_at,
                'updated_at' => $program->updated_at,
                'curricula' => $sortedCurricula->values()->all(), // Return the sorted curricula
                'year_levels' => $sortedYearLevels->values()->all() // Return the sorted year levels
            ];
        });
    
        return response()->json($formattedPrograms);
    }
    

    public function store(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'program_code' => 'required|string|max:10',
            'program_title' => 'required|string|max:100',
            'program_info' => 'required|string|max:255',
            'status' => 'required|in:active,inactive',
            'number_of_years' => 'required|integer|min:1',
        ]);

        // Check for uniqueness of the program_title and program_info combination within the same program_code
        $existingProgram = Program::where('program_code', $validatedData['program_code'])
            ->where('program_title', $validatedData['program_title'])
            ->where('program_info', $validatedData['program_info'])
            ->first();

        if ($existingProgram) {
            return response()->json([
                'message' => 'A program with the same code, title, and info already exists.'
            ], 422);
        }

        // Create the new program
        $program = Program::create($validatedData);

        return response()->json([
            'message' => 'Program created successfully',
            'program' => $program
        ], 201);
    }


    // Show a specific program
    public function show($id)
    {
        $program = Program::with('curricula', 'yearLevels')->findOrFail($id);
        return response()->json($program);
    }
    // Update a program
    public function update(Request $request, $id)
    {
        // Find the program by its ID or fail
        $program = Program::findOrFail($id);

        // Validate the incoming request data
        $validatedData = $request->validate([
            'program_code' => 'required|string|max:10|unique:programs,program_code,' . $program->program_id . ',program_id',
            'program_title' => 'required|string|max:100',
            'program_info' => 'required|string|max:255',
            'status' => 'required|in:active,inactive',
            'number_of_years' => 'required|integer|min:1',
        ]);

        // Update the program with the validated data
        $program->update($validatedData);

        // Return a success response
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


    public function getProgramsByCurriculumYear($curriculumYear)
    {
        // Fetch the curriculum by year
        $curriculum = Curriculum::where('curriculum_year', $curriculumYear)->firstOrFail();

        // Fetch programs associated with this curriculum
        $programs = $curriculum->programs;

        return response()->json($programs);
    }


}