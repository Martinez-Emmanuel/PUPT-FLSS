<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\ActiveSemester;

class ReportsController extends Controller
{

    public function getFacultyScheduleReports()
    {
        // Step 1: Get the active semester and academic year
        $activeSemester = DB::table('active_semesters')
            ->join('academic_years', 'active_semesters.academic_year_id', '=', 'academic_years.academic_year_id')
            ->where('active_semesters.is_active', 1)
            ->select(
                'active_semesters.*',
                'academic_years.year_start',
                'academic_years.year_end'
            )
            ->first();

        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found'], 404);
        }

        $activeAcademicYearId = $activeSemester->academic_year_id;

        $faculties = DB::table('faculty')
            ->join('users', 'faculty.user_id', '=', 'users.id')
            ->select(
                'faculty.id as faculty_id',
                'users.name as faculty_name',
                'faculty.faculty_type',
                DB::raw('0 as assigned_units'),
                DB::raw('0 as is_published')
            )
            ->get();

        $response = [
            'faculty_schedule_reports' => [
                'academic_year_id' => $activeSemester->academic_year_id,
                'year_start' => $activeSemester->year_start,
                'year_end' => $activeSemester->year_end,
                'active_semester_id' => $activeSemester->active_semester_id,
                'semester' => $activeSemester->semester_id,
                'faculties' => []
            ]
        ];

        foreach ($faculties as $faculty) {
            $facultySchedules = $this->getFacultySchedules($faculty->faculty_id, $activeSemester);

            if (!empty($facultySchedules)) {
                $faculty->schedules = $facultySchedules;
                $response['faculty_schedule_reports']['faculties'][] = $faculty;
            }
        }

