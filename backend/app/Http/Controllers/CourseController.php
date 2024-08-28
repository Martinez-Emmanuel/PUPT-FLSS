<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\CourseRequirement;
use App\Models\CourseAssignment;
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
                'course_code' => 'required|string|unique:courses',
                'course_title' => 'required|string',
                'lec_hours' => 'required|integer',
                'lab_hours' => 'required|integer',
                'units' => 'required|integer',
                'tuition_hours' => 'required|integer',
                'semester_id' => 'nullable|integer|exists:semesters,semester_id',
                'curricula_program_id' => 'nullable|integer|exists:curricula_program,curricula_program_id',
                'requirements' => 'array',
                'requirements.*.requirement_type' => 'nullable|in:pre,co',
                'requirements.*.required_course_id' => 'nullable|integer|exists:courses,course_id',
            ]);
    
            // Extract fields for Course creation
            $courseData = $request->only([
                'course_code', 'course_title', 'lec_hours', 'lab_hours', 'units', 'tuition_hours'
            ]);
    
            // Create the course
            $course = Course::create($courseData);
    
            // Handle course assignments if a semester and curricula_program_id are provided
            if (!empty($validatedData['semester_id']) && !empty($validatedData['curricula_program_id'])) {
                CourseAssignment::create([
                    'curricula_program_id' => $validatedData['curricula_program_id'],
                    'semester_id' => $validatedData['semester_id'],
                    'course_id' => $course->course_id,
                ]);
            }
    
            // Handle course requirements if any
            if (isset($validatedData['requirements'])) {
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
                'message' => 'Course added successfully',
                'course' => $course
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
            $course = Course::findOrFail($id);
    
            $validatedData = $request->validate([
                'course_code' => 'required|string|unique:courses,course_code,' . $course->course_id . ',course_id',
                'course_title' => 'required|string',
                'lec_hours' => 'required|integer',
                'lab_hours' => 'required|integer',
                'units' => 'required|integer',
                'tuition_hours' => 'required|integer',
                'semester_id' => 'nullable|integer|exists:semesters,semester_id',
                'curricula_program_id' => 'nullable|integer|exists:curricula_program,curricula_program_id',  // Updated to use exists on curricula_program
                'requirements' => 'array',
                'requirements.*.requirement_type' => 'nullable|in:pre,co',
                'requirements.*.required_course_id' => 'nullable|integer|exists:courses,course_id',
            ]);
    
            // Update the course
            $course->update($validatedData);
    
            // Handle course assignments
            if (!empty($validatedData['semester_id']) && !empty($validatedData['curricula_program_id'])) {
                // Delete existing assignment
                CourseAssignment::where('course_id', $course->course_id)->delete();
    
                // Add new assignment
                CourseAssignment::create([
                    'curricula_program_id' => $validatedData['curricula_program_id'],  // Updated to use curricula_program_id
                    'semester_id' => $validatedData['semester_id'],
                    'course_id' => $course->course_id,
                ]);
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
                'course' => $course
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
                'message' => 'Course deleted successfully'
            ], 200);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete course', 'error' => $e->getMessage()], 500);
        }
    }
    
}
