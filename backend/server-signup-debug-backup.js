// =====================================================
// GEN G PULSE - BACKEND SERVER
// Real News + Gemini AI + Supabase + Razorpay
// =====================================================

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Razorpay = require("razorpay");
const path = require("path");

require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require("@supabase/supabase-js");


// =====================================================
// APP CONFIGURATION
// =====================================================

const app = express();

const PORT = process.env.PORT || 3000;


// =====================================================
// API KEYS / ENVIRONMENT
// =====================================================

const GNEWS_API_KEY =
    process.env.GNEWS_API_KEY;

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY;

const SUPABASE_URL =
    process.env.SUPABASE_URL;

const SUPABASE_SECRET_KEY =
    process.env.SUPABASE_SECRET_KEY;

const RAZORPAY_KEY_ID =
    process.env.RAZORPAY_KEY_ID;

const RAZORPAY_KEY_SECRET =
    process.env.RAZORPAY_KEY_SECRET;


// =====================================================
// GEMINI MODEL
// =====================================================

const GEMINI_MODEL =
    "gemini-3.5-flash-lite";


// =====================================================
// SUPABASE CONFIGURATION
// =====================================================

let supabase = null;

if (
    SUPABASE_URL &&
    SUPABASE_SECRET_KEY
) {
    supabase = createClient(
        SUPABASE_URL,
        SUPABASE_SECRET_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    console.log(
        "Supabase database configuration loaded."
    );
} else {
    console.log(
        "Supabase configuration is missing."
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
            model: GEMINI_MODEL
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

app.use(
    cors()
);

app.use(
    express.json({
        limit: "2mb"
    })
);


// =====================================================
// ROOT ROUTE
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.json({
            success: true,
            message:
                "Gen G Pulse Backend is running!",
            version:
                "3.0.0"
        });

    }
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
    "/api/health",
    async (req, res) => {

        let databaseStatus =
            "not configured";

        if (supabase) {

            try {

                const {
                    error
                } =
                    await supabase
                        .from("users")
                        .select("id")
                        .limit(1);

                databaseStatus =
                    error
                        ? "error"
                        : "connected";

            } catch (error) {

                databaseStatus =
                    "error";
            }
        }

        res.json({
            success: true,

            status: "healthy",

            service:
                "Gen G Pulse API",

            database:
                databaseStatus,

            gemini:
                GEMINI_API_KEY
                    ? "configured"
                    : "missing",

            gnews:
                GNEWS_API_KEY
                    ? "configured"
                    : "missing",

            razorpay:
                RAZORPAY_KEY_ID
                    ? "configured"
                    : "missing"
        });

    }
);


// =====================================================
// GEMINI HELPER
// =====================================================

async function generateGeminiContent(
    prompt
) {

    if (!geminiModel) {

        throw new Error(
            "GEMINI_API_KEY is missing."
        );
    }

    const result =
        await geminiModel
            .generateContent(
                prompt
            );

    const response =
        result.response;

    return response.text();
}


// =====================================================
// GEMINI TEST
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
                success: true,

                message:
                    "Gemini AI is working!",

                aiResponse
            });

        } catch (error) {

            console.error(
                "Gemini test failed:",
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
    }
);


// =====================================================
// GNEWS - FETCH NEWS
// =====================================================

