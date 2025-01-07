import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Code2 } from "lucide-react";

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/code/${encodeURIComponent(query)}`, { state: { query } });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9f9]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="w-full max-w-2xl text-center">
            <div className="flex items-center justify-center mb-8">
              <Code2 className="w-12 h-12 text-[#f48225]" />
              <h1 className="text-4xl font-bold ml-2">CodeStack</h1>
            </div>

            <h2 className="text-2xl mb-8 text-gray-700">
              Find and explore code snippets from the community
            </h2>

            <form onSubmit={handleSubmit} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for code snippets..."
                  className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-[#f48225] focus:ring-2 focus:ring-[#f48225] focus:ring-opacity-20"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <button
                type="submit"
                className="mt-4 px-6 py-3 bg-[#f48225] text-white rounded-lg hover:bg-[#da7320] transition-colors duration-200"
              >
                Search Code
              </button>
            </form>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold mb-2">Public Code Repository</h3>
                <p className="text-gray-600">
                  Browse through thousands of code examples
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold mb-2">Live Code Editor</h3>
                <p className="text-gray-600">Edit and test code in real-time</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold mb-2">Instant Preview</h3>
                <p className="text-gray-600">
                  See your changes come to life instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
