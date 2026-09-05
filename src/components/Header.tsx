import React, { useState } from 'react';
import { SignalProfile } from '../types';
import { Download, User, ChevronDown, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeSignal: SignalProfile;
  signalsList: SignalProfile[];
  onSelectSignal: (signal: SignalProfile) => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSignal,
  signalsList,
  onSelectSignal,
  onOpenExportModal,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header
      id="tactical-header"
      className="fixed top-0 left-72 right-0 z-40 bg-[#0a0e18]/90 backdrop-blur-xl border-b border-[#171b26] shadow-[0_1px_8px_rgba(0,0,0,0.35)]"
    >
      <div className="h-16 w-full px-4 flex items-center justify-between gap-4">
        {/* Active Telemetry Ribbon */}
        <div className="flex items-center gap-4 overflow-x-auto py-1 text-sm no-scrollbar">
          {/* Active File Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 whitespace-nowrap bg-[#171b26] hover:bg-[#262a35] px-2.5 py-1 rounded transition-colors border border-[#313540]/60 text-left"
              title="Click to switch active RF signal stream"
            >
              <span className="font-mono text-[11px] text-[#869397] uppercase">Active File:</span>
              <span className="font-mono text-[12px] text-[#4cd7f6] font-medium">
                {activeSignal.filename}
              </span>
              <span className="font-mono text-[10px] font-bold bg-[#06b6d4] text-[#00424f] px-1.5 py-0.5 rounded">
                {activeSignal.fileFormat}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#869397]" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute top-full mt-1 left-0 w-72 bg-[#171b26] border border-[#313540] rounded shadow-xl py-1 z-50">
                <div className="px-3 py-1 text-[10px] font-mono text-[#869397] uppercase border-b border-[#313540]">
                  Select Captured Signal Profile
                </div>
                {signalsList.map((sig) => (
                  <button
                    key={sig.id}
                    onClick={() => {
                      onSelectSignal(sig);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#262a35] transition-colors ${
                      sig.id === activeSignal.id ? 'bg-[#1c1f2a] text-[#4cd7f6]' : 'text-[#dfe2f1]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-mono font-medium">{sig.filename}</span>
                      <span className="text-[10px] text-[#869397]">
                        {sig.telemetry.modulation} • {sig.fcFormatted} • {sig.sizeFormatted}
                      </span>
                    </div>
                    {sig.id === activeSignal.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-[#313540] shrink-0" />

          {/* Key Parameters */}
          <div className="flex items-center gap-3.5 whitespace-nowrap font-mono text-[12px]">
            <div className="flex items-center gap-1">
              <span className="text-[#869397] text-[10px] uppercase">Size:</span>
              <span className="text-[#dfe2f1]">{activeSignal.sizeFormatted}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#869397] text-[10px] uppercase">Dur:</span>
              <span className="text-[#dfe2f1]">{activeSignal.durFormatted}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#869397] text-[10px] uppercase">Fs:</span>
              <span className="text-[#4edea3] font-semibold">{activeSignal.fsFormatted}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#869397] text-[10px] uppercase">Fc:</span>
              <span className="text-[#4cd7f6] font-bold">{activeSignal.fcFormatted}</span>
            </div>
          </div>

          <div className="h-4 w-px bg-[#313540] shrink-0" />

          {/* Demodulation status pill */}
          <div className="flex items-center gap-1.5 whitespace-nowrap bg-[#171b26]/80 px-2.5 py-1 rounded border border-[#4edea3]/20">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
            <span className="font-mono text-[11px] text-[#4edea3] font-bold uppercase tracking-wide">
              Demodulation Synchronized
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="export-report-top-btn"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4cd7f6] hover:bg-[#acedff] text-[#003640] rounded font-mono text-[12px] font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] cursor-pointer"
            type="button"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <div className="h-5 w-px bg-[#313540]" />

          <div
            className="w-8 h-8 rounded-full bg-[#4cd7f6] flex items-center justify-center text-[#003640] font-bold cursor-pointer hover:ring-2 hover:ring-[#acedff] transition-all shadow-sm"
            title="SIGINT Operator: iparayush@gmail.com (Level 3 Clearance)"
          >
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
