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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
exports.getGroqChatStream = getGroqChatStream;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
// Initialize Groq client with API Key
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY, // Make sure your API key is stored in an environment variable
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        var _d, _e;
        try {
            const stream = yield getGroqChatStream();
            let fullResponse = ""; // Accumulate the complete response here
            try {
                // Iterating through the stream with async iteration
                for (var _f = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _f = true) {
                    _c = stream_1_1.value;
                    _f = false;
                    const chunk = _c;
                    // Get the content chunk (if available)
                    const content = ((_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content) || "";
                    if (content) {
                        // Append the content to the full response
                        fullResponse += content;
                        // Format and display the content dynamically as each chunk arrives
                        const formattedOutput = formatResponse(fullResponse);
                        console.clear(); // Clear the console for live updates
                        console.log(formattedOutput);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_f && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        catch (error) {
            console.error("Error while streaming:", error);
        }
    });
}
// Function to get the Groq streaming chat completion
function getGroqChatStream() {
    return __awaiter(this, void 0, void 0, function* () {
        return groq.chat.completions.create({
            // Required parameters
            messages: [
                {
                    role: "user",
                    content: "create a todo application in react",
                },
            ],
            model: "llama-3.3-70b-versatile", // Specify the model to be used
            // Optional parameters
            temperature: 0.5, // Controls randomness of completions
            max_tokens: 1024, // Limits the number of tokens generated
            top_p: 1, // Nucleus sampling
            stop: null, // Optional stop sequence to end completion
            stream: true, // Enable streaming of responses
        });
    });
}
// Function to format the response
function formatResponse(fullContent) {
    // Format the response as a structured object or text (you can customize this as needed)
    return {
        status: "success",
        message: "Streaming response received from the Groq model.",
        data: {
            content: fullContent, // Accumulated content from the model
        },
    };
}
// Start the main function
main();
