import React, { useState } from 'react';
import { BitStreamByte, SignalProfile } from '../types';
import { Binary, Copy, Check, Download } from 'lucide-react';

interface BitStreamConsoleProps {
  activeSignal: SignalProfile;
}

export const BitStreamConsole: React.FC<BitStreamConsoleProps> = ({ activeSignal }) => {
  const [viewMode, setViewMode] = useState<'hex' | 'bin'>('hex');
  const [copied, setCopied] = useState(false);
  const [hoveredByte, setHoveredByte] = useState<{ row: number; col: number } | null>(null);

  const lines = activeSignal.bitstreamLines;

  const handleCopy = () => {
    const textContent = lines
      .map((l) => {
        if (viewMode === 'hex') {
          return `${l.offset} ${l.hexBytes.join(' ')}  |  ${l.ascii}`;
        } else {
          const binBytes = l.hexBytes
            .map((h) => parseInt(h, 16).toString(2).padStart(8, '0'))
            .join(' ');
          return `${l.offset} ${binBytes}  |  ${l.ascii}`;
        }
      })
      .join('\n');

    navigator.clipboard.writeText(textContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSaveBin = () => {
    const rawBytes = new Uint8Array(activeSignal.rawSampleBytes);
    const blob = new Blob([rawBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSignal.filename.replace('.iq', '')}_STREAM.bin`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="bit-stream-viewer-section"
      className="flex flex-col gap-2.5 bg-[#171b26] p-4 rounded shadow-md border border-[#262a35]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Binary className="text-[#4cd7f6] w-4 h-4" />
          <h2 className="font-mono text-[12px] font-semibold uppercase tracking-wider text-[#dfe2f1]">
            Recovered Bit Stream Data
          </h2>
          <span className="font-mono text-[10px] text-[#4edea3] bg-[#0a0e18] px-2 py-0.5 rounded border border-[#4edea3]/20 font-bold">
            STREAM ACTIVE
          </span>
        </div>

        {/* Controls: Hex / Binary toggle, Copy, Export */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded bg-[#0a0e18] p-0.5 border border-[#313540]" role="group">
            <button
              onClick={() => setViewMode('hex')}
              className={`px-2.5 py-0.5 rounded font-mono text-[11px] font-bold uppercase transition-all ${
                viewMode === 'hex'
                  ? 'bg-[#4cd7f6] text-[#003640] shadow-sm'
                  : 'text-[#bcc9cd] hover:text-[#dfe2f1]'
              }`}
              type="button"
            >
              HEX
            </button>
            <button
              onClick={() => setViewMode('bin')}
              className={`px-2.5 py-0.5 rounded font-mono text-[11px] font-bold uppercase transition-all ${
                viewMode === 'bin'
                  ? 'bg-[#4cd7f6] text-[#003640] shadow-sm'
                  : 'text-[#bcc9cd] hover:text-[#dfe2f1]'
              }`}
              type="button"
            >
              BIN
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#262a35] hover:bg-[#353944] text-[#dfe2f1] rounded font-mono text-[11px] uppercase tracking-wide transition-colors border border-[#313540] cursor-pointer"
            type="button"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#4edea3]" />
                <span className="text-[#4edea3] font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#4cd7f6]" />
                <span>Copy Stream</span>
              </>
            )}
          </button>

          <button
            onClick={handleSaveBin}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#262a35] hover:bg-[#353944] text-[#4cd7f6] rounded font-mono text-[11px] uppercase tracking-wide transition-colors border border-[#4cd7f6]/30 cursor-pointer shadow-sm"
            type="button"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save RAW .bin</span>
          </button>
        </div>
      </div>

      {/* Raw Bit Stream Monospace Console Window */}
      <div
        id="bitstream-container"
        className="bg-[#0a0e18] rounded p-3 font-mono text-[12px] leading-relaxed overflow-x-auto shadow-inner h-64 flex flex-col gap-1 border border-[#262a35]"
      >
        {/* Header format row */}
        <div className="text-[#869397] font-mono text-[11px] pb-1 border-b border-[#171b26] flex gap-4 select-none">
          <span className="w-16">OFFSET</span>
          <span className="flex-1">
            {viewMode === 'hex' ? 'HEX RAW BYTES (16 BYTES/LINE)' : 'BINARY STREAM (128 BITS/LINE)'}
          </span>
          <span className="w-44 text-right">ASCII TRANSLATION</span>
        </div>

        {/* Content Rows */}
        {lines.map((line, rIdx) => {
          const isRowSpecial = line.isSpecial;

          return (
            <div
              key={line.offset}
              className={`flex gap-4 font-mono px-1 rounded transition-colors group ${
                isRowSpecial ? 'bg-[#4cd7f6]/10 border border-[#4cd7f6]/20' : 'hover:bg-[#1c1f2a]/60'
              }`}
            >
              <span
                className={`select-none w-16 ${
                  isRowSpecial ? 'text-[#4cd7f6] font-bold' : 'text-[#869397]'
                }`}
              >
                {line.offset}
              </span>

              <span className="flex-1 text-[#dfe2f1] flex flex-wrap gap-1.5">
                {line.hexBytes.map((hex, cIdx) => {
                  const isHovered = hoveredByte?.row === rIdx && hoveredByte?.col === cIdx;
                  const binVal = parseInt(hex, 16).toString(2).padStart(8, '0');

                  let textStyle = 'text-[#dfe2f1]';
                  if (line.highlightCategory === 'header' && cIdx < 4) {
                    textStyle = 'text-[#4cd7f6] font-bold bg-[#4cd7f6]/15 px-0.5 rounded';
                  } else if (line.highlightCategory === 'ip') {
                    textStyle = 'text-[#4cd7f6] font-bold';
                  } else if (line.highlightCategory === 'protocol') {
                    textStyle = 'text-[#4edea3] font-medium';
                  }

                  return (
                    <span
                      key={cIdx}
                      onMouseEnter={() => setHoveredByte({ row: rIdx, col: cIdx })}
                      onMouseLeave={() => setHoveredByte(null)}
                      className={`cursor-pointer transition-all ${textStyle} ${
                        isHovered ? 'bg-[#4cd7f6] text-[#003640] font-bold px-0.5 rounded scale-105' : ''
                      }`}
                      title={`Offset: 0x${(rIdx * 16 + cIdx).toString(16).padStart(4, '0').toUpperCase()} | Hex: 0x${hex} | Bin: ${binVal} | Char: '${line.ascii[cIdx] || ' '}'`}
                    >
                      {viewMode === 'hex' ? hex : binVal}
                    </span>
                  );
                })}
              </span>

              <span
                className={`font-mono w-44 text-right select-none ${
                  isRowSpecial
                    ? 'text-[#4cd7f6] font-bold'
                    : line.highlightCategory === 'protocol'
                    ? 'text-[#4edea3] font-semibold'
                    : 'text-[#bcc9cd]'
                }`}
              >
                {line.ascii}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status Footer Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-[#1c1f2a] rounded text-[#bcc9cd] font-mono text-[11px] border border-[#313540]">
        <div className="flex items-center gap-3">
          <span>
            Total Recovered: <strong className="text-[#dfe2f1]">2,400 Bytes</strong> (19,200 bits)
          </span>
          <span className="text-[#869397]">•</span>
          <span>
            Entropy: <span className="text-[#4cd7f6] font-mono">7.89 bits/byte</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
          <span>
            BER: <strong className="text-[#4edea3] font-mono">&lt; 10⁻⁶</strong> (Zero Symbol Inversions)
          </span>
        </div>
      </div>
    </section>
  );
};
