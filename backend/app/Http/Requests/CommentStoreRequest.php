<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommentStoreRequest extends FormRequest
{
    public function authorize()
    {
        // Allow both authenticated and anonymous users to submit comments
        return true;
    }

    public function rules()
    {
        return [
            'content' => 'required|string|max:1000',
        ];
    }
}