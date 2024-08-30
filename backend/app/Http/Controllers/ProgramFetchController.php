<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\YearLevel;
use App\Models\Semester;
use Illuminate\Http\Request;

class ProgramFetchController extends Controller
{
    // public function getCoursesForCurriculum(Request $request)
    // {
    //     $curriculumId = $request->input('curriculum_id', 2);
    //     $yearLevel = $request->input('year_level', 4);
    //     $semesterNumber = $request->input('semester', 1);

    //     $yearLevelId = YearLevel::where('curricula_program_id', $curriculumId)
    //         ->where('year', $yearLevel)
    //         ->value('year_level_id');

    //     if (!$yearLevelId) {
    //         return response()->json(['error' => 'Year level not found for the given curriculum'], 404);
    //     }

    //     $semesterId = Semester::where('year_level_id', $yearLevelId)
    //         ->where('semester', $semesterNumber)
    //         ->value('semester_id');

    //     if (!$semesterId) {
    //         return response()->json(['error' => 'Semester not found for the given year level'], 404);
    //     }

    //     $courses = Course::whereHas('assignments', function ($query) use ($semesterId) {
    //         $query->where('semester_id', $semesterId);
    //     })
    //     ->with(['assignments' => function ($query) use ($semesterId) {
    //         $query->where('semester_id', $semesterId);
    //     }])
    //     ->get(['course_code', 'course_title']);

    //     return response()->json($courses);
    // }

    
}