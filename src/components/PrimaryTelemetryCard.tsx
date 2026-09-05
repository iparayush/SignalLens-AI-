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
      className="flex flex-col justify-between gap-2.5 bg-[#171b26] p-4 rounded shadow-md border border-[#262a35]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="text-[#4cd7f6] w-4 h-4" />
          <h2 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-[#dfe2f1]">
            Automatic Parameter Detection — Primary Telemetry
          </h2>
        </div>
        <div className="flex items-center gap-1.5 bg-[#4edea3]/10 border border-[#4edea3]/30 px-2.5 py-0.5 rounded text-[#4edea3] font-mono text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
          <span>OVERALL CONFIDENCE: {telemetry.overallConfidence.toFixed(1)}%</span>
        </div>
      </div>

      {/* High-Impact 4x2 Technical Metrics Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Modulation */}
        <div className="bg-[#1c1f2a] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#313540] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider">
              Modulation
            </span>
            <span className="font-mono text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-1 rounded font-bold">
              {telemetry.modulationMatch.toFixed(1)}% Match
            </span>
          </div>
          <div className="font-headline text-[20px] text-[#4cd7f6] font-bold leading-tight">
            {telemetry.modulation}
          </div>
          <div className="w-full bg-[#262a35] h-1 rounded overflow-hidden">
            <div
              className="bg-[#4cd7f6] h-full transition-all duration-500"
              style={{ width: `${telemetry.modulationMatch}%` }}
            ></div>
          </div>
        </div>

        {/* Sampling Frequency */}
        <div className="bg-[#1c1f2a] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#313540] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider">
              Sampling Freq
            </span>
            <span className="font-mono text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-1 rounded">
              {telemetry.samplingFreqConfidence}%
            </span>
          </div>
          <div className="font-headline text-[20px] text-[#dfe2f1] font-bold leading-tight">
            {telemetry.samplingFreqMHz.toFixed(3)}{' '}
            <span className="text-[12px] text-[#869397] font-normal font-mono">MHz</span>
          </div>
          <div className="w-full bg-[#262a35] h-1 rounded overflow-hidden">
            <div
              className="bg-[#4edea3] h-full transition-all duration-500"
              style={{ width: `${telemetry.samplingFreqConfidence}%` }}
            ></div>
          </div>
        </div>

        {/* Symbol Rate */}
        <div className="bg-[#1c1f2a] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#313540] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider">
              Symbol Rate
            </span>
            <span className="font-mono text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-1 rounded">
              {telemetry.symbolRateConfidence.toFixed(1)}%
            </span>
          </div>
          <div className="font-headline text-[20px] text-[#dfe2f1] font-bold leading-tight">
            {telemetry.symbolRateMSym.toFixed(3)}{' '}
            <span className="text-[12px] text-[#869397] font-normal font-mono">MSym/s</span>
          </div>
          <div className="w-full bg-[#262a35] h-1 rounded overflow-hidden">
            <div
              className="bg-[#4cd7f6] h-full transition-all duration-500"
              style={{ width: `${telemetry.symbolRateConfidence}%` }}
            ></div>
          </div>
        </div>

        {/* Bandwidth */}
        <div className="bg-[#1c1f2a] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#313540] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider">
              BW (-3dB)
            </span>
            <span className="font-mono text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-1 rounded">
              {telemetry.bandwidthConfidence.toFixed(1)}%
            </span>
          </div>
          <div className="font-headline text-[20px] text-[#dfe2f1] font-bold leading-tight">
            {telemetry.bandwidthMHz.toFixed(3)}{' '}
            <span className="text-[12px] text-[#869397] font-normal font-mono">MHz</span>
          </div>
          <div className="w-full bg-[#262a35] h-1 rounded overflow-hidden">
            <div
              className="bg-[#4cd7f6] h-full transition-all duration-500"
              style={{ width: `${telemetry.bandwidthConfidence}%` }}
            ></div>
          </div>
        </div>

        {/* FEC Scheme */}
        <div className="bg-[#1c1f2a] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#313540] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider">
              FEC Code
            </span>
            <span className="font-mono text-[10px] text-[#4cd7f6] bg-[#4cd7f6]/10 px-1 rounded font-semibold">
              Detected
            </span>
          </div>
          <div className="font-mono text-[13px] text-[#dfe2f1] font-bold truncate leading-tight py-0.5">
            {telemetry.fecCode}
          </div>
          <div className="w-full bg-[#262a35] h-1 rounded overflow-hidden">
            <div className="bg-[#4edea3] h-full w-[98%]"></div>
          </div>
        </div>

        {/* Interleaving */}
        <div className="bg-[#1c1f2a] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#313540] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider">
              Interleaving
            </span>
            <span className="font-mono text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-1 rounded">
              {telemetry.interleavingConfidence.toFixed(1)}%
            </span>
          </div>
          <div className="font-mono text-[13px] text-[#dfe2f1] font-bold truncate leading-tight py-0.5">
            {telemetry.interleaving}
          </div>
          <div className="w-full bg-[#262a35] h-1 rounded overflow-hidden">
            <div
              className="bg-[#adc6ff] h-full transition-all duration-500"
              style={{ width: `${telemetry.interleavingConfidence}%` }}
            ></div>
          </div>
        </div>

        {/* SNR Metric */}
        <div className="bg-[#1c1f2a] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#313540] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider">
              Estimated SNR
            </span>
            <span className="font-mono text-[10px] text-[#4edea3] bg-[#4edea3]/10 px-1 rounded font-semibold">
              {telemetry.snrQuality}
            </span>
          </div>
          <div className="font-headline text-[20px] text-[#4edea3] font-bold leading-tight">
            +{telemetry.estimatedSnrDb.toFixed(1)}{' '}
            <span className="text-[12px] text-[#869397] font-normal font-mono">dB</span>
          </div>
          <div className="w-full bg-[#262a35] h-1 rounded overflow-hidden">
            <div className="bg-[#4edea3] h-full w-[85%]"></div>
          </div>
        </div>

        {/* Carrier Frequency */}
        <div className="bg-[#1c1f2a] p-2.5 rounded flex flex-col justify-between gap-1 border border-[#313540] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#869397] uppercase tracking-wider">
              Center Carrier
            </span>
            <span className="font-mono text-[10px] text-[#4cd7f6] bg-[#4cd7f6]/10 px-1 rounded font-bold">
              LOCKED
            </span>
          </div>
          <div className="font-headline text-[20px] text-[#4cd7f6] font-bold leading-tight">
            {telemetry.centerCarrierMHz.toFixed(3)}{' '}
            <span className="text-[12px] text-[#869397] font-normal font-mono">MHz</span>
          </div>
          <div className="w-full bg-[#262a35] h-1 rounded overflow-hidden">
            <div className="bg-[#4cd7f6] h-full w-full"></div>
          </div>
        </div>
      </div>

      {/* Quick Operational Ribbon */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-[#0a0e18] rounded text-[#bcc9cd] font-mono text-[11px] border border-[#262a35]">
        <span className="flex items-center gap-1.5">
          <span className="text-[#869397]">Algorithm:</span>
          <span className="text-[#dfe2f1] font-semibold">{telemetry.algorithm}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-[#869397]">Inference Compute:</span>
          <span className="text-[#4edea3] font-mono font-medium">
            {telemetry.inferenceComputeMs.toFixed(1)} ms (TensorRT INT8)
          </span>
        </span>
      </div>
    </div>
  );
};
