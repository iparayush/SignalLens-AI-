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
        return <Waves className="w-4 h-4 text-[#22D3EE]" />;
      case 'grid_view':
        return <Grid className="w-4 h-4 text-[#22D3EE]" />;
      case 'verified_user':
        return <ShieldCheck className="w-4 h-4 text-[#22D3EE]" />;
      case 'terminal':
        return <Terminal className="w-4 h-4 text-[#22D3EE]" />;
      case 'radar':
        return <Radar className="w-4 h-4 text-[#22D3EE]" />;
      default:
        return <GitBranch className="w-4 h-4 text-[#22D3EE]" />;
    }
  };

  return (
    <section
      id="signal-processing-pipeline-section"
      className="flex flex-col gap-2.5 bg-[#0B1224] p-4 rounded shadow-md border border-[#1E293B]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="text-[#22D3EE] w-4 h-4" />
          <h2 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-white">
            Signal Processing Pipeline — DSP Execution Flow
          </h2>
        </div>
        
      </div>

      {/* Pipeline Step Blocks Connected with Visual Path */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 relative">
        {stages.map((stage) => (
          <div
            key={stage.id}
            onClick={() => setSelectedStage(stage)}
            className="flex flex-col bg-[#101A32] rounded p-2.5 relative group hover:bg-[#1E293B] transition-all cursor-pointer border border-[#1E293B] shadow-sm hover:border-[#22D3EE]/40"
            title="Click to view stage DSP internal telemetry"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded bg-[#6D28D9] text-white font-mono text-[10px] flex items-center justify-center font-bold">
                {stage.stepNum}
              </span>
              <span className="flex items-center text-[#14B8A6] font-mono text-[11px] font-bold gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {stage.statusText}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1.5">
              {getIcon(stage.iconName)}
              <span className="font-headline text-[14px] font-semibold text-white">
                {stage.title}
              </span>
            </div>

            <p className="font-mono text-[11px] text-[#94A3B8] mt-1 leading-snug line-clamp-2">
              {stage.description}
            </p>

            <div className="mt-2.5 pt-1.5 bg-[#050816] px-2 py-1 rounded font-mono text-[10px] text-[#64748B] flex justify-between border border-[#1E293B]">
              <span>{stage.metaLeft}</span>
              <span className="text-[#14B8A6] font-semibold">{stage.metaRight}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Stage Inspector Modal */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 bg-[#050816]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1224] border border-[#22D3EE]/40 rounded-lg p-5 max-w-lg w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-[#6D28D9] text-white font-mono text-xs flex items-center justify-center font-bold">
                  {selectedStage.stepNum}
                </span>
                <h3 className="font-headline text-lg font-bold text-white">
                  Stage {selectedStage.stepNum}: {selectedStage.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStage(null)}
                className="text-[#64748B] hover:text-white p-1 rounded hover:bg-[#1E293B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="text-sm font-mono text-[#22D3EE] bg-[#050816] p-2.5 rounded border border-[#1E293B]">
                {selectedStage.description}
              </div>

              {selectedStage.details && (
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
                    {selectedStage.details.heading}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedStage.details.metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="bg-[#101A32] p-2 rounded border border-[#1E293B] text-xs font-mono flex flex-col"
                      >
                        <span className="text-[#64748B] text-[10px]">{m.label}</span>
                        <span className="text-white font-semibold mt-0.5">{m.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-2 bg-[#101A32]/60 p-2 rounded leading-relaxed border border-[#1E293B]/60">
                    {selectedStage.details.summary}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStage(null)}
                className="px-4 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-white font-mono text-xs rounded uppercase font-semibold"
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
