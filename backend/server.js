const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Razorpay = require("razorpay");

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
const SUPABASE_SECRET_KEY =
    process.env.SUPABASE_SECRET_KEY;

const GEMINI_MODEL = "gemini-3.5-flash-lite";

// =====================================================
// SUPABASE
// =====================================================

let supabase = null;

async function initializeSupabase() {

    if (
        !SUPABASE_URL ||
        !SUPABASE_SECRET_KEY
    ) {
        throw new Error(
            "SUPABASE_URL or SUPABASE_SECRET_KEY is missing in .env"
        );
    }

    const {
        createClient
    } = await import(
        "@supabase/supabase-js"
    );

    supabase = createClient(
        SUPABASE_URL,
        SUPABASE_SECRET_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        }
    );

    console.log(
        "Supabase database configuration loaded."
    );
}

// =====================================================
// GEMINI CONFIGURATION
// =====================================================

let geminiModel = null;

if (GEMINI_API_KEY) {

    const genAI =
        new GoogleGenerativeAI(
            GEMINI_API_KEY
        );

    geminiModel =
        genAI.getGenerativeModel({
            model:
                GEMINI_MODEL
        });

} else {

    console.log(
        "Gemini API key is missing."
    );
}

// =====================================================
// RAZORPAY CONFIGURATION
// =====================================================

let razorpay = null;

if (
    RAZORPAY_KEY_ID &&
    RAZORPAY_KEY_SECRET
) {

    razorpay =
        new Razorpay({
            key_id:
                RAZORPAY_KEY_ID,

            key_secret:
                RAZORPAY_KEY_SECRET
        });

    console.log(
        "Razorpay configuration loaded."
    );

} else {

    console.log(
        "Razorpay keys are missing."
    );
}

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(
    express.json()
);

// =====================================================
// DATABASE HELPERS
// =====================================================

function ensureDatabase() {

    if (!supabase) {
        throw new Error(
            "Supabase is not initialized."
        );
    }
}

// -----------------------------------------------------
// Convert database row → application user
// -----------------------------------------------------

function dbRowToUser(row) {

    if (!row) {
        return null;
    }

    return {

        id:
            row.id,

        name:
            row.name,

        email:
            row.email,

        password:
            row.password,

        savedStories:
            row.saved_stories || [],

        subscription:
            row.subscription || "free",

        subscriptionDetails:
            row.subscription_details ||
            null,

        createdAt:
            row.created_at,

        interests:
            row.interests || []
    };
}

// -----------------------------------------------------
// Convert application user → database row
// -----------------------------------------------------

function userToDbRow(user) {

    return {

        id:
            user.id,

        name:
            user.name,

        email:
            user.email,

        password:
            user.password,

        saved_stories:
            user.savedStories || [],

        subscription:
            user.subscription || "free",

        subscription_details:
            user.subscriptionDetails ||
            null,

        created_at:
            user.createdAt ||
            new Date().toISOString(),

        interests:
            user.interests || []
    };
}

// -----------------------------------------------------
// Find user by ID
// -----------------------------------------------------

async function getUserById(userId) {

    ensureDatabase();

    const {
        data,
        error
    } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return dbRowToUser(data);
}

// -----------------------------------------------------
// Find user by email
// -----------------------------------------------------

async function getUserByEmail(email) {

    ensureDatabase();

    const {
        data,
        error
    } = await supabase
        .from("users")
        .select("*")
        .eq(
            "email",
            email.toLowerCase()
        )
        .maybeSingle();

    if (error) {
        throw error;
    }

    return dbRowToUser(data);
}

// -----------------------------------------------------
// Create user
// -----------------------------------------------------

async function createUser(user) {

    ensureDatabase();

    const {
        data,
        error
    } = await supabase
        .from("users")
        .insert(
            userToDbRow(user)
        )
        .select("*")
        .single();

    if (error) {
        throw error;
    }

    return dbRowToUser(data);
}

// -----------------------------------------------------
// Update user
// -----------------------------------------------------

async function updateUser(user) {

    ensureDatabase();

    const {
        data,
        error
    } = await supabase
        .from("users")
        .update(
            userToDbRow(user)
        )
        .eq(
            "id",
            user.id
        )
        .select("*")
        .single();

    if (error) {
        throw error;
    }

    return dbRowToUser(data);
}

// =====================================================
// GEMINI AI HELPER
// =====================================================

async function generateGeminiContent(
    prompt
) {

    if (!geminiModel) {

        throw new Error(
            "GEMINI_API_KEY is missing."
        );
    }

    try {

        const result =
            await geminiModel.generateContent(
                prompt
            );

        const response =
            result.response;

        const text =
            response.text();

        return text;

    } catch (error) {

        console.error(
            "Gemini error:"
        );

        console.error(
            error.message
        );

        throw error;
    }
}

