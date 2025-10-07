"use server";
import { signIn } from "@/lib/auth";

export async function logIn(provider: "github" | "google" | "apple" = "github") {
  await signIn(provider);
}