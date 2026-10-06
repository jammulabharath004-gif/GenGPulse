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
        service: "Gen Z Pulse API"
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
                        max: 100,
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

// =====================================================
// SIGN UP
// =====================================================

app.post(
    "/api/signup",
    async (req, res) => {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Name, email and password are required."
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            const { data: existingUser, error: checkError } = await supabase
                .from("users")
                .select("id")
                .eq("email", normalizedEmail)
                .maybeSingle();

            if (checkError) {
                console.error("Signup database check error:", checkError);
                return res.status(500).json({
                    success: false,
                    message: "Unable to check account."
                });
            }

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "An account with this email already exists."
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const { data: newUser, error: insertError } = await supabase
                .from("users")
                .insert({
                    name: name.trim(),
                    email: normalizedEmail,
                    password: hashedPassword,
                    subscription: "free"
                })
                .select("id,name,email,subscription")
                .single();

            if (insertError) {
                console.error("Signup database insert error:", insertError);
                return res.status(500).json({
                    success: false,
                    message: "Unable to create account."
                });
            }

            return res.status(201).json({
                success: true,
                message: "Account created successfully.",
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    subscription: newUser.subscription || "free"
                }
            });

        } catch (error) {
            console.error("Signup error:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to create account."
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
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email and password are required."
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            const { data: user, error: userError } = await supabase
                .from("users")
                .select("id,name,email,password,subscription")
                .eq("email", normalizedEmail)
                .maybeSingle();

            if (userError) {
                console.error("Signin database error:", userError);
                return res.status(500).json({
                    success: false,
                    message: "Unable to sign in."
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password."
                });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password."
                });
            }

            return res.json({
                success: true,
                message: "Sign in successful.",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    subscription: user.subscription || "free"
                }
            });

        } catch (error) {
            console.error("Signin error:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to sign in."
            });
        }
    }
);

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
                userId,
                email
            } = req.body;

            if (!userId && !email) {

                return res.status(400).json({

                    success: false,

                    message:
                        "User ID or email is required."
                });
            }

            // ------------------------------------------------
            // Try user ID first
            // ------------------------------------------------

            let user = null;

            if (userId) {

                user =
                    await getUserById(
                        String(userId)
                    );
            }

            // ------------------------------------------------
            // If the saved ID is old/stale,
            // find the account using email.
            // ------------------------------------------------

            if (!user && email) {

                user =
                    await getUserByEmail(
                        String(email)
                            .trim()
                            .toLowerCase()
                    );
            }

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found. Please sign out and sign in again."
                });
            }

            // ------------------------------------------------
            // â‚¹49
            // Razorpay uses paise.
            // ------------------------------------------------

            const options = {

                amount: 4900,

                currency: "INR",

                receipt:
                    `gen-z-${Date.now()}`,

                notes: {

                    product:
                        "Gen Z Plus",

                    userId:
                        user.id,

                    email:
                        user.email,

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

                orderId:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency,

                razorpayKeyId:
                    RAZORPAY_KEY_ID,

                // Correct database user ID
                userId:
                    user.id,

                email:
                    user.email,

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
 // RAZORPAY - VERIFY GEN Z PLUS PAYMENT
 // =====================================================

app.post(
    "/api/verify-plus-payment",
    async (req, res) => {

        try {

            const {
                email,
                userId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            } = req.body;

            if(
                !razorpay_order_id ||
                !razorpay_payment_id ||
                !razorpay_signature
            ){

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment verification details are incomplete."
                });
            }

            if(!RAZORPAY_KEY_SECRET){

                return res.status(500).json({

                    success: false,

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

            if(
                generatedSignature !==
                razorpay_signature
            ){

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment verification failed."
                });
            }

            // Find account by email first.

            let user = null;

            if(email){

                user =
                    await getUserByEmail(
                        String(email)
                            .trim()
                            .toLowerCase()
                    );
            }

            if(!user && userId){

                user =
                    await getUserById(
                        String(userId)
                    );
            }

            if(!user){

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found. Please sign in again."
                });
            }

            user.subscription =
                "plus";

            user.subscriptionDetails = {

                plan:
                    "Gen Z Plus",

                amount:
                    49,

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

                success: true,

                message:
                    "Gen Z Plus activated successfully.",

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

        } catch(error){

            console.error(
                "Razorpay verification failed:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to verify payment.",

                error:
                    error.message
            });
        }
    }
);
// START SERVER
// =====================================================

/* =========================================================
   SERVE GEN Z PULSE FRONTEND
========================================================= */

const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

app.use(express.static(FRONTEND_DIR));

app.get("/", (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});
// =====================================================
// START SERVER
// =====================================================

const server = app.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `Gen Z Pulse backend running on port ${PORT}`
        );

        console.log(
            `Gemini model: ${GEMINI_MODEL}`
        );

        console.log(
            RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
                ? "Razorpay: configured"
                : "Razorpay: NOT configured"
        );
    }
);

// Initialize Supabase AFTER the server starts.
// This prevents Render from waiting for database
// initialization before opening the HTTP port.
initializeSupabase()
    .then(() => {
        console.log("Supabase: connected");
    })
    .catch((error) => {
        console.error(
            "Supabase initialization failed:",
            error.message
        );
    });

// Graceful shutdown for Render
process.on("SIGTERM", () => {
    server.close(() => {
        process.exit(0);
    });
});
async function getRssNews(query){const u=`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;const r=await axios.get(u,{timeout:10000,headers:{"User-Agent":"Mozilla/5.0"}});const items=r.data.match(/<item>[\s\S]*?<\/item>/g)||[];const tag=(x,n)=>{const m=x.match(new RegExp("<"+n+">([\\s\\S]*?)</"+n+">"));return m?m[1].replace("<![CDATA[","").replace("]]>","").replace(/&amp;/g,"&").replace(/&quot;/g,"\"").replace(/&#39;/g,String.fromCharCode(39)).replace(/&lt;/g,"<").replace(/&gt;/g,">").trim():""};const articles=items.slice(0,10).map((x,i)=>{const link=tag(x,"link"),title=tag(x,"title"),description=tag(x,"description"),pub=tag(x,"pubDate"),source=tag(x,"source")||"Google News";return{id:"rss-"+i+"-"+Date.now(),title,description,content:description,url:link,image:"",publishedAt:pub,source:{name:source},category:"General"}}).filter(x=>x.title&&x.url);return{success:true,query,totalArticles:articles.length,articles}}










