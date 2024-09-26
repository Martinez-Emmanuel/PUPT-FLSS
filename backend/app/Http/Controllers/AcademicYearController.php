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
                'semesters.semester as semester_number',
                'active_semesters.start_date',
                'active_semesters.end_date'
            )
            ->orderBy('academic_years.year_start', 'desc')
            ->orderBy('semesters.semester')
            ->get();
    
        $groupedAcademicYears = [];
    
        foreach ($academicYears as $year) {
            if (!isset($groupedAcademicYears[$year->academic_year_id])) {
                $groupedAcademicYears[$year->academic_year_id] = [
                    'academic_year_id' => $year->academic_year_id,
                    'academic_year' => $year->academic_year,
                    'semesters' => []
                ];
            }
    
            $semesterLabel = '';
            if ($year->semester_number == 1) {
                $semesterLabel = '1st Semester';
            } elseif ($year->semester_number == 2) {
                $semesterLabel = '2nd Semester';
            } elseif ($year->semester_number == 3) {
                $semesterLabel = 'Summer Semester';
            }
    
            $groupedAcademicYears[$year->academic_year_id]['semesters'][] = [
                'semester_id' => $year->semester_id,
                'semester_number' => $semesterLabel,
                'start_date' => $year->start_date,
                'end_date' => $year->end_date
            ];
        }
    
        $groupedAcademicYears = array_values($groupedAcademicYears);
    
        return response()->json($groupedAcademicYears);
    }
    
    
    public function setActiveAcademicYearAndSemester(Request $request)
    {
        $academicYearId = $request->input('academic_year_id');
        $semesterId = $request->input('semester_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
    
        // Validate the incoming request
        $request->validate([
            'academic_year_id' => 'required|integer|exists:academic_years,academic_year_id',
            'semester_id' => 'required|integer|exists:semesters,semester_id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);
    
        // Deactivate all current active semesters
        ActiveSemester::query()->update(['is_active' => 0]);
    
        // Deactivate all academic years
        DB::table('academic_years')->update(['is_active' => 0]);
    
        // Update the given academic year and semester to active in ActiveSemester
        ActiveSemester::where('academic_year_id', $academicYearId)
            ->where('semester_id', $semesterId)
            ->update([
                'is_active' => 1,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]);
    
        // Activate the selected academic year
        DB::table('academic_years')
            ->where('academic_year_id', $academicYearId)
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
            ->join('sections_per_program_year as sp', function ($join) {
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
            $programIndex = array_search($row->program_id, array_column($response, 'program_id'));

            if ($programIndex === false) {
                $response[] = [
                    'program_id' => $row->program_id,
                    'program_code' => $row->program_code,
                    'program_title' => $row->program_title,
                    'year_level_count' => 0,
                    'year_levels' => []
                ];
                $programIndex = count($response) - 1;
            }

            // Check if year level already exists under the program
            $yearLevelIndex = array_search($row->year_level, array_column($response[$programIndex]['year_levels'], 'year_level'));

            if ($yearLevelIndex === false) {
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

    public function getAssignedCoursesBySem()
    {
        $activeSemester = DB::table('active_semesters')
            ->where('is_active', 1)
            ->first();
    
        if (!$activeSemester) {
            return response()->json(['error' => 'No active semester found'], 404);
        }
    
        // Fetch courses for each program and year level matching the curriculum_id in the current academic year
        $assignedCourses = DB::table('program_year_level_curricula as pylc')
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
                'co.course_id',
                'co.course_code',
                'co.course_title',
                'co.lec_hours',       
                'co.lab_hours',     
                'co.units',       
                'co.tuition_hours'   
            )
            ->join('programs as p', 'pylc.program_id', '=', 'p.program_id')
            ->join('curricula as c', 'pylc.curriculum_id', '=', 'c.curriculum_id')
            ->join('academic_years as ay', 'pylc.academic_year_id', '=', 'ay.academic_year_id')
            ->join('curricula_program as cp', function ($join) {
                $join->on('pylc.program_id', '=', 'cp.program_id')
                    ->on('pylc.curriculum_id', '=', 'cp.curriculum_id');
            })
            ->leftJoin('year_levels as yl', function ($join) {
                $join->on('cp.curricula_program_id', '=', 'yl.curricula_program_id')
                    ->on('pylc.year_level', '=', 'yl.year');
            })
            ->leftJoin('semesters as s', function ($join) use ($activeSemester) {
                $join->on('yl.year_level_id', '=', 's.year_level_id')
                    ->where('s.semester', $activeSemester->semester_id);
            })
            ->leftJoin('course_assignments as ca', function ($join) {
                $join->on('ca.semester_id', '=', 's.semester_id')
                    ->on('ca.curricula_program_id', '=', 'cp.curricula_program_id');
            })
            ->leftJoin('courses as co', 'ca.course_id', '=', 'co.course_id')
            ->where('pylc.academic_year_id', $activeSemester->academic_year_id) // Match the active academic year
            ->orderBy('p.program_id')
            ->orderBy('pylc.year_level')
            ->orderBy('s.semester')
            ->get();
    
        // Response structure
        $response = [
            'active_semester_id' => $activeSemester->active_semester_id,
            'academic_year_id'   => $activeSemester->academic_year_id,
            'semester_id'        => $activeSemester->semester_id,
            'programs'           => []
        ];
    
        // Build the response based on fetched data
        foreach ($assignedCourses as $row) {
            $programIndex = array_search($row->program_id, array_column($response['programs'], 'program_id'));
    
            if ($programIndex === false) {
                $response['programs'][] = [
                    'program_id' => $row->program_id,
                    'program_code' => $row->program_code,
                    'program_title' => $row->program_title,
                    'year_levels' => []
                ];
                $programIndex = count($response['programs']) - 1;
            }
    
            // Group by year_level and curriculum_id
            $yearLevelIndex = false;
            foreach ($response['programs'][$programIndex]['year_levels'] as $index => $yearLevel) {
                if ($yearLevel['year_level'] == $row->year_level && $yearLevel['curriculum_id'] == $row->curriculum_id) {
                    $yearLevelIndex = $index;
                    break;
                }
            }
    
            if ($yearLevelIndex === false) {
                $response['programs'][$programIndex]['year_levels'][] = [
                    'year_level' => $row->year_level,
                    'curriculum_id' => $row->curriculum_id,
                    'curriculum_year' => $row->curriculum_year,
                    'semester' => [
                        'semester' => $activeSemester->semester_id,
                        'courses' => []
                    ]
                ];
                $yearLevelIndex = count($response['programs'][$programIndex]['year_levels']) - 1;
            }
    
            // Add the courses for the corresponding curriculum
            if ($row->course_id !== null) {
                $response['programs'][$programIndex]['year_levels'][$yearLevelIndex]['semester']['courses'][] = [
                    'course_id' => $row->course_id,
                    'course_code' => $row->course_code,
                    'course_title' => $row->course_title,
                    'lec_hours' => $row->lec_hours,     
                    'lab_hours' => $row->lab_hours,    
                    'units' => $row->units,            
                    'tuition_hours' => $row->tuition_hours
                ];
            }
        }
    
        return response()->json($response);
    }
    


    public function getAssignedCourses()
    {
        $assignedCourses = DB::table('curricula as c')
            ->select(
                'p.program_id',
                'p.program_code',
                'p.program_title',
                'cp.curricula_program_id',
                'c.curriculum_id',
                'c.curriculum_year',
                'yl.year_level_id',
                'yl.year as year_level',
                's.semester_id',
                's.semester',
                'ca.course_assignment_id',
                'co.course_id',
                'co.course_code',
                'co.course_title',
                'co.lec_hours',
                'co.lab_hours',
                'co.units',
                'co.tuition_hours'
            )
            ->join('curricula_program as cp', 'c.curriculum_id', '=', 'cp.curriculum_id')
            ->join('programs as p', 'cp.program_id', '=', 'p.program_id')
            ->join('year_levels as yl', 'cp.curricula_program_id', '=', 'yl.curricula_program_id')
            ->join('semesters as s', 'yl.year_level_id', '=', 's.year_level_id')
            ->leftJoin('course_assignments as ca', function ($join) {
                $join->on('ca.curricula_program_id', '=', 'cp.curricula_program_id')
                    ->on('ca.semester_id', '=', 's.semester_id');
            })
            ->leftJoin('courses as co', 'ca.course_id', '=', 'co.course_id')
            ->orderBy('p.program_id')
            ->orderBy('yl.year')
            ->orderBy('s.semester')
            ->get();

        $response = [];

        foreach ($assignedCourses as $row) {
            $programIndex = $this->findOrCreateProgram($response, $row);
            $yearLevelIndex = $this->findOrCreateYearLevel($response[$programIndex]['year_levels'], $row);
            $semesterIndex = $this->findOrCreateSemester($response[$programIndex]['year_levels'][$yearLevelIndex]['semesters'], $row);

            if ($row->course_id !== null) {
                $this->addCourse($response[$programIndex]['year_levels'][$yearLevelIndex]['semesters'][$semesterIndex]['courses'], $row);
            }
        }

        return response()->json($response);
    }


    //HELPER FUNCTIONS
    private function findOrCreateProgram(&$response, $row)
    {
        $programIndex = array_search($row->program_id, array_column($response, 'program_id'));

        if ($programIndex === false) {
            $response[] = [
                'program_id' => $row->program_id,
                'program_code' => $row->program_code,
                'program_title' => $row->program_title,
                'year_levels' => []
            ];
            return count($response) - 1;
        }

        return $programIndex;
    }

    private function findOrCreateYearLevel(&$yearLevels, $row)
    {
        foreach ($yearLevels as $index => $yearLevel) {
            if ($yearLevel['year_level'] == $row->year_level && $yearLevel['curriculum_id'] == $row->curriculum_id) {
                return $index;
            }
        }

        $yearLevels[] = [
            'year_level' => $row->year_level,
            'curriculum_id' => $row->curriculum_id,
            'curriculum_year' => $row->curriculum_year,
            'semesters' => []
        ];
        return count($yearLevels) - 1;
    }

    private function findOrCreateSemester(&$semesters, $row)
    {
        foreach ($semesters as $index => $semester) {
            if ($semester['semester'] == $row->semester) {
                return $index;
            }
        }

        $semesters[] = [
            'semester' => $row->semester,
            'courses' => []
        ];
        return count($semesters) - 1;
    }

    private function addCourse(&$courses, $row)
    {
        $courses[] = [
            'course_assignment_id' => $row->course_assignment_id,
            'course_id' => $row->course_id,
            'course_code' => $row->course_code,
            'course_title' => $row->course_title,
            'lec_hours' => $row->lec_hours,
            'lab_hours' => $row->lab_hours,
            'units' => $row->units,
            'tuition_hours' => $row->tuition_hours
        ];
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
            $activeCurricula = Curriculum::where('status', 'active')->orderBy('curriculum_year', 'asc')->get(); // Fetch active curricula sorted by year

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

            // Fetch all active programs
            $activePrograms = Program::where('status', 'active')->get();

            foreach ($activePrograms as $program) {
                // Fetch the number of years dynamically for each program
                $numberOfYears = $program->number_of_years;

                // Generate year levels based on the number of years for each program
                for ($yearLevel = 1; $yearLevel <= $numberOfYears; $yearLevel++) {
                    // Determine the curriculum_id based on year level

                    // Assign the curriculum dynamically based on the current year level and the available curricula
                    $curriculumId = null;
                    if ($yearLevel <= $activeCurricula->count()) {
                        // Assign curriculum in sequence based on the year level
                        $curriculumId = $activeCurricula[$yearLevel - 1]->curriculum_id;
                    } else {
                        // If the year level exceeds the available curricula, use the latest curriculum
                        $curriculumId = $activeCurricula->last()->curriculum_id;
                    }

                    // Insert into the program_year_level_curricula table
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
                // Fetch the number of years dynamically for each program
                $numberOfYears = $program->number_of_years;

                // Generate "Section 1" for all year levels in each program
                for ($yearLevel = 1; $yearLevel <= $numberOfYears; $yearLevel++) {
                    $section = new SectionsPerProgramYear();
                    $section->academic_year_id = $newAcademicYearId;
                    $section->program_id = $program->program_id;
                    $section->year_level = $yearLevel;
                    $section->section_name = '1'; // Always use "Section 1"
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
                $yearLevels = ProgramYearLevelCurricula::select(
                    'program_year_level_curricula.year_level',
                    'program_year_level_curricula.curriculum_id',
                    'curricula.curriculum_year'
                )
                    ->join('curricula', 'program_year_level_curricula.curriculum_id', '=', 'curricula.curriculum_id') // Join with curricula table to get curriculum_year
                    ->where('program_year_level_curricula.academic_year_id', $academicYearId)
                    ->where('program_year_level_curricula.program_id', $program->program_id)
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

    public function getActiveYearAndSemester()
    {
        $activeSemester = DB::table('active_semesters')
            ->join('academic_years', 'active_semesters.academic_year_id', '=', 'academic_years.academic_year_id')
            ->join('semesters', 'active_semesters.semester_id', '=', 'semesters.semester_id')
            ->where('active_semesters.is_active', 1)
            ->select(
                DB::raw("CONCAT(academic_years.year_start, '-', academic_years.year_end) as academic_year"),
                'semesters.semester as semester_number',
                'active_semesters.start_date',
                'active_semesters.end_date'
            )
            ->first();
    
        if ($activeSemester) {
            return response()->json([
                'activeYear' => $activeSemester->academic_year,
                'activeSemester' => $activeSemester->semester_number,
                'startDate' => $activeSemester->start_date,
                'endDate' => $activeSemester->end_date
            ]);
        }
    
        return response()->json(['message' => 'No active academic year and semester found'], 404);
    }
}