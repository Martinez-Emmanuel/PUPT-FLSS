<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\PreferenceController;
Route::post('login', [AuthController::class, 'login'])->name('login');
Route::get('/submittedPreferences', [PreferenceController::class, 'getAllSubmittedPreferences']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/addCourse', [CourseController::class, 'addCourse']);
    Route::get('/some-protected-route', function (Request $request) {
        return response()->json(['message' => 'You are authenticated']);
    });
    Route::post('/submitPreference', [PreferenceController::class, 'submitPreference']);
});