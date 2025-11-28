<?php

use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Middleware\CreateFreshApiToken;

// Sanctum routes for SPA authentication
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['csrf_cookie_set' => true]);
})->middleware('web');

Route::get('/', function () {
    return view('welcome');
});
