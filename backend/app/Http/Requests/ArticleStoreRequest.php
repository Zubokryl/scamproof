<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArticleStoreRequest extends FormRequest
{
    public function authorize()
    {
        // разрешаем создать статью только админам
        return $this->user() && $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'pdf_url' => 'nullable|string',
            'thumbnail' => 'nullable|image|max:5120', // до 5 МБ
            'video' => 'nullable|mimetypes:video/mp4,video/webm|max:200000', // до 200 МБ
            'published_at' => 'nullable|date',
        ];
    }
}