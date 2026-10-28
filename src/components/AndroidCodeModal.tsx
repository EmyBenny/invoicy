import React, { useState } from 'react';
import { X, Copy, Check, FileCode2, Terminal } from 'lucide-react';
import { KOTLIN_COMPOSE_SNIPPETS } from '../data/kotlinComposeCode';

interface AndroidCodeModalProps {
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ onClose }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeSnippet = KOTLIN_COMPOSE_SNIPPETS[selectedIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-700 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  Android & Jetpack Compose Architecture
                </h3>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/60">
                  Kotlin 2.0 • Compose M3 • Room
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Production-ready Kotlin Jetpack Compose & offline Room source files
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Selector Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/80 border-b border-slate-800 overflow-x-auto">
          {KOTLIN_COMPOSE_SNIPPETS.map((snippet, idx) => (
            <button
              key={snippet.filename}
              onClick={() => setSelectedIdx(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>{snippet.filename}</span>
            </button>
          ))}
        </div>

        {/* Snippet Description & Copy Bar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 text-xs truncate mr-2">
            <span className="text-slate-200 font-semibold">{activeSnippet.category}:</span> {activeSnippet.description}
          </div>

          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-medium transition-colors border border-slate-700 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Kotlin</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed select-text">
          <pre className="overflow-x-auto whitespace-pre">
            <code>{activeSnippet.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
