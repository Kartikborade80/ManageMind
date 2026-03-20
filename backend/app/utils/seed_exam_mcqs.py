import asyncio
import os
import sys
import json

# Define the data to be seeded
MCQ_DATA_FILES = [
    "backend/data/unit1_mcqs.json",
    "backend/data/unit2_mcqs.json",
    "backend/data/unit3_mcqs.json",
    "backend/data/unit4_mcqs.json",
    "backend/data/unit5_mcqs.json"
]

async def seed_mcqs():
    # Explicitly load the backend .env file
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    env_path = os.path.join(project_root, "backend", ".env")
    from dotenv import load_dotenv
    load_dotenv(env_path)
    
    # Lazy imports to ensure environment is set up
    from backend.app.database import AsyncSessionLocal, engine, Base
    from backend.app.models.models import MCQ
    from sqlalchemy import delete
    
    # Ensure tables exist and clear old MCQ data
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(delete(MCQ))
        print("🗑️ Cleared existing MCQs from database.")

    async with AsyncSessionLocal() as session:
        print("🚀 Starting ManageMind Exam MCQ Seeding...")
        total_added = 0
        
        for file_path in MCQ_DATA_FILES:
            full_path = os.path.join(project_root, file_path)
            if not os.path.exists(full_path):
                print(f"⚠️ Warning: File {full_path} not found. Skipping.")
                continue
                
            with open(full_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                unit_key = list(data.keys())[0]  # e.g., 'unit1'
                questions = data[unit_key]
                
                print(f"📂 Processing {unit_key} from {file_path} ({len(questions)} questions)...")
                
                for q_data in questions:
                    mcq = MCQ(
                        unit=unit_key,
                        topic=q_data["topic"],
                        question=q_data["question"],
                        options=q_data["options"],
                        correct_option_id=q_data["correct_option_id"],
                        explanation=q_data["explanation"]
                    )
                    session.add(mcq)
                    total_added += 1
                
                # Commit per unit
                await session.commit()
                print(f"✅ Finished {unit_key}. Total so far: {total_added}")
        
        print(f"\n✨ Seeding completed! Total questions added: {total_added}")

if __name__ == "__main__":
    # Ensure project root is in path
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
        
    asyncio.run(seed_mcqs())
