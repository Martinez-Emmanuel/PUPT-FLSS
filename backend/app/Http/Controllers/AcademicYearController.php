<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AcademicYear;
use App\Models\ActiveSemester;
use App\Models\Semester;
use App\Models\Program;

class AcademicYearController extends Controller
{
    public function getAcademicYearsWithSemesters()
    {
        $academicYears = AcademicYear::join('active_semesters', 'academic_years.academic_year_id', '=', 'active_semesters.academic_year_id')
            ->join('semesters', 'active_semesters.semester_id', '=', 'semesters.semester_id')
            ->select(
                'academic_years.academic_year_id',
                \DB::raw("CONCAT(academic_years.year_start, '-', academic_years.year_end) as academic_year"),
                'semesters.semester_id',
                'semesters.semester as semester_number',
                'active_semesters.is_active'
            )
            ->orderBy('academic_years.year_start')
            ->orderBy('semesters.semester')
            ->get();

        return response()->json($academicYears);
    }


     public function getActiveAcademicYear()
     {
         $activeAcademicYear = AcademicYear::join('active_semesters', 'academic_years.academic_year_id', '=', 'active_semesters.academic_year_id')
             ->join('semesters', 'active_semesters.semester_id', '=', 'semesters.semester_id')
             ->where('active_semesters.is_active', 1)
             ->select(
                 'academic_years.academic_year_id',
                 'academic_years.year_start',
                 'academic_years.year_end',
                 'semesters.semester_id',
                 'semesters.semester'
             )
             ->first(); 
 
         return response()->json($activeAcademicYear);
     }

    public function getActivePrograms()
    {
        $activePrograms = Program::select('programs.program_id', 'programs.program_code', 'programs.program_title')
            ->distinct()
            ->join('curricula_program', 'programs.program_id', '=', 'curricula_program.program_id')
            ->join('academic_year_curricula', 'curricula_program.curriculum_id', '=', 'academic_year_curricula.curriculum_id')
            ->join('active_semesters', 'academic_year_curricula.academic_year_id', '=', 'active_semesters.academic_year_id')
            ->where('active_semesters.is_active', 1)
            ->get();

        // Return the result as a JSON response
        return response()->json($activePrograms);
    }

    public function getActiveYearLevels()
    {
        $activeYearLevels = \DB::table('program_year_level_curricula as pylc')
            ->select(
                'p.program_id',
                'p.program_code',
                'p.program_title',
                'pylc.year_level',
                'c.curriculum_id',
                'c.curriculum_year',
                'ay.year_start',
                'ay.year_end',
                's.semester'
            )
            ->join('programs as p', 'pylc.program_id', '=', 'p.program_id')
            ->join('curricula as c', 'pylc.curriculum_id', '=', 'c.curriculum_id')
            ->join('academic_years as ay', 'pylc.academic_year_id', '=', 'ay.academic_year_id')
            ->join('active_semesters as ase', 'ay.academic_year_id', '=', 'ase.academic_year_id')
            ->join('semesters as s', 'ase.semester_id', '=', 's.semester_id')
            ->where('ase.is_active', 1)
            ->where(function ($query) {
                $query->where(function ($query) {
                    // Filter for year levels 1 and 2 using curriculum year 2022
                    $query->whereIn('pylc.year_level', [1, 2])
                          ->where('c.curriculum_year', 2022);
                })
                ->orWhere(function ($query) {
                    // Filter for year levels 3 and above using curriculum year 2018
                    $query->where('pylc.year_level', '>=', 3)
                          ->where('c.curriculum_year', 2018);
                });
            })
            ->orderBy('p.program_id')
            ->orderBy('pylc.year_level')
            ->get();
    
        return response()->json($activeYearLevels);
    }
    
    public function getActiveYearLevelsCurricula()
    {
        $activeYearLevels = \DB::table('program_year_level_curricula as pylc')
            ->select(
                'p.program_id',
                'p.program_code',
                'p.program_title',
                'pylc.year_level',
                'c.curriculum_id',
                'c.curriculum_year',
                'ay.year_start',
                'ay.year_end',
                's.semester'
            )
            ->join('programs as p', 'pylc.program_id', '=', 'p.program_id')
            ->join('curricula as c', 'pylc.curriculum_id', '=', 'c.curriculum_id')
            ->join('academic_years as ay', 'pylc.academic_year_id', '=', 'ay.academic_year_id')
            ->join('active_semesters as ase', 'ay.academic_year_id', '=', 'ase.academic_year_id')
            ->join('semesters as s', 'ase.semester_id', '=', 's.semester_id')
            ->where('ase.is_active', 1)
            ->orderBy('p.program_id')
            ->orderBy('pylc.year_level')
            ->get();

        return response()->json($activeYearLevels);
    }

    public function getActiveSections()
    {
        $activeSections = \DB::table('sections_per_program_year as sp')
            ->select(
                'sp.sections_per_program_year_id',
                'sp.section_name',
                'sp.year_level',
                'p.program_id',
                'p.program_code',
                'ay.year_start',
                'ay.year_end'
            )
            ->join('programs as p', 'sp.program_id', '=', 'p.program_id')
            ->join('academic_years as ay', 'sp.academic_year_id', '=', 'ay.academic_year_id')
            ->join('active_semesters as ase', 'ay.academic_year_id', '=', 'ase.academic_year_id')
            ->where('ase.is_active', 1)
            ->get();
    
        return response()->json($activeSections);
    }

    public function getSectionsCountByProgramYearLevel(Request $request)
    {
        // Get year_start and year_end from the JSON payload
        $yearStart = $request->input('year_start');
        $yearEnd = $request->input('year_end');
    
        // Validate the JSON input
        $request->validate([
            'year_start' => 'required|integer',
            'year_end' => 'required|integer',
        ]);
    
        // Query to get the number of sections for each program-year level by academic year and semester
        $sectionsCount = \DB::table('sections_per_program_year as sp')
            ->select(
                'p.program_id',
                'p.program_code',
                'p.program_title',
                'sp.year_level',
                'ay.year_start',
                'ay.year_end',
                's.semester',
                \DB::raw('COUNT(DISTINCT sp.section_name) AS number_of_sections')
            )
            ->join('programs as p', 'sp.program_id', '=', 'p.program_id')
            ->join('academic_years as ay', 'sp.academic_year_id', '=', 'ay.academic_year_id')
            ->join('active_semesters as ase', 'ay.academic_year_id', '=', 'ase.academic_year_id')
            ->join('semesters as s', 'ase.semester_id', '=', 's.semester_id')
            ->where('ay.year_start', $yearStart)
            ->where('ay.year_end', $yearEnd)
            ->groupBy('p.program_id', 'p.program_code', 'p.program_title', 'sp.year_level', 'ay.year_start', 'ay.year_end', 's.semester')
            ->orderBy('p.program_id')
            ->orderBy('sp.year_level')
            ->get();
    
        // Return the structured response as JSON
        return response()->json($sectionsCount);
    }
    

}
