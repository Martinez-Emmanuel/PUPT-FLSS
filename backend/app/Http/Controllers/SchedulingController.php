<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faculty;
use App\Models\Schedule; // Ensure Schedule model is imported
use Illuminate\Support\Facades\Validator; // Import Validator facade
use Illuminate\Support\Facades\Log; // Import Log facade
class SchedulingController extends Controller
{
    public function getFacultyDetails()
    {

        $facultyDetails = Faculty::with('user')->get();

        $response = $facultyDetails->map(function ($faculty) {
            return [
                'user_id' => $faculty->user->id ?? 'N/A',
                'name' => $faculty->user->name ?? 'N/A',
                'code' => $faculty->user->code ?? 'N/A',
                'email' => $faculty->faculty_email ?? 'N/A',
                'role' => $faculty->user->role ?? 'N/A',
                'faculty_type' => $faculty->faculty_type ?? 'N/A',
                'faculty_units' => $faculty->faculty_unit ?? 'N/A',
            ];
        });

        return response()->json(['faculty' => $response], 200);
    }

    public function assignSchedule(Request $request)
    {
        // Step 1: Validate the incoming request data, including the schedule_id in the request body
        $validator = Validator::make($request->all(), [
            'schedule_id'  => 'required|exists:schedules,schedule_id',
            'faculty_id'   => 'required|exists:faculty,id',
            'room_id'      => 'required|exists:rooms,room_id',
            'day'          => 'required|string|max:10', // Adjust max length as needed
            'start_time'   => 'required|date_format:H:i:s',
            'end_time'     => 'required|date_format:H:i:s|after:start_time',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors'  => $validator->errors()
            ], 422);
        }
    
        // Step 2: Retrieve the schedule using the schedule_id from the request
        $schedule = Schedule::find($request->input('schedule_id'));
    
        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found'], 404);
        }
    
        // Step 3: Assign the validated data to the schedule
        try {
            $schedule->faculty_id  = $request->input('faculty_id');
            $schedule->room_id     = $request->input('room_id');
            $schedule->day         = $request->input('day');
            $schedule->start_time  = $request->input('start_time');
            $schedule->end_time    = $request->input('end_time');
            $schedule->save();
    
            Log::info("Schedule ID {$request->input('schedule_id')} updated successfully.");
    
            // Optionally, load related faculty and room details
            $schedule->load(['faculty.user', 'room']);
    
            // Prepare the response data
            $responseData = [
                'message' => 'Schedule updated successfully',
                'schedule_id' => $schedule->schedule_id,
                'schedule_details' => [
                    'schedule_id'    => $schedule->schedule_id,
                    'section_course_id' => $schedule->section_course_id,
                    'day'            => $schedule->day,
                    'start_time'     => $schedule->start_time,
                    'end_time'       => $schedule->end_time,
                    'faculty'        => $schedule->faculty ? [
                        'faculty_id'     => $schedule->faculty->id,
                        'name'           => $schedule->faculty->user->name,
                        'email'          => $schedule->faculty->faculty_email,
                    ] : null,
                    'room'           => $schedule->room ? [
                        'room_id'        => $schedule->room->room_id,
                        'room_code'      => $schedule->room->room_code,
                    ] : null,
                    'created_at'     => $schedule->created_at,
                    'updated_at'     => $schedule->updated_at,
                ],
            ];
    
            return response()->json($responseData, 200);
        } catch (\Exception $e) {
            Log::error("Error updating schedule ID {$request->input('schedule_id')}: " . $e->getMessage());
    
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }
    
}

