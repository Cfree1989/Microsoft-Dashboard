"use client"

import { useState } from "react"
import { Plus, List, RefreshCw, ChevronDown, Paperclip, AlertTriangle, Home, FileText, ChevronLeft, X, Check, Printer } from "lucide-react"

type Screen = "home" | "submit" | "myRequests"

export default function StudentPortalDesign() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home")

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6 md:p-10">
      <div className="mx-auto max-w-[1100px]">
        {/* Design Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">
            Student Portal - Power Apps Design
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Microsoft Fluent Design | Tablet Layout (1024 x 768)
          </p>
        </div>

        {/* Screen Selector Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg bg-[#2a2a2a] p-1">
          {[
            { id: "home", label: "Home" },
            { id: "submit", label: "Submit Request" },
            { id: "myRequests", label: "My Requests" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentScreen(tab.id as Screen)}
              className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                currentScreen === tab.id
                  ? "bg-[#3860B2] text-white shadow-lg"
                  : "text-neutral-400 hover:bg-[#3a3a3a] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Power Apps Device Frame */}
        <div className="overflow-hidden rounded-xl bg-[#2d2d30] shadow-2xl">
          {/* Device Top Bar */}
          <div className="flex items-center justify-between bg-[#1e1e1e] px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <div className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xs text-neutral-500">Power Apps Studio - Student Portal</span>
            <div className="w-14" />
          </div>
          
          {/* Canvas Container */}
          <div className="flex items-center justify-center bg-[#404040] p-6">
            <div 
              className="overflow-hidden rounded-lg shadow-2xl"
              style={{ 
                width: 1024, 
                height: 768,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              }}
            >
              {currentScreen === "home" && <HomeScreen onNavigate={setCurrentScreen} />}
              {currentScreen === "submit" && <SubmitScreen onNavigate={setCurrentScreen} />}
              {currentScreen === "myRequests" && <MyRequestsScreen onNavigate={setCurrentScreen} />}
            </div>
          </div>
        </div>

        {/* Design Specs Panel */}
        <div className="mt-6 grid grid-cols-4 gap-4 rounded-xl bg-[#2a2a2a] p-5">
          <SpecCard 
            title="Typography" 
            items={["Segoe UI", "Headers: 18px Semibold", "Body: 11-12px", "Buttons: 12-14px Bold"]} 
          />
          <SpecCard 
            title="Primary Colors" 
            items={["Primary: #3860B2", "Success: #107C10", "Warning: #FFB900", "Danger: #D13438"]} 
          />
          <SpecCard 
            title="Neutrals" 
            items={["Header: #2D2D30", "Background: #F8F8F8", "Card: #FFFFFF", "Border: #C8C8C8"]} 
          />
          <SpecCard 
            title="Layout" 
            items={["Canvas: 1024 x 768", "Header: 60px", "Nav Bar: 60px", "Radius: 4-12px"]} 
          />
        </div>
      </div>
    </div>
  )
}

function SpecCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">{title}</h3>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-neutral-300">{item}</li>
        ))}
      </ul>
    </div>
  )
}

