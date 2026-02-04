"use client"

import { useState } from "react"
import { Plus, List, Home, RefreshCw, Upload, FileText, ChevronDown, Paperclip, AlertTriangle } from "lucide-react"

// Microsoft Fluent Design Color Palette
const colors = {
  primary: "rgb(56, 96, 178)",
  primaryHover: "rgb(76, 116, 198)",
  success: "rgb(16, 124, 16)",
  successHover: "rgb(36, 144, 36)",
  warning: "rgb(255, 185, 0)",
  danger: "rgb(209, 52, 56)",
  info: "rgb(70, 130, 220)",
  header: "rgb(45, 45, 48)",
  text: "rgb(50, 50, 50)",
  textMuted: "rgb(100, 100, 100)",
  textLight: "rgb(150, 150, 150)",
  bg: "rgb(248, 248, 248)",
  bgCard: "rgb(255, 255, 255)",
  border: "rgb(200, 200, 200)",
  borderLight: "rgb(220, 220, 220)",
  // Status colors
  uploaded: "rgb(70, 130, 220)",
  pending: "rgb(255, 185, 0)",
  readyToPrint: "rgb(16, 124, 16)",
  printing: "rgb(107, 105, 214)",
  completed: "rgb(0, 78, 140)",
  paidPickedUp: "rgb(0, 158, 73)",
  rejected: "rgb(209, 52, 56)",
  archived: "rgb(96, 94, 92)",
}

type Screen = "home" | "submit" | "myRequests"

export default function StudentPortalDesign() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        {/* Design Title */}
        <div className="mb-8 text-center">
          <h1 className="font-sans text-3xl font-semibold text-foreground">
            Student Portal - Power Apps Design
          </h1>
          <p className="mt-2 font-sans text-muted-foreground">
            Microsoft Fluent Design System | Tablet Layout (1024x768)
          </p>
        </div>

        {/* Screen Selector */}
        <div className="mb-6 flex justify-center gap-4">
          <button
            onClick={() => setCurrentScreen("home")}
            className={`rounded-md px-6 py-2 font-sans text-sm font-medium transition-colors ${
              currentScreen === "home"
                ? "bg-[rgb(56,96,178)] text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Screen 1: Home
          </button>
          <button
            onClick={() => setCurrentScreen("submit")}
            className={`rounded-md px-6 py-2 font-sans text-sm font-medium transition-colors ${
              currentScreen === "submit"
                ? "bg-[rgb(56,96,178)] text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Screen 2: Submit Request
          </button>
          <button
            onClick={() => setCurrentScreen("myRequests")}
            className={`rounded-md px-6 py-2 font-sans text-sm font-medium transition-colors ${
              currentScreen === "myRequests"
                ? "bg-[rgb(56,96,178)] text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Screen 3: My Requests
          </button>
        </div>

        {/* Power Apps Canvas Container */}
        <div className="mx-auto overflow-hidden rounded-lg border border-border shadow-lg" style={{ width: 1024, height: 768 }}>
          {currentScreen === "home" && <HomeScreen onNavigate={setCurrentScreen} />}
          {currentScreen === "submit" && <SubmitScreen onNavigate={setCurrentScreen} />}
          {currentScreen === "myRequests" && <MyRequestsScreen onNavigate={setCurrentScreen} />}
        </div>

        {/* Design Notes */}
        <div className="mt-8 rounded-lg bg-muted p-6">
          <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">Design Specifications</h2>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Typography</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>Font: Segoe UI</li>
                <li>App Title: 18px Semibold</li>
                <li>Body: 11-12px Normal</li>
                <li>Buttons: 12-14px Semibold</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Colors</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>Primary: #3860B2</li>
                <li>Success: #107C10</li>
                <li>Header: #2D2D30</li>
                <li>Background: #F8F8F8</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Layout</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>Canvas: 1024x768 (Tablet)</li>
                <li>Header Height: 60px</li>
                <li>Nav Height: 60px</li>
                <li>Corner Radius: 4-12px</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SCREEN 1: HOME (LANDING)
// ============================================
function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="flex h-full flex-col font-sans" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <header className="flex h-[60px] items-center justify-center" style={{ backgroundColor: colors.header }}>
        <h1 className="text-lg font-semibold text-white">Student Portal</h1>
      </header>

      {/* Content Area */}
      <main className="flex flex-1 flex-col items-center px-5 pt-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold" style={{ color: colors.text }}>
            Welcome, John!
          </h2>
          <p className="mt-1 text-sm" style={{ color: colors.textMuted }}>
            What would you like to do today?
          </p>
        </div>

        {/* Action Cards */}
        <div className="flex w-full max-w-[984px] items-center justify-center gap-0">
          {/* Submit New Request Card */}
          <div
            className="flex w-[430px] flex-col items-center rounded-lg border p-6"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.borderLight,
              height: 350,
            }}
          >
            <div
              className="mt-4 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.primary}15` }}
            >
              <Plus className="h-10 w-10" style={{ color: colors.primary }} />
            </div>
            <h3 className="mt-5 text-base font-semibold" style={{ color: colors.text }}>
              Submit New Request
            </h3>
            <p className="mt-2 text-center text-xs" style={{ color: colors.textMuted }}>
              Upload your 3D model file and submit a new print request
            </p>
            <button
              onClick={() => onNavigate("submit")}
              className="mt-auto w-full rounded-md py-3 text-sm font-bold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              GET STARTED
            </button>
          </div>

          {/* OR Divider */}
          <div
            className="z-10 -mx-6 flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold"
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.borderLight,
              color: colors.textMuted,
            }}
          >
            OR
          </div>

          {/* My Requests Card */}
          <div
            className="flex w-[430px] flex-col items-center rounded-lg border p-6"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.borderLight,
              height: 350,
            }}
          >
            <div
              className="mt-4 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.success}15` }}
            >
              <List className="h-10 w-10" style={{ color: colors.success }} />
            </div>
            <h3 className="mt-5 text-base font-semibold" style={{ color: colors.text }}>
              My Requests
            </h3>
            <p className="mt-2 text-center text-xs" style={{ color: colors.textMuted }}>
              View status, confirm estimates, or manage your existing requests
            </p>
            <button
              onClick={() => onNavigate("myRequests")}
              className="mt-auto w-full rounded-md py-3 text-sm font-bold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: colors.success }}
            >
              VIEW REQUESTS
            </button>
          </div>
        </div>

        {/* Help Footer */}
        <p className="mt-auto pb-4 text-xs" style={{ color: colors.textMuted }}>
          Need help? Visit Room 145 Atkinson Hall or email fablab@lsu.edu
        </p>
      </main>

      {/* Navigation Bar */}
      <nav className="flex h-[60px] items-center justify-center" style={{ backgroundColor: colors.header }}>
        <span className="text-xs" style={{ color: colors.textLight }}>
          Student Portal
        </span>
      </nav>
    </div>
  )
}

