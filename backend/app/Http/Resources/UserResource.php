<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        // Handle case where user is null
        if (!$this->resource) {
            return null;
        }
        
        return [
            'id' => $this->id,
            'name' => $this->name,
        ];
    }
}