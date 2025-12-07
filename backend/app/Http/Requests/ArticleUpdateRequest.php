<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class ArticleUpdateRequest extends FormRequest
{
    public function authorize()
    {
        // допускаем только админов; для автор-специфичных прав используйте Policy
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules()
    {
        // Get the article ID from the route parameter
        $articleId = $this->route('article');
        
        // If it's an Article model instance, get the ID
        if ($articleId instanceof \App\Models\Article) {
            $articleId = $articleId->id;
        }

        Log::info('ArticleUpdateRequest rules debug', [
            'article_id' => $articleId,
            'route_parameter' => $this->route('article'),
            'all_data' => $this->all(),
            'request_method' => $this->method(),
            'content_type' => $this->header('Content-Type'),
            'request_keys' => array_keys($this->all()),
            'title_param' => $this->get('title'),
            'content_param' => $this->get('content'),
            'category_id_param' => $this->get('category_id')
        ]);

        // For updates, fields are optional but if provided, they must be valid
        // We allow empty strings for text fields since they represent clearing the field
        return [
            'title' => 'nullable|string|max:255|unique:articles,title,' . $articleId,
            'content' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'pdf_url' => 'nullable|url',
            'published_at' => 'nullable|date',
            'thumbnail' => 'nullable|image|max:5120', // до 5 МБ
            'video' => 'nullable|mimetypes:video/mp4,video/webm|max:200000', // до 200 МБ
        ];
    }
}