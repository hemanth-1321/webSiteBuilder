import Groq from "groq-sdk";

// Initialize Groq client with API Key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Make sure your API key is stored in an environment variable
});

export async function main() {
  try {
    const stream = await getGroqChatStream();

    let fullResponse = ""; // Accumulate the complete response here

    // Iterating through the stream with async iteration
    for await (const chunk of stream) {
      // Get the content chunk (if available)
      const content = chunk.choices[0]?.delta?.content || "";

      if (content) {
        // Append the content to the full response
        fullResponse += content;

        // Format and display the content dynamically as each chunk arrives
        const formattedOutput = formatResponse(fullResponse);
        console.clear(); // Clear the console for live updates
        console.log(formattedOutput);
      }
    }
  } catch (error) {
    console.error("Error while streaming:", error);
  }
}

// Function to get the Groq streaming chat completion
export async function getGroqChatStream() {
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
}

// Function to format the response
function formatResponse(fullContent: string) {
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
