import React, { useState } from 'react';
import { DSPPipelineStage } from '../types';
import { GitBranch, CheckCircle2, Waves, Grid, ShieldCheck, Terminal, Radar, X } from 'lucide-react';

interface DSPPipelineFlowProps {
  stages: DSPPipelineStage[];
}

export const DSPPipelineFlow: React.FC<DSPPipelineFlowProps> = ({ stages }) => {
  const [selectedStage, setSelectedStage] = useState<DSPPipelineStage | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case 'waves':
        return <Waves className="w-4 h-4 text-[#4cd7f6]" />;
      case 'grid_view':
        return <Grid className="w-4 h-4 text-[#4cd7f6]" />;
      case 'verified_user':
        return <ShieldCheck className="w-4 h-4 text-[#4cd7f6]" />;
      case 'terminal':
        return <Terminal className="w-4 h-4 text-[#4cd7f6]" />;
      case 'radar':
        return <Radar className="w-4 h-4 text-[#4cd7f6]" />;
      default:
        return <GitBranch className="w-4 h-4 text-[#4cd7f6]" />;
    }
  };

  return (
    <section
      id="signal-processing-pipeline-section"
      className="flex flex-col gap-2.5 bg-[#171b26] p-4 rounded shadow-md border border-[#262a35]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="text-[#4cd7f6] w-4 h-4" />
          <h2 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-[#dfe2f1]">
            Signal Processing Pipeline — DSP Execution Flow
          </h2>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#4edea3] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
          <span>ALL 5 STAGES SYNCHRONIZED • LATENCY 142ms</span>
        </div>
      </div>

      {/* Pipeline Step Blocks Connected with Visual Path */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 relative">
        {stages.map((stage) => (
          <div
            key={stage.id}
            onClick={() => setSelectedStage(stage)}
            className="flex flex-col bg-[#1c1f2a] rounded p-2.5 relative group hover:bg-[#262a35] transition-all cursor-pointer border border-[#313540] shadow-sm hover:border-[#4cd7f6]/40"
            title="Click to view stage DSP internal telemetry"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded bg-[#06b6d4] text-[#00424f] font-mono text-[10px] flex items-center justify-center font-bold">
                {stage.stepNum}
              </span>
              <span className="flex items-center text-[#4edea3] font-mono text-[11px] font-bold gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {stage.statusText}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1.5">
              {getIcon(stage.iconName)}
              <span className="font-headline text-[14px] font-semibold text-[#dfe2f1]">
                {stage.title}
              </span>
            </div>

            <p className="font-mono text-[11px] text-[#bcc9cd] mt-1 leading-snug line-clamp-2">
              {stage.description}
            </p>

            <div className="mt-2.5 pt-1.5 bg-[#0a0e18] px-2 py-1 rounded font-mono text-[10px] text-[#869397] flex justify-between border border-[#262a35]">
              <span>{stage.metaLeft}</span>
              <span className="text-[#4edea3] font-semibold">{stage.metaRight}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Stage Inspector Modal */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 bg-[#0a0e18]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#171b26] border border-[#4cd7f6]/40 rounded-lg p-5 max-w-lg w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#313540] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#06b6d4] text-[#00424f] font-mono text-xs flex items-center justify-center font-bold">
                  {selectedStage.stepNum}
                </span>
                <h3 className="font-headline text-lg font-bold text-[#dfe2f1]">
                  Stage {selectedStage.stepNum}: {selectedStage.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStage(null)}
                className="text-[#869397] hover:text-[#dfe2f1] p-1 rounded hover:bg-[#262a35]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="text-sm font-mono text-[#4cd7f6] bg-[#0a0e18] p-2.5 rounded border border-[#262a35]">
                {selectedStage.description}
              </div>

              {selectedStage.details && (
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#869397]">
                    {selectedStage.details.heading}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedStage.details.metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="bg-[#1c1f2a] p-2 rounded border border-[#313540] text-xs font-mono flex flex-col"
                      >
                        <span className="text-[#869397] text-[10px]">{m.label}</span>
                        <span className="text-[#dfe2f1] font-semibold mt-0.5">{m.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#bcc9cd] mt-2 bg-[#1c1f2a]/60 p-2 rounded leading-relaxed border border-[#313540]/60">
                    {selectedStage.details.summary}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStage(null)}
                className="px-4 py-1.5 bg-[#262a35] hover:bg-[#353944] text-[#dfe2f1] font-mono text-xs rounded uppercase font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
