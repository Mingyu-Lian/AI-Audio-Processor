"use client";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AddPointModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Point</Button>
      </DialogTrigger>
      <DialogContent className="p-6 w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Points</DialogTitle>
        </DialogHeader>
        <p>Here you can add points to your account.</p>
      </DialogContent>
    </Dialog>
  );
}
