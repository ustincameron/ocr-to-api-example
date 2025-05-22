# services/pdf_parser.py
from .ocr_service import extract_text_from_pdf
from .ollama_service import parse_text_with_ollama
from .openai_service import parse_text_with_openai

def extract_patient_data(pdf_path: str, use_ollama: bool = False) -> dict | None:
    try:
        print(f"[pdf_parser] Loading PDF: {pdf_path}")
        text = extract_text_from_pdf(pdf_path)
        if use_ollama:
            return parse_text_with_ollama(text)
        else:
            return parse_text_with_openai(text)
    except Exception as e:
        print(f"[pdf_parser] Error: {e}")
        return None
