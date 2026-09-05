import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="tactical-footer"
      className="fixed bottom-0 left-72 right-0 h-10 bg-[#0a0e18]/95 backdrop-blur-md z-30 flex items-center border-t border-[#171b26] select-none"
    >
      <div className="w-full px-4 flex items-center justify-between text-[#bcc9cd] font-mono text-[11px]">
        {/* Left: SIH Track Identifier */}
        <div className="flex items-center gap-2">
          <span className="text-[#869397] font-semibold">SIH 2026</span>
          <span className="text-[#869397]">|</span>
          <span className="text-[#4cd7f6] font-mono font-bold">NTRO Track</span>
        </div>

        {/* Center: System Title */}
        <div className="hidden md:block text-[#869397] font-medium tracking-wide">
          SignalLens AI — Automated RF Signal Intercept &amp; Analysis Suite
        </div>

        {/* Right: Processing Status Badge */}
        <div className="flex items-center gap-2 bg-[#1c1f2a] px-2.5 py-1 rounded border border-[#4edea3]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
          <span className="text-[#dfe2f1]">Processing Completed Successfully</span>
          <span className="text-[#869397] font-mono">(Latency: 142ms)</span>
        </div>
      </div>
    </footer>
  );
};
