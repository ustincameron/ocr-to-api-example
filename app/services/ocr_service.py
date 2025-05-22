# services/ocr_service.py
from pdf2image import convert_from_path
import pytesseract

def extract_text_from_pdf(pdf_path: str) -> str:
    images = convert_from_path(pdf_path, fmt='jpeg', dpi=300)
    return "\n".join(pytesseract.image_to_string(img) for img in images)
