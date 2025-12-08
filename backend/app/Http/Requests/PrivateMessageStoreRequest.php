<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PrivateMessageStoreRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user() !== null;
    }

    public function rules()
    {
        return [
            'receiver_id' => 'required|integer|exists:users,id',
            'content' => 'required|string|max:5000',
        ];
    }
}