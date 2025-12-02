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
        Log::info('=== ARTICLE CREATE SERVICE CALLED ===');
        Log::info('ArticleService create method called', [
            'user_id' => $request->user() ? $request->user()->id : null,
            'has_thumbnail' => $request->hasFile('thumbnail'),
            'has_video' => $request->hasFile('video'),
            'thumbnail_file' => $request->file('thumbnail') ? [
                'original_name' => $request->file('thumbnail')->getClientOriginalName(),
                'size' => $request->file('thumbnail')->getSize(),
                'mime_type' => $request->file('thumbnail')->getMimeType(),
                'is_valid' => $request->file('thumbnail')->isValid(),
                'path' => $request->file('thumbnail')->getPath(),
                'extension' => $request->file('thumbnail')->getClientOriginalExtension(),
            ] : null,
            'video_file' => $request->file('video') ? [
                'original_name' => $request->file('video')->getClientOriginalName(),
                'size' => $request->file('video')->getSize(),
                'mime_type' => $request->file('video')->getMimeType(),
                'is_valid' => $request->file('video')->isValid(),
                'path' => $request->file('video')->getPath(),
                'extension' => $request->file('video')->getClientOriginalExtension(),
            ] : null,
            'all_request_data' => array_keys($request->all()),
            'validated_data_keys' => array_keys($request->validated()),
            'title' => $request->get('title'),
            'content' => $request->get('content'),
            'category_id' => $request->get('category_id'),
        ]);
        
        $payload = $request->validated();
        Log::info('Validated payload keys', ['keys' => array_keys($payload)]);
        Log::info('Full validated payload', ['payload' => $payload]);

        // Генерация уникального slug
        $base = Str::slug($payload['title'] ?? Str::random(8));
        $slug = $base;
        $i = 1;
        while (Article::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        $payload['slug'] = $slug;
        Log::info('Generated slug', ['slug' => $slug]);

        // Обработка файлов
        if ($request->hasFile('thumbnail')) {
            Log::info('Processing thumbnail upload - BEFORE');
            try {
                $thumbnailFile = $request->file('thumbnail');
                Log::info('Thumbnail file details', [
                    'original_name' => $thumbnailFile->getClientOriginalName(),
                    'size' => $thumbnailFile->getSize(),
                    'mime_type' => $thumbnailFile->getMimeType(),
                    'is_valid' => $thumbnailFile->isValid(),
                ]);
                
                $path = $thumbnailFile->store('articles/thumbnails', 'public');
                $payload['thumbnail'] = $path;
                Log::info('Thumbnail stored successfully', ['path' => $path]);
            } catch (\Exception $e) {
                Log::error('Thumbnail upload failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        } else {
            Log::info('No thumbnail file in request');
        }

        if ($request->hasFile('video')) {
            Log::info('Processing video upload - BEFORE');
            try {
                $videoFile = $request->file('video');
                Log::info('Video file details', [
                    'original_name' => $videoFile->getClientOriginalName(),
                    'size' => $videoFile->getSize(),
                    'mime_type' => $videoFile->getMimeType(),
                    'is_valid' => $videoFile->isValid(),
                ]);
                
                $path = $videoFile->store('articles/videos', 'public');
                $payload['video_url'] = $path;
                unset($payload['video']); // чтобы не сохранять поле "video" в таблице
                Log::info('Video stored successfully', ['path' => $path]);
            } catch (\Exception $e) {
                Log::error('Video upload failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        } else {
            Log::info('No video file in request');
        }

        // Создатель статьи
        $payload['created_by'] = $request->user()->id;
        Log::info('Set created_by', ['created_by' => $payload['created_by']]);
        
        // Автоматически публикуем статью при создании
        if (!isset($payload['published_at'])) {
            $payload['published_at'] = now();
        }

        Log::info('Creating article with final payload', ['payload' => $payload]);
        $article = Article::create($payload);
        Log::info('Article created successfully', [
            'article_id' => $article->id,
            'article_thumbnail' => $article->thumbnail,
            'article_video_url' => $article->video_url
        ]);

        // Flush cache only if the driver supports tagging
        if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            Cache::tags(['articles', 'categories'])->flush();
        } else {
            // For non-tagging stores, use targeted cache clearing
            Cache::forget('articles_list');
            Cache::forget('articles_with_comments_count');
            Cache::forget('categories_list');
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
            'thumbnail_file' => $request->file('thumbnail') ? [
                'original_name' => $request->file('thumbnail')->getClientOriginalName(),
                'size' => $request->file('thumbnail')->getSize(),
                'mime_type' => $request->file('thumbnail')->getMimeType(),
                'is_valid' => $request->file('thumbnail')->isValid(),
                'path' => $request->file('thumbnail')->getPath(),
                'extension' => $request->file('thumbnail')->getClientOriginalExtension(),
            ] : null,
            'video_file' => $request->file('video') ? [
                'original_name' => $request->file('video')->getClientOriginalName(),
                'size' => $request->file('video')->getSize(),
                'mime_type' => $request->file('video')->getMimeType(),
                'is_valid' => $request->file('video')->isValid(),
                'path' => $request->file('video')->getPath(),
                'extension' => $request->file('video')->getClientOriginalExtension(),
            ] : null,
            'all_request_data' => array_keys($request->all()),
            'validated_data_keys' => array_keys($request->validated()),
            'title' => $request->get('title'),
            'content' => $request->get('content'),
            'category_id' => $request->get('category_id'),
        ]);
        
        $payload = $request->validated();
        Log::info('Validated payload keys', ['keys' => array_keys($payload)]);
        Log::info('Full validated payload', ['payload' => $payload]);
        
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
            Log::info('Processing thumbnail update - BEFORE');
            try {
                // Удаляем старый файл, если есть
                if ($article->thumbnail) {
                    Log::info('Deleting old thumbnail', ['old_path' => $article->thumbnail]);
                    Storage::disk('public')->delete($article->thumbnail);
                }
                
                $thumbnailFile = $request->file('thumbnail');
                Log::info('Thumbnail file details for update', [
                    'original_name' => $thumbnailFile->getClientOriginalName(),
                    'size' => $thumbnailFile->getSize(),
                    'mime_type' => $thumbnailFile->getMimeType(),
                    'is_valid' => $thumbnailFile->isValid(),
                ]);
                
                $path = $thumbnailFile->store('articles/thumbnails', 'public');
                $payload['thumbnail'] = $path;
                Log::info('Thumbnail updated successfully', ['path' => $path]);
            } catch (\Exception $e) {
                Log::error('Thumbnail update failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        } else {
            Log::info('No thumbnail file in update request');
        }
        
        if ($request->hasFile('video')) {
            Log::info('Processing video update - BEFORE');
            try {
                if ($article->video_url) {
                    Log::info('Deleting old video', ['old_path' => $article->video_url]);
                    Storage::disk('public')->delete($article->video_url);
                }
                
                $videoFile = $request->file('video');
                Log::info('Video file details for update', [
                    'original_name' => $videoFile->getClientOriginalName(),
                    'size' => $videoFile->getSize(),
                    'mime_type' => $videoFile->getMimeType(),
                    'is_valid' => $videoFile->isValid(),
                ]);
                
                $path = $videoFile->store('articles/videos', 'public');
                $payload['video_url'] = $path;
                unset($payload['video']);
                Log::info('Video updated successfully', ['path' => $path]);
            } catch (\Exception $e) {
                Log::error('Video update failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        } else {
            Log::info('No video file in update request');
        }
        
        Log::info('Updating article with payload', ['payload' => $payload]);
        
        // Log article state before update
        Log::info('Article state before update', [
            'id' => $article->id,
            'title' => $article->title,
            'content' => $article->content,
            'category_id' => $article->category_id,
            'thumbnail_before' => $article->thumbnail,
            'video_url_before' => $article->video_url
        ]);
        
        // CRITICAL: Check what's actually in the payload
        if (!empty($payload) || isset($payload['title']) || isset($payload['content']) || isset($payload['category_id']) || isset($payload['thumbnail']) || isset($payload['video_url'])) {
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
                'category_id_after' => $article->category_id,
                'thumbnail_after' => $article->thumbnail,
                'video_url_after' => $article->video_url
            ]);
            
            // CRITICAL: Let's also check by querying the database directly
            $directQuery = DB::table('articles')->where('id', $article->id)->first();
            Log::info('Direct database query result after update', [
                'id' => $directQuery->id ?? null,
                'title' => $directQuery->title ?? null,
                'content' => $directQuery->content ?? null,
                'category_id' => $directQuery->category_id ?? null,
                'thumbnail' => $directQuery->thumbnail ?? null,
                'video_url' => $directQuery->video_url ?? null
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
            'category_id' => $article->category_id,
            'thumbnail' => $article->thumbnail,
            'video_url' => $article->video_url
        ]);
        
        Log::info('Article updated successfully', [
            'article_id' => $article->id,
            'title' => $article->title,
            'content' => $article->content,
            'category_id' => $article->category_id,
            'thumbnail' => $article->thumbnail,
            'video_url' => $article->video_url
        ]);
        
        // Flush cache only if the driver supports tagging
        if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            Cache::tags(['articles', 'categories'])->flush();
            Log::info('Cache flushed with tags');
        } else {
            // For non-tagging stores, use targeted cache clearing
            Cache::forget('articles_list');
            Cache::forget('articles_with_comments_count');
            Cache::forget('categories_list');
            Cache::forget('article_' . $article->id);
            Log::info('Targeted cache entries cleared');
        }
        
        // CRITICAL: Let's also check what we're returning
        $freshArticle = $article->fresh();
        Log::info('Fresh article data being returned', [
            'id' => $freshArticle->id,
            'title' => $freshArticle->title,
            'content' => $freshArticle->content,
            'category_id' => $freshArticle->category_id,
            'thumbnail' => $freshArticle->thumbnail,
            'thumbnail_url' => $freshArticle->thumbnail_url,
            'video_url' => $freshArticle->video_url
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
                // For non-tagging stores, use targeted cache clearing
                Cache::forget('articles_list');
                Cache::forget('articles_with_comments_count');
                Cache::forget('categories_list');
                Cache::forget('article_' . $article->id);
            }
            Log::info('Article deleted successfully', ['article_id' => $article->id]);
        });
    }
}