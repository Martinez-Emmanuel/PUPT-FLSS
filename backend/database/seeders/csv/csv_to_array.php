<?php

namespace Database\Seeders\Csv;

use League\Csv\Reader;

class CsvToArray
{
    public static function convert(string $csvPath): array
    {
        try {
            $csv = Reader::createFromPath($csvPath, 'r');
            $csv->setHeaderOffset(0);
            $records = $csv->getRecords();

            $data = [];
            foreach ($records as $record) {
                $data[] = $record;
            }
            return $data;

        } catch (\League\Csv\Exception $e) {
            throw new \Exception('Error reading CSV: ' . $e->getMessage());
        }
    }
}