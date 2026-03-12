<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(
            'CREATE INDEX urls_original_url_hash ON urls USING hash (original_url)'
        );
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS urls_original_url_hash');
    }
};