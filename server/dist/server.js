"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const cors_1 = __importDefault(require("cors"));
const prompts_1 = require("./prompts");
const node_1 = require("./default/node");
const react_1 = require("./default/react");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize Groq client with API Key
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY,
});
// Define the system prompt for classification
const systemPrompt = "Return either 'node' or 'react' based on what this project should be. Only return a single word: 'node' or 'react'. Do not return anything extra.";
app.post("/template", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { prompt } = req.body;
    console.log(prompt);
    try {
        // Pre-process the prompt
        const processedPrompt = prompt
            .toLowerCase()
            .replace(/[^\w\s]|_/g, "")
            .trim();
        console.log(`Processed prompt: ${processedPrompt}`);
        // Send the classification request to Groq
        const response = yield groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: processedPrompt },
            ],
            model: "llama-3.3-70b-versatile", // Specify the model
            temperature: 0.5,
            max_tokens: 1024,
        }, {
            stream: true,
        });
        console.log((_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message.content);
        const answer = (_d = (_c = (_b = response.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.trim().toLowerCase();
        console.log("answer", answer);
        if ((answer === null || answer === void 0 ? void 0 : answer.includes("node")) ||
            (answer === null || answer === void 0 ? void 0 : answer.includes("nodejs")) ||
            (answer === null || answer === void 0 ? void 0 : answer.includes("node js"))) {
            res.json({
                prompts: [
                    prompts_1.BASE_PROMPT,
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${node_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                ],
                uiPrompts: [node_1.basePrompt],
            });
            return;
        }
        if ((answer === null || answer === void 0 ? void 0 : answer.includes("react")) ||
            (answer === null || answer === void 0 ? void 0 : answer.includes("react js")) ||
            (answer === null || answer === void 0 ? void 0 : answer.includes("reactjs"))) {
            res.json({
                prompts: [
                    prompts_1.BASE_PROMPT,
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                ],
                uiPrompts: [react_1.basePrompt],
            });
            return;
        }
        // If the response is invalid or unexpected
        res
            .status(403)
            .json({ message: "Invalid classification or unsupported project type." });
    }
    catch (error) {
        console.error("Error during Groq classification:", error);
        res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
}));
app.post("/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { messages } = req.body;
        const systemPrompt = (0, prompts_1.getSystemPrompts)();
        const response = yield groq.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            model: "llama-3.3-70b-versatile",
            max_tokens: 8000,
        }, {
            stream: true,
        });
        const assistantReply = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        console.log(assistantReply);
        // Send the assistant's reply back to the client
        res.json({ response: assistantReply });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
