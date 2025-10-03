import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS  # <-- 1. Importar CORS
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configurar la API de Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

# Cargar el prompt desde el archivo
with open('prompt.txt', 'r', encoding='utf-8') as f:
    prompt_texto = f.read()

# Iniciar el chat con el historial y el prompt
chat = model.start_chat(history=[
    {'role': 'user', 'parts': [prompt_texto]},
    {'role': 'model', 'parts': ["Entendido. Estoy listo para actuar como IMA Planner."]}
])

# Inicializar la aplicación Flask
app = Flask(__name__)
CORS(app)  # <-- 2. Habilitar CORS para toda la aplicación

@app.route("/chat", methods=["POST"])
def handle_chat():
    try:
        user_message = request.json.get("message")
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Enviar el mensaje del usuario al modelo
        response = chat.send_message(user_message)

        # Devolver la respuesta del modelo
        return jsonify({"response": response.text})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred"}), 500

if __name__ == "__main__":
    app.run(debug=True)