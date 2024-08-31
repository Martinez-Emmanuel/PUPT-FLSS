<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Curriculum;
use App\Models\CurriculaProgram;
use App\Models\CourseAssignment;
use Illuminate\Support\Facades\DB;
use App\Models\YearLevel;
use App\Models\Semester;
use App\Models\CourseRequirement;
use App\Models\Course;
use App\Models\Program;
class CurriculumController extends Controller
{

    public function addCurriculum(Request $request)
    {
        // Validate the request
        $request->validate([
            'curriculum_year' => 'required|integer|unique:curricula,curriculum_year',
        ], [
            'curriculum_year.unique' => 'A curriculum for this year already exists.',
        ]);
    
        DB::transaction(function () use ($request) {
            // Step 1: Create the new curriculum
            $curriculum = Curriculum::create([
                'curriculum_year' => $request->curriculum_year,
                'status' => 'active',
            ]);
    
            // Step 2: Get all active programs
            $programs = DB::table('programs')->where('status', 'active')->get();
    
            // Step 3: Create curricula_program entries for each program
            foreach ($programs as $program) {
                $curriculaProgram = CurriculaProgram::create([
                    'curriculum_id' => $curriculum->curriculum_id,
                    'program_id' => $program->program_id,
                ]);
    
                // Step 4: Generate year levels for each program
                for ($year = 1; $year <= $program->number_of_years; $year++) {
                    $yearLevel = YearLevel::create([
                        'curricula_program_id' => $curriculaProgram->curricula_program_id,
                        'year' => $year,
                    ]);
    
                    // Step 5: Generate semesters for each year level
                    for ($semester = 1; $semester <= 3; $semester++) {
                        Semester::create([
                            'year_level_id' => $yearLevel->year_level_id,
                            'semester' => $semester,
                        ]);
                    }
                }
            }
        });
    
        return response()->json([
            'status' => 'success',
            'message' => 'Curriculum and associated programs, year levels, and semesters created successfully.'
        ]);
    }


    public function deleteCurriculum(Request $request)
    {
        // Validate the request
        $request->validate([
            'curriculum_year' => 'required|integer|exists:curricula,curriculum_year',
        ], [
            'curriculum_year.exists' => 'No curriculum found for the given year.',
        ]);

        DB::transaction(function () use ($request) {
            // Step 1: Find the curriculum by year
            $curriculum = Curriculum::where('curriculum_year', $request->curriculum_year)->firstOrFail();

            // Step 2: Delete related records
            // Get all related curricula programs
            $curriculaPrograms = CurriculaProgram::where('curriculum_id', $curriculum->curriculum_id)->get();

            foreach ($curriculaPrograms as $curriculaProgram) {
                // Delete related year levels and semesters
                $yearLevels = YearLevel::where('curricula_program_id', $curriculaProgram->curricula_program_id)->get();
                
                foreach ($yearLevels as $yearLevel) {
                    Semester::where('year_level_id', $yearLevel->year_level_id)->delete();
                    $yearLevel->delete();
                }

                // Delete the curricula program
                $curriculaProgram->delete();
            }

            // Step 3: Delete the curriculum itself
            $curriculum->delete();
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Curriculum and all associated programs, year levels, and semesters deleted successfully.'
        ]);
    }
    
    // List all curricula
    public function index()
    {
        $curricula = Curriculum::all();
        return response()->json($curricula);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'curriculum_year' => 'required|string|size:4',
            'status' => 'required|in:active,inactive',
        ]);
    
        $existingCurriculum = Curriculum::where('curriculum_year', $validatedData['curriculum_year'])->first();
    
        if ($existingCurriculum) {
            return response()->json([
                'message' => 'Curriculum for this year already exists',
                'curriculum' => $existingCurriculum
            ], 409); 
        }
    
        // Create a new curriculum if it doesn't exist
        $curriculum = Curriculum::create($validatedData);
    
        return response()->json([
            'message' => 'Curriculum created successfully',
            'curriculum' => $curriculum
        ], 201);
    }
    
    // Show a specific curriculum
    public function show($id)
    {
        $curriculum = Curriculum::findOrFail($id);
        return response()->json($curriculum);
    }

    // Update a curriculum
    public function update(Request $request, $id)
    {
        $curriculum = Curriculum::findOrFail($id);

        $validatedData = $request->validate([
            'curriculum_year' => 'required|string|size:4',
            'status' => 'required|in:active,inactive',
        ]);

        $curriculum->update($validatedData);

        return response()->json([
            'message' => 'Curriculum updated successfully',
            'curriculum' => $curriculum
        ], 200);
    }

    // Delete a curriculum
    public function destroy($id)
    {
        $curriculum = Curriculum::findOrFail($id);
        $curriculum->delete();

        return response()->json([
            'message' => 'Curriculum deleted successfully'
        ], 200);
    }
}
