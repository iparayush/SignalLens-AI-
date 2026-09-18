/**
 * AstraX Signal Intelligence — Master PDF Report Generator
 *
 * Generates official A4 portrait intelligence reports adhering strictly
 * to the NTRO / AstraX technical report standard:
 *   - A4 Portrait format (210 x 297 mm)
 *   - Official NTRO Header & AstraX Branding
 *   - Diagonal AstraX Watermark
 *   - Embedded High-Resolution DSP Charts:
 *       • Time Domain Waveform (I & Q channels)
 *       • Frequency Spectrum (FFT)
 *       • Constellation Diagram
 *       • Waterfall / Spectrogram
 *   - 10 Numbered Tactical Sections with Real Extracted Parameters
 *   - Format: AstraX_Signal_Analysis_Report_YYYYMMDD_HHMMSS.pdf
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { SignalProfile } from '../types';
import { AstraXReportTemplate } from '../components/AstraXReportTemplate';

/**
 * Standardized AstraX report filename generator:
 * AstraX_Signal_Analysis_Report_YYYYMMDD_HHMMSS.pdf
 */
export function getReportFilename(ext: string = 'pdf'): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `AstraX_Signal_Analysis_Report_${yyyy}${mm}${dd}_${hh}${min}${ss}.${ext}`;
}

/**
 * Generates an official AstraX NTRO A4 PDF Report Blob from active SignalProfile.
 */
export async function generateSignalReportPdf(activeSignal: SignalProfile): Promise<Blob> {
  // Create an offscreen staging container for rendering the report
  const stagingContainer = document.createElement('div');
  stagingContainer.id = 'astrax-pdf-staging-container';
  stagingContainer.style.position = 'fixed';
  stagingContainer.style.top = '0';
  stagingContainer.style.left = '-10000px';
  stagingContainer.style.width = '210mm';
  stagingContainer.style.minHeight = '297mm';
  stagingContainer.style.backgroundColor = '#FFFFFF';
  stagingContainer.style.zIndex = '-9999';
  stagingContainer.style.overflow = 'visible';
  document.body.appendChild(stagingContainer);

  const root = createRoot(stagingContainer);

  try {
    // Render the pixel-perfect AstraX template in populated mode without control buttons
    await new Promise<void>((resolve) => {
      root.render(
        React.createElement(AstraXReportTemplate, {
          activeSignal,
          initialMode: 'populated',
          hideControls: true,
        })
      );
      // Allow browser layout, fonts, and chart canvas images to fully paint
      setTimeout(resolve, 450);
    });

    const sheetElement =
      (stagingContainer.querySelector('#astrax-a4-report-sheet') as HTMLElement) ||
      stagingContainer;

    // Capture the A4 sheet at 2x scale for 300 DPI high-definition print quality
    const canvas = await html2canvas(sheetElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#FFFFFF',
      logging: false,
      windowWidth: 794, // 210mm at 96 DPI
    });

    // Create jsPDF document: A4 portrait (210 x 297 mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Draw full-bleed A4 sheet (210mm x 297mm)
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

    return pdf.output('blob');
  } finally {
    // Teardown offscreen staging DOM and React root
    try {
      root.unmount();
    } catch {
      // Ignore unmount error if already cleaned up
    }
    if (document.body.contains(stagingContainer)) {
      document.body.removeChild(stagingContainer);
    }
  }
}

/**
 * Opens a print-formatted mission dossier in a new window for instant printing / Save as PDF.
 */
