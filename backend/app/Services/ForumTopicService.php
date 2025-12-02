<?php

namespace App\Services;

use App\Models\ForumTopic;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ForumTopicService
{
    /**
     * Создаёт тему: генерирует уникальный slug, ставит статус (по умолчанию approved),
     * делает транзакцию и инвалидацию кэша.
     *
     * @param array $data Валидированные данные
     * @param User|int $user
     * @return ForumTopic
     */
    public function create(array $data, $user): ForumTopic
    {
        return DB::transaction(function () use ($data, $user) {
            $payload = $data;

            // slug: безопасная генерация уникального slug
            $base = Str::slug($payload['title']);
            $slug = $base ?: Str::random(8);
            $i = 1;
            while (ForumTopic::where('slug', $slug)->exists()) {
                $slug = $base . '-' . $i++;
            }
            $payload['slug'] = $slug;

            // Set default status
            if (!isset($payload['status'])) {
                $payload['status'] = 'approved';
            }

            // author
            $payload['created_by'] = is_object($user) ? $user->id : (int)$user;

            $topic = ForumTopic::create($payload);

            // Инвалидация кэша списков топиков
            if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
                Cache::tags(['forum_topics'])->flush();
            } else {
                // For non-tagging stores, use targeted cache clearing
                Cache::forget('forum_topics_list');
            }

            return $topic;
        });
    }

    public function setStatus(ForumTopic $topic, string $status, ?int $moderatorId = null): ForumTopic
    {
        return DB::transaction(function () use ($topic, $status, $moderatorId) {
            $topic->status = $status;
            if ($moderatorId) {
                $topic->moderated_by = $moderatorId;
                $topic->moderated_at = now();
            }
            $topic->save();

            if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
                Cache::tags(['forum_topics'])->flush();
            } else {
                // For non-tagging stores, use targeted cache clearing
                Cache::forget('forum_topics_list');
                Cache::forget('forum_topic_' . $topic->id);
            }

            return $topic->fresh();
        });
    }

    public function setPinned(ForumTopic $topic, bool $pinned): ForumTopic
    {
        return DB::transaction(function () use ($topic, $pinned) {
            $topic->is_pinned = (bool) $pinned;
            $topic->save();
            if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
                Cache::tags(['forum_topics'])->flush();
            } else {
                // For non-tagging stores, use targeted cache clearing
                Cache::forget('forum_topics_list');
                Cache::forget('forum_topic_' . $topic->id);
            }
            return $topic->fresh();
        });
    }

    public function delete(ForumTopic $topic): void
    {
        DB::transaction(function () use ($topic) {
            $topic->delete();
            if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
                Cache::tags(['forum_topics'])->flush();
            } else {
                // For non-tagging stores, use targeted cache clearing
                Cache::forget('forum_topics_list');
                Cache::forget('forum_topic_' . $topic->id);
            }
        });
    }
}