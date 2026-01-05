import { AppError } from './errorHandler.js';

const TTS_SERVICE_URL = process.env.TTS_SERVICE_URL || 'http://localhost:5001';

// Convert text to speech using Edge-TTS Python service
export const textToSpeech = async (text, voice = 'en-US-JennyNeural') => {
  try {
    const response = await fetch(`${TTS_SERVICE_URL}/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        voice
      })
    });

    if (!response.ok) {
      throw new AppError('TTS service error', response.status, 'TTS_ERROR');
    }

    // Return audio as buffer
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('TTS Service Error:', error);
    
    // Silent fallback - return null instead of throwing
    if (error.code === 'ECONNREFUSED') {
      console.log('TTS service not available, skipping audio generation');
      return null;
    }
    
    throw error;
  }
};

// Get available voices
export const getVoices = async () => {
  try {
    const response = await fetch(`${TTS_SERVICE_URL}/voices`);
    if (!response.ok) {
      throw new AppError('Could not fetch voices', response.status);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching voices:', error);
    // Return default voices as fallback
    return [
      { name: 'en-US-JennyNeural', language: 'English (US)', gender: 'Female' },
      { name: 'en-US-GuyNeural', language: 'English (US)', gender: 'Male' },
      { name: 'en-IN-NeerjaNeural', language: 'English (India)', gender: 'Female' },
      { name: 'en-IN-PrabhatNeural', language: 'English (India)', gender: 'Male' }
    ];
  }
};

export default { textToSpeech, getVoices };
