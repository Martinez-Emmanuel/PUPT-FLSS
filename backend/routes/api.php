<?php

use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BuildingController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\CurriculumDetailsController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\External\v1\ExternalController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\FacultyNotificationController;
use App\Http\Controllers\FacultyTypeController;
use App\Http\Controllers\OAuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\PreferenceController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomTypeController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\YearLevelController;
use Illuminate\Support\Facades\Route;

/*
|----------------------------
| Authentication Routes
|----------------------------
 */
Route::middleware('custom.ratelimit:login')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->name('login');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

Route::post('/password/email', [PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/password/reset', [PasswordResetController::class, 'reset']);
Route::post('/password/verify-token', [PasswordResetController::class, 'verifyToken']);

/*
|-----------------------------
| Super Admin Protected Routes
|-----------------------------
 */
Route::middleware(['auth:sanctum', 'super_admin'])->group(function () {
    Route::get('/showAccounts', [AccountController::class, 'index']);
    Route::post('/addAccount', [AccountController::class, 'store']);
    Route::get('/accounts/{user}', [AccountController::class, 'show']);
    Route::put('/updateAccount/{user}', [AccountController::class, 'update']);
    Route::delete('/deleteAccount/{user}', [AccountController::class, 'destroy']);

    Route::get('/getAdmins', [AccountController::class, 'indexAdmins']);
    Route::post('/addAdmins', [AccountController::class, 'storeAdmin']);
    Route::put('/updateAdmins/{admin}', [AccountController::class, 'updateAdmin']);
    Route::delete('/deleteAdmins/{admin}', [AccountController::class, 'destroyAdmin']);
});

/*
|--------------------------
| General Protected Routes
|--------------------------
 */
Route::middleware('auth:sanctum')->group(function () {

    /**
     * Academic Year
     */
    Route::get('/get-academic-years', [AcademicYearController::class, 'getAcademicYears']);
    Route::post('/add-academic-year', [AcademicYearController::class, 'addAcademicYear']);
    Route::delete('/delete-academic-year', [AcademicYearController::class, 'deleteAcademicYear']);
    Route::get('/get-active-year-semester', [AcademicYearController::class, 'getActiveAcademicYearAndSemester']);
    Route::post('/set-active-year-semester', [AcademicYearController::class, 'setActiveAcademicYearAndSemester']);
    Route::post('/fetch-ay-prog-details', [AcademicYearController::class, 'getProgramDetailsByAcademicYear']);
    Route::get('/active-year-levels-curricula', [AcademicYearController::class, 'getActiveYearLevelsCurricula']);
    Route::post('/update-yr-lvl-curricula', [AcademicYearController::class, 'updateYearLevelCurricula']);
    Route::post('/update-sections', [AcademicYearController::class, 'updateSections']);
    Route::delete('/remove-program', [AcademicYearController::class, 'removeProgramFromAcademicYear']);
    Route::get('/offered-courses-sem', [AcademicYearController::class, 'getOfferedCoursesBySem']);

    /**
     * Admin
     */
    Route::get('/admins', [AccountController::class, 'indexAdmins']);
    Route::post('/admins', [AccountController::class, 'storeAdmin']);
    Route::put('/admins/{admin}', [AccountController::class, 'updateAdmin']);
    Route::delete('/admins/{admin}', [AccountController::class, 'destroyAdmin']);

    /**
     * Buildings
     */
    Route::apiResource('buildings', BuildingController::class);

    /**
     * Course
     */
    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/addCourse', [CourseController::class, 'addCourse']);
    Route::put('/courses/{id}', [CourseController::class, 'updateCourse']);
    Route::delete('/courses/{id}', [CourseController::class, 'deleteCourse']);

    /**
     * Curriculum & Curriculum Details
     */
    Route::get('/curricula', [CurriculumController::class, 'index']);
    Route::get('/curricula/{id}', [CurriculumController::class, 'show']);
    Route::post('/addCurriculum', [CurriculumController::class, 'addCurriculum']);
    Route::post('/deleteCurriculum', [CurriculumController::class, 'deleteCurriculum']);
    Route::post('/copyCurriculum', [CurriculumController::class, 'copyCurriculum']);
    Route::put('/updateCurriculum/{id}', [CurriculumController::class, 'update']);

    Route::post('/removeProgramFromCurriculum', [CurriculumController::class, 'removeProgramFromCurriculum']);
    Route::get('/programs-by-curriculum-year/{curriculumYear}', [CurriculumController::class, 'getProgramsByCurriculumYear']);
    Route::post('/addProgramToCurriculum', [CurriculumController::class, 'addProgramToCurriculum']);

    Route::get('/curricula-details/{curriculumYear}/', [CurriculumDetailsController::class, 'getCurriculumDetails']);

    /**
     * Email
     */
    Route::post('/email-all-faculty-pref-submitted', [EmailController::class, 'emailPrefSubmitted']);
    Route::post('/email-all-faculty-schedule', [EmailController::class, 'emailAllFacultySchedule']);
    Route::post('/email-single-faculty-schedule', [EmailController::class, 'emailSingleFacultySchedule']);

    /**
     * Faculty
     */
    Route::get('/faculty', [FacultyController::class, 'index']);
    Route::post('/faculty', [FacultyController::class, 'store']);
    Route::put('/faculty/{user}', [FacultyController::class, 'update']);
    Route::delete('/faculty/{user}', [FacultyController::class, 'destroy']);

    /**
     * Faculty Notification
     */
    Route::get('/faculty-notifications', [FacultyNotificationController::class, 'getFacultyNotifications']);
    Route::get('/request-notifications', [FacultyNotificationController::class, 'getRequestNotifications']);
    Route::get('/notify-faculty-deadlines-single', [EmailController::class, 'notifyFacultyBeforeDeadlineSingle']);
    Route::post('/test-faculty-notification', [EmailController::class, 'singleDeadlineNotification']);
    Route::get('/notify-global-deadline', [EmailController::class, 'notifyGlobalFacultyDeadline']);

    /**
     * Faculty Type
     */
    Route::apiResource('faculty-types', FacultyTypeController::class);

    /**
     * Preferences
     */
    Route::post('/submit-preferences', [PreferenceController::class, 'submitPreferences']);
    Route::get('/get-unique-preferences', [PreferenceController::class, 'getUniqueFacultyPreferences']);
    Route::get('/get-all-preferences', [PreferenceController::class, 'getAllFacultyPreferences']);
    Route::get('/get-preferences/{faculty_id}', [PreferenceController::class, 'getFacultyPreferencesById']);
    Route::delete('/delete-preferences/{preference_id}', [PreferenceController::class, 'deletePreferences']);
    Route::delete('/delete-all-preferences', [PreferenceController::class, 'deleteAllPreferences']);
    Route::post('/toggle-all-preferences', [PreferenceController::class, 'toggleAllPreferences']);
    Route::post('/toggle-single-preferences', [PreferenceController::class, 'toggleSinglePreferences']);
    Route::post('/request-access', [PreferenceController::class, 'requestAccess']);
    Route::post('/cancel-request-access', [PreferenceController::class, 'cancelRequestAccess']);

    /**
     * Programs
     */
    Route::get('/programs', [ProgramController::class, 'getPrograms']);
    Route::post('/addProgram', [ProgramController::class, 'addProgram']);
    Route::get('/programs/{id}', [ProgramController::class, 'getProgramDetails']);
    Route::put('/updateProgram/{id}', [ProgramController::class, 'updateProgram']);
    Route::delete('/deleteProgram/{id}', [ProgramController::class, 'deleteProgram']);

    /**
     * Reports
     */
    Route::get('/faculty-schedules-report', [ReportsController::class, 'getFacultySchedulesReport']);
    Route::get('/room-schedules-report', [ReportsController::class, 'getRoomSchedulesReport']);
    Route::get('/program-schedules-report', [ReportsController::class, 'getProgramSchedulesReport']);
    Route::get('/single-faculty-schedule/{faculty_id}', [ReportsController::class, 'getSingleFacultySchedule']);
    Route::get('/faculty-schedule-history/{faculty_id}', [ReportsController::class, 'getFacultyScheduleHistory']);
    Route::get('/faculty-academic-years-history/{faculty_id}', [ReportsController::class, 'getFacultyAcademicYearsHistory']);
    Route::get('/overview-details', [ReportsController::class, 'getOverviewDetails']);

    /**
     * Rooms
     */
    Route::get('/rooms', [RoomController::class, 'getRooms']);
    Route::post('/addRoom', [RoomController::class, 'addRoom']);
    Route::put('/rooms/{room_id}', [RoomController::class, 'updateRoom']);
    Route::delete('/rooms/{room_id}', [RoomController::class, 'deleteRoom']);

    /**
     * Room Types
     */
    Route::get('/room-types', [RoomTypeController::class, 'index']);
    Route::get('/room-types/{id}', [RoomTypeController::class, 'show']);
    Route::post('/room-types', [RoomTypeController::class, 'store']);
    Route::put('/room-types/{id}', [RoomTypeController::class, 'update']);
    Route::delete('/room-types/{id}', [RoomTypeController::class, 'destroy']);

    /**
     * Scheduling
     */
    Route::get('/populate-schedules', [ScheduleController::class, 'populateSchedules']);
    Route::post('/assign-schedule', [ScheduleController::class, 'assignSchedule']);
    Route::post('/duplicate-course', [ScheduleController::class, 'duplicateCourse']);
    Route::delete('/remove-duplicate-course', [ScheduleController::class, 'removeDuplicateCourse']);
    Route::get('/get-active-faculty', [FacultyController::class, 'getFacultyDetails']);
    Route::get('/get-available-rooms', [RoomController::class, 'getAllRooms']);
    Route::post('/toggle-all-schedule', [ScheduleController::class, 'toggleAllSchedules']);
    Route::post('/toggle-single-schedule', [ScheduleController::class, 'toggleSingleSchedule']);

    /**
     * Semester
     */
    Route::get('/semesters', [SemesterController::class, 'index']);
    Route::post('/addSemester', [SemesterController::class, 'store']);
    Route::get('/semesters/{id}', [SemesterController::class, 'show']);
    Route::put('/updateSemester/{id}', [SemesterController::class, 'update']);
    Route::delete('/deleteSemester/{id}', [SemesterController::class, 'destroy']);

    /**
     * Year Level
     */
    Route::get('/year_levels', [YearLevelController::class, 'index']);
    Route::post('/addYearLevel', [YearLevelController::class, 'store']);
    Route::get('/year_levels/{id}', [YearLevelController::class, 'show']);
    Route::put('/updateYearLevel/{id}', [YearLevelController::class, 'update']);
    Route::delete('/deleteYearLevel/{id}', [YearLevelController::class, 'destroy']);
});

/*
|----------------------------
| External/Integration Routes
|----------------------------
 */
Route::prefix('external')->group(function () {

    /**
     * E-Class Record System (ECRS)
     */
    Route::prefix('ecrs')->middleware(['check.hmac:ecrs'])->group(function () {
        // Version 1
        Route::prefix('v1')->group(function () {
            Route::get('/pupt-faculty-schedules', [ExternalController::class, 'ECRSFacultySchedules']);
        });
    });

    /**
     * Faculty Academic Requirements Management System (FARMS)
     */
    Route::prefix('farms')->middleware(['check.hmac:farms'])->group(function () {
        // Version 1
        Route::prefix('v1')->group(function () {
            Route::get('/course-schedules', [ExternalController::class, 'FARMSCourseSchedules']);
            Route::get('/course-files', [ExternalController::class, 'FARMSCourseFiles']);
        });
    });

    /**
     * Biometric Synchronization System (BioSync)
     */
    Route::prefix('biosync')->middleware(['check.hmac:biosync'])->group(function () {
        // Version 1
        Route::prefix('v1')->group(function () {
            Route::get('/computer-laboratory-schedules', [ExternalController::class, 'BIOSYNCComputerLabSchedules']);
        });
    });
});

/**
 * Faculty Data Management and Evaluation System with Research Repository (FESR)
 */
Route::post('/oauth/process-faculty', [OAuthController::class, 'processFaculty']);
Route::post('/webhooks/faculty', [WebhookController::class, 'handleFacultyWebhook']);
