<?php

namespace App\Http\Controllers;

use App\Services\WeatherService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WeatherController extends Controller
{
    private WeatherService $weatherService;

    public function __construct(WeatherService $weatherService)
    {
        $this->weatherService = $weatherService;
    }

    public function getWeather(Request $request): JsonResponse
    {
        $request->validate([
            'city' => 'required|string|max:255',
            'units' => 'string|in:metric,imperial',
        ]);

        $coordinates = $this->weatherService->getCoordinates($request->city);

        if (!$coordinates) {
            return response()->json([
                'message' => 'City not found'
            ], 404);
        }

        $current = $this->weatherService->getCurrentWeather(
            $coordinates['lat'],
            $coordinates['lon'],
            $request->input('units', 'metric')
        );

        $forecast = $this->weatherService->getForecast(
            $coordinates['lat'],
            $coordinates['lon'],
            $request->input('units', 'metric')
        );

        $formattedData = $this->weatherService->formatWeatherData($current, $forecast);

        return response()->json($formattedData);
    }
}