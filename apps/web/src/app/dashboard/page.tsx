import { ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Badge } from '@itinapp/ui/components/badge';
import { Button } from '@itinapp/ui/components/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@itinapp/ui/components/card';

import { auth } from '@/server/auth';
import { api } from '@/trpc/server';

import { DeleteAccountButton } from '@/components/delete-account-button';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/signin');
  }

  const trips = await api.trip.getAll();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
          <p className="text-muted-foreground mt-1">Manage and view your generated itineraries.</p>
        </div>
        <Link href="/plan">
          <Button>+ Plan New Trip</Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="bg-muted/30 rounded-2xl border-2 border-dashed py-20 text-center">
          <h3 className="text-lg font-semibold">No trips found</h3>
          <p className="text-muted-foreground mb-6">
            You haven&apos;t generated any itineraries yet.
          </p>
          <Link href="/plan">
            <Button variant="default">Start your first adventure</Button>
          </Link>
        </div>
      ) : (
        // Trips Grid
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => {
            // Get the first option to show a preview (usually the "Fast Paced" one)
            // or just use generic trip data
            const firstOption = trip.tripData[0];

            return (
              <Card
                key={trip.id}
                className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
              >
                {/* Decorative Header Gradient */}
                <div className="relative h-24 bg-linear-to-r from-blue-600 to-indigo-600 p-4">
                  <Badge
                    variant="secondary"
                    className="absolute top-4 right-4 border-none bg-white/20 text-white hover:bg-white/30"
                  >
                    {trip.budget.charAt(0).toUpperCase() + trip.budget.slice(1)} Budget
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="text-xl font-bold">{trip.destination}</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {trip.startDate.toLocaleDateString()} - {trip.endDate.toLocaleDateString()}
                    </span>
                  </div>

                  {firstOption && (
                    <p className="line-clamp-3 text-sm text-gray-600">{firstOption.description}</p>
                  )}
                </CardContent>

                <CardFooter className="bg-muted/20 p-4">
                  <Link href={`/trip/${trip.id}`} className="w-full">
                    <Button variant="outline" className="group w-full gap-2">
                      View Itinerary
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Danger Zone */}
      <div className="mt-20 border-t pt-10">
        <h2 className="text-destructive mb-4 text-2xl font-bold">Danger Zone</h2>
        <div className="bg-destructive/10 border-destructive/20 flex flex-col items-start justify-between gap-4 rounded-xl border p-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Delete Account</h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Permanently remove your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
