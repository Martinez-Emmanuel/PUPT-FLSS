<?php

namespace App\Http\Controllers;

use App\Models\Curriculum;
use Illuminate\Http\Request;

class CurriculumDetailsController extends Controller
{
    public function getCurriculumDetails($curriculumYear)
    {
        // Retrieve the curriculum with the specified year
        $curriculum = Curriculum::where('curriculum_year', $curriculumYear)
            ->where('status', 'active')
            ->firstOrFail();

        // Get all CurriculaPrograms for this curriculum
        $curriculaPrograms = $curriculum->programs()->with([
            'yearLevels.semesters.courses.assignments',
            'yearLevels.semesters.courses.requirements.requiredCourse'
        ])->get();

        // Debug to ensure all data is fetched
        // dd($curriculaPrograms);

        // Format the data as needed
        $result = [
            'curriculum_year' => $curriculum->curriculum_year,
            'status' => ucfirst($curriculum->status),
            'programs' => $curriculaPrograms->map(function($program) {
                return [
                    'name' => $program->program_code,
                    'number_of_years' => $program->number_of_years,
                    'year_levels' => $program->yearLevels->map(function($yearLevel) {
                        return [
                            'year_level_id' => $yearLevel->year,
                            'year' => $yearLevel->year,
                            'semesters' => $yearLevel->semesters->map(function($semester) {
                                return [
                                    'semester_id' => $semester->semester_id, 
                                    'semester' => $semester->semester,
                                    'courses' => $semester->courses->map(function($course) {
                                        // Get course assignments to extract all required IDs
                                        $assignment = $course->assignments->first(); // Assuming each course has one assignment record

                                        return [
                                            'course_assignment_id' => $assignment->course_assignment_id ?? null,
                                            'curricula_program_id' => $assignment->curricula_program_id ?? null,
                                            'course_id' => $assignment->course_id ?? null,
                                            'course_code' => $course->course_code,
                                            'course_title' => $course->course_title,
                                            'lec_hours' => $course->lec_hours,
                                            'lab_hours' => $course->lab_hours,
                                            'units' => $course->units,
                                            'tuition_hours' => $course->tuition_hours,
                                            'prerequisites' => $course->requirements->where('requirement_type', 'pre')->map(function($prereq) {
                                                return $prereq->requiredCourse ? [
                                                    'course_code' => $prereq->requiredCourse->course_code,
                                                    'course_title' => $prereq->requiredCourse->course_title,
                                                ] : null;
                                            })->filter()->values(),
                                            'corequisites' => $course->requirements->where('requirement_type', 'co')->map(function($coreq) {
                                                return $coreq->requiredCourse ? [
                                                    'course_code' => $coreq->requiredCourse->course_code,
                                                    'course_title' => $coreq->requiredCourse->course_title,
                                                ] : null;
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

        return response()->json($result);
    }
}
