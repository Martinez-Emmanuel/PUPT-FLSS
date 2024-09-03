<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\PreferenceController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\RoomController;
use Illuminate\Http\Request;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\YearLevelController;
use App\Http\Controllers\CurriculumDetailsController;
use App\Http\Controllers\ProgramFetchController;
use App\Http\Controllers\AccountController;
// Public routes
Route::post('login', [AuthController::class, 'login'])->name('login');
Route::post('faculties/send-emails', [FacultyController::class, 'sendEmails']);


//Get all Program and Year Level and Semester with year for superadmin
Route::get('/curricula-details/{curriculumYear}/', [CurriculumDetailsController::class, 'getCurriculumDetails']);

//Get all courses for filteration
Route::post('/curriculum/', [ProgramFetchController::class, 'getCoursesForProgram']);
Route::get('/curriculum/', [ProgramFetchController::class, 'getAllActivePrograms']);


//Add Curriculum that add all the program and year level and semester
Route::post('/addCurriculum', [CurriculumController::class, 'addCurriculum']);
Route::post('/deleteCurriculum', [CurriculumController::class, 'deleteCurriculum']);
Route::post('/copyCurriculum', [CurriculumController::class, 'copyCurriculum']);
Route::put('/updateCurriculum/{id}', [CurriculumController::class, 'update']);



// Course routes
Route::get('/courses', [CourseController::class, 'index']);
Route::post('/addCourse', [CourseController::class, 'addCourse']);
Route::put('/courses/{id}', [CourseController::class, 'updateCourse']);
Route::delete('/courses/{id}', [CourseController::class, 'deleteCourse']);

// Curriculum routes
Route::get('/curricula', [CurriculumController::class, 'index']);
Route::get('/curricula/{id}', [CurriculumController::class, 'show']);

//old delete remove this
// Route::delete('/deleteCurriculum/{id}', [CurriculumController::class, 'destroy']);

// Semester routes
Route::get('/semesters', [SemesterController::class, 'index']);
Route::post('/addSemester', [SemesterController::class, 'store']);
Route::get('/semesters/{id}', [SemesterController::class, 'show']);
Route::put('/updateSemester/{id}', [SemesterController::class, 'update']);
Route::delete('/deleteSemester/{id}', [SemesterController::class, 'destroy']);

// Year Level routes
Route::get('/year_levels', [YearLevelController::class, 'index']);
Route::post('/addYearLevel', [YearLevelController::class, 'store']);
Route::get('/year_levels/{id}', [YearLevelController::class, 'show']);
Route::put('/updateYearLevel/{id}', [YearLevelController::class, 'update']);
Route::delete('/deleteYearLevel/{id}', [YearLevelController::class, 'destroy']);

// Program routes
Route::get('/programs', [ProgramController::class, 'index']);
Route::post('/addProgram', [ProgramController::class, 'store']);
Route::get('/programs/{id}', [ProgramController::class, 'show']);
Route::put('/updateProgram/{id}', [ProgramController::class, 'update']);
Route::delete('/deleteProgram/{id}', [ProgramController::class, 'destroy']);


Route::middleware(['auth:sanctum', 'super_admin'])->group(function () {
    Route::get('/showAccounts', [AccountController::class, 'index']);
    Route::post('/addAccount', [AccountController::class, 'store']);
    Route::get('/accounts/{user}', [AccountController::class, 'show']);
    Route::put('/updateAccount/{user}', [AccountController::class, 'update']);
    Route::delete('/deleteAccount/{user}', [AccountController::class, 'destroy']);
});

Route::post('/submitPreference', [PreferenceController::class, 'submitPreference']);
// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');

    // Preference API

    // Route::get('/submittedPreferences', [PreferenceController::class, 'getAllSubmittedPreferences']);
    Route::get('/submittedPreferences', [PreferenceController::class, 'getAllSubmittedPreferences']);
    // Email API
    // Route::post('faculties/send-emails', [FacultyController::class, 'sendEmails']);

    // CRUD for rooms
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::post('/addRoom', [RoomController::class, 'addRoom']);
    Route::put('/rooms/{room_id}', [RoomController::class, 'updateRoom']);
    Route::delete('/rooms/{room_id}', [RoomController::class, 'deleteRoom']);

    // CRUD for Courses



    Route::get('/some-protected-route', function (Request $request) {
        return response()->json(['message' => 'You are authenticated']);
    });
});
