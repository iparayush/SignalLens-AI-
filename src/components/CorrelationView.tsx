import React, { useState, useMemo } from 'react';
import { SignalProfile } from '../types';
import { ScanLine, Search, Crosshair, CheckCircle2, Play, Layers } from 'lucide-react';
import {
  correlateStream,
  KNOWN_SYNC_PATTERNS,
  type SyncPattern,
  type CorrelationResult,
} from '../lib/dsp/correlator';

interface CorrelationViewProps {
  activeSignal: SignalProfile;
}

function hexToBits(hex: string): number[] {
  const clean = hex.replace(/^0x/i, '');
  const bits: number[] = [];
  for (const ch of clean) {
    const nibble = parseInt(ch, 16);
    if (!isNaN(nibble)) {
      for (let b = 3; b >= 0; b--) {
        bits.push((nibble >> b) & 1);
      }
    }
  }
  return bits;
}

export const CorrelationView: React.FC<CorrelationViewProps> = ({ activeSignal }) => {
  const [selectedPattern, setSelectedPattern] = useState<SyncPattern>(KNOWN_SYNC_PATTERNS[1]);
  const [customHex, setCustomHex] = useState<string>('0x1ACFFC1D');
  const [threshold, setThreshold] = useState<number>(75);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchSuccess, setSearchSuccess] = useState<string | null>(null);

  // Active correlation result state
  const [corrResult, setCorrResult] = useState<CorrelationResult | null>(
    activeSignal.correlationResult || null
  );

  // Fallback initial matches
  const [matches, setMatches] = useState([
    {
      offset: 0,
      bitLocation: '0x00000000',
      psrDb: 24.8,
      confidence: 99.4,
      headerType: 'CCSDS ASM Sync Word',
    },
    {
      offset: 1024,
      bitLocation: '0x00000400',
      psrDb: 24.5,
      confidence: 99.1,
      headerType: 'Frame 2 Sync Marker',
    },
    {
      offset: 2048,
      bitLocation: '0x00000800',
      psrDb: 23.9,
      confidence: 98.7,
      headerType: 'Frame 3 Sync Marker',
    },
  ]);

  const handleRunCorrelation = () => {
    setIsSearching(true);

    setTimeout(() => {
      const data =
        activeSignal.demodulationResult?.bits || new Uint8Array(activeSignal.rawSampleBytes);

      const patternToUse: SyncPattern = {
        name: selectedPattern.name,
        hex: customHex || selectedPattern.hex,
        bits: hexToBits(customHex || selectedPattern.hex),
        type: selectedPattern.type,
        description: selectedPattern.description,
      };

      const result = correlateStream(data, patternToUse, threshold / 100);
      setCorrResult(result);
      setIsSearching(false);

      if (result.matches.length > 0) {
        setMatches(
          result.matches.map((m, idx) => ({
            offset: m.bitOffset,
            bitLocation: `0x${m.byteOffset.toString(16).padStart(8, '0').toUpperCase()}`,
            psrDb: m.psrDb,
            confidence: m.confidence,
            headerType: idx === 0 ? `${m.patternName} Sync` : `Frame ${idx + 1} Marker`,
          }))
        );
        setSearchSuccess(
          `Correlator found ${result.matches.length} sync markers for ${patternToUse.name} with Peak-to-Sidelobe Ratio of ${result.bestPsrDb} dB.`
        );
      } else {
        setSearchSuccess(
          `Correlation executed: No strong peak exceeding ${threshold}% threshold found for pattern ${patternToUse.hex}. Try lowering threshold.`
        );
      }
      setTimeout(() => setSearchSuccess(null), 5000);
    }, 400);
  };

  // Build SVG Path from correlationWaveform (400 × 100)
  const { waveformPath, peakCircles } = useMemo(() => {
    const width = 400;
    const height = 100;

    if (corrResult?.correlationWaveform && corrResult.correlationWaveform.length > 10) {
      const wf = corrResult.correlationWaveform;
      const numPoints = Math.min(200, wf.length);
      const stride = wf.length / numPoints;
      const points: string[] = [];
      const circles: { cx: number; cy: number }[] = [];

      for (let i = 0; i < numPoints; i++) {
        const idx = Math.min(Math.floor(i * stride), wf.length - 1);
        const x = (i / (numPoints - 1)) * width;
        const val = wf[idx]; // 0 to 1
        const y = 92 - val * 75;
        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);

        if (val > (threshold / 100) * 0.9) {
          circles.push({ cx: x, cy: y });
        }
      }

      return {
        waveformPath: `M ${points.join(' L ')}`,
        peakCircles: circles,
      };
    }

    // Default stylized fallback
    return {
      waveformPath:
        'M0,90 Q20,88 40,91 T80,89 T120,92 T160,88 T200,90 T240,91 T280,89 T320,92 T360,88 T400,90',
      peakCircles: [
        { cx: 35, cy: 15 },
        { cx: 160, cy: 15 },
        { cx: 280, cy: 15 },
      ],
    };
  }, [corrResult, threshold]);

  const activePsr = corrResult ? corrResult.bestPsrDb : 24.8;

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#171b26] p-4 rounded border border-[#262a35]">
        <div>
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-[#4cd7f6]" />
            <h1 className="font-headline text-xl font-bold text-[#dfe2f1]">
              Bit Stream Correlation &amp; Pattern Detector
            </h1>
          </div>
          <p className="font-mono text-xs text-[#869397] mt-1">
            Detect known preambles, sync markers (Barker, CCSDS, Inmarsat), repeated framing sequences, and extract payload boundaries.
          </p>
        </div>

        <button
          onClick={handleRunCorrelation}
          disabled={isSearching}
          className="flex items-center gap-2 px-4 py-2 bg-[#06b6d4] hover:bg-[#4cd7f6] text-[#00424f] font-mono text-xs font-bold rounded uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(6,182,212,0.35)] disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isSearching ? 'Correlating Bits...' : 'Execute Cross-Correlation'}</span>
        </button>
      </div>

      {searchSuccess && (
        <div className="px-4 py-2.5 rounded bg-[#4edea3]/15 border border-[#4edea3]/30 text-[#4edea3] font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{searchSuccess}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Left Column: Preset Selector & Pattern Config */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#dfe2f1] flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#4cd7f6]" />
                1. Select Preamble / Sync Pattern
              </h2>
              <span className="font-mono text-[10px] text-[#4cd7f6] bg-[#003640] px-2 py-0.5 rounded border border-[#4cd7f6]/40 uppercase font-bold">
                {selectedPattern.type}
              </span>
            </div>

            {/* Presets List */}
            <div className="flex flex-col gap-2">
              {KNOWN_SYNC_PATTERNS.map((pat) => {
                const isSelected = selectedPattern.name === pat.name;
                return (
                  <div
                    key={pat.name}
                    onClick={() => {
                      setSelectedPattern(pat);
                      setCustomHex(pat.hex);
                    }}
                    className={`p-3 rounded border transition-all cursor-pointer font-mono text-xs flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-[#1c1f2a] border-[#4cd7f6] shadow-[0_0_10px_rgba(76,215,246,0.15)]'
                        : 'bg-[#0a0e18] border-[#313540] hover:bg-[#1c1f2a]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-[#dfe2f1]">{pat.name}</strong>
                      <span className="text-[#4cd7f6] font-bold">{pat.hex}</span>
                    </div>
                    <p className="text-[11px] text-[#869397] font-sans leading-tight">
                      {pat.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Custom Pattern Entry */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#262a35] font-mono text-xs">
              <label className="text-[#869397] uppercase">Custom Hex Sync Word:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  className="bg-[#0a0e18] border border-[#313540] text-[#4cd7f6] px-3 py-1.5 rounded flex-1 font-mono focus:border-[#4cd7f6] outline-none"
                  placeholder="0x..."
                />
                <button
                  onClick={handleRunCorrelation}
                  className="px-3 py-1.5 bg-[#262a35] hover:bg-[#353944] text-[#dfe2f1] rounded font-bold uppercase text-[11px] cursor-pointer"
                >
                  Set &amp; Correlate
                </button>
              </div>
            </div>

            {/* Correlation Threshold Slider */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#262a35] font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#bcc9cd]">Detection Peak Threshold:</span>
                <span className="text-[#4edea3] font-bold">{threshold}% match</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="accent-[#4edea3] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Cross-Correlation Graph & Frame Boundaries */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#dfe2f1] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#4cd7f6]" />
                2. Sliding Cross-Correlation Peak Output
              </h2>
              <span className="font-mono text-xs text-[#4edea3] font-bold">
                PSR: {activePsr.toFixed(1)} dB (Sharp Delta)
              </span>
            </div>

            {/* Peak Graph SVG */}
            <div className="relative w-full h-48 bg-[#0a0e18] rounded border border-[#262a35] p-2 flex items-end">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                {/* Threshold line */}
                <line
                  x1="0"
                  y1={100 - (threshold / 100) * 80}
                  x2="400"
                  y2={100 - (threshold / 100) * 80}
                  stroke="#4edea3"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
                <text
                  x="300"
                  y={95 - (threshold / 100) * 80}
                  fill="#4edea3"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  THRESHOLD ({threshold}%)
                </text>

                {/* Waveform curve */}
                <path d={waveformPath} fill="none" stroke="#4cd7f6" strokeWidth="1.8" />

                {/* Peak Markers */}
                {peakCircles.map((c, i) => (
                  <g key={i}>
                    <circle cx={c.cx} cy={c.cy} r="4" fill="#4edea3" />
                    <line
                      x1={c.cx}
                      y1={c.cy}
                      x2={c.cx}
                      y2="95"
                      stroke="#4cd7f6"
                      strokeDasharray="2 2"
                      opacity="0.7"
                    />
                  </g>
                ))}
              </svg>

              <span className="absolute bottom-2 left-3 font-mono text-[10px] text-[#869397]">
                Bit Offset 0 → {activeSignal.demodulationResult ? `${activeSignal.demodulationResult.numBits} bits` : '3072 bits'}
              </span>
              <span className="absolute top-2 left-3 font-mono text-[10px] text-[#4cd7f6]">
                Target Sync: {customHex || selectedPattern.hex}
              </span>
            </div>

            {/* Identified Payload Boundaries Table */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#262a35]">
              <span className="font-mono text-[11px] text-[#869397] uppercase">
                Identified Framing &amp; Payload Boundaries ({matches.length} Detected)
              </span>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {matches.map((m, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded bg-[#0a0e18] border border-[#262a35] flex items-center justify-between font-mono text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#06b6d4]/20 text-[#4cd7f6] text-[10px] font-bold">
                        OFFSET {m.offset} BITS
                      </span>
                      <span className="text-[#dfe2f1] font-semibold">{m.headerType}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="text-[#869397]">
                        PSR: <strong className="text-[#4edea3]">{m.psrDb.toFixed(1)} dB</strong>
                      </span>
                      <span className="text-[#869397]">
                        Confidence: <strong className="text-[#4cd7f6]">{m.confidence.toFixed(1)}%</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dissected Packet Structure Visualizer */}
            <div className="bg-[#0a0e18] p-3 rounded border border-[#262a35] flex flex-col gap-2 font-mono text-xs">
              <span className="text-[#869397] uppercase text-[10px]">
                CCSDS Space Packet Dissection (Frame 1):
              </span>
              <div className="grid grid-cols-12 gap-1 text-center font-bold text-[10px]">
                <div className="col-span-3 bg-[#06b6d4] text-[#003640] p-1.5 rounded-xs">
                  ASM (32-bit)
                </div>
                <div className="col-span-2 bg-[#262a35] text-[#dfe2f1] p-1.5 rounded-xs">
                  HDR (16-bit)
                </div>
                <div className="col-span-1 bg-[#313540] text-[#adc6ff] p-1.5 rounded-xs">
                  SEQ #
                </div>
                <div className="col-span-4 bg-[#1c1f2a] text-[#4edea3] p-1.5 rounded-xs border border-[#4edea3]/30">
                  PAYLOAD (896-bit Telemetry)
                </div>
                <div className="col-span-2 bg-[#ffb4ab]/20 text-[#ffb4ab] p-1.5 rounded-xs border border-[#ffb4ab]/30">
                  CRC-32
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
