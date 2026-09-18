import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

# Sidebar Background
content = content.replace("bg-[#0a0e18]/95", "bg-[#050816]/95 border-[#1E293B]")
content = content.replace("bg-[#0a0e18]", "bg-[#0B1224]")
content = content.replace("border-[#171b26]", "border-[#1E293B]")
content = content.replace("hover:bg-[#131724]", "hover:bg-[#101A32]")

# Logo Section colors
content = content.replace("bg-[#0f131d]", "bg-[#101A32]")
content = content.replace("border-[#313540]", "border-[#334155]")
content = content.replace("shadow-[0_0_8px_rgba(76,215,246,0.2)]", "shadow-[0_0_12px_rgba(34,211,238,0.3)]")
content = content.replace("text-[#4cd7f6]", "text-[#22D3EE]")
content = content.replace("stroke=\"#0566d9\"", "stroke=\"#8B5CF6\"")
content = content.replace("stroke=\"#4cd7f6\"", "stroke=\"#22D3EE\"")
content = content.replace("text-[#dfe2f1]", "text-white")
content = content.replace("text-[#bcc9cd]", "text-[#94A3B8]")
content = content.replace("bg-[#1c1f2a]", "bg-[#101A32]")
content = content.replace("border-[#4edea3]/20", "border-[#14B8A6]/30")
content = content.replace("text-[#4edea3]", "text-[#14B8A6]")
content = content.replace("bg-[#4edea3]", "bg-[#14B8A6]")
content = content.replace("text-[#869397]", "text-[#64748B]")

# Active tab states
content = content.replace("bg-[#06b6d4] text-[#00424f] font-bold shadow-[0_0_14px_rgba(6,182,212,0.35)] translate-x-0.5", "bg-[#101A32] text-[#22D3EE] font-bold border-l-2 border-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.15)] translate-x-1")
content = content.replace("text-[#00424f]", "text-[#22D3EE]")
content = content.replace("hover:bg-[#262a35]", "hover:bg-[#101A32]")
content = content.replace("bg-[#00424f]", "bg-[#22D3EE]")


with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)