app.get(
    "/api/news",
    async (req, res) => {

        try {

            const query =
                req.query.q ||
                req.query.query ||
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
                        },

                        timeout: 15000
                    }
                );


            res.json({

                success: true,

                query,

                totalArticles:
                    response.data
                        .totalArticles || 0,

                articles:
                    response.data
                        .articles || []
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
                    ? source?.name ||
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
// AI SUMMARY
// =====================================================

app.post(
    "/api/ai-summary",
    async (req, res) => {

        try {

            const {
                title,
                description,
                content,
                source
            } = req.body;


            if (!title && !description) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Article information is required."
                });
            }


            const prompt = `

You are Gen G Pulse AI.

Create a short, accurate summary of this news article for Gen Z readers in India.

Title:
${title || ""}

Source:
${
    typeof source === "object"
        ? source?.name || ""
        : source || ""
}

Description:
${description || ""}

Content:
${(content || "").substring(
    0,
    3500
)}

Rules:
- 3 to 5 short sentences.
- Simple language.
- Explain the main event and why it matters.
- Do not invent information.
- Do not give financial or medical advice.
- Use only information provided.

`;


            const summary =
                await generateGeminiContent(
                    prompt
                );


            res.json({

                success: true,

                summary:
                    summary.trim()
            });


        } catch (error) {

            console.error(
                "AI summary error:",
                error.message
            );


            res.status(503).json({

                success: false,

                message:
                    "AI summary is temporarily unavailable.",

                retryable:
                    true
            });
        }
    }
);


// =====================================================
// GEN Z EXPLAIN
// =====================================================

app.post(
    "/api/ai-explain",
    async (req, res) => {

        try {

            const {
                title,
                description,
                content,
                source
            } = req.body;


            if (!title && !description) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Article information is required."
                });
            }


            const prompt = `

You are "Gen Z Explain", an AI feature of Gen G Pulse.

Explain this news story to a college student who has not followed the topic.

Title:
${title || ""}

Source:
${
    typeof source === "object"
        ? source?.name || ""
        : source || ""
}

Description:
${description || ""}

Content:
${(content || "").substring(
    0,
    4000
)}

Return exactly:

IN SIMPLE WORDS
2-3 sentences.

WHY SHOULD I CARE?
2-3 sentences.

KEY TAKEAWAYS
3 bullet points.

ONE-LINE EXPLAINER
One simple sentence.

Do not invent facts.
Do not speculate.
Use only information provided.

`;


            const explanation =
                await generateGeminiContent(
                    prompt
                );


            res.json({

                success: true,

                explanation:
                    explanation.trim(),

                aiResponse:
                    explanation.trim()
            });


        } catch (error) {

            console.error(
                "Gen Z Explain error:",
                error.message
            );


            res.status(503).json({

                success: false,

                message:
                    "Gen Z Explain is temporarily unavailable.",

                retryable:
                    true
            });
        }
    }
);


// =====================================================
// SIGN UP - SUPABASE
// =====================================================

app.post(
    "/api/signup",
    async (req, res) => {

        try {

            if (!supabase) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Supabase is not configured."
                });
            }


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


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            if (password.length < 6) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Password must contain at least 6 characters."
                });
            }


            const {
                data: existingUser,
                error: existingError
            } =
                await supabase
                    .from("users")
                    .select("id")
                    .eq(
                        "email",
                        normalizedEmail
                    )
                    .maybeSingle();


            if (existingError) {

                throw existingError;
            }


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


            const {
                data: newUser,
                error
            } =
                await supabase
                    .from("users")
                    .insert({

                        name:
                            name.trim(),

                        email:
                            normalizedEmail,

                        password:
                            hashedPassword,

                        subscription:
                            "free"
                    })
                    .select(
                        "id,name,email,subscription,created_at"
                    )
                    .single();


            if (error) {

                throw error;
            }


            await supabase
                .from(
                    "user_preferences"
                )
                .insert({

                    user_id:
                        newUser.id,

                    not_interested_categories:
                        []
                });


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
                    "Signup database error: " +
                    error.message,

                details: {
                    code: error.code || null,
                    details: error.details || null,
                    hint: error.hint || null
                }
            });
        }


// =====================================================
// SIGN IN - SUPABASE
// =====================================================

app.post(
    "/api/signin",
    async (req, res) => {

        try {

            if (!supabase) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Supabase is not configured."
                });
            }


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


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const {
                data: user,
                error
            } =
                await supabase
                    .from("users")
                    .select(
                        "id,name,email,password,subscription"
                    )
                    .eq(
                        "email",
                        normalizedEmail
                    )
                    .maybeSingle();


            if (error) {

                throw error;
            }


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
                error.message
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
// SAVE STORY - SUPABASE
// =====================================================

