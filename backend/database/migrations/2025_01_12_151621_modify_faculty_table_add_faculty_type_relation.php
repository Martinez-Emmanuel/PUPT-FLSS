<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, add temporary faculty_type_id column without foreign key constraint
        Schema::table('faculty', function (Blueprint $table) {
            $table->unsignedBigInteger('faculty_type_id')->nullable()->after('user_id');
        });

        // Update existing faculty records with appropriate faculty_type_id
        $faculty = DB::table('faculty')->get();
        foreach ($faculty as $record) {
            $oldType = $record->faculty_type ?? 'Full-Time'; // Default to Full-Time if null

            // Get the corresponding faculty type ID
            $facultyType = DB::table('faculty_type')
                ->where('faculty_type', $oldType)
                ->first();

            // Default to Full-Time if type not found
            $typeId = $facultyType ? $facultyType->faculty_type_id :
            DB::table('faculty_type')->where('faculty_type', 'Full-Time')->first()->faculty_type_id;

            DB::table('faculty')
                ->where('id', $record->id)
                ->update(['faculty_type_id' => $typeId]);
        }

        // Now that all records have been updated, we can make the column not nullable and add the foreign key
        Schema::table('faculty', function (Blueprint $table) {
            // Make faculty_type_id not nullable
            $table->unsignedBigInteger('faculty_type_id')->nullable(false)->change();

            // Add the foreign key constraint
            $table->foreign('faculty_type_id')
                ->references('faculty_type_id')
                ->on('faculty_type')
                ->onDelete('restrict');

            // Drop the old columns
            $table->dropColumn('faculty_type');
            $table->dropColumn('faculty_units');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            // Remove the foreign key and faculty_type_id column
            $table->dropForeign(['faculty_type_id']);
            $table->dropColumn('faculty_type_id');

            // Restore the original columns
            $table->string('faculty_type');
            $table->decimal('faculty_units', 8, 2);
        });
    }
};
