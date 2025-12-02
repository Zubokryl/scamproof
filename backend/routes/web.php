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

// Email verification routes
Route::get('/email/verify', function () {
    return view('auth.verify-email');
})->middleware('auth:sanctum')->name('verification.notice');

Route::get('/email/verify/{id}/{hash}', function (Illuminate\Foundation\Auth\EmailVerificationRequest $request) {
    $request->fulfill();
    return response()->json(['message' => 'Email verified successfully']);
})->middleware(['auth:sanctum', 'signed'])->name('verification.verify');

Route::post('/email/verification-notification', function (Illuminate\Http\Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['message' => 'Verification link sent!']);
})->middleware(['auth:sanctum', 'throttle:6,1'])->name('verification.send');