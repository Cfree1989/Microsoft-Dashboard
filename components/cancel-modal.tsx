"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type PrintRequest } from "@/lib/types"

interface CancelModalProps {
  isOpen: boolean
  request: PrintRequest | null
  onClose: () => void
  onCancel: () => void
}

export function CancelModal({
  isOpen,
  request,
  onClose,
  onCancel,
}: CancelModalProps) {
  if (!request) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center text-destructive">
            Cancel Request?
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {request.reqKey}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-center text-sm text-muted-foreground">
            Are you sure you want to cancel this request? This action cannot be
            undone.
          </p>

          {/* Request Details */}
          <div className="mt-4 rounded-md bg-muted/50 p-3 text-center text-xs text-muted-foreground">
            <p>
              {request.method} - {request.color}
            </p>
            <p>Submitted: {new Date(request.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onCancel}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            YES, CANCEL REQUEST
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full"
          >
            Keep Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
