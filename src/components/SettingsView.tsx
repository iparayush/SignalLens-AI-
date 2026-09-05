import React, { useState } from 'react';
import { Settings, Sliders, Radio, Cpu, Monitor, Check, RotateCcw } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [sdrDevice, setSdrDevice] = useState('USRP B210');
  const [bufferSize, setBufferSize] = useState('65,536 (Zero-Copy DMA)');
  const [lnaGain, setLnaGain] = useState(32);
  const [vgaGain, setVgaGain] = useState(24);
  const [fftWindow, setFftWindow] = useState('Blackman-Harris');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#171b26] p-4 rounded border border-[#262a35]">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#4cd7f6]" />
            <h1 className="font-headline text-xl font-bold text-[#dfe2f1]">
              SignalLens AI — DSP Engine &amp; Hardware Receiver Configuration
            </h1>
          </div>
          <p className="font-mono text-xs text-[#869397] mt-1">
            Configure software-defined radio (SDR) front-ends, DMA buffers, FFT engines, and tactical UI.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-[#4cd7f6] hover:bg-[#acedff] text-[#003640] font-mono text-xs font-bold rounded uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
        >
          <Check className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {savedNotice && (
        <div className="px-4 py-2 rounded bg-[#4edea3]/15 border border-[#4edea3]/30 text-[#4edea3] font-mono text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>Hardware &amp; DSP parameters applied and synced to DSP Engine v3.4.</span>
        </div>
      )}

      <div className="grid grid-cols-12 gap-5">
        {/* SDR Hardware Interface */}
        <div className="col-span-12 lg:col-span-6 bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#dfe2f1] flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#4cd7f6]" />
            Software-Defined Radio Front-End
          </h2>

          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-[#869397] uppercase">Connected Receiver:</label>
              <select
                value={sdrDevice}
                onChange={(e) => setSdrDevice(e.target.value)}
                className="bg-[#0a0e18] border border-[#313540] rounded px-3 py-2 text-[#dfe2f1] focus:border-[#4cd7f6] outline-none"
              >
                <option value="USRP B210">Ettus USRP B210 (Dual-Ch 56 MHz RF)</option>
                <option value="HackRF One">Great Scott Gadgets HackRF One (1 MHz - 6 GHz)</option>
                <option value="RTL-SDR v4">RTL-SDR Blog V4 (HF/VHF/UHF Intercept)</option>
                <option value="LimeSDR">LimeSDR PCIe Multi-MIMO Array</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#869397] uppercase">DMA Buffer Block Size:</label>
              <select
                value={bufferSize}
                onChange={(e) => setBufferSize(e.target.value)}
                className="bg-[#0a0e18] border border-[#313540] rounded px-3 py-2 text-[#dfe2f1] focus:border-[#4cd7f6] outline-none"
              >
                <option value="16,384 (Ultra-Low Latency)">16,384 Samples (Ultra-Low Latency)</option>
                <option value="65,536 (Zero-Copy DMA)">65,536 Samples (Zero-Copy DMA - Default)</option>
                <option value="131,072 (Deep Stream Capture)">131,072 Samples (Deep Stream Capture)</option>
              </select>
            </div>

            {/* LNA Gain Slider */}
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[#869397] uppercase">LNA RF Gain:</span>
                <span className="text-[#4cd7f6] font-bold">{lnaGain} dB</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={lnaGain}
                onChange={(e) => setLnaGain(Number(e.target.value))}
                className="accent-[#4cd7f6] cursor-pointer"
              />
            </div>

            {/* VGA Gain Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#869397] uppercase">VGA Baseband Gain:</span>
                <span className="text-[#4edea3] font-bold">{vgaGain} dB</span>
              </div>
              <input
                type="range"
                min="0"
                max="62"
                value={vgaGain}
                onChange={(e) => setVgaGain(Number(e.target.value))}
                className="accent-[#4edea3] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* DSP Algorithm Engine */}
        <div className="col-span-12 lg:col-span-6 bg-[#171b26] p-5 rounded border border-[#262a35] flex flex-col gap-4">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#dfe2f1] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#4cd7f6]" />
            DSP Core &amp; Spectral Engine
          </h2>

          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-[#869397] uppercase">FFT Window Function:</label>
              <select
                value={fftWindow}
                onChange={(e) => setFftWindow(e.target.value)}
                className="bg-[#0a0e18] border border-[#313540] rounded px-3 py-2 text-[#dfe2f1] focus:border-[#4cd7f6] outline-none"
              >
                <option value="Blackman-Harris">Blackman-Harris 7-Term (Dynamic Range &gt; 92 dB)</option>
                <option value="Hamming">Hamming (Sharp Main Lobe)</option>
                <option value="Hann">Hann (Standard Smooth)</option>
                <option value="Flat-Top">Flat-Top (Exact Amplitude Calibration)</option>
              </select>
            </div>

            <div className="bg-[#0a0e18] p-3.5 rounded border border-[#262a35] flex flex-col gap-2">
              <div className="flex items-center justify-between text-[#869397]">
                <span>Inference Model Engine:</span>
                <span className="text-[#4edea3] font-bold">TensorRT INT8 GPU Accelerated</span>
              </div>
              <div className="flex items-center justify-between text-[#869397]">
                <span>Costas Loop Slicer:</span>
                <span className="text-[#dfe2f1]">Gray-Coded QPSK / BPSK Auto-Switch</span>
              </div>
              <div className="flex items-center justify-between text-[#869397]">
                <span>Viterbi Traceback Method:</span>
                <span className="text-[#4cd7f6]">Soft-Decision Euclidean Distance</span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#1c1f2a] border border-[#313540] text-[#bcc9cd] text-[11px] leading-relaxed">
              System running in tactical real-time mode. All 5 DSP pipeline stages execute concurrently in asynchronous SIMD worker threads with zero buffer dropouts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
