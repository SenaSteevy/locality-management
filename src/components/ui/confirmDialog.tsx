// src/components/ui/ConfirmationDialog.tsx
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost"

interface ConfirmationDialogProps {
  // Dialog State and Content
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode // Allows for text, spans, or other JSX (e.g., bolding)

  // Action/Confirmation Props
  onConfirm: () => void
  isPending: boolean
  confirmText?: string
  cancelText?: string
  confirmVariant?: ButtonVariant
}

export const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isPending,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "destructive", // Default to destructive for safety
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            className="hover:cursor-pointer"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelText}
          </Button>
  
          <Button
            className={`hover:cursor-pointer ${confirmVariant === "destructive" ? "text-red-700 hover:text-red-700 hover:bg-red-300 border-red-200 bg-red-50" : ""}`}
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                Processing...
              </>
            ) : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}