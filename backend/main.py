from fastapi import FastAPI, UploadFile, File
import shutil
import os
import easyocr
import requests
from dotenv import load_dotenv
import cv2
from fastapi.middleware.cors import CORSMiddleware
# Load environment variables
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# EasyOCR reader
reader = easyocr.Reader(['en'])

# Upload folder
UPLOAD_FOLDER = "uploads"

# Create uploads folder if not exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -----------------------------
# Image Preprocessing Function
# -----------------------------
def preprocess_image(image_path):

    # Read image
    image = cv2.imread(image_path)

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Resize image
    gray = cv2.resize(gray, None, fx=2, fy=2)

    # Light denoising only
    gray = cv2.medianBlur(gray, 3)

    # Save processed image
    processed_path = os.path.join(
        UPLOAD_FOLDER,
        "processed_" + os.path.basename(image_path)
    )

    cv2.imwrite(processed_path, gray)

    return processed_path


# # -----------------------------
# # Image Preprocessing Function (failed version)
# # -----------------------------
# def preprocess_image(image_path):

#     # Read image
#     image = cv2.imread(image_path)

#     # Convert to grayscale
#     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

#     # Resize image (helps OCR)
#     gray = cv2.resize(gray, None, fx=2, fy=2)

#     # Reduce noise
#     gray = cv2.GaussianBlur(gray, (5, 5), 0)

#     # Thresholding (improves text visibility)
#     processed = cv2.threshold(
#         gray,
#         0,
#         255,
#         cv2.THRESH_BINARY + cv2.THRESH_OTSU
#     )[1]

#     # Save processed image
#     processed_path = os.path.join(
#         UPLOAD_FOLDER,
#         "processed_" + os.path.basename(image_path)
#     )

#     cv2.imwrite(processed_path, processed)

#     return processed_path


# -----------------------------
# AI Summarization Function
# -----------------------------
def summarize_text(text):

    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a professional document summarizer. "
                    "Summarize documents clearly in simple bullet points."
                )
            },
            {
                "role": "user",
                "content": f"""
                Summarize this document.

                Give:
                1. Main purpose
                2. Important points
                3. Key details

                Document:
                {text}
                """
            }
        ]
    }

    try:

        response = requests.post(
            url,
            headers=headers,
            json=payload
        )

        data = response.json()

        print("API RESPONSE:")
        print(data)

        # Success response
        if "choices" in data:
            return data["choices"][0]["message"]["content"]

        # Error response
        elif "error" in data:
            return f"API Error: {data['error']['message']}"

        else:
            return "Unknown API response."

    except Exception as e:
        return f"Exception Occurred: {str(e)}"


# -----------------------------
# Home Route
# -----------------------------
@app.get("/")
def home():
    return {"message": "Backend Working"}


# -----------------------------
# Upload Route
# -----------------------------
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    try:

        # Save uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # OCR extraction
        # Preprocess image
        processed_path = preprocess_image(file_path)

        # OCR on processed image
        result = reader.readtext(processed_path, detail=0)

        print("OCR RESULT:")
        print(result)

        # Convert list to string
        extracted_text = " ".join(result)

        # Generate summary
        summary = summarize_text(extracted_text)

        return {
            "filename": file.filename,
            "extracted_text": extracted_text,
            "summary": summary
        }

    except Exception as e:

        return {
            "error": str(e)
        }