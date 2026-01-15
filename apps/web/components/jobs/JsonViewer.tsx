"use client";

import { useState } from "react";
import { cn } from "@bullstudio/ui/lib/utils";
import { Button } from "@bullstudio/ui/components/button";
import { Check, Copy, ChevronDown, ChevronRight } from "lucide-react";

interface JsonViewerProps {
  data: unknown;
  title?: string;
  defaultExpanded?: boolean;
  maxHeight?: string;
  className?: string;
}

export function JsonViewer({
  data,
  title,
  defaultExpanded = true,
  maxHeight = "400px",
  className,
}: JsonViewerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden",
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
            {title}
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-zinc-500 hover:text-white"
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-400" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
      )}
      {expanded && (
        <div
          className="overflow-auto"
          style={{ maxHeight }}
        >
          <pre className="p-4 text-sm font-mono leading-relaxed">
            <SyntaxHighlight json={jsonString} />
          </pre>
        </div>
      )}
    </div>
  );
}

function SyntaxHighlight({ json }: { json: string }) {
  const highlighted = json
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g,
      (match) => {
        if (match.endsWith(":")) {
          // Key
          return `<span class="text-violet-400">${match.slice(0, -1)}</span><span class="text-zinc-500">:</span>`;
        }
        // String value
        return `<span class="text-emerald-400">${match}</span>`;
      }
    )
    .replace(/\b(true|false)\b/g, '<span class="text-amber-400">$1</span>')
    .replace(/\b(null)\b/g, '<span class="text-zinc-500">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-blue-400">$1</span>');

  return (
    <code
      dangerouslySetInnerHTML={{ __html: highlighted }}
      className="text-zinc-300"
    />
  );
}

interface StackTraceViewerProps {
  stacktrace: string[];
  className?: string;
}

export function StackTraceViewer({ stacktrace, className }: StackTraceViewerProps) {
  const [copied, setCopied] = useState(false);

  const fullTrace = stacktrace.join("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullTrace);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-red-900/50 bg-red-950/20 overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-red-900/50 bg-red-950/30">
        <span className="text-sm font-medium text-red-400">Stack Trace</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-red-500 hover:text-red-300"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-400" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>
      <div className="overflow-auto max-h-[300px]">
        <pre className="p-4 text-xs font-mono leading-relaxed text-red-300/80">
          {stacktrace.map((line, i) => (
            <div key={i} className="hover:bg-red-950/30 -mx-4 px-4">
              {line}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
