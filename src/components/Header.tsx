import React, { useState } from 'react';
import { SignalProfile } from '../types';
import { Download, User, ChevronDown, CheckCircle2, Home } from 'lucide-react';

interface HeaderProps {
  activeSignal: SignalProfile;
  signalsList: SignalProfile[];
  onSelectSignal: (signal: SignalProfile) => void;
  onOpenExportModal: () => void;
  onNavigateLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSignal,
  signalsList,
  onSelectSignal,
  onOpenExportModal,
  onNavigateLanding,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header
      id="tactical-header"
      className="fixed top-0 left-72 right-0 z-40 bg-[#0B1224]/90 border-[#1E293B] backdrop-blur-xl border-b border-[#171b26] shadow-[0_1px_8px_rgba(0,0,0,0.35)]"
    >
      <div className="h-16 w-full px-4 flex items-center justify-between gap-4">
        {/* Active Telemetry Ribbon */}
        <div className="flex items-center gap-4 overflow-x-auto py-1 text-sm no-scrollbar">
          {/* NTRO Header Stamp */}
          <div className="flex flex-col pr-4 border-r border-[#1E293B] shrink-0">
            <span className="font-headline text-[13px] font-bold text-white tracking-wide leading-tight">
              NATIONAL TECHNICAL RESEARCH ORGANISATION (NTRO) <span className="text-[#8B5CF6]">• AstraX</span>
            </span>
            <span className="font-mono text-[9px] text-[#22D3EE] tracking-widest uppercase mt-0.5">
              SIGNAL INTELLIGENCE • DATA ANALYSIS
            </span>
          </div>

          {/* Active File Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 whitespace-nowrap bg-[#101A32] hover:bg-[#1E293B] px-2.5 py-1 rounded transition-colors border border-[#334155] text-left"
              title="Click to switch active RF signal stream"
            >
              <span className="font-mono text-[11px] text-[#869397] uppercase">Active File:</span>
              <span className="font-mono text-[12px] text-[#22D3EE] font-medium">
                {activeSignal.filename}
              </span>
              <span className="font-mono text-[10px] font-bold bg-[#22D3EE] text-black px-1.5 py-0.5 rounded">
                {activeSignal.fileFormat}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#869397]" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute top-full mt-1 left-0 w-72 bg-[#101A32] border border-[#313540] rounded shadow-xl py-1 z-50">
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
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#1E293B] transition-colors ${
                      sig.id === activeSignal.id ? 'bg-[#1c1f2a] text-[#22D3EE]' : 'text-[#dfe2f1]'
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
              <span className="text-[#14B8A6] font-semibold">{activeSignal.fsFormatted}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#869397] text-[10px] uppercase">Fc:</span>
              <span className="text-[#22D3EE] font-bold">{activeSignal.fcFormatted}</span>
            </div>
          </div>

          <div className="h-4 w-px bg-[#313540] shrink-0" />

          {/* Demodulation status pill */}
          <div className="flex items-center gap-1.5 whitespace-nowrap bg-[#101A32] px-2.5 py-1 rounded border border-[#14B8A6]/30">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></span>
            <span className="font-mono text-[11px] text-[#14B8A6] font-bold uppercase tracking-wide">
              LIVE
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden lg:flex flex-col text-right mr-2">
            <span className="text-[10px] text-white font-headline">Explore Signals</span>
            <span className="text-[10px] text-[#94A3B8] font-headline">Empower Decisions</span>
          </div>
          
          <div className="h-6 w-px bg-[#1E293B]" />

          {onNavigateLanding && (
            <button
              onClick={onNavigateLanding}
              className="px-3 py-1.5 bg-[#101A32] hover:bg-[#1E293B] text-white border border-[#334155] rounded text-[11px] font-mono transition-colors"
            >
              Generate Report
            </button>
          )}

          <button
            id="export-report-top-btn"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6D28D9] hover:bg-[#8B5CF6] text-white rounded font-mono text-[12px] font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            type="button"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <div className="w-8 h-8 rounded-full bg-[#101A32] border border-[#334155] flex items-center justify-center text-white cursor-pointer hover:border-[#22D3EE] transition-colors relative">
            <User className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#EC4899] rounded-full border border-[#0B1224]" />
          </div>
        </div>
      </div>
    </header>
  );
};
