<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class CategoryService
{
    /**
     * Создание категории - транзакция + кэш-инвалидация.
     */
    public function create(array $data): Category
    {
        return DB::transaction(function () use ($data) {
            $category = Category::create($data);
            // Инвалидация кэша: единая точка очистки для категорий/страниц
            if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
                Cache::tags(['categories', 'articles'])->flush();
            } else {
                // For non-tagging stores, use targeted cache clearing
                Cache::forget('categories_list');
                Cache::forget('articles_list');
                Cache::forget('articles_with_comments_count');
            }
            return $category;
        });
    }

    /**
     * Обновление категории.
     */
    public function update(Category $category, array $data): Category
    {
        return DB::transaction(function () use ($category, $data) {
            $category->update($data);
            if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
                Cache::tags(['categories', 'articles'])->flush();
            } else {
                // For non-tagging stores, use targeted cache clearing
                Cache::forget('categories_list');
                Cache::forget('articles_list');
                Cache::forget('articles_with_comments_count');
                Cache::forget('category_' . $category->id);
            }
            return $category->fresh();
        });
    }

    /**
     * Удаление категории с проверками вынести в контроллер/политику; здесь — удаление + инвалидация.
     */
    public function delete(Category $category): void
    {
        DB::transaction(function () use ($category) {
            $category->delete();
            if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
                Cache::tags(['categories', 'articles'])->flush();
            } else {
                // For non-tagging stores, use targeted cache clearing
                Cache::forget('categories_list');
                Cache::forget('articles_list');
                Cache::forget('articles_with_comments_count');
                Cache::forget('category_' . $category->id);
            }
        });
    }
}