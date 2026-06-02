import React, { useState } from "react";
import { Submission } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Download,
  Trash2,
  Table,
  FileCode,
  FileDown,
  RefreshCw,
  FolderOpen,
  Inbox,
  Sparkles,
  HelpCircle,
  AlertTriangle
} from "lucide-react";

interface SubmissionTableProps {
  submissions: Submission[];
  onRefresh: () => void;
  onClear: () => void;
  isLoading: boolean;
}

export default function SubmissionTable({
  submissions,
  onRefresh,
  onClear,
  isLoading,
}: SubmissionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "raw">("table");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter based on search input
  const filteredSubmissions = submissions.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.comments.toLowerCase().includes(term) ||
      s.timestamp.toLowerCase().includes(term)
    );
  });

  // Export CSV Helper
  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    
    // Headers
    const csvRows = [["Timestamp", "Name", "Email", "Comments"]];
    
    // Content rows
    submissions.forEach((s) => {
      // Escape dual-quotes inside comments
      const escapedComments = s.comments.replace(/"/g, '""');
      csvRows.push([
        s.timestamp,
        s.name,
        s.email,
        `"${escapedComments}"`
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + csvRows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `submissions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Raw Flat File
  const handleExportTXT = () => {
    if (submissions.length === 0) return;

    // Convert into timestamp|name|email|comments lines
    const textContent = submissions
      .map((s) => `${s.timestamp}|${s.name}|${s.email}|${s.comments}`)
      .join("\n");

    const element = document.createElement("a");
    const file = new Blob([textContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "submissions.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div id="data-viewer-container" className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200 flex flex-col h-full min-h-[500px] overflow-hidden">
      {/* Viewer Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Flat File Viewer
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            Delimiter: Pipe (|) &bull; encoding: UTF-8
          </p>
        </div>

        {/* Dynamic Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle Buttons */}
          <div className="bg-slate-200/60 p-0.5 rounded-lg flex items-center shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 sm:px-3 sm:py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all uppercase tracking-wider ${
                viewMode === "table"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <Table size={13} />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`p-1.5 sm:px-3 sm:py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all uppercase tracking-wider ${
                viewMode === "raw"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Raw Flat File View"
            >
              <FileCode size={13} />
              <span className="hidden sm:inline">Raw File</span>
            </button>
          </div>

          {/* Disk Refresh Trigger */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-50"
            title="Refresh from Disk"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin text-blue-600" : ""} />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1"></div>

          {/* Export Dropdown / Trigger */}
          {submissions.length > 0 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider cursor-pointer"
                title="Export submissions as standard CSV sheet"
              >
                Export CSV
              </button>
              <button
                onClick={handleExportTXT}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider cursor-pointer"
                title="Download direct flat file submissions.txt replica"
              >
                Get RAW txt
              </button>
              
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg text-[10px] font-bold text-red-600 hover:bg-red-100 transition-colors uppercase tracking-wider cursor-pointer"
                title="Clear Flat File Storage"
              >
                Clear File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control Action Sub Bar: Search input bar */}
      <div className="px-6 py-3 border-b border-slate-150 flex items-center gap-3 bg-white shrink-0">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search records by name, email, keyword, or day..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-xs text-slate-400 hover:text-slate-700 font-bold shrink-0 uppercase tracking-widest"
          >
            Clear
          </button>
        )}
      </div>

      {/* Main Stream Viewer Panel */}
      <div className="flex-1 overflow-auto min-h-[350px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400 h-full">
            <RefreshCw className="animate-spin text-blue-600 mb-3" size={24} />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Scanning local flat file storage...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-20 text-slate-400 h-full">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-300 mb-3">
              <Inbox size={28} />
            </div>
            {searchTerm ? (
              <>
                <p className="text-sm font-extrabold text-slate-700">No matching logs found</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting your search input</p>
              </>
            ) : (
              <>
                <p className="text-sm font-extrabold text-slate-700">Flat file is currently empty</p>
                <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                  Fill in the entry form on the left to append your first row to the flat file database.
                </p>
              </>
            )}
          </div>
        ) : viewMode === "table" ? (
          /* Rich Structured Grid Table Mode matching Sleek style */
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm z-10 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    Comment Snippet
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                <AnimatePresence initial={false}>
                  {filteredSubmissions.map((sub, index) => (
                    <motion.tr
                      key={sub.timestamp + "-" + index}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {sub.timestamp}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">
                        {sub.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium truncate max-w-[160px]" title={sub.email}>
                        {sub.email}
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-[280px] truncate" title={sub.comments}>
                        {sub.comments ? sub.comments : (
                          <span className="text-slate-350 italic">No comments</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          /* Raw Flat File Stream Terminal Mode with beautiful slate console layout */
          <div className="p-6 bg-slate-900 font-mono text-[11px] text-slate-300 leading-6 relative select-text h-full overflow-auto">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 pointer-events-none select-none text-slate-500 text-[9px] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Live File Output
            </div>
            
            <div className="text-slate-500 mb-4 border-b border-slate-800 pb-2 select-none">
              # File: submissions.txt | Delimiter: &quot;|&quot; | Encoding: UTF-8
              <br />
              # Format: TIMESTAMP|NAME|EMAIL|COMMENTS
            </div>

            <div className="space-y-1">
              {filteredSubmissions.map((sub, index) => (
                <div key={sub.timestamp + "-" + index} className="hover:bg-slate-800/50 py-0.5 px-1 rounded transition-colors whitespace-pre-wrap word-break flex">
                  <span className="text-slate-500 select-none mr-4 w-6 text-right shrink-0">
                    {filteredSubmissions.length - index}
                  </span>
                  <span>
                    <span className="text-blue-400">{sub.timestamp}</span>
                    <span className="text-slate-500 font-semibold">|</span>
                    <span className="text-neutral-200 font-semibold">{sub.name}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-cyan-400 font-medium">{sub.email}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-300">{sub.comments || ""}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stored footer line displaying file status summary */}
      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center shrink-0">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Showing {filteredSubmissions.length} of {submissions.length} entries
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest select-none">
          <Sparkles size={11} className="text-blue-500" /> Storage validated
        </div>
      </div>

      {/* Confirmation Overlay Modal to prevent accidental deletions */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-xl relative"
            >
              <div className="p-3 bg-red-50 text-red-600 rounded-xl w-fit mb-4">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-bold text-base text-slate-800">
                Clear Storage Archive File?
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                This action cannot be undone. All records printed inside <code className="font-mono bg-slate-50 text-red-600 px-1 py-0.5 rounded text-[11px]">submissions.txt</code> will be wiped from disk storage.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClear();
                    setShowClearConfirm(false);
                  }}
                  className="py-2 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/10 transition-all cursor-pointer"
                >
                  Clear File
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
