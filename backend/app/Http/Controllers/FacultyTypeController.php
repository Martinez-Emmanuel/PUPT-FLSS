<?php

namespace App\Http\Controllers;

use App\Models\FacultyType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FacultyTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $facultyTypes = FacultyType::all();
        return response()->json($facultyTypes);
    }

    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'faculty_type' => 'required|string|unique:faculty_type',
            'regular_units' => 'required|numeric|min:0',
            'additional_units' => 'required|numeric|min:0',
        ]);

        $facultyType = FacultyType::create($validatedData);
        return response()->json($facultyType, 201);
    }

    public function show(FacultyType $facultyType): JsonResponse
    {
        return response()->json($facultyType);
    }

    public function update(Request $request, FacultyType $facultyType): JsonResponse
    {
        $validatedData = $request->validate([
            'faculty_type' => 'required|string|unique:faculty_type,faculty_type,' . $facultyType->faculty_type_id . ',faculty_type_id',
            'regular_units' => 'required|numeric|min:0',
            'additional_units' => 'required|numeric|min:0',
        ]);

        $facultyType->update($validatedData);
        return response()->json($facultyType);
    }

    public function destroy(FacultyType $facultyType): JsonResponse
    {
        // Check if any faculty is using this type
        if ($facultyType->faculty()->exists()) {
            return response()->json([
                'message' => 'Cannot delete faculty type as it is associated with existing faculty members.',
            ], 422);
        }

        $facultyType->delete();
        return response()->json(null, 204);
    }
}
