"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  type PrintMethod,
  type PrinterType,
  type PrintColor,
  type Discipline,
  type ProjectType,
  PRINTERS_BY_METHOD,
  COLORS_BY_METHOD,
  DISCIPLINES,
  PROJECT_TYPES,
  ACCEPTED_FILE_TYPES,
} from "@/lib/types"
import { MOCK_USER } from "@/lib/mock-data"

interface FormData {
  studentEmail: string
  tigerCardNumber: string
  courseNumber: string
  discipline: Discipline | ""
  projectType: ProjectType | ""
  method: PrintMethod | ""
  printer: PrinterType | ""
  color: PrintColor | ""
  dueDate: string
  notes: string
}

interface FileWithPreview extends File {
  id: string
}

export function SubmitForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<FormData>({
    studentEmail: MOCK_USER.email,
    tigerCardNumber: "",
    courseNumber: "",
    discipline: "",
    projectType: "",
    method: "",
    printer: "",
    color: "",
    dueDate: "",
    notes: "",
  })

  const availablePrinters = formData.method
    ? PRINTERS_BY_METHOD[formData.method as PrintMethod]
    : []

  const availableColors = formData.method
    ? COLORS_BY_METHOD[formData.method as PrintMethod]
    : []

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }

      // Reset dependent fields when method changes
      if (name === "method") {
        newData.printer = ""
        newData.color = ""
      }

      return newData
    })

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const droppedFiles = Array.from(e.dataTransfer.files)
      addFiles(droppedFiles)
    },
    []
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      addFiles(selectedFiles)
    }
  }

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase()
      return ACCEPTED_FILE_TYPES.includes(ext)
    })

    if (validFiles.length !== newFiles.length) {
      setErrors((prev) => ({
        ...prev,
        files: `Some files were rejected. Accepted formats: ${ACCEPTED_FILE_TYPES.join(", ")}`,
      }))
    }

    const filesWithIds = validFiles.map((file) =>
      Object.assign(file, { id: Math.random().toString(36).substr(2, 9) })
    )

    setFiles((prev) => [...prev, ...filesWithIds])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.tigerCardNumber) {
      newErrors.tigerCardNumber = "Tiger Card number is required"
    } else if (formData.tigerCardNumber.length !== 16) {
      newErrors.tigerCardNumber = "Tiger Card number must be 16 digits"
    }

    if (!formData.discipline) {
      newErrors.discipline = "Discipline is required"
    }

    if (!formData.projectType) {
      newErrors.projectType = "Project type is required"
    }

    if (!formData.method) {
      newErrors.method = "Print method is required"
    }

    if (!formData.printer) {
      newErrors.printer = "Printer is required"
    }

    if (!formData.color) {
      newErrors.color = "Color is required"
    }

    if (files.length === 0) {
      newErrors.files = "At least one 3D model file is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setSubmitSuccess(true)

    // Redirect after showing success
    setTimeout(() => {
      router.push("/requests")
    }, 2000)
  }

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Request Submitted!
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Your request has been submitted successfully.
          <br />
          You will receive a confirmation email shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Student Info Section */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Student Information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="studentEmail">Email</Label>
              <Input
                id="studentEmail"
                name="studentEmail"
                value={formData.studentEmail}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Tiger Card Number */}
            <div className="space-y-2">
              <Label htmlFor="tigerCardNumber">
                Tiger Card Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tigerCardNumber"
                name="tigerCardNumber"
                placeholder="16-digit number on your card"
                value={formData.tigerCardNumber}
                onChange={handleInputChange}
                maxLength={16}
                className={errors.tigerCardNumber ? "border-destructive" : ""}
              />
              {errors.tigerCardNumber && (
                <p className="text-xs text-destructive">
                  {errors.tigerCardNumber}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                The 16-digit POS number on your Tiger Card (not your LSUID)
              </p>
            </div>

            {/* Course Number */}
            <div className="space-y-2">
              <Label htmlFor="courseNumber">Course Number (Optional)</Label>
              <Input
                id="courseNumber"
                name="courseNumber"
                placeholder="e.g., 2001"
                type="number"
                value={formData.courseNumber}
                onChange={handleInputChange}
              />
            </div>

            {/* Discipline */}
            <div className="space-y-2">
              <Label htmlFor="discipline">
                Discipline <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.discipline}
                onValueChange={(value) =>
                  handleSelectChange("discipline", value)
                }
              >
                <SelectTrigger
                  className={errors.discipline ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  {DISCIPLINES.map((disc) => (
                    <SelectItem key={disc} value={disc}>
                      {disc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.discipline && (
                <p className="text-xs text-destructive">{errors.discipline}</p>
              )}
            </div>

            {/* Project Type */}
            <div className="space-y-2">
              <Label htmlFor="projectType">
                Project Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.projectType}
                onValueChange={(value) =>
                  handleSelectChange("projectType", value)
                }
              >
                <SelectTrigger
                  className={errors.projectType ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectType && (
                <p className="text-xs text-destructive">{errors.projectType}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Settings Section */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Print Settings
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Method */}
            <div className="space-y-2">
              <Label htmlFor="method">
                Print Method <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.method}
                onValueChange={(value) => handleSelectChange("method", value)}
              >
                <SelectTrigger
                  className={errors.method ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Filament">Filament (FDM)</SelectItem>
                  <SelectItem value="Resin">Resin (SLA)</SelectItem>
                </SelectContent>
              </Select>
              {errors.method && (
                <p className="text-xs text-destructive">{errors.method}</p>
              )}
            </div>

            {/* Printer */}
            <div className="space-y-2">
              <Label htmlFor="printer">
                Printer <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.printer}
                onValueChange={(value) => handleSelectChange("printer", value)}
                disabled={!formData.method}
              >
                <SelectTrigger
                  className={errors.printer ? "border-destructive" : ""}
                >
                  <SelectValue
                    placeholder={
                      formData.method
                        ? "Select printer"
                        : "Select method first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availablePrinters.map((printer) => (
                    <SelectItem key={printer} value={printer}>
                      {printer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.printer && (
                <p className="text-xs text-destructive">{errors.printer}</p>
              )}
              {formData.method && (
                <p className="text-xs text-muted-foreground">
                  Build plate dimensions shown in inches (W x D x H)
                </p>
              )}
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">
                Color <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.color}
                onValueChange={(value) => handleSelectChange("color", value)}
                disabled={!formData.method}
              >
                <SelectTrigger
                  className={errors.color ? "border-destructive" : ""}
                >
                  <SelectValue
                    placeholder={
                      formData.method ? "Select color" : "Select method first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableColors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.color && (
                <p className="text-xs text-destructive">{errors.color}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Preferred Due Date (Optional)</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any special instructions or requirements..."
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            3D Model Files <span className="text-destructive">*</span>
          </h3>

          {/* File Requirements Alert */}
          <Alert className="mb-4 border-info/50 bg-info/10">
            <AlertCircle className="h-4 w-4 text-info" />
            <AlertDescription className="text-sm">
              <strong>File naming required:</strong> FirstLast_Method_Color.ext
              <br />
              <span className="text-xs text-muted-foreground">
                Example: JaneDoe_Filament_Blue.stl | Accepted formats:{" "}
                {ACCEPTED_FILE_TYPES.join(", ")}
              </span>
            </AlertDescription>
          </Alert>

          {/* Drop Zone */}
          <div
            className={`flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              errors.files
                ? "border-destructive bg-destructive/5"
                : "border-border hover:border-primary hover:bg-primary/5"
            }`}
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag & drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: 150MB per file
            </p>
            <input
              id="file-input"
              type="file"
              multiple
              accept={ACCEPTED_FILE_TYPES.join(",")}
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {errors.files && (
            <p className="mt-2 text-xs text-destructive">{errors.files}</p>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-md border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "SUBMIT REQUEST"}
      </Button>
    </form>
  )
}
