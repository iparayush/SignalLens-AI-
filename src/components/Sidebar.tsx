import React from 'react';
import { NavigationTab } from '../types';
import {
  Home,
  LayoutDashboard,
  UploadCloud,
  Network,
  Radar,
  Radio,
  Cpu,
  Binary,
  ScanLine,
  FileText,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

const NAV_ITEMS: { id: NavigationTab; label: string; icon: React.ElementType }[] = [
  { id: 'landing', label: 'Landing Page', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'upload-signal', label: 'Upload Signal', icon: UploadCloud },
  { id: 'signal-analysis', label: 'Signal Analysis', icon: Network },
  { id: 'detection-results', label: 'Detection Results', icon: Radar },
  { id: 'demodulation', label: 'Demodulation', icon: Radio },
  { id: 'decode-pipeline', label: 'Decode Pipeline', icon: Cpu },
  { id: 'bit-stream', label: 'Bit Stream', icon: Binary },
  { id: 'correlation', label: 'Correlation', icon: ScanLine },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const LOGO_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1Xgf9pHZDZaO49LYdwBEobmtkJt-cOOwinJp8dUkXW6MC1NXBM76jtqR51lB0uM9eUEUy4OaS6dDcwlmxwNCbKXxN-yH9r9gyZUmURvBZUJSvmy5o6gcHU1umRg_0ahhiwz4Os0ZvbLexzyqlgxS0pnQKRvl5E3g_SPKUakBbTRjFIyFUF3oB1cw0Y4-nZawh0xj27AQ96x-sRpgwASr_yHU62UF4sPdk0jHof3ZY4I0CtcgY9V7G0Xs38';

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <aside
      id="tactical-sidebar"
      className="fixed left-0 top-0 bottom-0 w-72 bg-[#050816]/95 border-[#1E293B] backdrop-blur-xl z-50 flex flex-col justify-between border-r border-[#1E293B] select-none"
    >
      <div className="flex flex-col">
        {/* Brand Header */}
        <div
          onClick={() => onSelectTab('landing')}
          className="p-4 flex flex-col gap-2 bg-[#0B1224] border-b border-[#1E293B] cursor-pointer hover:bg-[#101A32] transition-colors"
          title="Return to Landing Page"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded bg-[#101A32] flex items-center justify-center border border-[#334155] overflow-hidden shrink-0 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
              <img
                src={LOGO_URL}
                alt="SignalLens AI Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to inline SVG if remote URL ever fails
                  e.currentTarget.style.display = 'none';
                }}
              />
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 absolute text-[#22D3EE] pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9" strokeOpacity="0.4" strokeDasharray="2 2" />
                <circle cx="12" cy="12" r="5" stroke="#8B5CF6" />
                <path d="M4 12c3-4 5-4 8 0s5 4 8 0" stroke="#22D3EE" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-[17px] font-bold tracking-tight text-white leading-none">
                SignalLens<span className="text-[#22D3EE]">.AI</span>
              </span>
              <span className="font-mono text-[10px] text-[#94A3B8] uppercase tracking-wider mt-1">
                RF Signal Intercept
              </span>
            </div>
          </div>
          <div className="text-[12px] text-[#94A3B8] font-medium leading-tight">
            Automated Signal Analysis Platform
          </div>
          <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#101A32] text-[#14B8A6] font-mono text-[10px] tracking-widest uppercase border border-[#14B8A6]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse"></span>
            SYSTEM ONLINE • DSP ENGINE V3.4
          </div>
        </div>

        {/* Section Label */}
        <div className="px-4 pt-4 pb-1">
          <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-widest font-semibold">
            Mission Operations
          </span>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1 px-2.5 flex-1 mt-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded text-left transition-all font-mono text-[13px] ${
                  isActive
                    ? 'bg-[#101A32] text-[#22D3EE] font-bold border-l-2 border-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.15)] translate-x-1'
                    : 'text-[#94A3B8] hover:bg-[#101A32] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#22D3EE]' : 'text-[#22D3EE]'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#22D3EE]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Telemetry Footer in Sidebar */}
      <div className="p-4 bg-[#0B1224] border-t border-[#1E293B] flex flex-col gap-1">
        <div className="flex items-center justify-between font-mono text-[10px] text-[#64748B]">
          <span className="uppercase tracking-wider">DSP Mode</span>
          <span className="text-[#22D3EE] font-semibold">IQ/RF DSP Engine</span>
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] text-[#64748B]">
          <span className="uppercase tracking-wider">Viewport</span>
          <span className="text-[#94A3B8]">1440 × 900</span>
        </div>
        <div className="mt-1 pt-1.5 border-t border-[#1E293B] flex items-center justify-between font-mono text-[10px] text-[#94A3B8]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse"></span>
            SECURE SIGINT
          </span>
          <span className="font-mono text-[#64748B]">NTRO-2026-A1</span>
        </div>
      </div>
    </aside>
  );
};
