'use client';

import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { useState } from "react";
import { useCurrentLocation } from "@/components/useCurrentLocation";
import { searchLocation } from "@/utils/geocode";
import { fetchWeather } from "@/utils/weather";
import axios from "axios";

const Map = dynamic(()=>import('../components/Map'), {ssr: false})

export default function Home() {

  const userLocation = useCurrentLocation();
  const [destination, setDestination] = useState("");
  const[route, setRoute] = useState<[number, number][] | null>(null);
  const[distance, setDistance] = useState<number | null>(null);
  const [weather, setWeather] = useState<any | null>(null);
  const handleSearch = async () =>{
    if(!userLocation) return;

    const destinationCoords = await searchLocation(destination);
    if(!destinationCoords){
      alert('destination not found!');
      return;
    }
    const res = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        coordinates:[
          [userLocation[1], userLocation[0]],
          [destinationCoords[1], destinationCoords[0]]
        ],
      },
      {
        headers:{
          Authorization: process.env.NEXT_PUBLIC_ORS_API_KEY!,
          'Content-Type': 'application/json'
        }
      }
    );
    const weatherData = await fetchWeather(destinationCoords[0], destinationCoords[1]);
    console.log(`Latitude:${destinationCoords[0]} longitude:${ destinationCoords[1]}`)
    const geometry = res.data.features[0].geometry.coordinates.map(
      ([lon, lat]: [number, number]) => [lat, lon]
    );
    const dist = res.data.features[0].properties.summary.distance / 1000;
    setRoute(geometry);
    setDistance(dist);
    setWeather(weatherData);
  }
  return (
    <div className="p-4">
      <div className="flex flex-row items-center justify-between  mb-4">
        <img src="/assets/logo.png" className="h-8" />
        <div className="flex justify-end items-center">
          <input
            type="text"
            placeholder="Search destination (e.g. morocco mall)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="border w-xs px-3 py-2 mr-2"
          />
          <button onClick={handleSearch} className="flex justify-center items-center gap-x-2 bg-blue-600 border-blue-600 border-2 pointer-cursor text-white px-4 py-2">
            <p>Calculate Route</p>
            <Search className="h-4 w-4"/>
          </button>
        </div>
      </div>
      {distance && (
        <p className="mt-2">
          Distance: {distance.toFixed(2)} km
          {weather && (
            <span className="ml-4">
              | Weather: {weather.main.temp}°C, {weather.weather[0].description}
            </span>
          )}
        </p>
      )}
      <Map route={route || undefined} userLocation={userLocation || undefined} />
    </div>
  );
}
