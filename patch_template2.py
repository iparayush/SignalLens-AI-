import re

with open('src/components/AstraXReportTemplate.tsx', 'r') as f:
    content = f.read()

content = content.replace("{{chart_2}}", "{'{{chart_2}}'}")
content = content.replace("{{chart_3}}", "{'{{chart_3}}'}")
content = content.replace("{{chart_5}}", "{'{{chart_5}}'}")
content = content.replace("{{chart_7}}", "{'{{chart_7}}'}")
content = content.replace("{{bitstream}}", "{'{{bitstream}}'}")
content = content.replace("{{analysis_summary}}", "{'{{analysis_summary}}'}")

with open('src/components/AstraXReportTemplate.tsx', 'w') as f:
    f.write(content)

