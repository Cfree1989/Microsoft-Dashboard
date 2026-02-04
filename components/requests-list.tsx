"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RequestCard } from "@/components/request-card"
import { ConfirmModal } from "@/components/confirm-modal"
import { CancelModal } from "@/components/cancel-modal"
import { type PrintRequest } from "@/lib/types"
import { MOCK_REQUESTS } from "@/lib/mock-data"

export function RequestsList() {
  const [requests, setRequests] = useState<PrintRequest[]>(MOCK_REQUESTS)
  const [selectedRequest, setSelectedRequest] = useState<PrintRequest | null>(
    null
  )
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const handleConfirmEstimate = (request: PrintRequest) => {
    setSelectedRequest(request)
    setShowConfirmModal(true)
  }

  const handleCancelRequest = (request: PrintRequest) => {
    setSelectedRequest(request)
    setShowCancelModal(true)
  }

  const handleConfirmSubmit = () => {
    if (selectedRequest) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, studentConfirmed: true, status: "Ready to Print" }
            : r
        )
      )
    }
    setShowConfirmModal(false)
    setSelectedRequest(null)
  }

  const handleCancelSubmit = () => {
    if (selectedRequest) {
      setRequests((prev) => prev.filter((r) => r.id !== selectedRequest.id))
    }
    setShowCancelModal(false)
    setSelectedRequest(null)
  }

  // Sort requests: newest first
  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="mb-4 text-muted-foreground">
          You haven't submitted any print requests yet.
        </p>
        <Button asChild>
          <Link href="/submit">
            <Plus className="mr-2 h-4 w-4" />
            Submit Your First Request
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedRequests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onConfirmEstimate={handleConfirmEstimate}
            onCancelRequest={handleCancelRequest}
          />
        ))}
      </div>

      {/* Confirm Estimate Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        request={selectedRequest}
        onClose={() => {
          setShowConfirmModal(false)
          setSelectedRequest(null)
        }}
        onConfirm={handleConfirmSubmit}
      />

      {/* Cancel Request Modal */}
      <CancelModal
        isOpen={showCancelModal}
        request={selectedRequest}
        onClose={() => {
          setShowCancelModal(false)
          setSelectedRequest(null)
        }}
        onCancel={handleCancelSubmit}
      />
    </>
  )
}
