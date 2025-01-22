<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WeatherController;

Route::get('/api/weather', [WeatherController::class, 'getWeather']);