// ============================================
// SCREEN 1: HOME (LANDING)
// ============================================
function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="flex h-full flex-col" style={{ fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f8f8f8" }}>
      {/* Header */}
      <header 
        className="flex h-[60px] items-center justify-center"
        style={{ backgroundColor: "#2d2d30" }}
      >
        <h1 className="text-[18px] font-semibold text-white tracking-wide">Student Portal</h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-8">
        {/* Welcome Section */}
        <div className="mb-10 text-center">
          <h2 className="text-[28px] font-semibold" style={{ color: "#323232" }}>
            Welcome, John!
          </h2>
          <p className="mt-2 text-[14px]" style={{ color: "#646464" }}>
            What would you like to do today?
          </p>
        </div>

        {/* Action Cards */}
        <div className="flex items-center gap-0">
          {/* Submit New Request Card */}
          <div
            className="flex w-[400px] flex-col items-center rounded-xl p-8"
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
              height: 340,
            }}
          >
            <div
              className="flex h-[80px] w-[80px] items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(56, 96, 178, 0.1)" }}
            >
              <Plus className="h-10 w-10" style={{ color: "#3860B2" }} strokeWidth={1.5} />
            </div>
            <h3 className="mt-6 text-[16px] font-semibold" style={{ color: "#323232" }}>
              Submit New Request
            </h3>
            <p className="mt-3 text-center text-[12px] leading-relaxed px-4" style={{ color: "#646464" }}>
              Upload your 3D model file and submit a new print request to the FabLab
            </p>
            <button
              onClick={() => onNavigate("submit")}
              className="mt-auto w-full rounded-md py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#3860B2" }}
            >
              Get Started
            </button>
          </div>

          {/* OR Divider */}
          <div
            className="z-10 -mx-5 flex h-11 w-11 items-center justify-center rounded-full text-[11px] font-bold"
            style={{
              backgroundColor: "#f8f8f8",
              border: "2px solid #e0e0e0",
              color: "#969696",
            }}
          >
            OR
          </div>

          {/* My Requests Card */}
          <div
            className="flex w-[400px] flex-col items-center rounded-xl p-8"
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
              height: 340,
            }}
          >
            <div
              className="flex h-[80px] w-[80px] items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(16, 124, 16, 0.1)" }}
            >
              <List className="h-10 w-10" style={{ color: "#107C10" }} strokeWidth={1.5} />
            </div>
            <h3 className="mt-6 text-[16px] font-semibold" style={{ color: "#323232" }}>
              My Requests
            </h3>
            <p className="mt-3 text-center text-[12px] leading-relaxed px-4" style={{ color: "#646464" }}>
              View status, confirm estimates, or manage your existing print requests
            </p>
            <button
              onClick={() => onNavigate("myRequests")}
              className="mt-auto w-full rounded-md py-3.5 text-[13px] font-bold uppercase tracking-wide text-white transition-all hover:opacity-90"
              style={{ backgroundColor: "#107C10" }}
            >
              View Requests
            </button>
          </div>
        </div>

        {/* Help Footer */}
        <p className="mt-12 text-[11px]" style={{ color: "#969696" }}>
          Need help? Visit Room 145 Atkinson Hall or email fablab@lsu.edu
        </p>
      </main>

      {/* Navigation Bar */}
      <nav 
        className="flex h-[60px] items-center justify-center"
        style={{ backgroundColor: "#2d2d30" }}
      >
        <span className="text-[11px] tracking-wide" style={{ color: "#969696" }}>
          FabLab 3D Print Request System
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
    <div className="flex h-full flex-col" style={{ fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f8f8f8" }}>
      {/* Header */}
      <header 
        className="flex h-[60px] items-center gap-4 px-5"
        style={{ backgroundColor: "#2d2d30" }}
      >
        <button 
          onClick={() => onNavigate("home")}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-[18px] font-semibold text-white">Submit 3D Print Request</h1>
      </header>

      {/* Scrollable Form Area */}
      <main className="flex-1 overflow-y-auto px-5 py-4">
        <div
          className="rounded-lg p-5"
          style={{ 
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
          }}
        >
          {/* Form Grid */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            {/* Student */}
            <FormField label="Student" required>
              <SelectInput placeholder="Search for your name..." />
            </FormField>

            {/* Email */}
            <FormField label="Student Email" required>
              <TextInput value="john.doe@lsu.edu" disabled />
            </FormField>

            {/* Tiger Card */}
            <FormField label="Tiger Card Number" required>
              <TextInput placeholder="16-digit POS number" />
              <div 
                className="mt-2 flex items-center gap-3 rounded-md p-2.5"
                style={{ backgroundColor: "#FFF8E1", border: "1px solid #FFE082" }}
              >
                <div 
                  className="flex h-12 w-20 items-center justify-center rounded border-2 border-dashed text-[9px] font-medium"
                  style={{ borderColor: "#FFB300", color: "#F57C00", backgroundColor: "#FFF3E0" }}
                >
                  Tiger Card
                </div>
                <span className="text-[11px]" style={{ color: "#E65100" }}>
                  Find the 16-digit POS number on the back
                </span>
              </div>
            </FormField>

            {/* Course */}
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
              <SelectInput value="Filament" />
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

            {/* Notes */}
            <div className="col-span-2">
              <FormField label="Notes">
                <textarea
                  className="w-full rounded-md border px-3 py-2.5 text-[12px] outline-none transition-colors focus:border-[#3860B2]"
                  style={{ borderColor: "#c8c8c8", minHeight: 60, resize: "none" }}
                  placeholder="Special instructions, scaling notes, questions for staff..."
                />
              </FormField>
            </div>

            {/* Attachments */}
            <div className="col-span-2">
              <FormField label="Attachments" required>
                <div
                  className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed p-5 transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#c8c8c8" }}
                >
                  <Paperclip className="h-5 w-5" style={{ color: "#969696" }} />
                  <span className="text-[12px]" style={{ color: "#646464" }}>
                    Click to attach files or drag and drop
                  </span>
                </div>
                {/* Warning Banner */}
                <div
                  className="mt-3 rounded-md p-3"
                  style={{ backgroundColor: "#FFF8E1", border: "1px solid #FFB900" }}
                >
                  <div className="flex gap-2.5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "#F57C00" }} />
                    <div className="text-[11px]" style={{ color: "#5D4037" }}>
                      <p className="font-bold">IMPORTANT: File Naming Requirement</p>
                      <p className="mt-1">Your files MUST be named: <span className="font-semibold">FirstLast_Method_Color</span></p>
                      <p className="mt-0.5 text-[10px]" style={{ color: "#795548" }}>
                        Example: JaneDoe_Filament_Blue.stl | Accepted: .stl, .obj, .3mf, .idea, .form
                      </p>
                    </div>
                  </div>
                </div>
              </FormField>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="mt-5 w-full rounded-md py-4 text-[14px] font-bold uppercase tracking-wide text-white transition-all hover:opacity-90"
            style={{ backgroundColor: "#3860B2" }}
          >
            Submit Request
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
      statusBg: "#FFB900",
      statusText: "#323232",
      date: "Jan 15, 2024",
      method: "Filament",
      printer: "Prusa MK4S",
      color: "Blue",
      cost: "$4.50",
      showConfirm: true,
    },
    {
      id: "PR-2024-0038",
      status: "Printing",
      statusBg: "#6B69D6",
      statusText: "#ffffff",
      date: "Jan 12, 2024",
      method: "Filament",
      printer: "Prusa XL",
      color: "Black",
      cost: "$8.25",
      showConfirm: false,
    },
    {
      id: "PR-2024-0035",
      status: "Completed",
      statusBg: "#004E8C",
      statusText: "#ffffff",
      date: "Jan 10, 2024",
      method: "Resin",
      printer: "Form 3",
      color: "Gray",
      cost: "$12.00",
      showConfirm: false,
    },
    {
      id: "PR-2024-0031",
      status: "Paid & Picked Up",
      statusBg: "#009E49",
      statusText: "#ffffff",
      date: "Jan 8, 2024",
      method: "Filament",
      printer: "Prusa MK4S",
      color: "Red",
      cost: "$3.75",
      showConfirm: false,
    },
    {
      id: "PR-2024-0028",
      status: "Uploaded",
      statusBg: "#4682DC",
      statusText: "#ffffff",
      date: "Jan 5, 2024",
      method: "Filament",
      printer: "Raised3D Pro 2",
      color: "White",
      cost: "Pending",
      showConfirm: false,
    },
    {
      id: "PR-2024-0022",
      status: "Rejected",
      statusBg: "#D13438",
      statusText: "#ffffff",
      date: "Jan 2, 2024",
      method: "Resin",
      printer: "Form 3",
      color: "Clear",
      cost: "-",
      showConfirm: false,
    },
  ]

  return (
    <div className="flex h-full flex-col" style={{ fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f8f8f8" }}>
      {/* Header */}
      <header 
        className="flex h-[60px] items-center justify-between px-5"
        style={{ backgroundColor: "#2d2d30" }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate("home")}
            className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-[18px] font-semibold text-white">My Print Requests</h1>
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors"
          style={{ backgroundColor: "#3860B2" }}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </header>

      {/* Request Cards */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-3">
          {mockRequests.map((req) => (
            <div 
              key={req.id}
              className="rounded-lg p-4"
              style={{ 
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
              }}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: "#323232" }}>{req.id}</p>
                  <p className="text-[10px]" style={{ color: "#969696" }}>Submitted: {req.date}</p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-[9px] font-bold uppercase"
                  style={{ backgroundColor: req.statusBg, color: req.statusText }}
                >
                  {req.status}
                </span>
              </div>

              {/* Details */}
              <div className="mt-3 space-y-0.5">
                <p className="text-[11px]" style={{ color: "#646464" }}>
                  <span className="font-medium">{req.method}</span> | {req.printer}
                </p>
                <p className="text-[11px]" style={{ color: "#646464" }}>
                  Color: {req.color}
                </p>
              </div>

              {/* Cost */}
              <div 
                className="mt-3 flex items-center justify-between border-t pt-3"
                style={{ borderColor: "#e8e8e8" }}
              >
                <span className="text-[10px]" style={{ color: "#969696" }}>Est. Cost:</span>
                <span className="text-[14px] font-bold" style={{ color: "#323232" }}>{req.cost}</span>
              </div>

              {/* Confirm/Cancel Buttons */}
              {req.showConfirm && (
                <div className="mt-3 flex gap-2">
                  <button
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[11px] font-bold uppercase text-white"
                    style={{ backgroundColor: "#107C10" }}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Confirm
                  </button>
                  <button
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[11px] font-bold uppercase text-white"
                    style={{ backgroundColor: "#D13438" }}
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
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
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "submit", label: "New Request", icon: Plus },
    { id: "myRequests", label: "My Requests", icon: List },
  ]

  return (
    <nav 
      className="flex h-[60px] items-center justify-center gap-2 px-4"
      style={{ backgroundColor: "#2d2d30" }}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = currentScreen === item.id
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Screen)}
            className="flex items-center gap-2 rounded-md px-5 py-2.5 text-[12px] font-medium text-white transition-colors"
            style={{
              backgroundColor: isActive ? "#4682DC" : "#3c3c41",
            }}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        )
      })}
    </nav>
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
      <label className="mb-1.5 block text-[11px] font-semibold" style={{ color: "#323232" }}>
        {label}
        {required && <span style={{ color: "#D13438" }}> *</span>}
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
      className="w-full rounded-md border px-3 py-2.5 text-[12px] outline-none transition-colors focus:border-[#3860B2] disabled:cursor-not-allowed disabled:bg-[#f5f5f5]"
      style={{ borderColor: "#c8c8c8", color: "#323232" }}
      placeholder={placeholder}
      defaultValue={value}
      disabled={disabled}
    />
  )
}

function SelectInput({ placeholder, value }: { placeholder?: string; value?: string }) {
  return (
    <div
      className="flex w-full cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 text-[12px]"
      style={{ borderColor: "#c8c8c8" }}
    >
      <span style={{ color: value ? "#323232" : "#969696" }}>{value || placeholder}</span>
      <ChevronDown className="h-4 w-4" style={{ color: "#969696" }} />
    </div>
  )
}
