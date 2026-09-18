import re

with open('src/components/AstraXReportTemplate.tsx', 'r') as f:
    content = f.read()

# Fix docId, date, classification template logic
content = content.replace("{isTemplate ? '' : fields.docId}", "{isTemplate ? '{{document_id}}' : fields.docId}")
content = content.replace("{isTemplate ? '' : fields.date}", "{isTemplate ? '{{date}}' : fields.date}")
content = content.replace("{isTemplate ? '' : fields.classification}", "{isTemplate ? '{{classification}}' : fields.classification}")

# Fix table mappings
content = content.replace("label: 'File Name', val: fields.fileName", "label: 'File Name', val: fields.fileName, tpl: '{{file_name}}'")
content = content.replace("label: 'File Format (IQ / WAV)', val: fields.fileFormat", "label: 'File Format (IQ / WAV)', val: fields.fileFormat, tpl: '{{file_format}}'")
content = content.replace("label: 'File Size', val: fields.fileSize", "label: 'File Size', val: fields.fileSize, tpl: '{{file_size}}'")
content = content.replace("label: 'Duration', val: fields.duration", "label: 'Duration', val: fields.duration, tpl: '{{duration}}'")
content = content.replace("label: 'Sampling Rate (Fs)', val: fields.samplingRate", "label: 'Sampling Rate (Fs)', val: fields.samplingRate, tpl: '{{sampling_rate}}'")
content = content.replace("label: 'Center Frequency (Fc)', val: fields.centerFrequency", "label: 'Center Frequency (Fc)', val: fields.centerFrequency, tpl: '{{center_frequency}}'")
content = content.replace("label: 'Modulation (Estimated)', val: fields.modulation", "label: 'Modulation (Estimated)', val: fields.modulation, tpl: '{{modulation}}'")
content = content.replace("label: 'Signal-to-Noise Ratio (SNR)', val: fields.snr", "label: 'Signal-to-Noise Ratio (SNR)', val: fields.snr, tpl: '{{snr}}'")
content = content.replace("label: 'Occupied Bandwidth', val: fields.bandwidth", "label: 'Occupied Bandwidth', val: fields.bandwidth, tpl: '{{bandwidth}}'")
content = content.replace("label: 'Symbol Rate', val: fields.symbolRate", "label: 'Symbol Rate', val: fields.symbolRate, tpl: '{{symbol_rate}}'")
content = content.replace("label: 'FEC (Estimated)', val: fields.fec", "label: 'FEC (Estimated)', val: fields.fec, tpl: '{{fec}}'")
content = content.replace("label: 'Interleaving (Estimated)', val: fields.interleaving", "label: 'Interleaving (Estimated)', val: fields.interleaving, tpl: '{{interleaving}}'")
content = content.replace("label: 'Processing Time', val: fields.processingTime", "label: 'Processing Time', val: fields.processingTime, tpl: '{{processing_time}}'")

content = content.replace("label: 'Target Designation', val: fields.targetDesignation", "label: 'Target Designation', val: fields.targetDesignation, tpl: '{{target_designation}}'")
content = content.replace("label: 'Callsign / ID', val: fields.callsign", "label: 'Callsign / ID', val: fields.callsign, tpl: '{{callsign}}'")
content = content.replace("label: 'Emitter Classification', val: fields.emitterClass", "label: 'Emitter Classification', val: fields.emitterClass, tpl: '{{emitter_classification}}'")
content = content.replace("label: 'Estimated Location', val: fields.estimatedLocation", "label: 'Estimated Location', val: fields.estimatedLocation, tpl: '{{estimated_location}}'")
content = content.replace("label: 'Coordinates', val: fields.coordinates", "label: 'Coordinates', val: fields.coordinates, tpl: '{{coordinates}}'")
content = content.replace("label: 'Analysis Status', val: fields.analysisStatus", "label: 'Analysis Status', val: fields.analysisStatus, tpl: '{{analysis_status}}'")

