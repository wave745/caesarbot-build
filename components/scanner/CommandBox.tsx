"use client"

import { useState } from "react";
import CommandBoard from "./CommandBoard";

export default function CommandBox() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2
                   hover:border-yellow-500/30 flex items-center gap-2 transition-colors"
        title="Open commands"
      >
        <span className="text-lg">⌘</span>
        <span>Commands</span>
      </button>
      {open && <CommandBoard onClose={() => setOpen(false)} />}
    </>
  );
}
