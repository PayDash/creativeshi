"use client";

import { memo } from "react";
import { Terminal } from "./monitors/TerminalMonitor";
import { About } from "./monitors/AboutMonitor";
import { Music } from "./monitors/MusicMonitor";
import { Projects } from "./monitors/ProjectsMonitor";
import { Activity } from "./monitors/ActivityMonitor";
import { Clock } from "./monitors/ClockMonitor";
import type { MonitorId } from "@/lib/constants";

function Dispatcher({ id, expanded }: { id: MonitorId; expanded?: boolean }) {
  switch (id) {
    case "terminal": return <Terminal expanded={expanded} />;
    case "about":    return <About expanded={expanded} />;
    case "music":    return <Music expanded={expanded} />;
    case "projects": return <Projects expanded={expanded} />;
    case "skills":   return <Activity expanded={expanded} />;
    case "clock":    return <Clock expanded={expanded} />;
  }
}

// Memoized: CSSScene re-renders on pointer/drag state changes; the six
// monitor panels should not redo their render work each time.
export const MonitorContent = memo(Dispatcher);
