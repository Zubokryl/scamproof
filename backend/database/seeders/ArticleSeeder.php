<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Article;
use App\Models\Category;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the health category
        $healthCategory = Category::where('slug', 'health')->first();
        
        if ($healthCategory) {
            // Create sample articles in the health category
            Article::create([
                'title' => 'Как распознать мошенничество в сфере здравоохранения',
                'content' => '<p>В сфере здравоохранения существует множество видов мошенничества. В этой статье мы рассмотрим основные признаки, по которым можно распознать обман со стороны медицинских учреждений и частных врачей.</p><p>Основные признаки мошенничества в здравоохранении включают: завышенные цены на лечение, ненужные процедуры, отсутствие лицензий и сертификатов, а также давление на пациента для покупки дополнительных услуг.</p>',
                'slug' => 'how-to-recognize-healthcare-fraud',
                'category_id' => $healthCategory->id,
                'created_by' => 1, // Assuming admin user ID is 1
                'published_at' => now(),
            ]);
            
            Article::create([
                'title' => 'Пять способов защитить себя от медицинских афер',
                'content' => '<p>Медицинские аферы становятся все более изощренными. В этой статье мы представим пять эффективных способов защиты от мошенничества в сфере здравоохранения.</p><p>1. Всегда проверяйте лицензии и сертификаты медицинского учреждения.<br>2. Не соглашайтесь на дорогостоящие процедуры без второго мнения.<br>3. Избегайте оплаты наличными без чеков и документов.<br>4. Проверяйте отзывы других пациентов.<br>5. Обращайтесь в надзорные органы при подозрении на мошенничество.</p>',
                'slug' => 'five-ways-to-protect-from-medical-scams',
                'category_id' => $healthCategory->id,
                'created_by' => 1, // Assuming admin user ID is 1
                'published_at' => now(),
            ]);
        }
    }
}
