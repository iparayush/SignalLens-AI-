<div align="center">

<img src="https://img.shields.io/badge/Smart%20India%20Hackathon-2026-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOCA0IDgtNE0yIDEybDggNCA4LTQiLz48L3N2Zz4=" alt="SIH 2026"/>
<img src="https://img.shields.io/badge/Problem%20Statement-PS%2026147-orange?style=for-the-badge" alt="PS 26147"/>
<img src="https://img.shields.io/badge/Stack-TypeScript%20%7C%20React%20%7C%20DSP-cyan?style=for-the-badge" alt="Stack"/>
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>

# 📡 SignalLens AI

### Automated Signal Analysis & Parameter Extraction Platform

**Smart India Hackathon 2026 — Problem Statement PS 26147**

*Automated model for analysis of `.IQ` and `.WAV` files with signal parameter extraction*

---

</div>

## 📋 Problem Statement

**PS 26147** — Design and implement an automated model for analysis of `.IQ` and `.WAV` signal files. The system should be capable of:

- Automated ingestion and validation of IQ/WAV recordings
- Extraction of key signal parameters (center frequency, bandwidth, SNR, signal power)
- Modulation classification (FSK, PSK, QAM families)
- Demodulation and bit-stream recovery
- De-interleaving and FEC decoding
- Automated report generation

---

## 🧠 About the Project

**SignalLens AI** is a browser-based signal analysis platform that helps engineers and researchers analyze IQ/WAV recordings and extract important signal parameters — without needing specialized RF hardware or software during the exploration phase.

It combines **classical Digital Signal Processing (DSP)** with **ML-based modulation classification** into a unified GUI workflow, producing structured analysis reports at the end.

> **Note:** This is a prototype developed for SIH 2026. Use only synthetic, public-domain, or duly-authorized signal recordings for development and testing.

---

## 🎯 Key Features

| Feature | Description |
|---|---|
| 📁 **IQ / WAV Upload** | Drag-and-drop file upload with format validation |
| 📈 **Waveform View** | Time-domain amplitude visualization |
| 📊 **Spectrum / PSD** | FFT-based frequency and power spectral density analysis |
| 🌊 **Waterfall / Spectrogram** | Time-frequency spectrogram with heatmap coloring |
| 🎯 **Constellation View** | I/Q scatter plot for modulation visualization |
| 🔬 **Parameter Detection** | Auto-extraction of center freq, bandwidth, SNR, power |
| 🤖 **Modulation Classification** | ML-based classification (BPSK, QPSK, 8-PSK, FSK, QAM) |
| 📡 **Demodulation** | FSK / PSK / QAM demodulation pipeline |
| 🔀 **De-interleaving** | Symbol de-interleaving stage |
| ✅ **FEC Decoding** | Forward error correction (Viterbi/Hamming) |
| 🔗 **Bit-Stream Correlation** | Bit-stream cross-correlation analysis |
| 📄 **Report Generation** | Downloadable PDF analysis report |

---

## 🖥️ Dashboard

![SignalLens AI Dashboard — 4-quadrant view with waveform, spectrum, waterfall and constellation](docs/images/dashboard.jpg)

*The main dashboard shows Time Domain, Frequency Spectrum, Waterfall Spectrogram, and Constellation Diagram in a 4-quadrant layout.*

---

## ⚙️ How It Works

The signal processing pipeline follows these stages:

```
📂 Upload IQ/WAV File
        │
        ▼
🛡️  File Validation & Parsing
        │
        ▼
⚙️  Preprocessing & Conditioning
        │
        ▼
📊  Signal Analysis Engine (FFT, PSD, Spectrogram)
        │
        ▼
🔍  Parameter Detection (Freq, BW, SNR, Power)
        │
        ▼
🤖  Modulation Classification (ML)
        │
        ▼
📡  Demodulation (FSK / PSK / QAM)
        │
        ▼
🔀  De-interleaving
        │
        ▼
✅  FEC Decoding
        │
        ▼
🔗  Bit-Stream Analysis & Correlation
        │
        ▼
📄  Report Generation
```

### Workflow Diagram

![Illustrative signal processing workflow from file upload through to report generation](docs/diagrams/workflow.jpg)

---

## 🏗️ System Architecture

![System architecture showing GUI layer, signal processing core, ML engine, and data sources](docs/diagrams/architecture.jpg)

The system is organized into four layers:

| Layer | Components |
|---|---|
| **UI Layer** | File Upload, Visualization Engine, Report Generator |
| **Processing Core** | Time Domain, Frequency Domain, Parameter Extraction, Modulation Detection, Demodulation, FEC |
| **Post-processing** | De-interleaver, Bit-Stream Correlator |
| **ML Engine** | Modulation Classifier (PyTorch / scikit-learn) |

---

## 🔧 DSP Pipeline

![Horizontal DSP pipeline showing data transformation from raw IQ samples to final report](docs/diagrams/pipeline.jpg)

The processing pipeline transforms data through these stages:

```
Raw Samples → Cleaned Samples → Frequency Data → Parameters → Modulation Type → Decoded Bits → Report
```

---

## 📊 Visualizations

### Waveform & Frequency Spectrum

![Time domain waveform and power spectral density side by side](docs/images/waveform_spectrum.jpg)

> ⚠️ **Illustrative — Not real measurement data.** Charts shown are for demonstration purposes only.

| Chart | What it Shows |
|---|---|
| **Time Domain** | Signal amplitude over time, reveals waveform shape |
| **Frequency Spectrum / PSD** | Power distribution over frequency, reveals center frequency and bandwidth |

---

### Waterfall & Constellation

