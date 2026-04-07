import axios from 'axios';

/**
 * Connects to the FastAPI backend.
 * Base URL includes the /api prefix defined in main.py
 */
const API_BASE_URL = "http://localhost:8000/api";

export const voiceQuery = async (audioBlob) => {
  // We must send audio as 'multipart/form-data' so FastAPI can read the file
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');

  try {
    console.log("Sending voice query to backend...");
    const response = await axios.post(`${API_BASE_URL}/voice-query`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // The response contains { transcript, answer, audio (hex) }
    return response.data;
  } catch (error) {
    console.error("Connection to Backend Failed:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Optional: Direct text query if voice is not used
 */
export const queryRAG = async (text) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error);
    throw error;
  }
};