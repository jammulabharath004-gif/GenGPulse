const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// CONFIGURATION
// =====================================================

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// IMPORTANT:
// This model was tested directly and is working.
const GEMINI_MODEL = "gemini-3.5-flash-lite";

// =====================================================
// GEMINI CONFIGURATION
// =====================================================

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const geminiModel = genAI.getGenerativeModel({
    model: GEMINI_MODEL
});

// =====================================================
// RAZORPAY CONFIGURATION
// =====================================================

let razorpay = null;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET
    });

    console.log("Razorpay configuration loaded.");
} else {
    console.log("Razorpay keys are missing.");
}

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// USERS FILE
// =====================================================

const USERS_FILE = path.join(__dirname, "users.json");

function ensureUsersFile() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(
            USERS_FILE,
            "[]",
            "utf8"
        );
    }
}

function readUsers() {
    ensureUsersFile();

    try {
        const data = fs.readFileSync(
            USERS_FILE,
            "utf8"
        );

        return JSON.parse(data);

    } catch (error) {
        console.error(
            "Users file read error:",
            error.message
        );

        return [];
    }
}

function writeUsers(users) {
    fs.writeFileSync(
        USERS_FILE,
        JSON.stringify(users, null, 2),
        "utf8"
    );
}

// =====================================================
// GEMINI AI HELPER
// =====================================================

async function generateGeminiContent(prompt) {
    try {
        const result =
            await geminiModel.generateContent(prompt);

        const response =
            result.response;

        const text =
            response.text();

        return text;

    } catch (error) {
        console.error("Gemini error:");

        if (error.response) {
            console.error(
                error.response.data
            );
        } else {
            console.error(
                error.message
            );
        }

        throw error;
    }
}

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        service: "Gen G Pulse API"
    });
});

// =====================================================
// GEMINI AI TEST
// =====================================================

app.get("/api/ai-test", async (req, res) => {
    try {
        const prompt =
            "Say exactly: Gemini AI connection successful.";

        const aiResponse =
            await generateGeminiContent(prompt);

        res.json({
            success: true,
            message:
                "Gemini AI is working!",
            aiResponse:
                aiResponse
        });

    } catch (error) {
        console.error(
            "AI test failed:",
            error.message
        );

        res.status(503).json({
            success: false,
            message:
                "Gemini AI is temporarily unavailable.",
            error:
                error.message
        });
    }
});

// =====================================================
// GNEWS API
// =====================================================

app.get("/api/news", async (req, res) => {
    try {
        const query =
            req.query.q ||
            "India technology";

        if (!GNEWS_API_KEY) {
            return res.status(500).json({
                success: false,
                message:
                    "GNews API key is missing."
            });
        }

        const response =
            await axios.get(
                "https://gnews.io/api/v4/search",
                {
                    params: {
                        q: query,
                        lang: "en",
                        country: "in",
                        max: 10,
                        apikey:
                            GNEWS_API_KEY
                    }
                }
            );

        res.json({
            success: true,
            query: query,
            totalArticles:
                response.data
                    .totalArticles,
            articles:
                response.data.articles
        });

    } catch (error) {
        console.error(
            "GNews error:",
            error.response?.data ||
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch news.",
            error:
                error.response?.data ||
                error.message
        });
    }
});

// =====================================================
// AI NEWS ANALYSIS
// =====================================================

