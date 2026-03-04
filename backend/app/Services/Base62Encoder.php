<?php

namespace App\Services;

class Base62Encoder
{
    private const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    private const BASE = 62;
    private const GEN_LENGTH = 6;

    public function encode(int $id): string
    {
        $encoded = '';

        while ($id > 0) {
            $encoded = self::CHARS[$id % self::BASE] . $encoded;
            $id = intdiv($id, self::BASE);
        }

        return str_pad($encoded, self::GEN_LENGTH, '0', STR_PAD_LEFT);
    }
}
