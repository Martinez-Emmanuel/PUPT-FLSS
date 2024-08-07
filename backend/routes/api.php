<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\PreferenceController;
use App\Http\Controllers\FacultyController;
Route::post('login', [AuthController::class, 'login'])->name('login');




Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/some-protected-route', function (Request $request) {
        return response()->json(['message' => 'You are authenticated']);
    });
    Route::post('/submitPreference', [PreferenceController::class, 'submitPreference']);
    Route::get('/submittedPreferences', [PreferenceController::class, 'getAllSubmittedPreferences']);
    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/addCourse', [CourseController::class, 'addCourse']);
    Route::post('faculties/send-emails', [FacultyController::class, 'sendEmails']);
});