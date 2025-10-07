import NextAuth from "next-auth"
import Apple from "next-auth/providers/apple"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub, Google, Apple],
})