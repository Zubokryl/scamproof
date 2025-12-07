<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Category;

class UpdateCategoryName extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-category-name';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update the name of the commercial category from "Коммерческие предложения" to "Коммерция"';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Find the commercial category and update its name
        $category = Category::where('slug', 'commercial')->first();
        
        if ($category) {
            $oldName = $category->name;
            $category->name = 'Коммерция';
            $category->save();
            
            $this->info("Category updated successfully!");
            $this->info("Old name: " . $oldName);
            $this->info("New name: " . $category->name);
        } else {
            $this->error("Category not found!");
        }
    }
}