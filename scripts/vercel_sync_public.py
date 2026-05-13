"""Copia static/ -> public/ no build da Vercel.

A CDN da Vercel serve ficheiros em public/ na raiz do domínio. O runtime Python
nem sempre empacota toda a pasta static/ na function; sem public/, pedidos como
/Setor%20Fiscal/index.html podem devolver 404 antes de chegar ao Flask.
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    src = root / "static"
    dst = root / "public"
    if not src.is_dir():
        print("ERRO: static/ não encontrado.", file=sys.stderr)
        sys.exit(1)
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)
    print("OK: public/ sincronizado a partir de static/")


if __name__ == "__main__":
    main()
