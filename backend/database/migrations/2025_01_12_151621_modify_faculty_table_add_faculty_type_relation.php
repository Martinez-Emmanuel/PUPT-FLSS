<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            $table->unsignedBigInteger('faculty_type_id')->nullable()->after('user_id');
        });

        $faculty = DB::table('faculty')->get();
        foreach ($faculty as $record) {
            $oldType = $record->faculty_type ?? 'Full-Time';
            $facultyType = DB::table('faculty_type')
                ->where('faculty_type', $oldType)
                ->first();
            $typeId = $facultyType ? $facultyType->faculty_type_id :
            DB::table('faculty_type')->where('faculty_type', 'Full-Time')->first()->faculty_type_id;
            DB::table('faculty')
                ->where('id', $record->id)
                ->update(['faculty_type_id' => $typeId]);
        }

        Schema::table('faculty', function (Blueprint $table) {
            $table->unsignedBigInteger('faculty_type_id')->nullable(false)->change();
            $table->foreign('faculty_type_id')
                ->references('faculty_type_id')
                ->on('faculty_type')
                ->onDelete('restrict');
            $table->dropColumn('faculty_type');
            $table->dropColumn('faculty_units');
        });
    }

    public function down(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            $table->dropForeign(['faculty_type_id']);
            $table->dropColumn('faculty_type_id');
            $table->string('faculty_type');
            $table->decimal('faculty_units', 8, 2);
        });
    }
};