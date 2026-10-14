import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
// This file is the mailbox that all your auth requests get delivered to.
// line 1-
// This brings in your auth.ts file, the one with Google, email verification, rate limits and the onboarded field. Think of it as the guard's rulebook.
// line-2 Better Auth's rulebook is written in a general way, and Next.js expects things in its own format. This is a translator that converts one into the other.
// line-4- This gives the translator your rulebook and gets back two functions, GET and POST. Next.js looks for functions with those names in a route.ts file, and runs them when a request arrives:
// How it connects to what you built
// When your sign-in page calls authClient.signIn.email(...), the client sends a request to /api/auth/sign-in/email. This file receives it, hands it to auth, and auth checks the database and answers. The before hook in your auth.ts that limits resend emails also runs here, since it watches requests coming through this route.