// ============================================
// SCREEN 2: SUBMIT REQUEST
// ============================================
function SubmitScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="flex h-full flex-col font-sans" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <header className="flex h-[60px] items-center px-5" style={{ backgroundColor: colors.header }}>
        <h1 className="text-lg font-semibold text-white">Submit 3D Print Request</h1>
      </header>

      {/* Form Area */}
      <main className="flex-1 overflow-y-auto px-5 py-5">
        <div
          className="rounded-lg border p-5"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.borderLight }}
        >
          {/* Form Fields Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Student Name */}
            <FormField label="Student" required>
              <SelectInput placeholder="Search for your name..." />
            </FormField>

            {/* Student Email */}
            <FormField label="Student Email" required>
              <TextInput value="john.doe@lsu.edu" disabled />
            </FormField>

            {/* Tiger Card Number */}
            <FormField label="Tiger Card Number" required>
              <TextInput placeholder="16-digit POS number from Tiger Card" />
              <div className="mt-2 flex items-center gap-2 rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800">
                <div className="h-16 w-24 rounded border border-dashed border-amber-400 bg-amber-100 flex items-center justify-center text-[10px] text-amber-600">
                  Tiger Card Image
                </div>
                <span>Find the 16-digit POS number on the back of your card</span>
              </div>
            </FormField>

            {/* Course Number */}
            <FormField label="Course Number">
              <TextInput placeholder="e.g., 2001, 4000" />
            </FormField>

            {/* Discipline */}
            <FormField label="Discipline" required>
              <SelectInput placeholder="Select discipline..." />
            </FormField>

            {/* Project Type */}
            <FormField label="Project Type" required>
              <SelectInput placeholder="Select project type..." />
            </FormField>

            {/* Method */}
            <FormField label="Method" required>
              <SelectInput placeholder="Select method..." value="Filament" />
            </FormField>

            {/* Printer */}
            <FormField label="Printer" required>
              <SelectInput placeholder="Select printer..." />
            </FormField>

            {/* Color */}
            <FormField label="Color" required>
              <SelectInput placeholder="Select color..." />
            </FormField>

            {/* Due Date */}
            <FormField label="Due Date">
              <TextInput type="date" />
            </FormField>

            {/* Notes - Full Width */}
            <div className="col-span-2">
              <FormField label="Notes">
                <textarea
                  className="w-full rounded border px-3 py-2 text-sm outline-none transition-colors focus:border-[rgb(56,96,178)]"
                  style={{ borderColor: colors.border, minHeight: 60 }}
                  placeholder="Special instructions, scaling notes, questions for staff..."
                />
              </FormField>
            </div>

            {/* Attachments - Full Width */}
            <div className="col-span-2">
              <FormField label="Attachments">
                <div
                  className="flex items-center gap-3 rounded border-2 border-dashed p-4"
                  style={{ borderColor: colors.border }}
                >
                  <Paperclip className="h-5 w-5" style={{ color: colors.textMuted }} />
                  <span className="text-sm" style={{ color: colors.textMuted }}>
                    Click to attach files or drag and drop
                  </span>
                </div>
                {/* File Warning */}
                <div
                  className="mt-3 rounded border p-3 text-xs"
                  style={{
                    backgroundColor: "rgb(255, 244, 206)",
                    borderColor: colors.warning,
                    color: "rgb(102, 77, 3)",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">IMPORTANT: File Naming Requirement</p>
                      <p className="mt-1">Your files MUST be named: FirstLast_Method_Color</p>
                      <p className="mt-1">Examples: JaneDoe_Filament_Blue.stl, MikeSmith_Resin_Clear.3mf</p>
                      <p className="mt-1">Accepted formats: .stl, .obj, .3mf, .idea, .form</p>
                    </div>
                  </div>
                </div>
              </FormField>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="mt-6 w-full rounded-md py-3.5 text-sm font-bold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: colors.primary }}
          >
            SUBMIT REQUEST
          </button>
        </div>
      </main>

      {/* Navigation Bar */}
      <NavBar currentScreen="submit" onNavigate={onNavigate} />
    </div>
  )
}

