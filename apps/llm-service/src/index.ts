import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/HuggingFaceTB/SmolLM3-3B/v1/chat/completions';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!HF_API_KEY) {
    return res.status(500).json({ error: 'HUGGINGFACE_API_KEY non défini' });
  }

  try {
    const response = await axios.post(
      HF_API_URL,
      {
        model: "HuggingFaceTB/SmolLM3-3B",
        stream: false,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content ?? "Aucune réponse.";
    res.json({ reply });

  } catch (error: any) {
    console.error('Erreur Hugging Face:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    res.status(500).json({ error: 'Erreur appel Hugging Face API' });
  }
});

app.listen(8000, () => {
  console.log('LLM Service running on port 8000 with HuggingFaceTB/SmolLM3-3B');
});
