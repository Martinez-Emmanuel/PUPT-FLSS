<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $faculties = DB::table('faculties')->get();

        foreach ($faculties as $faculty) {
            DB::table('faculties')
                ->where('faculty_id', $faculty->faculty_id)
                ->update(['faculty_password' => Hash::make($faculty->faculty_password)]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // You might want to handle rollback logic here, but it's generally not needed for hashing
    }
};
