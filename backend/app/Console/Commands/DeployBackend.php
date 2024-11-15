<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use ZipArchive;

class DeployBackend extends Command
{
    protected $signature = 'deploy:backend';
    protected $description = 'Prepares backend for deployment by optimizing and compressing the directory.';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        // Step 1: Run optimization commands
        $this->info('Running optimization commands...');
        $this->call('optimize:clear');
        $this->call('config:cache');
        $this->call('route:cache');
        $this->call('view:cache');
        exec('composer install --optimize-autoloader --no-dev');

        // Step 2: Prepare deployment folder structure
        $this->info('Preparing deployment folder structure...');
        $deployPath = base_path('../flss-laravel-prod');
        $basePath = $deployPath . '/base';
        $publicPath = base_path('public');

        // Clean up any existing deploy directory
        if (File::exists($deployPath)) {
            File::deleteDirectory($deployPath);
        }

        // Create necessary directories
        File::makeDirectory($basePath, 0755, true);

        // Copy backend (excluding the public directory) to the "base" folder
        $backendSource = base_path();
        $backendFiles = File::allFiles($backendSource, true);
        $backendDirectories = File::directories($backendSource, true);

        // Copy all backend files
        foreach ($backendFiles as $file) {
            $relativePath = $file->getRelativePathname();
            if (strpos($relativePath, 'public') !== 0) {
                $destinationPath = $basePath . '/' . $relativePath;
                File::ensureDirectoryExists(dirname($destinationPath));
                File::copy($file->getRealPath(), $destinationPath);
            }
        }

        // Copy all backend directories
        foreach ($backendDirectories as $directory) {
            $relativePath = str_replace($backendSource, '', $directory);
            if (strpos($relativePath, 'public') !== 0) {
                $destinationPath = $basePath . '/' . ltrim($relativePath, '/');
                File::ensureDirectoryExists($destinationPath);
            }
        }

        // Copy public assets to the root of deploy directory
        $deployPublicFiles = [
            'css',
            '.htaccess',
            'favicon.ico',
            'index.php',
            'robots.txt',
        ];

        foreach ($deployPublicFiles as $file) {
            $sourceFilePath = $publicPath . '/' . $file;
            $destinationPath = $deployPath . '/' . $file;

            if (File::exists($sourceFilePath)) {
                if (File::isDirectory($sourceFilePath)) {
                    File::copyDirectory($sourceFilePath, $destinationPath);
                } else {
                    File::copy($sourceFilePath, $destinationPath);
                }
            } else {
                $this->warn($file . ' file does not exist in the public directory.');
            }
        }

        // Step 3: Replace the environment file with production one inside the deploy folder
        $this->info('Setting up production environment file inside deploy folder...');
        $envProdPath = base_path('.env.prod');
        $envDeployPath = $basePath . '/.env';

        if (File::exists($envProdPath)) {
            File::copy($envProdPath, $envDeployPath);
            $this->info('.env.prod has been copied to .env in deploy folder');
        } else {
            $this->error('.env.prod file does not exist!');
            return 1;
        }

        // Step 4: Replace index.php with index.prod.php in the deploy public folder
        $this->info('Setting up index.php for production in deploy folder...');
        $indexProdPath = $publicPath . '/index.prod.php';
        $indexDeployPath = $deployPath . '/index.php';

        if (File::exists($indexProdPath)) {
            File::copy($indexProdPath, $indexDeployPath);
            $this->info('index.prod.php has been copied to index.php in deploy folder');
        } else {
            $this->error('index.prod.php file does not exist!');
            return 1;
        }

        // Step 5: Compress the deploy directory into a zip file
        $this->info('Compressing deploy directory...');
        $zip = new ZipArchive();
        $zipFilePath = base_path('../flss-laravel-prod.zip');

        if ($zip->open($zipFilePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            $source = realpath($deployPath);

            if (is_dir($source)) {
                $files = new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($source),
                    \RecursiveIteratorIterator::LEAVES_ONLY
                );

                foreach ($files as $file) {
                    if (!$file->isDir()) {
                        $filePath = $file->getRealPath();
                        // Normalize the relative path to use Unix-style separators
                        $relativePath = str_replace(DIRECTORY_SEPARATOR, '/', substr($filePath, strlen($source) + 1));
                        $zip->addFile($filePath, $relativePath);
                    }
                }
            }
            $zip->close();
            $this->info('Deploy directory has been compressed to flss-laravel-prod.zip');
        } else {
            $this->error('Failed to create the zip file.');
            return 1;
        }

        // Step 6: Delete the uncompressed deploy folder
        $this->info('Cleaning up uncompressed deploy folder...');
        if (File::deleteDirectory($deployPath)) {
            $this->info('Uncompressed deploy folder has been deleted.');
        } else {
            $this->error('Failed to delete the uncompressed deploy folder.');
            return 1;
        }

        $this->info('Deployment preparation complete.');
        return 0;
    }
}
