import re

with open('src/components/QuadrantVisualizer.tsx', 'r') as f:
    content = f.read()

replacements = {
    "bg-[#171b26]": "bg-[#0B1224]",
    "bg-[#262a35]": "bg-[#1E293B]",
    "bg-[#0a0e18]": "bg-[#050816]",
    "bg-[#0a0e18]/80": "bg-[#050816]/80",
    "bg-[#1c1f2a]/60": "bg-[#101A32]/60",
    "bg-[#262a35]/30": "bg-[#101A32]/50",
    "bg-[#262a35]/40": "bg-[#101A32]/50",
    "border-[#171b26]": "border-[#1E293B]",
    "border-[#262a35]": "border-[#1E293B]",
    "border-[#313540]": "border-[#334155]",
    "text-[#4cd7f6]": "text-[#22D3EE]",
    "bg-[#4cd7f6]": "bg-[#22D3EE]",
    "bg-[#4cd7f6]/40": "border-[#22D3EE]/40",
    "text-[#4edea3]": "text-[#14B8A6]",
    "bg-[#4edea3]": "bg-[#14B8A6]",
    "text-[#dfe2f1]": "text-white",
    "text-[#bcc9cd]": "text-[#94A3B8]",
    "text-[#869397]": "text-[#64748B]",
    "stroke=\"#4cd7f6\"": "stroke=\"#22D3EE\"",
    "stroke=\"#adc6ff\"": "stroke=\"#EC4899\"", # Magenta for Q
    "text-[#adc6ff]": "text-[#EC4899]",
    "stroke=\"#171b26\"": "stroke=\"#1E293B\"",
    "stroke=\"#313540\"": "stroke=\"#334155\"",
    "stopColor=\"#4cd7f6\"": "stopColor=\"#22D3EE\"",
    "stopColor=\"#0566d9\"": "stopColor=\"#8B5CF6\"", # Violet
    "stopColor=\"#0f131d\"": "stopColor=\"#050816\"",
    "stopColor=\"#171b26\"": "stopColor=\"#0B1224\"",
    "stopColor=\"#0a0e18\"": "stopColor=\"#050816\"",
    "stopColor=\"#4edea3\"": "stopColor=\"#14B8A6\"",
    "fill=\"#4cd7f6\"": "fill=\"#22D3EE\"",
    "fill=\"#4edea3\"": "fill=\"#14B8A6\"",
    "stroke=\"#06b6d4\"": "stroke=\"#22D3EE\"",
    "bg-[#06b6d4]": "bg-[#22D3EE]",
    "rgba(6,182,212,0.08)": "rgba(34,211,238,0.08)"
}

for k, v in replacements.items():
    content = content.replace(k, v)

# Add animate-waveform class to paths
content = content.replace('stroke="#22D3EE" strokeWidth="1.8"', 'stroke="#22D3EE" strokeWidth="1.8" className="animate-waveform" strokeDasharray="300"')
content = content.replace('stroke="#EC4899"\n                strokeWidth="1.8"\n                strokeDasharray="4 2"', 'stroke="#EC4899"\n                strokeWidth="1.8"\n                strokeDasharray="4 2"\n                className="animate-waveform"')

with open('src/components/QuadrantVisualizer.tsx', 'w') as f:
    f.write(content)

