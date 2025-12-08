<?php

namespace App\Helpers;

class Transliterator
{
    /**
     * Custom transliteration map for better Russian to Latin conversion
     * Fixes common issues like "obmanyvaiut" -> "obmanyvayut"
     */
    private static $transliterationMap = [
        // Russian vowels
        'а' => 'a', 'А' => 'A',
        'е' => 'e', 'Е' => 'E',
        'ё' => 'yo', 'Ё' => 'Yo',
        'и' => 'i', 'И' => 'I',
        'о' => 'o', 'О' => 'O',
        'у' => 'u', 'У' => 'U',
        'ы' => 'y', 'Ы' => 'Y',
        'э' => 'e', 'Э' => 'E',
        'ю' => 'yu', 'Ю' => 'Yu',
        'я' => 'ya', 'Я' => 'Ya',
        
        // Russian consonants
        'б' => 'b', 'Б' => 'B',
        'в' => 'v', 'В' => 'V',
        'г' => 'g', 'Г' => 'G',
        'д' => 'd', 'Д' => 'D',
        'ж' => 'zh', 'Ж' => 'Zh',
        'з' => 'z', 'З' => 'Z',
        'й' => 'y', 'Й' => 'Y',
        'к' => 'k', 'К' => 'K',
        'л' => 'l', 'Л' => 'L',
        'м' => 'm', 'М' => 'M',
        'н' => 'n', 'Н' => 'N',
        'п' => 'p', 'П' => 'P',
        'р' => 'r', 'Р' => 'R',
        'с' => 's', 'С' => 'S',
        'т' => 't', 'Т' => 'T',
        'ф' => 'f', 'Ф' => 'F',
        'х' => 'kh', 'Х' => 'Kh',
        'ц' => 'ts', 'Ц' => 'Ts',
        'ч' => 'ch', 'Ч' => 'Ch',
        'ш' => 'sh', 'Ш' => 'Sh',
        'щ' => 'sch', 'Щ' => 'Sch',
        'ъ' => '', 'Ъ' => '',
        'ь' => '', 'Ь' => '',
    ];

    /**
     * Transliterate Russian text to Latin with improved mapping
     */
    public static function transliterate(string $text): string
    {
        // Apply custom transliteration
        $result = '';
        $length = mb_strlen($text, 'UTF-8');
        
        for ($i = 0; $i < $length; $i++) {
            $char = mb_substr($text, $i, 1, 'UTF-8');
            if (isset(self::$transliterationMap[$char])) {
                $result .= self::$transliterationMap[$char];
            } else {
                $result .= $char;
            }
        }
        
        // Convert to ASCII slug
        $result = preg_replace('/[^A-Za-z0-9\-_]/', '-', $result);
        $result = preg_replace('/\-+/', '-', $result);
        $result = trim($result, '-');
        
        return strtolower($result);
    }

    /**
     * Generate SEO-friendly slug with ID prefix
     */
    public static function generateSlug(int $id, string $title): string
    {
        $transliterated = self::transliterate($title);
        $base = $transliterated ?: substr(md5($title), 0, 8);
        return $id . '-' . $base;
    }
}