import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Mail, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Submission } from "../types";

interface SubmissionFormProps {
  onSuccess: (newSubmission: Submission) => void;
}

export default function SubmissionForm({ onSuccess }: SubmissionFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Field touch/dirty states for elegant inline helper prompts
  const [touched, setTouched] = useState({
    name: false,
    email: false,
  });

  const isEmailValid = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleBlur = (field: "name" | "email") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validate inputs
    if (!name.trim()) {
      setFormError("Name is required.");
      return;
    }
    if (!email.trim() || !isEmailValid(email)) {
      setFormError("A valid email address is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          comments: comments.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit form.");
      }

      const result = await response.json();
      
      // Success triggers
      setFormSuccess(result.message || "Data saved successfully.");
      onSuccess(result.submission);

      // Clean form fields
      setName("");
      setEmail("");
      setComments("");
      setTouched({ name: false, email: false });

      // Automatically hide success in 5 seconds
      setTimeout(() => {
        setFormSuccess(null);
      }, 5000);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200 p-6 md:p-8 flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          New Entry
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Post data to <code className="bg-slate-50 px-1.5 py-0.5 rounded text-blue-600 font-mono text-xs font-semibold">submissions.txt</code>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
        {/* Name Input */}
        <div className="shrink-0 space-y-1.5">
          <label htmlFor="name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-450">
              <User size={16} />
            </span>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur("name")}
              placeholder="e.g. David Kyali"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:bg-white text-slate-800 ${
                touched.name && !name.trim()
                  ? "border-red-300 focus:ring-red-100 focus:border-red-400"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
              }`}
            />
          </div>
          {touched.name && !name.trim() && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle size={12} /> Name is a required field.
            </p>
          )}
        </div>

        {/* Email Input */}
        <div className="shrink-0 space-y-1.5">
          <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-450">
              <Mail size={16} />
            </span>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              placeholder="e.g. davidkyali25@domain.com"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:bg-white text-slate-800 ${
                touched.email && (!email.trim() || !isEmailValid(email))
                  ? "border-red-300 focus:ring-red-100 focus:border-red-400"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
              }`}
            />
          </div>
          {touched.email && !email.trim() && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle size={12} /> Email is a required field.
            </p>
          )}
          {touched.email && email.trim() && !isEmailValid(email) && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle size={12} /> Please enter a valid email address.
            </p>
          )}
        </div>

        {/* Comments Input */}
        <div className="flex-1 min-h-0 flex flex-col space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="comments" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Comments
            </label>
            <span className="text-[10px] font-mono text-slate-400">
              {comments.length} chars
            </span>
          </div>
          <div className="relative flex-1 min-h-[100px] flex flex-col">
            <span className="absolute top-3 left-3 flex items-start pointer-events-none text-slate-450">
              <FileText size={16} />
            </span>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Requesting access configuration..."
              rows={4}
              className="w-full flex-1 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:bg-white focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 resize-none"
            />
          </div>
        </div>

        {/* Action Error/Success Displays */}
        <AnimatePresence mode="wait">
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl p-3 text-red-700 text-xs"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Submission failed:</span> {formError}
              </div>
            </motion.div>
          )}

          {formSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-start gap-2.5 bg-green-50 border border-green-100 rounded-xl p-3 text-green-700 text-xs"
            >
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Success!</span> {formSuccess}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          id="btn-save-data"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all mt-4 shrink-0 flex items-center justify-center gap-2 select-none disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving to Flat File...
            </>
          ) : (
            "Save to Flat File"
          )}
        </button>
      </form>
    </div>
  );
}
