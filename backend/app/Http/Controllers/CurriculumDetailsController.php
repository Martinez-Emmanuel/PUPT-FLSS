<?php

namespace App\Http\Controllers;

use App\Models\Curriculum;
use App\Models\CurriculaProgram;
use App\Models\CourseAssignment;

class CurriculumDetailsController extends Controller
{
    public function getCurriculumDetails($curriculumYear)
    {
        $curriculum = Curriculum::where('curriculum_year', $curriculumYear)
            ->firstOrFail();

        $curriculaPrograms = CurriculaProgram::where('curriculum_id', $curriculum->curriculum_id)
            ->with(['program', 'yearLevels.semesters'])
            ->get();

        $result = [
            'curriculum_id' => $curriculum->curriculum_id,
            'curriculum_year' => $curriculum->curriculum_year,
            'status' => ucfirst($curriculum->status),
            'programs' => $curriculaPrograms->map(function ($curriculaProgram) {
                return [
                    'curricula_program_id' => $curriculaProgram->curricula_program_id,
                    'name' => $curriculaProgram->program->program_code,
                    'program_title' => $curriculaProgram->program->program_title, // Add program_title here
                    'number_of_years' => $curriculaProgram->program->number_of_years,
                    'year_levels' => $this->getYearLevels($curriculaProgram),
                ];
            }),
        ];

        return response()->json($result);
    }

    private function getYearLevels($curriculaProgram)
    {
        return $curriculaProgram->yearLevels->map(function ($yearLevel) use ($curriculaProgram) {
            return [
                'year_level_id' => $yearLevel->year_level_id,
                'year' => $yearLevel->year,
                'semesters' => $this->getSemesters($yearLevel, $curriculaProgram),
            ];
        });
    }

    private function getSemesters($yearLevel, $curriculaProgram)
    {
        return $yearLevel->semesters->map(function ($semester) use ($curriculaProgram) {
            return [
                'semester_id' => $semester->semester_id,
                'semester' => $semester->semester,
                'courses' => $this->getCourses($curriculaProgram, $semester->semester_id),
            ];
        });
    }

    private function getCourses($curriculaProgram, $semesterId)
    {
        $courseAssignments = CourseAssignment::where('curricula_program_id', $curriculaProgram->curricula_program_id)
            ->where('semester_id', $semesterId)
            ->whereHas('curriculaProgram', function ($query) use ($curriculaProgram) {
                $query->where('curriculum_id', $curriculaProgram->curriculum_id);
            })
            ->with(['course.requirements.requiredCourse'])
            ->get();

        return $courseAssignments->map(function ($assignment) {
            $course = $assignment->course;

            return [
                'course_assignment_id' => $assignment->course_assignment_id,
                'curricula_program_id' => $assignment->curricula_program_id,
                'year_level_id' => $assignment->semester->yearLevel->year_level_id,
                'course_id' => $course->course_id,
                'course_code' => $course->course_code,
                'course_title' => $course->course_title,
                'lec_hours' => $course->lec_hours,
                'lab_hours' => $course->lab_hours,
                'units' => $course->units,
                'tuition_hours' => $course->tuition_hours,
                'prerequisites' => $this->getRequirements($course, 'pre'),
                'corequisites' => $this->getRequirements($course, 'co'),
            ];
        });
    }

    private function getRequirements($course, $type)
    {
        return $course->requirements->where('requirement_type', $type)->map(function ($req) {
            return [
                'course_id' => $req->requiredCourse->course_id,
                'course_code' => $req->requiredCourse->course_code,
                'course_title' => $req->requiredCourse->course_title,
            ];
        })->values();
    }
}
