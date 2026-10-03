const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

const PORT = process.env.PORT || 3000;

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());


// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Gen G Pulse Backend is running!",
        version: "1.0.0"
    });
});


// =====================================================
// HEALTH
// =====================================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        service: "Gen G Pulse API"
    });
});


// =====================================================
// NEWS
// =====================================================

app.get("/api/news", async (req, res) => {

    try {

        if (!GNEWS_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "GNEWS_API_KEY is missing in .env"
            });
        }

        const query = req.query.q || "India technology";

        const response = await axios.get(
            "https://gnews.io/api/v4/search",
            {
                params: {
                    q: query,
                    lang: "en",
                    country: "in",
                    max: 10,
                    apikey: GNEWS_API_KEY
                }
            }
        );

        res.json({
            success: true,
            query: query,
            totalArticles: response.data.totalArticles,
            articles: response.data.articles
        });

    } catch (error) {

        console.error(
            "GNews error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch news",
            error: error.response?.data || error.message
        });
    }
});


// =====================================================
// GEMINI AI FUNCTION
// =====================================================

async function analyzeWithGemini(article) {

    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing in .env");
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
        model: "gemini-3.8-flash"
    });

    const prompt = `
You are the AI news analyst for Gen G Pulse.

Analyze the following news article for Indian Gen-Z students
and young professionals.

ARTICLE TITLE:
${article.title}

ARTICLE DESCRIPTION:
${article.description || "Not available"}

ARTICLE CONTENT:
${article.content || "Not available"}

SOURCE:
${article.source?.name || "Unknown"}

Return ONLY valid JSON using this exact structure:

{
  "summary": "Short simple summary",
  "category": "Technology/Business/Education/Career/Government/Science/Other",
  "sentiment": "Positive/Neutral/Negative",
  "importance": 1,
  "impact": "Short explanation of possible impact",
  "whyItMatters": "Why this matters to Gen-Z",
  "keyTakeaway": "One simple takeaway"
}

Rules:
- Use simple English.
- Do not invent facts.
- importance must be a number from 1 to 10.
- Keep each explanation concise.
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    // Remove markdown code fences if Gemini adds them
    const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    return JSON.parse(cleaned);
}


// =====================================================
// ANALYZE NEWS
// =====================================================

app.post("/api/analyze-news", async (req, res) => {

    try {

        const article = req.body;

        if (!article || !article.title) {
            return res.status(400).json({
                success: false,
                message: "Article title is required"
            });
        }

        const analysis = await analyzeWithGemini(article);

        res.json({
            success: true,
            article: {
                title: article.title,
                source: article.source?.name || "Unknown"
            },
            analysis: analysis
        });

    } catch (error) {

        console.error("AI analysis error:", error.message);

        if (error.message.includes("503")) {

            return res.status(503).json({
                success: false,
                message: "Gemini AI is temporarily busy. Please try again later.",
                retryable: true
            });
        }

        res.status(500).json({
            success: false,
            message: "AI news analysis failed",
            error: error.message
        });
    }
});


// =====================================================
// AI TEST
// =====================================================

app.get("/api/ai-test", async (req, res) => {

    try {

        if (!GEMINI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "GEMINI_API_KEY is missing in .env"
            });
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-3.8-flash"
        });

        const result = await model.generateContent(
            "Reply with exactly: Gemini AI connection successful."
        );

        res.json({
            success: true,
            message: "Gemini AI is working!",
            aiResponse: result.response.text()
        });

    } catch (error) {

        console.error("Gemini test error:", error.message);

        res.status(503).json({
            success: false,
            message: "Gemini is temporarily unavailable.",
            error: error.message
        });
    }
});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

    console.log(
        `Gen G Pulse backend running at http://localhost:${PORT}`
    );

});