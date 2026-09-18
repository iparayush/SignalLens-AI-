import zipfile
import xml.etree.ElementTree as ET

def extract_text(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            tree = ET.XML(docx.read("word/document.xml"))
            # Namespace for WordprocessingML
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            # Find all text elements
            texts = tree.findall('.//w:t', namespaces)
            
            text_content = [t.text for t in texts if t.text]
            return '\n'.join(text_content)
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    print(extract_text("AstraX_NTRO_Signal_Analysis_Report_Exact_Conversion.docx"))
