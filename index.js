const twilio = require("twilio");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const DESTINATION_PHONE_NUMBER = process.env.DESTINATION_PHONE_NUMBER;

// Ultravox configuration
const ULTRAVOX_API_KEY = process.env.ULTRAVOX_API_KEY;
const SYSTEM_PROMPT = "Your name is Steve and you are calling a person on the phone. Ask them their name and see how they are doing.";

const ULTRAVOX_CALL_CONFIG = {
  systemPrompt: SYSTEM_PROMPT,
  model: "fixie-ai/ultravox",
  voice: "Mark", 
  temperature: 0.3,
  firstSpeaker: "FIRST_SPEAKER_USER",
  medium: { twilio: {} },
};

const ULTRAVOX_API_URL = "https://api.ultravox.ai/api/calls";

async function createUltravoxCall() {
  try {
    const response = await axios.post(ULTRAVOX_API_URL, ULTRAVOX_CALL_CONFIG, { 
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ULTRAVOX_API_KEY,
      },
    });
    console.log(response);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Ultravox API error:", error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log("Creating Ultravox call...");
    const { joinUrl } = await createUltravoxCall();
    console.log("Got joinUrl:", joinUrl);

    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const call = await client.calls.create({
      twiml: `<Response><Connect><Stream url="${joinUrl}"/></Connect></Response>`,
      to: DESTINATION_PHONE_NUMBER,
      from: TWILIO_PHONE_NUMBER,
    });

    console.log("Call initiated:", call.sid);
  } catch (error) {
    console.error("Error:", error.message);
  }
}
main();
