/**
 * SignalLens AI — IQ / WAV File Parser
 *
 * Parses raw signal recording files:
 *   - .IQ files: interleaved complex samples (Int16, Float32, Uint8)
 *   - .WAV files: standard RIFF/WAVE with PCM or float data
 *
 * Produces normalized Float64Array of interleaved [I, Q, I, Q, ...] samples.
 */

export type SampleFormat = 'int16' | 'float32' | 'uint8';

export interface ParsedSignalFile {
  /** Normalized interleaved I/Q data: [I0, Q0, I1, Q1, ...] range ≈ [-1, +1] */
  iq: Float64Array;
  /** Number of complex samples */
  numSamples: number;
  /** Sampling rate in Hz (from WAV header or user-specified) */
  sampleRate: number;
  /** Detected/specified sample format */
  sampleFormat: SampleFormat;
  /** Number of channels (1 = real, 2 = complex I/Q) */
  numChannels: number;
  /** Bits per sample */
  bitsPerSample: number;
  /** File size in bytes */
  fileSizeBytes: number;
  /** Duration in seconds */
  durationSeconds: number;
  /** File type detected */
  fileType: 'iq' | 'wav' | 'raw';
  /** CRC32 checksum (hex string) */
  crc32: string;
  /** Validation passed */
  isValid: boolean;
  /** Validation messages */
  validationMessages: string[];
}

// ─── CRC32 ───────────────────────────────────────────────────────────────────

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
})();

function crc32(data: Uint8Array): string {
  let crc = 0xFFFFFFFF;
  // Only checksum first 64KB for performance on large files
  const len = Math.min(data.length, 65536);
  for (let i = 0; i < len; i++) {
    crc = CRC32_TABLE[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return '0x' + ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

// ─── WAV Parser ──────────────────────────────────────────────────────────────

interface WavHeader {
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
  audioFormat: number; // 1 = PCM, 3 = IEEE Float
  dataOffset: number;
  dataSize: number;
}

function parseWavHeader(buffer: ArrayBuffer): WavHeader | null {
  const view = new DataView(buffer);

  // Check RIFF header
  const riff = String.fromCharCode(
    view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)
  );
  if (riff !== 'RIFF') return null;

  const wave = String.fromCharCode(
    view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11)
  );
  if (wave !== 'WAVE') return null;

  let offset = 12;
  let audioFormat = 1;
  let numChannels = 1;
  let sampleRate = 44100;
  let bitsPerSample = 16;
  let dataOffset = 0;
  let dataSize = 0;

  // Parse chunks
  while (offset < buffer.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset), view.getUint8(offset + 1),
      view.getUint8(offset + 2), view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkId === 'fmt ') {
      audioFormat = view.getUint16(offset + 8, true);
      numChannels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
    } else if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break; // Found data chunk
    }

    offset += 8 + chunkSize;
    // Align to even byte boundary
    if (chunkSize & 1) offset++;
  }

  if (dataOffset === 0) return null;

  return { sampleRate, numChannels, bitsPerSample, audioFormat, dataOffset, dataSize };
}

// ─── IQ Format Detection ─────────────────────────────────────────────────────

function detectIQFormat(buffer: ArrayBuffer, filename: string): SampleFormat {
  const lower = filename.toLowerCase();

  // Check filename hints
  if (lower.includes('float32') || lower.includes('f32') || lower.includes('cf32')) return 'float32';
  if (lower.includes('int16') || lower.includes('i16') || lower.includes('cs16')) return 'int16';
  if (lower.includes('uint8') || lower.includes('cu8') || lower.includes('u8')) return 'uint8';

  // Heuristic: check if data looks like float32 (values between -1 and 1 mostly)
  const size = buffer.byteLength;
  if (size >= 8 && size % 8 === 0) {
    const view = new Float32Array(buffer, 0, Math.min(100, size / 4));
    let inRange = 0;
    for (let i = 0; i < view.length; i++) {
      if (Math.abs(view[i]) < 100 && isFinite(view[i])) inRange++;
    }
    if (inRange > view.length * 0.8) return 'float32';
  }

  // Default: assume 16-bit signed integer (most common SDR format)
  return 'int16';
}

