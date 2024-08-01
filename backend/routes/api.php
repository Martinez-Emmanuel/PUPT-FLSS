<?php

use App\Http\Controllers\FacultyController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
// Route to get authenticated user information
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// // Login route
// Route::post('login', [AuthController::class, 'login'])->name('login');

// // Logout route protected by sanctum auth middleware
// Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
// Login route
Route::post('login', [AuthController::class, 'login'])->name('login');

// Logout route protected by sanctum auth middleware
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum')->name('logout');