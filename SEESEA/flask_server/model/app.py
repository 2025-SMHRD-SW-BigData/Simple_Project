from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import json
import os
import random
from uuid import uuid4
from transformers import pipeline
from diffusers import StableDiffusionPipeline
import torch

# --- Flask 세팅 ---
app = Flask(__name__, static_folder="static")
app.config['JSON_AS_ASCII'] = False
CORS(app)

# --- Roboflow 설정 ---
RF_MODEL_SLUG = "fish-rqwia-ddoba/4"
RF_API_KEY    = "du3joF1n3DJxi8ajVqE8"

def detect_labels(image_file) -> list[str]:
    url = f"https://detect.roboflow.com/{RF_MODEL_SLUG}"
    params = {"api_key": RF_API_KEY, "confidence": 30, "overlap": 0.5}
    files = {"file": (image_file.filename, image_file.stream.read(), image_file.mimetype)}
    resp = requests.post(url, params=params, files=files, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    print("=== Raw Predictions ===")
    raw = []
    for p in data.get("predictions", []):
        cls, conf = p.get("class",""), p.get("confidence",0)
        print(f"클래스: {cls}, 신뢰도: {conf:.1f}%")
        raw.append(cls)
    print("=======================")

    mapped = []
    for lbl in raw:
        if lbl == "--":    mapped.append("참돔")
        elif lbl == "---": mapped.append("고등어")
        else:              mapped.append(lbl)
    if not mapped:
        return ["UnknownFish"]

    seen, result = set(), []
    for lbl in mapped:
        if lbl not in seen:
            seen.add(lbl)
            result.append(lbl)
    return result

# --- 메타데이터 생성 (Flan-T5) ---
text_gen = pipeline("text2text-generation", model="google/flan-t5-base", device=-1)

def generate_card_metadata(labels: list[str]) -> dict:
    prompt = (
        f"Labels: {labels}\n\n"
        "Return JSON with keys: name, hashtags (list), description."
    )
    out = text_gen(prompt, max_length=128, do_sample=False)[0]["generated_text"]
    try:
        return json.loads(out)
    except json.JSONDecodeError:
        return {
            "name": labels[0] if labels else "Unknown",
            "hashtags": [],
            "description": ""
        }

# --- Stable Diffusion 세팅 ---
device = "cuda" if torch.cuda.is_available() else "cpu"
sd_pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16 if device=="cuda" else torch.float32
).to(device)
sd_pipe.enable_attention_slicing()
try:
    sd_pipe.enable_xformers_memory_efficient_attention()
except:
    pass

# 이미지 저장 디렉토리
CARDS_DIR = os.path.join(app.static_folder, "cards")
os.makedirs(CARDS_DIR, exist_ok=True)

def generate_card_image(name: str, rarity: int) -> str:
    # AI 이미지 생성 (배경 포함)
    prompt = f"A collectible card illustration of a fish named '{name}', rarity {rarity} stars."
    image = sd_pipe(prompt, guidance_scale=7, num_inference_steps=15).images[0]
    filename = f"{uuid4()}.png"
    path = os.path.join(CARDS_DIR, filename)
    image.save(path)
    return f"/static/cards/{filename}"

# --- /predict 엔드포인트 ---
@app.route('/predict', methods=['POST'])
def predict():
    img = request.files.get('image')
    if not img:
        return jsonify({"error":"No image provided."}),400

    labels = detect_labels(img)
    meta   = generate_card_metadata(labels)
    name   = meta.get("name","Unknown")
    hashtags    = meta.get("hashtags",[])
    description = meta.get("description","")
    rarity = random.randint(1,5)

    try:
        image_url = generate_card_image(name, rarity)
    except Exception as e:
        return jsonify({"error":f"Image gen failed: {e}"}),500

    card = {
        "imageUrl": request.host_url.rstrip("/") + image_url,
        "name": name,
        "rarity": rarity,
        "hashtags": hashtags,
        "description": description
    }
    return jsonify(card),200

# --- 정적 파일 서빙 ---
@app.route('/static/cards/<path:filename>')
def serve_card(filename):
    return send_from_directory(CARDS_DIR,filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
