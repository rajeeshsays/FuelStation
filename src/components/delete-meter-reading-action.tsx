
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteMeterReading, type DeleteReadingState } from "@/app/(app)/meter-readings/actions";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

function DeleteButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" variant="destructive" disabled={pending}>
            {pending ? "Deleting..." : "Delete"}
        </Button>
    )
}

export function DeleteMeterReadingAction({ readingId }: { readingId: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const initialState: DeleteReadingState = { message: "", success: false };
  const [state, formAction] = useFormState(deleteMeterReading, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: "Success", description: state.message });
        setOpen(false);
      } else {
        toast({ variant: "destructive", title: "Error", description: state.message });
      }
    }
  }, [state, toast, setOpen]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4 text-destructive" />
           <span className="sr-only">Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
         <form action={formAction}>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the meter reading and trigger a full recalculation of sales and inventory data to ensure consistency.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
                <input type="hidden" name="id" value={readingId} />
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                    <DeleteButton />
                </AlertDialogAction>
            </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
