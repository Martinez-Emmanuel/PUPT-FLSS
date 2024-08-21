<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\CourseRequirement;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{

    public function index()
    {
        $courses = Course::with('requirements')->get(); // Eager load requirements
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
                'semester_id' => 'nullable|integer',
                'tuition_hours' => 'required|integer',
                'requirements' => 'array',
                'requirements.*.requirement_type' => 'required|in:pre,co',
                'requirements.*.required_course_id' => 'required|integer|exists:courses,course_id',
            ]);

            // Create the course
            $course = Course::create($validatedData);

            // Handle course requirements if any
            if (isset($validatedData['requirements'])) {
                foreach ($validatedData['requirements'] as $requirement) {
                    CourseRequirement::create([
                        'course_id' => $course->course_id,
                        'requirement_type' => $requirement['requirement_type'],
                        'required_course_id' => $requirement['required_course_id'],
                    ]);
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
                'semester_id' => 'nullable|integer',
                'tuition_hours' => 'required|integer',
                'requirements' => 'array',
                'requirements.*.requirement_type' => 'required|in:pre,co',
                'requirements.*.required_course_id' => 'required|integer|exists:courses,course_id',
            ]);
    
            // Update the course
            $course->update($validatedData);
    
            // Handle course requirements
            if (isset($validatedData['requirements'])) {
                // Delete existing requirements
                CourseRequirement::where('course_id', $course->course_id)->delete();
    
                // Add new requirements
                foreach ($validatedData['requirements'] as $requirement) {
                    CourseRequirement::create([
                        'course_id' => $course->course_id,
                        'requirement_type' => $requirement['requirement_type'],
                        'required_course_id' => $requirement['required_course_id'],
                    ]);
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
