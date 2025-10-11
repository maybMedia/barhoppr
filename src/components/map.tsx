import type { Pub } from "@/types/pub";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import useSWR from "swr";
import L from "leaflet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Loader2 } from "lucide-react";
import { customMarkerIcon } from "./map/customMarkerIcon";

// Fix default marker icons in Next.js / React
const DefaultIcon = L.Icon.Default;

DefaultIcon.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


const fetcher = (url: string) => fetch(url).then((res) => res.json());

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function RecenterAndFit({ center, pubs }: { center: [number, number]; pubs: Pub[] }) {
  const map = useMap();

  useEffect(() => {
    if (!pubs || pubs.length === 0) return;

    // Build LatLng array of all pubs
    const bounds = pubs.map((pub) => [pub.lat, pub.long] as [number, number]);

    // Include the user's location as center if available
    if (center) bounds.push(center);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.fitBounds(bounds as any, { padding: [50, 50] }); // add padding for UI
  }, [center, pubs, map]);

  return null;
}

export default function Map() {
  const { data: pubs } = useSWR<Pub[]>("/api/pubs", fetcher);

  const [center, setCenter] = useState<[number, number]>([-33.865, 151.209]); // default Sydney

  useEffect(() => {
    if (!navigator.geolocation || !pubs || pubs.length === 0) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Find nearest pub
        const nearestPub = pubs.reduce((closest, pub) => {
          const dist = getDistance(latitude, longitude, pub.lat, pub.long);
          return dist < closest.distance ? { pub, distance: dist } : closest;
        }, { pub: pubs[0], distance: getDistance(latitude, longitude, pubs[0].lat, pubs[0].long) }).pub;

        setCenter([nearestPub.lat, nearestPub.long]);
      },
      (err) => {
        console.warn("Could not get user location:", err.message);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [pubs]);

  if (!pubs)
    return (
      <div className="flex justify-center items-center h-4/5">
        <Card className="w-full max-w-4/5 animate-pulse">
          <CardHeader>
            <CardTitle className="h-6 bg-muted rounded w-1/3 mb-2"></CardTitle>
            <CardDescription className="h-4 bg-muted rounded w-1/2"></CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <Loader2 className="animate-spin" />
          </CardContent>
        </Card>
      </div>
    );

  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {pubs && <RecenterAndFit center={center} pubs={pubs} />}
      <MarkerClusterGroup>
        {pubs.map((pub) => (
          <Marker key={pub.id} position={[pub.lat, pub.long]} icon={customMarkerIcon}>
            <Popup>
              <h3>{pub.name}</h3>
              <p>{pub.description}</p>
              {pub.drinks?.length && (
                <ul className="mt-2 list-disc list-inside">
                  {pub.drinks.map((drink) => (
                    <li key={drink.id}>{drink.name}</li>
                  ))}
                </ul>
              )}
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}