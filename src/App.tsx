import React, { useEffect, useState } from "react";
import { FolderGit2, Calendar, HardDrive, RefreshCw, Layers } from "lucide-react";
import { Submission } from "./types";
import SubmissionForm from "./components/SubmissionForm";
import SubmissionTable from "./components/SubmissionTable";
import StatsDashboard from "./components/StatsDashboard";

export default function App() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load submissions from local API
  const fetchSubmissions = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/submissions");
      if (!response.ok) {
        throw new Error("Failed to scan current server flat files.");
      }
      const data = await response.json();
      setSubmissions(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Unable to load entries.");
    } finally {
      setLoading(false);
    }
  };

  // Add a newly submitted row from the form directly without reloading everything
  const handleNewSubmission = (newSub: Submission) => {
    setSubmissions((prev) => [newSub, ...prev]);
  };

  // Clear Flat File content via server endpoint
  const handleClearDisk = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/submissions/clear", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Could not completely wipe disk storage.");
      }
      setSubmissions([]);
    } catch (err: any) {
      setErrorMsg(err.message || "Wiping storage failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Sleek Navigation Rail */}
      <header className="h-16 sticky top-0 z-40 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shadow-sm shrink-0">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
            F
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-base font-bold tracking-tight text-slate-800 leading-none">
              FlatFile Utility
            </h1>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Storage Engine v2.4.0
            </span>
          </div>
        </div>

        {/* Right workspace details */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            File System Ready
          </div>
          <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-700">Administrator</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-tighter">
              June 2, 2026 • UTC
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Statistics Dashboard Banner */}
        <StatsDashboard submissions={submissions} />

        {/* Global error message alert */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-xs flex justify-between items-center">
            <p className="font-medium">⚠️ Error: {errorMsg}</p>
            <button
              onClick={fetchSubmissions}
              className="text-[11px] bg-white border border-red-200 hover:bg-red-100 rounded-lg px-2 py-1 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Two Columns Screen Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Submit Input: spanning 4 cols */}
          <div className="lg:col-span-5 xl:col-span-4">
            <SubmissionForm onSuccess={handleNewSubmission} />
          </div>

          {/* Table Stored Viewer: spanning 8 cols */}
          <div className="lg:col-span-7 xl:col-span-8 h-full">
            <SubmissionTable
              submissions={submissions}
              onRefresh={fetchSubmissions}
              onClear={handleClearDisk}
              isLoading={loading}
            />
          </div>
        </div>
      </main>

      {/* Bottom Legal footer details */}
      <footer className="bg-white border-t border-slate-200 px-4 py-5 md:px-8 text-center text-xs text-slate-400 select-none flex flex-col sm:flex-row justify-between items-center gap-3 mt-12">
        <p>© 2026 FlatFile Utility. Powered by Cloud Run containers.</p>
        <p className="font-mono text-[10px] text-slate-300">
          File Path Target: <span className="text-slate-400">./submissions.txt</span>
        </p>
      </footer>
    </div>
  );
}
