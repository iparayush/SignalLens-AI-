import React from 'react';
import { TelemetryMetrics } from '../types';
import { Sliders } from 'lucide-react';

interface PrimaryTelemetryCardProps {
  telemetry: TelemetryMetrics;
}

export const PrimaryTelemetryCard: React.FC<PrimaryTelemetryCardProps> = ({ telemetry }) => {
  return (
    <div
      id="primary-telemetry-panel"
      className="flex flex-col justify-between gap-2.5 bg-[#0B1224] p-4 rounded shadow-md border border-[#1E293B]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="text-[#22D3EE] w-4 h-4" />
          <h2 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-white">
            Automatic Parameter Detection — Primary Telemetry
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#8B5CF6] uppercase border border-[#8B5CF6]/30 px-2 py-0.5 rounded flex items-center gap-1 bg-[#8B5CF6]/10">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            AI Powered Analysis
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#14B8A6]/10 border border-[#14B8A6]/30 px-2.5 py-0.5 rounded text-[#14B8A6] font-mono text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse"></span>
          <span>OVERALL CONFIDENCE: {telemetry.overallConfidence.toFixed(1)}%</span>
        </div>
      </div>

      {/* High-Impact 4x2 Technical Metrics Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Modulation */}
        <div className="bg-[#101A32] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider">
              Modulation
            </span>
            <span className="font-mono text-[10px] text-[#14B8A6] bg-[#14B8A6]/10 px-1 rounded font-bold">
              {telemetry.modulationMatch.toFixed(1)}% Match
            </span>
          </div>
          <div className="font-headline text-[20px] text-[#22D3EE] font-bold leading-tight">
            {telemetry.modulation}
          </div>
          <div className="w-full bg-[#1E293B] h-1 rounded overflow-hidden">
            <div
              className="bg-[#22D3EE] h-full transition-all duration-500"
              style={{ width: `${telemetry.modulationMatch}%` }}
            ></div>
          </div>
        </div>

        {/* Sampling Frequency */}
        <div className="bg-[#101A32] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider">
              Sampling Freq
            </span>
            <span className="font-mono text-[10px] text-[#14B8A6] bg-[#14B8A6]/10 px-1 rounded">
              {telemetry.samplingFreqConfidence}%
            </span>
          </div>
          <div className="font-headline text-[20px] text-white font-bold leading-tight">
            {telemetry.samplingFreqMHz.toFixed(3)}{' '}
            <span className="text-[12px] text-[#64748B] font-normal font-mono">MHz</span>
          </div>
          <div className="w-full bg-[#1E293B] h-1 rounded overflow-hidden">
            <div
              className="bg-[#14B8A6] h-full transition-all duration-500"
              style={{ width: `${telemetry.samplingFreqConfidence}%` }}
            ></div>
          </div>
        </div>

        {/* Symbol Rate */}
        <div className="bg-[#101A32] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider">
              Symbol Rate
            </span>
            <span className="font-mono text-[10px] text-[#14B8A6] bg-[#14B8A6]/10 px-1 rounded">
              {telemetry.symbolRateConfidence.toFixed(1)}%
            </span>
          </div>
          <div className="font-headline text-[20px] text-white font-bold leading-tight">
            {telemetry.symbolRateMSym.toFixed(3)}{' '}
            <span className="text-[12px] text-[#64748B] font-normal font-mono">MSym/s</span>
          </div>
          <div className="w-full bg-[#1E293B] h-1 rounded overflow-hidden">
            <div
              className="bg-[#22D3EE] h-full transition-all duration-500"
              style={{ width: `${telemetry.symbolRateConfidence}%` }}
            ></div>
          </div>
        </div>

        {/* Bandwidth */}
        <div className="bg-[#101A32] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider">
              BW (-3dB)
            </span>
            <span className="font-mono text-[10px] text-[#14B8A6] bg-[#14B8A6]/10 px-1 rounded">
              {telemetry.bandwidthConfidence.toFixed(1)}%
            </span>
          </div>
          <div className="font-headline text-[20px] text-white font-bold leading-tight">
            {telemetry.bandwidthMHz.toFixed(3)}{' '}
            <span className="text-[12px] text-[#64748B] font-normal font-mono">MHz</span>
          </div>
          <div className="w-full bg-[#1E293B] h-1 rounded overflow-hidden">
            <div
              className="bg-[#22D3EE] h-full transition-all duration-500"
              style={{ width: `${telemetry.bandwidthConfidence}%` }}
            ></div>
          </div>
        </div>

        {/* FEC Scheme */}
        <div className="bg-[#101A32] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider">
              FEC Code
            </span>
            <span className="font-mono text-[10px] text-[#22D3EE] bg-[#22D3EE]/10 px-1 rounded font-semibold">
              Detected
            </span>
          </div>
          <div className="font-mono text-[13px] text-white font-bold truncate leading-tight py-0.5">
            {telemetry.fecCode}
          </div>
          <div className="w-full bg-[#1E293B] h-1 rounded overflow-hidden">
            <div className="bg-[#14B8A6] h-full w-[98%]"></div>
          </div>
        </div>

        {/* Interleaving */}
        <div className="bg-[#101A32] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider">
              Interleaving
            </span>
            <span className="font-mono text-[10px] text-[#14B8A6] bg-[#14B8A6]/10 px-1 rounded">
              {telemetry.interleavingConfidence.toFixed(1)}%
            </span>
          </div>
          <div className="font-mono text-[13px] text-white font-bold truncate leading-tight py-0.5">
            {telemetry.interleaving}
          </div>
          <div className="w-full bg-[#1E293B] h-1 rounded overflow-hidden">
            <div
              className="bg-[#22D3EE] h-full transition-all duration-500"
              style={{ width: `${telemetry.interleavingConfidence}%` }}
            ></div>
          </div>
        </div>

        {/* SNR Metric */}
        <div className="bg-[#101A32] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider">
              Estimated SNR
            </span>
            <span className="font-mono text-[10px] text-[#14B8A6] bg-[#14B8A6]/10 px-1 rounded font-semibold">
              {telemetry.snrQuality}
            </span>
          </div>
          <div className="font-headline text-[20px] text-[#14B8A6] font-bold leading-tight">
            +{telemetry.estimatedSnrDb.toFixed(1)}{' '}
            <span className="text-[12px] text-[#64748B] font-normal font-mono">dB</span>
          </div>
          <div className="w-full bg-[#1E293B] h-1 rounded overflow-hidden">
            <div className="bg-[#14B8A6] h-full w-[85%]"></div>
          </div>
        </div>

        {/* Carrier Frequency */}
        <div className="bg-[#101A32] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#1E293B] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-wider">
              Center Carrier
            </span>
            <span className="font-mono text-[10px] text-[#22D3EE] bg-[#22D3EE]/10 px-1 rounded font-bold">
              LOCKED
            </span>
          </div>
          <div className="font-headline text-[20px] text-[#22D3EE] font-bold leading-tight">
            {telemetry.centerCarrierMHz.toFixed(3)}{' '}
            <span className="text-[12px] text-[#64748B] font-normal font-mono">MHz</span>
          </div>
          <div className="w-full bg-[#1E293B] h-1 rounded overflow-hidden">
            <div className="bg-[#22D3EE] h-full w-full"></div>
          </div>
        </div>
      </div>

      {/* Quick Operational Ribbon */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-[#050816] rounded text-[#94A3B8] font-mono text-[11px] border border-[#1E293B]">
        <span className="flex items-center gap-1.5">
          <span className="text-[#64748B]">Algorithm:</span>
          <span className="text-white font-semibold">{telemetry.algorithm}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-[#64748B]">Inference Compute:</span>
          <span className="text-[#14B8A6] font-mono font-medium">
            {telemetry.inferenceComputeMs.toFixed(1)} ms (TensorRT INT8)
          </span>
        </span>
      </div>
    </div>
  );
};
