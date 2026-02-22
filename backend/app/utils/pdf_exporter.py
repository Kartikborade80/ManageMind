from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO

def generate_quiz_pdf(attempt_data, questions_data):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Title
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 50, f"ManageMind - Quiz Output Report")
    
    # Summary
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 80, f"Topic: {attempt_data.topic}")
    p.drawString(50, height - 100, f"Score: {attempt_data.score} / {attempt_data.total_questions}")
    p.drawString(50, height - 120, f"Time Taken: {attempt_data.time_taken_seconds} seconds")
    p.drawString(50, height - 140, f"Mode: {attempt_data.mode.capitalize()}")
    
    y = height - 180
    
    # Questions
    for detail in attempt_data.details:
        q_id = int(detail['question_id'])
        mcq = next((q for q in questions_data if q.id == q_id), None)
        if not mcq:
            continue
            
        if y < 100:
            p.showPage()
            y = height - 50
            
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, f"Q: {mcq.question}")
        y -= 20
        
        # Options
        p.setFont("Helvetica", 10)
        for opt in mcq.options:
            prefix = "[ ] "
            if opt['id'] == detail['selected_option_id']:
                prefix = "[X] "
            p.drawString(60, y, f"{prefix} {opt['text']}")
            y -= 15
            
        y -= 5
        # Result
        if detail['is_correct']:
            p.setFillColorRGB(0, 0.5, 0) # Green
            p.drawString(60, y, "Result: Correct")
        else:
            p.setFillColorRGB(0.8, 0, 0) # Red
            p.drawString(60, y, f"Result: Incorrect (Correct was Option {mcq.correct_option_id})")
        
        p.setFillColorRGB(0, 0, 0) # Reset to black
        y -= 15
        p.setFont("Helvetica-Oblique", 10)
        p.drawString(60, y, f"Explanation: {mcq.explanation}")
        
        y -= 30
        
    p.save()
    buffer.seek(0)
    return buffer