// ─── Normalization ───────────────────────────────────────────────────────────

function normalizeInt16(buffer: ArrayBuffer, offset: number, numSamples: number): Float64Array {
  const iq = new Float64Array(numSamples * 2);
  const view = new DataView(buffer);
  const scale = 1.0 / 32768.0;

  for (let i = 0; i < numSamples * 2 && (offset + i * 2 + 1) < buffer.byteLength; i++) {
    iq[i] = view.getInt16(offset + i * 2, true) * scale;
  }
  return iq;
}

function normalizeFloat32(buffer: ArrayBuffer, offset: number, numSamples: number): Float64Array {
  const iq = new Float64Array(numSamples * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < numSamples * 2 && (offset + i * 4 + 3) < buffer.byteLength; i++) {
    iq[i] = view.getFloat32(offset + i * 4, true);
  }
  return iq;
}

function normalizeUint8(buffer: ArrayBuffer, offset: number, numSamples: number): Float64Array {
  const iq = new Float64Array(numSamples * 2);
  const bytes = new Uint8Array(buffer, offset);
  const scale = 1.0 / 128.0;

  for (let i = 0; i < numSamples * 2 && i < bytes.length; i++) {
    iq[i] = (bytes[i] - 128) * scale;
  }
  return iq;
}

// ─── Main Parser ─────────────────────────────────────────────────────────────

/**
 * Parse a signal recording file (.iq, .wav, .raw, .dat, .bin).
 *
 * @param file           — File object from drag/drop or file input
 * @param overrideSampleRate — Optional: manually specify sample rate (for IQ files)
 * @param overrideFormat — Optional: manually specify sample format
 */
