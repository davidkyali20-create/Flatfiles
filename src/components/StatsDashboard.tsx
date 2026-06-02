import React from "react";
import { Submission } from "../types";
import { Users, Clock, Hash, TrendingUp } from "lucide-react";

interface StatsDashboardProps {
  submissions: Submission[];
}

export default function StatsDashboard({ submissions }: StatsDashboardProps) {
  const totalLogs = submissions.length;
  
  // Calculate unique email owners
  const uniqueEmails = new Set(submissions.map((s) => s.email.toLowerCase().trim())).size;

  // Extract most common host domain
  let topDomain = "N/A";
  if (totalLogs > 0) {
    const domainCounts: { [key: string]: number } = {};
    submissions.forEach((s) => {
      const parts = s.email.split("@");
      if (parts.length > 1) {
        const domain = parts[1].toLowerCase().trim();
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      }
    });

    let maxCount = -1;
    for (const [domain, count] of Object.entries(domainCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topDomain = domain;
      }
    }
  }

  // Get date of the latest post
  const lastPost = totalLogs > 0 ? submissions[0].timestamp : "No submissions";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Records Signature Card (Dark Theme) */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg shadow-slate-900/10 border border-slate-900 transition-all hover:-translate-y-0.5">
        <div className="space-y-1">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Total Records
          </div>
          <div className="text-3xl font-bold font-mono tracking-tighter">
            {totalLogs.toLocaleString()}
          </div>
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
          <Hash className="w-6 h-6 text-blue-400" />
        </div>
      </div>

      {/* Unique Senders */}
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200 p-6 flex justify-between items-center transition-all hover:-translate-y-0.5">
        <div className="space-y-1 min-w-0">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Unique Senders
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight font-mono truncate">
            {uniqueEmails}
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Top Email Domain */}
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200 p-6 flex justify-between items-center transition-all hover:-translate-y-0.5">
        <div className="space-y-1 min-w-0">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Top Email Domain
          </div>
          <div className="text-base font-bold text-slate-800 tracking-tight font-sans truncate" title={topDomain}>
            {topDomain}
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-amber-500" />
        </div>
      </div>

      {/* Latest Submission */}
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-200 p-6 flex justify-between items-center transition-all hover:-translate-y-0.5">
        <div className="space-y-1 min-w-0">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Latest Submission
          </div>
          <div className="text-xs font-bold text-slate-700 font-mono truncate" title={lastPost}>
            {lastPost}
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-purple-500" />
        </div>
      </div>
    </div>
  );
}
