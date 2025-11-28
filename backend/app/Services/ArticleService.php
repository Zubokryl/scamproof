<?php

namespace App\Services;

use App\Models\Article;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class ArticleService
{
    /**
     * Создать статью: генерируем уникальный slug, транзакция, кэш-инвалидация.
     */
    public function create(array $data): Article
{
    return DB::transaction(function () use ($data) {
        $payload = $data;

        // Генерация уникального slug
        $base = Str::slug($payload['title'] ?? Str::random(8));
        $slug = $base;
        $i = 1;
        while (Article::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        $payload['slug'] = $slug;

        // Обработка файлов
        if (isset($payload['thumbnail'])) {
            $payload['thumbnail'] = $payload['thumbnail']->store('articles/thumbnails', 'public');
        }

        if (isset($payload['video'])) {
            $payload['video_url'] = $payload['video']->store('articles/videos', 'public');
            unset($payload['video']); // чтобы не сохранять поле "video" в таблице
        }

        // Создатель статьи
        $payload['created_by'] = auth()->id();

        $article = Article::create($payload);

        Cache::tags(['articles', 'categories'])->flush();

        return $article;
    });
}

    /**
     * Обновить статью.
     */
    public function update(Article $article, array $data): Article
{
    return DB::transaction(function () use ($article, $data) {
        $payload = $data;

        // Генерация slug при смене заголовка
        if (!empty($payload['title'])) {
            $base = Str::slug($payload['title']);
            $slug = $base;
            $i = 1;
            while (Article::where('slug', $slug)->where('id', '!=', $article->id)->exists()) {
                $slug = $base . '-' . $i++;
            }
            $payload['slug'] = $slug;
        }

        // Обработка файлов
        if (isset($payload['thumbnail'])) {
            // Удаляем старый файл, если есть
            if ($article->thumbnail) Storage::disk('public')->delete($article->thumbnail);
            $payload['thumbnail'] = $payload['thumbnail']->store('articles/thumbnails', 'public');
        }

        if (isset($payload['video'])) {
            if ($article->video_url) Storage::disk('public')->delete($article->video_url);
            $payload['video_url'] = $payload['video']->store('articles/videos', 'public');
            unset($payload['video']);
        }

        $article->update($payload);

        Cache::tags(['articles', 'categories'])->flush();

        return $article->fresh();
    });
}


    /**
     * Удалить статью.
     */
    public function delete(Article $article): void
    {
        DB::transaction(function () use ($article) {
            $article->delete();
            Cache::tags(['articles', 'categories'])->flush();
        });
    }
}