<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\PreferenceController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\RoomController;

// Route::get('/rooms', [RoomController::class, 'index']);
// Route::post('/addRoom', [RoomController::class, 'addRoom']);
// Route::put('/rooms/{room_id}', [RoomController::class, 'updateRoom']);
// Route::delete('/rooms/{room_id}', [RoomController::class, 'deleteRoom']);

Route::post('login', [AuthController::class, 'login'])->name('login');

// Courses routes
Route::get('/courses', [CourseController::class, 'index']);
Route::post('/addCourse', [CourseController::class, 'addCourse']);
Route::put('/courses/{id}', [CourseController::class, 'updateCourse']);
Route::delete('/courses/{id}', [CourseController::class, 'deleteCourse']);

Route::middleware('auth:sanctum')->group(function () {
    // Auth routes

    Route::post('logout', [AuthController::class, 'logout'])->name('logout');

    //Preference Api
    Route::post('/submitPreference', [PreferenceController::class, 'submitPreference']);
    Route::get('/submittedPreferences', [PreferenceController::class, 'getAllSubmittedPreferences']);

    // Email Api
    Route::post('faculties/send-emails', [FacultyController::class, 'sendEmails']);

    // CRUD for courses
    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/addCourse', [CourseController::class, 'addCourse']);
    Route::put('/courses/{id}', [CourseController::class, 'updateCourse']);
    Route::delete('/courses/{id}', [CourseController::class, 'deleteCourse']);

    //CRUD for rooms
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::post('/addRoom', [RoomController::class, 'addRoom']);
    Route::put('/rooms/{room_id}', [RoomController::class, 'updateRoom']);
    Route::delete('/rooms/{room_id}', [RoomController::class, 'deleteRoom']);


    Route::get('/some-protected-route', function (Request $request) {
        return response()->json(['message' => 'You are authenticated']);
    });
});
