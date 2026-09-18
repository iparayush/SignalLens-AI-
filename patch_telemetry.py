import re

with open('src/components/PrimaryTelemetryCard.tsx', 'r') as f:
    content = f.read()

replacements = {
    "bg-[#171b26]": "bg-[#0B1224]",
    "border-[#262a35]": "border-[#1E293B]",
    "bg-[#4cd7f6]": "bg-[#22D3EE]",
    "text-[#4cd7f6]": "text-[#22D3EE]",
    "text-[#dfe2f1]": "text-white",
    "bg-[#4edea3]": "bg-[#14B8A6]",
    "text-[#4edea3]": "text-[#14B8A6]",
    "border-[#4edea3]/30": "border-[#14B8A6]/30",
    "bg-[#4edea3]/10": "bg-[#14B8A6]/10",
    "bg-[#1c1f2a]": "bg-[#101A32]",
    "border-[#313540]": "border-[#1E293B]",
    "text-[#869397]": "text-[#64748B]",
    "bg-[#262a35]": "bg-[#1E293B]",
    "bg-[#4cd7f6]/10": "bg-[#22D3EE]/10",
    "text-[#adc6ff]": "text-[#22D3EE]",
    "bg-[#adc6ff]": "bg-[#22D3EE]",
    "bg-[#0a0e18]": "bg-[#050816]",
    "text-[#bcc9cd]": "text-[#94A3B8]"
}

for k, v in replacements.items():
    content = content.replace(k, v)

# Update "AI Powered Analysis" label in top right (it currently doesn't exist, wait, the reference image has it). Let's add it.
content = content.replace("Automatic Parameter Detection — Primary Telemetry\n          </h2>", "Automatic Parameter Detection — Primary Telemetry\n          </h2>\n        </div>\n        <div className=\"flex items-center gap-2\">\n          <span className=\"font-mono text-[10px] text-[#8B5CF6] uppercase border border-[#8B5CF6]/30 px-2 py-0.5 rounded flex items-center gap-1 bg-[#8B5CF6]/10\">\n            <svg className=\"w-3 h-3\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2\"><path d=\"M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg>\n            AI Powered Analysis\n          </span>")

with open('src/components/PrimaryTelemetryCard.tsx', 'w') as f:
    f.write(content)

