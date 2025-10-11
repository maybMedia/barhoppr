import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import MapClient from "@/components/MapClient";

export default function MapPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Page header */}
      <header className="bg-primary/10 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-primary">Explore Pubs Near You</h1>
        <p className="text-muted-foreground mt-1">
          Browse bars, see drinks on tap, and find your next favorite spot.
        </p>
      </header>

      {/* Optional summary card */}
      <section className="p-6 max-w-4xl mx-auto w-full">
        <Card className="bg-background border border-border shadow-sm">
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>
              Each marker on the map represents a pub. Click a marker to see details about the pub and its drinks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              You can zoom and pan around the map, and clusters show pubs close to each other.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Map section */}
      <main className="flex-1 p-6">
        <div className="w-full h-[80vh] rounded-lg shadow-lg overflow-hidden">
          <MapClient />
        </div>
      </main>
    </div>
  );
}
