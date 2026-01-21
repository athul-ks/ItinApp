"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Trash2 } from "lucide-react";

import { Button } from "@itinapp/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@itinapp/ui/components/dialog";
import { api } from "@/trpc/react";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const deleteAccount = api.auth.deleteAccount.useMutation({
    onSuccess: async () => {
      await signOut({ callbackUrl: "/" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account? This action cannot be undone.
            All your trips and data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteAccount.mutate()}
            disabled={deleteAccount.isPending}
          >
            {deleteAccount.isPending ? "Deleting..." : "Yes, delete my account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
