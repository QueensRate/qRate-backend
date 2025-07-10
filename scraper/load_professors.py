# scraper/load_professors.py
import json
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load MongoDB credentials from .env
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["qrate"]
professors_collection = db["professors"]

# Always resolve path relative to this script's location
base_dir = os.path.dirname(__file__)
json_path = os.path.join(base_dir, "professors.json")

# Load professors.json
with open(json_path, "r", encoding="utf-8") as f:
    professors = json.load(f)

# Insert or update professors
for professor in professors:
    if "name" not in professor:
        print("Skipping invalid professor entry (missing 'name')")
        continue

    existing = professors_collection.find_one({"name": professor["name"]})
    if existing:
        professors_collection.update_one({"name": professor["name"]}, {"$set": professor})
        print(f"🔁 Updated: {professor['name']}")
    else:
        professors_collection.insert_one(professor)
        print(f"✅ Inserted: {professor['name']}")
