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

# Load courses.json
with open("scraper/courses.json", "r", encoding="utf-8") as f:
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
