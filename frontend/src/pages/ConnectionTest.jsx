import React, { useState, useEffect } from "react";
import axios from "axios";

const ConnectionTest = () => {
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const [apiStatus, setApiStatus] = useState("Checking...");
  const [backendResponse, setBackendResponse] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Test backend connection
    const testBackendConnection = async () => {
      try {
        const response = await axios.get("/");
        setBackendStatus("Connected");
        setBackendResponse(response.data);
      } catch (err) {
        setBackendStatus("Failed");
        setError(err.message);
      }
    };

    // Test API endpoint
    const testApiEndpoint = async () => {
      try {
        const response = await axios.get("/api/v1/debug");
        setApiStatus("Connected");
        setApiResponse(response.data);
      } catch (err) {
        setApiStatus("Failed");
        setError(err.message);
      }
    };

    testBackendConnection();
    testApiEndpoint();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Connection Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Backend Connection</h2>
        <div className="p-4 border rounded">
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`font-bold ${
                backendStatus === "Connected"
                  ? "text-green-600"
                  : backendStatus === "Checking..."
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {backendStatus}
            </span>
          </p>
          {backendResponse && (
            <div className="mt-2">
              <p>
                <strong>Response:</strong>
              </p>
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
                {typeof backendResponse === "string"
                  ? backendResponse
                  : JSON.stringify(backendResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">API Endpoint Test</h2>
        <div className="p-4 border rounded">
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`font-bold ${
                apiStatus === "Connected"
                  ? "text-green-600"
                  : apiStatus === "Checking..."
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {apiStatus}
            </span>
          </p>
          {apiResponse && (
            <div className="mt-2">
              <p>
                <strong>Response:</strong>
              </p>
              <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 rounded">
          <h2 className="text-xl font-semibold mb-2 text-red-700">Error</h2>
          <p className="text-red-700">{error}</p>
          <div className="mt-4">
            <h3 className="font-semibold">Troubleshooting:</h3>
            <ul className="list-disc pl-5 mt-2">
              <li>Make sure the backend server is running on port 5000</li>
              <li>Check CORS settings in the backend</li>
              <li>Verify the API URL in the frontend environment variables</li>
              <li>Check network connectivity between frontend and backend</li>
            </ul>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Connection Information</h2>
        <div className="p-4 border rounded">
          <p>
            <strong>Frontend URL:</strong> {window.location.origin}
          </p>
          <p>
            <strong>Backend URL:</strong>{" "}
            {import.meta.env.VITE_API_URL || "http://localhost:5000"}
          </p>
          <p>
            <strong>API Base URL:</strong>{" "}
            {axios.defaults.baseURL || "Not configured"}
          </p>
          <p>
            <strong>Environment:</strong> {import.meta.env.MODE}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
