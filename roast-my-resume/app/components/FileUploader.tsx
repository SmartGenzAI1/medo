"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { extractTextFromDOCX } from "@/lib/docx-parser";

interface FileUploaderProps {
  onFileLoaded: (text: string, fileName: string) => void;
  onError: (error: string) => void;
}

export function FileUploader({ onFileLoaded, onError }: FileUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const processFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      onError("File size must be less than 5MB");
      return;
    }

    setIsProcessing(true);
    
    try {
      let text = "";
      
      if (file.type === "application/pdf") {
        text = await extractTextFromPDF(file);
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        text = await extractTextFromDOCX(file);
      } else {
        onError("Please upload a PDF or DOCX file");
        return;
      }

      // Trim to max 15,000 characters
      if (text.length > 15000) {
        text = text.substring(0, 15000) + "\n\n[Text truncated - resume too long]";
      }

      setExtractedText(text);
      setFileName(file.name);
      onFileLoaded(text, file.name);
    } catch (error) {
      console.error("File parsing error:", error);
      onError("Failed to parse file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [onFileLoaded, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
  });

  const toggleTextPreview = () => {
    setExtractedText(extractedText ? null : extractedText);
  };

  return (
    <Card className="w-full glass-card">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-muted hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Parsing your resume...</p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="text-4xl">📄</div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to select (PDF or DOCX, max 5MB)
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {extractedText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-primary">✓ Resume loaded: {fileName}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTextPreview}
                className="text-xs"
              >
                {extractedText ? "Hide preview" : "Show preview"}
              </Button>
            </div>
            
            {extractedText && (
              <div className="bg-muted/50 rounded-md p-3 max-h-48 overflow-y-auto">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {extractedText}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
