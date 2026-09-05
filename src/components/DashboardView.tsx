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
      <DSPPipelineFlow stages={activeSignal.pipelineStages} />

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
