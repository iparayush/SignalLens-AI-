import re

with open('src/components/SignalIngestionCard.tsx', 'r') as f:
    content = f.read()

replacements = {
    "bg-[#171b26]": "bg-[#0B1224]",
    "border-[#262a35]": "border-[#1E293B]",
    "bg-[#4cd7f6]": "bg-[#22D3EE]",
    "text-[#dfe2f1]": "text-white",
    "text-[#4cd7f6]": "text-[#22D3EE]",
    "bg-[#262a35]": "bg-[#101A32]",
    "border-[#4cd7f6]": "border-[#22D3EE]",
    "bg-[#06b6d4]/10": "bg-[#22D3EE]/10",
    "border-[#313540]": "border-[#1E293B]",
    "bg-[#0a0e18]": "bg-[#050816]",
    "hover:bg-[#1c1f2a]": "hover:bg-[#101A32]",
    "text-[#bcc9cd]": "text-[#94A3B8]",
    "text-[#4edea3]": "text-[#14B8A6]",
    "bg-[#003824]/60": "bg-[#0F766E]/60",
    "hover:bg-[#353944]": "hover:bg-[#1E293B]",
    "text-[#869397]": "text-[#64748B]",
    "bg-[#1c1f2a]": "bg-[#101A32]",
    "bg-[#4edea3]": "bg-[#14B8A6]",
    "border-[#4edea3]/20": "border-[#14B8A6]/20"
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open('src/components/SignalIngestionCard.tsx', 'w') as f:
    f.write(content)

