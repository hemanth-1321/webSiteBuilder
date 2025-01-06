require("dotenv").config();
import express from "express";
import Groq from "groq-sdk";
import cors from "cors";
import { BASE_PROMPT, getSystemPrompts } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./default/node";
import { basePrompt as reactBasePrompt } from "./default/react";

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq client with API Key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Define the system prompt for classification
const systemPrompt =
  "Return either 'node' or 'react' based on what this project should be. Only return a single word: 'node' or 'react'. Do not return anything extra.";

app.post("/template", async (req, res) => {
  const { prompt } = req.body;
  console.log(prompt);

  try {
    // Send the classification request to Groq
    const response = await groq.chat.completions.create(
      {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        model: "llama-3.3-70b-versatile", // Specify the model
        temperature: 0.5,
        max_tokens: 10,
      },
      {
        stream: true,
      }
    );
    console.log(response.choices[0]?.message.content);
    const answer = response.choices[0]?.message?.content?.trim().toLowerCase();

    if (answer === "react") {
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
      return;
    }

    if (answer === "node") {
      res.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
      return;
    }

    // If the response is invalid or unexpected
    res
      .status(403)
      .json({ message: "Invalid classification or unsupported project type." });
  } catch (error: any) {
    console.error("Error during Groq classification:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const systemPrompt = getSystemPrompts(); // Ensure this function returns a string
    const response = await groq.chat.completions.create(
      {
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        model: "llama-3.3-70b-versatile", // Replace with your desired model
        max_tokens: 8000,
      },
      {
        stream: true,
      }
    );
    const assistantReply = response.choices[0]?.message?.content;

    // Log the response for debugging
    console.log(assistantReply);

    // Send the assistant's reply back to the client
    res.json({ response: assistantReply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