// =====================================================
// HOME
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.json({
            success:
                true,

            message:
                "Gen Z Pulse Backend is running!",

            version:
                "2.0.0"
        });
    }
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success:
                true,

            status:
                "healthy",

            service:
                "Gen Z Pulse API",

            database:
                supabase
                    ? "connected"
                    : "not initialized"
        });
    }
);

// =====================================================
// SUPABASE TEST
// =====================================================

app.get(
    "/api/db-test",
    async (req, res) => {

        try {

            ensureDatabase();

            const {
                data,
                error
            } = await supabase
                .from("users")
                .select("id")
                .limit(1);

            if (error) {
                throw error;
            }

            res.json({

                success:
                    true,

                message:
                    "Supabase database connection successful.",

                rows:
                    data.length
            });

        } catch (error) {

            console.error(
                "Database test failed:",
                error
            );

            res.status(500).json({

                success:
                    false,

                message:
                    "Supabase database connection failed.",

                error:
                    error.message
            });
        }
    }
);

// =====================================================
// GEMINI AI TEST
// =====================================================

app.get(
    "/api/ai-test",
    async (req, res) => {

        try {

            const prompt =
                "Say exactly: Gemini AI connection successful.";

            const aiResponse =
                await generateGeminiContent(
                    prompt
                );

            res.json({

                success:
                    true,

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

                success:
                    false,

                message:
                    "Gemini AI is temporarily unavailable.",

                error:
                    error.message
            });
        }
    }
);

// =====================================================
// GNEWS API
// =====================================================

app.get(
    "/api/news",
    async (req, res) => {

        try {

            const query =
                req.query.q ||
                "India technology";

            if (!GNEWS_API_KEY) {

                return res.status(500).json({

                    success:
                        false,

                    message:
                        "GNews API key is missing."
                });
            }

            const response =
                await axios.get(
                    "https://gnews.io/api/v4/search",
                    {
                        params: {

                            q:
                                query,

                            lang:
                                "en",

                            country:
                                "in",

                            max:
                                10,

                            apikey:
                                GNEWS_API_KEY
                        }
                    }
                );

            res.json({

                success:
                    true,

                query:
                    query,

                totalArticles:
                    response
                        .data
                        .totalArticles,

                articles:
                    response
                        .data
                        .articles
            });

        } catch (error) {

            console.error(
                "GNews error:",
                error.response?.data ||
                error.message
            );

            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to fetch news.",

                error:
                    error.response?.data ||
                    error.message
            });
        }
    }
);

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

            if (
                !title &&
                !description
            ) {

                return res.status(400).json({

                    success:
                        false,

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
You are the AI news explainer for Gen Z Pulse.

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

                success:
                    true,

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
                error.message
            );

            res.status(503).json({

                success:
                    false,

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

                    success:
                        false,

                    message:
                        "Name, email and password are required."
                });
            }

            const cleanName =
                String(name).trim();

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            if (
                cleanName.length === 0 ||
                cleanEmail.length === 0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Name and email cannot be empty."
                });
            }

            const existingUser =
                await getUserByEmail(
                    cleanEmail
                );

            if (existingUser) {

                return res.status(409).json({

                    success:
                        false,

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
                    cleanName,

                email:
                    cleanEmail,

                password:
                    hashedPassword,

                savedStories:
                    [],

                subscription:
                    "free",

                subscriptionDetails:
                    null,

                createdAt:
                    new Date().toISOString()
            };

            const savedUser =
                await createUser(
                    newUser
                );

            res.status(201).json({

                success:
                    true,

                message:
                    "Account created successfully.",

                user: {

                    id:
                        savedUser.id,

                    name:
                        savedUser.name,

                    email:
                        savedUser.email,

                    subscription:
                        savedUser.subscription
                }
            });

        } catch (error) {

            console.error(
                "Signup error:",
                error
            );

            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to create account.",

                error:
                    error.message
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

                    success:
                        false,

                    message:
                        "Email and password are required."
                });
            }

            const cleanEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            const user =
                await getUserByEmail(
                    cleanEmail
                );

            if (!user) {

                return res.status(401).json({

                    success:
                        false,

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

                    success:
                        false,

                    message:
                        "Invalid email or password."
                });
            }

            res.json({

                success:
                    true,

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

                success:
                    false,

                message:
                    "Unable to sign in.",

                error:
                    error.message
            });
        }
    }
);

// =====================================================
// INTERESTS / PERSONALIZATION
// =====================================================

const allowedInterests = [
    "Technology",
    "AI",
    "Education",
    "Career",
    "Jobs",
    "Government",
    "Business",
    "Sports",
    "Science",
    "Entertainment",
    "Startups"
];

app.get(
    "/api/interests/:userId",
    async (req, res) => {

        try {

            const user = await getUserById(req.params.userId);

            if (!user) {

                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            res.json({
                success: true,
                interests: user.interests || []
            });

        } catch (error) {

            console.error("Get interests error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to load interests.",
                error: error.message
            });
        }
    }
);

