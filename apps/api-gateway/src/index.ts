//api-gateway/src/index.ts
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

function cleanResponse(text: string) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

app.get('/health', (_, res) => res.send('API Gateway is up'));

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    let prompt = '';
    for (const m of messages) {
      if (m.role === 'user') prompt += `Moi: ${m.content}\n`;
      else if (m.role === 'assistant') prompt += `Bot: ${m.content}\n`;
    }
    prompt += 'Bot: ';

    const response = await axios.post('http://llm-service:8000/generate', { prompt });

    if (response.data && response.data.reply) {
      const cleaned = cleanResponse(response.data.reply);
      return res.json({ answer: cleaned });
    } else {
      return res.status(500).json({ error: 'Invalid response from LLM service' });
    }
  } catch (err) {
    console.error('Error talking to LLM service:', err);
    return res.status(500).json({ error: 'LLM service failed' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
