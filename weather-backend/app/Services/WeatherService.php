<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class WeatherService
{
    private string $apiKey;
    private string $apiUrl;
    private string $geocodingUrl;

    public function __construct()
    {
        $this->apiKey = config('services.openweather.key');
        $this->apiUrl = config('services.openweather.url');
        $this->geocodingUrl = config('services.openweather.geocoding_url');
    }

    public function getCoordinates(string $city)
    {
        $cacheKey = "geocoding_{$city}";
        
        return Cache::remember($cacheKey, 3600, function () use ($city) {
            $response = Http::get("{$this->geocodingUrl}/direct", [
                'q' => $city,
                'limit' => 1,
                'appid' => $this->apiKey,
            ]);
            
            $data = $response->json();
            
            if (empty($data)) {
                return null;
            }
            
            return [
                'lat' => $data[0]['lat'],
                'lon' => $data[0]['lon'],
            ];
        });
    }

    public function getCurrentWeather(float $lat, float $lon, string $units = 'metric')
    {
        $cacheKey = "current_weather_{$lat}_{$lon}_{$units}";
        
        return Cache::remember($cacheKey, 300, function () use ($lat, $lon, $units) {
            $response = Http::get("{$this->apiUrl}/weather", [
                'lat' => $lat,
                'lon' => $lon,
                'units' => $units,
                'appid' => $this->apiKey,
            ]);
            
            return $response->json();
        });
    }

    public function getForecast(float $lat, float $lon, string $units = 'metric')
    {
        $cacheKey = "forecast_{$lat}_{$lon}_{$units}";
        
        return Cache::remember($cacheKey, 300, function () use ($lat, $lon, $units) {
            $response = Http::get("{$this->apiUrl}/forecast", [
                'lat' => $lat,
                'lon' => $lon,
                'units' => $units,
                'appid' => $this->apiKey,
            ]);
            
            return $response->json();
        });
    }

    public function formatWeatherData($current, $forecast)
    {
        // Get the next 3 days from forecast (forecast returns data in 3-hour intervals)
        $dailyForecasts = [];
        $processedDates = [];
        
        foreach ($forecast['list'] as $item) {
            $date = date('Y-m-d', $item['dt']);
            
            // Skip if we already have this date or if we have 3 days
            if (in_array($date, $processedDates) || count($dailyForecasts) >= 3) {
                continue;
            }
            
            $processedDates[] = $date;
            $dailyForecasts[] = [
                'dt' => $item['dt'],
                'temp' => [
                    'day' => $item['main']['temp']
                ],
                'weather' => $item['weather']
            ];
        }

        return [
            'current' => [
                'temp' => $current['main']['temp'],
                'weather' => $current['weather'],
                'humidity' => $current['main']['humidity'],
                'wind_speed' => $current['wind']['speed']
            ],
            'daily' => $dailyForecasts
        ];
    }
}