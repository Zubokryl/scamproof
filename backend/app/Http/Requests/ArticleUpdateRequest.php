<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArticleUpdateRequest extends FormRequest
{
    public function authorize()
    {
        // допускаем админов/редакторов; для автор-специфичных прав используйте Policy
        return $this->user() && in_array($this->user()->role, ['admin', 'editor']);
    }

    public function rules()
    {
        $articleId = $this->route('article') instanceof \App\Models\Article
            ? $this->route('article')->id
            : $this->route('article');

        return [
            'title' => 'sometimes|required|string|max:255|unique:articles,title,' . $articleId,
            'content' => 'sometimes|required|string',
            'category_id' => 'sometimes|required|exists:categories,id',
            'pdf_url' => 'nullable|url',
            'published_at' => 'nullable|date',
        ];
    }
}