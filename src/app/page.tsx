import { Landing } from "@/components/Landing";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <main className="flex-1">
      <Landing />
      <SiteFooter />
    </main>
  );
}
