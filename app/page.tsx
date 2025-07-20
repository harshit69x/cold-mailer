"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, FileSpreadsheet, FileText, Send, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EmailResult {
  email: string
  status: string
}

interface ApiResponse {
  results: EmailResult[]
}

export default function EmailSenderPage() {
  const [formData, setFormData] = useState({
    prompt: "",
    subject: "",
    excelFile: null as File | null,
    resumeFile: null as File | null,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<EmailResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (field: "excelFile" | "resumeFile", file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
    setError("")
  }

  const handleInputChange = (field: "prompt" | "subject", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.prompt.trim()) {
      setError("Email prompt is required")
      return false
    }
    if (!formData.subject.trim()) {
      setError("Email subject is required")
      return false
    }
    if (!formData.excelFile) {
      setError("Excel file with recruiter data is required")
      return false
    }
    if (!formData.resumeFile) {
      setError("Resume PDF file is required")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("prompt", formData.prompt)
      formDataToSend.append("subject", formData.subject)
      formDataToSend.append("excel_file", formData.excelFile!)
      formDataToSend.append("resume_file", formData.resumeFile!)

      // Replace with your actual backend URL
      const response = await fetch("http://localhost:8000/send-emails/", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      setResults(data.results)
      setShowResults(true)

      // Reset form after successful submission
      setFormData({
        prompt: "",
        subject: "",
        excelFile: null,
        resumeFile: null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getSuccessCount = () => results.filter((r) => r.status === "sent").length
  const getFailureCount = () => results.filter((r) => r.status !== "sent").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Bulk Email Sender</h1>
          <p className="text-slate-600 text-lg">Send personalized emails to recruiters with your resume</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Mail className="h-6 w-6 text-blue-600" />
              Email Campaign Setup
            </CardTitle>
            <CardDescription className="text-base">
              Upload your recruiter database and resume to send personalized emails
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Excel File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="excel-file" className="text-sm font-medium flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    Recruiter Database (Excel)
                  </Label>
                  <div className="relative">
                    <Input
                      id="excel-file"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleFileChange("excelFile", e.target.files?.[0] || null)}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Must contain columns: Name, Email, Company</p>
                  {formData.excelFile && (
                    <Badge variant="secondary" className="mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {formData.excelFile.name}
                    </Badge>
                  )}
                </div>

                {/* Resume File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="resume-file" className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    Resume (PDF)
                  </Label>
                  <div className="relative">
                    <Input
                      id="resume-file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange("resumeFile", e.target.files?.[0] || null)}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                  </div>
                  <p className="text-xs text-slate-500">PDF format only</p>
                  {formData.resumeFile && (
                    <Badge variant="secondary" className="mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {formData.resumeFile.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Email Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Email Subject
                </Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="e.g., Application for Software Developer Position"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="text-base"
                />
              </div>

              {/* Email Prompt */}
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-medium">
                  Email Template Prompt
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Write a professional email template. Use placeholders like {name} and {company} for personalization..."
                  value={formData.prompt}
                  onChange={(e) => handleInputChange("prompt", e.target.value)}
                  className="min-h-[120px] text-base resize-none"
                />
                <p className="text-xs text-slate-500">
                  This will be used to generate personalized emails for each recruiter
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Emails...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Send Bulk Emails
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Modal */}
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Email Campaign Results
              </DialogTitle>
              <DialogDescription>Summary of your bulk email campaign</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{getSuccessCount()}</div>
                    <div className="text-sm text-green-600">Emails Sent</div>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-700">{getFailureCount()}</div>
                    <div className="text-sm text-red-600">Failed</div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Results */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Detailed Results</Label>
                <ScrollArea className="h-64 border rounded-md p-4">
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <span className="text-sm font-medium truncate flex-1 mr-2">{result.email}</span>
                        <Badge variant={result.status === "sent" ? "default" : "destructive"} className="text-xs">
                          {result.status === "sent" ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Sent
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </>
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Button onClick={() => setShowResults(false)} className="w-full">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
