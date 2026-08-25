import json
import os
import requests
import time

API_KEY = os.environ.get("GEMINI_API_KEY")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={API_KEY}"

ids = []
texts = []
with open('backend/src/main/resources/db/migration/V2__seed_data.sql', 'r') as f:
    lines = f.readlines()
    for line in lines:
        if line.startswith("('") and len(line.split(",")) > 5:
            parts = line.split("'")
            if len(parts) > 5:
                c_id = parts[1]
                title = parts[3]
                desc = parts[5]
                if len(c_id) == 36: # uuid
                    ids.append(c_id)
                    texts.append(title + " " + desc)

print(f"Found {len(ids)} items")

# Use batch API
BATCH_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key={API_KEY}"

sql = ""
# Batch embed up to 100 at a time (Gemini limit)
batch_requests = []
for text in texts:
    batch_requests.append({
        "model": "models/gemini-embedding-001",
        "content": {"parts": [{"text": text}]}
    })

resp = requests.post(BATCH_URL, json={"requests": batch_requests})
if resp.status_code == 200:
    embeddings = resp.json().get("embeddings", [])
    for i, emb in enumerate(embeddings):
        emb_str = json.dumps(emb["values"])
        sql += f"UPDATE catalog_items SET embedding = '{emb_str}' WHERE id = '{ids[i]}';\n"
else:
    print("Batch failed, trying individually", resp.text)
    for i in range(len(ids)):
        body = {
            "model": "models/gemini-embedding-001",
            "content": {"parts": [{"text": texts[i]}]}
        }
        resp = requests.post(URL, json=body)
        if resp.status_code == 200:
            emb = resp.json()["embedding"]["values"]
            emb_str = json.dumps(emb)
            sql += f"UPDATE catalog_items SET embedding = '{emb_str}' WHERE id = '{ids[i]}';\n"
        else:
            print(f"Error {resp.status_code} for item {i}")
            time.sleep(5)
            resp = requests.post(URL, json=body)
            if resp.status_code == 200:
                emb = resp.json()["embedding"]["values"]
                emb_str = json.dumps(emb)
                sql += f"UPDATE catalog_items SET embedding = '{emb_str}' WHERE id = '{ids[i]}';\n"
        time.sleep(1) # wait 1 sec between requests

with open('backend/src/main/resources/db/migration/V3__add_embeddings.sql', 'w') as f:
    f.write("ALTER TABLE catalog_items ADD COLUMN IF NOT EXISTS embedding jsonb;\n\n")
    f.write(sql)
print("Done")
