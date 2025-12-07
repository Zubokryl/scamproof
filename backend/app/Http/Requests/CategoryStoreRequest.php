<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryStoreRequest extends FormRequest
{
    public function authorize()
    {
        // Авторизация: только аутентифицированные с ролью admin/manager (можно настроить)
        return $this->user() && in_array($this->user()->role, ['admin']);
    }

    public function rules()
    {
        return [
            'slug' => 'required|string|unique:categories,slug',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:100',
            'landing_enabled' => 'boolean',
            'landing_title' => 'nullable|string|max:255',
            'landing_content' => 'nullable|string',
            'landing_template' => 'nullable|string|in:default,card,hero',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:500',
            'forum_section_slug' => 'nullable|string|max:100',
        ];
    }
}
