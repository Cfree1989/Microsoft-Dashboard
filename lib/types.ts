export type PrintMethod = "Filament" | "Resin"

export type PrinterType =
  | "Prusa MK4S (9.8×8.3×8.7in)"
  | "Prusa XL (14.2×14.2×14.2in)"
  | "Raised3D Pro 2 Plus (12.0×12.0×23in)"
  | "Form 3 (5.7×5.7×7.3in)"

export type PrintColor =
  | "Any"
  | "Black"
  | "White"
  | "Gray"
  | "Red"
  | "Green"
  | "Blue"
  | "Yellow"
  | "Clear"
  | "Other"

export type RequestStatus =
  | "Uploaded"
  | "Pending"
  | "Ready to Print"
  | "Printing"
  | "Completed"
  | "Paid & Picked Up"
  | "Rejected"
  | "Archived"

export type Discipline =
  | "Architecture"
  | "Engineering"
  | "Art & Design"
  | "Business"
  | "Liberal Arts"
  | "Sciences"
  | "Other"

export type ProjectType = "Class Project" | "Research" | "Personal" | "Other"

export interface PrintRequest {
  id: string
  reqKey: string
  title: string
  student: string
  studentEmail: string
  tigerCardNumber: string
  courseNumber?: number
  discipline: Discipline
  projectType: ProjectType
  method: PrintMethod
  printer: PrinterType
  color: PrintColor
  dueDate?: string
  notes?: string
  status: RequestStatus
  estimatedCost?: number
  estimatedTime?: number
  estimatedWeight?: number
  studentConfirmed: boolean
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  paymentDate?: string
  attachments: FileAttachment[]
}

export interface FileAttachment {
  id: string
  name: string
  size: number
  type: string
}

// Pricing configuration
export const PRICING = {
  filamentRate: 0.1, // $0.10/gram
  resinRate: 0.2, // $0.20/gram
  minimumCost: 3.0, // $3.00 minimum
}

// Printer options based on method
export const PRINTERS_BY_METHOD: Record<PrintMethod, PrinterType[]> = {
  Filament: [
    "Prusa MK4S (9.8×8.3×8.7in)",
    "Prusa XL (14.2×14.2×14.2in)",
    "Raised3D Pro 2 Plus (12.0×12.0×23in)",
  ],
  Resin: ["Form 3 (5.7×5.7×7.3in)"],
}

// Colors by method (resin has limited colors)
export const COLORS_BY_METHOD: Record<PrintMethod, PrintColor[]> = {
  Filament: [
    "Any",
    "Black",
    "White",
    "Gray",
    "Red",
    "Green",
    "Blue",
    "Yellow",
    "Other",
  ],
  Resin: ["Black", "White", "Gray", "Clear"],
}

// Disciplines
export const DISCIPLINES: Discipline[] = [
  "Architecture",
  "Engineering",
  "Art & Design",
  "Business",
  "Liberal Arts",
  "Sciences",
  "Other",
]

// Project types
export const PROJECT_TYPES: ProjectType[] = [
  "Class Project",
  "Research",
  "Personal",
  "Other",
]

// Accepted file extensions
export const ACCEPTED_FILE_TYPES = [".stl", ".obj", ".3mf", ".idea", ".form"]

// Status color mapping
export const STATUS_COLORS: Record<RequestStatus, string> = {
  Uploaded: "status-uploaded",
  Pending: "status-pending",
  "Ready to Print": "status-ready-to-print",
  Printing: "status-printing",
  Completed: "status-completed",
  "Paid & Picked Up": "status-paid-picked-up",
  Rejected: "status-rejected",
  Archived: "status-archived",
}
