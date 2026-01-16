'use client';

import { useState } from 'react';

import { Menu, MountainIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button, buttonVariants } from '@itinapp/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@itinapp/ui/components/sheet';

import { CreditBadge } from './credit-badge';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = () => {
    setIsOpen(false);
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 flex h-14 w-full items-center border-b px-4 backdrop-blur lg:px-6">
      <Link href="/" className="flex items-center justify-center">
        <MountainIcon className="text-primary h-6 w-6" />
        <span className="text-primary ml-2 font-serif text-xl font-bold">ItinApp</span>
      </Link>

      {/* --- DESKTOP NAV (Hidden on Mobile) --- */}
      <nav className="ml-auto hidden items-center gap-6 md:flex">
        {session ? (
          <>
            <span className="text-muted-foreground text-sm font-medium">
              {session.user?.name ? `Hi, ${session.user.name.split(' ')[0]}` : 'Welcome'}
            </span>
            {pathname !== '/dashboard' && (
              <Link
                href="/dashboard"
                className="text-muted-foreground text-sm font-medium underline-offset-4 hover:underline"
              >
                My Trips
              </Link>
            )}
            <CreditBadge />
            <Button onClick={() => signOut({ callbackUrl: '/' })} variant="secondary" size="sm">
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link href="?auth=login" scroll={false}>
              <button className="text-muted-foreground text-sm font-medium underline-offset-4 hover:underline">
                Sign In
              </button>
            </Link>
            <Link href="?auth=login" scroll={false} className={buttonVariants()}>
              Get Started
            </Link>
          </>
        )}
      </nav>

      {/* --- MOBILE NAV (Hamburger) --- */}
      <div className="ml-auto md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-75 sm:w-100">
            <SheetHeader>
              <SheetTitle className="text-left font-serif font-bold">Menu</SheetTitle>
            </SheetHeader>

            <div className="mt-8 flex flex-col gap-4">
              {session ? (
                <>
                  <p className="text-muted-foreground text-sm font-medium">
                    Signed in as{' '}
                    <span className="text-foreground font-bold">
                      {session.user?.name || 'User'}
                    </span>
                  </p>
                  <div className="flex items-center">
                    <CreditBadge />
                  </div>
                  <Link
                    href="/dashboard"
                    className="hover:text-primary text-md font-medium underline-offset-4 hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    My Trips
                  </Link>
                  <div className="mt-auto">
                    <Button onClick={handleSignOut} variant="secondary" className="w-full">
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="?auth=login"
                    scroll={false}
                    className="text-md font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="?auth=login"
                    scroll={false}
                    className={buttonVariants({ className: 'w-full' })}
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
