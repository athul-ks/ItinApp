'use client';

import { MountainIcon } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

import { Button } from '@itinapp/ui/components/button';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 flex h-14 w-full items-center border-b px-4 backdrop-blur lg:px-6">
      <Link href="/" className="flex items-center justify-center">
        <MountainIcon className="text-primary h-6 w-6" />
        <span className="text-primary ml-2 font-serif text-xl font-bold">ItinApp</span>
      </Link>
      <nav className="ml-auto flex items-center gap-4 sm:gap-6">
        {session ? (
          /* LOGGED IN VIEW */
          <>
            <span className="text-muted-foreground hidden text-sm font-medium sm:inline-block">
              {session.user?.name ? `Hi, ${session.user.name.split(' ')[0]}` : 'Welcome'}
            </span>
            <Link
              href="/dashboard"
              className="text-muted-foreground text-sm font-medium underline-offset-4 hover:underline"
            >
              My Trips
            </Link>
            <Button onClick={() => signOut({ callbackUrl: '/' })} variant="secondary" size="sm">
              Sign Out
            </Button>
          </>
        ) : (
          /* LOGGED OUT VIEW */
          <>
            <button
              onClick={() => signIn('google')}
              className="text-muted-foreground text-sm font-medium underline-offset-4 hover:underline"
            >
              Sign In
            </button>
            <Button onClick={() => signIn('google')}>Get Started</Button>
          </>
        )}
      </nav>
    </header>
  );
}
