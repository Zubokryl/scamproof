@echo off
echo Setting up Meilisearch for your project...

echo 1. Downloading Meilisearch...
curl -L https://github.com/meilisearch/meilisearch/releases/download/v1.16.1/meilisearch-windows-amd64.exe -o meilisearch.exe

echo 2. Starting Meilisearch...
start "" meilisearch.exe --master-key=masterKey --env=development

echo 3. Waiting for Meilisearch to start...
timeout /t 5 /nobreak >nul

echo 4. Importing data...
cd backend
php artisan scout:import "App\Models\Article"
php artisan scout:import "App\Models\Category"
php artisan scout:import "App\Models\ForumTopic"

echo Setup complete! Meilisearch is now running and data has been imported.
pause