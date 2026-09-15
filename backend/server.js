const express = require("express");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();

app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
    res.json({
        message: "Dark Pattern Analyzer backend is running!"
    });
});

app.post("/analyze", async (req, res) => {
    try {
        const candidates = req.body.candidates;

        console.log("Received candidates:", candidates);

        const prompt = `
You are analyzing webpage evidence for potential dark patterns.

Analyze the evidence carefully. Do not assume that every checkbox,
button, or text is deceptive.

Your job is to identify whether the provided evidence suggests a
potential dark pattern.

Focus on these MVP categories:
1. Preselected Option
2. False Urgency / Scarcity
3. Confirmshaming

Return ONLY valid JSON in this exact structure:

{
  "detected": true,
  "pattern": "Preselected Option",
  "severity": "Medium",
  "confidence": "High",
  "evidence": "exact relevant text",
  "explanation": "simple explanation",
  "consumerProtection": {
    "applicable": true,
    "framework": "CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023",
    "category": "relevant category or null"
  }
}

If there is no convincing dark pattern, return:

{
  "detected": false,
  "pattern": null,
  "severity": "Low",
  "confidence": "High",
  "evidence": "relevant evidence",
  "explanation": "why this does not appear deceptive",
  "consumerProtection": {
    "applicable": false,
    "framework": null,
    "category": null
  }
}

Confidence must be one of:
"High", "Medium", "Low".

Here is the webpage evidence:

${JSON.stringify(candidates, null, 2)}
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt
        });

        console.log("Gemini response:", response.text);

        res.json({
            result: response.text
        });

    } catch (error) {
        console.error("Gemini error:", error);

        res.status(500).json({
            error: "Failed to analyze the page"
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});