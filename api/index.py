"""Entry-point da serverless function do Vercel.

O runtime @vercel/python procura um objeto WSGI/ASGI chamado ``app``
neste ficheiro. Basta importar a factory e instanciar.
"""
from app import create_app

app = create_app()
