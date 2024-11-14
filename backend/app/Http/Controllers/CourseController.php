<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseAssignment;
use App\Models\CourseRequirement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    public function index()
    {
        // Eager load assignments and requirements
        $courses = Course::with(['assignments', 'requirements'])->get();
        return response()->json($courses);
    }

    public function addCourse(Request $request)
    {
        DB::beginTransaction();
    
        try {
            // Validate the incoming request data
            $validatedData = $request->validate([
                'course_code' => 'required|string',
                'course_title' => 'required|string',
                'lec_hours' => 'required|integer',
                'lab_hours' => 'required|integer',
                'units' => 'required|integer',
                'tuition_hours' => 'required|integer',
                'semester_id' => 'nullable|integer|exists:semesters,semester_id',
                'year_level_id' => 'nullable|integer|exists:year_levels,year_level_id',
                'curricula_program_id' => 'nullable|integer|exists:curricula_program,curricula_program_id',
                'requirements' => 'array',  // Expect an array of requirements
                'requirements.*.requirement_type' => 'nullable|in:pre,co',  // Pre or co-requisites
                'requirements.*.required_course_id' => 'nullable|integer|exists:courses,course_id',
            ]);
    
            // Create the new course
            $course = Course::create([
                'course_code' => $validatedData['course_code'],
                'course_title' => $validatedData['course_title'],
                'lec_hours' => $validatedData['lec_hours'],
                'lab_hours' => $validatedData['lab_hours'],
                'units' => $validatedData['units'],
                'tuition_hours' => $validatedData['tuition_hours'],
            ]);
    
            // Assign the course to a curricula program and semester if provided
            if (!empty($validatedData['semester_id']) && !empty($validatedData['curricula_program_id'])) {
                CourseAssignment::create([
                    'curricula_program_id' => $validatedData['curricula_program_id'],
                    'semester_id' => $validatedData['semester_id'],
                    'course_id' => $course->course_id,
                ]);
            }
    
            // Handle multiple requirements (pre-requisites and co-requisites)
            if (isset($validatedData['requirements']) && is_array($validatedData['requirements'])) {
                foreach ($validatedData['requirements'] as $requirement) {
                    if (!empty($requirement['requirement_type']) && !empty($requirement['required_course_id'])) {
                        CourseRequirement::create([
                            'course_id' => $course->course_id,
                            'requirement_type' => $requirement['requirement_type'],  // 'pre' or 'co'
                            'required_course_id' => $requirement['required_course_id'],
                        ]);
                    }
                }
            }
    
            DB::commit();
    
            return response()->json([
                'message' => 'Course added successfully',
                'course' => $course,
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to add course', 'error' => $e->getMessage()], 500);
        }
    }
    

    public function updateCourse(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            // Find the course by ID, or fail
            $course = Course::findOrFail($id);

            // Validate the incoming request data without the global unique check for course_code
            $validatedData = $request->validate([
                'course_code' => 'required|string',
                'course_title' => 'required|string',
                'lec_hours' => 'required|integer',
                'lab_hours' => 'required|integer',
                'units' => 'required|integer',
                'tuition_hours' => 'required|integer',
                'semester_id' => 'nullable|integer|exists:semesters,semester_id',
                'year_level_id' => 'nullable|integer|exists:year_levels,year_level_id',
                'curricula_program_id' => 'nullable|integer|exists:curricula_program,curricula_program_id',
                'requirements' => 'array',
                'requirements.*.requirement_type' => 'nullable|in:pre,co',
                'requirements.*.required_course_id' => 'nullable|integer|exists:courses,course_id',
            ]);

            // Update the course with validated data
            $course->update([
                'course_code' => $validatedData['course_code'],
                'course_title' => $validatedData['course_title'],
                'lec_hours' => $validatedData['lec_hours'],
                'lab_hours' => $validatedData['lab_hours'],
                'units' => $validatedData['units'],
                'tuition_hours' => $validatedData['tuition_hours'],
            ]);

            // Handle course assignments if a semester, year level, and curricula_program_id are provided
            if (!empty($validatedData['semester_id']) && !empty($validatedData['curricula_program_id'])) {
                // Check if the assignment should be changed (i.e., if the semester or curricula_program_id are being updated)
                $shouldUpdateAssignment = CourseAssignment::where([
                    ['course_id', '=', $course->course_id],
                    ['curricula_program_id', '=', $validatedData['curricula_program_id']],
                    ['semester_id', '=', $validatedData['semester_id']],
                ])->doesntExist();

                if ($shouldUpdateAssignment) {
                    // Delete existing assignments for the course and program in the given semester
                    CourseAssignment::where([
                        ['course_id', $course->course_id],
                        ['curricula_program_id', $validatedData['curricula_program_id']],
                        ['semester_id', $validatedData['semester_id']],
                    ])->delete();

                    // Add new assignment
                    CourseAssignment::create([
                        'curricula_program_id' => $validatedData['curricula_program_id'],
                        'semester_id' => $validatedData['semester_id'],
                        'course_id' => $course->course_id,
                    ]);
                }
            }

            // Handle course requirements
            if (isset($validatedData['requirements'])) {
                // Delete existing requirements
                CourseRequirement::where('course_id', $course->course_id)->delete();

                // Add new requirements
                foreach ($validatedData['requirements'] as $requirement) {
                    if (!empty($requirement['requirement_type']) && !empty($requirement['required_course_id'])) {
                        CourseRequirement::create([
                            'course_id' => $course->course_id,
                            'requirement_type' => $requirement['requirement_type'],
                            'required_course_id' => $requirement['required_course_id'],
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Course updated successfully',
                'course' => $course,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update course', 'error' => $e->getMessage()], 500);
        }
    }
    
    public function deleteCourse($id)
    {
        DB::beginTransaction();

        try {
            $course = Course::findOrFail($id);

            // Delete associated course assignments
            CourseAssignment::where('course_id', $course->course_id)->delete();

            // Delete associated course requirements
            CourseRequirement::where('course_id', $course->course_id)->delete();

            // Delete the course
            $course->delete();

            DB::commit();

            return response()->json([
                'message' => 'Course deleted successfully',
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete course', 'error' => $e->getMessage()], 500);
        }
    }

}
