'use client';

import dynamic from "next/dynamic";
import { useState } from "react";
import { useCurrentLocation } from "@/components/useCurrentLocation";
import { searchLocation } from "@/utils/geocode";
import { fetchWeather } from "@/utils/weather";
import axios from "axios";
import LLMChat from "@/components/LLMChat";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const userLocation = useCurrentLocation();
  const [destination, setDestination] = useState("");
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const [weather, setWeather] = useState<any | null>(null);

  const handleSearch = async () => {
    if (!userLocation) return;

    const destinationCoords = await searchLocation(destination);
    if (!destinationCoords) {
      alert("Destination not found!");
      return;
    }
    const res = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [
          [userLocation[1], userLocation[0]],
          [destinationCoords[1], destinationCoords[0]],
        ],
      },
      {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_ORS_API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    const weatherData = await fetchWeather(destinationCoords[0], destinationCoords[1]);
    const geometry = res.data.features[0].geometry.coordinates.map(
      ([lon, lat]: [number, number]) => [lat, lon]
    );
    const dist = res.data.features[0].properties.summary.distance / 1000;
    setRoute(geometry);
    setDistance(dist);
    setWeather(weatherData);
  };

  // Create a dynamic context string that includes current route info
  const dynamicContext = `
Distance: ${distance ? distance.toFixed(2) : "N/A"} km
Weather: ${
    weather ? `${weather.main.temp}°C, ${weather.weather[0].description}` : "N/A"
  }
User Location: ${
    userLocation ? `${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}` : "N/A"
  }
  `;

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="flex flex-row items-center justify-between mb-4">
            <img src="/assets/logo.png" className="h-8" alt="Logo" />
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search destination (e.g. Morocco Mall)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="border border-gray-300 px-3 py-2 mr-2 rounded-md focus:outline-none text-white"
              />
              <button onClick={handleSearch} className="flex items-center gap-2 bg-blue-600 border-2 border-blue-600 text-white px-4 py-2 rounded-md">
                Calculate Route
              </button>
            </div>
          </div>
          {distance && (
            <p className="mt-2 text-white">
              <span className="font-semibold">Distance:</span> {distance.toFixed(2)} km
              {weather && (
                <span className="ml-4">
                  | <span className="font-semibold">Weather:</span> {weather.main.temp}°C, {weather.weather[0].description}
                </span>
              )}
            </p>
          )}
          <div className="mt-4">
            <Map route={route || undefined} userLocation={userLocation || undefined} />
          </div>
        </div>
        {/* Pass the dynamicContext to LLMChat, which will be merged with the static transportation context */}
        <div className="w-full md:w-1/3">
          <LLMChat context={dynamicContext} />
        </div>
      </div>
    </div>
  );
}
