import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="mb-6 rounded-full bg-gray-100 p-6 shadow-sm">
        <FileQuestion className="text-muted-foreground h-12 w-12" />
      </div>

      <h2 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">Page Not Found</h2>

      <p className="text-muted-foreground mb-8 max-w-125 text-lg">
        Sorry, we couldn&apos;t find the trip or page you&apos;re looking for. It might have been
        deleted or the link is incorrect.
      </p>

      <Link
        href="/"
        className="bg-primary hover:bg-primary/90 rounded-full px-8 py-3 text-sm font-bold text-white shadow-md transition-colors"
      >
        Go back home
      </Link>
    </div>
  );
}
