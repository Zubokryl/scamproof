<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\ForumTopicService;
use App\Models\User;
use App\Models\ForumTopic;

class ForumTopicServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_generates_unique_slug_and_is_approved_by_default()
    {
        $user = User::factory()->create();
        $service = $this->app->make(ForumTopicService::class);

        $data = [
            'title' => 'My Unique Topic Title',
            'content' => 'Some content',
        ];

        $topic = $service->create($data, $user);

        $this->assertInstanceOf(ForumTopic::class, $topic);
        $this->assertEquals('approved', $topic->status);
        $this->assertNotEmpty($topic->slug);
        $this->assertDatabaseHas('forum_topics', [
            'id' => $topic->id,
            'title' => 'My Unique Topic Title',
            'slug' => $topic->slug,
            'created_by' => $user->id,
        ]);
    }

    public function test_set_status_and_set_pinned_and_delete()
    {
        $user = User::factory()->create();
        $service = $this->app->make(ForumTopicService::class);

        $topic = ForumTopic::create([
            'category_id' => 1,
            'title' => 'Test topic',
            'content' => 'Content',
            'slug' => 'test-topic-' . rand(1000,9999),
            'created_by' => $user->id,
            'status' => 'approved',
            'is_pinned' => false,
        ]);

        $updated = $service->setStatus($topic, 'hidden', $user->id);
        $this->assertEquals('hidden', $updated->status);
        $this->assertNotNull($updated->moderated_by);
        $this->assertNotNull($updated->moderated_at);

        $pinned = $service->setPinned($topic, true);
        $this->assertTrue((bool) $pinned->is_pinned);

        // test delete
        $service->delete($topic);
        $this->assertDatabaseMissing('forum_topics', ['id' => $topic->id]);
    }
}