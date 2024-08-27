<?php
namespace App\Http\Controllers;

use App\Models\Curriculum;
use App\Models\CurriculaProgram;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CurriculumDetailsController extends Controller
{
    public function getCurriculumDetails($curriculumYear)
    {
        // Retrieve the curriculum with the specified year
        $curriculum = Curriculum::where('curriculum_year', $curriculumYear)
            ->where('status', 'active')
            ->firstOrFail();

        Log::info("Retrieved Curriculum: ", ['curriculum' => $curriculum]);

        // Get all CurriculaPrograms for this curriculum
        $curriculaPrograms = CurriculaProgram::where('curriculum_id', $curriculum->curriculum_id)
            ->with([
                'program',
                'yearLevels.semesters.courses.requirements.requiredCourse'
            ])
            ->get();

        Log::info("Curricula Programs Retrieved: ", ['curriculaPrograms' => $curriculaPrograms]);

        if ($curriculaPrograms->isEmpty()) {
            Log::warning("No Curricula Programs found for curriculum_id: {$curriculum->curriculum_id}");
        }

        // Format the data as needed
        $result = [
            'curriculum_year' => $curriculum->curriculum_year,
            'status' => ucfirst($curriculum->status),
            'programs' => $curriculaPrograms->map(function($curriculaProgram) {
                $program = $curriculaProgram->program;
                Log::info("Processing Program: ", ['program' => $program]);

                return [
                    'name' => $program->program_code,
                    'number_of_years' => $program->number_of_years,
                    'year_levels' => $curriculaProgram->yearLevels->map(function($yearLevel) {
                        Log::info("Processing Year Level: ", ['yearLevel' => $yearLevel]);

                        return [
                            'year' => $yearLevel->year,
                            'semesters' => $yearLevel->semesters->map(function($semester) {
                                // Log debugging information
                                Log::info("Fetching courses for semester_id: {$semester->semester_id}");
                                Log::info("Number of courses found: " . $semester->courses->count());

                                return [
                                    'semester' => $semester->semester,
                                    'courses' => $semester->courses->map(function($course) {
                                        $prereqs = $course->requirements->where('requirement_type', 'pre');
                                        $coreqs = $course->requirements->where('requirement_type', 'co');
                                        
                                        return [
                                            'course_code' => $course->course_code,
                                            'course_title' => $course->course_title,
                                            'lec_hours' => $course->lec_hours,
                                            'lab_hours' => $course->lab_hours,
                                            'units' => $course->units,
                                            'tuition_hours' => $course->tuition_hours,
                                            'prerequisites' => $prereqs->map(function($prereq) {
                                                return $prereq->requiredCourse ? [
                                                    'course_code' => $prereq->requiredCourse->course_code,
                                                    'course_title' => $prereq->requiredCourse->course_title,
                                                ] : [];
                                            })->filter()->values(),
                                            'corequisites' => $coreqs->map(function($coreq) {
                                                return $coreq->requiredCourse ? [
                                                    'course_code' => $coreq->requiredCourse->course_code,
                                                    'course_title' => $coreq->requiredCourse->course_title,
                                                ] : [];
                                            })->filter()->values(),
                                        ];
                                    }),
                                ];
                            }),
                        ];
                    }),
                ];
            }),
        ];

        Log::info("Final Result: ", ['result' => $result]);

        return response()->json($result);
    }
}
