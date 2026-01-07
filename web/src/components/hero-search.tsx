'use client';

import { useState } from 'react';

import { Check, ChevronsUpDown, MapPinIcon } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Button } from '@itinapp/ui/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@itinapp/ui/components/command';
import { Popover, PopoverContent, PopoverTrigger } from '@itinapp/ui/components/popover';
import { cn } from '@itinapp/ui/lib/utils';

const destinations = [
  { value: 'paris', label: 'Paris, France' },
  { value: 'tokyo', label: 'Tokyo, Japan' },
  { value: 'new-york', label: 'New York, USA' },
  { value: 'london', label: 'London, UK' },
  { value: 'rome', label: 'Rome, Italy' },
  { value: 'bali', label: 'Bali, Indonesia' },
  { value: 'dubai', label: 'Dubai, UAE' },
  { value: 'barcelona', label: 'Barcelona, Spain' },
  { value: 'sydney', label: 'Sydney, Australia' },
  { value: 'cape-town', label: 'Cape Town, South Africa' },
  { value: 'kyoto', label: 'Kyoto, Japan' },
  { value: 'amsterdam', label: 'Amsterdam, Netherlands' },
  { value: 'santorini', label: 'Santorini, Greece' },
];

export function HeroSearch() {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleSearch = () => {
    if (!value) return;

    const selected = destinations.find((d) => d.value === value);
    const destinationQuery = selected ? selected.label : value;

    const params = new URLSearchParams();
    params.set('destination', destinationQuery);

    const targetUrl = `/plan?${params.toString()}`;
    if (session) {
      router.push(targetUrl);
    } else {
      // This sends them to Google Login, and brings them back to
      // the Plan page (with the destination params!) automatically.
      signIn('google', { callbackUrl: targetUrl });
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 sm:flex-row">
      <div className="relative w-full flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="border-muted-foreground/20 hover:border-primary/50 flex w-full justify-between px-4 py-3 text-base font-normal shadow-sm transition-colors"
            >
              {value ? (
                <span className="text-foreground flex items-center gap-2">
                  <MapPinIcon className="text-primary h-4 w-4" />
                  {destinations.find((d) => d.value === value)?.label}
                </span>
              ) : (
                <span className="text-muted-foreground flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  Where do you want to go?
                </span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command className="bg-background">
              <CommandInput
                placeholder="Search destination..."
                className="px-2 focus:ring-0 focus:outline-none"
              />
              <CommandList>
                <CommandEmpty>No destination found.</CommandEmpty>
                <CommandGroup>
                  {destinations.map((destination) => (
                    <CommandItem
                      key={destination.value}
                      value={destination.value}
                      keywords={[destination.label]}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? '' : currentValue);
                        setOpen(false);
                      }}
                      className="hover:bg-primary/30 py-1"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === destination.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {destination.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <Button
        variant="secondary"
        size="lg"
        onClick={handleSearch}
        className="w-full px-6 py-3 shadow transition sm:w-auto"
        disabled={!value}
      >
        Plan my Trip
      </Button>
    </div>
  );
}
