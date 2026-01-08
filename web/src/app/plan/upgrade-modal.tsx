'use client';

import { Coins, Sparkles } from 'lucide-react';

import { Button } from '@itinapp/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@itinapp/ui/components/dialog';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-yellow-100 p-3">
            <Coins className="h-8 w-8 text-yellow-600" />
          </div>
          <DialogTitle className="text-xl">Out of Credits</DialogTitle>
          <DialogDescription>
            You&apos;ve used all your free trip generations. Upgrade to continue exploring the world
            with AI.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Explorer Pack</h4>
                <p className="text-sm text-gray-500">5 New Trip Generations</p>
              </div>
              <Button disabled variant="outline">
                Coming Soon
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
