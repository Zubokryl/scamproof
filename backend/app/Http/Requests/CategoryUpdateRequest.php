<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryUpdateRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user() && in_array($this->user()->role, ['admin']);
    }

    public function rules()
    {
        $id = $this->route('id') ?? $this->route('category');

        return [
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'icon' => 'sometimes|string|max:100',
            'slug' => 'sometimes|string|unique:categories,slug,' . $id,
            'landing_enabled' => 'sometimes|boolean',
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