app.post(
    "/api/interests",
    async (req, res) => {

        try {

            const { userId, interests } = req.body;

            if (!userId || !Array.isArray(interests)) {

                return res.status(400).json({
                    success: false,
                    message: "User ID and interests array are required."
                });
            }

            const user = await getUserById(userId);

            if (!user) {

                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            const cleanedInterests = [
                ...new Set(
                    interests
                        .map(value => String(value).trim())
                        .map(value =>
                            allowedInterests.find(
                                item =>
                                    item.toLowerCase() ===
                                    value.toLowerCase()
                            )
                        )
                        .filter(Boolean)
                )
            ].slice(0, 10);

            const updatedUser = await updateUser({
                ...user,
                interests: cleanedInterests
            });

            res.json({
                success: true,
                message: "Interests saved successfully.",
                interests: updatedUser.interests || []
            });

        } catch (error) {

            console.error("Save interests error:", error);

            res.status(500).json({
                success: false,
                message: "Unable to save interests.",
                error: error.message
            });
        }
    }
);
// =====================================================
// SAVE STORY
// =====================================================

app.post(
    "/api/save-story",
    async (req, res) => {

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

                    success:
                        false,

                    message:
                        "User ID and story are required."
                });
            }

            const user =
                await getUserById(
                    userId
                );

            if (!user) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "User not found."
                });
            }

            if (
                !Array.isArray(
                    user.savedStories
                )
            ) {

                user.savedStories = [];
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

            const updatedUser =
                await updateUser(
                    user
                );

            res.json({

                success:
                    true,

                message:
                    alreadySaved
                        ? "Story already saved."
                        : "Story saved successfully.",

                savedStories:
                    updatedUser.savedStories
            });

        } catch (error) {

            console.error(
                "Save story error:",
                error
            );

            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to save story.",

                error:
                    error.message
            });
        }
    }
);

// =====================================================
// GET SAVED STORIES
// =====================================================

app.get(
    "/api/saved/:userId",
    async (req, res) => {

        try {

            const userId =
                req.params.userId;

            const user =
                await getUserById(
                    userId
                );

            if (!user) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "User not found."
                });
            }

            res.json({

                success:
                    true,

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

                success:
                    false,

                message:
                    "Unable to load saved stories.",

                error:
                    error.message
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

                    success:
                        false,

                    message:
                        "Razorpay is not configured on the server."
                });
            }

            const {
                userId
            } = req.body;

            if (!userId) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "User ID is required."
                });
            }

            const user =
                await getUserById(
                    userId
                );

            if (!user) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "User not found."
                });
            }

            // =================================================
            // ₹99 ONE-TIME PAYMENT
            // =================================================

            const options = {

                amount:
                    9900,

                currency:
                    "INR",

                receipt:
                    `gen-z-${Date.now()}`,

                notes: {

                    product:
                        "Gen Z Pulse Plus",

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

                success:
                    true,

                order: {

                    id:
                        order.id,

                    amount:
                        order.amount,

                    currency:
                        order.currency
                },

                // These top-level values
                // match the frontend.
                orderId:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency,

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

                success:
                    false,

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

                    success:
                        false,

                    message:
                        "Payment verification details are incomplete."
                });
            }

            if (
                !RAZORPAY_KEY_SECRET
            ) {

                return res.status(500).json({

                    success:
                        false,

                    message:
                        "Razorpay secret key is not configured."
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
                generatedSignature ===
                razorpay_signature;

            if (!signatureMatches) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Payment verification failed."
                });
            }

            const user =
                await getUserById(
                    userId
                );

            if (!user) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "User not found."
                });
            }

            user.subscription =
                "plus";

            user.subscriptionDetails = {

                plan:
                    "Gen Z Pulse Plus",

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

            const updatedUser =
                await updateUser(
                    user
                );

            res.json({

                success:
                    true,

                message:
                    "Gen Z Pulse Plus activated successfully.",

                subscription:
                    "plus",

                user: {

                    id:
                        updatedUser.id,

                    name:
                        updatedUser.name,

                    email:
                        updatedUser.email,

                    subscription:
                        updatedUser.subscription
                }
            });

        } catch (error) {

            console.error(
                "Razorpay verification failed:",
                error
            );

            res.status(500).json({

                success:
                    false,

                message:
                    "Unable to verify payment.",

                error:
                    error.message
            });
        }
    }
);

// =====================================================
// START SERVER
// =====================================================

async function startServer() {

    try {

        await initializeSupabase();

        app.listen(
            PORT,
            () => {

                console.log(
                    `Gen Z Pulse backend running at http://localhost:${PORT}`
                );

                console.log(
                    `Gemini model: ${GEMINI_MODEL}`
                );

                console.log(
                    supabase
                        ? "Supabase: connected"
                        : "Supabase: NOT connected"
                );

                console.log(
                    RAZORPAY_KEY_ID
                        ? "Razorpay: configured"
                        : "Razorpay: NOT configured"
                );
            }
        );

    } catch (error) {

        console.error(
            "Server startup failed:"
        );

        console.error(
            error.message
        );

        process.exit(1);
    }
}

startServer();