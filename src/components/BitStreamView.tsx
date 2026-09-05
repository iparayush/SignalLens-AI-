import React, { useState } from 'react';
import { SignalProfile } from '../types';
import { Binary, Search, Download, Copy, Check, Filter } from 'lucide-react';

interface BitStreamViewProps {
  activeSignal: SignalProfile;
}

export const BitStreamView: React.FC<BitStreamViewProps> = ({ activeSignal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFormat, setViewFormat] = useState<'hex' | 'bin' | 'ascii'>('hex');
  const [copied, setCopied] = useState(false);

  const filteredLines = activeSignal.bitstreamLines.filter(
    (l) =>
      l.ascii.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.hexBytes.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.offset.includes(searchQuery)
  );

  const handleCopy = () => {
    const text = activeSignal.bitstreamLines
      .map((l) => `${l.offset} ${l.hexBytes.join(' ')}  |  ${l.ascii}`)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const rawBytes = new Uint8Array(activeSignal.rawSampleBytes);
    const blob = new Blob([rawBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSignal.filename.replace('.iq', '')}_FULL_STREAM.bin`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#171b26] p-4 rounded border border-[#262a35]">
        <div>
          <div className="flex items-center gap-2">
            <Binary className="w-5 h-5 text-[#4cd7f6]" />
            <h1 className="font-headline text-xl font-bold text-[#dfe2f1]">
              Demodulated Frame &amp; Bit Stream Dissection Suite
            </h1>
          </div>
          <p className="font-mono text-xs text-[#869397] mt-1">
            Raw octet stream, Barker preamble tracking, protocol dissection, and network payload extraction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#262a35] hover:bg-[#353944] text-[#dfe2f1] font-mono text-xs rounded uppercase font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#4edea3]" /> : <Copy className="w-4 h-4 text-[#4cd7f6]" />}
            <span>{copied ? 'Copied' : 'Copy All'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4cd7f6] hover:bg-[#acedff] text-[#003640] font-mono text-xs font-bold rounded uppercase transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Raw .BIN</span>
          </button>
        </div>
      </div>

      {/* Main Console */}
      <div className="bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
        {/* Search & View Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-[#869397] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Hex (e.g. EB90) or ASCII (e.g. 192.168)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0e18] border border-[#313540] focus:border-[#4cd7f6] rounded pl-9 pr-3 py-1.5 text-xs font-mono text-[#dfe2f1] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#869397]">Format:</span>
            {(['hex', 'bin', 'ascii'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setViewFormat(fmt)}
                className={`px-3 py-1 rounded font-bold uppercase ${
                  viewFormat === fmt
                    ? 'bg-[#06b6d4] text-[#00424f]'
                    : 'bg-[#0a0e18] text-[#bcc9cd] hover:bg-[#262a35]'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Large Monospace Hex Dissector Window */}
        <div className="bg-[#0a0e18] p-4 rounded border border-[#262a35] font-mono text-xs overflow-x-auto max-h-[500px] flex flex-col gap-1.5">
          <div className="text-[#869397] pb-2 border-b border-[#1c1f2a] flex gap-4 select-none font-bold">
            <span className="w-20">BYTE OFFSET</span>
            <span className="flex-1">OCTET BUFFER ARRAY (16 BYTES/ROW)</span>
            <span className="w-52 text-right">ASCII / PROTOCOL TEXT</span>
          </div>

          {filteredLines.map((line) => (
            <div
              key={line.offset}
              className={`flex gap-4 py-1 px-2 rounded transition-colors ${
                line.isSpecial ? 'bg-[#4cd7f6]/10 border border-[#4cd7f6]/20' : 'hover:bg-[#1c1f2a]'
              }`}
            >
              <span className={`w-20 ${line.isSpecial ? 'text-[#4cd7f6] font-bold' : 'text-[#869397]'}`}>
                {line.offset}
              </span>

              <span className="flex-1 flex flex-wrap gap-2 text-[#dfe2f1]">
                {line.hexBytes.map((h, idx) => (
                  <span
                    key={idx}
                    className={`font-medium ${
                      line.highlightCategory === 'header' && idx < 4
                        ? 'text-[#4cd7f6] font-bold bg-[#4cd7f6]/20 px-0.5 rounded'
                        : line.highlightCategory === 'ip'
                        ? 'text-[#4cd7f6] font-bold'
                        : line.highlightCategory === 'protocol'
                        ? 'text-[#4edea3]'
                        : ''
                    }`}
                  >
                    {viewFormat === 'hex'
                      ? h
                      : viewFormat === 'bin'
                      ? parseInt(h, 16).toString(2).padStart(8, '0')
                      : String.fromCharCode(parseInt(h, 16) || 46)}
                  </span>
                ))}
              </span>

              <span
                className={`w-52 text-right ${
                  line.isSpecial
                    ? 'text-[#4cd7f6] font-bold'
                    : line.highlightCategory === 'protocol'
                    ? 'text-[#4edea3] font-semibold'
                    : 'text-[#bcc9cd]'
                }`}
              >
                {line.ascii}
              </span>
            </div>
          ))}
        </div>

        {/* Protocol Extraction Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#1c1f2a] p-3 rounded border border-[#313540] font-mono text-xs">
          <div>
            <span className="text-[#869397] text-[10px] block uppercase">Network Endpoint Identified:</span>
            <strong className="text-[#4cd7f6] text-sm">192.168.1.108:80</strong>
          </div>
          <div>
            <span className="text-[#869397] text-[10px] block uppercase">Extracted Protocol Banner:</span>
            <strong className="text-[#4edea3] text-sm">HTTP/1.1 (SERVER: SIGINT-TARGET-V4)</strong>
          </div>
          <div>
            <span className="text-[#869397] text-[10px] block uppercase">Frame Sync Word:</span>
            <strong className="text-[#adc6ff] text-sm">0xEB904A12 (Barker 13+ Hybrid)</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
