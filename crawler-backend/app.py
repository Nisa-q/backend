from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import time
import subprocess
import requests
from bs4 import BeautifulSoup
import re  # eklendi

app = Flask(__name__)
CORS(app)

# In-memory storage
jobs = {}
history = []
urls = []
points = 0

# Gerçek katana crawler (subprocess ile)
def katana_crawl(site_url):
    try:
        result = subprocess.check_output([
            "katana", "-u", site_url, "-o", "stdout"
        ], stderr=subprocess.STDOUT, timeout=120, text=True)  # timeout artırıldı
        print(f"[DEBUG] Katana raw output for {site_url}:\n{result}", flush=True)
        found_urls = set()
        for line in result.splitlines():
            line = line.strip()
            if line.startswith("http://") or line.startswith("https://"):
                found_urls.add(line)
        print(f"[DEBUG] Katana found URLs for {site_url}: {found_urls}", flush=True)
        return list(found_urls)
    except subprocess.TimeoutExpired:
        print(f"Katana error: Crawl for {site_url} timed out!", flush=True)
        return "timeout"
    except Exception as e:
        print(f"Katana error: {e}", flush=True)
        return []

@app.route("/")
def index():
    return jsonify({"message": "API is running"})

@app.route("/run_job", methods=["POST"])
def run_job():
    data = request.json
    job_name = data.get("job_name")

    # Komut çalıştırıcı
    if job_name == "command_runner":
        command = data.get("command")
        if not command:
            return jsonify({"error": "command is required"}), 400
        try:
            result = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT, timeout=5, text=True)
        except subprocess.CalledProcessError as e:
            result = e.output
        except Exception as e:
            result = str(e)

        # 🔍 URL'leri komut çıktısından bul
        url_regex = r"https?://[^\s\"'>]+"
        found_urls = re.findall(url_regex, result)
        url_count = len(found_urls)

        task_id = str(uuid.uuid4())
        jobs[task_id] = {
            "task_id": task_id,
            "result": result,
            "type": "command_runner",
            "command": command,
            "found": found_urls  # opsiyonel
        }

        history.append({
            "id": len(history) + 1,
            "task_id": task_id,
            "timestamp": time.time(),
            "status": "completed",
            "resultCount": url_count,
            "type": "command_runner"
        })

        return jsonify({"task_id": task_id}), 202

    # Katana crawler
    elif job_name == "katana_crawler":
        url = data.get("url")
        if not url:
            return jsonify({"error": "url is required"}), 400
        found_urls = katana_crawl(url)
        if found_urls == "timeout":
            return jsonify({"error": "Crawl işlemi zaman aşımına uğradı. Lütfen daha küçük bir site deneyin veya daha sonra tekrar deneyin."}), 504
        print(f"[DEBUG] After katana_crawl, found_urls: {found_urls}", flush=True)
        new_urls = []
        existing = set(u['url'] for u in urls)
        for u in found_urls:
            if u not in existing:
                urls.append({"id": len(urls)+1, "url": u, "status": "success", "crawledAt": time.time()})
                new_urls.append(u)
        print(f"[DEBUG] New URLs added: {new_urls}", flush=True)
        task_id = str(uuid.uuid4())
        jobs[task_id] = {
            "task_id": task_id,
            "result": f"{len(new_urls)} url bulundu",
            "type": "katana_crawler",
            "url": url,
            "found": new_urls
        }
        history.append({
            "id": len(history)+1,
            "task_id": task_id,
            "timestamp": time.time(),
            "status": "completed",
            "resultCount": len(new_urls),
            "type": "katana_crawler"
        })
        return jsonify({"task_id": task_id}), 202

    # Bilinmeyen job
    else:
        return jsonify({"error": "Bilinmeyen job ismi"}), 400

@app.route("/job_result/<task_id>")
def get_result(task_id):
    res = jobs.get(task_id)
    if res:
        return jsonify(res)
    else:
        return jsonify({"error": "Not found"}), 404

@app.route("/history")
def get_history():
    return jsonify(history)

@app.route("/urls")
def get_urls():
    # Pagination and filtering support
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 10))
    search = request.args.get("search", "").lower()
    status = request.args.get("status", "")
    filtered = urls
    if search:
        filtered = [u for u in filtered if search in u["url"].lower()]
    if status:
        filtered = [u for u in filtered if u["status"] == status]
    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    paged_urls = filtered[start:end]
    return jsonify({
        "data": paged_urls,
        "total": total,
        "page": page,
        "pageSize": page_size
    })

@app.route("/total_urls")
def total_urls():
    # Filtreye göre toplamı döndür
    search = request.args.get("search", "").lower()
    status = request.args.get("status", "")
    filtered = urls
    if search:
        filtered = [u for u in filtered if search in u["url"].lower()]
    if status:
        filtered = [u for u in filtered if u["status"] == status]
    return jsonify({"totalUrls": len(filtered)})

@app.route("/points")
def get_points():
    return jsonify({"points": points})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
