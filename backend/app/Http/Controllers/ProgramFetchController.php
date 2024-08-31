<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\YearLevel;
use App\Models\Semester;
use Illuminate\Http\Request;

class ProgramFetchController extends Controller
{
    public function getCoursesForProgram(Request $request)
    {
        $programId = $request->input('program_id');
        $yearLevel = $request->input('year_level');
        $semesterNumber = $request->input('semester');

        if (!$programId) {
            return response()->json(['error' => 'Program ID is required'], 400);
        }

        // Fetch all active curricula_program records for the given program_id
        $curriculaPrograms = \DB::table('curricula_program')
            ->join('curricula', 'curricula_program.curriculum_id', '=', 'curricula.curriculum_id')
            ->where('curricula_program.program_id', $programId)
            ->where('curricula.status', 'active')
            ->get();

        if ($curriculaPrograms->isEmpty()) {
            return response()->json(['error' => 'No active curricula found for the given program'], 404);
        }

        $coursesCollection = collect();

        foreach ($curriculaPrograms as $curriculaProgram) {
            // Get all year levels associated with the curricula_program_id
            $yearLevelsQuery = YearLevel::where('curricula_program_id', $curriculaProgram->curricula_program_id)
                ->with(['semesters.courses.assignments', 'semesters.courses.requirements.requiredCourse']);

            // Apply year level filter if provided
            if ($yearLevel) {
                $yearLevelsQuery->where('year', $yearLevel);
            }

            $yearLevels = $yearLevelsQuery->get();

            foreach ($yearLevels as $yearLevelData) {
                $semestersQuery = $yearLevelData->semesters();

                // Apply semester filter if provided
                if ($semesterNumber) {
                    $semestersQuery->where('semester', $semesterNumber);
                }

                $semesters = $semestersQuery->with('courses.assignments')->get();

                foreach ($semesters as $semester) {
                    foreach ($semester->courses as $course) {
                        $prerequisites = $course->requirements->where('requirement_type', 'pre')->map(function ($req) {
                            return [
                                'course_code' => $req->requiredCourse->course_code,
                                'course_title' => $req->requiredCourse->course_title,
                            ];
                        });

                        $corequisites = $course->requirements->where('requirement_type', 'co')->map(function ($req) {
                            return [
                                'course_code' => $req->requiredCourse->course_code,
                                'course_title' => $req->requiredCourse->course_title,
                            ];
                        });

                        $coursesCollection->push([
                            'year_level_id' => $yearLevelData->year_level_id,
                            'year' => $yearLevelData->year,
                            'semester_id' => $semester->semester_id,
                            'semester' => $semester->semester,
                            'course_assignment_id' => $course->assignments->first()->course_assignment_id ?? null,
                            'curricula_program_id' => $course->assignments->first()->curricula_program_id ?? null,
                            'course_id' => $course->course_id,
                            'course_code' => $course->course_code,
                            'course_title' => $course->course_title,
                            'lec_hours' => $course->lec_hours,
                            'lab_hours' => $course->lab_hours,
                            'units' => $course->units,
                            'tuition_hours' => $course->tuition_hours,
                            'prerequisites' => $prerequisites->toArray(),
                            'corequisites' => $corequisites->toArray(),
                        ]);
                    }
                }
            }
        }

        // Get the program data to include in the response
        $program = \DB::table('programs')->where('program_id', $programId)->first();

        if (!$program) {
            return response()->json(['error' => 'Program not found'], 404);
        }

        // Construct the response structure
        $response = [
            'program' => [
                'name' => $program->program_code,  // Fetching the correct program code
                'number_of_years' => $program->number_of_years,  // Fetching the number of years (assuming this field exists)
                'courses' => $coursesCollection,
            ]
        ];

        return response()->json($response);
    }


    public function getAllActivePrograms()
    {
        // Fetch all active programs
        $activePrograms = \DB::table('programs')
            ->where('status', 'active')
            ->distinct() // Ensure only distinct programs are fetched
            ->get(['program_code', 'program_title', 'number_of_years', 'program_id']);

        if ($activePrograms->isEmpty()) {
            return response()->json(['error' => 'No active programs found'], 404);
        }

        $programsCollection = collect();

        foreach ($activePrograms as $program) {
            // Fetch all active curricula_program records for the given program_id
            $curriculaPrograms = \DB::table('curricula_program')
                ->join('curricula', 'curricula_program.curriculum_id', '=', 'curricula.curriculum_id')
                ->where('curricula_program.program_id', $program->program_id)
                ->where('curricula.status', 'active')
                ->get();

            $coursesCollection = collect();

            foreach ($curriculaPrograms as $curriculaProgram) {
                // Get all year levels associated with the curricula_program_id
                $yearLevels = YearLevel::where('curricula_program_id', $curriculaProgram->curricula_program_id)
                    ->with(['semesters.courses.assignments', 'semesters.courses.requirements.requiredCourse'])
                    ->get();

                foreach ($yearLevels as $yearLevelData) {
                    $semesters = $yearLevelData->semesters;

                    foreach ($semesters as $semester) {
                        foreach ($semester->courses as $course) {
                            $prerequisites = $course->requirements->where('requirement_type', 'pre')->map(function ($req) {
                                return [
                                    'course_code' => $req->requiredCourse->course_code,
                                    'course_title' => $req->requiredCourse->course_title,
                                ];
                            });

                            $corequisites = $course->requirements->where('requirement_type', 'co')->map(function ($req) {
                                return [
                                    'course_code' => $req->requiredCourse->course_code,
                                    'course_title' => $req->requiredCourse->course_title,
                                ];
                            });

                            $coursesCollection->push([
                                'year_level_id' => $yearLevelData->year_level_id,
                                'year' => $yearLevelData->year,
                                'semester_id' => $semester->semester_id,
                                'semester' => $semester->semester,
                                'course_assignment_id' => $course->assignments->first()->course_assignment_id ?? null,
                                'curricula_program_id' => $course->assignments->first()->curricula_program_id ?? null,
                                'course_id' => $course->course_id,
                                'course_code' => $course->course_code,
                                'course_title' => $course->course_title,
                                'lec_hours' => $course->lec_hours,
                                'lab_hours' => $course->lab_hours,
                                'units' => $course->units,
                                'tuition_hours' => $course->tuition_hours,
                                'prerequisites' => $prerequisites->toArray(),
                                'corequisites' => $corequisites->toArray(),
                            ]);
                        }
                    }
                }
            }

            // Add program data to the collection
            $programsCollection->push([
                'program_code' => $program->program_code,
                'program_title' => $program->program_title,
                'number_of_years' => $program->number_of_years,
                'courses' => $coursesCollection->unique('course_id'), // Ensure courses are unique
            ]);
        }

        // Construct the response structure
        return response()->json([
            'programs' => $programsCollection,
        ], 200);
    }

}
