"use client"

import { MapPin, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { type PrintRequest, STATUS_COLORS } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RequestCardProps {
  request: PrintRequest
  onConfirmEstimate: (request: PrintRequest) => void
  onCancelRequest: (request: PrintRequest) => void
}

export function RequestCard({
  request,
  onConfirmEstimate,
  onCancelRequest,
}: RequestCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Get printer name without dimensions
  const getPrinterShortName = (printer: string) => {
    const parenIndex = printer.indexOf("(")
    return parenIndex > 0 ? printer.substring(0, parenIndex).trim() : printer
  }

  // Get status message based on current status
  const getStatusMessage = () => {
    switch (request.status) {
      case "Ready to Print":
        return "Your request is in the print queue. You'll be notified when printing starts."
      case "Printing":
        return "Your print is currently in progress!"
      case "Completed":
        return null // Special handling with icon
      case "Paid & Picked Up":
        return request.paymentDate
          ? `Completed and picked up on ${formatDate(request.paymentDate)}`
          : "Completed and picked up"
      case "Rejected":
        return request.rejectionReason || "Request rejected"
      default:
        return null
    }
  }

  const statusMessage = getStatusMessage()
  const showConfirmButton =
    request.status === "Pending" && !request.studentConfirmed
  const showCancelButton = request.status === "Uploaded"
  const showStatusMessage = [
    "Ready to Print",
    "Printing",
    "Completed",
    "Paid & Picked Up",
    "Rejected",
  ].includes(request.status)

  return (
    <Card className="border-border bg-card transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        {/* Header Row: ReqKey and Status */}
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {request.reqKey}
            </p>
            <p className="text-xs text-muted-foreground">
              Submitted: {formatDate(request.createdAt)}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              STATUS_COLORS[request.status]
            )}
          >
            {request.status}
          </span>
        </div>

        {/* Print Details */}
        <p className="mb-2 text-xs text-muted-foreground">
          {request.method} - {getPrinterShortName(request.printer)} -{" "}
          {request.color}
        </p>

        {/* Estimated Cost (if available) */}
        {request.estimatedCost && (
          <p className="mb-3 text-sm font-semibold text-primary">
            Estimated Cost: {formatCurrency(request.estimatedCost)}
          </p>
        )}

        {/* Confirm Estimate Button (Pending status only) */}
        {showConfirmButton && (
          <Button
            onClick={() => onConfirmEstimate(request)}
            className="mb-3 w-full bg-success hover:bg-success/90"
            size="sm"
          >
            CONFIRM ESTIMATE
          </Button>
        )}

        {/* Status Messages */}
        {showStatusMessage && (
          <div className="mb-3">
            {request.status === "Completed" ? (
              <div className="rounded-md bg-success/10 p-3 text-xs">
                <p className="mb-2 font-semibold text-success">
                  Your print is ready for pickup!
                </p>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Room 145 Atkinson Hall</span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                  <CreditCard className="h-3 w-3" />
                  <span>Payment: TigerCASH only</span>
                </div>
              </div>
            ) : request.status === "Rejected" ? (
              <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
                {statusMessage}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{statusMessage}</p>
            )}
          </div>
        )}

        {/* Cancel Button (Uploaded status only) */}
        {showCancelButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancelRequest(request)}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            Cancel Request
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