![Waterfall spectrogram and QPSK constellation diagram side by side](docs/images/waterfall_constellation.jpg)

> ⚠️ **Illustrative — Not real measurement data.**

| Chart | What it Shows |
|---|---|
| **Waterfall Plot** | How signal frequency changes over time (good for spotting frequency-hopping or drift) |
| **Constellation Diagram** | I/Q symbol scatter — reveals modulation type from cluster pattern |

---

### Analysis Report

![Sample analysis report showing file info, signal parameters, modulation classification, and demodulation results](docs/images/report.jpg)

The generated report includes:
- File metadata
- Detected signal parameters
- Modulation classification with confidence
- Demodulation results
- FEC decoding status

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| **Frontend Framework** | React 18, TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS |
| **DSP Engine** | Custom TypeScript DSP library (`src/lib/dsp/`) |
| **Signal Processing** | FFT, PSD, Spectrogram, Correlator, FEC, Demodulator |
| **ML Classification** | Rule-based + statistical classifier (`src/lib/ml/`) |
| **File Parsing** | Custom IQ/WAV parser (`src/lib/fileParser.ts`) |
| **Report Generation** | PDF generator (`src/lib/pdfGenerator.ts`) |

### Core DSP Modules (`src/lib/dsp/`)

```
src/lib/dsp/
├── fft.ts              # Fast Fourier Transform
├── spectrogram.ts      # Time-frequency spectrogram
├── signalMetrics.ts    # SNR, power, bandwidth extraction
├── signalGenerator.ts  # Synthetic signal generation
├── demodulator.ts      # FSK / PSK / QAM demodulation
├── deinterleaver.ts    # Symbol de-interleaving
├── fec.ts              # Forward error correction
└── correlator.ts       # Cross-correlation analysis
```

---

## 🔬 Research Focus

```
DSP (FFT, PSD, Spectrogram)
        ↓
Parameter Detection (Freq, BW, SNR)
        ↓
Modulation Classification (ML)
        ↓
Demodulation (FSK / PSK / QAM)
        ↓
FEC Decoding (Viterbi / Hamming)
        ↓
Bit-Stream Correlation
```

---

## 📁 Project Structure

```
SignalLens-AI/
│
├── README.md
│
├── docs/
│   ├── images/
│   │   ├── dashboard.jpg             # Main dashboard UI
│   │   ├── waveform_spectrum.jpg     # Time domain + PSD charts
│   │   ├── waterfall_constellation.jpg # Waterfall + Constellation
│   │   └── report.jpg                # Sample analysis report
│   │
│   └── diagrams/
│       ├── workflow.jpg              # Step-by-step workflow
│       ├── architecture.jpg          # System architecture
│       └── pipeline.jpg              # DSP processing pipeline
│
├── src/
│   ├── components/
│   │   ├── UploadSignalView.tsx
│   │   ├── SignalAnalysisView.tsx
│   │   ├── DemodulationView.tsx
│   │   ├── CorrelationView.tsx
│   │   ├── DecodePipelineView.tsx
│   │   ├── QuadrantVisualizer.tsx
│   │   ├── ReportsView.tsx
│   │   └── ExportReportModal.tsx
│   │
│   ├── lib/
│   │   ├── dsp/
│   │   │   ├── fft.ts
│   │   │   ├── spectrogram.ts
│   │   │   ├── signalMetrics.ts
│   │   │   ├── signalGenerator.ts
│   │   │   ├── demodulator.ts
│   │   │   ├── deinterleaver.ts
│   │   │   ├── fec.ts
│   │   │   └── correlator.ts
│   │   │
│   │   ├── ml/
│   │   │   └── modulationClassifier.ts
│   │   │
│   │   ├── fileParser.ts
│   │   ├── pdfGenerator.ts
│   │   └── pipeline.ts
│   │
│   ├── types.ts
│   └── App.tsx
│
├── examples/                         # Sample signal files (coming soon)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/iparayush/SignalLens-AI-.git
cd SignalLens-AI-

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## 🌟 Advantages

- ✅ **Reduces manual effort** — Automates the entire signal analysis workflow end-to-end
- ✅ **Unified platform** — From file upload to report generation in one tool
- ✅ **AI + DSP** — Combines classical signal processing with ML-based classification
- ✅ **Multi-stage pipeline** — Covers demodulation, de-interleaving, FEC, and correlation
- ✅ **Confidence-based output** — ML classifier provides probability scores per modulation type
- ✅ **Reproducible reports** — Generates structured PDF reports for documentation
- ✅ **Browser-based** — No local installation of SDR tools required for initial analysis

---

## 🔮 Future Scope

| Area | Planned Work |
|---|---|
| **Modulation Types** | Add AM, FM, OFDM, LoRa, Bluetooth modulation support |
| **FEC Schemes** | Turbo codes, LDPC, Reed-Solomon |
| **ML Models** | Deep learning classifiers (CNN on spectrogram images) |
| **Batch Processing** | Multi-file batch analysis mode |
| **Parameter Estimation** | Improved automated channel estimation |
| **Export Formats** | JSON, CSV, and XML export alongside PDF |
| **Hardware Integration** | Direct SDR hardware streaming support |

---

## ⚠️ Safety & Data Policy

> Use **only synthetic, public-domain, or duly-authorized** signal recordings for development and testing.
>
> Do **not** capture, analyze, or process signals from licensed radio communications without appropriate authorization. The tool is intended for use with test signals and authorized data only.

---

## 👥 Team

**SignalLens AI**
Smart India Hackathon 2026
Problem Statement: **PS 26147**

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for **Smart India Hackathon 2026**

**PS 26147 — Automated Signal Analysis & Parameter Extraction**

</div>
