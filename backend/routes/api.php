<?php

use App\Http\Controllers\UrlController;
use Illuminate\Support\Facades\Route;

Route::post('/shorten', [UrlController::class, 'store']);
Route::get('/{shortUrl}', [UrlController::class, 'redirect']);