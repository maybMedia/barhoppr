import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center bg-background p-4">
      <main className="flex flex-col items-center justify-center w-full">
        <Card className="max-w-md w-full p-0 shadow-xl rounded-2xl">
          <CardHeader className="flex flex-col items-center gap-2 pt-8">
            <Image src="/lost.png" alt="Lost Monkey" width={128} height={128} />
            <h1 className="text-4xl font-extrabold text-primary">404</h1>
            <h2 className="text-2xl font-extrabold text-primary">Page Not Found</h2>
          </CardHeader>
          <CardContent className="px-8 pb-0">
            <p className="text-lg text-muted-foreground text-center">
              Oops! We could not find that page.<br />
              Try heading back to the homepage!
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pb-8 pt-6 gap-4">
            <Button asChild size="lg" className="font-bold">
              <Link href="/">Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}