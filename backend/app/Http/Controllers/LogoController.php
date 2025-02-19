<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Logo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

/**
 * Handles operations for managing university and government logos.
 *
 * This controller manages the upload, retrieval, and deletion of logos used in the system.
 * It supports two types of logos: university and government logos.
 */

class LogoController extends Controller
{
    private const MAX_FILE_SIZE             = 1024; // 1MB
    private const MAX_FILENAME_LENGTH       = 100;
    private const SANITIZED_FILENAME_LENGTH = 80;
    private const ALLOWED_MIME_TYPES        = 'jpeg,png,jpg';
    private const STORAGE_DISK              = 'logos';
    private const STORAGE_PATH              = '';

    /**
     * Retrieve all logos stored in the system.
     *
     * @return JsonResponse Array of all logos with their URLs
     */
    public function index(): JsonResponse
    {
        $logos = Logo::all()->map(function ($logo) {
            return $this->addUrlToLogo($logo->toArray());
        });

        return response()->json($logos);

    }

    /**
     * Upload a new logo or replace an existing one.
     *
     * Validates and stores the uploaded logo file. If a logo of the same type
     * already exists, it will be replaced with the new one.
     *
     * @param Request $request Contains 'type' (university|government) and 'logo' (file) fields
     * @return JsonResponse The newly created/updated logo with its URL
     * @throws ValidationException When file validation fails
     */
    public function upload(Request $request): JsonResponse
    {
        $validator = $this->createValidator($request);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('logo');
        $type = $request->input('type');

        $this->deleteExistingLogo($type);

        $finalFileName = $this->sanitizeFileName($file);
        $path          = $file->storeAs(self::STORAGE_PATH, $type . '_' . $finalFileName, self::STORAGE_DISK);

        $logo = Logo::create([
            'type'      => $type,
            'file_name' => $finalFileName,
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json($this->addUrlToLogo($logo->toArray()), 201);

    }

    /**
     * Serve the actual image file for a logo.
     *
     * Returns the image with appropriate headers for caching and CORS.
     *
     * @param string $type The logo type (university|government)
     * @return JsonResponse|Response The image file or 404 if not found
     */
    public function getImage(string $type): JsonResponse | \Illuminate\Http\Response
    {
        $logo = Logo::where('type', $type)->first();

        if (! $logo) {
            return $this->notFoundResponse();
        }

        if (! Storage::disk(self::STORAGE_DISK)->exists($logo->file_path)) {
            return $this->notFoundResponse();
        }

        $file = Storage::disk(self::STORAGE_DISK)->get($logo->file_path);

        return response($file)
            ->header('Content-Type', $logo->mime_type)
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Retrieve details of a specific logo type.
     *
     * @param string $type The logo type (university|government)
     * @return JsonResponse Logo details including URL
     */
    public function show(string $type): JsonResponse
    {
        $logo = Logo::where('type', $type)->first();

        if (! $logo) {
            return $this->notFoundResponse();
        }

        return response()->json($this->addUrlToLogo($logo->toArray()));

    }

    /**
     * Delete a specific logo from storage.
     *
     * Removes both the database record and the stored file.
     *
     * @param string $type The logo type to delete (university|government)
     * @return JsonResponse Success/failure message
     */
    public function delete(string $type): JsonResponse
    {
        $logo = Logo::where('type', $type)->first();

        if (! $logo) {
            return $this->notFoundResponse();
        }

        $fileDeleted = Storage::disk(self::STORAGE_DISK)->delete($logo->file_path);

        $logo->delete();

        return response()->json([
            'message'      => 'Logo deleted successfully',
            'file_deleted' => $fileDeleted,
        ]);
    }

    /**
     * Create a validator for logo upload requests.
     *
     * Validates:
     * - Logo type (must be university or government)
     * - File presence and type (must be JPG/PNG)
     * - File size (max 1MB)
     * - Filename length
     *
     * @param Request $request The request to validate
     * @return \Illuminate\Validation\Validator
     */
    private function createValidator(Request $request): \Illuminate\Validation\Validator
    {
        return Validator::make($request->all(), [
            'type' => [
                'required',
                'string',
                'in:' . implode(',', Logo::getTypes()),
            ],
            'logo' => [
                'required',
                'file',
                'mimes:' . self::ALLOWED_MIME_TYPES,
                'max:' . self::MAX_FILE_SIZE,
                function ($attribute, $value, $fail) {
                    if (strlen($value->getClientOriginalName()) > self::MAX_FILENAME_LENGTH) {
                        $fail('The filename exceeds the maximum length of ' . self::MAX_FILENAME_LENGTH . ' characters.');
                    }
                },
            ],
        ], [
            'type.required' => 'The logo type is required.',
            'type.in'       => 'Invalid logo type. Allowed types: ' . implode(', ', Logo::getTypes()),
            'logo.required' => 'Please select a logo file to upload.',
            'logo.file'     => 'The uploaded file is invalid.',
            'logo.mimes'    => 'The logo must be a JPG or PNG image.',
            'logo.max'      => 'The logo must not be larger than 1MB.',
        ]);
    }

    /**
     * Delete an existing logo of the specified type.
     *
     * @param string $type The logo type to delete
     * @return void
     */
    private function deleteExistingLogo(string $type): void
    {
        $existingLogo = Logo::where('type', $type)->first();
        if ($existingLogo) {
            Storage::disk(self::STORAGE_DISK)->delete($existingLogo->file_path);
            $existingLogo->delete();
        }
    }

    /**
     * Sanitize the uploaded file name.
     *
     * Removes special characters and truncates to maximum allowed length.
     *
     * @param UploadedFile $file The uploaded file
     * @return string Sanitized filename
     */
    private function sanitizeFileName($file): string
    {
        $originalName   = $file->getClientOriginalName();
        $extension      = $file->getClientOriginalExtension();
        $nameWithoutExt = pathinfo($originalName, PATHINFO_FILENAME);

        $sanitizedName = substr(
            preg_replace('/[^a-zA-Z0-9-_.]/', '', $nameWithoutExt),
            0,
            self::SANITIZED_FILENAME_LENGTH
        );

        return $sanitizedName . '.' . $extension;
    }

    /**
     * Add a public URL to a logo array.
     *
     * @param array $logo The logo array to enhance
     * @return array Logo array with added URL
     */
    private function addUrlToLogo(array $logo): array
    {
        $logo['url'] = env('APP_ENV') === 'production'
        ? env('APP_URL') . '/logos/' . $logo['file_path']
        : asset('logos/' . $logo['file_path']);

        return $logo;
    }

    /**
     * Generate a standard 404 not found response.
     *
     * @return JsonResponse
     */
    private function notFoundResponse(): JsonResponse
    {
        return response()->json(['message' => 'Logo not found'], 404);
    }
}
