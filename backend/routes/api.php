<?php

use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\CurriculumDetailsController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\PreferenceController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\ProgramFetchController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SchedulingController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\YearLevelController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('login', [AuthController::class, 'login'])->name('login');

//Academic Year Routes
Route::get('/get-academic-years', [AcademicYearController::class, 'getAcademicYearsForDropdown']);
Route::post('/set-active-ay-sem', [AcademicYearController::class, 'setActiveAcademicYearAndSemester']);
Route::get('/active-year-levels-curricula', [AcademicYearController::class, 'getActiveYearLevelsCurricula']);
Route::post('/fetch-ay-prog-details', [AcademicYearController::class, 'fetchProgramDetailsByAcademicYear']);
Route::post('/add-academic-year', [AcademicYearController::class, 'addAcademicYear']);
Route::post('/update-yr-lvl-curricula', [AcademicYearController::class, 'updateYearLevelCurricula']);
Route::post('/update-sections', [AcademicYearController::class, 'updateSections']);
Route::delete('/remove-program', [AcademicYearController::class, 'removeProgramFromAcademicYear']);
Route::delete('/delete-ay', [AcademicYearController::class, 'deleteAcademicYear']);
Route::get('/active-year-semester', [AcademicYearController::class, 'getActiveYearAndSemester']);

//Admin side routes
Route::get('/get-assigned-courses', [AcademicYearController::class, 'getAssignedCourses']);
Route::get('/get-assigned-courses-sem', [AcademicYearController::class, 'getAssignedCoursesBySem']);
Route::get('/populate-schedules', [ScheduleController::class, 'populateSchedules']);
Route::post('/assign-schedule', [ScheduleController::class, 'assignSchedule']);
Route::get('/get-faculty', [FacultyController::class, 'getFacultyDetails']);
Route::get('/get-rooms', [RoomController::class, 'getAllRooms']);

//Email routes for scheduling
Route::post('/email-pref-enable', [FacultyController::class, 'emailPrefEnable']); // Send preferences-enabled email
Route::post('/email-pref-submitted', [FacultyController::class, 'emailPrefSubmitted']); // Send preferences submitted email
Route::post('/email-single-schedule', [FacultyController::class, 'emailSingleSchedule']); // Send schedule for individual faculty
Route::post('/email-all-schedule', [FacultyController::class, 'emailAllSchedule']); // Send schedule to all faculty

// Scheduling Reports Routes
Route::get('/faculty-schedules-report', [ReportsController::class, 'getFacultySchedulesReport']);
Route::get('/room-schedules-report', [ReportsController::class, 'getRoomSchedulesReport']);
Route::get('/program-schedules-report', [ReportsController::class, 'getProgramSchedulesReport']);
Route::get('/single-faculty-schedule/{faculty_id}', [ReportsController::class, 'getSingleFacultySchedule']);
Route::post('/toggle-all-schedule', [ReportsController::class, 'toggleAllSchedules']);
Route::post('/toggle-single-schedule', [ReportsController::class, 'toggleSingleSchedule']);
Route::get('/overview-details', [ReportsController::class, 'getOverviewDetails']);

//Scheduling routes
Route::post('/submit-preferences', [PreferenceController::class, 'submitPreferences']);
Route::get('/view-preferences', [PreferenceController::class, 'getPreferencesForActiveSemester']);
Route::delete('/preferences/{preference_id}', [PreferenceController::class, 'deletePreference']);
Route::delete('/preferences', [PreferenceController::class, 'deleteAllPreferences']);

//Scheduling toggle preferences
Route::get('/setting-preferences', [PreferenceController::class, 'getPreferencesSetting']);
Route::post('/toggle-preferences-all', [PreferenceController::class, 'togglePreferencesSettings']);
Route::post('/toggle-preferences-single', [PreferenceController::class, 'toggleSpecificFacultyPreferences']);
// Route::get('/submitted-pref', [PreferenceController::class, 'getPreferences']);
// Route::post('/pref-courses-sem', [PreferenceController::class, 'findFacultyByCourseCode']);

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

//Curriculum remove program and add program
Route::post('/removeProgramFromCurriculum', [CurriculumController::class, 'removeProgramFromCurriculum']);
Route::get('/programs-by-curriculum-year/{curriculumYear}', [CurriculumController::class, 'getProgramsByCurriculumYear']);
Route::post('/addProgramToCurriculum', [CurriculumController::class, 'addProgramToCurriculum']);
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
Route::get('/programs', [ProgramController::class, 'getPrograms']);
Route::post('/addProgram', [ProgramController::class, 'addProgram']);
Route::get('/programs/{id}', [ProgramController::class, 'getProgramDetails']);
Route::put('/updateProgram/{id}', [ProgramController::class, 'updateProgram']);
Route::delete('/deleteProgram/{id}', [ProgramController::class, 'deleteProgram']);

// CRUD for rooms
Route::get('/rooms', [RoomController::class, 'getRooms']);
Route::post('/addRoom', [RoomController::class, 'addRoom']);
Route::put('/rooms/{room_id}', [RoomController::class, 'updateRoom']);
Route::delete('/rooms/{room_id}', [RoomController::class, 'deleteRoom']);

Route::middleware(['auth:sanctum', 'super_admin'])->group(function () {
    Route::get('/showAccounts', [AccountController::class, 'index']);
    Route::post('/addAccount', [AccountController::class, 'store']);
    Route::get('/accounts/{user}', [AccountController::class, 'show']);
    Route::put('/updateAccount/{user}', [AccountController::class, 'update']);
    Route::delete('/deleteAccount/{user}', [AccountController::class, 'destroy']);

    // Fetch all admins
    Route::get('/getAdmins', [AccountController::class, 'indexAdmins']);
    // Store a new admin
    Route::post('/addAdmins', [AccountController::class, 'storeAdmin']);
    // Update an existing admin
    Route::put('/updateAdmins/{admin}', [AccountController::class, 'updateAdmin']);
    // Delete an admin
    Route::delete('/deleteAdmins/{admin}', [AccountController::class, 'destroyAdmin']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    // Preference API
    // Route::get('/submittedPreferences', [PreferenceController::class, 'getAllSubmittedPreferences']);
    // Email API
    // Route::post('faculties/send-emails', [FacultyController::class, 'sendEmails']);
    Route::get('/some-protected-route', function (Request $request) {
        return response()->json(['message' => 'You are authenticated']);
    });
});

// Route::middleware(['auth:sanctum', 'super_admin'])->group(function () {
//     Route::get('/showAccounts', [AccountController::class, 'index']);
//     Route::post('/addAccount', [AccountController::class, 'store']);
//     Route::get('/accounts/{user}', [AccountController::class, 'show']);
//     Route::put('/updateAccount/{user}', [AccountController::class, 'update']);
//     Route::delete('/deleteAccount/{user}', [AccountController::class, 'destroy']);
// });

// Route::get('/rooms-details', [RoomController::class, 'index']);
