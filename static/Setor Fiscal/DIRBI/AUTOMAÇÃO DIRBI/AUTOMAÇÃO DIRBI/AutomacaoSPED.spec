# -*- mode: python ; coding: utf-8 -*-
# Arquivo de especificação para PyInstaller
# Garante que todas as dependências sejam incluídas no executável

block_cipher = None

a = Analysis(
    ['automacao_sped.py'],
    pathex=[],
    binaries=[],
    datas=[],  # PyInstaller detecta automaticamente arquivos de dados
    hiddenimports=[
        # OpenPyXL - Módulos principais
        'openpyxl',
        'openpyxl.cell',
        'openpyxl.cell._writer',
        'openpyxl.workbook',
        'openpyxl.workbook.workbook',
        'openpyxl.worksheet',
        'openpyxl.worksheet._reader',
        'openpyxl.worksheet._writer',
        'openpyxl.styles',
        'openpyxl.styles.fonts',
        'openpyxl.styles.fills',
        'openpyxl.styles.alignment',
        'openpyxl.styles.borders',
        'openpyxl.styles.numbers',
        'openpyxl.utils',
        'openpyxl.utils.datetime',
        'openpyxl.utils.exceptions',
        'openpyxl.xml',
        'openpyxl.xml.constants',
        'openpyxl.compat',
        'openpyxl.compat.numbers',
        # Tkinter - Interface gráfica
        'tkinter',
        'tkinter.ttk',
        'tkinter.filedialog',
        'tkinter.messagebox',
        'tkinter.font',
        'tkinter.constants',
        # Módulos padrão do Python
        'collections',
        'collections.abc',
        'pathlib',
        're',
        'os',
        'sys',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib',  # Não usado
        'numpy',  # Não usado
        'pandas',  # Não usado
        'PIL',  # Não usado
        'scipy',  # Não usado
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='AutomacaoSPED',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)