export async function parseSignalFile(
  file: File,
  overrideSampleRate?: number,
  overrideFormat?: SampleFormat
): Promise<ParsedSignalFile> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const checksum = crc32(bytes);
  const messages: string[] = [];
  const ext = file.name.toLowerCase().split('.').pop() || '';

  let fileType: 'iq' | 'wav' | 'raw' = 'iq';
  let sampleRate = overrideSampleRate || 2400000; // Default 2.4 MSps
  let sampleFormat: SampleFormat = overrideFormat || 'int16';
  let numChannels = 2; // Complex I/Q
  let bitsPerSample = 16;
  let dataOffset = 0;
  let dataSize = buffer.byteLength;

  // Attempt WAV parsing
  if (ext === 'wav' || ext === 'wave') {
    const wavHeader = parseWavHeader(buffer);
    if (wavHeader) {
      fileType = 'wav';
      sampleRate = wavHeader.sampleRate;
      numChannels = wavHeader.numChannels;
      bitsPerSample = wavHeader.bitsPerSample;
      dataOffset = wavHeader.dataOffset;
      dataSize = wavHeader.dataSize;

      if (wavHeader.audioFormat === 3) {
        sampleFormat = 'float32';
      } else if (bitsPerSample === 16) {
        sampleFormat = 'int16';
      } else if (bitsPerSample === 8) {
        sampleFormat = 'uint8';
      }

      messages.push(`WAV header parsed: ${sampleRate} Hz, ${numChannels}ch, ${bitsPerSample}-bit`);

      // If mono WAV, treat as real signal (duplicate to I/Q with Q=0)
      if (numChannels === 1) {
        messages.push('Mono WAV detected: treating as real-valued signal');
      }
    } else {
      messages.push('WAV header parsing failed; treating as raw IQ');
      fileType = 'raw';
    }
  } else if (ext === 'iq' || ext === 'raw' || ext === 'dat' || ext === 'bin') {
    fileType = ext === 'iq' ? 'iq' : 'raw';
    if (!overrideFormat) {
      sampleFormat = detectIQFormat(buffer, file.name);
    }
    messages.push(`IQ format detected: ${sampleFormat}`);
  }

  // Override format if specified
  if (overrideFormat) sampleFormat = overrideFormat;

  // Calculate bytes per sample pair
  let bytesPerSample: number;
  switch (sampleFormat) {
    case 'float32': bytesPerSample = 4; bitsPerSample = 32; break;
    case 'uint8': bytesPerSample = 1; bitsPerSample = 8; break;
    case 'int16':
    default: bytesPerSample = 2; bitsPerSample = 16; break;
  }

  const effectiveChannels = numChannels >= 2 ? 2 : numChannels;
  const bytesPerComplexSample = bytesPerSample * effectiveChannels;
  const numSamples = Math.floor(dataSize / bytesPerComplexSample);

  // Normalize samples to Float64 interleaved I/Q
  let iq: Float64Array;

  if (numChannels === 1) {
    // Mono: create synthetic I/Q (I = signal, Q = Hilbert-approx = 0)
    let rawSamples: Float64Array;
    switch (sampleFormat) {
      case 'float32': rawSamples = normalizeFloat32(buffer, dataOffset, numSamples); break;
      case 'uint8': rawSamples = normalizeUint8(buffer, dataOffset, numSamples); break;
      default: rawSamples = normalizeInt16(buffer, dataOffset, numSamples); break;
    }
    // Interleave with zero Q channel
    iq = new Float64Array(numSamples * 2);
    for (let i = 0; i < numSamples; i++) {
      iq[i * 2] = rawSamples[i]; // I = real sample
      iq[i * 2 + 1] = 0;         // Q = 0
    }
  } else {
    // Complex I/Q interleaved
    switch (sampleFormat) {
      case 'float32': iq = normalizeFloat32(buffer, dataOffset, numSamples); break;
      case 'uint8': iq = normalizeUint8(buffer, dataOffset, numSamples); break;
      default: iq = normalizeInt16(buffer, dataOffset, numSamples); break;
    }
  }

  // Validation
  let isValid = true;
  if (numSamples < 64) {
    messages.push('WARNING: Very few samples detected — file may be corrupt');
    isValid = false;
  }
  if (numSamples > 0) {
    // Check for DC offset
    let sumI = 0, sumQ = 0;
    const checkLen = Math.min(numSamples, 10000);
    for (let i = 0; i < checkLen; i++) {
      sumI += iq[i * 2];
      sumQ += iq[i * 2 + 1];
    }
    const dcI = sumI / checkLen;
    const dcQ = sumQ / checkLen;
    if (Math.abs(dcI) > 0.1 || Math.abs(dcQ) > 0.1) {
      messages.push(`DC offset detected: I=${dcI.toFixed(4)}, Q=${dcQ.toFixed(4)}`);
    }

    // Check for clipping
    let clipCount = 0;
    for (let i = 0; i < Math.min(iq.length, 20000); i++) {
      if (Math.abs(iq[i]) > 0.99) clipCount++;
    }
    const clipPct = (clipCount / Math.min(iq.length, 20000)) * 100;
    if (clipPct > 1) {
      messages.push(`Clipping detected: ${clipPct.toFixed(2)}% of samples at full scale`);
    } else {
      messages.push(`Clipping level: ${clipPct.toFixed(2)}% (Nominal)`);
    }

    // I/Q balance check
    let powerI = 0, powerQ = 0;
    for (let i = 0; i < checkLen; i++) {
      powerI += iq[i * 2] * iq[i * 2];
      powerQ += iq[i * 2 + 1] * iq[i * 2 + 1];
    }
    const balance = Math.min(powerI, powerQ) / Math.max(powerI, powerQ, 1e-10);
    messages.push(`I/Q Balance: ${(balance * 100).toFixed(1)}% Orthogonal`);
  }

  messages.push(`Validation: ${isValid ? 'PASSED' : 'WARNINGS'}`);

  return {
    iq,
    numSamples,
    sampleRate,
    sampleFormat,
    numChannels: effectiveChannels,
    bitsPerSample,
    fileSizeBytes: file.size,
    durationSeconds: numSamples / sampleRate,
    fileType,
    crc32: checksum,
    isValid,
    validationMessages: messages,
  };
}
