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
        $faculties = DB::table('faculty')->get();

        foreach ($faculties as $faculty) {
            DB::table('faculty')
                ->where('id', $faculty->id)
                ->update(['password' => Hash::make($faculty->password)]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback logic if necessary
    }
};
