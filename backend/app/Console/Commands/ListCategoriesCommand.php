<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ListCategoriesCommand extends Command
{
    protected $signature = 'categories:list';
    protected $description = 'List all categories in the database';

    public function handle()
    {
        $categories = DB::table('categories')->get();

        if ($categories->isEmpty()) {
            $this->info('No categories found in the database.');
            return;
        }

        $this->info('Categories in database:');
        $this->info('=====================');

        foreach ($categories as $category) {
            $this->line("ID: {$category->id}");
            $this->line("Slug: {$category->slug}");
            $this->line("Name: {$category->name}");
            $this->line("Description: {$category->description}");
            $this->line("Icon: {$category->icon}");
            $this->line("---------------------");
        }

        $this->info("Total categories: " . count($categories));
    }
}