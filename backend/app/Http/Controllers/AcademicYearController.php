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


    public function getAcademicYearsForDropdown()
    {
        // Fetch academic years and their corresponding semesters
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
    
        // Group the semesters under their corresponding academic year
        $groupedAcademicYears = [];
    
        foreach ($academicYears as $year) {
            // If the academic year doesn't exist in the array, initialize it
            if (!isset($groupedAcademicYears[$year->academic_year_id])) {
                $groupedAcademicYears[$year->academic_year_id] = [
                    'academic_year_id' => $year->academic_year_id,
                    'academic_year' => $year->academic_year,
                    'semesters' => []
                ];
            }
    
            // Map the semester_number to the correct label (1 -> "1st Semester", 2 -> "2nd Semester", 3 -> "Summer Semester")
            $semesterLabel = '';
            if ($year->semester_number == 1) {
                $semesterLabel = '1st Semester';
            } elseif ($year->semester_number == 2) {
                $semesterLabel = '2nd Semester';
            } elseif ($year->semester_number == 3) {
                $semesterLabel = 'Summer Semester';
            }
    
            // Add the semester to the academic year's 'semesters' array
            $groupedAcademicYears[$year->academic_year_id]['semesters'][] = [
                'semester_id' => $year->semester_id,
                'semester_number' => $semesterLabel
            ];
        }
    
        // Reset keys to make the array a proper list
        $groupedAcademicYears = array_values($groupedAcademicYears);
    
        return response()->json($groupedAcademicYears);
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

    public function fetchProgramDetailsByAcademicYear(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'academic_year_id' => 'required|integer'
        ]);
    
        $academicYearId = $request->input('academic_year_id');
    
        try {
            // Step 1: Fetch programs associated with the given academic year
            $programs = Program::select('programs.program_id', 'programs.program_code', 'programs.program_title')
                ->distinct()
                ->join('program_year_level_curricula as pylc', 'programs.program_id', '=', 'pylc.program_id')
                ->where('pylc.academic_year_id', $academicYearId)
                ->get();
    
            // Step 2: Fetch year levels and sections for each program
            foreach ($programs as $program) {
                $yearLevels = ProgramYearLevelCurricula::select('year_level', 'curriculum_id')
                    ->where('academic_year_id', $academicYearId)
                    ->where('program_id', $program->program_id)
                    ->get();
    
                // For each year level, fetch the corresponding number of sections
                foreach ($yearLevels as $yearLevel) {
                    $sectionsCount = SectionsPerProgramYear::where('academic_year_id', $academicYearId)
                        ->where('program_id', $program->program_id)
                        ->where('year_level', $yearLevel->year_level)
                        ->count();
    
                    $yearLevel->number_of_sections = $sectionsCount;
                }
    
                // Attach year levels and section data to the program
                $program->year_levels = $yearLevels;
            }
    
            return response()->json([
                'message' => 'Programs with year levels and sections fetched successfully.',
                'academic_year_id' => $academicYearId,
                'programs' => $programs
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }


    public function updateSections(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'academic_year_id' => 'required|integer',
            'program_id' => 'required|integer',
            'year_level' => 'required|integer',
            'number_of_sections' => 'required|integer|min:1'
        ]);

        $academicYearId = $request->input('academic_year_id');
        $programId = $request->input('program_id');
        $yearLevel = $request->input('year_level');
        $requestedSections = $request->input('number_of_sections');

        try {
            // Step 1: Get the existing number of sections for the specified academic year, program, and year level
            $existingSections = SectionsPerProgramYear::where('academic_year_id', $academicYearId)
                ->where('program_id', $programId)
                ->where('year_level', $yearLevel)
                ->get();

            $currentSectionCount = $existingSections->count();

            if ($currentSectionCount == $requestedSections) {
                // No changes needed
                return response()->json([
                    'message' => 'The number of sections is already correct. No changes were made.',
                ], 200);
            }

            // Step 2: If the user requests more sections, add the difference
            if ($requestedSections > $currentSectionCount) {
                $sectionsToAdd = $requestedSections - $currentSectionCount;

                // Generate new section names and add them
                for ($i = 1; $i <= $sectionsToAdd; $i++) {
                    $newSection = new SectionsPerProgramYear();
                    $newSection->academic_year_id = $academicYearId;
                    $newSection->program_id = $programId;
                    $newSection->year_level = $yearLevel;
                    $newSection->section_name = 'Section ' . ($currentSectionCount + $i); // Create new section names like "Section 3", "Section 4", etc.
                    $newSection->save();
                }

                return response()->json([
                    'message' => $sectionsToAdd . ' sections were added successfully.',
                ], 201);

            } elseif ($requestedSections < $currentSectionCount) {
                // Step 3: If the user requests fewer sections, delete the extra ones
                $sectionsToDelete = $currentSectionCount - $requestedSections;

                // Get the extra sections to delete
                $sectionsToRemove = SectionsPerProgramYear::where('academic_year_id', $academicYearId)
                    ->where('program_id', $programId)
                    ->where('year_level', $yearLevel)
                    ->orderBy('sections_per_program_year_id', 'desc') // Remove the latest added sections
                    ->take($sectionsToDelete)
                    ->get();

                foreach ($sectionsToRemove as $section) {
                    $section->delete();
                }

                return response()->json([
                    'message' => $sectionsToDelete . ' sections were removed successfully.',
                ], 200);
            }

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred: ' . $e->getMessage(),
            ], 500);
        }
    }



    public function removeProgramFromAcademicYear(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'academic_year_id' => 'required|integer',
            'program_id' => 'required|integer'
        ]);
    
        $academicYearId = $request->input('academic_year_id');
        $programId = $request->input('program_id');
    
        try {
            // Start the transaction
            DB::beginTransaction();
    
            // Step 1: Remove Year Levels associated with this program and academic year
            ProgramYearLevelCurricula::where('academic_year_id', $academicYearId)
                ->where('program_id', $programId)
                ->delete();
    
            // Step 2: Remove Sections associated with this program, year levels, and academic year
            SectionsPerProgramYear::where('academic_year_id', $academicYearId)
                ->where('program_id', $programId)
                ->delete();
    
            // Note: Active semesters are not being removed
    
            // Commit the transaction after everything is deleted
            DB::commit();
    
            return response()->json([
                'message' => 'Program and its associated year levels and sections removed successfully.'
            ], 200);
    
        } catch (\Exception $e) {
            // Rollback the transaction if any error occurs
            DB::rollBack();
    
            return response()->json([
                'message' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteAcademicYear(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'academic_year_id' => 'required|integer',
        ]);

        $academicYearId = $request->input('academic_year_id');

        try {
            // Start the transaction
            DB::beginTransaction();

            // Step 1: Remove Year Levels associated with this academic year
            ProgramYearLevelCurricula::where('academic_year_id', $academicYearId)
                ->delete();

            // Step 2: Remove Sections associated with this academic year
            SectionsPerProgramYear::where('academic_year_id', $academicYearId)
                ->delete();

            // Step 3: Remove Active Semesters associated with this academic year
            ActiveSemester::where('academic_year_id', $academicYearId)
                ->delete();

            // Step 4: Remove Academic Year Curricula (curriculum assignments for this academic year)
            AcademicYearCurricula::where('academic_year_id', $academicYearId)
                ->delete();

            // Step 5: Remove the academic year itself
            AcademicYear::where('academic_year_id', $academicYearId)
                ->delete();

            // Commit the transaction after everything is deleted
            DB::commit();

            return response()->json([
                'message' => 'Academic year and all related data were removed successfully.'
            ], 200);

        } catch (\Exception $e) {
            // Rollback the transaction if any error occurs
            DB::rollBack();

            return response()->json([
                'message' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }
    
}
