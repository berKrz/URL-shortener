<?php

namespace App\Http\Controllers;

use App\Models\Url;
use App\Services\Base62Encoder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class UrlController extends Controller
{
    public function __construct(private readonly Base62Encoder $encoder) {}

    // POST /api/shorten
    // Body: { original_url: string, custom_url?: string }
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'original_url' => ['required', 'url', 'max:2048'],
            'custom_url'   => [
                'nullable',
                'string',
                'min:7',
                'max:15',
                'regex:/^[a-zA-Z0-9]+$/',
                'unique:urls,short_url',
            ],
        ]);

        $url = isset($validated['custom_url']) // checks if custom_url is not null
            ? $this->storeCustom($validated['original_url'], $validated['custom_url'])
            : $this->storeGenerated($validated['original_url']);

        return response()->json([
            'short_url'    => $url->short_url,
        ], 201);
    }

    // GET /api/{shortUrl}
    public function redirect(string $shortUrl): RedirectResponse
    {
        $url = Url::where('short_url', $shortUrl)->firstOrFail();

        return redirect($url->original_url, 302);
    }

    // Insert a custom short URL directly
    private function storeCustom(string $originalUrl, string $customUrl): Url
    {
        return Url::create([
            'short_url'    => $customUrl,
            'original_url' => $originalUrl,
        ]);
    }

    // Reserve the next sequence ID, encode it, and insert atomically
    private function storeGenerated(string $originalUrl): Url
    {
        return DB::transaction(function () use ($originalUrl) {
            $nextId = (int) DB::selectOne(
                "SELECT nextval(pg_get_serial_sequence('urls', 'id')) AS id"
            )->id;

            return Url::create([
                'id'           => $nextId,
                'short_url'    => $this->encoder->encode($nextId),
                'original_url' => $originalUrl,
            ]);
        });
    }
}