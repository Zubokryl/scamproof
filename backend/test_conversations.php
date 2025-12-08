<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Create a test request
$request = Illuminate\Http\Request::create('/api/messages/conversations', 'GET');

// Simulate authentication for user ID 3 (Николай)
$user = App\Models\User::find(3);
$request->setUserResolver(function () use ($user) {
    return $user;
});

// Get the router and dispatch the request
$router = $app['router'];
$response = $router->dispatch($request);

echo $response->getContent();