app.post(
    "/api/analyze-news",
    async (req, res) => {
        try {
            const {
                title,
                description,
                content,
                source,
                url
            } = req.body;

            if (!title && !description) {
                return res.status(400).json({
                    success: false,
                    message:
                        "News title or description is required."
                });
            }

            const cleanTitle =
                title ||
                "News update";

            const cleanDescription =
                description ||
                "";

            const cleanContent =
                content ||
                "";

            const cleanSource =
                typeof source === "object"
                    ? source.name ||
                      "Unknown source"
                    : source ||
                      "Unknown source";

            const articleText =
                cleanContent
                    ? cleanContent.substring(
                        0,
                        4000
                    )
                    : cleanDescription.substring(
                        0,
                        2000
                    );

            const prompt = `
You are the AI news explainer for Gen G Pulse.

Explain the following news article in simple language for Indian students and young adults.

NEWS TITLE:
${cleanTitle}

SOURCE:
${cleanSource}

DESCRIPTION:
${cleanDescription}

ARTICLE CONTENT:
${articleText}

Return the answer using exactly these four sections:

WHAT HAPPENED?
Give a simple 2-3 sentence explanation.

WHY DOES IT MATTER?
Explain why this news is important in 2-3 sentences.

KEY POINTS:
Give 3 short bullet points.

WHAT SHOULD YOU KNOW?
Give a short practical takeaway in 1-2 sentences.

Do not invent facts.
Do not make predictions.
Do not give financial or medical advice.
Use only information supported by the provided article.
`;

            const aiResponse =
                await generateGeminiContent(
                    prompt
                );

            res.json({
                success: true,
                title:
                    cleanTitle,
                source:
                    cleanSource,
                url:
                    url || "",
                analysis:
                    aiResponse,
                aiResponse:
                    aiResponse
            });

        } catch (error) {
            console.error(
                "News analysis failed:",
                error.response?.data ||
                error.message
            );

            res.status(503).json({
                success: false,
                message:
                    "Gemini AI is temporarily busy. Please try again later.",
                retryable:
                    true
            });
        }
    }
);

// =====================================================
// SIGN UP
// =====================================================

app.post(
    "/api/signup",
    async (req, res) => {
        try {
            const {
                name,
                email,
                password
            } = req.body;

            if (
                !name ||
                !email ||
                !password
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Name, email and password are required."
                });
            }

            const users =
                readUsers();

            const existingUser =
                users.find(
                    user =>
                        user.email.toLowerCase() ===
                        email.toLowerCase()
                );

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message:
                        "An account with this email already exists."
                });
            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const newUser = {
                id:
                    crypto.randomUUID(),

                name:
                    name,

                email:
                    email.toLowerCase(),

                password:
                    hashedPassword,

                savedStories: [],

                subscription:
                    "free",

                createdAt:
                    new Date().toISOString()
            };

            users.push(
                newUser
            );

            writeUsers(
                users
            );

            res.status(201).json({
                success: true,
                message:
                    "Account created successfully.",
                user: {
                    id:
                        newUser.id,
                    name:
                        newUser.name,
                    email:
                        newUser.email,
                    subscription:
                        newUser.subscription
                }
            });

        } catch (error) {
            console.error(
                "Signup error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to create account."
            });
        }
    }
);

// =====================================================
// SIGN IN
// =====================================================

app.post(
    "/api/signin",
    async (req, res) => {
        try {
            const {
                email,
                password
            } = req.body;

            if (
                !email ||
                !password
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Email and password are required."
                });
            }

            const users =
                readUsers();

            const user =
                users.find(
                    item =>
                        item.email.toLowerCase() ===
                        email.toLowerCase()
                );

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password."
                });
            }

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password."
                });
            }

            res.json({
                success: true,
                message:
                    "Sign in successful.",
                user: {
                    id:
                        user.id,
                    name:
                        user.name,
                    email:
                        user.email,
                    subscription:
                        user.subscription ||
                        "free"
                }
            });

        } catch (error) {
            console.error(
                "Signin error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to sign in."
            });
        }
    }
);

// =====================================================
// SAVE STORY
// =====================================================

app.post(
    "/api/save-story",
    (req, res) => {
        try {
            const {
                userId,
                story
            } = req.body;

            if (
                !userId ||
                !story
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "User ID and story are required."
                });
            }

            const users =
                readUsers();

            const user =
                users.find(
                    item =>
                        item.id ===
                        userId
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            if (!user.savedStories) {
                user.savedStories =
                    [];
            }

            const alreadySaved =
                user.savedStories.some(
                    item =>
                        item.url ===
                        story.url
                );

            if (!alreadySaved) {
                user.savedStories.push(
                    story
                );
            }

            writeUsers(
                users
            );

            res.json({
                success: true,
                message:
                    alreadySaved
                        ? "Story already saved."
                        : "Story saved successfully.",
                savedStories:
                    user.savedStories
            });

        } catch (error) {
            console.error(
                "Save story error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to save story."
            });
        }
    }
);

