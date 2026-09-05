import React from 'react';
import { SignalProfile } from '../types';
import { FileText, Download, ShieldAlert, MapPin, Radio, Target, CheckCircle2 } from 'lucide-react';

interface ReportsViewProps {
  activeSignal: SignalProfile;
  onOpenExportModal: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ activeSignal, onOpenExportModal }) => {
  return (
    <div className="flex flex-col w-full gap-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#171b26] p-4 rounded border border-[#262a35]">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4cd7f6]" />
            <h1 className="font-headline text-xl font-bold text-[#dfe2f1]">
              SIGINT Intercept &amp; Technical Mission Dossier
            </h1>
          </div>
          <p className="font-mono text-xs text-[#869397] mt-1">
            Automated intelligence summary ready for command chain distribution.
          </p>
        </div>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#4cd7f6] hover:bg-[#acedff] text-[#003640] font-mono text-xs font-bold rounded uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
        >
          <Download className="w-4 h-4" />
          <span>Export Mission Report</span>
        </button>
      </div>

      {/* Military Dossier Container */}
      <div className="bg-[#171b26] p-6 rounded border border-[#262a35] flex flex-col gap-6 shadow-xl relative overflow-hidden">
        {/* Classification Header Stamp */}
        <div className="flex flex-col items-center justify-center p-3 rounded bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 text-[#ffb4ab] text-center font-mono">
          <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest">
            <ShieldAlert className="w-5 h-5" />
            <span>TOP SECRET // NTRO-SIGINT // NOFORN</span>
          </div>
          <span className="text-[10px] text-[#ffdad6] mt-0.5">
            SPECIAL COMPARTMENTED INTELLIGENCE • SIH 2026 CYBER DEFENSE OPERATIONS
          </span>
        </div>

        {/* Section 1: Emitter Target Acquisition */}
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#4cd7f6] flex items-center gap-2 border-b border-[#262a35] pb-2">
            <Target className="w-4 h-4" />
            1. Target Emitter Identification &amp; Fingerprint
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#0a0e18] p-3 rounded border border-[#262a35]">
              <span className="text-[#869397] text-[10px] block uppercase">Target Designation:</span>
              <strong className="text-[#dfe2f1] text-sm">
                {activeSignal.emitterProfile.targetDesignation}
              </strong>
            </div>
            <div className="bg-[#0a0e18] p-3 rounded border border-[#262a35]">
              <span className="text-[#869397] text-[10px] block uppercase">Callsign / ID:</span>
              <strong className="text-[#4cd7f6] text-sm">{activeSignal.emitterProfile.callsign}</strong>
            </div>
            <div className="bg-[#0a0e18] p-3 rounded border border-[#262a35]">
              <span className="text-[#869397] text-[10px] block uppercase">Threat Rating:</span>
              <span className="text-[#ffb4ab] font-bold text-sm">
                {activeSignal.emitterProfile.threatLevel} PRIORITY
              </span>
            </div>
          </div>

          <div className="bg-[#0a0e18] p-3.5 rounded border border-[#262a35] flex items-start gap-3 text-xs font-mono">
            <MapPin className="w-5 h-5 text-[#4edea3] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#869397] text-[10px] block uppercase">Estimated Emitter Origin:</span>
              <span className="text-[#dfe2f1] font-semibold">
                {activeSignal.emitterProfile.estimatedLocation}
              </span>
              <span className="text-[#4cd7f6] block mt-0.5">
                Coordinates: {activeSignal.emitterProfile.coordinates[0].toFixed(4)}° N, {activeSignal.emitterProfile.coordinates[1].toFixed(4)}° E (TDOA Hyperbolic Fix)
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: RF Intercept Telemetry */}
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#4cd7f6] flex items-center gap-2 border-b border-[#262a35] pb-2">
            <Radio className="w-4 h-4" />
            2. RF Physical Layer &amp; Demodulation Analysis
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
              <span className="text-[#869397] text-[10px] block">Carrier Center (Fc):</span>
              <strong className="text-[#4cd7f6]">{activeSignal.fcFormatted}</strong>
            </div>
            <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
              <span className="text-[#869397] text-[10px] block">Sampling Freq (Fs):</span>
              <strong className="text-[#4edea3]">{activeSignal.fsFormatted}</strong>
            </div>
            <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
              <span className="text-[#869397] text-[10px] block">Baud Rate:</span>
              <strong className="text-[#dfe2f1]">{activeSignal.telemetry.symbolRateMSym} MSym/s</strong>
            </div>
            <div className="bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
              <span className="text-[#869397] text-[10px] block">SNR Margin:</span>
              <strong className="text-[#4edea3]">+{activeSignal.telemetry.estimatedSnrDb} dB</strong>
            </div>
          </div>
        </div>

        {/* Section 3: Synchronization & Framing */}
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#4cd7f6] flex items-center gap-2 border-b border-[#262a35] pb-2">
            <CheckCircle2 className="w-4 h-4" />
            3. Synchronized Preamble &amp; Correlation Confidence
          </h2>

          <div className="p-3 bg-[#0a0e18] rounded border border-[#262a35] font-mono text-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[#869397]">Matched Pattern:</span>
              <span className="text-[#4cd7f6] font-bold">{activeSignal.correlation.patternName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#869397]">Preamble Hex:</span>
              <span className="text-[#4edea3] font-bold">{activeSignal.correlation.syncPreambleHex}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#869397]">Frame Boundary Offset:</span>
              <span className="text-[#dfe2f1]">{activeSignal.correlation.detectedPositionOffset} ({activeSignal.correlation.bitLocation})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#869397]">Cross-Correlation Peak Margin:</span>
              <span className="text-[#4edea3] font-bold">+{activeSignal.correlation.crossCorrPsrDb} dB PSR (PASS)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
