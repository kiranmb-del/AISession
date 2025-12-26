import { redirect } from "next/navigation";

/**
 * Home Page
 * Redirects to the welcome page
 */
export default function Home() {
  redirect("/welcome");
}
