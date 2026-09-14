const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Dark Pattern Analyzer backend is running!"
    });
});

app.post("/analyze", (req, res) => {
    const candidates = req.body.candidates;

    console.log("Received candidates:", candidates);

    res.json({
        message: "Candidates received successfully",
        candidates: candidates
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