app.post(
    "/api/save-story",
    async (req, res) => {

        try {

            if (!supabase) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Supabase is not configured."
                });
            }


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


            if (!story.url) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Story URL is required."
                });
            }


            const {
                data: existingStory,
                error: existingError
            } =
                await supabase
                    .from("saved_stories")
                    .select("id")
                    .eq(
                        "user_id",
                        userId
                    )
                    .eq(
                        "story->>url",
                        story.url
                    )
                    .maybeSingle();


            if (existingError) {

                throw existingError;
            }


            if (existingStory) {

                const {
                    data: savedStories,
                    error
                } =
                    await supabase
                        .from("saved_stories")
                        .select(
                            "id,story,created_at"
                        )
                        .eq(
                            "user_id",
                            userId
                        )
                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        );


                if (error) {
                    throw error;
                }


                return res.json({

                    success: true,

                    message:
                        "Story already saved.",

                    savedStories:
                        savedStories || []
                });
            }


            const {
                error
            } =
                await supabase
                    .from("saved_stories")
                    .insert({

                        user_id:
                            userId,

                        story:
                            story
                    });


            if (error) {

                throw error;
            }


            const {
                data: savedStories
            } =
                await supabase
                    .from("saved_stories")
                    .select(
                        "id,story,created_at"
                    )
                    .eq(
                        "user_id",
                        userId
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            res.json({

                success: true,

                message:
                    "Story saved successfully.",

                savedStories:
                    savedStories || []
            });


        } catch (error) {

            console.error(
                "Save story error:",
                error.message
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
    async (req, res) => {

        try {

            if (!supabase) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Supabase is not configured."
                });
            }


            const userId =
                req.params.userId;


            const {
                data: savedStories,
                error
            } =
                await supabase
                    .from("saved_stories")
                    .select(
                        "id,story,created_at"
                    )
                    .eq(
                        "user_id",
                        userId
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            if (error) {

                throw error;
            }


            res.json({

                success: true,

                savedStories:
                    savedStories || []
            });


        } catch (error) {

            console.error(
                "Get saved stories error:",
                error.message
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
// DELETE SAVED STORY
// =====================================================

app.delete(
    "/api/saved/:userId/:storyId",
    async (req, res) => {

        try {

            if (!supabase) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Supabase is not configured."
                });
            }


            const {
                userId,
                storyId
            } = req.params;


            const {
                error
            } =
                await supabase
                    .from("saved_stories")
                    .delete()
                    .eq(
                        "id",
                        storyId
                    )
                    .eq(
                        "user_id",
                        userId
                    );


            if (error) {

                throw error;
            }


            res.json({

                success: true,

                message:
                    "Story removed from saved stories."
            });


        } catch (error) {

            console.error(
                "Delete saved story error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to delete saved story."
            });
        }
    }
);


// =====================================================
// GET USER PREFERENCES
// =====================================================

app.get(
    "/api/preferences/:userId",
    async (req, res) => {

        try {

            if (!supabase) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Supabase is not configured."
                });
            }


            const userId =
                req.params.userId;


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "user_preferences"
                    )
                    .select(
                        "not_interested_categories"
                    )
                    .eq(
                        "user_id",
                        userId
                    )
                    .maybeSingle();


            if (error) {

                throw error;
            }


            res.json({

                success: true,

                preferences:
                    data || {

                        not_interested_categories:
                            []
                    }
            });


        } catch (error) {

            console.error(
                "Get preferences error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load preferences."
            });
        }
    }
);


// =====================================================
// UPDATE USER PREFERENCES
// =====================================================

