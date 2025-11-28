<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommentModerationRequest extends FormRequest
{
    public function authorize()
    {
        // Ожидается, что middleware role:admin,moderator уже применяется к маршруту.
        return $this->user() && in_array($this->user()->role, ['admin', 'moderator']);
    }

    public function rules()
    {
        return [
            'note' => 'nullable|string|max:500',
        ];
    }
}