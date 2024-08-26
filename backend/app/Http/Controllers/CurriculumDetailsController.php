<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Curriculum;

class CurriculumDetailsController extends Controller
{
    public function getCurriculumDetails($curriculumYear)
    {
        $curriculum = Curriculum::with([
            'programs' => function ($query) {
                $query->where('status', 'active')
                      ->with(['yearLevels' => function ($query) {
                          $query->with(['semesters' => function ($query) {
                              $query->with(['courses' => function ($query) {
                                  $query->with(['requirements' => function ($query) {
                                      $query->with('requiredCourse:course_id,course_code');
                                  }]);
                              }]);
                          }]);
                      }]);
            }
        ])
        ->where('curriculum_year', $curriculumYear)
        ->firstOrFail();

        // Structure the data
        $result = [
            'curriculum_year' => $curriculum->curriculum_year,
            'status' => $curriculum->status,
            'programs' => $curriculum->programs->map(function ($program) {
                return [
                    'name' => $program->program_title, // Assuming 'program_title' is the correct column
                    'number_of_years' => $program->number_of_years,
                    'year_levels' => $program->yearLevels->map(function ($yearLevel) {
                        return [
                            'year' => $yearLevel->year,
                            'semesters' => $yearLevel->semesters->map(function ($semester) {
                                return [
                                    'semester' => $semester->semester,
                                    'courses' => $semester->courses->map(function ($course) {
                                        return [
                                            'course_code' => $course->course_code,
                                            'course_title' => $course->course_title,
                                            'lec_hours' => $course->lec_hours,
                                            'lab_hours' => $course->lab_hours,
                                            'units' => $course->units,
                                            'tuition_hours' => $course->tuition_hours,
                                            'pre_req' => $course->requirements->where('requirement_type', 'pre')->pluck('requiredCourse.course_code'),
                                            'co_req' => $course->requirements->where('requirement_type', 'co')->pluck('requiredCourse.course_code'),
                                        ];
                                    })
                                ];
                            })
                        ];
                    })
                ];
            })
        ];

        return response()->json($result);
    }
}

