"use client";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AddPointModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Credit</Button>
      </DialogTrigger>
      <DialogContent aria-describedby="add-credit-description" className="p-6 w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Credits</DialogTitle>
        </DialogHeader>
        
        {/* Hidden description for accessibility */}
        <p id="add-credit-description" className="sr-only">
          Here you can add credits to your account. Use the options provided to increase your available credits.
        </p>

        {/* Visible text */}
        <p>Here you can add credits to your account.</p>
      </DialogContent>
    </Dialog>
  );
}

