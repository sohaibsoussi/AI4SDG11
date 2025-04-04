'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Icon} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCoordsByName } from '../utils/geocode';

type Zone = {
  name: string;
  risk_level: string;
  description: string;
  advice: string;
};

type Props = {
  route?: [number, number][];
  userLocation?: [number, number];
};

const monumentIcon = new L.Icon({
  iconUrl: '/monument-icon.png', // Place a big icon in public/
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48],
});

export default function Map({ route, userLocation }: Props) {
  const [zones, setZones] = useState<
    { zone: Zone; coords: [number, number] }[]
  >([]);
  const [monuments, setMonuments] = useState<any[]>([]);

  const getColor = (level: string) => {
    if (level === 'high') return 'red';
    if (level === 'medium') return 'orange';
    return 'yellow';
  };
  useEffect(() => {
    const loadZones = async () => {
      const res = await fetch('/data/unsafeZone.json');
      const data: Zone[] = await res.json();
      // console.log(data);
      const enrichedZones = await Promise.all(
        data.map(async (zone) => {
          try {
            const coords = await getCoordsByName(zone.name);
            return coords ? { zone, coords } : null;
          } catch (e) {
            console.warn('Geocoding failed for', zone.name, e);
            return null;
          }
        })
      );
      setZones(enrichedZones.filter((z): z is { zone: Zone; coords: [number, number] } => z !== null));
    };
    const load = async () => {
      const res = await fetch('/data/monuments.json');
      const data = await res.json();
      setMonuments(data);
    };
    loadZones();
    load();
  }, []);


  return (
    <MapContainer center={userLocation || [33.5731, -7.5898]} zoom={12} style={{ height: '500px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {userLocation && <Marker position={userLocation}><Popup>You are here</Popup></Marker>}
      {monuments.map((monument, i) => (
        <Marker key={i} position={[monument.lat, monument.lon]} icon={monumentIcon}>
          <Popup>
            <strong>{monument.name}</strong><br />
            <Link href={`/monuments/${monument.id}`} className="text-blue-600 underline">View Details</Link>
          </Popup>
        </Marker>
      ))}
      {route && <Polyline positions={route} color="blue" />}

      {zones.map(({ zone, coords }, idx) => (
        <Circle
          key={idx}
          center={coords}
          radius={400} // meters
          pathOptions={{ color: getColor(zone.risk_level), fillOpacity: 0.3 }}
        >
          <Popup>
            <strong>{zone.name}</strong><br />
            <em>Risk: {zone.risk_level}</em><br />
            {zone.description}<br />
            <b>Advice:</b> {zone.advice}
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
}