        return response()->json($response);
    }

    private function getFacultySchedules($facultyId, $activeSemester)
    {
        $schedules = DB::table('schedules')
            ->join('section_courses', 'schedules.section_course_id', '=', 'section_courses.section_course_id')
            ->join('course_assignments', 'section_courses.course_assignment_id', '=', 'course_assignments.course_assignment_id')
            ->join('courses', 'course_assignments.course_id', '=', 'courses.course_id')
            ->join('sections_per_program_year', 'section_courses.sections_per_program_year_id', '=', 'sections_per_program_year.sections_per_program_year_id')
            ->join('programs', 'sections_per_program_year.program_id', '=', 'programs.program_id')
            ->join('rooms', 'schedules.room_id', '=', 'rooms.room_id')
            ->join('semesters as s', 'course_assignments.semester_id', '=', 's.semester_id') // Adjusted join for semester
            ->where('schedules.faculty_id', $facultyId)
            ->where('s.semester', $activeSemester->semester_id) // Filter using the semester's attribute
            ->where('sections_per_program_year.academic_year_id', $activeSemester->academic_year_id) // Ensure it's for the active academic year
            ->select(
                'programs.program_id',
                'programs.program_code',
                'programs.program_title',
                'sections_per_program_year.year_level',
                'sections_per_program_year.sections_per_program_year_id',
                'sections_per_program_year.section_name',
                'schedules.schedule_id',
                'schedules.day',
                'schedules.start_time',
                'schedules.end_time',
                'rooms.room_code',
                'course_assignments.course_assignment_id',
                'courses.course_title',
                'courses.course_code',
                'courses.lec_hours as lec',
                'courses.lab_hours as lab',
                'courses.units',
                'courses.tuition_hours',
                's.semester_id' // Include the semester_id in the select statement
            )
            ->get();
    
        $organizedSchedules = [];
    
        foreach ($schedules as $schedule) {
            // Access semester_id safely here
            $programIndex = $this->findOrCreateProgram($organizedSchedules, $schedule);
            $yearLevelIndex = $this->findOrCreateYearLevel($organizedSchedules[$programIndex]['year_levels'], $schedule);
            $semesterIndex = $this->findOrCreateSemester($organizedSchedules[$programIndex]['year_levels'][$yearLevelIndex]['semesters'], $schedule->semester_id);
            $sectionIndex = $this->findOrCreateSection($organizedSchedules[$programIndex]['year_levels'][$yearLevelIndex]['semesters'][$semesterIndex]['sections'], $schedule);
    
            if (!isset($organizedSchedules[$programIndex]['year_levels'][$yearLevelIndex]['semesters'][$semesterIndex]['sections'][$sectionIndex]['courses'][$schedule->day])) {
                $organizedSchedules[$programIndex]['year_levels'][$yearLevelIndex]['semesters'][$semesterIndex]['sections'][$sectionIndex]['courses'][$schedule->day] = [];
            }
    
            $organizedSchedules[$programIndex]['year_levels'][$yearLevelIndex]['semesters'][$semesterIndex]['sections'][$sectionIndex]['courses'][$schedule->day][] = [
                'schedule_id' => $schedule->schedule_id,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'room_code' => $schedule->room_code,
                'course_details' => [
                    'course_assignment_id' => $schedule->course_assignment_id,
                    'course_title' => $schedule->course_title,
                    'course_code' => $schedule->course_code,
                    'lec' => $schedule->lec,
                    'lab' => $schedule->lab,
                    'units' => $schedule->units,
                    'tuition_hours' => $schedule->tuition_hours
                ]
            ];
        }
    
        return array_values($organizedSchedules);
    }
    

    private function findOrCreateProgram(&$programs, $schedule)
    {
        foreach ($programs as $index => $program) {
            if ($program['program_id'] == $schedule->program_id) {
                return $index;
            }
        }

        $programs[] = [
            'program_id' => $schedule->program_id,
            'program_code' => $schedule->program_code,
            'program_title' => $schedule->program_title,
            'year_levels' => []
        ];

        return count($programs) - 1;
    }

    private function findOrCreateYearLevel(&$yearLevels, $schedule)
    {
        foreach ($yearLevels as $index => $yearLevel) {
            if ($yearLevel['year_level'] == $schedule->year_level) {
                return $index;
            }
        }

        $yearLevels[] = [
            'year_level' => $schedule->year_level,
            'semesters' => []
        ];

        return count($yearLevels) - 1;
    }

    private function findOrCreateSemester(&$semesters, $semesterId)
    {
        foreach ($semesters as $index => $semester) {
            if ($semester['semester'] == $semesterId) {
                return $index;
            }
        }

        $semesters[] = [
            'semester' => $semesterId,
            'sections' => []
        ];

        return count($semesters) - 1;
    }

    private function findOrCreateSection(&$sections, $schedule)
    {
        foreach ($sections as $index => $section) {
            if ($section['section_per_program_year_id'] == $schedule->sections_per_program_year_id) {
                return $index;
            }
        }

        $sections[] = [
            'section_per_program_year_id' => $schedule->sections_per_program_year_id,
            'section_name' => $schedule->section_name,
            'courses' => []
        ];

        return count($sections) - 1;
    }
    // public function getFacultySchedulesReport()
    // {
    //     // Step 1: Retrieve the current active semester with academic year details
    //     $activeSemester = DB::table('active_semesters')
    //         ->join('academic_years', 'active_semesters.academic_year_id', '=', 'academic_years.academic_year_id')
    //         ->where('active_semesters.is_active', 1)
    //         ->select(
    //             'active_semesters.active_semester_id',
    //             'active_semesters.semester_id',
    //             'academic_years.academic_year_id',
    //             'academic_years.year_start',
    //             'academic_years.year_end'
    //         )
    //         ->first();
    
    //     if (!$activeSemester) {
    //         return response()->json(['message' => 'No active semester found.'], 404);
    //     }
    
    //     // Step 2: Get all faculty schedules with course details, including faculty without schedules
    //     $facultySchedules = DB::table('faculty')
    //         ->join('users', 'faculty.user_id', '=', 'users.id')
    //         ->leftJoin('schedules', 'schedules.faculty_id', '=', 'faculty.id')
    //         ->leftJoin('section_courses', 'section_courses.section_course_id', '=', 'schedules.section_course_id')
    //         ->leftJoin('sections_per_program_year', function ($join) use ($activeSemester) {
    //             $join->on('sections_per_program_year.sections_per_program_year_id', '=', 'section_courses.sections_per_program_year_id')
    //                  ->where('sections_per_program_year.academic_year_id', '=', $activeSemester->academic_year_id);
    //         })
    //         ->leftJoin('course_assignments', function ($join) use ($activeSemester) {
    //             $join->on('course_assignments.course_assignment_id', '=', 'section_courses.course_assignment_id')
    //                  ->where('course_assignments.semester_id', '=', $activeSemester->semester_id);
    //         })
    //         ->leftJoin('courses', 'courses.course_id', '=', 'course_assignments.course_id')
    //         ->leftJoin('rooms', 'rooms.room_id', '=', 'schedules.room_id')
    //         ->select(
    //             'faculty.id as faculty_id',
    //             'users.name as faculty_name',
    //             'users.code as faculty_code',
    //             'faculty.faculty_type',
    //             'schedules.schedule_id',
    //             'schedules.day',
    //             'schedules.start_time',
    //             'schedules.end_time',
    //             'rooms.room_code',
    //             'course_assignments.course_assignment_id',
    //             'courses.course_title',
    //             'courses.course_code',
    //             'courses.lec_hours',
    //             'courses.lab_hours',
    //             'courses.units',
    //             'courses.tuition_hours'
    //         )
    //         ->get();
    
    //     // Step 3: Group the data by faculty and structure schedules
    //     $faculties = [];
    
    //     foreach ($facultySchedules as $schedule) {
    //         if (!isset($faculties[$schedule->faculty_id])) {
    //             $faculties[$schedule->faculty_id] = [
    //                 'faculty_id' => $schedule->faculty_id,
    //                 'faculty_name' => $schedule->faculty_name,
    //                 'faculty_code' => $schedule->faculty_code,
    //                 'faculty_type' => $schedule->faculty_type,
    //                 'assigned_units' => 0,
    //                 'is_published' => 0,
    //                 'schedules' => []
    //             ];
    //         }
    
    //         if ($schedule->course_assignment_id) {
    //             $faculties[$schedule->faculty_id]['assigned_units'] += $schedule->units;
    
    //             if ($schedule->schedule_id && $faculties[$schedule->faculty_id]['is_published'] == 0) {
    //                 $faculties[$schedule->faculty_id]['is_published'] = 1;
    //             }
    
    //             $faculties[$schedule->faculty_id]['schedules'][] = [
    //                 'schedule_id' => $schedule->schedule_id,
    //                 'day' => $schedule->day,
    //                 'start_time' => $schedule->start_time,
    //                 'end_time' => $schedule->end_time,
    //                 'room_code' => $schedule->room_code,
    //                 'course_details' => [
    //                     'course_assignment_id' => $schedule->course_assignment_id,
    //                     'course_title' => $schedule->course_title,
    //                     'course_code' => $schedule->course_code,
    //                     'lec' => $schedule->lec_hours,
    //                     'lab' => $schedule->lab_hours,
    //                     'units' => $schedule->units,
    //                     'tuition_hours' => $schedule->tuition_hours
    //                 ]
    //             ];
    //         }
    //     }
    
    //     // Step 4: Structure the response
    //     return response()->json([
    //         'faculty_schedule_reports' => [
    //             'academic_year_id' => $activeSemester->academic_year_id,
    //             'year_start' => $activeSemester->year_start,
    //             'year_end' => $activeSemester->year_end,
    //             'active_semester_id' => $activeSemester->active_semester_id,
    //             'semester' => $activeSemester->semester_id,
    //             'faculties' => array_values($faculties)
    //         ]
    //     ]);
    // }
}
