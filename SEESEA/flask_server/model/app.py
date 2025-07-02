# File: flask_server/app.py

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
from concurrent.futures import ThreadPoolExecutor

# --- Flask 세팅 ---
app = Flask(__name__, static_folder="static")
app.config['JSON_AS_ASCII'] = False
CORS(app)

# --- 백그라운드 작업 큐 설정 ---
executor = ThreadPoolExecutor(max_workers=4)
jobs = {}

# --- Roboflow 설정 ---
RF_MODEL_SLUG = "fish-rqwia-ddoba/4"
RF_API_KEY    = "du3joF1n3DJxi8ajVqE8"

def detect_labels(image_bytes) -> list[str]:
    """
    Roboflow API 호출 (timeout 짧게)
    """
    url = f"https://detect.roboflow.com/{RF_MODEL_SLUG}"
    params = {"api_key": RF_API_KEY, "confidence": 30, "overlap": 0.5}
    try:
        resp = requests.post(
            url,
            params=params,
            files={"file": ("img", image_bytes)},
            timeout=(5, 15)
        )
        resp.raise_for_status()
        data = resp.json()
    except:
        return ["UnknownFish"]
    raw = [p.get("class", "") for p in data.get("predictions", [])]
    mapped = []
    for lbl in raw:
        if lbl == "--":
            mapped.append("참돔")
        elif lbl == "---":
            mapped.append("고등어")
        else:
            mapped.append(lbl or "UnknownFish")
    # 중복 제거
    seen, out = set(), []
    for l in mapped:
        if l not in seen:
            seen.add(l)
            out.append(l)
    return out or ["UnknownFish"]

# --- 메타데이터 생성 (Flan-T5) with 해시태그 보강 ---
text_gen = pipeline("text2text-generation", model="google/flan-t5-base", device=-1)
def generate_card_metadata(labels):
    prompt = (
        f"Labels: {labels}\n\n"
        "Return a JSON object with keys:\n"
        "  name: string,\n"
        "  hashtags: list of strings (each starting with '#'),\n"
        "  description: string.\n"
        "Do not include any other keys."
    )
    out = text_gen(prompt, max_length=128, do_sample=False)[0]["generated_text"]
    try:
        data = json.loads(out)
    except:
        data = {}
    # 기본값 설정
    name        = data.get("name") or (labels[0] if labels else "Unknown")
    hashtags    = data.get("hashtags") or []
    description = data.get("description") or ""

    # 비어 있으면 레이블로 태그 생성
    if not hashtags:
        hashtags = [f"#{lbl}" for lbl in labels]

    # 모든 태그가 '#'로 시작하도록 보장
    hashtags = [tag if tag.startswith('#') else f"#{tag}" for tag in hashtags]

    return {"name": name, "hashtags": hashtags, "description": description}

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
    """
    Stable Diffusion 으로 카드 일러스트 생성 후 저장
    """
    prompt = f"A collectible card illustration of a fish named '{name}', rarity {rarity} stars."
    image = sd_pipe(prompt, guidance_scale=7, num_inference_steps=10).images[0]
    fn = f"{uuid4()}.png"
    path = os.path.join(CARDS_DIR, fn)
    image.save(path)
    return f"/static/cards/{fn}"

def process_card(image_bytes, host_url):
    """
    백그라운드/동기 공통: 카드 생성 전체 로직
    """
    labels      = detect_labels(image_bytes)
    meta        = generate_card_metadata(labels)
    name        = meta["name"]
    hashtags    = meta["hashtags"]
    description = meta["description"]
    rarity      = random.randint(1, 5)
    image_path  = generate_card_image(name, rarity)
    image_url   = host_url.rstrip("/") + image_path
    return {
        "imageUrl":    image_url,
        "name":        name,
        "rarity":      rarity,
        "hashtags":    hashtags,
        "description": description
    }

# --- 1) 동기 예측 엔드포인트 ---
@app.route('/predict', methods=['POST'])
def predict():
    img = request.files.get('image')
    if not img:
        return jsonify({"error":"No image provided."}), 400
    image_bytes = img.stream.read()
    try:
        card = process_card(image_bytes, request.host_url)
    except Exception as e:
        return jsonify({"error": f"Card generation failed: {e}"}), 500
    return jsonify(card), 200

# --- 2) 비동기 작업 등록 엔드포인트 ---
@app.route('/predict_async', methods=['POST'])
def predict_async():
    img = request.files.get('image')
    if not img:
        return jsonify({"error":"No image provided."}), 400
    job_id = uuid4().hex
    image_bytes = img.stream.read()
    future = executor.submit(process_card, image_bytes, request.host_url)
    jobs[job_id] = future
    return jsonify({"job_id": job_id}), 202

# --- 3) 비동기 작업 상태 조회 엔드포인트 ---
@app.route('/predict_status/<job_id>', methods=['GET'])
def predict_status(job_id):
    future = jobs.get(job_id)
    if not future:
        return jsonify({"error":"Invalid job ID"}), 404
    if future.done():
        try:
            result = future.result()
            del jobs[job_id]
            return jsonify(result), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"status":"pending"}), 202

# --- 정적 파일 서빙 ---
@app.route('/static/cards/<path:filename>')
def serve_card(filename):
    return send_from_directory(CARDS_DIR, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
