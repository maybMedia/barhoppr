"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import {
  Github,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";

function SignInButtons() {
  const params = useSearchParams();
  const requested = params.get("callbackUrl") || "/map";
  const callbackUrl =
    requested.startsWith("/") &&
    !requested.startsWith("//") &&
    !requested.includes("\\")
      ? requested
      : "/map";
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const login = async (provider: "github" | "google") => {
    setPending(provider);
    setError("");
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setError("We couldn’t start sign-in. Please try again.");
      setPending("");
    }
  };
  return (
    <>
      <div className="auth-buttons">
        <Button
          variant="outline"
          onClick={() => login("github")}
          disabled={Boolean(pending)}
        >
          {pending === "github" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Github size={20} />
          )}
          Continue with GitHub
        </Button>
        <Button
          variant="outline"
          onClick={() => login("google")}
          disabled={Boolean(pending)}
        >
          {pending === "google" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Image
                src="/providers/google-light.svg"
                width={20}
                height={20}
                alt=""
                className="dark:hidden"
              />
              <Image
                src="/providers/google.svg"
                width={20}
                height={20}
                alt=""
                className="hidden dark:block"
              />
            </>
          )}
          Continue with Google
        </Button>
      </div>
      {(error || params.get("error")) && (
        <p className="status-message error-message" role="alert">
          {error ||
            "Sign-in didn’t finish. Please try again or choose another provider."}
        </p>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <main id="main-content" className="page-width auth-page">
      <div className="auth-illustration">
        <span className="eyebrow eyebrow-pill">
          <Heart size={13} />
          Good company starts here
        </span>
        <h1>
          There’s a place
          <br />
          for you at
          <br />
          the table.
        </h1>
        <p>
          Join the round, share your finds, and help someone discover their next
          favourite local.
        </p>
        <div className="auth-perks">
          <div>
            <Star size={20} />
            Rate the places you’ve tried
          </div>
          <div>
            <MessageCircle size={20} />
            Share a drink and a few words
          </div>
          <div>
            <MapPin size={20} />
            Help good locals get discovered
          </div>
        </div>
      </div>
      <section className="auth-card">
        <BrandMark size={50} />
        <h2>Join the round.</h2>
        <p>
          Sign in with an account you already use.
          <br />
          Your next good find is waiting.
        </p>
        <Suspense fallback={<div className="skeleton h-28 mt-6" />}>
          <SignInButtons />
        </Suspense>
        <p className="auth-small">
          Just browsing? The map and drink search are always free to explore.
          Sign in when you’re ready to share.
        </p>
      </section>
    </main>
  );
}
