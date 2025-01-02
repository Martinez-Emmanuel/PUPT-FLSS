<?php

namespace App\Http\Controllers;

use App\Jobs\SendFacultyFirstLoginPasswordJob;
use App\Models\Faculty;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class OAuthController extends Controller
{
    public function processFaculty(Request $request)
    {
        try {
            $facultyData = $request->input('faculty_data');
            $hrisToken = $request->input('hris_token');

            DB::beginTransaction();

            $user = User::where('code', $facultyData['faculty_code'])->first();

            if (!$user) {
                $password = Str::password(12);

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
                $user->save();

                $faculty = new Faculty();
                $faculty->user_id = $user->id;
                $faculty->faculty_type = $facultyData['faculty_type'];
                $faculty->faculty_units = 0;
                $faculty->save();

                SendFacultyFirstLoginPasswordJob::dispatch($user, $password);
            }

            // Generate token for FLSS
            $token = $user->createToken('hris-oauth')->plainTextToken;

            // Store HRIS token reference
            $tokenModel = PersonalAccessToken::findToken($token);
            $tokenModel->name = 'hris-oauth';
            $tokenModel->abilities = ['*'];
            $tokenModel->save();

            DB::commit();

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

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to process faculty data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
