from __future__ import annotations

import sys
from pathlib import Path

import fitz


ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "analysis" / "pdf_pages"
SOURCE_FILE = ROOT / "游戏纸面原型.pdf"


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    document = fitz.open(SOURCE_FILE)
    try:
        for index, page in enumerate(document, start=1):
            matrix = fitz.Matrix(2, 2)
            pixmap = page.get_pixmap(matrix=matrix, alpha=False)
            target = OUTPUT_DIR / f"page-{index:02d}.png"
            pixmap.save(target)
            print(target.name)
    finally:
        document.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())