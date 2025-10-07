"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    setIsLight(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsLight(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const githubIcon = isLight ? "providers/github-light.svg" : "providers/github.svg";
  const googleIcon = isLight ? "providers/google-light.svg" : "providers/google.svg";

  return (
    <div className="flex items-center justify-center bg-background p-4">
      <main className="flex flex-col items-center justify-center w-full">
        <Card className="max-w-md w-full p-0 shadow-xl rounded-2xl">
          <CardHeader className="flex flex-col items-center gap-2 pt-8">
            <Image src="/BarHoppr.png" alt="BarHoppr Logo" width={64} height={64} />
            <h1 className="text-3xl font-bold text-primary mb-2">Sign in to BarHoppr</h1>
          </CardHeader>
          <CardContent className="px-8 pb-0 flex flex-col items-center gap-6">
            <p className="text-muted-foreground text-center mb-4">
              Login with a service below to continue.
            </p>
            <Button
              className="w-full flex items-center gap-2 mb-2 cursor-pointer"
              variant="outline"
              onClick={() => signIn("github")}
            >
              <Image src={githubIcon} alt="GitHub" width={24} height={24} />
              Continue with GitHub
            </Button>
            <Button
              className="w-full flex items-center gap-2 mb-2 cursor-pointer"
              variant="outline"
              onClick={() => signIn("google")}
            >
              <Image src={googleIcon} alt="Google" width={24} height={24} />
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}