<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use JsonException;
use Illuminate\Encryption\EncryptException;

class EncryptJsonResponse
{
    /**
     * Encrypts successful JSON responses (200-299) before sending to client.
     * Wraps encrypted data in {'encrypted': 'encryptedString'} format.
     * 
     * @param \Illuminate\Http\Request $request
     * @param \Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        // Skip encryption for non-JSON responses or non-successful status codes
        if (!($response instanceof JsonResponse) || 
            $response->getStatusCode() < 200 || 
            $response->getStatusCode() >= 300) {
            return $response;
        }

        try {
            // Extract response data and prepare for encryption
            $data = $response->getData(true);
            
            // Convert data to JSON string with strict error checking
            $jsonData = json_encode($data, JSON_THROW_ON_ERROR);
            if ($jsonData === false) {
                throw new JsonException('Failed to encode response data');
            }

            // Encrypt the JSON string using Laravel's encryption
            $encryptedData = Crypt::encryptString($jsonData);
            
            // Wrap encrypted data in standard response format
            $wrappedResponse = json_encode(
                ['encrypted' => $encryptedData],
                JSON_THROW_ON_ERROR
            );
            
            $response->setContent($wrappedResponse);
            
        } catch (JsonException $e) {
            // Handle JSON encoding/decoding failures 
            // (usually due to invalid UTF-8 or circular references)
            Log::error('JSON encoding error in encryption middleware: ' . $e->getMessage(), [
                'exception' => $e,
                'statusCode' => $response->getStatusCode()
            ]);
            return response()->json(
                ['message' => 'Error processing response format'],
                422
            );
            
        } catch (EncryptException $e) {
            // Handle encryption failures (usually due to key/cipher issues)
            Log::error('Encryption error in middleware: ' . $e->getMessage(), [
                'exception' => $e,
                'statusCode' => $response->getStatusCode()
            ]);
            return response()->json(
                ['message' => 'Error securing response'],
                500
            );
            
        } catch (\Exception $e) {
            // Catch any unexpected errors to prevent exposure of system details
            Log::error('Unexpected error in encryption middleware: ' . $e->getMessage(), [
                'exception' => $e,
                'statusCode' => $response->getStatusCode()
            ]);
            return response()->json(
                ['message' => 'Internal server error'],
                500
            );
        }

        return $response;
    }
}
