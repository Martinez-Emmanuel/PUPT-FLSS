<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FacultyController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});
Route::get('/test-email', [FacultyController::class, 'testEmail']);
// routes/web.php
Route::get('/test-preferences-submitted', function () {
    $data = [
        'faculty_name' => 'Juan Dela Cruz',
    ];

    return view('emails.preferences_submitted', $data);
});
