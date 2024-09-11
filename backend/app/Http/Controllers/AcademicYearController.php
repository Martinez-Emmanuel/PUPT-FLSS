<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\AcademicYear;
use App\Models\AcademicYearCurricula;
use App\Models\ActiveSemester;
use App\Models\ProgramYearLevelCurricula;
use App\Models\SectionsPerProgramYear;
use App\Models\Program;
use App\Models\Curriculum;

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

    public function getAcademicYearsForDropdown()
    {
        $academicYears = AcademicYear::join('active_semesters', 'academic_years.academic_year_id', '=', 'active_semesters.academic_year_id')
            ->join('semesters', 'active_semesters.semester_id', '=', 'semesters.semester_id')
            ->select(
                'academic_years.academic_year_id',
                \DB::raw("CONCAT(academic_years.year_start, '-', academic_years.year_end) as academic_year"),
                'semesters.semester_id',
                'semesters.semester as semester_number'
            )
            ->orderBy('academic_years.year_start')
            ->orderBy('semesters.semester')
            ->get();

        return response()->json($academicYears);
    }

    public function setActiveAcademicYearAndSemester(Request $request)
    {
        $academicYearId = $request->input('academic_year_id');
        $semesterId = $request->input('semester_id');

        $request->validate([
            'academic_year_id' => 'required|integer|exists:academic_years,academic_year_id',
            'semester_id' => 'required|integer|exists:semesters,semester_id',
        ]);

        ActiveSemester::query()->update(['is_active' => 0]);

        ActiveSemester::where('academic_year_id', $academicYearId)
            ->where('semester_id', $semesterId)
            ->update(['is_active' => 1]);

        return response()->json([
            'message' => 'Active academic year and semester updated successfully',
            'academic_year_id' => $academicYearId,
            'semester_id' => $semesterId
        ]);
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
                's.semester',
                'sp.section_name',
                'sp.sections_per_program_year_id as section_id'
            )
            ->join('programs as p', 'pylc.program_id', '=', 'p.program_id')
            ->join('curricula as c', 'pylc.curriculum_id', '=', 'c.curriculum_id')
            ->join('academic_years as ay', 'pylc.academic_year_id', '=', 'ay.academic_year_id')
            ->join('active_semesters as ase', 'ay.academic_year_id', '=', 'ase.academic_year_id')
            ->join('semesters as s', 'ase.semester_id', '=', 's.semester_id')
            ->join('sections_per_program_year as sp', function($join) {
                $join->on('pylc.program_id', '=', 'sp.program_id')
                     ->on('pylc.year_level', '=', 'sp.year_level')
                     ->on('pylc.academic_year_id', '=', 'sp.academic_year_id');
            })
            ->where('ase.is_active', 1)
            ->orderBy('p.program_id')
            ->orderBy('pylc.year_level')
            ->get();
    
        $response = [];
    
        foreach ($activeYearLevels as $row) {
            // Find or create program entry
            $programIndex = array_search($row->program_id, array_column($response, 'program_id'));
    
            if ($programIndex === false) {
                $response[] = [
                    'program_id' => $row->program_id,
                    'program_code' => $row->program_code,
                    'program_title' => $row->program_title,
                    'year_level_count' => 0,  // Initialize year_level_count
                    'year_levels' => []
                ];
                $programIndex = count($response) - 1;
            }
    
            // Check if year level already exists under the program
            $yearLevelIndex = array_search($row->year_level, array_column($response[$programIndex]['year_levels'], 'year_level'));
    
            if ($yearLevelIndex === false) {
                // If not found, add the year level and increment the year_level_count
                $response[$programIndex]['year_levels'][] = [
                    'year_level' => $row->year_level,
                    'curriculum_id' => $row->curriculum_id,
                    'curriculum_year' => $row->curriculum_year,
                    'sections' => []
                ];
                $yearLevelIndex = count($response[$programIndex]['year_levels']) - 1;
                
                // Increment the year level count for the program
                $response[$programIndex]['year_level_count']++;
            }
    
            // Add sections under the year level
            $response[$programIndex]['year_levels'][$yearLevelIndex]['sections'][] = [
                'section_id' => $row->section_id,
                'section_name' => $row->section_name
            ];
        }
    
        return response()->json($response);


    }
    public function addAcademicYear(Request $request)
    {
        // Start a transaction to ensure atomicity
        DB::beginTransaction();
    
        try {
            // Step 1: Insert into academic_years table
            $academicYear = new AcademicYear();
            $academicYear->year_start = $request->input('year_start');
            $academicYear->year_end = $request->input('year_end');
            $academicYear->is_active = 0; // Set default is_active as 0
            $academicYear->save();
    
            // Get the newly created academic_year_id
            $newAcademicYearId = $academicYear->academic_year_id;
    
            // Step 2: Insert into academic_year_curricula (for each active curriculum)
            $activeCurricula = Curriculum::where('status', 'active')->get(); // Fetch active curricula
    
            foreach ($activeCurricula as $curriculum) {
                $academicYearCurricula = new AcademicYearCurricula();
                $academicYearCurricula->academic_year_id = $newAcademicYearId;
                $academicYearCurricula->curriculum_id = $curriculum->curriculum_id;
                $academicYearCurricula->save();
            }
    
            // Step 3: Insert into active_semesters (3 default semesters with is_active = 0)
            for ($semesterId = 1; $semesterId <= 3; $semesterId++) {
                $activeSemester = new ActiveSemester();
                $activeSemester->academic_year_id = $newAcademicYearId;
                $activeSemester->semester_id = $semesterId;
                $activeSemester->is_active = 0; // Default value
                $activeSemester->save();
            }
    
            // Step 4: Insert into program_year_level_curricula for each active program and year level
            $activePrograms = Program::where('status', 'active')->get(); // Fetch active programs
    
            foreach ($activePrograms as $program) {
                // Generate 4 year levels per program
                for ($yearLevel = 1; $yearLevel <= 4; $yearLevel++) {
                    // Determine curriculum_id based on year level (custom logic here)
                    // Assuming 2018 curriculum has id=1 and 2022 curriculum has id=2
                    $curriculumId = ($yearLevel <= 2) ? 2 : 1;
    
                    $programYearLevelCurricula = new ProgramYearLevelCurricula();
                    $programYearLevelCurricula->academic_year_id = $newAcademicYearId;
                    $programYearLevelCurricula->program_id = $program->program_id;
                    $programYearLevelCurricula->year_level = $yearLevel;
                    $programYearLevelCurricula->curriculum_id = $curriculumId;
                    $programYearLevelCurricula->save();
                }
            }
    
        // Step 5: Insert into sections_per_program_year for each program and year level
        foreach ($activePrograms as $program) {
            // Generate "Section 1" for all year levels in each program
            for ($yearLevel = 1; $yearLevel <= 4; $yearLevel++) {
                $section = new SectionsPerProgramYear();
                $section->academic_year_id = $newAcademicYearId;
                $section->program_id = $program->program_id;
                $section->year_level = $yearLevel;
                $section->section_name = 'Section 1'; // Always use "Section 1"
                $section->save();
            }
        }


    
            // Commit the transaction
            DB::commit();
    
            return response()->json([
                'message' => 'Academic year added successfully with related data.',
                'academic_year_id' => $newAcademicYearId
            ], 201);
    
        } catch (\Exception $e) {
            // Rollback the transaction in case of any error
            DB::rollback();
    
            return response()->json([
                'message' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateYearLevelCurricula(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'academic_year_id' => 'required|integer',
            'program_id' => 'required|integer',
            'year_levels' => 'required|array',
            'year_levels.*.year_level' => 'required|integer',
            'year_levels.*.curriculum_id' => 'required|integer',
        ]);

        $academicYearId = $request->input('academic_year_id');
        $programId = $request->input('program_id');
        $yearLevels = $request->input('year_levels');

        try {
            foreach ($yearLevels as $yearLevelData) {
                $yearLevel = $yearLevelData['year_level'];
                $curriculumId = $yearLevelData['curriculum_id'];

                // Update or find the program year level curricula record
                $programYearLevel = ProgramYearLevelCurricula::where('academic_year_id', $academicYearId)
                    ->where('program_id', $programId)
                    ->where('year_level', $yearLevel)
                    ->first();

                if ($programYearLevel) {
                    // Update the curriculum_id for the specific year level
                    $programYearLevel->curriculum_id = $curriculumId;
                    $programYearLevel->save();
                } else {
                    // If no matching record is found, create a new one (optional)
                    ProgramYearLevelCurricula::create([
                        'academic_year_id' => $academicYearId,
                        'program_id' => $programId,
                        'year_level' => $yearLevel,
                        'curriculum_id' => $curriculumId,
                    ]);
                }
            }

            return response()->json(['message' => 'Year levels updated successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred: ' . $e->getMessage()], 500);
        }
    }
}
