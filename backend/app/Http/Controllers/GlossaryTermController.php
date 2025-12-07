<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\GlossaryTerm;
use Illuminate\Http\Request;

class GlossaryTermController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $letter = $request->get('letter');

        $query = GlossaryTerm::orderBy('term');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('term', 'LIKE', "%{$search}%")
                  ->orWhere('definition', 'LIKE', "%{$search}%");
            });
        }

        if ($letter) {
            $query->where('first_letter', $letter);
        }

        $terms = $query->get();

        // Group terms by first letter
        $groupedTerms = $terms->groupBy('first_letter')->map(function ($items) {
            return [
                'letter' => $items->first()->first_letter,
                'terms' => $items->map(function ($item) {
                    return [
                        'term' => $item->term,
                        'definition' => $item->definition
                    ];
                })->values()
            ];
        })->values();

        return response()->json($groupedTerms);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'term' => 'required|string|max:255',
            'definition' => 'required|string'
        ]);

        $term = GlossaryTerm::create($request->only(['term', 'definition']));

        return response()->json($term, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, GlossaryTerm $glossaryTerm)
    {
        $request->validate([
            'term' => 'required|string|max:255',
            'definition' => 'required|string'
        ]);

        $glossaryTerm->update($request->only(['term', 'definition']));

        return response()->json($glossaryTerm);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GlossaryTerm $glossaryTerm)
    {
        $glossaryTerm->delete();

        return response()->json(null, 204);
    }

    /**
     * Get all unique first letters
     */
    public function letters()
    {
        $letters = GlossaryTerm::select('first_letter')
            ->distinct()
            ->orderBy('first_letter')
            ->pluck('first_letter');

        return response()->json($letters);
    }
}