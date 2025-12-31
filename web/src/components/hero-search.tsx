"use client";

import { Button } from "@itinapp/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@itinapp/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@itinapp/ui/components/popover";
import { cn } from "@itinapp/ui/lib/utils";
import { Check, ChevronsUpDown, MapPinIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// MVP Data: Top travel destinations to simulate the experience.
// Phase 2: We will replace this with a real API call (Google Places/Mapbox).
const destinations = [
  { value: "paris", label: "Paris, France" },
  { value: "tokyo", label: "Tokyo, Japan" },
  { value: "new-york", label: "New York, USA" },
  { value: "london", label: "London, UK" },
  { value: "rome", label: "Rome, Italy" },
  { value: "bali", label: "Bali, Indonesia" },
  { value: "dubai", label: "Dubai, UAE" },
  { value: "barcelona", label: "Barcelona, Spain" },
  { value: "sydney", label: "Sydney, Australia" },
  { value: "cape-town", label: "Cape Town, South Africa" },
  { value: "kyoto", label: "Kyoto, Japan" },
  { value: "amsterdam", label: "Amsterdam, Netherlands" },
  { value: "santorini", label: "Santorini, Greece" },
];

export function HeroSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const handleSearch = () => {
    if (!value) return;

    // Find the readable label to pass to the URL (optional, cleaner for users)
    const selected = destinations.find((d) => d.value === value);
    const destinationQuery = selected ? selected.label : value;

    const params = new URLSearchParams();
    params.set("destination", destinationQuery);
    router.push(`/plan?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-4">
      <div className="relative flex-1 w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full flex justify-between py-3 px-4 text-base font-normal shadow-sm border-muted-foreground/20 hover:border-primary/50 transition-colors"
            >
              {value ? (
                <span className="flex items-center gap-2 text-foreground">
                  <MapPinIcon className="h-4 w-4 text-primary" />
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
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
          >
            <Command className="bg-background">
              <CommandInput
                placeholder="Search destination..."
                className="px-2 focus:outline-none focus:ring-0"
              />
              <CommandList>
                <CommandEmpty>No destination found.</CommandEmpty>
                <CommandGroup>
                  {destinations.map((destination) => (
                    <CommandItem
                      key={destination.value}
                      value={destination.value}
                      keywords={[destination.label]} // Helps fuzzy search
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                      className="py-1 hover:bg-primary/30"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === destination.value
                            ? "opacity-100"
                            : "opacity-0",
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
        size="lg"
        onClick={handleSearch}
        className="w-full sm:w-auto bg-secondary text-secondary-foreground px-6 py-3 rounded-md shadow hover:bg-secondary/90 transition"
        disabled={!value}
      >
        Plan my Trip
      </Button>
    </div>
  );
}
