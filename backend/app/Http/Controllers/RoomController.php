<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    // Fetch all rooms
    public function getRooms()
    {
        $rooms = Room::with('building')->get();
        return response()->json([
            'success' => true,
            'message' => 'Rooms fetched successfully.',
            'data' => $rooms,
        ], 200);
    }

    // Get all rooms (with a wrapper)
    public function getAllRooms()
    {
        $rooms = Room::with('building')->get();

        $response = $rooms->map(function ($room) {
            return [
                'room_id' => $room->room_id,
                'room_code' => $room->room_code,
                'building_name' => $room->building->building_name,
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
            'building_id' => 'required|exists:buildings,building_id',
            'floor_level' => 'required|string|max:255',
            'room_type_id' => 'required|exists:room_types,room_type_id',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|string|max:255',
        ]);

        // Create a new room
        $room = Room::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Room added successfully.',
            'data' => $room,
        ], 201);
    }

    // Update room
    public function updateRoom(Request $request, $id)
    {
        $room = Room::findOrFail($id);

        // Validate the incoming request data
        $validated = $request->validate([
            'room_code' => 'required|string|max:255|unique:rooms,room_code,' . $id . ',room_id',
            'building_id' => 'required|exists:buildings,building_id',
            'floor_level' => 'required|string|max:255',
            'room_type_id' => 'required|exists:room_types,room_type_id',
            'capacity' => 'required|integer|min:1',
            'status' => 'required|string|max:255',
        ]);

        // Update the room
        $room->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Room updated successfully.',
            'data' => $room,
        ], 200);
    }

    // Delete room
    public function deleteRoom($id)
    {
        $room = Room::findOrFail($id);

        // Check if room has any schedules
        if ($room->schedules()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete room. It has associated schedules.',
            ], 400);
        }

        // Delete the room
        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Room deleted successfully.',
        ], 200);
    }

    // Get available floor levels for a building
    public function getFloorLevels($buildingId)
    {
        $building = Building::findOrFail($buildingId);
        $floorLevels = range(1, $building->floor_levels);
        return response()->json([
            'success' => true,
            'data' => $floorLevels,
        ], 200);
    }
}
