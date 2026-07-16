'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { Play, FileCode, CheckCircle2, ChevronDown, GitCommit } from 'lucide-react';
import { cn } from '@/lib/utils';
import mockCodeReviewRaw from '@/data/code-review-data.json';

interface FileReviewData {
  file_path: string;
  suggested_lines: number[];
  flagged_lines: number[];
  original_code: string;
  suggested_code: string;
}

interface MockReviewData {
  files: Record<string, FileReviewData>;
}

function CodeReviewContent() {
  const mockData = mockCodeReviewRaw as unknown as MockReviewData;
  const fileKeys = Object.keys(mockData.files);

  const [selectedFileKey, setSelectedFileKey] = useState<string>(fileKeys[0]);
  const activeReview = mockData.files[selectedFileKey];

  // User-modified suggested code
  const [editedSuggestedCode, setEditedSuggestedCode] = useState<string>('');
  const [isPushed, setIsPushed] = useState<boolean>(false);
  const [editorsMounted, setEditorsMounted] = useState<number>(0);

  // References to editor instances and Monaco libraries
  const leftEditorRef = useRef<any>(null);
  const rightEditorRef = useRef<any>(null);
  const leftDecorationsRef = useRef<any>(null);
  const rightDecorationsRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Sync scroll lock parameters to prevent infinite scrolling loops
  const isSyncingLeftRef = useRef<boolean>(false);
  const isSyncingRightRef = useRef<boolean>(false);

  useEffect(() => {
    // Reset page states and load fresh file code when dropdown is switched
    if (activeReview) {
      setEditedSuggestedCode(activeReview.suggested_code);
      setIsPushed(false);
    }
  }, [selectedFileKey, activeReview]);

  // Synchronized scroll listeners
  const handleLeftMount = (editor: any, monaco: Monaco) => {
    leftEditorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidScrollChange((e: any) => {
      if (e.scrollTopChanged && rightEditorRef.current && !isSyncingRightRef.current) {
        isSyncingLeftRef.current = true;
        rightEditorRef.current.setScrollTop(e.scrollTop);
        isSyncingLeftRef.current = false;
      }
    });
    setEditorsMounted(prev => prev + 1);
  };

  const handleRightMount = (editor: any, monaco: Monaco) => {
    rightEditorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidScrollChange((e: any) => {
      if (e.scrollTopChanged && leftEditorRef.current && !isSyncingLeftRef.current) {
        isSyncingRightRef.current = true;
        leftEditorRef.current.setScrollTop(e.scrollTop);
        isSyncingRightRef.current = false;
      }
    });
    setEditorsMounted(prev => prev + 1);
  };

  // Re-apply layout decorations whenever selectedFile or Monaco mounts/reloads
  useEffect(() => {
    if (!monacoRef.current || !activeReview) return;
    const monaco = monacoRef.current;

    // Apply green highlighted decorations to Left Editor (Suggested Fixes)
    if (leftEditorRef.current) {
      if (leftDecorationsRef.current) {
        leftDecorationsRef.current.clear();
      }
      const suggestedLines = activeReview.suggested_lines || [];
      const decs = suggestedLines.map((line: number) => ({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'monaco-line-added'
        }
      }));
      leftDecorationsRef.current = leftEditorRef.current.createDecorationsCollection(decs);
    }

    // Apply red highlighted decorations to Right Editor (Original Code)
    // Represents the flagged code segments that require optimization, supplied by backend analysis
    if (rightEditorRef.current) {
      if (rightDecorationsRef.current) {
        rightDecorationsRef.current.clear();
      }
      const flaggedLines = activeReview.flagged_lines || [];
      const decs = flaggedLines.map((line: number) => ({
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          className: 'monaco-line-deleted'
        }
      }));
      rightDecorationsRef.current = rightEditorRef.current.createDecorationsCollection(decs);
    }
  }, [selectedFileKey, activeReview, editorsMounted, monacoRef.current]);

  const handlePushFixes = () => {
    // Print user modifications to console, simulating pushing fixes to backend
    console.log(`Pushing suggested modifications for file ${activeReview.file_path}:`);
    console.log(editedSuggestedCode);
    
    setIsPushed(true);
    setTimeout(() => {
      setIsPushed(false);
    }, 3000);
  };

  const getLanguage = (path: string) => {
    return path.endsWith('.py') ? 'python' : 'javascript';
  };

  // Professional Monaco editor visual options
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 12.5,
    fontFamily: "var(--font-mono), monospace",
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    cursorBlinking: 'smooth' as const,
    smoothScrolling: true,
    padding: { top: 12, bottom: 12 },
    renderLineHighlight: 'all' as const
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] w-full gap-5">
      {/* Header Selector Block */}
      <div className="rounded-xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl p-4 flex items-center justify-between flex-shrink-0">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current File</span>
          <div className="flex items-center gap-2 mt-1">
            <FileCode className="w-4 h-4 text-violet-400" />
            <span className="text-white text-xs font-mono tracking-wide">{activeReview.file_path}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">Select File</label>
          <div className="relative">
            <select
              value={selectedFileKey}
              onChange={(e) => setSelectedFileKey(e.target.value)}
              className="bg-slate-900 hover:bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-lg pl-3 pr-8 py-2.5 transition-all outline-none focus:ring-1 focus:ring-violet-500/50 appearance-none cursor-pointer"
            >
              {fileKeys.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Code Editors Section (occupying available height) */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-5 min-h-0 w-full">
        {/* Left Editor: Suggested Fixes (Editable) */}
        <div className="flex flex-col h-full rounded-xl border border-slate-900 bg-slate-950/60 backdrop-blur-xl overflow-hidden relative">
          <div className="h-12 border-b border-slate-900 bg-slate-950/80 px-4 flex items-center justify-between flex-shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Suggested Fixes</span>
              <span className="text-[9px] bg-emerald-950/30 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.5 rounded uppercase font-bold">
                Editable
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Suggested Fixes Editor</span>
          </div>

          <div className="flex-grow w-full min-h-0 bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={getLanguage(activeReview.file_path)}
              theme="vs-dark"
              value={editedSuggestedCode}
              onChange={(value) => setEditedSuggestedCode(value || '')}
              onMount={handleLeftMount}
              options={editorOptions}
              loading={
                <div className="flex h-full items-center justify-center text-slate-500 bg-slate-950/20">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            />
          </div>
        </div>

        {/* Right Editor: Original Code (Read-Only) */}
        <div className="flex flex-col h-full rounded-xl border border-slate-900 bg-slate-950/60 backdrop-blur-xl overflow-hidden relative">
          <div className="h-12 border-b border-slate-900 bg-slate-950/80 px-4 flex items-center justify-between flex-shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Original Code</span>
              <span className="text-[9px] bg-slate-900 text-slate-500 border border-slate-850 px-1.5 py-0.5 rounded uppercase font-bold">
                Read Only
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Original Code Editor</span>
          </div>

          <div className="flex-grow w-full min-h-0 bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={getLanguage(activeReview.file_path)}
              theme="vs-dark"
              value={activeReview.original_code}
              onMount={handleRightMount}
              options={{ ...editorOptions, readOnly: true }}
              loading={
                <div className="flex h-full items-center justify-center text-slate-500 bg-slate-950/20">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Bottom Center Actions Block */}
      <div className="flex flex-col items-center justify-center gap-3.5 flex-shrink-0">
        <button
          onClick={handlePushFixes}
          className="px-6 py-3 rounded-lg text-white font-bold text-xs tracking-wide bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 border border-violet-500/20 shadow-[0_4px_25px_rgba(139,92,246,0.2)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.45)] transition-all cursor-pointer flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0 select-none active:scale-[0.98] duration-200"
        >
          <GitCommit className="w-4 h-4" />
          <span>Push This File's Fixes to Repository</span>
        </button>

        <div className="text-[10px] font-medium text-slate-500 select-none min-h-[14px]">
          {isPushed ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5 justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pushed changes successfully! Created git commit in repository.
            </span>
          ) : (
            <span>This will commit and push the changes from the left editor to the repository.</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CodeReview() {
  return (
    <Suspense fallback={
      <div className="flex h-[400px] items-center justify-center text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider">Loading Monaco Editor Panels...</span>
        </div>
      </div>
    }>
      <CodeReviewContent />
    </Suspense>
  );
}
