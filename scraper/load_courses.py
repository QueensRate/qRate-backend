# scraper/load_courses.py
import json
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load MongoDB credentials from .env
load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["qrate"]
courses_collection = db["courses"]

# Always resolve path relative to this script's location
base_dir = os.path.dirname(__file__)  # directory containing this script
json_path = os.path.join(base_dir, "courses.json")

# Load courses.json
with open(json_path, "r", encoding="utf-8") as f:
    courses = json.load(f)

# Insert or update courses
for course in courses:
    if "code" not in course:
        print("Skipping invalid course entry (missing 'code')")
        continue

    existing = courses_collection.find_one({"code": course["code"]})
    if existing:
        courses_collection.update_one({"code": course["code"]}, {"$set": course})
        print(f"🔁 Updated: {course['code']}")
    else:
        courses_collection.insert_one(course)
        print(f"✅ Inserted: {course['code']}")