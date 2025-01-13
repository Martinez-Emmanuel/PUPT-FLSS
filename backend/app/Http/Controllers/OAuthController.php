<?php

namespace App\Http\Controllers;

use App\Jobs\SendFacultyFirstLoginPasswordJob;
use App\Models\Faculty;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Throwable;

class OAuthController extends Controller
{
    /**
     * Process faculty data received from HRIS OAuth
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function processFaculty(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'faculty_data' => 'required|array',
            'faculty_data.UserID' => 'required|integer',
            'faculty_data.faculty_code' => 'required|string',
            'faculty_data.first_name' => 'required|string',
            'faculty_data.middle_name' => 'nullable|string',
            'faculty_data.last_name' => 'required|string',
            'faculty_data.name_extension' => 'nullable|string',
            'faculty_data.Email' => 'required|email',
            'faculty_data.status' => 'required|string',
            'faculty_data.faculty_type' => 'required|string',
            'hris_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            Log::error('OAuth faculty data validation failed', [
                'errors' => $validator->errors()->toArray(),
            ]);
            return response()->json([
                'message' => 'Invalid faculty data format',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $facultyData = $request->input('faculty_data');
            $hrisToken = $request->input('hris_token');

            // Only look up by HRIS UserID
            $faculty = Faculty::where('hris_user_id', $facultyData['UserID'])->first();
            $user = $faculty ? $faculty->user : null;

            if (!$user) {
                $password = Str::password(12, true, true, true, false);

                $user = new User();
                $user->fill([
                    'first_name' => $facultyData['first_name'],
                    'middle_name' => $facultyData['middle_name'],
                    'last_name' => $facultyData['last_name'],
                    'suffix_name' => $facultyData['name_extension'],
                    'code' => $facultyData['faculty_code'],
                    'email' => $facultyData['Email'],
                    'role' => 'faculty',
                    'status' => $facultyData['status'],
                    'password' => $password,
                ]);

                if (!$user->save()) {
                    throw new \Exception('Failed to create user record');
                }

                $faculty = new Faculty();
                $faculty->user_id = $user->id;
                $faculty->hris_user_id = $facultyData['UserID'];
                $faculty->faculty_type = $facultyData['faculty_type'];
                $faculty->faculty_units = 0;

                if (!$faculty->save()) {
                    throw new \Exception('Failed to create faculty record');
                }

                SendFacultyFirstLoginPasswordJob::dispatch($user, $password)
                    ->delay(now()->addSeconds(5));
            }

            // Generate Sanctum token
            $token = $user->createToken('hris-oauth', ['*'])->plainTextToken;

            // Store HRIS token reference
            $tokenModel = PersonalAccessToken::findToken($token);
            if (!$tokenModel) {
                throw new \Exception('Failed to create access token');
            }

            $tokenModel->name = 'hris-oauth';
            $tokenModel->save();

            DB::commit();

            Log::info('Faculty processed successfully via OAuth', [
                'user_id' => $user->id,
                'faculty_code' => $facultyData['faculty_code'],
                'hris_user_id' => $facultyData['UserID'],
            ]);

            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'faculty' => [
                        'faculty_id' => $user->faculty->id,
                        'faculty_type' => $user->faculty->faculty_type,
                        'faculty_units' => $user->faculty->faculty_units,
                    ],
                ],
                'expires_at' => now()->addDay()->toDateTimeString(),
            ]);

        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('OAuth faculty processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'faculty_code' => $facultyData['faculty_code'] ?? null,
                'hris_user_id' => $facultyData['UserID'] ?? null,
            ]);

            return response()->json([
                'message' => 'Failed to process faculty data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
