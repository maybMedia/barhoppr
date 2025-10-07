import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex items-center justify-center bg-background p-4">
      <main className="flex flex-col items-center justify-center w-full">
        <Card className="max-w-md w-full p-0 shadow-xl rounded-2xl">
          <CardHeader className="flex flex-col items-center gap-2 pt-8">
            <Image src="/BarHoppr.png" alt="BarHoppr Logo" width={96} height={96} />
            <h1 className="text-4xl font-extrabold text-primary">BarHoppr</h1>
          </CardHeader>
          <CardContent className="px-8 pb-0">
            <p className="text-lg text-muted-foreground text-center">
              Find your favorite beer on tap near you! Discover new bars, plan your next night out, and explore local venues with BarHoppr.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pb-8 pt-6">
            <Button asChild size="lg" className="font-bold">
              <Link href="/map">Go to the map!</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
