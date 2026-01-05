import express from 'express';
import { asyncHandler } from '../services/errorHandler.js';
import { textToSpeech, getVoices } from '../services/ttsService.js';

const router = express.Router();

// Synthesize text to speech
router.post('/synthesize', asyncHandler(async (req, res) => {
  const { text, voice } = req.body;

  if (!text) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_TEXT', message: 'No text provided' }
    });
  }

  // Limit text length
  const truncatedText = text.slice(0, 1000);

  const audioBuffer = await textToSpeech(truncatedText, voice);

  if (!audioBuffer) {
    return res.status(503).json({
      success: false,
      error: { code: 'TTS_UNAVAILABLE', message: 'TTS service is not available' }
    });
  }

  res.set({
    'Content-Type': 'audio/mpeg',
    'Content-Length': audioBuffer.length
  });
  res.send(audioBuffer);
}));

// Get available voices
router.get('/voices', asyncHandler(async (req, res) => {
  const voices = await getVoices();
  res.json({ success: true, data: voices });
}));

export default router;
