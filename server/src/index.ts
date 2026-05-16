import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { initFirebaseAdmin } from './firebase';
import { orchestrator } from './orchestrator';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (process.env.GOOGLE_APPLICATION_CREDENTIALS && !path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, '../../', process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
initFirebaseAdmin();

app.post('/api/signal', async (req, res) => {
  const { signal } = req.body;
  
  if (!signal) {
    return res.status(400).json({ error: 'Signal is required' });
  }

  try {
    console.log(`Received signal: ${signal}`);
    const result = await orchestrator.executeWorkflow(signal);
    res.json(result);
  } catch (error: any) {
    console.error('Error executing workflow:', error);
    res.status(500).json({ error: 'Workflow execution failed', details: error.message });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CIRO Server is running on port ${PORT}`);
});
