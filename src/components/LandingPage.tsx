import React, { useState, useRef } from 'react';
import { SignalProfile, NavigationTab } from '../types';
import {
  Radio,
  UploadCloud,
  Cpu,
  Layers,
  Activity,
  Binary,
  ScanLine,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2,
  HardDrive,
  FileText,
  Sparkles,
  Terminal,
  Server,
  Play,
  Check,
  ChevronRight,
  Sliders,
  HelpCircle,
} from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: (tab?: NavigationTab) => void;
  onFileUpload: (file: File) => void;
  activeSignal: SignalProfile;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onFileUpload,
  activeSignal,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [quickUploadStatus, setQuickUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deployed production URL calculation
  const deployedUrl =
    (import.meta as any).env?.VITE_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://github.com/iparayush/SignalLens-AI-');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setQuickUploadStatus(`Loaded ${file.name}. Initializing DSP pipeline...`);
      onFileUpload(file);
      setTimeout(() => onLaunchApp('dashboard'), 300);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setQuickUploadStatus(`Loaded ${file.name}. Initializing DSP pipeline...`);
      onFileUpload(file);
      setTimeout(() => onLaunchApp('dashboard'), 300);
    }
  };

  const handleOpenWebsite = () => {
    window.open(deployedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#e2e8f0] selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      {/* ─── 4. NAVIGATION BAR (Fixed Top Navigation) ─────────────────────────── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#070b14]/85 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.35)] group-hover:border-cyan-400 transition-colors">
              {/* Minimal Waveform / Pulse Icon */}
              <svg className="w-6 h-6 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12h2l2-7 3 14 3-10 2 6 2-3h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5 font-headline">
                SignalLens <span className="text-cyan-400 font-extrabold">AI</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 tracking-wider">
                Automated Signal Analysis Platform
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-300">
            <a href="#hero" className="text-cyan-400 font-semibold transition-colors hover:text-cyan-300">
              Home
            </a>
            <a href="#capabilities" className="hover:text-cyan-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
              How It Works
            </a>
            <a href="#use-cases" className="hover:text-cyan-400 transition-colors">
              Use Cases
            </a>
            <a href="#pipeline" className="hover:text-cyan-400 transition-colors">
              Technology
            </a>
            <a href="#workspace-preview" className="hover:text-cyan-400 transition-colors">
              Workspace
            </a>
            <a href="#cta" className="hover:text-cyan-400 transition-colors">
              Contact
            </a>
          </nav>

          {/* Right Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onLaunchApp('upload-signal')}
              className="relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-xl hover:from-cyan-400 hover:to-purple-500 shadow-[0_0_25px_rgba(6,182,212,0.45)] active:scale-95 group"
            >
              <span>Try Now</span>
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── 5. HERO SECTION (50/50 Two-Column Layout) ────────────────────────── */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-grid-pattern" id="hero">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-24 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* 9. Radio telescope / signal-receiving station silhouette visual */}
        <div className="absolute bottom-2 left-6 opacity-15 pointer-events-none hidden xl:block select-none">
          <svg className="w-72 h-72 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 100 100">
            <ellipse cx="40" cy="38" rx="32" ry="18" strokeDasharray="2 2" transform="rotate(-30 40 38)" />
            <path d="M 40 38 L 80 85" strokeWidth="2" />
            <path d="M 70 85 L 90 85" strokeWidth="3" />
            <line x1="24" x2="36" y1="18" y2="34" />
            <circle cx="24" cy="18" fill="currentColor" r="2.5" />
            <circle cx="80" cy="85" fill="currentColor" r="2" />
            <path d="M 20 85 L 35 60 L 50 85" strokeWidth="1" strokeDasharray="1 1" />
          </svg>
          <span className="block text-[10px] tracking-widest font-mono text-cyan-400/80 -mt-4 pl-2">
            SIGINT INTERCEPT STATION // PS-26147
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Copy & CTAs */}
            <div className="lg:col-span-5 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Next-Gen Signal Intelligence</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.1] font-headline text-white">
                Turn Raw Signals <br />
                Into <span className="text-gradient-cyan-purple">Real Insights</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
                An AI-powered platform for automated analysis of <code className="text-cyan-300 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">.IQ</code> and <code className="text-cyan-300 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">.wav</code> files with signal parameter extraction, demodulation, decoding and bit-stream analysis.
              </p>

              {/* 6. Primary CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  onClick={() => onLaunchApp('upload-signal')}
                  className="px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2.5 active:scale-95 group font-headline"
                >
                  <span>Try Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>


              </div>

              {/* Interactive In-Hero Quick Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-3.5 rounded-xl border border-dashed transition-all cursor-pointer flex items-center gap-3 ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/40'
                    : 'border-slate-800 bg-[#090e1c]/70 hover:border-slate-700 hover:bg-[#0c1326]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  accept=".iq,.wav,.bin,.raw,.dat"
                  className="hidden"
                />
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-slate-300 truncate">
                    {quickUploadStatus || 'Quick Drop .IQ / .WAV file here to start'}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">
                    Supports HackRF, RTL-SDR, USRP, Float32 &amp; PCM WAV
                  </p>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 underline font-semibold shrink-0">
                  Browse
                </span>
              </div>

              {/* 7. Feature Strip */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Upload .IQ / .WAV</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Signal Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Decode &amp; Extract</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Visualize &amp; Explore</span>
                </div>
              </div>
            </div>

            {/* 8. Hero Visual: High-Fidelity SignalLens AI Analysis Dashboard */}
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl p-1 bg-gradient-to-b from-cyan-500/30 via-slate-800/40 to-purple-600/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] glow-cyan">
                {/* Inner Application Frame */}
                <div className="rounded-[14px] bg-[#080d19] border border-slate-800 text-slate-200 overflow-hidden text-xs">
                  {/* Dashboard Topbar */}
                  <div className="px-4 py-3 bg-[#0a1122] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/40">
                          SL
                        </div>
                        <span className="font-semibold text-slate-200 text-xs font-headline">SignalLens AI</span>
                      </div>
                      <div className="h-4 w-px bg-slate-700" />
                      <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700 text-slate-300 font-mono text-[11px]">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{activeSignal.filename}</span>
                        <span className="text-slate-500">• {activeSignal.sizeFormatted}</span>
                      </div>
                    </div>

                    {/* Metadata Readout */}
                    <div className="flex items-center gap-4 text-[11px] font-mono">
                      <div className="text-slate-400">
                        Fs: <span className="text-cyan-400 font-bold">{activeSignal.fsFormatted}</span>
                      </div>
                      <div className="text-slate-400">
                        Fc: <span className="text-purple-400 font-bold">{activeSignal.fcFormatted}</span>
                      </div>
                      <button
                        onClick={() => onLaunchApp('dashboard')}
                        className="bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 px-2.5 py-1 rounded border border-cyan-500/40 flex items-center gap-1.5 transition font-mono"
                      >
                        <Play className="w-3 h-3 text-cyan-400" />
                        <span>Open Live</span>
                      </button>
                    </div>
                  </div>

                  {/* 3-Panel Multi-Domain Signals Grid */}
                  <div className="p-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#080d19]">
                    {/* Panel 1: Time Domain (I/Q) */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mb-1">
                        <span className="text-cyan-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          Time Domain (I/Q)
                        </span>
                        <span>{activeSignal.durFormatted}</span>
                      </div>
                      <div className="h-24 w-full bg-slate-950 rounded flex items-center overflow-hidden border border-slate-800/60 relative">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 80">
                          <path
                            d="M0,40 Q10,15 20,40 T40,40 T60,10 T80,70 T100,20 T120,60 T140,30 T160,50 T180,20 T200,40"
                            fill="none"
                            stroke="#00f2fe"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M0,40 Q15,65 30,40 T60,40 T90,75 T110,25 T130,55 T150,15 T170,65 T190,30 T200,40"
                            fill="none"
                            stroke="#38bdf8"
                            strokeOpacity="0.5"
                            strokeWidth="1"
                          />
                        </svg>
                        <span className="absolute bottom-1 right-2 text-[9px] font-mono text-cyan-400/80">
                          Amp: ±1.0
                        </span>
                      </div>
                    </div>

                    {/* Panel 2: Frequency Spectrum FFT */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mb-1">
                        <span className="text-purple-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          Frequency Spectrum
                        </span>
                        <span>FFT 2048</span>
                      </div>
                      <div className="h-24 w-full bg-slate-950 rounded flex items-center overflow-hidden border border-slate-800/60 relative">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 80">
                          <polygon
                            fill="rgba(147, 51, 234, 0.25)"
                            points="0,78 60,75 85,60 95,20 100,10 105,20 115,60 140,75 200,78"
                          />
                          <polyline
                            fill="none"
                            points="0,78 60,75 85,60 95,20 100,10 105,20 115,60 140,75 200,78"
                            stroke="#c084fc"
                            strokeWidth="1.8"
                          />
                          <line stroke="#00f2fe" strokeDasharray="2 2" strokeWidth="1" x1="100" x2="100" y1="0" y2="80" />
                        </svg>
                        <span className="absolute top-1 left-2 text-[9px] font-mono text-purple-300">
                          BW: 1.20 MHz
                        </span>
                      </div>
                    </div>

                    {/* Panel 3: Waterfall Spectrogram */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mb-1">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Waterfall Spectrogram
                        </span>
                        <span>Power (dB)</span>
                      </div>
                      <div className="h-24 w-full rounded overflow-hidden border border-slate-800/60 bg-gradient-to-b from-blue-950 via-cyan-950 to-slate-950 relative flex items-center justify-center">
                        <div className="w-12 h-full bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent blur-[3px]" />
                        <div className="w-4 h-full bg-yellow-300/70 blur-[2px]" />
                        <span className="absolute bottom-1 left-2 text-[9px] font-mono text-emerald-300">
                          -100 to 0 dBm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lower Dashboard Split: Constellation + Parameter Table */}
                  <div className="px-3.5 pb-3.5 grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Constellation Diagram (QPSK with 4 clusters) */}
                    <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col">
                      <div className="flex justify-between items-center text-[11px] font-mono mb-2">
                        <span className="text-slate-300 font-semibold">Constellation Diagram</span>
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold">
                          QPSK
                        </span>
                      </div>
                      <div className="h-32 bg-slate-950 rounded border border-slate-800/80 flex items-center justify-center relative overflow-hidden">
                        {/* Crosshairs */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-full h-[1px] bg-slate-800" />
                          <div className="h-full w-[1px] bg-slate-800 absolute" />
                        </div>
                        {/* 4 QPSK Scatter Clusters */}
                        <div className="absolute top-6 left-12 w-4 h-4 bg-cyan-400 rounded-full blur-[3px] opacity-80 animate-pulse" />
                        <div className="absolute top-7 left-14 w-2 h-2 bg-white rounded-full" />
                        <div className="absolute top-6 right-12 w-4 h-4 bg-cyan-400 rounded-full blur-[3px] opacity-80 animate-pulse" />
                        <div className="absolute top-8 right-14 w-2 h-2 bg-white rounded-full" />
                        <div className="absolute bottom-6 left-12 w-4 h-4 bg-cyan-400 rounded-full blur-[3px] opacity-80 animate-pulse" />
                        <div className="absolute bottom-8 left-14 w-2 h-2 bg-white rounded-full" />
                        <div className="absolute bottom-6 right-12 w-4 h-4 bg-cyan-400 rounded-full blur-[3px] opacity-80 animate-pulse" />
                        <div className="absolute bottom-7 right-14 w-2 h-2 bg-white rounded-full" />
                        <div className="absolute bottom-1 right-2 text-[10px] font-mono text-emerald-400 font-bold">
                          Confidence: 94.2%
                        </div>
                      </div>
                    </div>

                    {/* Automatic Parameter Detection Table */}
                    <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-2 pb-1 border-b border-slate-800">
                        <span className="font-semibold text-slate-300">Automatic Parameter Detection</span>
                        <span className="text-slate-500 font-normal">Auto-Synced</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-[11px]">
                          <thead>
                            <tr className="text-slate-500 border-b border-slate-800">
                              <th className="pb-1 font-medium">Parameter</th>
                              <th className="pb-1 font-medium">Detected Value</th>
                              <th className="pb-1 font-medium text-right">Confidence</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            <tr>
                              <td className="py-1 text-slate-400">Modulation</td>
                              <td className="py-1 text-cyan-300 font-semibold">QPSK</td>
                              <td className="py-1 text-right text-emerald-400 font-bold">94.2%</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-slate-400">Sampling Frequency</td>
                              <td className="py-1 text-slate-200">2.400 MHz</td>
                              <td className="py-1 text-right text-emerald-400">91.7%</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-slate-400">Symbol Rate</td>
                              <td className="py-1 text-slate-200">600.0 kSps</td>
                              <td className="py-1 text-right text-emerald-400">87.3%</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-slate-400">Bandwidth (BW)</td>
                              <td className="py-1 text-slate-200">1.200 MHz</td>
                              <td className="py-1 text-right text-emerald-400">89.1%</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-slate-400">FEC Scheme</td>
                              <td className="py-1 text-slate-200">Convolutional (1/2)</td>
                              <td className="py-1 text-right text-emerald-400">76.4%</td>
                            </tr>
                            <tr>
                              <td className="py-1 text-slate-400">Interleaving</td>
                              <td className="py-1 text-slate-200">Block Interleaving</td>
                              <td className="py-1 text-right text-emerald-400">72.8%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Connected Decode Pipeline Bottom Ribbon */}
                  <div className="px-4 py-2.5 bg-[#050913] border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                    <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      Decode Pipeline:
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-3 text-slate-300">
                      <div className="flex items-center gap-1 text-cyan-400">
                        <span>1. Demodulation</span>
                        <span className="text-xs text-emerald-400">✓</span>
                      </div>
                      <span className="text-slate-600">→</span>
                      <div className="flex items-center gap-1 text-cyan-400">
                        <span>2. De-interleave</span>
                        <span className="text-xs text-emerald-400">✓</span>
                      </div>
                      <span className="text-slate-600">→</span>
                      <div className="flex items-center gap-1 text-cyan-400">
                        <span>3. FEC Decode</span>
                        <span className="text-xs text-emerald-400">✓</span>
                      </div>
                      <span className="text-slate-600">→</span>
                      <div className="flex items-center gap-1 text-cyan-400">
                        <span>4. Bit Stream</span>
                        <span className="text-xs text-emerald-400">✓</span>
                      </div>
                      <span className="text-slate-600">→</span>
                      <div className="flex items-center gap-1 text-cyan-400">
                        <span>5. Correlation</span>
                        <span className="text-xs text-emerald-400">✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. TRUST / CAPABILITY STRIP (5 Items) ───────────────────────────── */}
      <section className="border-y border-slate-800 bg-[#070c17]/70 py-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center md:text-left">
            {/* Metric 1 */}
            <div className="flex items-center space-x-3.5 p-3 rounded-xl hover:bg-slate-800/30 transition">
              <div className="w-11 h-11 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white font-mono">.IQ / .WAV</div>
                <div className="text-xs text-slate-400">Supported Formats</div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center space-x-3.5 p-3 rounded-xl hover:bg-slate-800/30 transition">
              <div className="w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white font-mono">Real-time</div>
                <div className="text-xs text-slate-400">Signal Analysis</div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center space-x-3.5 p-3 rounded-xl hover:bg-slate-800/30 transition">
              <div className="w-11 h-11 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white font-mono">AI Powered</div>
                <div className="text-xs text-slate-400">Parameter Detection</div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="flex items-center space-x-3.5 p-3 rounded-xl hover:bg-slate-800/30 transition">
              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white font-mono">High Accuracy</div>
                <div className="text-xs text-slate-400">Trusted Results</div>
              </div>
            </div>

            {/* Metric 5 */}
            <div className="flex items-center space-x-3.5 p-3 rounded-xl hover:bg-slate-800/30 transition col-span-2 md:col-span-1 justify-center md:justify-start">
              <div className="w-11 h-11 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white font-mono">Secure &amp; Local</div>
                <div className="text-xs text-slate-400">Your Data Stays Yours</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. HOW IT WORKS (From Raw Signal to Insight - 5 Connected Steps) ─── */}
      <section className="py-24 relative overflow-hidden bg-[#050811]" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3.5 py-1.5 rounded-full">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight font-headline">
              From Raw Signal to Insight
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              A complete automated workflow for signal analysis, parameter extraction, and bit-level reverse engineering.
            </p>
          </div>

          {/* 5-Step Connected Pipeline Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {/* Step 01 */}
            <div className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-cyan-500/50 hover:bg-slate-900 transition group">
              <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="mt-4 font-mono text-xs text-cyan-400 font-bold">01 — Upload</span>
              <h3 className="text-base font-semibold text-white mt-1">.IQ / .WAV File</h3>
              <p className="text-xs text-slate-400 mt-2">
                Drag and drop raw captures from SDRs like HackRF, RTL-SDR, USRP, or audio wav.
              </p>
            </div>

            {/* Step 02 */}
            <div className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-blue-500/50 hover:bg-slate-900 transition group">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition">
                <Activity className="w-6 h-6" />
              </div>
              <span className="mt-4 font-mono text-xs text-blue-400 font-bold">02 — Analyze</span>
              <h3 className="text-base font-semibold text-white mt-1">Signal Processing</h3>
              <p className="text-xs text-slate-400 mt-2">
                Instant FFT computation, spectrogram waterfall generation, PSD, and filtering.
              </p>
            </div>

            {/* Step 03 */}
            <div className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-purple-500/50 hover:bg-slate-900 transition group">
              <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="mt-4 font-mono text-xs text-purple-400 font-bold">03 — Detect</span>
              <h3 className="text-base font-semibold text-white mt-1">AI Parameter Est.</h3>
              <p className="text-xs text-slate-400 mt-2">
                Cumulant and neural classifiers estimate modulation, symbol rate, bandwidth, and SNR.
              </p>
            </div>

            {/* Step 04 */}
            <div className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-emerald-500/50 hover:bg-slate-900 transition group">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition">
                <Radio className="w-6 h-6" />
              </div>
              <span className="mt-4 font-mono text-xs text-emerald-400 font-bold">04 — Decode</span>
              <h3 className="text-base font-semibold text-white mt-1">Demod &amp; FEC</h3>
              <p className="text-xs text-slate-400 mt-2">
                Costas loop carrier recovery, symbol decision, de-interleaving, and forward error correction.
              </p>
            </div>

            {/* Step 05 */}
            <div className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-teal-500/50 hover:bg-slate-900 transition group">
              <div className="w-14 h-14 rounded-full bg-teal-500/10 border border-teal-500/40 flex items-center justify-center text-teal-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition">
                <Binary className="w-6 h-6" />
              </div>
              <span className="mt-4 font-mono text-xs text-teal-400 font-bold">05 — Explore</span>
              <h3 className="text-base font-semibold text-white mt-1">Bit-stream &amp; Corr.</h3>
              <p className="text-xs text-slate-400 mt-2">
                Sliding correlation, sync preamble matching, frame boundary detection, and report export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 12. PLATFORM CAPABILITIES (6 Cards) ─────────────────────────────── */}
      <section className="py-20 bg-[#060a14] relative" id="capabilities">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-cyan-400 font-mono text-xs tracking-widest uppercase">
                PLATFORM CAPABILITIES
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 font-headline">
                Everything You Need for Signal Analysis
              </h2>
            </div>
            <p className="text-slate-400 text-sm max-w-md mt-2 md:mt-0">
              An enterprise-grade engineering suite built for RF intelligence, electronic defense, and SDR protocol reverse engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 01 */}
            <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition group">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition">
                <span className="font-mono font-bold text-sm">01</span>
              </div>
              <h3 className="text-lg font-semibold text-white font-headline">Signal Visualization</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Interactive multi-domain visualizations including In-Phase/Quadrature time domain, FFT Power Spectrum, Spectrogram Heatmaps, and constellation clustering.
              </p>
            </div>

            {/* Card 02 */}
            <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition group">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition">
                <span className="font-mono font-bold text-sm">02</span>
              </div>
              <h3 className="text-lg font-semibold text-white font-headline">AI Parameter Detection</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Automatically estimate carrier frequency offset, symbol rate, active bandwidth, and SNR using higher-order cumulant features and softmax models.
              </p>
            </div>

            {/* Card 03 */}
            <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition group">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition">
                <span className="font-mono font-bold text-sm">03</span>
              </div>
              <h3 className="text-lg font-semibold text-white font-headline">Modulation Analysis</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Deep analysis supporting FSK (2FSK, 4FSK), PSK (BPSK, QPSK, 8PSK), and QAM (16QAM, 64QAM) with Costas loop carrier lock and EVM evaluation.
              </p>
            </div>

            {/* Card 04 */}
            <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition group">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition">
                <span className="font-mono font-bold text-sm">04</span>
              </div>
              <h3 className="text-lg font-semibold text-white font-headline">De-interleaving</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Reconstruct interleaved data patterns with support for Block, Convolutional, Diagonal, and Pseudo-Random matrix dispersal de-scrambling.
              </p>
            </div>

            {/* Card 05 */}
            <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition group">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition">
                <span className="font-mono font-bold text-sm">05</span>
              </div>
              <h3 className="text-lg font-semibold text-white font-headline">FEC Processing</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                High-performance forward error correction including Viterbi hard/soft decoding, Reed-Solomon RS(255, 223/239), concatenated schemes, and LDPC.
              </p>
            </div>

            {/* Card 06 */}
            <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition group">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition">
                <span className="font-mono font-bold text-sm">06</span>
              </div>
              <h3 className="text-lg font-semibold text-white font-headline">Bit Stream Correlation</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Cross-correlation search for known synchronization preambles, Barker sequences, frame headers, CRC validation, and hex payload inspection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 13. ANALYSIS PREVIEW (Signal Analysis Workspace) ────────────────── */}
      <section className="py-20 bg-[#070c17] border-t border-slate-800 relative" id="workspace-preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-headline">
                  Signal Analysis Workspace
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-mono text-emerald-400 font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ANALYSIS COMPLETE
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Full telemetry and multi-stage decoding results from active capture.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onLaunchApp('dashboard')}
                className="px-4 py-2 text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 rounded-lg hover:bg-cyan-900/40 transition flex items-center gap-1.5"
              >
                <span>Launch Full Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Realistic Workspace Deck Preview */}
          <div className="bg-[#0b1220] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
            {/* Upper Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl">
                <span className="text-slate-500 block text-[10px]">FILE NAME</span>
                <span className="text-slate-200 font-semibold truncate block mt-0.5">{activeSignal.filename}</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl">
                <span className="text-slate-500 block text-[10px]">MODULATION</span>
                <span className="text-cyan-400 font-bold block mt-0.5">{activeSignal.telemetry.modulation}</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl">
                <span className="text-slate-500 block text-[10px]">ESTIMATED SNR</span>
                <span className="text-emerald-400 font-bold block mt-0.5">+{activeSignal.telemetry.estimatedSnrDb.toFixed(1)} dB</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl">
                <span className="text-slate-500 block text-[10px]">SYMBOL RATE</span>
                <span className="text-slate-200 font-semibold block mt-0.5">{(activeSignal.telemetry.symbolRateHz / 1e3).toFixed(1)} kSps</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl">
                <span className="text-slate-500 block text-[10px]">CARRIER STATUS</span>
                <span className="text-emerald-400 font-semibold block mt-0.5">LOCKED (Costas)</span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl">
                <span className="text-slate-500 block text-[10px]">OVERALL CONFIDENCE</span>
                <span className="text-cyan-300 font-bold block mt-0.5">{activeSignal.telemetry.overallConfidence.toFixed(1)}%</span>
              </div>
            </div>

            {/* Bit Stream Hex Dump Snippet */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-slate-400">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Decoded Frame Bit Stream (Hex &amp; ASCII)
                </span>
                <span className="text-slate-500">Preamble: {activeSignal.correlation.patternName} (Sync Match)</span>
              </div>
              <div className="space-y-1">
                {activeSignal.bitstreamLines.slice(0, 4).map((line, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-[11px] font-mono">
                    <span className="text-slate-500 shrink-0">{line.offset}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {line.hexBytes.map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className={
                            line.highlightCategory === 'header'
                              ? 'text-cyan-400 font-bold'
                              : 'text-slate-300'
                          }
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                    <span className="text-slate-400 shrink-0 ml-auto border-l border-slate-800 pl-3">
                      {line.ascii}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 14. PROCESSING PIPELINE (Visually Impressive Horizontal Pipeline) ── */}
      <section className="py-20 bg-[#050811] relative overflow-hidden" id="pipeline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest font-mono text-purple-400 bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-full">
              PIPELINE ARCHITECTURE
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-4 font-headline">
              End-to-End Autonomous DSP Pipeline
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              Modular pipeline executing automated stage gating, error mitigation, and bit recovery.
            </p>
          </div>

          {/* Horizontal Interactive Chain */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 overflow-x-auto mb-8 shadow-xl">
            <div className="flex items-center justify-between min-w-[900px] text-xs font-mono text-slate-300">
              <div className="px-3 py-2 rounded-lg bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 text-center">
                <span className="block text-[10px] text-slate-400">INPUT</span>
                <span className="font-bold">RAW SIGNAL</span>
              </div>
              <span className="text-cyan-400 font-bold animate-pulse">→</span>
              <div className="px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                <span className="block text-[10px] text-slate-400">STAGE 01</span>
                <span>PREPROCESSING</span>
              </div>
              <span className="text-cyan-400 font-bold animate-pulse">→</span>
              <div className="px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                <span className="block text-[10px] text-slate-400">STAGE 02</span>
                <span>FEATURE EXTRACT</span>
              </div>
              <span className="text-cyan-400 font-bold animate-pulse">→</span>
              <div className="px-3 py-2 rounded-lg bg-purple-900/40 text-purple-300 border border-purple-500/40 text-center">
                <span className="block text-[10px] text-purple-300">STAGE 03</span>
                <span className="font-bold">AI DETECTION</span>
              </div>
              <span className="text-cyan-400 font-bold animate-pulse">→</span>
              <div className="px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                <span className="block text-[10px] text-slate-400">STAGE 04</span>
                <span>DEMODULATION</span>
              </div>
              <span className="text-cyan-400 font-bold animate-pulse">→</span>
              <div className="px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                <span className="block text-[10px] text-slate-400">STAGE 05</span>
                <span>DE-INTERLEAVING</span>
              </div>
              <span className="text-cyan-400 font-bold animate-pulse">→</span>
              <div className="px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                <span className="block text-[10px] text-slate-400">STAGE 06</span>
                <span>FEC DECODING</span>
              </div>
              <span className="text-cyan-400 font-bold animate-pulse">→</span>
              <div className="px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
                <span className="block text-[10px] text-slate-400">STAGE 07</span>
                <span>BIT STREAM</span>
              </div>
              <span className="text-cyan-400 font-bold animate-pulse">→</span>
              <div className="px-3 py-2 rounded-lg bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 text-center">
                <span className="block text-[10px] text-emerald-400">STAGE 08</span>
                <span className="font-bold">CORRELATION</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 15. TECHNOLOGY SECTION (Built for Signal Processing) ─────────────── */}
      <section className="py-20 bg-[#060a14] border-t border-slate-800 relative" id="technology">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
            BUILT FOR SIGNAL PROCESSING
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-4 font-headline">
            Production Engineering &amp; High-Throughput DSP
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl mx-auto">
            Combining real-time client-side SIMD execution, scientific Python packages, and robust ML classifiers.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-12">
            {[
              { name: 'Python', role: 'DSP Modeling & ML Runtimes' },
              { name: 'GNU Radio', role: 'Flowgraph Standards' },
              { name: 'NumPy', role: 'Vectorized Math' },
              { name: 'SciPy', role: 'Filter Design & Spectral' },
              { name: 'scikit-learn', role: 'Cumulant Classifiers' },
              { name: 'PyTorch', role: 'Deep Learning AMC' },
              { name: 'React', role: 'Reactive Architecture' },
              { name: 'TypeScript', role: 'Type-Safe DSP Pipeline' },
              { name: 'FastAPI', role: 'High-Speed Microservices' },
              { name: 'WebAudio / SIMD', role: 'Real-Time In-Browser DSP' },
            ].map((tech) => (
              <div
                key={tech.name}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition group text-left"
              >
                <div className="font-mono font-bold text-white text-base group-hover:text-cyan-400 transition">
                  {tech.name}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">{tech.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── USE CASES & NTRO PS 26147 SECTION ────────────────────────────────── */}
      <section className="py-20 bg-[#050811] border-t border-slate-800" id="use-cases">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
              MISSION CAPABILITIES
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-4 font-headline">
              Engineered for Critical Intercept &amp; Spectrum Analysis
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              Directly aligned with <strong className="text-slate-200">Problem Statement 26147</strong>: Automated model for analysis of .IQ and .wav files along with signal parameter extraction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-[#0a101d] border border-slate-800">
              <div className="text-cyan-400 font-mono text-xs font-bold mb-2">01 // SIGINT</div>
              <h3 className="text-base font-bold text-white">Electronic Intelligence</h3>
              <p className="text-xs text-slate-400 mt-2">
                Automated modulation classification and RF parameter extraction on non-cooperative emissions.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0a101d] border border-slate-800">
              <div className="text-cyan-400 font-mono text-xs font-bold mb-2">02 // SATCOM</div>
              <h3 className="text-base font-bold text-white">Satellite Downlinks</h3>
              <p className="text-xs text-slate-400 mt-2">
                CCSDS preamble correlation, convolutional Viterbi decoding, and frame sync detection.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0a101d] border border-slate-800">
              <div className="text-cyan-400 font-mono text-xs font-bold mb-2">03 // SPECTRUM</div>
              <h3 className="text-base font-bold text-white">Spectrum Monitoring</h3>
              <p className="text-xs text-slate-400 mt-2">
                Wideband survey, carrier frequency offset tracking, and automated bandwidth measurement.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0a101d] border border-slate-800">
              <div className="text-cyan-400 font-mono text-xs font-bold mb-2">04 // PROTOCOLS</div>
              <h3 className="text-base font-bold text-white">Protocol Reverse Eng.</h3>
              <p className="text-xs text-slate-400 mt-2">
                De-interleaving matrix reconstruction, FEC polynomial identification, and bit slicing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 16. CTA SECTION (Ready to Analyze Your Signal?) ──────────────────── */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#050811] to-[#080e1e] border-t border-slate-800" id="cta">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono text-cyan-400 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Intelligent Analysis</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-headline">
            Ready to Analyze Your Signal?
          </h2>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
            Upload an IQ or WAV recording and explore the signal through an automated analysis workflow.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onLaunchApp('upload-signal')}
              className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-xl hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2.5 font-headline active:scale-95"
            >
              <span>Try Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => onLaunchApp('dashboard')}
              className="px-7 py-4 text-base font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-xl transition font-headline active:scale-95"
            >
              Explore Platform
            </button>
          </div>
        </div>
      </section>

      {/* ─── 17. FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#03060c] border-t border-slate-800/80 py-12 text-sm text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-cyan-500/40 flex items-center justify-center">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12h2l2-7 3 14 3-10 2 6 2-3h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-xs text-left">
              <div className="font-bold text-slate-300 font-headline">
                SignalLens <span className="text-cyan-400">AI</span>
              </div>
              <div className="text-slate-400">Automated Signal Analysis Platform</div>
              <div className="text-slate-600 mt-0.5">Decode Signals. Discover What Matters.</div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
            <a href="#hero" className="hover:text-cyan-400 transition">
              Home
            </a>
            <a href="#capabilities" className="hover:text-cyan-400 transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition">
              How It Works
            </a>
            <a href="#technology" className="hover:text-cyan-400 transition">
              Technology
            </a>
            <a href="#cta" className="hover:text-cyan-400 transition">
              Contact
            </a>
          </div>

          {/* Engine Status & Copyright */}
          <div className="flex flex-col md:items-end text-xs text-slate-500 font-mono gap-1 text-center md:text-right">
            <div className="flex items-center gap-2 justify-center md:justify-end text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>DSP Engine: Online</span>
            </div>
            <div>© 2026 SignalLens AI. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
