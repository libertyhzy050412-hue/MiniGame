from __future__ import annotations

import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "analysis" / "extracted"
WORD_NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def clean_text(raw: str) -> str:
    text = raw.replace("\u3000", " ")
    text = text.replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip() + "\n"


def extract_docx(path: Path) -> str:
    with zipfile.ZipFile(path) as archive:
        document_xml = archive.read("word/document.xml")

    root = ET.fromstring(document_xml)
    paragraphs: list[str] = []

    for paragraph in root.findall(".//w:p", WORD_NS):
        runs = [node.text for node in paragraph.findall(".//w:t", WORD_NS) if node.text]
        if runs:
            paragraphs.append("".join(runs))
        else:
            paragraphs.append("")

    return clean_text("\n".join(paragraphs))


def extract_pdf(path: Path) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise RuntimeError("missing dependency: pypdf") from exc

    reader = PdfReader(str(path))
    pages: list[str] = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")

    return clean_text("\n\n".join(pages))


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    extracted = 0
    skipped: list[str] = []

    for source in sorted(ROOT.glob("*.docx")):
        content = extract_docx(source)
        target = OUTPUT_DIR / f"{source.stem}.txt"
        target.write_text(content, encoding="utf-8")
        extracted += 1

    for source in sorted(ROOT.glob("*.pdf")):
        try:
            content = extract_pdf(source)
        except RuntimeError:
            skipped.append(f"{source.name}: missing dependency pypdf")
            continue

        target = OUTPUT_DIR / f"{source.stem}.txt"
        target.write_text(content, encoding="utf-8")
        extracted += 1

    print(f"extracted={extracted}")
    for item in skipped:
        print(f"skipped={item}")
    return 0


if __name__ == "__main__":
    sys.exit(main())