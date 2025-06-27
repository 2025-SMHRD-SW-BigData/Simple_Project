# app.py

from flask import Flask, request, jsonify
import requests
import openai
import json

app = Flask(__name__)

# --- Roboflow 객체 인식 설정 (하드코딩 예시) ---
RF_MODEL_SLUG = "fish-rqwia-ddoba/4"
RF_API_KEY    = "du3joF1n3DJxi8ajVqE8"

def detect_labels(image_file) -> list[str]:
    url = f"https://detect.roboflow.com/{RF_MODEL_SLUG}"
    params = {
        "api_key": RF_API_KEY,
        "confidence": 30,
        "overlap": 0.5
    }
    files = {
        "file": (
            image_file.filename,
            image_file.stream.read(),
            image_file.mimetype
        )
    }
    resp = requests.post(url, params=params, files=files, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    return [p["class"] for p in data.get("predictions", [])]

# --- OpenAI 생성형 AI 설정 (하드코딩 예시) ---
openai.api_key = "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"

def generate_card(labels: list[str]) -> dict:
    system_prompt = "You are an expert at generating fish encyclopedia cards."
    user_prompt = (
        f"Generate a JSON object for a fish encyclopedia card based on these labels:\n"
        f"{labels}\n\n"
        "Return JSON in this structure:\n"
        "{\n"
        '  "imageUrl": "<URL>",\n'
        '  "name": "<fish name>",\n'
        '  "rarity": <1-5 integer>,\n'
        '  "hashtags": ["tag1","tag2"],\n'
        '  "description": "<short description>"\n'
        "}\n"
    )
    resp = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt}
        ],
        max_tokens=300,
        temperature=0.7
    )
    text = resp.choices[0].message.content.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON from OpenAI: {text}")

@app.route('/predict', methods=['POST'])
def predict():
    img = request.files.get('image')
    if not img:
        return jsonify({"error": "No image provided."}), 400

    # 1) 객체 인식
    labels = detect_labels(img)
    # 2) 생성형 AI
    try:
        card = generate_card(labels)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # 3) AI가 만든 JSON 그대로 반환
    return jsonify(card), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