// ============================================
// SCREEN 3: MY REQUESTS
// ============================================
function MyRequestsScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const mockRequests = [
    {
      id: "PR-2024-0042",
      status: "Pending",
      statusColor: colors.pending,
      textDark: true,
      date: "Jan 15, 2024",
      method: "Filament",
      printer: "Prusa MK4S",
      color: "Blue",
      estimatedCost: "$4.50",
      showConfirm: true,
    },
    {
      id: "PR-2024-0038",
      status: "Printing",
      statusColor: colors.printing,
      textDark: false,
      date: "Jan 12, 2024",
      method: "Filament",
      printer: "Prusa XL",
      color: "Black",
      estimatedCost: "$8.25",
      showConfirm: false,
    },
    {
      id: "PR-2024-0035",
      status: "Completed",
      statusColor: colors.completed,
      textDark: false,
      date: "Jan 10, 2024",
      method: "Resin",
      printer: "Form 3",
      color: "Gray",
      estimatedCost: "$12.00",
      showConfirm: false,
    },
    {
      id: "PR-2024-0031",
      status: "Paid & Picked Up",
      statusColor: colors.paidPickedUp,
      textDark: false,
      date: "Jan 8, 2024",
      method: "Filament",
      printer: "Prusa MK4S",
      color: "Red",
      estimatedCost: "$3.75",
      showConfirm: false,
    },
    {
      id: "PR-2024-0028",
      status: "Uploaded",
      statusColor: colors.uploaded,
      textDark: false,
      date: "Jan 5, 2024",
      method: "Filament",
      printer: "Raised3D Pro 2 Plus",
      color: "White",
      estimatedCost: "Pending",
      showConfirm: false,
    },
    {
      id: "PR-2024-0022",
      status: "Rejected",
      statusColor: colors.rejected,
      textDark: false,
      date: "Jan 2, 2024",
      method: "Resin",
      printer: "Form 3",
      color: "Clear",
      estimatedCost: "-",
      showConfirm: false,
    },
  ]

  return (
    <div className="flex h-full flex-col font-sans" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <header
        className="flex h-[60px] items-center justify-between px-5"
        style={{ backgroundColor: colors.header }}
      >
        <h1 className="text-lg font-semibold text-white">My Print Requests</h1>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </header>

      {/* Request Cards Grid */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-4">
          {mockRequests.map((request) => (
            <RequestCard key={request.id} {...request} />
          ))}
        </div>
      </main>

      {/* Navigation Bar */}
      <NavBar currentScreen="myRequests" onNavigate={onNavigate} />
    </div>
  )
}

