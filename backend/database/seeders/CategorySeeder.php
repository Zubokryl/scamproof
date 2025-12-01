<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define categories based on the folders in frontend/src/app/database
        $categories = [
            [
                'slug' => 'commercial',
                'name' => 'Коммерческие предложения',
                'description' => 'Защита от мошенничества в коммерческих предложениях и рекламных акциях',
                'icon' => '💼'
            ],
            [
                'slug' => 'cybersecurity',
                'name' => 'Кибербезопасность',
                'description' => 'Защита от киберугроз, фишинга и других цифровых атак',
                'icon' => '🛡️'
            ],
            [
                'slug' => 'education',
                'name' => 'Образование',
                'description' => 'Мошенничество в образовательных учреждениях и онлайн-курсах',
                'icon' => '🎓'
            ],
            [
                'slug' => 'entertainment',
                'name' => 'Развлечения',
                'description' => 'Афёры и обман в индустрии развлечений и досуга',
                'icon' => '🎮'
            ],
            [
                'slug' => 'finance',
                'name' => 'Финансы',
                'description' => 'Финансовые пирамиды, кредитные и банковские мошенничества',
                'icon' => '💰'
            ],
            [
                'slug' => 'health',
                'name' => 'Здоровье',
                'description' => 'Мошенничество в сфере здравоохранения и медицинские аферы',
                'icon' => '💊'
            ],
            [
                'slug' => 'real-estate',
                'name' => 'Недвижимость',
                'description' => 'Мошенничество при покупке, продаже и аренде недвижимости',
                'icon' => '🏠'
            ],
            [
                'slug' => 'social-networks',
                'name' => 'Социальные сети',
                'description' => 'Защита от афер и обмана в социальных сетях',
                'icon' => '📱'
            ],
            [
                'slug' => 'social-scams',
                'name' => 'Социальные аферы',
                'description' => 'Мошенничество, основанное на доверии и социальной инженерии',
                'icon' => '👥'
            ],
            [
                'slug' => 'travel',
                'name' => 'Туризм',
                'description' => 'Туристические аферы и обман путешественников',
                'icon' => '✈️'
            ]
        ];

        foreach ($categories as $categoryData) {
            \App\Models\Category::updateOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );
        }
    }
}