content = content.replace("label: 'Pattern Name', val: fields.patternName", "label: 'Pattern Name', val: fields.patternName, tpl: '{{pattern_name}}'")
content = content.replace("label: 'Preamble (Hex)', val: fields.preambleHex", "label: 'Preamble (Hex)', val: fields.preambleHex, tpl: '{{preamble_hex}}'")
content = content.replace("label: 'Matched Frame Offset', val: fields.matchedOffset", "label: 'Matched Frame Offset', val: fields.matchedOffset, tpl: '{{frame_offset}}'")
content = content.replace("label: 'Peak-to-Sidelobe Ratio (PSR)', val: fields.psr", "label: 'Peak-to-Sidelobe Ratio (PSR)', val: fields.psr, tpl: '{{psr}}'")
content = content.replace("label: 'Status', val: fields.syncStatus", "label: 'Status', val: fields.syncStatus, tpl: '{{status}}'")

# Replace {isTemplate ? '' : row.val} with {isTemplate ? row.tpl : row.val}
content = content.replace("{isTemplate ? '' : row.val}", "{isTemplate ? row.tpl : row.val}")

# Fix matchedOffset and syncStatus state initialisation
content = content.replace("matchedOffset: activeSignal ? activeSignal.correlation.detectedPositionOffset : '{{matched_offset}}',", "matchedOffset: activeSignal ? activeSignal.correlation.detectedPositionOffset : '{{frame_offset}}',")
content = content.replace("syncStatus: activeSignal ? (activeSignal.correlation.hasSignificantMatch ? 'LOCKED & VERIFIED' : 'SEARCHING') : '{{sync_status}}',", "syncStatus: activeSignal ? (activeSignal.correlation.hasSignificantMatch ? 'LOCKED & VERIFIED' : 'SEARCHING') : '{{status}}',")

# Charts
content = content.replace(
    "{/* Empty Grid Interior (or populated waveform if active) */}",
    "{/* Empty Grid Interior (or populated waveform if active) */}\n                  {isTemplate && <div className=\"absolute inset-0 flex items-center justify-center font-mono text-sm text-slate-400 z-20\">{{chart_2}}</div>}"
)

content = content.replace(
    "{/* Empty Grid Interior */}",
    "{/* Empty Grid Interior */}\n                  {isTemplate && <div className=\"absolute inset-0 flex items-center justify-center font-mono text-sm text-slate-400 z-20\">{{chart_3}}</div>}"
)

content = content.replace(
    "{/* Left: Square Constellation Plot */}",
    "{/* Left: Square Constellation Plot */}\n                  {isTemplate && <div className=\"absolute inset-0 flex items-center justify-center font-mono text-sm text-slate-400 z-20 pointer-events-none\">{{chart_5}}</div>}"
)

content = content.replace(
    "{/* Chart Body */}",
    "{/* Chart Body */}\n                  {isTemplate && <div className=\"absolute inset-0 flex items-center justify-center font-mono text-sm text-slate-400 z-20 pointer-events-none\">{{chart_7}}</div>}"
)

# Fix modulation & confidence
content = content.replace("{isTemplate ? '' : fields.modulation}", "{isTemplate ? '{{modulation}}' : fields.modulation}")
content = content.replace("{isTemplate ? '' : fields.confidence}", "{isTemplate ? '' : fields.confidence}")

# Fix bitstream
content = content.replace(
    "<span className=\"italic text-slate-400\">Bitstream data will appear here...</span>",
    "<span className=\"text-slate-400\">{{bitstream}}</span>"
)

# Fix summary
content = content.replace(
    "<span className=\"italic text-slate-400\">\n                    Automated analysis summary will appear here.\n                  </span>",
    "<span className=\"text-slate-400\">{{analysis_summary}}</span>"
)

# Fix findings
content = content.replace(
    "<div className=\"w-full h-[1px] bg-[#E2E8F0] mt-1\" />",
    "<span className=\"text-[#17202A] text-[8.5px] truncate\">{{key_finding_` + (i + 1) + `}}</span>"
)

with open('src/components/AstraXReportTemplate.tsx', 'w') as f:
    f.write(content)

