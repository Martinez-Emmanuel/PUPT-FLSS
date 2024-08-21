<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Curriculum;

class CurriculumController extends Controller
{
    // List all curricula
    public function index()
    {
        $curricula = Curriculum::all();
        return response()->json($curricula);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'curriculum_year' => 'required|string|size:4',
            'status' => 'required|in:active,inactive',
        ]);
    
        $existingCurriculum = Curriculum::where('curriculum_year', $validatedData['curriculum_year'])->first();
    
        if ($existingCurriculum) {
            return response()->json([
                'message' => 'Curriculum for this year already exists',
                'curriculum' => $existingCurriculum
            ], 409); 
        }
    
        // Create a new curriculum if it doesn't exist
        $curriculum = Curriculum::create($validatedData);
    
        return response()->json([
            'message' => 'Curriculum created successfully',
            'curriculum' => $curriculum
        ], 201);
    }
    
    // Show a specific curriculum
    public function show($id)
    {
        $curriculum = Curriculum::findOrFail($id);
        return response()->json($curriculum);
    }

    // Update a curriculum
    public function update(Request $request, $id)
    {
        $curriculum = Curriculum::findOrFail($id);

        $validatedData = $request->validate([
            'curriculum_year' => 'required|string|size:4',
            'status' => 'required|in:active,inactive',
        ]);

        $curriculum->update($validatedData);

        return response()->json([
            'message' => 'Curriculum updated successfully',
            'curriculum' => $curriculum
        ], 200);
    }

    // Delete a curriculum
    public function destroy($id)
    {
        $curriculum = Curriculum::findOrFail($id);
        $curriculum->delete();

        return response()->json([
            'message' => 'Curriculum deleted successfully'
        ], 200);
    }
}
