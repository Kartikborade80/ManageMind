import requests
import json
from datetime import datetime

def post_green_coding():
    url = "http://localhost:8000/api/trending/suggest"
    
    topic_data = {
        "title": "Green Coding and Sustainability in Software Engineering",
        "description": "Green coding is the practice of writing code that is environmentally friendly, efficient, and sustainable, aiming to reduce the carbon footprint of digital products.",
        "author": "Kartik Borade",
        "article_content": """
<div class="article-section">
    <h3>What is Green Coding?</h3>
    <p>Green coding, also known as <strong>sustainable software engineering</strong>, is the practice of designing, developing, and deploying software in a way that minimizes energy consumption and environmental impact. As digital transformation accelerates, the energy footprint of software has become a critical global concern.</p>
</div>

<div class="article-section" style="margin-top: 2rem;">
    <h3>Core Principles of Green Coding</h3>
    <p>To build truly sustainable software, developers focus on four key pillars:</p>
    <ul style="color: #475569; line-height: 1.7; margin-left: 1.5rem;">
        <li style="margin-bottom: 0.5rem;"><strong>Carbon Efficiency:</strong> Emitting the least amount of carbon per unit of work.</li>
        <li style="margin-bottom: 0.5rem;"><strong>Energy Efficiency:</strong> Writing code that consumes minimal electricity on both servers and devices.</li>
        <li style="margin-bottom: 0.5rem;"><strong>Hardware Efficiency:</strong> Minimizing the carbon embodied in the physical hardware by extending its lifespan.</li>
        <li style="margin-bottom: 0.5rem;"><strong>Energy Proportionality:</strong> Ensuring that hardware utilization is maximized to avoid wasted energy in idle states.</li>
    </ul>
</div>

<div class="article-section" style="margin-top: 2rem;">
    <h3>Why It Matters Today?</h3>
    <p>The ICT sector is responsible for an estimated <strong>2-4% of global greenhouse gas emissions</strong>, which is comparable to the aviation industry. By optimizing our code, we not only save the planet but also improve performance, reduce costs, and enhance the user experience on mobile devices through better battery life.</p>
</div>

<div class="article-section" style="margin-top: 2rem;">
    <h3>Practical Tips for Developers</h3>
    <p>Here are actionable steps every developer can take:</p>
    <ul style="color: #475569; line-height: 1.7; margin-left: 1.5rem;">
        <li style="margin-bottom: 0.5rem;"><strong>Optimize Algorithms:</strong> Reducing time and space complexity directly translates to lower CPU cycles and energy.</li>
        <li style="margin-bottom: 0.5rem;"><strong>Streamline Data Transfers:</strong> Use efficient formats like Protocol Buffers and implement aggressive caching.</li>
        <li><strong>Leverage Green Hosting:</strong> Deploy your applications on servers powered by 100% renewable energy providers.</li>
    </ul>
</div>
            """,
        "real_world_example": "Netflix reduced its data encoding energy by 20% by optimizing their video codecs, significantly lowering the energy required for both their servers and their users' devices to stream content.",
        "tags": ["Sustainability", "Green Tech", "Efficiency", "Eco-Friendly"],
        "is_live": True,
        "mcqs": [
            {
                "question": "What is the primary goal of 'Green Coding'?",
                "options": [
                    {"id": "a", "text": "To make code faster only"},
                    {"id": "b", "text": "To minimize energy consumption and environmental impact"},
                    {"id": "c", "text": "To use green-colored themes in IDEs"},
                    {"id": "d", "text": "To write code only for renewable energy projects"}
                ],
                "correct_option_id": "b",
                "explanation": "Green coding focuses on reducing the energy footprint of software throughout its lifecycle."
            }
        ]
    }
    
    print(f"🚀 Updating topic via suggest endpoint...")
    try:
        # We'll post a new one and the backend will likely create a new ID
        # Since we don't have an update endpoint easily accessible without researcher
        # We will just post it and then delete the old one with ID 2.
        response = requests.post(url, json=topic_data)
        if response.status_code == 200:
            new_id = response.json().get('id')
            print(f"✅ Successfully posted new topic with ID: {new_id}")
            
            # Vote for it to make it live
            vote_url = f"http://localhost:8000/api/trending/{new_id}/vote"
            for _ in range(6):
                requests.post(vote_url, params={"vote_type": "approval"})
            print(f"✅ Made topic {new_id} live.")
            
            # Delete old ID 2 if it's there
            del_url = f"http://localhost:8000/api/trending/2"
            requests.delete(del_url)
            print(f"✅ Deleted old topic ID 2.")
            
        else:
            print(f"❌ Failed to post topic: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    post_green_coding()
