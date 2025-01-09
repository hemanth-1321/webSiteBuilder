import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { FolderTree, Check } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "../../config";
import { FileItem, Step, StepType } from "../types";
import { parseXml } from "../steps";

interface File {
  name: string;
  content: string;
  language: string;
}

export default function CodeViewPage() {
  const { query } = useParams();
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<FileItem[]>([]);

  const [isCodeView, setIsCodeView] = useState(true); // Toggle between code and preview view

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
          let currentFileStructure = [...originalFiles]; // {}
          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              // final file
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              // in a folder
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                // create the folder
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => {
          return {
            ...s,
            status: "completed",
          };
        })
      );
    }
    console.log(files);
  }, [steps, files]);

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
      const parsedSteps = parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: "pending" as "pending",
      }));
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <Check className="w-8 h-8 text-[#f48225]" />
            <h1 className="text-xl font-semibold ml-2">CodeStack</h1>
          </div>
          <div className="text-gray-600">
            Search: {decodeURIComponent(query || "")}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-col-2 md:grid-cols-[20%,30%,50%] lg:grid-cols-[20%,30%,50%] w-full ">
        {/* Left Sidebar - Steps and Files */}
        <div className="p-4">
          <h1 className="font-semibold mt-4 mb-5">Chat with me</h1>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter text here"
          />
        </div>

        <div className="w-80 bg-white border-r border-gray-200 flex">
          {/* Steps Section */}

          <div className="p-4 border-b border-gray-200 flex">
            <div className="mt-4">
              <h2 className="font-semibold mb-5">Steps</h2>
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
            <div className="p-4 flex-1">
              <div className="flex items-center mb-4">
                <FolderTree className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="font-semibold ">Files</h2>
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
        </div>

        {/* Editor and Preview */}
        <div className="flex-1 flex flex-col ">
          <div className="flex items-center justify-between p-4 border-b w-50% border-gray-200">
            <button
              onClick={() => setIsCodeView(true)}
              className={`px-4 py-2 rounded ${
                isCodeView ? "bg-blue-500 text-white" : "text-blue-500"
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setIsCodeView(false)}
              className={`px-4 py-2 rounded ${
                !isCodeView ? "bg-blue-500 text-white" : "text-blue-500"
              }`}
            >
              Preview
            </button>
          </div>

          <div className="flex-1 flex flex-col">
            {isCodeView ? (
              <div className="flex-1">
                {selectedFile && (
                  <Editor
                    height="100%"
                    width="100%"
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
            ) : (
              <div className="flex-1 border border-gray-200 rounded-lg p-4">
                <div className="text-gray-500 text-center mt-8">
                  Preview will appear here
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
