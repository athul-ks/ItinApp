import { Button } from "@itinapp/ui/components/button";
import { MountainIcon } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full px-4 lg:px-6 h-14 flex items-center border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <Link href="/" className="flex items-center justify-center">
        <MountainIcon className="h-6 w-6 text-primary" />
        <span className="ml-2 font-serif text-xl font-bold text-primary">
          ItinApp
        </span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        <Link
          href="#"
          className="text-sm font-medium hover:underline underline-offset-4 text-muted-foreground"
          prefetch={false}
        >
          Sign In
        </Link>
        <Button>Get Started</Button>
      </nav>
    </header>
  );
}
