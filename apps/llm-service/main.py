from fastapi import FastAPI, Request, HTTPException
import httpx
import os

app = FastAPI()

OLLAMA_API_URL = "http://ollama:11434/api/chat"

@app.post("/chat")
async def chat_endpoint(request: Request):
    try:
        body = await request.json()
        message = body.get("message", "")

        if not message:
            raise HTTPException(status_code=400, detail="Missing 'message' in request body")

        payload = {
            "model": "gemma:2b",
            "messages": [{"role": "user", "content": message}],
            "stream": False
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(OLLAMA_API_URL, json=payload)
            response.raise_for_status()
            data = response.json()
        
        reply = data.get("message", {}).get("content", "Pas de réponse")

        return {"reply": reply}

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"API Error: {e.response.text}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected Error: {str(e)}")
