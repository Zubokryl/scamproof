<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GlossaryTerm extends Model
{
    protected $fillable = [
        'term',
        'definition',
        'first_letter'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected static function booted()
    {
        static::creating(function ($term) {
            $term->first_letter = mb_strtoupper(mb_substr($term->term, 0, 1));
        });

        static::updating(function ($term) {
            $term->first_letter = mb_strtoupper(mb_substr($term->term, 0, 1));
        });
    }
}