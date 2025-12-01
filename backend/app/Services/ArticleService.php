<?php

namespace App\Services;

use App\Http\Requests\ArticleStoreRequest;
use App\Http\Requests\ArticleUpdateRequest;
use App\Models\Article;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ArticleService
{
    /**
     * Создать статью: генерируем уникальный slug, транзакция, кэш-инвалидация.
     */
    public function create(ArticleStoreRequest $request): Article
{
    return DB::transaction(function () use ($request) {
        Log::info('ArticleService create method called', [
            'user_id' => $request->user() ? $request->user()->id : null,
            'has_thumbnail' => $request->hasFile('thumbnail'),
            'has_video' => $request->hasFile('video'),
            'validated_data' => $request->validated()
        ]);
        
        $payload = $request->validated();

        // Генерация уникального slug
        $base = Str::slug($payload['title'] ?? Str::random(8));
        $slug = $base;
        $i = 1;
        while (Article::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        $payload['slug'] = $slug;

        // Обработка файлов
        if ($request->hasFile('thumbnail')) {
            Log::info('Processing thumbnail upload');
            $payload['thumbnail'] = $request->file('thumbnail')->store('articles/thumbnails', 'public');
            Log::info('Thumbnail stored', ['path' => $payload['thumbnail']]);
        }

        if ($request->hasFile('video')) {
            Log::info('Processing video upload');
            $payload['video_url'] = $request->file('video')->store('articles/videos', 'public');
            unset($payload['video']); // чтобы не сохранять поле "video" в таблице
            Log::info('Video stored', ['path' => $payload['video_url']]);
        }

        // Создатель статьи
        $payload['created_by'] = $request->user()->id;
        
        // Автоматически публикуем статью при создании
        if (!isset($payload['published_at'])) {
            $payload['published_at'] = now();
        }

        Log::info('Creating article with payload', ['payload' => $payload]);
        $article = Article::create($payload);
        Log::info('Article created successfully', ['article_id' => $article->id]);

        // Flush cache only if the driver supports tagging
        if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            Cache::tags(['articles', 'categories'])->flush();
        } else {
            // For non-tagging stores, flush the entire cache
            Cache::flush();
        }

        return $article;
    });
}

    /**
     * Обновить статью.
     */
    public function update(Article $article, ArticleUpdateRequest $request): Article
{
    return DB::transaction(function () use ($article, $request) {
        Log::info('=== ARTICLE UPDATE SERVICE CALLED ===');
        Log::info('ArticleService update method called', [
            'article_id' => $article->id,
            'article_title_before' => $article->title,
            'article_content_before' => $article->content,
            'user_id' => $request->user() ? $request->user()->id : null,
            'has_thumbnail' => $request->hasFile('thumbnail'),
            'has_video' => $request->hasFile('video'),
            'validated_data' => $request->validated(),
            'all_request_data' => $request->all(),
            'request_method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'request_keys' => array_keys($request->all()),
            'title_param' => $request->get('title'),
            'content_param' => $request->get('content'),
            'category_id_param' => $request->get('category_id')
        ]);
        
        $payload = $request->validated();
        Log::info('Payload before processing', ['payload' => $payload]);
        
        // Even if payload seems empty, we should still process it
        // because nullable fields with empty strings are filtered out by validated()
        
        // Генерация slug при смене заголовка
        if (isset($payload['title'])) {
            if (!empty($payload['title'])) {
                $base = Str::slug($payload['title']);
                $slug = $base;
                $i = 1;
                while (Article::where('slug', $slug)->where('id', '!=', $article->id)->exists()) {
                    $slug = $base . '-' . $i++;
                }
                $payload['slug'] = $slug;
                Log::info('Generated slug', ['slug' => $slug]);
            } else {
                // If title is empty, we might want to clear the slug or handle it differently
                // For now, we'll leave it as is
                Log::info('Title is empty, keeping existing slug');
            }
        }
        
        // Обработка файлов
        if ($request->hasFile('thumbnail')) {
            Log::info('Processing thumbnail update');
            // Удаляем старый файл, если есть
            if ($article->thumbnail) Storage::disk('public')->delete($article->thumbnail);
            $payload['thumbnail'] = $request->file('thumbnail')->store('articles/thumbnails', 'public');
            Log::info('Thumbnail updated', ['path' => $payload['thumbnail']]);
        }
        
        if ($request->hasFile('video')) {
            Log::info('Processing video update');
            if ($article->video_url) Storage::disk('public')->delete($article->video_url);
            $payload['video_url'] = $request->file('video')->store('articles/videos', 'public');
            unset($payload['video']);
            Log::info('Video updated', ['path' => $payload['video_url']]);
        }
        
        Log::info('Updating article with payload', ['payload' => $payload]);
        
        // Log article state before update
        Log::info('Article state before update', [
            'id' => $article->id,
            'title' => $article->title,
            'content' => $article->content,
            'category_id' => $article->category_id
        ]);
        
        // CRITICAL: Check what's actually in the payload
        if (!empty($payload) || isset($payload['title']) || isset($payload['content']) || isset($payload['category_id'])) {
            Log::info('Performing article update with payload:', $payload);
            
            // Log the actual SQL query that will be executed
            Log::info('About to execute update query');
            
            // CRITICAL: Let's check if the update actually affects any rows
            $result = $article->update($payload);
            
            Log::info('Article update result', ['result' => $result]);
            Log::info('Article updated in database', [
                'article_id' => $article->id,
                'title_after' => $article->title,
                'content_after' => $article->content,
                'category_id_after' => $article->category_id
            ]);
            
            // CRITICAL: Let's also check by querying the database directly
            $directQuery = DB::table('articles')->where('id', $article->id)->first();
            Log::info('Direct database query result after update', [
                'id' => $directQuery->id ?? null,
                'title' => $directQuery->title ?? null,
                'content' => $directQuery->content ?? null,
                'category_id' => $directQuery->category_id ?? null
            ]);
        } else {
            Log::info('No significant changes to update for article', ['article_id' => $article->id]);
        }
        
        // Log article state after update (from database)
        $article->refresh(); // Get fresh data from database
        Log::info('Article state after refresh from database', [
            'id' => $article->id,
            'title' => $article->title,
            'content' => $article->content,
            'category_id' => $article->category_id
        ]);
        
        Log::info('Article updated successfully', [
            'article_id' => $article->id,
            'title' => $article->title,
            'content' => $article->content,
            'category_id' => $article->category_id
        ]);
        
        // Flush cache only if the driver supports tagging
        if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            Cache::tags(['articles', 'categories'])->flush();
            Log::info('Cache flushed with tags');
        } else {
            // For non-tagging stores, flush the entire cache
            Cache::flush();
            Log::info('Entire cache flushed');
        }
        
        // CRITICAL: Let's also check what we're returning
        $freshArticle = $article->fresh();
        Log::info('Fresh article data being returned', [
            'id' => $freshArticle->id,
            'title' => $freshArticle->title,
            'content' => $freshArticle->content,
            'category_id' => $freshArticle->category_id
        ]);
        
        return $freshArticle;
    });
}


    /**
     * Удалить статью.
     */
    public function delete(Article $article): void
    {
        DB::transaction(function () use ($article) {
            Log::info('ArticleService delete method called', ['article_id' => $article->id]);
            $article->delete();
            // Flush cache only if the driver supports tagging
            if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
                Cache::tags(['articles', 'categories'])->flush();
            } else {
                // For non-tagging stores, flush the entire cache
                Cache::flush();
            }
            Log::info('Article deleted successfully', ['article_id' => $article->id]);
        });
    }
}