<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\PreferenceController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\RoomController;
use Illuminate\Http\Request;
// Public routes
Route::post('login', [AuthController::class, 'login'])->name('login');
Route::post('faculties/send-emails', [FacultyController::class, 'sendEmails']);
// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');

    // Courses routes
    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/addCourse', [CourseController::class, 'addCourse']);
    Route::put('/courses/{id}', [CourseController::class, 'updateCourse']);
    Route::delete('/courses/{id}', [CourseController::class, 'deleteCourse']);

    // Preference API
    Route::post('/submitPreference', [PreferenceController::class, 'submitPreference']);
    // Route::get('/submittedPreferences', [PreferenceController::class, 'getAllSubmittedPreferences']);
    Route::get('/submittedPreferences', [PreferenceController::class, 'getAllSubmittedPreferences']);
    // Email API
    // Route::post('faculties/send-emails', [FacultyController::class, 'sendEmails']);

    // CRUD for rooms
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::post('/addRoom', [RoomController::class, 'addRoom']);
    Route::put('/rooms/{room_id}', [RoomController::class, 'updateRoom']);
    Route::delete('/rooms/{room_id}', [RoomController::class, 'deleteRoom']);

    Route::get('/some-protected-route', function (Request $request) {
        return response()->json(['message' => 'You are authenticated']);
    });
});
