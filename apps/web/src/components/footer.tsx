import { GithubIcon, LinkedinIcon, TwitterIcon } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
      <p className="text-muted-foreground text-xs">&copy; 2025 ItinApp. All rights reserved.</p>
      <div className="flex gap-4 sm:ml-auto sm:gap-6">
        <Link
          href="#"
          className="text-xs underline-offset-4 hover:underline"
          prefetch={false}
          aria-label="Twitter"
        >
          <TwitterIcon className="h-5 w-5" />
        </Link>
        <Link
          href="#"
          className="text-xs underline-offset-4 hover:underline"
          prefetch={false}
          aria-label="Github"
        >
          <GithubIcon className="h-5 w-5" />
        </Link>
        <Link
          href="#"
          className="text-xs underline-offset-4 hover:underline"
          prefetch={false}
          aria-label="LinkedIn"
        >
          <LinkedinIcon className="h-5 w-5" />
        </Link>
      </div>
    </footer>
  );
}
