<?php

namespace App\Http\Controllers;

use App\Models\Building;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BuildingController extends Controller
{
    public function index()
    {
        $buildings = Building::all();
        return response()->json($buildings);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'building_name' => 'required|string|max:191',
            'floor_levels' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $building = Building::create($request->all());
        return response()->json($building, 201);
    }

    public function show($id)
    {
        $building = Building::findOrFail($id);
        return response()->json($building);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'building_name' => 'required|string|max:191',
            'floor_levels' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $building = Building::findOrFail($id);
        $newFloorLevels = $request->input('floor_levels');

        if ($newFloorLevels < $building->floor_levels) {
            $rooms = $building->rooms()->get();

            foreach ($rooms as $room) {
                $floorNumber = intval($room->floor_level);

                if ($floorNumber > $newFloorLevels) {
                    return response()->json([
                        'message' => "Cannot reduce floor levels. Room {$room->room_code} is on {$room->floor_level} floor.",
                        'success' => false,
                    ], 400);
                }
            }
        }

        $building->update($request->all());
        return response()->json([
            'message' => 'Building updated successfully.',
            'success' => true,
            'data' => $building,
        ], 200);
    }

    public function destroy($id)
    {
        $building = Building::findOrFail($id);

        if ($building->rooms()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete building because it has associated rooms.',
                'success' => false,
            ], 400);
        }

        $building->delete();
        return response()->json([
            'message' => 'Building deleted successfully.',
            'success' => true,
        ], 200);
    }
}
