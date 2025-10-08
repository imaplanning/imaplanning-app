import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# --- INICIO DEL CAMBIO ---
# Se actualiza al modelo Gemini 1.5 Flash para máxima compatibilidad
model = genai.GenerativeModel('gemini-1.5-flash-latest')
# --- FIN DEL CAMBIO ---

with open('prompt.txt', 'r', encoding='utf-8') as f:
    prompt_texto = f.read()

chat = model.start_chat(history=[
    {'role': 'user', 'parts': [prompt_texto]},
    {'role': 'model', 'parts': ["Entendido. Estoy listo para actuar como IMA Planner."]}
])

app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def handle_chat():
    try:
        user_message = request.json.get("message")
        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        response = chat.send_message(user_message)
        return jsonify({"response": response.text})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "An error occurred"}), 500

if __name__ == "__main__":
    app.run(debug=True)