import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# Replace header background class
content = content.replace("bg-[#0a0e18]/90", "bg-[#0B1224]/90 border-[#1E293B]")

# Replace NTRO header stamp section entirely
new_stamp = """
          <div className="flex flex-col pr-4 border-r border-[#1E293B] shrink-0">
            <span className="font-headline text-[13px] font-bold text-white tracking-wide leading-tight">
              NATIONAL TECHNICAL RESEARCH ORGANISATION (NTRO) <span className="text-[#8B5CF6]">• AstraX</span>
            </span>
            <span className="font-mono text-[9px] text-[#22D3EE] tracking-widest uppercase mt-0.5">
              SIGNAL INTELLIGENCE • DATA ANALYSIS
            </span>
          </div>
"""

content = re.sub(
    r'<div className="flex items-center gap-2 pr-2 border-r border-\[\#313540\] shrink-0">.*?</div>\s*</div>',
    new_stamp.strip(),
    content,
    flags=re.DOTALL
)

# Fix right side actions
right_actions = """
        {/* Right Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden lg:flex flex-col text-right mr-2">
            <span className="text-[10px] text-white font-headline">Explore Signals</span>
            <span className="text-[10px] text-[#94A3B8] font-headline">Empower Decisions</span>
          </div>
          
          <div className="h-6 w-px bg-[#1E293B]" />

          {onNavigateLanding && (
            <button
              onClick={onNavigateLanding}
              className="px-3 py-1.5 bg-[#101A32] hover:bg-[#1E293B] text-white border border-[#334155] rounded text-[11px] font-mono transition-colors"
            >
              Generate Report
            </button>
          )}

          <button
            id="export-report-top-btn"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#6D28D9] hover:bg-[#8B5CF6] text-white rounded font-mono text-[12px] font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            type="button"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <div className="w-8 h-8 rounded-full bg-[#101A32] border border-[#334155] flex items-center justify-center text-white cursor-pointer hover:border-[#22D3EE] transition-colors relative">
            <User className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#EC4899] rounded-full border border-[#0B1224]" />
          </div>
        </div>
"""
content = re.sub(
    r'\{\/\* Right Actions \*\/\}.*?<\/header>',
    right_actions.strip() + '\n      </div>\n    </header>',
    content,
    flags=re.DOTALL
)

# Update the Demodulation pill colors
content = content.replace("bg-[#171b26]/80", "bg-[#101A32]")
content = content.replace("border-[#4edea3]/20", "border-[#14B8A6]/30")
content = content.replace("bg-[#4edea3]", "bg-[#14B8A6]")
content = content.replace("text-[#4edea3]", "text-[#14B8A6]")
content = content.replace("Demodulation Synchronized", "LIVE")

# Update Active file colors
content = content.replace("bg-[#171b26]", "bg-[#101A32]")
content = content.replace("border-[#313540]/60", "border-[#334155]")
content = content.replace("hover:bg-[#262a35]", "hover:bg-[#1E293B]")
content = content.replace("text-[#4cd7f6]", "text-[#22D3EE]")
content = content.replace("bg-[#06b6d4]", "bg-[#22D3EE]")
content = content.replace("text-[#00424f]", "text-black")

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)

