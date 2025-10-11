import type { Pub } from "@/types/pub";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import useSWR from "swr";
import L from "leaflet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Loader2 } from "lucide-react";

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

export default function Map() {
  const { data: pubs } = useSWR<Pub[]>("/api/pubs", fetcher);

  const [center, setCenter] = useState<[number, number]>([-33.865, 151.209]); // default to Sydney

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        (err) => {
          console.warn("Could not get user location:", err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  if (!pubs) return (
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
      <MarkerClusterGroup>
        {pubs.map((pub) => (
          <Marker key={pub.id} position={[pub.lat, pub.long]}>
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