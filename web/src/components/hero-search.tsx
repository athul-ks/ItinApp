"use client";

import { Button } from "@itenapp/ui/components/button";
import { Input } from "@itenapp/ui/components/input";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState("");

  const handleSearch = () => {
    if (!destination.trim()) return;

    // Redirect to the planner page with the destination as a query param
    const params = new URLSearchParams();
    params.set("destination", destination);
    router.push(`/plan?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-4">
      <div className="relative flex-1 w-full">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Where do you want to go?"
          className="w-full pl-10 pr-4 py-3 rounded-md shadow-sm focus:ring-primary focus:border-primary"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <Button
        size="lg"
        onClick={handleSearch}
        className="w-full sm:w-auto bg-secondary text-secondary-foreground px-6 py-3 rounded-md shadow hover:bg-secondary/90 transition"
      >
        Plan my Trip
      </Button>
    </div>
  );
}
