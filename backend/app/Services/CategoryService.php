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
            Cache::tags(['categories', 'articles'])->flush();
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
            Cache::tags(['categories', 'articles'])->flush();
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
            Cache::tags(['categories', 'articles'])->flush();
        });
    }
}