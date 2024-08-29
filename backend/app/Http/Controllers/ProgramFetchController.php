<?php

namespace App\Http\Controllers;

use App\Models\CurriculaProgram;
use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\CourseRequirement;
use App\Models\CourseAssignment;
use Illuminate\Support\Facades\DB;
use App\Models\Curriculum;
use App\Models\Program;
use App\Models\YearLevel;
use App\Models\Semester;
use App\Models\AcademicYear;
use App\Models\ActiveSemester;
use App\Models\Requirement;
use App\Models\RequiredCourse;



class ProgramFetchController extends Controller
{
    public function getCoursesForCurriculum(Request $request)
    {
        $curriculumId = 2; // For example, 2022 curriculum
        $yearLevel = 2; // 1st Year
        $semesterNumber = 1; // 1st Semester

        $courses = Course::whereHas('assignments.semester.yearLevel.curriculaProgram', function($query) use ($curriculumId, $yearLevel) {
            $query->where('curriculum_id', $curriculumId)
                  ->where('year', $yearLevel);
        })
        ->whereHas('assignments.semester.activeSemesters.academicYear', function($query) {
            $query->where('is_active', true);
        })
        ->whereHas('assignments.semester', function($query) use ($semesterNumber) {
            $query->where('semester', $semesterNumber);
        })
        ->with(['assignments' => function($query) {
            $query->with('semester.activeSemesters.academicYear');
        }])
        ->get(['course_code', 'course_title']);

        return response()->json($courses);
    }
}