// =====================================================
// GET SAVED STORIES
// =====================================================

app.get(
    "/api/saved/:userId",
    (req, res) => {
        try {
            const userId =
                req.params.userId;

            const users =
                readUsers();

            const user =
                users.find(
                    item =>
                        item.id ===
                        userId
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            res.json({
                success: true,
                savedStories:
                    user.savedStories ||
                    []
            });

        } catch (error) {
            console.error(
                "Get saved stories error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load saved stories."
            });
        }
    }
);

// =====================================================
// RAZORPAY - CREATE PLUS ORDER
// =====================================================

app.post(
    "/api/create-plus-order",
    async (req, res) => {
        try {
            if (!razorpay) {
                return res.status(500).json({
                    success: false,
                    message:
                        "Razorpay is not configured on the server."
                });
            }

            const {
                userId
            } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "User ID is required."
                });
            }

            const users =
                readUsers();

            const user =
                users.find(
                    item =>
                        item.id ===
                        userId
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            // â‚¹99 = 9900 paise
            const options = {
                amount: 9900,
                currency: "INR",
                receipt:
                    `gen-g-${Date.now()}`,
                notes: {
                    product:
                        "Gen G Pulse Plus",
                    userId:
                        userId,
                    plan:
                        "plus"
                }
            };

            const order =
                await razorpay.orders.create(
                    options
                );

            res.json({
                success: true,
                order: {
                    id:
                        order.id,
                    amount:
                        order.amount,
                    currency:
                        order.currency
                },
                razorpayKeyId:
                    RAZORPAY_KEY_ID,
                plan:
                    "plus"
            });

        } catch (error) {
            console.error(
                "Razorpay order creation failed:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to create Razorpay order.",
                error:
                    error.error?.description ||
                    error.message
            });
        }
    }
);

// =====================================================
// RAZORPAY - VERIFY PAYMENT
// =====================================================

app.post(
    "/api/verify-plus-payment",
    async (req, res) => {
        try {
            const {
                userId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            } = req.body;

            if (
                !userId ||
                !razorpay_order_id ||
                !razorpay_payment_id ||
                !razorpay_signature
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Payment verification details are incomplete."
                });
            }

            const generatedSignature =
                crypto
                    .createHmac(
                        "sha256",
                        RAZORPAY_KEY_SECRET
                    )
                    .update(
                        razorpay_order_id +
                        "|" +
                        razorpay_payment_id
                    )
                    .digest("hex");

            const signatureMatches =
                crypto.timingSafeEqual(
                    Buffer.from(
                        generatedSignature
                    ),
                    Buffer.from(
                        razorpay_signature
                    )
                );

            if (!signatureMatches) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Payment verification failed."
                });
            }

            const users =
                readUsers();

            const user =
                users.find(
                    item =>
                        item.id ===
                        userId
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            user.subscription =
                "plus";

            user.subscriptionDetails = {
                plan:
                    "Gen G Pulse Plus",
                amount:
                    99,
                currency:
                    "INR",
                paymentId:
                    razorpay_payment_id,
                orderId:
                    razorpay_order_id,
                activatedAt:
                    new Date().toISOString()
            };

            writeUsers(
                users
            );

            res.json({
                success: true,
                message:
                    "Gen G Pulse Plus activated successfully.",
                subscription:
                    "plus",
                user: {
                    id:
                        user.id,
                    name:
                        user.name,
                    email:
                        user.email,
                    subscription:
                        user.subscription
                }
            });

        } catch (error) {
            console.error(
                "Razorpay verification failed:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to verify payment."
            });
        }
    }
);

// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    () => {
        console.log(
            `Gen G Pulse backend running at http://localhost:${PORT}`
        );

        console.log(
            `Gemini model: ${GEMINI_MODEL}`
        );

        console.log(
            RAZORPAY_KEY_ID
                ? "Razorpay: configured"
                : "Razorpay: NOT configured"
        );
    }
);
