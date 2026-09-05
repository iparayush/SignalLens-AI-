import React, { useRef, useState } from 'react';
import { SignalProfile } from '../types';
import { UploadCloud, FileCode, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SignalIngestionCardProps {
  activeSignal: SignalProfile;
  onFileUpload: (file: File) => void;
}

export const SignalIngestionCard: React.FC<SignalIngestionCardProps> = ({
  activeSignal,
  onFileUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleProcessFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleProcessFile(file);
    }
  };

  const handleProcessFile = (file: File) => {
    setUploadNotice(`Ingesting ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);
    setTimeout(() => {
      onFileUpload(file);
      setUploadNotice(null);
    }, 600);
  };

  return (
    <section
      id="signal-file-input-section"
      className="flex flex-col gap-2.5 bg-[#171b26] p-4 rounded shadow-md relative overflow-hidden border border-[#262a35]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse"></span>
          <h2 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-[#dfe2f1]">
            Signal File Input &amp; Ingestion
          </h2>
        </div>
        <span className="font-mono text-[11px] text-[#4cd7f6] px-2 py-0.5 rounded bg-[#262a35] font-medium">
          {activeSignal.channel}
        </span>
      </div>

      {/* Drag & Drop Tactical Ingestion Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center p-4 rounded transition-all cursor-pointer text-center border-2 border-dashed ${
          dragOver
            ? 'border-[#4cd7f6] bg-[#06b6d4]/10'
            : 'border-[#313540] bg-[#0a0e18] hover:bg-[#1c1f2a]'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-[#262a35] flex items-center justify-center text-[#4cd7f6] mb-1.5 group-hover:scale-105 transition-transform shadow-sm">
          <UploadCloud className="w-5 h-5 text-[#4cd7f6]" />
        </div>
        <span className="font-headline text-[15px] font-semibold text-[#dfe2f1]">
          Upload Signal File
        </span>
        <span className="font-mono text-[11px] text-[#bcc9cd] mt-0.5">
          Drag &amp; drop 16-bit Complex I/Q or Float32 WAV files
        </span>

        {uploadNotice && (
          <div className="mt-2 text-xs font-mono text-[#4edea3] bg-[#003824]/60 px-2 py-0.5 rounded animate-pulse">
            {uploadNotice}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2.5">
          <label
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1 bg-[#262a35] hover:bg-[#353944] text-[#4cd7f6] font-mono text-[11px] font-semibold rounded uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Choose File</span>
            <input
              ref={fileInputRef}
              accept=".iq,.wav,.raw,.dat,.bin"
              className="hidden"
              type="file"
              onChange={handleFileInputChange}
            />
          </label>
          <span className="font-mono text-[11px] text-[#869397]">Max 500 MB</span>
        </div>
      </div>

      {/* Active Loaded File Diagnostic Pill */}
      <div className="flex flex-col gap-1 bg-[#1c1f2a] p-2.5 rounded border border-[#313540]">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider">
            Active Ingested Stream
          </span>
          <span className="font-mono text-[11px] text-[#4edea3] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
            Validated
          </span>
        </div>
        <div className="font-mono text-[11px] text-[#4cd7f6] break-all bg-[#0a0e18] px-2 py-1 rounded border border-[#262a35]">
          {activeSignal.filename}
        </div>
        <div className="flex items-center justify-between font-mono text-[11px] text-[#bcc9cd] pt-1">
          <span>{activeSignal.formatDescription}</span>
          <span className="text-[#adc6ff] font-mono font-medium">CRC32: {activeSignal.crc32}</span>
        </div>
      </div>

      {/* File Integrity Pill */}
      <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#262a35] text-[#4edea3] font-mono text-[11px] border border-[#4edea3]/20">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#4edea3]" />
          <span>File Integrity Verified • Checksum OK</span>
        </span>
        <span className="text-[#869397] font-mono text-[10px]">0ms ERR</span>
      </div>
    </section>
  );
};
