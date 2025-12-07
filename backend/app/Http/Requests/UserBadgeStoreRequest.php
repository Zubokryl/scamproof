<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserBadgeStoreRequest extends FormRequest
{
    public function authorize()
    {
        // Выдавать бейджи могут только админы — гарантируем серверную проверку
        return $this->user() && in_array($this->user()->role, ['admin']);
    }

    public function rules()
    {
        return [
            'badge_type' => 'required|string|max:100',
            'title' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
        ];
    }
}