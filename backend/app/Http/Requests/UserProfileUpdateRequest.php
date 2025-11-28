<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserProfileUpdateRequest extends FormRequest
{
    public function authorize()
    {
        // пользователь может обновлять только свой профиль
        return $this->user() !== null;
    }

    public function rules()
    {
        $userId = $this->user()->id ?? null;

        return [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255|unique:users,email,' . $userId,
            'bio' => 'nullable|string|max:1000',
            'avatar_url' => 'nullable|url',
            // добавьте другие поля профиля при необходимости
        ];
    }
}