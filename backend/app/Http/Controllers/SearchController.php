<?php

namespace App\Http\Controllers;

use App\Services\SemanticSearchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


class SearchController extends Controller
{
    protected $semanticSearchService;
    
    public function __construct(SemanticSearchService $semanticSearchService)
    {
        $this->semanticSearchService = $semanticSearchService;
    }
    
    public function search(Request $request)
    {
        try {
            $query = trim($request->get('q', ''));

            if (empty($query)) {
                return response()->json([
                    'articles' => [],
                    'categories' => [],
                    'topics' => [],
                ]);
            }

            $results = $this->semanticSearchService->search($query);
            
            // Convert collections to arrays for JSON serialization
            return response()->json([
                'articles' => $results['articles']->toArray(),
                'categories' => $results['categories']->toArray(),
                'topics' => $results['topics']->toArray(),
            ]);
        } catch (\Exception $e) {
            Log::error('Search error: ' . $e->getMessage(), [
                'query' => $request->get('q'),
                'trace' => $e->getTraceAsString()
            ]);

            // Return empty results instead of 500 error
            return response()->json([
                'articles' => [],
                'categories' => [],
                'topics' => [],
                'error' => 'Search service temporarily unavailable',
            ], 200);
        }
    }
}