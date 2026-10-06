// =====================================================
// GEN Z PULSE BACKEND
// =====================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

const PORT = process.env.PORT || 3000;

// =====================================================
// CONFIGURATION
// =====================================================

const GNEWS_API_KEY =
    process.env.GNEWS_API_KEY;

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY;

const RAZORPAY_KEY_ID =
    process.env.RAZORPAY_KEY_ID;

const RAZORPAY_KEY_SECRET =
    process.env.RAZORPAY_KEY_SECRET;

const SUPABASE_URL =
    process.env.SUPABASE_URL;

const SUPABASE_SECRET_KEY =
    process.env.SUPABASE_SECRET_KEY;

const GEMINI_MODEL =
    "gemini-3.5-flash-lite";

// =====================================================
// SUPABASE
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
        "Supabase configuration loaded."
    );
} else {
    console.log(
        "Supabase configuration is missing."
    );
}

// =====================================================
// GEMINI
// =====================================================

let genAI = null;
let geminiModel = null;

if (GEMINI_API_KEY) {

    genAI =
        new GoogleGenerativeAI(
            GEMINI_API_KEY
        );

    geminiModel =
        genAI.getGenerativeModel({
            model: GEMINI_MODEL
        });

    console.log(
        `Gemini model: ${GEMINI_MODEL}`
    );

} else {

    console.log(
        "Gemini API key is missing."
    );
}

// =====================================================
// RAZORPAY
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
    cors({
        origin: [
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ],

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ],

        credentials: false
    })
);

app.use(
    express.json({
        limit: "2mb"
    })
);

// =====================================================
// USERS JSON FILE
// =====================================================

const USERS_FILE =
    path.join(
        __dirname,
        "users.json"
    );

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

        const data =
            fs.readFileSync(
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
        JSON.stringify(
            users,
            null,
            2
        ),
        "utf8"
    );
}

// =====================================================
// DATABASE HELPERS
// =====================================================

function ensureDatabase() {

    if (!supabase) {

        throw new Error(
            "Supabase is not configured."
        );
    }
}

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

        subscription:
            row.subscription ||
            "free",

        subscriptionDetails:
            row.subscription_details ||
            row.subscriptionDetails ||
            null
    };
}

// =====================================================
// GET USER BY ID
// =====================================================

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

// =====================================================
// GET USER BY EMAIL
// =====================================================

async function getUserByEmail(email) {

    ensureDatabase();

    const normalizedEmail =
        String(email || "")
            .trim()
            .toLowerCase();

    if (!normalizedEmail) {
        return null;
    }

    const {
        data,
        error
    } = await supabase
        .from("users")
        .select("*")
        .eq(
            "email",
            normalizedEmail
        )
        .maybeSingle();

    if (error) {

        throw error;
    }

    return dbRowToUser(data);
}

// =====================================================
// UPDATE USER
// =====================================================

