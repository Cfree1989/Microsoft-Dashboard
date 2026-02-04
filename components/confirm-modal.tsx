"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type PrintRequest } from "@/lib/types"

interface ConfirmModalProps {
  isOpen: boolean
  request: PrintRequest | null
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmModal({
  isOpen,
  request,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  if (!request) return null

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "TBD"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-success">
            Confirm Your Print Estimate
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {request.reqKey}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Cost Display */}
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(request.estimatedCost)}
            </p>
          </div>

          {/* Details */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Method: {request.method} - Color: {request.color}
            </p>
            {request.estimatedTime && (
              <p>Print Time: ~{request.estimatedTime} hours</p>
            )}
            {request.estimatedWeight && (
              <p>Material: ~{request.estimatedWeight}g</p>
            )}
          </div>

          {/* Warning */}
          <p className="text-center text-xs text-muted-foreground">
            By confirming, you agree to pay this amount at pickup. Printing will
            begin after confirmation.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onConfirm}
            className="w-full bg-success hover:bg-success/90"
            size="lg"
          >
            I CONFIRM THIS ESTIMATE
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
