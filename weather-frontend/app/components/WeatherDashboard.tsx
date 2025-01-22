"use client";

import React, { useState, useEffect } from "react";

interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    weather: {
      description: string;
      icon: string;
    }[];
  };
  daily: Array<{
    dt: number;
    temp: {
      day: number;
      min: number;
      max: number;
    };
    weather: {
      description: string;
      icon: string;
    }[];
  }>;
}

const WeatherDashboard = () => {
  const [city, setCity] = useState("Nairobi");
  const [searchCity, setSearchCity] = useState(city);
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      if (!searchCity) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:8000/api/weather?city=${searchCity}&units=${
            unit === "C" ? "metric" : "imperial"
          }`
        );

        if (!response.ok) {
          throw new Error("City not found");
        }

        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch weather data");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [searchCity, unit]);

  const formatWindDirection = (deg: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  const handleSearch = () => {
    setSearchCity(city);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Search Bar */}
      <div className="flex gap-4 items-center mb-6">
        <input
          type="text"
          placeholder="Search city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="input input-primary flex-1"
        />
        <button onClick={handleSearch} className="btn btn-primary">
          Go
        </button>
        <button
          onClick={() => setUnit(unit === "C" ? "F" : "C")}
          className="btn btn-secondary"
        >
          °{unit}
        </button>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="alert alert-info">
          <div className="loading loading-spinner"></div>
          <span>Loading weather data...</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Weather Data Display */}
      {weather && (
        <div className="grid grid-cols-1 gap-4">
          {/* Current Weather */}
          <div className="flex items-center gap-4 bg-base-100 shadow-lg p-4">
            <WeatherIcon code={weather.current.weather[0].icon} />
            <div>
              <h2 className="text-4xl">
                {weather.current.temp}°{unit}
              </h2>
              <p className="text-lg">{weather.current.weather[0].description}</p>
              <p className="text-sm text-gray-500">{searchCity}</p>
            </div>
          </div>

          {/* Date and Forecast */}
          <div>
            <h3 className="text-xl mb-2">{new Date().toLocaleDateString()}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {weather.daily.slice(0, 3).map((day, index) => (
                <div key={index} className="card card-compact bg-base-100 shadow-xl">
                  <div className="card-body items-center text-center">
                    <h3 className="card-title">
                      {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </h3>
                    <div className="text-3xl my-2">
                      <WeatherIcon code={day.weather[0].icon} />
                    </div>
                    <p className="text-lg font-semibold">
                      {day.temp.day}°{unit}
                    </p>
                    <p className="text-sm">
                      {day.temp.min}°{unit} - {day.temp.max}°{unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wind and Humidity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card card-compact bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Wind Status</h3>
                <p className="text-2xl">
                  {weather.current.windSpeed} km/h{" "}
                  <span className="text-sm text-gray-500">
                    {weather.current.windDirection || formatWindDirection(90)}
                  </span>
                </p>
              </div>
            </div>
            <div className="card card-compact bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">Humidity</h3>
                <p className="text-2xl">{weather.current.humidity}%</p>
                <div className="progress progress-primary mt-2">
                  <div
                    className="progress-bar"
                    style={{ width: `${weather.current.humidity}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Weather Icon Component
const WeatherIcon = ({ code }: { code: string }) => {
  const getIcon = (code: string) => {
    const iconMap: Record<string, string> = {
      "01d": "☀️",
      "01n": "🌙",
      "02d": "⛅",
      "02n": "☁️",
      "03d": "☁️",
      "03n": "☁️",
      "04d": "☁️",
      "04n": "☁️",
      "09d": "🌧️",
      "09n": "🌧️",
      "10d": "🌦️",
      "10n": "🌧️",
      "11d": "⛈️",
      "11n": "⛈️",
      "13d": "❄️",
      "13n": "❄️",
      "50d": "🌫️",
      "50n": "🌫️",
    };
    return iconMap[code] || "☁️";
  };

  return <span className="text-6xl">{getIcon(code)}</span>;
};

export default WeatherDashboard;