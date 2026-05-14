import { useState } from "react"
import axios from "axios"

function App() {

  const [file, setFile] = useState(null)
  const [summary, setSummary] = useState("")
  const [ocrText, setOcrText] = useState("")
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  // Handle file selection
  const handleFileChange = (e) => {

    const selectedFile = e.target.files[0]

    if (!selectedFile) return

    setFile(selectedFile)

    setImagePreview(URL.createObjectURL(selectedFile))
  }

  // Upload file
  const handleUpload = async () => {

    if (!file) {
      alert("Please upload a document")
      return
    }

    const formData = new FormData()

    formData.append("file", file)

    try {

      setLoading(true)

      setSummary("")
      setOcrText("")

      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )

      setSummary(response.data.summary)
      setOcrText(response.data.extracted_text)

    } catch (error) {

      console.error(error)

      alert("Upload failed")

    } finally {

      setLoading(false)
    }
  }

  // Copy summary
  const copySummary = async () => {

    await navigator.clipboard.writeText(summary)

    alert("Summary copied!")
  }

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        fontFamily: "Arial",
        padding: "30px"
      }}
    >

      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "40px"
        }}
      >

        <h1
          style={{
            fontSize: "48px",
            marginBottom: "10px"
          }}
        >
          AI Document Summarizer
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "18px"
          }}
        >
          OCR + AI-powered legal document intelligence platform
        </p>

      </div>

      {/* Main Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "25px"
        }}
      >

        {/* LEFT PANEL */}
        <div
          style={{
            background: "#0f172a",
            borderRadius: "20px",
            padding: "25px"
          }}
        >

          <h2>Upload Document</h2>

          {/* Upload Box */}
          <label
            htmlFor="file-upload"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              border: "2px dashed #3b82f6",
              borderRadius: "20px",
              padding: "50px",
              cursor: "pointer",
              background: "#020617",
              marginTop: "20px"
            }}
          >

            <h3>Drag & Drop Document</h3>

            <p
              style={{
                color: "#94a3b8",
                textAlign: "center"
              }}
            >
              Upload legal agreements, contracts,
              NDAs, scanned documents, etc.
            </p>

            {file && (
              <p
                style={{
                  marginTop: "15px",
                  color: "#38bdf8"
                }}
              >
                {file.name}
              </p>
            )}

          </label>

          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              display: "none"
            }}
          />

          <button
            onClick={handleUpload}
            style={{
              width: "100%",
              marginTop: "20px",
              background: "#2563eb",
              border: "none",
              padding: "16px",
              borderRadius: "12px",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Summarize Document
          </button>

          {/* Loading Spinner */}
          {loading && (
            <div
              style={{
                marginTop: "25px",
                textAlign: "center"
              }}
            >

              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "5px solid #334155",
                  borderTop: "5px solid #3b82f6",
                  borderRadius: "50%",
                  margin: "auto",
                  animation: "spin 1s linear infinite"
                }}
              />

              <p
                style={{
                  marginTop: "15px",
                  color: "#94a3b8"
                }}
              >
                processing your document...
              </p>

            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (

            <div
              style={{
                marginTop: "30px"
              }}
            >

              <h2>Document Preview</h2>

              <img
                src={imagePreview}
                alt="preview"
                style={{
                  width: "100%",
                  borderRadius: "15px",
                  marginTop: "15px"
                }}
              />

            </div>
          )}

        </div>

        {/* RIGHT PANEL */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "25px"
          }}
        >

          {/* Summary */}
          <div
            style={{
              background: "#0f172a",
              borderRadius: "20px",
              padding: "25px"
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >

              <h2>AI Summary</h2>

              {summary && (
                <button
                  onClick={copySummary}
                  style={{
                    background: "#334155",
                    border: "none",
                    color: "white",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    cursor: "pointer"
                  }}
                >
                  Copy
                </button>
              )}

            </div>

            <div
              style={{
                marginTop: "15px",
                background: "#020617",
                padding: "20px",
                borderRadius: "15px",
                minHeight: "250px",
                whiteSpace: "pre-wrap",
                lineHeight: "1.8",
                color: "#e2e8f0"
              }}
            >
              {summary || "AI summary will appear here..."}
            </div>

          </div>

          {/* OCR Text */}
          <div
            style={{
              background: "#0f172a",
              borderRadius: "20px",
              padding: "25px"
            }}
          >

            <h2>OCR Extracted Text</h2>

            <div
              style={{
                marginTop: "15px",
                background: "#020617",
                padding: "20px",
                borderRadius: "15px",
                minHeight: "200px",
                whiteSpace: "pre-wrap",
                lineHeight: "1.6",
                color: "#94a3b8",
                overflowY: "auto",
                maxHeight: "300px"
              }}
            >
              {ocrText || "OCR text will appear here..."}
            </div>

          </div>

        </div>

      </div>

      {/* Spinner Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          body {
            margin: 0;
            padding: 0;
          }
        `}
      </style>

    </div>
  )
}

export default App