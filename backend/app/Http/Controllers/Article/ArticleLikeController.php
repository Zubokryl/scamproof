<?php

namespace App\Http\Controllers\Article;

use App\Http\Controllers\Controller;
use App\Models\ArticleLike;
use Illuminate\Http\Request;

class ArticleLikeController extends Controller
{
    public function toggle(Request $request, $articleId) {
        $like = ArticleLike::where('article_id', $articleId)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($like) {
            $like->delete();
            return response()->json(['liked' => false]);
        }

        ArticleLike::create([
            'article_id' => $articleId,
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['liked' => true]);
    }
}
