<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseAssignment;
use App\Models\CourseRequirement;
use App\Models\CurriculaProgram;
use App\Models\Curriculum;
use App\Models\Program;
use App\Models\Semester;
use App\Models\YearLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        // Check if there are any active programs
        $activeProgramsCount = DB::table('programs')->where('status', 'Active')->count();

        if ($activeProgramsCount === 0) {
            return response()->json([
                'status' => 'success',
                'message' => 'No programs found. The curriculum cannot be created without active programs.',
            ]);
        }

        DB::transaction(function () use ($request) {
            // Step 1: Create the new curriculum
            $curriculum = Curriculum::create([
                'curriculum_year' => $request->curriculum_year,
                'status' => 'Active',
            ]);

            // Step 2: Get all Active programs
            $programs = DB::table('programs')->where('status', 'Active')->get();

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
            'message' => 'Curriculum and associated programs, year levels, and semesters created successfully.',
        ]);
    }

    public function deleteCurriculum(Request $request)
    {
        $request->validate([
            'curriculum_year' => 'required|integer|exists:curricula,curriculum_year',
        ], [
            'curriculum_year.exists' => 'No curriculum found for the given year.',
        ]);

        $curriculum = Curriculum::where('curriculum_year', $request->curriculum_year)->firstOrFail();
        $isUsedInAcademicYear = DB::table('academic_year_curricula')
            ->where('curriculum_id', $curriculum->curriculum_id)
            ->exists();

        if ($isUsedInAcademicYear) {
            return response()->json([
                'status' => 'fail',
                'message' => "Curriculum {$request->curriculum_year} is currently used in an academic year and cannot be deleted.",
            ]); // Note: We're returning a 200 OK status here
        }

        DB::transaction(function () use ($request, $curriculum) {
            // Delete related records...
            $curriculum->delete();
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Curriculum and all associated programs, year levels, and semesters deleted successfully.',
        ]);
    }

    public function copyCurriculum(Request $request)
    {
        // Validate the request
        $request->validate([
            'curriculum_id' => 'required|exists:curricula,curriculum_id',
            'new_curriculum_year' => 'required|integer|unique:curricula,curriculum_year',
        ], [
            'new_curriculum_year.unique' => 'A curriculum for this year already exists.',
        ]);

        $newCurriculum = DB::transaction(function () use ($request) {
            // Step 1: Get the original curriculum
            $originalCurriculum = Curriculum::with('curriculaPrograms.yearLevels.semesters.courseAssignments.course')
                ->findOrFail($request->curriculum_id);

            // Step 2: Create the new curriculum
            $newCurriculum = Curriculum::create([
                'curriculum_year' => $request->new_curriculum_year,
                'status' => 'Active',
            ]);

            // Step 3: Copy each program associated with the original curriculum
            foreach ($originalCurriculum->curriculaPrograms as $originalCurriculaProgram) {
                $newCurriculaProgram = CurriculaProgram::create([
                    'curriculum_id' => $newCurriculum->curriculum_id,
                    'program_id' => $originalCurriculaProgram->program_id,
                ]);

                // Step 4: Copy each year level associated with the original program
                foreach ($originalCurriculaProgram->yearLevels as $originalYearLevel) {
                    $newYearLevel = YearLevel::create([
                        'curricula_program_id' => $newCurriculaProgram->curricula_program_id,
                        'year' => $originalYearLevel->year,
                    ]);

                    // Step 5: Copy each semester associated with the original year level
                    foreach ($originalYearLevel->semesters as $originalSemester) {
                        $newSemester = Semester::create([
                            'year_level_id' => $newYearLevel->year_level_id,
                            'semester' => $originalSemester->semester,
                        ]);

                        // Step 6: Copy each course assignment associated with the original semester
                        foreach ($originalSemester->courseAssignments as $originalCourseAssignment) {
                            // Create a new course based on the original course
                            $newCourse = Course::create([
                                'course_code' => $originalCourseAssignment->course->course_code,
                                'course_title' => $originalCourseAssignment->course->course_title,
                                'lec_hours' => $originalCourseAssignment->course->lec_hours,
                                'lab_hours' => $originalCourseAssignment->course->lab_hours,
                                'units' => $originalCourseAssignment->course->units,
                                'tuition_hours' => $originalCourseAssignment->course->tuition_hours,
                            ]);

                            // Create a new course assignment with the new course_id
                            $newCourseAssignment = CourseAssignment::create([
                                'curricula_program_id' => $newCurriculaProgram->curricula_program_id,
                                'semester_id' => $newSemester->semester_id,
                                'course_id' => $newCourse->course_id,
                            ]);

                            // Step 7: Copy the course requirements (pre-requisites and co-requisites)
                            $originalCourseRequirements = CourseRequirement::where('course_id', $originalCourseAssignment->course_id)->get();
                            foreach ($originalCourseRequirements as $originalRequirement) {
                                // Create new course requirement for the new course
                                CourseRequirement::create([
                                    'course_id' => $newCourse->course_id,
                                    'requirement_type' => $originalRequirement->requirement_type, // pre or co
                                    'required_course_id' => $originalRequirement->required_course_id,
                                ]);
                            }
                        }
                    }
                }
            }

            return $newCurriculum;
        });
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
            'status' => 'required|in:Active,Inactive',
        ]);

        $existingCurriculum = Curriculum::where('curriculum_year', $validatedData['curriculum_year'])->first();

        if ($existingCurriculum) {
            return response()->json([
                'message' => 'Curriculum for this year already exists',
                'curriculum' => $existingCurriculum,
            ], 409);
        }

        // Create a new curriculum if it doesn't exist
        $curriculum = Curriculum::create($validatedData);

        return response()->json([
            'message' => 'Curriculum created successfully',
            'curriculum' => $curriculum,
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
            'status' => 'required|in:Active,Inactive',
        ]);

        $curriculum->update($validatedData);

        return response()->json([
            'message' => 'Curriculum updated successfully',
            'curriculum' => $curriculum,
        ], 200);
    }

    // Delete a curriculum
    public function destroy($id)
    {
        $curriculum = Curriculum::findOrFail($id);
        $curriculum->delete();

        return response()->json([
            'message' => 'Curriculum deleted successfully',
        ], 200);
    }

    //For Manage Program (curriculum year):
    public function removeProgramFromCurriculum(Request $request)
    {
        $request->validate([
            'curriculum_year' => 'required|string|exists:curricula,curriculum_year',
            'program_id' => 'required|integer|exists:programs,program_id',
        ]);

        DB::transaction(function () use ($request) {
            $curriculum = Curriculum::where('curriculum_year', $request->curriculum_year)->firstOrFail();

            CurriculaProgram::where('curriculum_id', $curriculum->curriculum_id)
                ->where('program_id', $request->program_id)
                ->delete();
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Program removed from curriculum successfully.',
        ]);
    }

    public function getProgramsByCurriculumYear($curriculumYear)
    {
        // Find the curriculum by the provided year
        $curriculum = Curriculum::where('curriculum_year', $curriculumYear)->firstOrFail();

        // Fetch the programs associated with this curriculum
        $programs = $curriculum->programs()->get();

        return response()->json($programs);
    }

    public function addProgramToCurriculum(Request $request)
    {
        $request->validate([
            'curriculum_year' => 'required|string|exists:curricula,curriculum_year',
            'program_id' => 'required|integer|exists:programs,program_id',
        ]);

        $newCurriculaProgram = DB::transaction(function () use ($request) {
            $curriculum = Curriculum::where('curriculum_year', $request->curriculum_year)->firstOrFail();

            // Check if the program is already associated
            $exists = CurriculaProgram::where('curriculum_id', $curriculum->curriculum_id)
                ->where('program_id', $request->program_id)
                ->exists();

            if (!$exists) {
                $curriculaProgram = CurriculaProgram::create([
                    'curriculum_id' => $curriculum->curriculum_id,
                    'program_id' => $request->program_id,
                ]);

                // Generate year levels and semesters based on the program's number of years
                $program = Program::find($request->program_id);

                // Loop through each year level and create semesters for each one
                for ($year = 1; $year <= $program->number_of_years; $year++) {
                    $yearLevel = YearLevel::create([
                        'curricula_program_id' => $curriculaProgram->curricula_program_id,
                        'year' => $year,
                    ]);

                    // Generate semesters for each year level (assuming two semesters per year)
                    for ($semester = 1; $semester <= 3; $semester++) {
                        Semester::create([
                            'year_level_id' => $yearLevel->year_level_id,
                            'semester' => $semester,
                        ]);
                    }
                }

                return $curriculaProgram;
            }

            return null;
        });

        if ($newCurriculaProgram) {
            // Fetch the entire curricula program with its year levels, semesters, and courses
            $curriculaProgramWithDetails = CurriculaProgram::with(['yearLevels.semesters.courses.prerequisites', 'yearLevels.semesters.courses.corequisites'])
                ->where('curricula_program_id', $newCurriculaProgram->curricula_program_id)
                ->first();

            return response()->json([
                'status' => 'success',
                'message' => 'Program added to curriculum successfully.',
                'data' => $curriculaProgramWithDetails,
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Program is already associated with this curriculum year.',
        ], 400);
    }

}
