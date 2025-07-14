import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OLLAMA_API_URL = 'http://ollama:11434/api/chat';

app.post('/generate', async (req: Request, res: Response) => {
  const { messages } = req.body;

  try {
    const response = await axios.post(
      OLLAMA_API_URL,
      {
        model: "mistral",
        stream: false,
        messages: messages
      }
    );

    const reply = response.data?.message?.content ?? "Aucune réponse.";
    res.json({ reply });

  } catch (error: any) {
    console.error('Erreur Ollama:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    res.status(500).json({ error: 'Erreur appel Ollama API' });
  }
});

app.listen(8000, () => {
  console.log('LLM Service running on port 8000 with Ollama');
});
