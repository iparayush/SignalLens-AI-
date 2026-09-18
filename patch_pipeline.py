import re

with open('src/components/DSPPipelineFlow.tsx', 'r') as f:
    content = f.read()

replacements = {
    "bg-[#171b26]": "bg-[#0B1224]",
    "bg-[#1c1f2a]": "bg-[#101A32]",
    "bg-[#262a35]": "bg-[#1E293B]",
    "bg-[#0a0e18]": "bg-[#050816]",
    "bg-[#0a0e18]/80": "bg-[#050816]/80",
    "bg-[#1c1f2a]/60": "bg-[#101A32]/60",
    "bg-[#06b6d4]": "bg-[#6D28D9]", # Violet for step numbers
    "text-[#4cd7f6]": "text-[#22D3EE]",
    "text-[#4edea3]": "text-[#14B8A6]",
    "text-[#dfe2f1]": "text-white",
    "text-[#bcc9cd]": "text-[#94A3B8]",
    "text-[#869397]": "text-[#64748B]",
    "text-[#00424f]": "text-white",
    "border-[#262a35]": "border-[#1E293B]",
    "border-[#313540]": "border-[#1E293B]",
    "border-[#4cd7f6]/40": "border-[#22D3EE]/40",
    "border-[#313540]/60": "border-[#1E293B]/60",
    "hover:bg-[#262a35]": "hover:bg-[#1E293B]",
    "hover:bg-[#353944]": "hover:bg-[#334155]"
}

for k, v in replacements.items():
    content = content.replace(k, v)

# Remove the redundant status block
content = re.sub(
    r'<div className="flex items-center gap-1\.5 font-mono text-\[11px\] text-\[\#14B8A6\] font-bold">.*?</div>',
    '',
    content,
    flags=re.DOTALL
)

with open('src/components/DSPPipelineFlow.tsx', 'w') as f:
    f.write(content)

