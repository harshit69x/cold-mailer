from fastapi import FastAPI, UploadFile, Form, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import aiosmtplib
from email.message import EmailMessage
import asyncio
import tempfile
import os
from dotenv import load_dotenv
import os

# Load the .env file
load_dotenv()

# Assign values from .env
SMTP_USER = os.getenv('SMTPUSER')
SMTP_PASS = os.getenv('SMTPPASSWORD')


app = FastAPI()

# ✅ Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can replace "*" with ["http://localhost:3000"] for Next.js local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SMTP Config (⚠️ In production, use environment variables!)
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 465
SMTP_USER = SMTP_USER
SMTP_PASS = SMTP_PASS  # ⚠️ Replace with secure env var in production

# Generate personalized email body from prompt
def generate_email_body(name, company, prompt: str):
    return prompt.format(name=name, company=company)

# Send a single email with attachment
async def send_email(to_email, subject, body, resume_path):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = SMTP_USER
    msg['To'] = to_email
    msg.set_content(body)

    with open(resume_path, 'rb') as f:
        msg.add_attachment(f.read(), maintype='application', subtype='pdf', filename='Resume.pdf')

    try:
        await aiosmtplib.send(
            msg,
            hostname=SMTP_SERVER,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASS,
            use_tls=True,
        )
        print(f"✅ Sent email to {to_email}")
    except aiosmtplib.SMTPAuthenticationError:
        print(f"❌ Authentication Error for {to_email}")
        raise
@app.get("/")
def index():
    return "Hello   "
# Main endpoint for sending emails
@app.post("/send-emails/")
async def send_emails(
    prompt: str = Form(...),
    subject: str = Form(...),
    excel_file: UploadFile = File(...),
    resume_file: UploadFile = File(...)
):
    # Save uploaded resume to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_resume:
        resume_path = tmp_resume.name
        tmp_resume.write(await resume_file.read())

    # Load and validate Excel file
    try:
        df = pd.read_excel(await excel_file.read())
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Excel file format")

    if not {'Name', 'Email', 'Company'}.issubset(df.columns):
        raise HTTPException(status_code=400, detail="Excel must contain 'Name', 'Email', 'Company' columns")

    # Limit concurrent sends
    semaphore = asyncio.Semaphore(3)
    results = []

    async def limited_send(row):
        async with semaphore:
            try:
                name = row['Name']
                email = row['Email']
                company = row['Company']
                body = generate_email_body(name, company, prompt)
                await send_email(email, subject, body, resume_path)
                results.append({"email": email, "status": "sent"})
            except Exception as e:
                results.append({"email": email, "status": f"failed - {str(e)}"})

    await asyncio.gather(*(limited_send(row) for _, row in df.iterrows()))
    os.remove(resume_path)

    return JSONResponse(content={"results": results})
