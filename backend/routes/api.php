<?php

use App\Http\Controllers\UrlController;
use Illuminate\Support\Facades\Route;

Route::post('/shorten', [UrlController::class, 'store'])->middleware('throttle:20,1');
Route::get('/{shortUrl}', [UrlController::class, 'redirect'])->middleware('throttle:120,1');