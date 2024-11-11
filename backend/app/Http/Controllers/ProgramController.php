<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Program;
use App\Models\Curriculum;
use App\Models\ProgramYearLevelCurricula;

class ProgramController extends Controller
{
    public function getPrograms()
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
    

    public function addProgram(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'program_code' => 'required|string|max:10',
            'program_title' => 'required|string|max:100',
            'program_info' => 'required|string|max:255',
            'status' => 'required|in:Active,Inactive',
            'number_of_years' => 'required|integer|min:1',
        ]);
    
        // Check for uniqueness
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
    
        // Refetch the program with relationships
        $program = Program::with(['curricula', 'yearLevels'])->find($program->program_id);
    
        return response()->json($program, 201);
    }


    public function getProgramDetails($id)
    {
        $program = Program::with('curricula', 'yearLevels')->findOrFail($id);
        return response()->json($program);
    }


    public function updateProgram(Request $request, $id)
    {
        $program = Program::findOrFail($id);
    
        $validatedData = $request->validate([
            'program_code' => 'required|string|max:10|unique:programs,program_code,' . $program->program_id . ',program_id',
            'program_title' => 'required|string|max:100',
            'program_info' => 'required|string|max:255',
            'status' => 'required|in:Active,Inactive',
            'number_of_years' => 'required|integer|min:1',
        ]);
    
        $program->update($validatedData);
    
        $program = Program::with(['curricula', 'yearLevels'])->find($program->program_id);
    
        return response()->json($program, 200);
    } 


    public function deleteProgram($id)
    {
        // Check if the program is associated with any academic year
        $isUsedInAcademicYear = ProgramYearLevelCurricula::where('program_id', $id)->exists();
    
        if ($isUsedInAcademicYear) {
            return response()->json([
                'message' => 'Cannot delete the program associated with an academic year.',
                'success' => false
            ], 200);
        }
    
        // Proceed to delete the program
        $program = Program::findOrFail($id);
        $program->delete();
    
        return response()->json([
            'message' => 'Program deleted successfully.',
            'success' => true
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