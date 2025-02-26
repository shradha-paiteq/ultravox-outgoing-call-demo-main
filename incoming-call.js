const twilio = require("twilio");
const axios = require("axios");
const dotenv = require("dotenv");
const express = require("express");

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json()); // Ensure request body parsing

// Configuration
const ULTRAVOX_API_KEY = process.env.ULTRAVOX_API_KEY;
const ULTRAVOX_API_URL = "https://api.ultravox.ai/api/calls";

// Ultravox call configuration
const SYSTEM_PROMPT = "Your name is Steve. You are receiving a phone call. Ask them their name and see how they are doing.";
const ULTRAVOX_CALL_CONFIG = {
  systemPrompt: SYSTEM_PROMPT,
  model: "fixie-ai/ultravox",
  voice: "Mark",
  temperature: 0.3,
  firstSpeaker: "FIRST_SPEAKER_AGENT",
  medium: { twilio: {} },
};

// Function to create Ultravox call
async function createUltravoxCall() {
  try {
    const response = await axios.post(ULTRAVOX_API_URL, ULTRAVOX_CALL_CONFIG, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ULTRAVOX_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating Ultravox call:", error.response?.data || error.message);
    throw new Error("Failed to create Ultravox call");
  }
}

// Handle incoming calls
app.post("/incoming", async (req, res) => {
  try {
    console.log("Incoming call received");
    const response = await createUltravoxCall();

    const twiml = new twilio.twiml.VoiceResponse();
    const connect = twiml.connect();
    connect.stream({
      url: response.joinUrl,
      name: "ultravox",
    });

    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("Error handling incoming call:", error.message);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say("Sorry, there was an error connecting your call.");
    res.type("text/xml").send(twiml.toString());
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
