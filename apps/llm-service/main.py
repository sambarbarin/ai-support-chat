from fastapi import FastAPI, Request, HTTPException
import httpx
import os

app = FastAPI()

API_URL = "https://api.accor-gpt.accor.net/"
API_KEY = os.getenv("ACCOR_API_KEY")  # charge de l'env ou par défaut

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

@app.post("/chat")
async def chat_endpoint(request: Request):
    try:
        body = await request.json()
        message = body.get("message", "")

        if not message:
            raise HTTPException(status_code=400, detail="Missing 'message' in request body")

        payload = {
            "model": "gpt-4",  # ou autre si besoin, adapte selon ton API
            "messages": [{"role": "user", "content": message}]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(API_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

        # adapte selon la structure de ta réponse
        reply = data.get("choices", [{}])[0].get("message", {}).get("content", "Pas de réponse")

        return {"reply": reply}

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"API Error: {e.response.text}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected Error: {str(e)}")
