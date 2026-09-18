import React from 'react';
import { SignalProfile } from '../types';
import { SignalIngestionCard } from './SignalIngestionCard';
import { PrimaryTelemetryCard } from './PrimaryTelemetryCard';
import { QuadrantVisualizer } from './QuadrantVisualizer';
import { DSPPipelineFlow } from './DSPPipelineFlow';
import { BitStreamConsole } from './BitStreamConsole';
import { CorrelationPanel } from './CorrelationPanel';

interface DashboardViewProps {
  activeSignal: SignalProfile;
  onFileUpload: (file: File) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeSignal,
  onFileUpload,
}) => {
  return (
    <div className="flex flex-col w-full gap-4">
      {/* TOP DECK: INGESTION CONTROLS & COMPACT STATUS BANNER */}
      <div className="grid grid-cols-12 gap-4">
        {/* SECTION 1: SIGNAL FILE INPUT & INGESTION */}
        <div className="col-span-12 lg:col-span-4">
          <SignalIngestionCard
            activeSignal={activeSignal}
            onFileUpload={onFileUpload}
          />
        </div>

        {/* SECTION 3: AUTOMATIC PARAMETER DETECTION — PRIMARY TELEMETRY */}
        <div className="col-span-12 lg:col-span-8">
          <PrimaryTelemetryCard telemetry={activeSignal.telemetry} />
        </div>
      </div>

      {/* SECTION 2: SIGNAL VISUALIZATION (4-Grid Multi-Spectrum High-Precision Panel) */}
      <QuadrantVisualizer activeSignal={activeSignal} />

      {/* SECTION 4: SIGNAL PROCESSING PIPELINE (End-to-End Horizontal Architectural Flow) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 font-mono text-[11px] font-bold text-[#14B8A6] uppercase tracking-widest px-1">
          <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse"></span>
          SYSTEM ONLINE
          <span className="text-[#64748B] mx-1">•</span>
          DSP ENGINE ACTIVE
          <span className="text-[#64748B] mx-1">•</span>
          ALL STAGES SYNCHRONIZED
        </div>
        <DSPPipelineFlow stages={activeSignal.pipelineStages} />
      </div>

      {/* LOWER DECK: SECTION 5 & 6 (RAW BITSTREAM CONSOLE & PREAMBLE CORRELATION ENGINE) */}
      <div className="grid grid-cols-12 gap-4">
        {/* SECTION 5: BIT STREAM VIEWER */}
        <div className="col-span-12 xl:col-span-8">
          <BitStreamConsole activeSignal={activeSignal} />
        </div>

        {/* SECTION 6: CORRELATION & PREAMBLE DETECTION */}
        <div className="col-span-12 xl:col-span-4 flex flex-col">
          <CorrelationPanel correlation={activeSignal.correlation} />
        </div>
      </div>
    </div>
  );
};
