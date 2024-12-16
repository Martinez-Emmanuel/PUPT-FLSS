    <?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preference_days', function (Blueprint $table) {
            $table->id('preference_day_id');
            $table->unsignedBigInteger('preference_id');
            $table->enum('preferred_day', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
            $table->time('preferred_start_time');
            $table->time('preferred_end_time');
            $table->timestamps();

            $table->foreign('preference_id')->references('preferences_id')->on('preferences')->onDelete('cascade');
            $table->index('preference_id');
            $table->index('preferred_day');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preference_days');
    }
};