app.put(
    "/api/preferences/:userId",
    async (req, res) => {

        try {

            if (!supabase) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Supabase is not configured."
                });
            }


            const userId =
                req.params.userId;


            const categories =
                Array.isArray(
                    req.body
                        .notInterestedCategories
                )
                    ? req.body
                        .notInterestedCategories
                    : [];


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "user_preferences"
                    )
                    .upsert(

                        {

                            user_id:
                                userId,

                            not_interested_categories:
                                categories,

                            updated_at:
                                new Date()
                                    .toISOString()
                        },

                        {
                            onConflict:
                                "user_id"
                        }

                    )
                    .select()
                    .single();


            if (error) {

                throw error;
            }


            res.json({

                success: true,

                preferences:
                    data
            });


        } catch (error) {

            console.error(
                "Update preferences error:",
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to update preferences."
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


            if (!supabase) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Supabase is not configured."
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


            const {
                data: user,
                error: userError
            } =
                await supabase
                    .from("users")
                    .select(
                        "id,name,email,subscription"
                    )
                    .eq(
                        "id",
                        userId
                    )
                    .maybeSingle();


            if (userError) {

                throw userError;
            }


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."
                });
            }


            const options = {

                amount:
                    9900,

                currency:
                    "INR",

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
                await razorpay
                    .orders
                    .create(
                        options
                    );


            await supabase
                .from("payments")
                .insert({

                    user_id:
                        userId,

                    razorpay_order_id:
                        order.id,

                    amount:
                        order.amount,

                    currency:
                        order.currency,

                    plan:
                        "plus",

                    status:
                        "created"
                });


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
                error.message
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

            if (!supabase) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Supabase is not configured."
                });
            }


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


            if (!RAZORPAY_KEY_SECRET) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Razorpay secret is not configured."
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


            const received =
                Buffer.from(
                    razorpay_signature
                );

            const generated =
                Buffer.from(
                    generatedSignature
                );


            if (
                received.length !==
                generated.length ||
                !crypto.timingSafeEqual(
                    generated,
                    received
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment verification failed."
                });
            }


            const {
                data: user,
                error: userError
            } =
                await supabase
                    .from("users")
                    .select(
                        "id,name,email,subscription"
                    )
                    .eq(
                        "id",
                        userId
                    )
                    .maybeSingle();


            if (userError) {

                throw userError;
            }


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found."
                });
            }


            const subscriptionDetails = {

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
                    new Date()
                        .toISOString()
            };


            const {
                error: updateError
            } =
                await supabase
                    .from("users")
                    .update({

                        subscription:
                            "plus",

                        subscription_details:
                            subscriptionDetails

                    })
                    .eq(
                        "id",
                        userId
                    );


            if (updateError) {

                throw updateError;
            }


            await supabase
                .from("payments")
                .update({

                    razorpay_payment_id:
                        razorpay_payment_id,

                    razorpay_signature:
                        razorpay_signature,

                    status:
                        "verified",

                    verified_at:
                        new Date()
                            .toISOString()

                })
                .eq(
                    "razorpay_order_id",
                    razorpay_order_id
                )
                .eq(
                    "user_id",
                    userId
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
                        "plus"
                }
            });


        } catch (error) {

            console.error(
                "Razorpay verification failed:",
                error.message
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
// 404 HANDLER
// =====================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found.",

            path:
                req.originalUrl
        });
    }
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "Server error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error."
        });
    }
);


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "=============================================="
        );

        console.log(
            "       GEN G PULSE BACKEND"
        );

        console.log(
            "=============================================="
        );

        console.log(
            `Server: http://localhost:${PORT}`
        );

        console.log(
            `Gemini model: ${GEMINI_MODEL}`
        );

        console.log(
            GNEWS_API_KEY
                ? "GNews: configured"
                : "GNews: NOT configured"
        );

        console.log(
            GEMINI_API_KEY
                ? "Gemini: configured"
                : "Gemini: NOT configured"
        );

        console.log(
            supabase
                ? "Supabase: configured"
                : "Supabase: NOT configured"
        );

        console.log(
            razorpay
                ? "Razorpay: configured"
                : "Razorpay: NOT configured"
        );

        console.log(
            "=============================================="
        );

        console.log("");
    }
);