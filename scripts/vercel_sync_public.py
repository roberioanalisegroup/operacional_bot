"""Copia static/ -> public/ no build da Vercel, sanitizando nomes.

Problema: o CDN do Vercel não resolve paths com espaços/acentos mesmo com
%20.  Para contornar, os diretórios e arquivos são renomeados:
  - espaços -> hífens
  - caracteres acentuados -> equivalente ASCII  (NFC + unidecode-light)
  - resultado em minúsculas

Exemplo:  "Setor Fiscal" -> "setor-fiscal"
          "AJUSTE DE INVENTÁRIO POR EXCEL" -> "ajuste-de-inventario-por-excel"
"""
from __future__ import annotations

import re
import shutil
import sys
import unicodedata
from pathlib import Path


def _slug(name: str) -> str:
    """Converte um nome de diretório/arquivo em slug seguro para URL."""
    # Normaliza para NFC e remove acentos
    nfkd = unicodedata.normalize("NFKD", name)
    ascii_only = nfkd.encode("ascii", "ignore").decode("ascii")
    # Substitui espaços e underscores por hífens, remove caracteres especiais
    slug = re.sub(r"[^\w\-.]", "-", ascii_only)
    # Colapsa hífens múltiplos
    slug = re.sub(r"-{2,}", "-", slug)
    # Remove hífens no início/fim
    slug = slug.strip("-")
    return slug.lower()


def _copy_tree_sanitized(src: Path, dst: Path) -> None:
    """Copia a árvore de src para dst, sanitizando nomes de dirs e arquivos."""
    dst.mkdir(parents=True, exist_ok=True)

    for item in sorted(src.iterdir()):
        safe_name = _slug(item.name)
        target = dst / safe_name

        if item.is_dir():
            _copy_tree_sanitized(item, target)
        elif item.is_file():
            shutil.copy2(item, target)


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    src = root / "static"
    dst = root / "public"
    if not src.is_dir():
        print("ERRO: static/ não encontrado.", file=sys.stderr)
        sys.exit(1)
    if dst.exists():
        shutil.rmtree(dst)

    _copy_tree_sanitized(src, dst)

    # Gera mapeamento para debug
    print("OK: public/ sincronizado com nomes sanitizados.")
    print("Mapeamento dos setores:")
    for d in sorted(src.iterdir()):
        if d.is_dir():
            print(f"  {d.name}  ->  {_slug(d.name)}")


if __name__ == "__main__":
    main()
