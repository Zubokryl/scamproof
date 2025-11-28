<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\ForumTopic;
use App\Policies\ForumTopicPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        ForumTopic::class => ForumTopicPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}