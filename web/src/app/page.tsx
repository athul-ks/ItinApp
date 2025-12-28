import { Button } from "@itenapp/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@itenapp/ui/components/card";
import { Input } from "@itenapp/ui/components/input";
import {
  BotIcon,
  GithubIcon,
  LinkedinIcon,
  MountainIcon,
  RouteIcon,
  SearchIcon,
  TwitterIcon,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full px-4 lg:px-6 h-14 flex items-center border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link
          href="#"
          className="flex items-center justify-center"
          prefetch={false}
        >
          <MountainIcon className="h-6 w-6 text-primary" />
          <span className="ml-2 font-serif text-xl font-bold text-primary">
            ItenApp
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
      <main className="flex-1">
        <section className="w-full py-24 md:py-32 lg:py-48 bg-mist-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="max-w-3xl">
                <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl font-sans">
                  Your Perfect Itinerary, Generated in Seconds.
                </h1>
              </div>
              <div className="max-w-xl">
                <p className="text-muted-foreground md:text-xl">
                  Stop spending hours researching. Enter a destination and get a
                  curated day-by-day plan of the best places to visit.
                </p>
              </div>
              <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Where do you want to go?"
                    className="w-full pl-10 pr-4 py-3 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  />
                </div>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-sunset-coral text-white hover:bg-sunset-coral/90"
                >
                  Plan my Trip
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-24 md:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <BotIcon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Smart Discovery</CardTitle>
                  </div>
                </CardHeader>
                <CardDescription className="p-6 pt-0">
                  We find the hidden gems and top tourist spots, so you can
                  experience the best of your destination.
                </CardDescription>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <RouteIcon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Day-by-Day Plans</CardTitle>
                  </div>
                </CardHeader>
                <CardDescription className="p-6 pt-0">
                  Optimized routes so you don&apos;t waste time traveling back
                  and forth. Make the most of every moment.
                </CardDescription>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <SearchIcon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Instant Results</CardTitle>
                  </div>
                </CardHeader>
                <CardDescription className="p-6 pt-0">
                  No waiting. Get a full, comprehensive travel plan immediately
                  after you hit search.
                </CardDescription>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-24 md:py-32 bg-muted/50">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Future Roadmap
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We are currently in Alpha, with many new features on the way.
              </p>
            </div>
            <div className="mx-auto grid max-w-sm items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-2">
              <div className="grid gap-1">
                <h3 className="text-lg font-bold">
                  Intelligent Transport Routing
                </h3>
                <p className="text-sm text-muted-foreground">
                  Coming Soon: Seamless integration with Google Maps for
                  intelligent transport routing.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-lg font-bold">
                  Seamless Hotel & Stay Bookings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Book your hotels and stays directly through ItenApp, with
                  curated recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; 2025 ItenApp. All rights reserved.
        </p>
        <div className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            <TwitterIcon className="w-5 h-5" />
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            <GithubIcon className="w-5 h-5" />
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            <LinkedinIcon className="w-5 h-5" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
