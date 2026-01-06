import { BotIcon, RouteIcon, SearchIcon } from 'lucide-react';

import { Card, CardDescription, CardHeader, CardTitle } from '@itinapp/ui/components/card';

import { HeroSearch } from '../../components/hero-search';
import Footer from './_components/footer';

export default function HomePage() {
  return (
    <div className="bg-background text-foreground flex min-h-dvh flex-col">
      <main className="flex-1">
        <section className="flex w-full justify-center py-24 md:py-32 lg:py-48">
          <div className="container flex flex-col items-center space-y-6 px-4 text-center md:px-6">
            <h1 className="max-w-3xl font-sans text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
              Your Perfect Itinerary, Generated in Seconds.
            </h1>
            <p className="text-muted-foreground max-w-xl md:text-xl">
              Stop spending hours researching. Enter a destination and get a curated day-by-day plan
              of the best places to visit.
            </p>
            <HeroSearch />
          </div>
        </section>

        <section id="features" className="bg-primary flex w-full justify-center py-24 md:py-32">
          <div className="container grid gap-8 px-4 sm:grid-cols-2 md:px-6 lg:grid-cols-3">
            <Card className="shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <BotIcon className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>Smart Discovery</CardTitle>
                </div>
              </CardHeader>
              <CardDescription className="p-6 pt-0">
                We find the hidden gems and top tourist spots, so you can experience the best of
                your destination.
              </CardDescription>
            </Card>
            <Card className="shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <RouteIcon className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>Day-by-Day Plans</CardTitle>
                </div>
              </CardHeader>
              <CardDescription className="p-6 pt-0">
                Optimized routes so you don&apos;t waste time traveling back and forth. Make the
                most of every moment.
              </CardDescription>
            </Card>
            <Card className="shadow-lg transition-shadow duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <SearchIcon className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>Instant Results</CardTitle>
                </div>
              </CardHeader>
              <CardDescription className="p-6 pt-0">
                No waiting. Get a full, comprehensive travel plan immediately after you hit search.
              </CardDescription>
            </Card>
          </div>
        </section>

        <section className="bg-muted/50 flex w-full justify-center py-24 md:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Future Roadmap
              </h2>
              <p className="text-muted-foreground mx-auto max-w-150 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We are currently in Alpha, with many new features on the way.
              </p>
            </div>
            <div className="mx-auto grid max-w-sm items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-2">
              <div className="grid gap-1">
                <h3 className="text-lg font-bold">Intelligent Transport Routing</h3>
                <p className="text-muted-foreground text-sm">
                  Coming Soon: Seamless integration with Google Maps for intelligent transport
                  routing.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-lg font-bold">Seamless Hotel & Stay Bookings</h3>
                <p className="text-muted-foreground text-sm">
                  Book your hotels and stays directly through ItinApp, with curated recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
