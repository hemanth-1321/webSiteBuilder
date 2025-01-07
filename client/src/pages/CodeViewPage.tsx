import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { FolderTree, Play, Code2, Check, Loader2 } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { FileItem, Step } from "../types";
import { parseXml } from "../steps";

interface File {
  name: string;
  content: string;
  language: string;
}

export default function CodeViewPage() {
  const { query } = useParams();
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [files] = useState<File[]>([
    {
      name: "index.tsx",
      content: "// Your code here",
      language: "typescript",
    },
    {
      name: "styles.css",
      content: "/* Your styles here */",
      language: "css",
    },
  ]);

  async function init() {
    try {
      setLoading(true);
      setError(null);

      // First hit the template endpoint with the correct prompt structure
      const templateResponse = await axios.post(`${BACKEND_URL}/template`, {
        prompt: query?.trim() || "", // Ensure we send a string
      });

      const { prompts, uiPrompts } = templateResponse.data;

      if (!uiPrompts?.[0]) {
        throw new Error("No template data received");
      }

      // Parse the steps from the template response
      const parsedSteps = parseXml(uiPrompts[0]);
      setSteps(parsedSteps);

      // Now handle the chat endpoint with properly formatted messages
      if (prompts && Array.isArray(prompts)) {
        const messages = [
          ...prompts.map((prompt) => ({
            role: "user" as const,
            content: String(prompt), // Ensure content is a string
          })),
          {
            role: "user" as const,
            content: String(query || ""), // Ensure content is a string
          },
        ];

        const chatResponse = await axios.post(`${BACKEND_URL}/chat`, {
          messages,
        });

        // Handle chat response
        if (chatResponse.data?.response) {
          // TODO: Update UI based on chat response
          console.log("Chat response:", chatResponse.data.response);
        }
      }
    } catch (err: any) {
      console.error("Error details:", err.response?.data || err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (query) {
      init();
    }
  }, [query]);

  useEffect(() => {
    if (files.length && !selectedFile) {
      setSelectedFile(files[0]);
    }
  }, [files]);

  // Rest of the component remains the same...

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <Code2 className="w-8 h-8 text-[#f48225]" />
            <h1 className="text-xl font-semibold ml-2">CodeStack</h1>
          </div>
          <div className="text-gray-600">
            Search: {decodeURIComponent(query || "")}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Steps and Files */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Steps Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <Check className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="font-semibold">Steps</h2>
            </div>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-2 rounded text-sm ${
                    index === currentStep
                      ? "bg-blue-50 text-blue-600"
                      : index < currentStep
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {step.title}
                </div>
              ))}
            </div>
          </div>

          {/* Files Section */}
          <div className="p-4 flex-1">
            <div className="flex items-center mb-4">
              <FolderTree className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="font-semibold">Files</h2>
            </div>
            <div className="space-y-2">
              {files.map((file) => (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selectedFile?.name === file.name
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {file.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor and Preview */}
        <div className="flex-1 flex">
          <div className="flex-1 border-r border-gray-200">
            <div className="h-full">
              {selectedFile && (
                <Editor
                  height="100%"
                  defaultLanguage={selectedFile.language}
                  defaultValue={selectedFile.content}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="w-1/2 bg-white p-4">
            <div className="flex items-center mb-4">
              <Play className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="font-semibold">Preview</h2>
            </div>
            <div className="border border-gray-200 rounded-lg h-[calc(100%-2rem)] p-4">
              <div className="text-gray-500 text-center mt-8">
                Preview will appear here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
