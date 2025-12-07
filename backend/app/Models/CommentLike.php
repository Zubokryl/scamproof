<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommentLike extends Model
{
    protected $table = 'article_comment_likes';
    
    protected $fillable = ['comment_id', 'user_id', 'session_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function comment()
    {
        return $this->belongsTo(ArticleComment::class, 'comment_id');
    }
}