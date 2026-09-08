# SignalLens AI — Examples

This folder will contain example IQ/WAV signal files for testing the platform.

## Planned Examples

| File | Format | Description |
|------|--------|-------------|
| `bpsk_2.4ghz.iq` | IQ float32 | Synthetic BPSK signal at 2.4 GHz |
| `qpsk_915mhz.iq` | IQ float32 | Synthetic QPSK signal at 915 MHz |
| `fsk_433mhz.iq` | IQ float32 | Synthetic FSK signal at 433 MHz |
| `qam16_test.iq` | IQ float32 | Synthetic 16-QAM test signal |
| `tone_440hz.wav` | WAV PCM | 440 Hz test tone |
| `noise_only.wav` | WAV PCM | Gaussian noise baseline |

## ⚠️ Data Policy

Only synthetic or public-domain signal files are included here.
Do not commit captured signals from licensed communications.

## Generating Synthetic Signals

The platform includes a built-in signal generator (`src/lib/dsp/signalGenerator.ts`)
that can produce test signals without requiring external hardware.
