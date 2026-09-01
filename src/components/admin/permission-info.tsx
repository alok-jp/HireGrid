"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PermissionInfo({ role }: { role: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="pt-2">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <Info className="w-3.5 h-3.5" />
        <span>What can a {role} do?</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden mt-2"
          >
            <ul className="text-xs text-[var(--text-secondary)] space-y-1 bg-[var(--surface-1)] p-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)]">
              {role === "RECRUITER" ? (
                <>
                  <li>• Create, edit, and archive job positions</li>
                  <li>• Add candidate applications & advance pipeline stages</li>
                  <li>• Assign interviewers to candidate panels</li>
                </>
              ) : (
                <>
                  <li>• View assigned candidate application panels</li>
                  <li>• Submit interview evaluation feedback</li>
                  <li>• Cannot modify job openings or move candidate stages</li>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
