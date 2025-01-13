<?php

namespace App\Http\Controllers;

use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoomTypeController extends Controller
{
    public function index()
    {
        $roomTypes = RoomType::all();
        return response()->json([
            'success' => true,
            'message' => 'Room types retrieved successfully',
            'data' => $roomTypes,
        ]);
    }

    public function show($id)
    {
        $roomType = RoomType::find($id);
        if (!$roomType) {
            return response()->json([
                'success' => false,
                'message' => 'Room type not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Room type retrieved successfully',
            'data' => $roomType,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type_name' => 'required|string|max:191|unique:room_types',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $roomType = RoomType::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Room type created successfully',
            'data' => $roomType,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $roomType = RoomType::find($id);
        if (!$roomType) {
            return response()->json([
                'success' => false,
                'message' => 'Room type not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'type_name' => 'required|string|max:191|unique:room_types,type_name,' . $id . ',room_type_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $roomType->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Room type updated successfully',
            'data' => $roomType,
        ]);
    }

    public function destroy($id)
    {
        $roomType = RoomType::find($id);
        if (!$roomType) {
            return response()->json([
                'success' => false,
                'message' => 'Room type not found',
            ], 404);
        }

        if ($roomType->rooms()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete room type as it is being used by rooms.',
            ], 422);
        }

        $roomType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Room type deleted successfully',
        ]);
    }
}