// ============================================
// SHARED COMPONENTS
// ============================================

function NavBar({
  currentScreen,
  onNavigate,
}: {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
}) {
  return (
    <nav
      className="flex h-[60px] items-center justify-center gap-4 px-5"
      style={{ backgroundColor: colors.header }}
    >
      <NavButton
        label="Home"
        active={currentScreen === "home"}
        onClick={() => onNavigate("home")}
      />
      <NavButton
        label="New Request"
        active={currentScreen === "submit"}
        onClick={() => onNavigate("submit")}
      />
      <NavButton
        label="My Requests"
        active={currentScreen === "myRequests"}
        onClick={() => onNavigate("myRequests")}
      />
    </nav>
  )
}

function NavButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-md px-8 py-2.5 text-xs font-medium text-white transition-colors"
      style={{
        backgroundColor: active ? colors.info : "rgb(60, 60, 65)",
        fontWeight: active ? 600 : 400,
      }}
    >
      {label}
    </button>
  )
}

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium" style={{ color: colors.text }}>
        {label}
        {required && <span style={{ color: colors.danger }}> *</span>}
      </label>
      {children}
    </div>
  )
}

function TextInput({
  placeholder,
  value,
  disabled,
  type = "text",
}: {
  placeholder?: string
  value?: string
  disabled?: boolean
  type?: string
}) {
  return (
    <input
      type={type}
      className="w-full rounded border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[rgb(56,96,178)] disabled:bg-gray-100"
      style={{ borderColor: colors.border, color: colors.text }}
      placeholder={placeholder}
      defaultValue={value}
      disabled={disabled}
    />
  )
}

function SelectInput({ placeholder, value }: { placeholder?: string; value?: string }) {
  return (
    <div
      className="flex w-full items-center justify-between rounded border px-3 py-2.5 text-sm"
      style={{ borderColor: colors.border }}
    >
      <span style={{ color: value ? colors.text : colors.textLight }}>{value || placeholder}</span>
      <ChevronDown className="h-4 w-4" style={{ color: colors.textMuted }} />
    </div>
  )
}

function RequestCard({
  id,
  status,
  statusColor,
  textDark,
  date,
  method,
  printer,
  color,
  estimatedCost,
  showConfirm,
}: {
  id: string
  status: string
  statusColor: string
  textDark: boolean
  date: string
  method: string
  printer: string
  color: string
  estimatedCost: string
  showConfirm: boolean
}) {
  return (
    <div
      className="rounded-lg border p-4"
      style={{ backgroundColor: colors.bgCard, borderColor: colors.borderLight }}
    >
      {/* Header Row */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: colors.text }}>
            {id}
          </p>
          <p className="text-xs" style={{ color: colors.textMuted }}>
            Submitted: {date}
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-[10px] font-semibold"
          style={{
            backgroundColor: statusColor,
            color: textDark ? colors.text : "white",
          }}
        >
          {status}
        </span>
      </div>

      {/* Details */}
      <p className="text-xs" style={{ color: colors.textMuted }}>
        {method} | {printer}
      </p>
      <p className="text-xs" style={{ color: colors.textMuted }}>
        Color: {color}
      </p>

      {/* Cost */}
      <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: colors.borderLight }}>
        <span className="text-xs" style={{ color: colors.textMuted }}>
          Estimated Cost:
        </span>
        <span className="text-sm font-semibold" style={{ color: colors.text }}>
          {estimatedCost}
        </span>
      </div>

      {/* Action Buttons */}
      {showConfirm && (
        <div className="mt-3 flex gap-2">
          <button
            className="flex-1 rounded py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: colors.success }}
          >
            CONFIRM
          </button>
          <button
            className="flex-1 rounded py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: colors.danger }}
          >
            CANCEL
          </button>
        </div>
      )}
    </div>
  )
}
