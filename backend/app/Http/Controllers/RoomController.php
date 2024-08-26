<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Room;

class RoomController extends Controller
{
    // Fetch all rooms
    public function index()
    {
        $rooms = Room::all();
        return response()->json($rooms);
    }

    // Add new room
    public function addRoom(Request $request)
    {
        // Validate the incoming request data
        $validated = $request->validate([
            'room_code' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'floor_level' => 'required|string|max:255',
            'room_type' => 'required|string|max:255',
            'capacity' => 'required|integer',
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
            'capacity' => 'required|integer',
            'status' => 'required|string',
        ]);

        $room->update($validatedData);

        return response()->json([
            'message' => 'Room updated successfully',
            'room' => $room
        ], 200);
    }

    // Delete a room
    public function deleteRoom($id)
    {
        $room = Room::findOrFail($id);
        $room->delete();

        return response()->json([
            'message' => 'Room deleted successfully'
        ], 200);
    }
}