async function updateUser(user) {

    ensureDatabase();

    if (!user || !user.id) {

        throw new Error(
            "User ID is required."
        );
    }

    const updateData = {
        name:
            user.name,

        email:
            user.email,

        subscription:
            user.subscription ||
            "free"
    };

    /*
     * Only send password when one exists.
     */

    if (user.password) {

        updateData.password =
            user.password;
    }

    /*
     * Support either column naming style.
     * The normal database column expected here
     * is subscription_details.
     */

    if (
        user.subscriptionDetails !==
        undefined
    ) {

        updateData.subscription_details =
            user.subscriptionDetails;
    }

    const {
        data,
        error
    } = await supabase
        .from("users")
        .update(updateData)
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
// GEMINI HELPER
// =====================================================

async function generateGeminiContent(
    prompt
) {

    if (!geminiModel) {

        throw new Error(
            "Gemini API key is missing."
        );
    }

    try {

        const result =
            await geminiModel.generateContent(
                prompt
            );

        const response =
            result.response;

        return response.text();

    } catch (error) {

        console.error(
            "Gemini error:",
            error.message
        );

        throw error;
    }
}

// =====================================================
// RSS NEWS HELPER
// =====================================================

async function getRssNews(query) {

    const url =
        `https://news.google.com/rss/search?q=${encodeURIComponent(
            query
        )}&hl=en-IN&gl=IN&ceid=IN:en`;

    const response =
        await axios.get(
            url,
            {
                timeout: 10000,

                headers: {
                    "User-Agent":
                        "Mozilla/5.0"
                }
            }
        );

    const xml =
        response.data;

    const items =
        xml.match(
            /<item>[\s\S]*?<\/item>/g
        ) || [];

    function tag(
        block,
        name
    ) {

        const regex =
            new RegExp(
                `<${name}>([\\s\\S]*?)</${name}>`
            );

        const match =
            block.match(regex);

        if (!match) {
            return "";
        }

        return match[1]
            .replace(
                "<![CDATA[",
                ""
            )
            .replace(
                "]]>",
                ""
            )
            .replace(
                /&amp;/g,
                "&"
            )
            .replace(
                /&quot;/g,
                '"'
            )
            .replace(
                /&#39;/g,
                "'"
            )
            .replace(
                /&lt;/g,
                "<"
            )
            .replace(
                /&gt;/g,
                ">"
            )
            .trim();
    }

    const articles =
        items
            .slice(0, 10)
            .map(
                (
                    item,
                    index
                ) => {

                    const link =
                        tag(
                            item,
                            "link"
                        );

                    const title =
                        tag(
                            item,
                            "title"
                        );

                    const description =
                        tag(
                            item,
                            "description"
                        );

                    const publishedAt =
                        tag(
                            item,
                            "pubDate"
                        );

                    const source =
                        tag(
                            item,
                            "source"
                        ) ||
                        "Google News";

                    return {

                        id:
                            `rss-${Date.now()}-${index}`,

                        title:

                            title,

                        description:

                            description,

                        content:

                            description,

                        url:

                            link,

                        image:
                            "",

                        publishedAt:

                            publishedAt,

                        source: {

                            name:
                                source
                        },

                        category:
                            "General"
                    };
                }
            )
            .filter(
                article =>
                    article.title &&
                    article.url
            );

    return {

        success:
            true,

        query:
            query,

        totalArticles:
            articles.length,

        articles:
            articles
    };
}

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
                "Gen Z Pulse API"
        });
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

                return res.status(
                    500
                ).json({

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
                                100,

                            apikey:
                                GNEWS_API_KEY
                        },

                        timeout:
                            15000
                    }
                );

            res.json({

                success:
                    true,

                query:
                    query,

                totalArticles:
                    response.data
                        .totalArticles,

                articles:
                    response.data
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

                return res.status(
                    400
                ).json({

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
                typeof source ===
                "object"
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

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Name, email and password are required."
                });
            }

            ensureDatabase();

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();

            const {
                data:
                    existingUser,
                error:
                    checkError
            } = await supabase
                .from("users")
                .select("id")
                .eq(
                    "email",
                    normalizedEmail
                )
                .maybeSingle();

            if (checkError) {

                console.error(
                    "Signup database check error:",
                    checkError
                );

                return res.status(
                    500
                ).json({

                    success:
                        false,

                    message:
                        "Unable to check account."
                });
            }

            if (existingUser) {

                return res.status(
                    409
                ).json({

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

            const {
                data:
                    newUser,
                error:
                    insertError
            } = await supabase
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
                    "id,name,email,subscription"
                )
                .single();

            if (insertError) {

                console.error(
                    "Signup database insert error:",
                    insertError
                );

                return res.status(
                    500
                ).json({

                    success:
                        false,

                    message:
                        "Unable to create account."
                });
            }

            return res.status(
                201
            ).json({

                success:
                    true,

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
                        newUser.subscription ||
                        "free"
                }
            });

        } catch (error) {

            console.error(
                "Signup error:",
                error
            );

            return res.status(
                500
            ).json({

                success:
                    false,

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

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Email and password are required."
                });
            }

            ensureDatabase();

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();

            const {
                data:
                    user,
                error:
                    userError
            } = await supabase
                .from("users")
                .select(
                    "id,name,email,password,subscription,subscription_details"
                )
                .eq(
                    "email",
                    normalizedEmail
                )
                .maybeSingle();

            if (userError) {

                console.error(
                    "Signin database error:",
                    userError
                );

                return res.status(
                    500
                ).json({

                    success:
                        false,

                    message:
                        "Unable to sign in."
                });
            }

            if (!user) {

                return res.status(
                    401
                ).json({

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

                return res.status(
                    401
                ).json({

                    success:
                        false,

                    message:
                        "Invalid email or password."
                });
            }

            return res.json({

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
                        "free",

                    subscriptionDetails:
                        user.subscription_details ||
                        null
                }
            });

        } catch (error) {

            console.error(
                "Signin error:",
                error
            );

            return res.status(
                500
            ).json({

                success:
                    false,

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

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "User ID and story are required."
                });
            }

            /*
             * Keep compatibility with the existing
             * users.json saved-story system.
             */

            const users =
                readUsers();

            let user =
                users.find(
                    item =>
                        String(item.id) ===
                        String(userId)
                );

            /*
             * If the Supabase account does not exist
             * in users.json yet, create a local
             * saved-story record.
             */

            if (!user) {

                try {

                    const dbUser =
                        await getUserById(
                            String(userId)
                        );

                    if (!dbUser) {

                        return res.status(
                            404
                        ).json({

                            success:
                                false,

                            message:
                                "User not found."
                        });
                    }

                    user = {

                        id:
                            dbUser.id,

                        name:
                            dbUser.name,

                        email:
                            dbUser.email,

                        savedStories:
                            []
                    };

                    users.push(
                        user
                    );

                } catch (dbError) {

                    console.error(
                        "Save story user lookup error:",
                        dbError.message
                    );

                    return res.status(
                        404
                    ).json({

                        success:
                            false,

                        message:
                            "User not found."
                    });
                }
            }

            if (
                !user.savedStories
            ) {

                user.savedStories =
                    [];
            }

            const alreadySaved =
                user.savedStories.some(
                    item =>
                        item.url &&
                        story.url &&
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

            return res.json({

                success:
                    true,

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

            return res.status(
                500
            ).json({

                success:
                    false,

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
                        String(item.id) ===
                        String(userId)
                );

            if (!user) {

                return res.json({

                    success:
                        true,

                    savedStories:
                        []
                });
            }

            return res.json({

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

            return res.status(
                500
            ).json({

                success:
                    false,

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

                return res.status(
                    500
                ).json({

                    success:
                        false,

                    message:
                        "Razorpay is not configured on the server."
                });
            }

            const {
                userId,
                email
            } = req.body;

            if (
                !userId &&
                !email
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "User ID or email is required."
                });
            }

            let user = null;

            if (userId) {

                user =
                    await getUserById(
                        String(userId)
                    );
            }

            if (
                !user &&
                email
            ) {

                user =
                    await getUserByEmail(
                        String(email)
                            .trim()
                            .toLowerCase()
                    );
            }

            if (!user) {

                return res.status(
                    404
                ).json({

                    success:
                        false,

                    message:
                        "User not found. Please sign out and sign in again."
                });
            }

            const options = {

                amount:
                    4900,

                currency:
                    "INR",

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

            return res.json({

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

                orderId:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency,

                razorpayKeyId:
                    RAZORPAY_KEY_ID,

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

            return res.status(
                500
            ).json({

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
                email,
                userId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            } = req.body;

            if (
                !razorpay_order_id ||
                !razorpay_payment_id ||
                !razorpay_signature
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Payment verification details are incomplete."
                });
            }

            if (
                !RAZORPAY_KEY_SECRET
            ) {

                return res.status(
                    500
                ).json({

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

            if (
                generatedSignature !==
                razorpay_signature
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Payment verification failed."
                });
            }

            let user = null;

            if (email) {

                user =
                    await getUserByEmail(
                        String(email)
                            .trim()
                            .toLowerCase()
                    );
            }

            if (
                !user &&
                userId
            ) {

                user =
                    await getUserById(
                        String(userId)
                    );
            }

            if (!user) {

                return res.status(
                    404
                ).json({

                    success:
                        false,

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
                    new Date()
                        .toISOString()
            };

            const updatedUser =
                await updateUser(
                    user
                );

            return res.json({

                success:
                    true,

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

        } catch (error) {

            console.error(
                "Razorpay verification failed:",
                error
            );

            return res.status(
                500
            ).json({

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
// LIVE OPPORTUNITIES API
// =====================================================

app.get(
    "/api/opportunities",
    async (req, res) => {

        try {

            const searches = [

                {
                    type:
                        "Scholarship",

                    query:
                        "scholarship India students 2026"
                },

                {
                    type:
                        "Scholarship",

                    query:
                        "fellowship India students 2026"
                },

                {
                    type:
                        "Career & Internship",

                    query:
                        "internship India students 2026"
                },

                {
                    type:
                        "Career & Internship",

                    query:
                        "fellowship jobs students India 2026"
                },

                {
                    type:
                        "Events & Hackathons",

                    query:
                        "student hackathon India 2026"
                },

                {
                    type:
                        "Events & Hackathons",

                    query:
                        "student competition event India 2026"
                }
            ];

            const results =
                await Promise.all(

                    searches.map(
                        async item => {

                            try {

                                const result =
                                    await getRssNews(
                                        item.query
                                    );

                                return result
                                    .articles
                                    .map(
                                        article => ({

                                            ...article,

                                            opportunityType:
                                                item.type,

                                            category:
                                                item.type
                                        })
                                    );

                            } catch (error) {

                                console.error(
                                    `Opportunity search failed: ${item.query}`,
                                    error.message
                                );

                                return [];
                            }
                        }
                    )
                );

            const combined =
                results.flat();

            // -------------------------------------------------
            // CLEAN TEXT
            // -------------------------------------------------

            function cleanText(value) {

                return String(
                    value || ""
                )
                    .replace(
                        /<script[\s\S]*?<\/script>/gi,
                        ""
                    )
                    .replace(
                        /<style[\s\S]*?<\/style>/gi,
                        ""
                    )
                    .replace(
                        /<[^>]*>/g,
                        " "
                    )
                    .replace(
                        /&nbsp;/gi,
                        " "
                    )
                    .replace(
                        /&amp;/gi,
                        "&"
                    )
                    .replace(
                        /&quot;/gi,
                        '"'
                    )
                    .replace(
                        /&#39;/gi,
                        "'"
                    )
                    .replace(
                        /&lt;/gi,
                        "<"
                    )
                    .replace(
                        /&gt;/gi,
                        ">"
                    )
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();
            }

            // -------------------------------------------------
            // NORMALIZE TITLE
            // -------------------------------------------------

            function normalizeTitle(
                value
            ) {

                return cleanText(
                    value
                )
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9]+/g,
                        " "
                    )
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();
            }

            // -------------------------------------------------
            // DESCRIPTION
            // -------------------------------------------------

            function createDescription(
                article
            ) {

                const description =
                    cleanText(
                        article.description ||
                        article.content ||
                        ""
                    );

                if (!description) {

                    return "Open the opportunity details to learn more.";
                }

                if (
                    description.length <=
                    280
                ) {

                    return description;
                }

                return (
                    description.substring(
                        0,
                        277
                    ) +
                    "..."
                );
            }

            // -------------------------------------------------
            // ACTION
            // -------------------------------------------------

            function getActionLabel(
                type
            ) {

                if (
                    type ===
                    "Scholarship"
                ) {

                    return "Apply";
                }

                if (
                    type ===
                    "Career & Internship"
                ) {

                    return "Connect";
                }

                if (
                    type ===
                    "Events & Hackathons"
                ) {

                    return "Attend";
                }

                return "View Details";
            }

            // -------------------------------------------------
            // TAGS
            // -------------------------------------------------

            function getTags(
                type
            ) {

                if (
                    type ===
                    "Scholarship"
                ) {

                    return [
                        "Students",
                        "Funding",
                        "Scholarship"
                    ];
                }

                if (
                    type ===
                    "Career & Internship"
                ) {

                    return [
                        "Internships",
                        "Careers",
                        "Skills"
                    ];
                }

                if (
                    type ===
                    "Events & Hackathons"
                ) {

                    return [
                        "Events",
                        "Hackathon",
                        "Community"
                    ];
                }

                return [
                    "Opportunity",
                    "Students"
                ];
            }

            // -------------------------------------------------
            // ELIGIBILITY
            // -------------------------------------------------

            function getEligibility(
                type,
                title,
                description
            ) {

                const text =
                    (
                        String(
                            title ||
                            ""
                        ) +
                        " " +
                        String(
                            description ||
                            ""
                        )
                    ).toLowerCase();

                if (
                    type ===
                    "Scholarship"
                ) {

                    if (
                        text.includes(
                            "phd"
                        ) ||
                        text.includes(
                            "doctoral"
                        )
                    ) {

                        return "Check the official eligibility criteria for PhD or doctoral applicants.";
                    }

                    if (
                        text.includes(
                            "college"
                        ) ||
                        text.includes(
                            "university"
                        ) ||
                        text.includes(
                            "student"
                        )
                    ) {

                        return "Students should check the official eligibility criteria before applying.";
                    }

                    return "Eligibility depends on the scholarship or fellowship. Check the official details.";
                }

                if (
                    type ===
                    "Career & Internship"
                ) {

                    if (
                        text.includes(
                            "internship"
                        )
                    ) {

                        return "Students and eligible applicants should verify the internship requirements.";
                    }

                    if (
                        text.includes(
                            "fellowship"
                        ) ||
                        text.includes(
                            "graduate"
                        )
                    ) {

                        return "Check the official fellowship eligibility and qualification requirements.";
                    }

                    return "Check the official job or internship requirements.";
                }

                if (
                    type ===
                    "Events & Hackathons"
                ) {

                    return "Students and eligible participants should check the official event rules and registration requirements.";
                }

                return "Check the official opportunity requirements.";
            }

            // -------------------------------------------------
            // DEADLINE
            // -------------------------------------------------

            function getDeadline(
                article
            ) {

                /*
                 * Do not invent deadlines.
                 * Google News RSS does not reliably
                 * provide application deadlines.
                 */

                return null;
            }

            // -------------------------------------------------
            // BUILD OBJECTS
            // -------------------------------------------------

            const cleaned =
                combined.map(
                    article => {

                        const title =
                            cleanText(
                                article.title
                            );

                        const description =
                            createDescription(
                                article
                            );

                        const type =
                            article.opportunityType;

                        const newsUrl =
                            String(
                                article.url ||
                                ""
                            ).trim();

                        return {

                            id:
                                article.id,

                            type:
                                type,

                            title:
                                title,

                            description:
                                description,

                            source:
                                cleanText(
                                    article.source
                                        ?.name ||
                                    "Google News"
                                ),

                            publishedAt:
                                article.publishedAt ||
                                "",

                            deadline:
                                getDeadline(
                                    article
                                ),

                            eligibility:
                                getEligibility(
                                    type,
                                    title,
                                    description
                                ),

                            tags:
                                getTags(
                                    type
                                ),

                            actionLabel:
                                getActionLabel(
                                    type
                                ),

                            actionUrl:
                                newsUrl,

                            sourceUrl:
                                newsUrl,

                            image:
                                article.image ||
                                "",

                            category:
                                type
                        };
                    }
                );

            // -------------------------------------------------
            // REMOVE EMPTY
            // -------------------------------------------------

            const validOpportunities =
                cleaned.filter(
                    article => {

                        return (
                            article.title &&
                            article.actionUrl
                        );
                    }
                );

            // -------------------------------------------------
            // EXACT DEDUPLICATION
            // -------------------------------------------------

            const seenTitles =
                new Set();

            const seenUrls =
                new Set();

            const uniqueOpportunities =
                validOpportunities.filter(
                    article => {

                        const titleKey =
                            normalizeTitle(
                                article.title
                            );

                        const urlKey =
                            article.actionUrl
                                .toLowerCase()
                                .trim();

                        if (
                            seenTitles.has(
                                titleKey
                            )
                        ) {

                            return false;
                        }

                        if (
                            seenUrls.has(
                                urlKey
                            )
                        ) {

                            return false;
                        }

                        seenTitles.add(
                            titleKey
                        );

                        seenUrls.add(
                            urlKey
                        );

                        return true;
                    }
                );

            // -------------------------------------------------
            // SIMILARITY
            // -------------------------------------------------

            function titleWords(
                title
            ) {

                return new Set(
                    normalizeTitle(
                        title
                    )
                        .split(" ")
                        .filter(
                            word =>
                                word.length > 2
                        )
                );
            }

            function similarity(
                titleA,
                titleB
            ) {

                const wordsA =
                    titleWords(
                        titleA
                    );

                const wordsB =
                    titleWords(
                        titleB
                    );

                if (
                    !wordsA.size ||
                    !wordsB.size
                ) {

                    return 0;
                }

                let intersection = 0;

                wordsA.forEach(
                    word => {

                        if (
                            wordsB.has(
                                word
                            )
                        ) {

                            intersection++;
                        }
                    }
                );

                const union =
                    new Set([
                        ...wordsA,
                        ...wordsB
                    ]).size;

                return union
                    ? intersection /
                      union
                    : 0;
            }

            const finalOpportunities =
                [];

            for (
                const opportunity
                of uniqueOpportunities
            ) {

                let duplicate =
                    false;

                for (
                    const existing
                    of finalOpportunities
                ) {

                    const score =
                        similarity(
                            opportunity.title,
                            existing.title
                        );

                    if (
                        score >=
                        0.70
                    ) {

                        duplicate =
                            true;

                        break;
                    }
                }

                if (!duplicate) {

                    finalOpportunities.push(
                        opportunity
                    );
                }
            }

            // -------------------------------------------------
            // NEWEST FIRST
            // -------------------------------------------------

            finalOpportunities.sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.publishedAt
                        ).getTime() ||
                        0;

                    const dateB =
                        new Date(
                            b.publishedAt
                        ).getTime() ||
                        0;

                    return (
                        dateB -
                        dateA
                    );
                }
            );

            return res.json({

                success:
                    true,

                totalOpportunities:
                    finalOpportunities.length,

                opportunities:
                    finalOpportunities
            });

        } catch (error) {

            console.error(
                "Opportunities API error:",
                error
            );

            return res.status(
                500
            ).json({

                success:
                    false,

                message:
                    "Unable to load live opportunities.",

                error:
                    error.message
            });
        }
    }
);

// =====================================================
// SERVE FRONTEND
// =====================================================

const FRONTEND_DIR =
    path.join(
        __dirname,
        "..",
        "frontend"
    );

app.use(
    express.static(
        FRONTEND_DIR
    )
);

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                FRONTEND_DIR,
                "index.html"
            )
        );
    }
);

// =====================================================
// START SERVER
// =====================================================

const server =
    app.listen(
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
                RAZORPAY_KEY_ID &&
                RAZORPAY_KEY_SECRET
                    ? "Razorpay: configured"
                    : "Razorpay: NOT configured"
            );

            console.log(
                SUPABASE_URL &&
                SUPABASE_SECRET_KEY
                    ? "Supabase: configured"
                    : "Supabase: NOT configured"
            );

            console.log(
                GNEWS_API_KEY
                    ? "GNews: configured"
                    : "GNews: NOT configured"
            );
        }
    );

// =====================================================
// GRACEFUL SHUTDOWN
// =====================================================

process.on(
    "SIGTERM",
    () => {

        console.log(
            "SIGTERM received. Closing server..."
        );

        server.close(
            () => {

                console.log(
                    "Server closed."
                );

                process.exit(0);
            }
        );
    }
);