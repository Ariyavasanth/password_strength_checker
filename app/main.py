from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import re

app = FastAPI()
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

SPECIAL_CHARS = set("!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?`~")

class CheckRequest(BaseModel):
    password: str

def evaluate_password(password: str):
    score = 0
    reasons = []

    length = len(password)
    if length >= 12:
        score += 1
    else:
        reasons.append("Use 12+ characters for better security")

    if re.search(r"[a-z]", password):
        score += 1
    else:
        reasons.append("Add lowercase letters")

    if re.search(r"[A-Z]", password):
        score += 1
    else:
        reasons.append("Add uppercase letters")

    if re.search(r"[0-9]", password):
        score += 1
    else:
        reasons.append("Add numbers")

    has_special = any(ch in SPECIAL_CHARS for ch in password)
    if not has_special:
        reasons.append("Add special characters like !@#$%")

    weak_patterns = [r"password", r"1234", r"qwerty", r"admin", r"letmein"]
    lowered = password.lower()
    for p in weak_patterns:
        if re.search(p, lowered):
            reasons.append("Avoid common patterns like 'password' or '1234'")
            break

    if score <= 1:
        label = "Very Weak"
    elif score == 2:
        label = "Weak"
    elif score == 3:
        label = "Medium"
    else:
        label = "Strong"

    return {
        "score": score,
        "label": label,
        "length": length,
        "reasons": reasons,
    }

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/check")
async def api_check(req: CheckRequest):
    result = evaluate_password(req.password)
    return JSONResponse(content=result)
