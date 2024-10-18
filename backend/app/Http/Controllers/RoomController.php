<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\Schedule;

class RoomController extends Controller
{
    // Fetch all rooms
    public function getRooms()
    {
        $rooms = Room::all();
        return response()->json([
            'success' => true,
            'message' => 'Rooms fetched successfully.',
            'data' => $rooms
        ], 200);
    }

    // Get all rooms (with a wrapper)
    public function getAllRooms()
    {
        $rooms = Room::all();

        $response = $rooms->map(function ($room) {
            return [
                'room_id' => $room->room_id,
                'room_code' => $room->room_code,
                'location' => $room->location,
                'floor_level' => $room->floor_level,
                'room_type' => $room->room_type,
                'capacity' => $room->capacity,
                'status' => $room->status,
            ];
        });

        return response()->json(['rooms' => $response], 200);
    }

    // Add new room
    public function addRoom(Request $request)
    {
        // Validate the incoming request data
        $validated = $request->validate([
            'room_code' => 'required|string|max:255|unique:rooms,room_code',
            'location' => 'required|string|max:255',
            'floor_level' => 'required|string|max:255',
            'room_type' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1|max:999',
            'status' => 'required|string|max:255',
        ]);

        // Create a new room
        $room = Room::create([
            'room_code' => $validated['room_code'],
            'location' => $validated['location'],
            'floor_level' => $validated['floor_level'],
            'room_type' => $validated['room_type'],
            'capacity' => $validated['capacity'],
            'status' => $validated['status'],
        ]);

        // Return a JSON response
        return response()->json([
            'success' => true,
            'message' => 'Room created successfully!',
            'data' => $room
        ], 201);
    }

    // Update an existing room
    public function updateRoom(Request $request, $id)
    {
        $room = Room::findOrFail($id);

        $validatedData = $request->validate([
            'room_code' => 'required|string|unique:rooms,room_code,' . $room->room_id . ',room_id',
            'location' => 'required|string',
            'floor_level' => 'required|string',
            'room_type' => 'required|string',
            'capacity' => 'required|integer|min:1|max:999',
            'status' => 'required|string',
        ]);

        $room->update($validatedData);

        return response()->json([
            'success' => true,
            'message' => 'Room updated successfully!',
            'data' => $room
        ], 200);
    }

    // Delete a room
    public function deleteRoom($id)
    {
        $room = Room::findOrFail($id);
    
        // Check if the room is used in scheduling
        $schedulesCount = Schedule::where('room_id', $room->room_id)->count();
        if ($schedulesCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Room with assigned schedules cannot be deleted.',
            ], 400);
        }
    
        // Proceed with deletion if room is not used in any schedule
        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Room deleted successfully!'
        ], 200);
    }
}