export function openPrintableReport(activeSignal: SignalProfile) {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    alert('Please allow popups to print or view the formatted mission report.');
    return;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>AstraX NTRO SIGINT Mission Report - ${activeSignal.filename}</title>
  <meta charset="utf-8" />
  <style>
    body {
      font-family: 'Courier New', Courier, monospace;
      background: #fff;
      color: #111;
      padding: 30px;
      line-height: 1.4;
      font-size: 12px;
    }
    .header {
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
      margin-bottom: 20px;
      text-align: center;
    }
    .classified {
      font-weight: bold;
      color: #c00;
      font-size: 15px;
      letter-spacing: 2px;
    }
    h2 {
      font-size: 13px;
      text-transform: uppercase;
      border-bottom: 1px solid #333;
      padding-bottom: 4px;
      margin-top: 18px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 11px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 5px 8px;
      text-align: left;
    }
    th {
      background: #f0f0f0;
    }
    .footer {
      margin-top: 30px;
      border-top: 1px solid #000;
      padding-top: 10px;
      font-size: 10px;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div style="text-align: right; margin-bottom: 15px;">
    <button onclick="window.print()" style="padding: 6px 14px; background: #082A4A; color: #fff; border: none; font-weight: bold; cursor: pointer; border-radius: 4px;">
      🖨️ PRINT / SAVE AS PDF
    </button>
  </div>
  <div class="header">
    <div class="classified">RESTRICTED // NTRO-ASTRAX-2026 // NOFORN</div>
    <div style="font-size: 16px; font-weight: bold; margin-top: 6px;">NATIONAL TECHNICAL RESEARCH ORGANISATION (NTRO) • ASTRAX</div>
    <div style="font-size: 12px;">SIGNAL ANALYSIS REPORT • AUTOMATED PARAMETER EXTRACTION</div>
    <div style="font-size: 10px; color: #555; margin-top: 4px;">CRC32: ${activeSignal.crc32} • Generated: ${new Date().toUTCString()}</div>
  </div>

  <h2>1. File Information & Telemetry</h2>
  <table>
    <tr><th>Parameter</th><th>Value</th><th>Parameter</th><th>Value</th></tr>
    <tr><td>File Name</td><td><strong>${activeSignal.filename}</strong></td><td>Duration</td><td>${activeSignal.durFormatted} (${activeSignal.sizeFormatted})</td></tr>
    <tr><td>Center Frequency (Fc)</td><td><strong>${activeSignal.fcFormatted}</strong></td><td>Sampling Rate (Fs)</td><td>${activeSignal.fsFormatted}</td></tr>
    <tr><td>Modulation Detected</td><td><strong style="color: #006699;">${activeSignal.telemetry.modulation}</strong> (${activeSignal.telemetry.modulationMatch.toFixed(1)}%)</td><td>SNR Margin</td><td>+${activeSignal.telemetry.estimatedSnrDb.toFixed(1)} dB (${activeSignal.telemetry.snrQuality})</td></tr>
    <tr><td>Occupied Bandwidth</td><td>${activeSignal.telemetry.bandwidthMHz.toFixed(3)} MHz</td><td>Symbol Rate</td><td>${(activeSignal.telemetry.symbolRateMSym * 1e3).toFixed(1)} kSps</td></tr>
    <tr><td>FEC Code</td><td>${activeSignal.telemetry.fecCode}</td><td>Interleaving</td><td>${activeSignal.telemetry.interleaving}</td></tr>
    <tr><td>EVM RMS</td><td>${activeSignal.evmRms.toFixed(2)}%</td><td>Phase Jitter</td><td>±${activeSignal.phaseJitterDeg.toFixed(2)}°</td></tr>
  </table>

  <h2>2. Target Emitter Identification</h2>
  <table>
    <tr><td>Target Designation</td><td><strong>${activeSignal.emitterProfile.targetDesignation}</strong></td><td>Callsign</td><td><strong>${activeSignal.emitterProfile.callsign}</strong></td></tr>
    <tr><td>Classification</td><td>${activeSignal.emitterProfile.classification}</td><td>Threat Level</td><td><strong style="color: #c00;">${activeSignal.emitterProfile.threatLevel} PRIORITY</strong></td></tr>
    <tr><td>Estimated Origin</td><td colspan="3">${activeSignal.emitterProfile.estimatedLocation}</td></tr>
  </table>

  <h2>3. Frame Synchronization & Correlation</h2>
  <table>
    <tr><td>Pattern Name</td><td>${activeSignal.correlation.patternName}</td><td>Sync Preamble Hex</td><td><strong>${activeSignal.correlation.syncPreambleHex}</strong></td></tr>
    <tr><td>Detected Bit Offset</td><td>${activeSignal.correlation.detectedPositionOffset}</td><td>Byte Location</td><td>${activeSignal.correlation.bitLocation}</td></tr>
    <tr><td>Cross-Correlation Margin</td><td><strong>+${activeSignal.correlation.crossCorrPsrDb.toFixed(1)} dB PSR</strong></td><td>Sidelobe Test</td><td>${activeSignal.correlation.peakToSidelobeStatus}</td></tr>
  </table>

  <h2>4. Recovered Bitstream Sample (Hex / ASCII)</h2>
  <pre style="background: #f8f8f8; padding: 10px; border: 1px solid #ddd; font-size: 11px;">
${activeSignal.bitstreamLines.slice(0, 16).map((l) => `${l.offset}  ${l.hexBytes.join(' ')}  |  ${l.ascii}`).join('\n')}
  </pre>

  <div class="footer">
    AUTHENTICATED TECHNICAL REPORT • NATIONAL TECHNICAL RESEARCH ORGANISATION • ASTRAX PLATFORM
  </div>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
