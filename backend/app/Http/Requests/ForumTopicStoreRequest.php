<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ForumTopicStoreRequest extends FormRequest
{
    public function authorize()
    {
        // Только аутентифицированный пользователь может создавать тему
        return $this->user() !== null;
    }

    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'nullable|exists:categories,id',
        ];
    }
}