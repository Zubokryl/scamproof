<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ForumTopic;
use App\Services\ForumTopicService;
use Illuminate\Http\Request;

class ForumModerationController extends Controller
{
    protected ForumTopicService $service;

    public function __construct(ForumTopicService $service)
    {
        $this->service = $service;
    }

    public function setStatus(Request $request, ForumTopic $topic)
    {
        $request->validate(['status' => 'required|string|in:approved,pending,hidden,deleted']);
        $updated = $this->service->setStatus($topic, $request->input('status'), $request->user()->id);

        return response()->json([
            'message' => 'Status updated',
            'topic' => $updated,
        ]);
    }

    public function setPinned(Request $request, ForumTopic $topic)
    {
        $request->validate(['pinned' => 'required|boolean']);
        $updated = $this->service->setPinned($topic, (bool) $request->input('pinned'));
        return response()->json(['message' => 'Pinned updated', 'topic' => $updated]);
    }

    public function delete(ForumTopic $topic)
    {
        $this->service->delete($topic);
        return response()->json(['message' => 'Topic deleted']);
    }
}