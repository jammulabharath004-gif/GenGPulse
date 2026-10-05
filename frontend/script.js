const API_BASE = "https://gengpulse-1.onrender.com";

let items = [];
let filter = "All";
let saved = [];
let currentNewsIndex = null;


/* =====================================================
   CURRENT USER
   ===================================================== */

let currentUser = null;

try {
    currentUser = JSON.parse(
        localStorage.getItem("genGPulseUser") || "null"
    );
} catch (error) {
    console.error("Could not load saved user:", error);
    currentUser = null;
}


/* =====================================================
   SAVE CURRENT USER
   ===================================================== */

function saveCurrentUser(user) {

    currentUser = user;

    localStorage.setItem(
        "genGPulseUser",
        JSON.stringify(user)
    );

    updateAccountUI();

    if (typeof ensureRadarSection === "function") {
        ensureRadarSection();
    }

    if (typeof loadInterestsForUser === "function") {
        loadInterestsForUser(user);
    }
}


/* =====================================================
   CLEAR CURRENT USER
   ===================================================== */

function clearCurrentUser() {

    currentUser = null;

    localStorage.removeItem(
        "genGPulseUser"
    );

    currentInterests = [];

    updateAccountUI();

    if (typeof updateRadarUI === "function") {
        updateRadarUI();
    }
}


/* =====================================================
   UPDATE ACCOUNT UI
   ===================================================== */

function updateAccountUI() {

    const profileButtons =
        document.querySelectorAll(".profile");

    if (!profileButtons.length) {
        return;
    }

    /*
       First profile button = Sign in / user name
       Second profile button = profile icon
    */

    if (currentUser) {

        if (profileButtons[0]) {
            profileButtons[0].textContent =
                currentUser.name || "Account";

            profileButtons[0].onclick =
                () => showModal("profile");
        }

    } else {

        if (profileButtons[0]) {
            profileButtons[0].textContent =
                "Sign in";

            profileButtons[0].onclick =
                () => showAccount("signin");
        }
    }
}


/* =====================================================
   LOAD REAL NEWS FROM GNEWS BACKEND
   ===================================================== */

async function loadNews(query = "India technology") {

    const cards =
        document.getElementById("flashCards");

    const empty =
        document.getElementById("empty");

    if (!cards) {
        return;
    }

    cards.innerHTML = `
        <div class="card">
            <h3>Loading today's news...</h3>
            <p>
                Please wait while Gen Z Pulse
                loads the latest news.
            </p>
        </div>
    `;

    try {

        const response = await fetch(
            `${API_BASE}/api/news?q=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message ||
                "Failed to load news"
            );
        }

        items = (data.articles || []).map(
            (article) => ({
                cat: getCategory(article),

                tag:
                    article.source?.name ||
                    "News",

                title:
                    article.title ||
                    "Untitled news",

                text:
                    article.description ||
                    article.content ||
                    "No description available.",

                time:
                    formatNewsTime(
                        article.publishedAt
                    ),

                url:
                    article.url ||
                    "",

                source:
                    article.source?.name ||
                    "Unknown source",

                image:
                    article.image ||
                    ""
            })
        );

        renderFlash();

    } catch (error) {

        console.error(
            "News loading error:",
            error
        );

        cards.innerHTML = `
            <div class="card">

                <span class="tag">
                    ERROR
                </span>

                <h3>
                    Unable to load news
                </h3>

                <p>
                    Make sure the Gen Z Pulse backend
                    is running on
                    http://localhost:3000
                </p>

                <button
                    class="action"
                    onclick="loadNews('India technology')"
                >
                    Try again
                </button>

            </div>
        `;

        if (empty) {
            empty.style.display = "none";
        }
    }
}


/* =====================================================
   CATEGORY DETECTION
   ===================================================== */

function getCategory(article) {

    const text = `
        ${article.title || ""}
        ${article.description || ""}
        ${article.content || ""}
    `.toLowerCase();

    if (
        text.includes("technology") ||
        text.includes("tech") ||
        text.includes("ai ") ||
        text.includes("artificial intelligence") ||
        text.includes("software") ||
        text.includes("digital")
    ) {
        return "Tech";
    }

    if (
        text.includes("job") ||
        text.includes("career") ||
        text.includes("internship") ||
        text.includes("employment")
    ) {
        return "Career";
    }

    if (
        text.includes("education") ||
        text.includes("student") ||
        text.includes("college") ||
        text.includes("university") ||
        text.includes("school")
    ) {
        return "Education";
    }

    return "India";
}


/* =====================================================
   FORMAT NEWS TIME
   ===================================================== */

function formatNewsTime(dateString) {

    if (!dateString) {
        return "Recently";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return "Recently";
    }

    const now = new Date();

    const diffMinutes =
        Math.floor(
            (now - date) / 60000
        );

    if (diffMinutes < 1) {
        return "Just now";
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
    }

    const diffHours =
        Math.floor(
            diffMinutes / 60
        );

    if (diffHours < 24) {
        return `$
{
            diffHours
        } hr${
            diffHours > 1 ? "s" : ""
        } ago`;
    }

    const diffDays =
        Math.floor(
            diffHours / 24
        );

    return `${
        diffDays
    } day${
        diffDays > 1 ? "s" : ""
    } ago`;
}


/* =====================================================
   FILTER
   ===================================================== */

function setFilter(value, element) {

    filter = value;

    document
        .querySelectorAll(".filter")
        .forEach(
            (button) =>
                button.classList.remove("active")
        );

    element.classList.add("active");

    renderFlash();
}


/* =====================================================
   RENDER NEWS CARDS
   ===================================================== */

function renderFlash() {

    const searchBox =
        document.getElementById("search");

    const cards =
        document.getElementById("flashCards");

    const empty =
        document.getElementById("empty");

    if (!cards) {
        return;
    }

    const query =
        searchBox
            ? searchBox.value
                .toLowerCase()
                .trim()
            : "";

    const list =
        items.filter((item) => {

            const matchesFilter =
                filter === "All" ||
                item.cat === filter;

            const searchableText = `
                ${item.title}
                ${item.text}
                ${item.tag}
                ${item.source}
                ${item.cat}
            `.toLowerCase();

            const matchesSearch =
                searchableText.includes(
                    query
                );

            return (
                matchesFilter &&
                matchesSearch
            );
        });

    if (list.length === 0) {

        cards.innerHTML = "";

        if (empty) {
            empty.style.display = "block";
        }

        return;
    }

    if (empty) {
        empty.style.display = "none";
    }

    cards.innerHTML =
        list
            .map((item) => {

                const originalIndex =
                    items.indexOf(item);

                return `
                    <article class="card">

                        ${
                            item.image
                                ? `
                                    <img
                                        src="${escapeHtml(
                                            item.image
                                        )}"
                                        alt=""
                                        class="news-card-image"
                                        onerror="this.style.display='none'"
                                    >
                                `
                                : ""
                        }

                        <span class="tag">
                            ${escapeHtml(
                                item.tag
                            )}
                            ·
                            ${escapeHtml(
                                item.cat
                            )}
                        </span>

                        <h3>
                            ${escapeHtml(
                                item.title
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                item.text
                            )}
                        </p>

                        <div class="meta">

                            <span>
                                ${escapeHtml(
                                    item.time
                                )}
                            </span>

                            <span>
                                ${escapeHtml(
                                    item.source
                                )}
                            </span>

                        </div>

                        <button
                            class="action"
                            onclick="showNews(${originalIndex})"
                        >
                            Read more
                        </button>

                        <button
                            class="action"
                            onclick="saveItem(${originalIndex})"
                        >
                            ☆ Save
                        </button>

                    </article>
                `;
            })
            .join("");
}


/* =====================================================
   SHOW NEWS MODAL
   ===================================================== */

function showNews(index) {

    const item = items[index];

    if (!item) {
        return;
    }

    currentNewsIndex = index;

    const content =
        document.getElementById(
            "modalContent"
        );

    if (!content) {
        return;
    }

    content.innerHTML = `
        <span class="tag">
            ${escapeHtml(item.tag)}
            ·
            ${escapeHtml(item.cat)}
        </span>

        <h2>
            ${escapeHtml(item.title)}
        </h2>

        ${
            item.image
                ? `
                    <img
                        src="${escapeHtml(
                            item.image
                        )}"
                        alt=""
                        class="news-card-image"
                        onerror="this.style.display='none'"
                    >
                `
                : ""
        }

        <div class="news-source-box">

            <strong>
                Source:
            </strong>

            ${escapeHtml(item.source)}

            <br>

            <strong>
                Published:
            </strong>

            ${escapeHtml(item.time)}

        </div>

        <div style="margin-top:20px">

            <button
                class="action"
                onclick="generateAISummary(${index})"
            >
                🤖 AI Generated Summary
            </button>

            <button
                class="action"
                onclick="generateAIExplain(${index})"
            >
                🤖 Gen Z Explain
            </button>

            <button
                class="action"
                onclick="openFullArticle(${index})"
                ${item.url ? "" : "disabled"}
            >
                📰 Read Full Article
            </button>

            <button
                class="action"
                onclick="closeModal()"
            >
                ✕ Close
            </button>

        </div>

        <div
            id="aiSummary"
            style="margin-top:20px"
        ></div>

        <div
            id="aiExplain"
            style="margin-top:20px"
        ></div>
    `;

    document
        .getElementById("modal")
        .classList.add("show");
}


/* =====================================================
   OPEN ORIGINAL NEWS ARTICLE
   ===================================================== */

function openFullArticle(index) {

    const item = items[index];

    if (!item || !item.url) {

        toast(
            "Original article unavailable"
        );

        return;
    }

    window.open(
        item.url,
        "_blank",
        "noopener,noreferrer"
    );
}


/* =====================================================
   GEMINI AI SUMMARY
   ===================================================== */

async function generateAISummary(index) {

    const item = items[index];

    if (!item) {
        return;
    }

    const summaryBox =
        document.getElementById(
            "aiSummary"
        );

    if (!summaryBox) {
        return;
    }

    summaryBox.innerHTML = `
        <div class="ai-summary-block">

            <h3>
                🤖 AI Generated Summary
            </h3>

            <p>
                Gemini is analyzing this article...
            </p>

        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE}/api/analyze-news`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        title:
                            item.title,

                        source:
                            item.source,

                        description:
                            item.text,

                        content:
                            item.text,

                        url:
                            item.url
                    })
                }
            );

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                data.message ||
                "AI analysis failed"
            );
        }

        summaryBox.innerHTML =
            formatAIResponse(
                data.analysis ||
                data.aiResponse ||
                "",
                "🤖 AI Generated Summary"
            );

    } catch (error) {

        console.error(
            "AI summary error:",
            error
        );

        summaryBox.innerHTML = `
            <div class="ai-summary-block">

                <h3>
                    🤖 AI Generated Summary
                </h3>

                <p>
                    Gemini could not analyze
                    this article right now.
                    Please try again.
                </p>

                <button
                    class="action"
                    onclick="generateAISummary(${index})"
                >
                    Try AI Summary Again
                </button>

            </div>
        `;
    }
}


/* =====================================================
   GEN Z EXPLAIN
   ===================================================== */

async function generateAIExplain(index) {

    const item = items[index];

    if (!item) {
        return;
    }

    const explainBox =
        document.getElementById(
            "aiExplain"
        );

    if (!explainBox) {
        return;
    }

    explainBox.innerHTML = `
        <div class="ai-summary-block">

            <h3>
                🤖 Gen Z Explain
            </h3>

            <p>
                Gemini is explaining this
                news in simple language...
            </p>

        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE}/api/analyze-news`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        title:
                            item.title,

                        source:
                            item.source,

                        description:
                            item.text,

                        content:
                            item.text,

                        url:
                            item.url
                    })
                }
            );

        const data =
            await response.json();

        if (!data.success) {

            throw new Error(
                data.message ||
                "AI explanation failed"
            );
        }

        explainBox.innerHTML =
            formatAIResponse(
                data.analysis ||
                data.aiResponse ||
                "",
                "🤖 Gen Z Explain"
            );

    } catch (error) {

        console.error(
            "Gen Z Explain error:",
            error
        );

        explainBox.innerHTML = `
            <div class="ai-summary-block">

                <h3>
                    🤖 Gen Z Explain
                </h3>

                <p>
                    Gemini could not explain
                    this article right now.
                    Please try again.
                </p>

                <button
                    class="action"
                    onclick="generateAIExplain(${index})"
                >
                    Try Gen Z Explain Again
                </button>

            </div>
        `;
    }
}


/* =====================================================
   FORMAT GEMINI RESPONSE
   ===================================================== */

function formatAIResponse(
    text,
    heading = "🤖 AI Generated Summary"
) {

    if (!text) {

        return `
            <div class="ai-summary-block">

                <h3>
                    ${heading}
                </h3>

                <p>
                    No AI response was returned.
                </p>

            </div>
        `;
    }

    let cleaned =
        text
            .replace(/\r/g, "")
            .trim();

    const sections = {
        "WHAT HAPPENED?": "",
        "WHY DOES IT MATTER?": "",
        "KEY POINTS:": "",
        "WHAT SHOULD YOU KNOW?": ""
    };

    const headings =
        Object.keys(sections);

    let currentHeading = null;

    const lines =
        cleaned.split("\n");

    for (let line of lines) {

        line = line.trim();

        if (!line) {
            continue;
        }

        const detectedHeading =
            headings.find(
                (item) =>
                    line.toUpperCase() ===
                    item
            );

        if (detectedHeading) {

            currentHeading =
                detectedHeading;

            continue;
        }

        if (currentHeading) {

            sections[currentHeading] +=
                (
                    sections[currentHeading]
                        ? "\n"
                        : ""
                ) +
                line;
        }
    }

    let html = `
        <div class="ai-summary-block">

            <h3>
                ${heading}
            </h3>

        </div>
    `;

    if (sections["WHAT HAPPENED?"]) {

        html += `
            <div class="ai-summary-block">

                <h3>
                    WHAT HAPPENED?
                </h3>

                <p>
                    ${formatText(
                        sections[
                            "WHAT HAPPENED?"
                        ]
                    )}
                </p>

            </div>
        `;
    }

    if (
        sections["WHY DOES IT MATTER?"]
    ) {

        html += `
            <div class="ai-summary-block">

                <h3>
                    WHY DOES IT MATTER?
                </h3>

                <p>
                    ${formatText(
                        sections[
                            "WHY DOES IT MATTER?"
                        ]
                    )}
                </p>

            </div>
        `;
    }

    if (sections["KEY POINTS:"]) {

        const points =
            sections["KEY POINTS:"]
                .split("\n")
                .map((point) =>
                    point
                        .replace(
                            /^[*\-•]\s*/,
                            ""
                        )
                        .trim()
                )
                .filter(Boolean);

        html += `
            <div class="ai-summary-block">

                <h3>
                    KEY POINTS
                </h3>

                <ul
                    style="
                        color:var(--muted);
                        line-height:1.7;
                        padding-left:20px
                    "
                >

                    ${points
                        .map(
                            (point) =>
                                `<li>${escapeHtml(
                                    point
                                )}</li>`
                        )
                        .join("")}

                </ul>

            </div>
        `;
    }

    if (
        sections[
            "WHAT SHOULD YOU KNOW?"
        ]
    ) {

        html += `
            <div class="ai-summary-block">

                <h3>
                    WHAT SHOULD YOU KNOW?
                </h3>

                <p>
                    ${formatText(
                        sections[
                            "WHAT SHOULD YOU KNOW?"
                        ]
                    )}
                </p>

            </div>
        `;
    }

    return html;
}


/* =====================================================
   TEXT FORMATTING
   ===================================================== */

function formatText(text) {

    return escapeHtml(text)
        .replace(/\n/g, "<br>");
}


/* =====================================================
   HTML ESCAPE
   ===================================================== */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =====================================================
   ACCOUNT MODAL
   ===================================================== */

function showAccount(type) {

    const content =
        document.getElementById(
            "modalContent"
        );

    if (!content) {
        return;
    }


    /* =================================================
       SIGN IN
       ================================================= */

    if (type === "signin") {

        content.innerHTML = `

            <span class="tag">
                Account
            </span>

            <h2>
                Sign in to Gen Z Pulse
            </h2>

            <p>
                Sign in to save stories,
                personalize your feed and
                manage your subscription.
            </p>

            <input
                id="signinEmail"
                type="email"
                placeholder="Email address"
                autocomplete="email"
                style="
                    width:100%;
                    border:1px solid var(--border);
                    background:var(--surface);
                    color:var(--text);
                    border-radius:10px;
                    padding:12px;
                    margin:8px 0
                "
            >

            <input
                id="signinPassword"
                type="password"
                placeholder="Password"
                autocomplete="current-password"
                style="
                    width:100%;
                    border:1px solid var(--border);
                    background:var(--surface);
                    color:var(--text);
                    border-radius:10px;
                    padding:12px;
                    margin:8px 0
                "
            >

            <button
                class="action"
                onclick="signInUser()"
            >
                Sign in
            </button>

            <p
                style="
                    text-align:center;
                    font-size:13px;
                    margin-top:16px
                "
            >
                New here?

                <button
                    onclick="showAccount('signup')"
                    style="
                        border:0;
                        background:none;
                        color:var(--accent);
                        font-weight:800;
                        cursor:pointer;
                        padding:0
                    "
                >
                    Create an account
                </button>

            </p>
        `;


    /* =================================================
       SIGN UP
       ================================================= */

    } else if (type === "signup") {

        content.innerHTML = `

            <span class="tag">
                Create Account
            </span>

            <h2>
                Join Gen Z Pulse
            </h2>

            <p>
                Create your account to save
                stories, personalize your feed
                and manage Plus.
            </p>

            <input
                id="signupName"
                type="text"
                placeholder="Full name"
                autocomplete="name"
                style="
                    width:100%;
                    border:1px solid var(--border);
                    background:var(--surface);
                    color:var(--text);
                    border-radius:10px;
                    padding:12px;
                    margin:8px 0
                "
            >

            <input
                id="signupEmail"
                type="email"
                placeholder="Email address"
                autocomplete="email"
                style="
                    width:100%;
                    border:1px solid var(--border);
                    background:var(--surface);
                    color:var(--text);
                    border-radius:10px;
                    padding:12px;
                    margin:8px 0
                "
            >

            <input
                id="signupPassword"
                type="password"
                placeholder="Password"
                autocomplete="new-password"
                style="
                    width:100%;
                    border:1px solid var(--border);
                    background:var(--surface);
                    color:var(--text);
                    border-radius:10px;
                    padding:12px;
                    margin:8px 0
                "
            >

            <button
                class="action"
                onclick="signUpUser()"
            >
                Create account
            </button>

            <p
                style="
                    text-align:center;
                    font-size:13px;
                    margin-top:16px
                "
            >
                Already have an account?

                <button
                    onclick="showAccount('signin')"
                    style="
                        border:0;
                        background:none;
                        color:var(--accent);
                        font-weight:800;
                        cursor:pointer;
                        padding:0
                    "
                >
                    Sign in
                </button>

            </p>
        `;


    /* =================================================
       SUBSCRIBE
       ================================================= */

    } else if (type === "subscribe") {

        content.innerHTML = `

            <span class="tag">
                Gen Z Pulse Plus
            </span>

            <h2>
                Choose your plan
            </h2>

            <p>
                Start with Free or upgrade to Plus
                for a more personalized Gen Z Pulse
                experience.
            </p>

            <div
                class="cards"
                style="
                    grid-template-columns:1fr 1fr;
                    margin-top:16px
                "
            >

                <div class="card">

                    <span class="tag">
                        Free
                    </span>

                    <h3>
                        Free
                    </h3>

                    <p>
                        Core news, Gen Z Flash,
                        basic explanations and
                        saved stories.
                    </p>

                    <ul
                        style="
                            color:var(--muted);
                            line-height:1.8;
                            padding-left:20px
                        "
                    >
                        <li>
                            Daily pulse
                        </li>

                        <li>
                            Basic explanations
                        </li>

                        <li>
                            Save stories
                        </li>
                    </ul>

                    <button
                        class="action"
                        onclick="
                            toast('Free plan selected');
                            closeModal()
                        "
                    >
                        Continue with Free
                    </button>

                </div>


                <div
                    class="card"
                    style="
                        border-color:var(--accent)
                    "
                >

                    <span class="tag">
                        Plus
                    </span>

                    <h3>
                        ₹99
                    </h3>

                    <p>
                        Enhanced personalization
                        and deeper AI-powered
                        explanations.
                    </p>

                    <ul
                        style="
                            color:var(--muted);
                            line-height:1.8;
                            padding-left:20px
                        "
                    >

                        <li>
                            Personalized topics
                        </li>

                        <li>
                            Deeper explanations
                        </li>

                        <li>
                            Enhanced saved content
                        </li>

                    </ul>

                    <button
                        class="apply"
                        onclick="startPlusCheckout()"
                    >
                        Subscribe to Plus →
                    </button>

                </div>

            </div>

            <p
                style="
                    font-size:12px;
                    margin-top:16px
                "
            >
                Payments are processed securely
                through Razorpay.
            </p>
        `;
    }

    document
        .getElementById("modal")
        .classList.add("show");
}


/* =====================================================
   SIGN UP USER
   ===================================================== */

async function signUpUser() {

    const name =
        document
            .getElementById("signupName")
            ?.value
            .trim();

    const email =
        document
            .getElementById("signupEmail")
            ?.value
            .trim();

    const password =
        document
            .getElementById("signupPassword")
            ?.value;


    if (!name || !email || !password) {

        toast(
            "Please fill all fields"
        );

        return;
    }


    if (password.length < 6) {

        toast(
            "Password must be at least 6 characters"
        );

        return;
    }


    try {

        toast(
            "Creating your account..."
        );

        const response =
            await fetch(
                `${API_BASE}/api/signup`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            toast(
                data.message ||
                "Account creation failed"
            );

            return;
        }


        saveCurrentUser(
            data.user
        );


        closeModal();


        toast(
            `Welcome to Gen Z Pulse, ${
                data.user.name
            }!`
        );

    } catch (error) {

        console.error(
            "Sign up error:",
            error
        );

        toast(
            "Cannot connect to Gen Z Pulse server"
        );
    }
}


/* =====================================================
   SIGN IN USER
   ===================================================== */

async function signInUser() {

    const email =
        document
            .getElementById("signinEmail")
            ?.value
            .trim();

    const password =
        document
            .getElementById("signinPassword")
            ?.value;


    if (!email || !password) {

        toast(
            "Please enter email and password"
        );

        return;
    }


    try {

        toast(
            "Signing you in..."
        );


        const response =
            await fetch(
                `${API_BASE}/api/signin`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            toast(
                data.message ||
                "Sign in failed"
            );

            return;
        }


        saveCurrentUser(
            data.user
        );


        closeModal();


        toast(
            `Welcome back, ${
                data.user.name
            }!`
        );

    } catch (error) {

        console.error(
            "Sign in error:",
            error
        );

        toast(
            "Cannot connect to Gen Z Pulse server"
        );
    }
}


/* =====================================================
   LOGOUT USER
   ===================================================== */

function logoutUser() {

    clearCurrentUser();

    closeModal();

    toast(
        "Signed out successfully"
    );
}


/* =====================================================
   PLUS CHECKOUT
   ===================================================== */

async function startPlusCheckout() {

    /*
       User must sign in before subscribing.
    */

    if (!currentUser) {

        toast(
            "Please sign in before subscribing"
        );

        showAccount("signin");

        return;
    }


    /*
       Already Plus
    */

    if (
        currentUser.subscription ===
        "plus"
    ) {

        toast(
            "You are already a Plus member"
        );

        return;
    }


    /*
       Check Razorpay availability
    */

    if (
        typeof Razorpay ===
        "undefined"
    ) {

        toast(
            "Razorpay Checkout did not load"
        );

        return;
    }


    try {

        toast(
            "Creating secure payment..."
        );


        /*
           Ask backend to create
           Razorpay order.
        */

        const response =
            await fetch(
                `${API_BASE}/api/create-plus-order`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        userId:
                            currentUser.id
                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            toast(
                data.message ||
                "Could not create payment order"
            );

            return;
        }


        /*
           Razorpay Checkout
        */

        const options = {

            key:
                data.razorpayKeyId,

            amount:
                data.amount,

            currency:
                data.currency,

            name:
                "Gen Z Pulse",

            description:
                "Gen Z Pulse Plus",

            order_id:
                data.orderId,

            prefill: {

                name:
                    currentUser.name,

                email:
                    currentUser.email

            },

            theme: {
                color: "#6957ff"
            },


            handler:
                async function (
                    paymentResponse
                ) {

                    await verifyPlusPayment(
                        paymentResponse
                    );
                },


            modal: {

                ondismiss:
                    function () {

                        toast(
                            "Payment window closed"
                        );
                    }
            }
        };


        const razorpay =
            new Razorpay(
                options
            );


        razorpay.on(
            "payment.failed",
            function () {

                toast(
                    "Payment failed. Please try again."
                );
            }
        );


        razorpay.open();

    } catch (error) {

        console.error(
            "Razorpay error:",
            error
        );

        toast(
            "Unable to start payment"
        );
    }
}


/* =====================================================
   VERIFY PLUS PAYMENT
   ===================================================== */

async function verifyPlusPayment(
    paymentResponse
) {

    try {

        toast(
            "Verifying payment..."
        );


        const response =
            await fetch(
                `${API_BASE}/api/verify-plus-payment`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        userId:
                            currentUser.id,

                        razorpay_order_id:
                            paymentResponse
                                .razorpay_order_id,

                        razorpay_payment_id:
                            paymentResponse
                                .razorpay_payment_id,

                        razorpay_signature:
                            paymentResponse
                                .razorpay_signature
                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            toast(
                data.message ||
                "Payment verification failed"
            );

            return;
        }


        /*
           Backend returns updated user.
        */

        saveCurrentUser(
            data.user
        );


        closeModal();


        toast(
            "🎉 Gen Z Pulse Plus activated!"
        );


        console.log(
            "Plus payment verified:",
            data
        );

    } catch (error) {

        console.error(
            "Payment verification error:",
            error
        );

        toast(
            "Payment verification failed"
        );
    }
}


/* =====================================================
   SAVED ITEMS
   ===================================================== */

function saveItem(index) {

    if (!saved.includes(index)) {

        saved.push(index);

        updateSaved();

        toast(
            "Saved to your Pulse"
        );

    } else {

        toast(
            "Already saved"
        );
    }
}


function updateSaved() {

    const list =
        document.getElementById(
            "savedList"
        );

    const text =
        document.getElementById(
            "savedText"
        );

    if (!list || !text) {
        return;
    }

    text.textContent =
        saved.length
            ? `${
                saved.length
              } item${
                saved.length > 1
                    ? "s"
                    : ""
              } saved to your personal Pulse.`
            : "Nothing saved yet. Use the Save button on a story to build your personal pulse.";


    list.innerHTML =
        saved
            .map((index) => {

                const item =
                    items[index];

                if (!item) {
                    return "";
                }

                return `
                    <div
                        class="card"
                        style="
                            margin-top:10px
                        "
                    >

                        <span class="tag">

                            ${escapeHtml(
                                item.tag
                            )}

                            ·

                            ${escapeHtml(
                                item.cat
                            )}

                        </span>

                        <h3>
                            ${escapeHtml(
                                item.title
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                item.text
                            )}
                        </p>

                        <button
                            class="action"
                            onclick="showNews(${index})"
                        >
                            Open story
                        </button>

                    </div>
                `;
            })
            .join("");
}


/* =====================================================
   STATIC MODALS
   ===================================================== */

function showModal(type, data) {

    const content =
        document.getElementById(
            "modalContent"
        );

    if (!content) {
        return;
    }


    const html = {

        profile: `

            <span class="tag">
                Account
            </span>

            <h2>
                ${
                    currentUser
                        ? `Welcome, ${
                            escapeHtml(
                                currentUser.name
                            )
                          }`
                        : "Your Pulse"
                }
            </h2>

            ${
                currentUser
                    ? `
                        <p>
                            <strong>
                                Email:
                            </strong>

                            ${escapeHtml(
                                currentUser.email
                            )}
                        </p>

                        <p>
                            <strong>
                                Plan:
                            </strong>

                            ${
                                currentUser.subscription ===
                                "plus"
                                    ? "Gen Z Pulse Plus"
                                    : "Free"
                            }
                        </p>

                        <p>
                            Your account is connected
                            to Gen Z Pulse.
                        </p>

                        ${
                            currentUser.subscription ===
                            "plus"
                                ? `
                                    <div
                                        class="card"
                                        style="
                                            border-color:
                                            var(--accent)
                                        "
                                    >
                                        <span class="tag">
                                            PLUS MEMBER
                                        </span>

                                        <h3>
                                            Gen Z Pulse Plus
                                        </h3>

                                        <p>
                                            Your Plus
                                            subscription
                                            is active.
                                        </p>
                                    </div>
                                `
                                : `
                                    <button
                                        class="apply"
                                        onclick="closeModal();showAccount('subscribe')"
                                    >
                                        Upgrade to Plus →
                                    </button>
                                `
                        }

                        <button
                            class="action"
                            onclick="logoutUser()"
                        >
                            Sign out
                        </button>
                    `
                    : `
                        <p>
                            Sign in to manage
                            your Gen Z Pulse account.
                        </p>

                        <button
                            class="action"
                            onclick="showAccount('signin')"
                        >
                            Sign in
                        </button>
                    `
            }

        `,


        how: `

            <span class="tag">
                The idea
            </span>

            <h2>
                Less information overload.
                More understanding.
            </h2>

            <p>

                <b>1.</b>
                Find important information.
                <br>

                <b>2.</b>
                Summarize it into a quick flash.
                <br>

                <b>3.</b>
                Explain context and relevance.
                <br>

                <b>4.</b>
                Connect users to an action
                when one exists.

            </p>

        `,


        explain: `

            <span class="tag">
                Gen Z Explain
            </span>

            <h2>
                Context before conclusions
            </h2>

            <p>
                This prototype demonstrates
                the product principle:
                explain what happened,
                why it matters and what a
                user can do next.
                In the real product, important
                or developing news would receive
                human verification before publication.
            </p>

        `,


        trust: `

            <span class="tag">
                Trust checklist
            </span>

            <h2>
                Before you believe or share
            </h2>

            <p>

                ✓ Find the original source
                <br>

                ✓ Check the date
                <br>

                ✓ Separate facts from opinions
                <br>

                ✓ Look for evidence
                <br>

                ✓ Compare credible sources

            </p>

        `,


        workflow: `

            <span class="tag">
                Operations
            </span>

            <h2>
                Content workflow
            </h2>

            <p>
                Find News →
                AI Summarization →
                Human Verification →
                Relevance Check →
                Personalization →
                Publish →
                Notify →
                User Action →
                Feedback
            </p>

        `
    };


    content.innerHTML =
        html[type] ||
        `
            <span class="tag">
                Gen Z Flash
            </span>

            <h2>
                ${escapeHtml(
                    data?.title ||
                    "Gen Z Pulse"
                )}
            </h2>

            <p>
                ${escapeHtml(
                    data?.text ||
                    ""
                )}
            </p>

            <button
                class="action"
                onclick="closeModal()"
            >
                Back to pulse
            </button>
        `;


    document
        .getElementById("modal")
        .classList.add("show");
}


/* =====================================================
   CLOSE MODAL
   ===================================================== */

function closeModal() {

    const modal =
        document.getElementById(
            "modal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );
    }
}


/* =====================================================
   TOAST
   ===================================================== */

function toast(message) {

    const element =
        document.getElementById(
            "toast"
        );

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.classList.add(
        "show"
    );

    setTimeout(
        () => {
            element.classList.remove(
                "show"
            );
        },
        2200
    );
}


/* =====================================================
   SCROLL
   ===================================================== */

function scrollToId(id) {

    const element =
        document.getElementById(id);

    if (element) {

        element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/* =====================================================
   NAVIGATION
   ===================================================== */

document
    .querySelectorAll(
        ".navlinks button"
    )
    .forEach((button) => {

        button.onclick = () => {

            scrollToId(
                button.dataset.target
            );
        };
    });


/* =====================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
   ===================================================== */

document
    .getElementById("modal")
    ?.addEventListener(
        "click",
        (event) => {

            if (
                event.target.id ===
                "modal"
            ) {
                closeModal();
            }
        }
    );






/* =====================================================
   GEN_Z_PULSE_OPPORTUNITY_BUTTON_FIX_V1
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const buttons =
            document.querySelectorAll(
                "#opportunity .apply"
            );

        const data = [
            {
                title: "Scholarship application",
                description:
                    "Explore scholarship information, eligibility and important deadlines."
            },
            {
                title: "Campus opportunity",
                description:
                    "Explore internships, competitions and student opportunities matched to your interests."
            },
            {
                title: "Student event",
                description:
                    "Review the event details, understand why it matters and save it for later."
            }
        ];

        buttons.forEach(
            (button, index) => {

                if (!data[index]) {
                    return;
                }

                button.removeAttribute(
                    "onclick"
                );

                button.onclick = () =>
                    openOpportunity(
                        data[index].title,
                        data[index].description
                    );
            }
        );
    }
);


/* =====================================================
   GEN_Z_PULSE_CLICKABLE_CARDS_V1
   ===================================================== */

function makeExplainAndOpportunityCardsClickable() {

    const explainCards =
        document.querySelectorAll(
            "#explain .card"
        );

    if (explainCards[0]) {

        explainCards[0].style.cursor =
            "pointer";

        explainCards[0].addEventListener(
            "click",
            (event) => {

                if (
                    event.target.closest("button")
                ) {
                    return;
                }

                showModal(
                    "explain"
                );
            }
        );
    }

    if (explainCards[1]) {

        explainCards[1].style.cursor =
            "pointer";

        explainCards[1].addEventListener(
            "click",
            (event) => {

                if (
                    event.target.closest("button")
                ) {
                    return;
                }

                showModal(
                    "trust"
                );
            }
        );
    }

    const opportunityCards =
        document.querySelectorAll(
            "#opportunity .opp"
        );

    const opportunities = [
        {
            title:
                "Scholarship application",

            description:
                "Explore scholarship information, eligibility and important deadlines."
        },

        {
            title:
                "Campus opportunity",

            description:
                "Explore internships, competitions and student opportunities matched to your interests."
        },

        {
            title:
                "Student event",

            description:
                "Review the event details, understand why it matters and save it for later."
        }
    ];

    opportunityCards.forEach(
        (card, index) => {

            if (!opportunities[index]) {
                return;
            }

            card.style.cursor =
                "pointer";

            card.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target.closest("button")
                    ) {
                        return;
                    }

                    openOpportunity(
                        opportunities[index].title,
                        opportunities[index].description
                    );
                }
            );
        }
    );
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        makeExplainAndOpportunityCardsClickable();

    }
);


/* =====================================================
   GEN_Z_PULSE_FRONTEND_FIX_V2
   ===================================================== */

let currentInterests = [];

const PULSE_INTERESTS = [
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

/* =====================================================
   SEARCH TODAY
   ===================================================== */

async function searchToday() {

    const searchInput =
        document.getElementById("search");

    if (!searchInput) {
        return;
    }

    const query =
        searchInput.value.trim();

    if (!query) {
        toast("Enter something to search");
        searchInput.focus();
        return;
    }

    filter = "All";

    document
        .querySelectorAll(".filter")
        .forEach((button) => {
            button.classList.remove("active");
        });

    const allButton =
        document.querySelector(
            '.filter[onclick*="setFilter(\'All\'"]'
        );

    if (allButton) {
        allButton.classList.add("active");
    }

    const button =
        document.getElementById(
            "searchTodayBtn"
        );

    if (button) {
        button.disabled = true;
        button.textContent = "Searching...";
    }

    try {

        await loadNews(query);

        toast(
            "Latest news loaded"
        );

    } catch (error) {

        console.error(
            "Search Today error:",
            error
        );

        toast(
            "News search failed"
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent = "Search Today";
        }
    }
}

/* =====================================================
   LOAD INTERESTS FROM SUPABASE
   ===================================================== */

async function loadInterestsForUser(user) {

    if (!user || !user.id) {

        currentInterests = [];

        updateRadarUI();

        return;
    }

    try {

        const response =
            await fetch(
                API_BASE +
                "/api/interests/" +
                encodeURIComponent(user.id)
            );

        const data =
            await response.json();

        if (
            response.ok &&
            data.success &&
            Array.isArray(data.interests)
        ) {

            currentInterests =
                data.interests;

        } else {

            currentInterests =
                Array.isArray(user.interests)
                    ? user.interests
                    : [];
        }

    } catch (error) {

        console.error(
            "Load interests error:",
            error
        );

        currentInterests =
            Array.isArray(user.interests)
                ? user.interests
                : [];
    }

    currentUser.interests =
        currentInterests;

    localStorage.setItem(
        "genGPulseUser",
        JSON.stringify(currentUser)
    );

    ensureRadarSection();

    updateRadarUI();

    if (
        currentInterests.length === 0
    ) {

        const promptKey =
            "genZPulseInterestPrompted_" +
            currentUser.id;

        if (
            !localStorage.getItem(promptKey)
        ) {

            localStorage.setItem(
                promptKey,
                "1"
            );

            setTimeout(
                () => openInterestPicker(),
                500
            );
        }
    }
}

/* =====================================================
   SAVE INTERESTS
   ===================================================== */

async function saveInterests() {

    if (!currentUser || !currentUser.id) {

        toast(
            "Please sign in first"
        );

        return;
    }

    const selected =
        Array.from(
            document.querySelectorAll(
                'input[name="pulseInterest"]:checked'
            )
        ).map(
            (input) =>
                input.value
        );

    try {

        toast(
            "Saving your interests..."
        );

        const response =
            await fetch(
                API_BASE +
                "/api/interests",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        userId:
                            currentUser.id,

                        interests:
                            selected
                    })
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to save interests."
            );
        }

        currentInterests =
            Array.isArray(data.interests)
                ? data.interests
                : selected;

        currentUser.interests =
            currentInterests;

        localStorage.setItem(
            "genGPulseUser",
            JSON.stringify(currentUser)
        );

        updateRadarUI();

        closeModal();

        toast(
            "Interests saved successfully"
        );

    } catch (error) {

        console.error(
            "Save interests error:",
            error
        );

        toast(
            error.message ||
            "Unable to save interests"
        );
    }
}

/* =====================================================
   INTEREST PICKER
   ===================================================== */

function openInterestPicker() {

    if (!currentUser) {

        toast(
            "Please sign in first"
        );

        showAccount("signin");

        return;
    }

    const content =
        document.getElementById(
            "modalContent"
        );

    const modal =
        document.getElementById(
            "modal"
        );

    if (!content || !modal) {
        return;
    }

    content.innerHTML = `
        <span class="tag">
            Personalization
        </span>

        <h2>
            Radar &amp; Relevance
        </h2>

        <p>
            Choose the topics you care about.
            Your choices are saved to your
            Gen Z Pulse account.
        </p>

        <div
            style="
                display:grid;
                grid-template-columns:
                    repeat(2,minmax(0,1fr));
                gap:9px;
                margin:18px 0;
            "
        >
            ${PULSE_INTERESTS.map(
                (interest) => `
                    <label
                        style="
                            display:flex;
                            align-items:center;
                            gap:8px;
                            padding:11px;
                            border:1px solid var(--border);
                            background:var(--surface2);
                            border-radius:11px;
                            cursor:pointer;
                        "
                    >
                        <input
                            type="checkbox"
                            name="pulseInterest"
                            value="${interest}"
                            ${currentInterests.includes(interest)
                                ? "checked"
                                : ""}
                        >

                        <span>
                            ${interest}
                        </span>
                    </label>
                `
            ).join("")}
        </div>

        <button
            class="apply"
            type="button"
            onclick="saveInterests()"
        >
            Save my interests
        </button>

        <button
            class="action"
            type="button"
            onclick="closeModal()"
        >
            Cancel
        </button>
    `;

    modal.classList.add(
        "show"
    );
}

/* =====================================================
   CREATE RADAR SECTION
   ===================================================== */

function ensureRadarSection() {

    const flash =
        document.getElementById(
            "flash"
        );

    const main =
        document.querySelector(
            "main"
        );

    if (!flash || !main) {
        return;
    }

    if (
        !document.getElementById(
            "radar"
        )
    ) {

        const radar =
            document.createElement(
                "section"
            );

        radar.className =
            "section";

        radar.id =
            "radar";

        radar.innerHTML = `
            <div class="sectionHead">

                <div>

                    <h2>
                        Radar &amp; Relevance
                    </h2>

                    <p>
                        Personal topics and
                        relevant information.
                    </p>

                </div>

                <button
                    class="action"
                    type="button"
                    style="width:auto"
                    onclick="openInterestPicker()"
                >
                    Edit interests
                </button>

            </div>

            <div
                id="radarTopics"
                class="mini"
                style="margin-bottom:14px"
            ></div>

            <div
                id="radarContent"
                class="card"
            ></div>
        `;

        flash.insertAdjacentElement(
            "afterend",
            radar
        );
    }

    const nav =
        document.querySelector(
            ".navlinks"
        );

    if (
        nav &&
        !nav.querySelector(
            '[data-target="radar"]'
        )
    ) {

        const radarButton =
            document.createElement(
                "button"
            );

        radarButton.type =
            "button";

        radarButton.dataset.target =
            "radar";

        radarButton.textContent =
            "Radar";

        radarButton.onclick =
            () => {
                scrollToId("radar");
            };

        nav.appendChild(
            radarButton
        );
    }

    const searchArea =
        document.querySelector(
            ".search"
        );

    if (
        searchArea &&
        !document.getElementById(
            "searchTodayBtn"
        )
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.id =
            "searchTodayBtn";

        button.type =
            "button";

        button.className =
            "btn primary";

        button.textContent =
            "Search Today";

        button.onclick =
            searchToday;

        button.style.whiteSpace =
            "nowrap";

        searchArea.appendChild(
            button
        );

        const searchInput =
            document.getElementById(
                "search"
            );

        if (searchInput) {

            searchInput.addEventListener(
                "keydown",
                (event) => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        searchToday();
                    }
                }
            );
        }
    }

    const opportunityButtons =
        document.querySelectorAll(
            "#opportunity .apply"
        );

    if (
        opportunityButtons[0]
    ) {

        opportunityButtons[0].onclick =
            () =>
                openOpportunity(
                    "Scholarship application",
                    "Explore scholarship information, eligibility and important deadlines."
                );
    }

    if (
        opportunityButtons[1]
    ) {

        opportunityButtons[1].onclick =
            () =>
                openOpportunity(
                    "Campus opportunity",
                    "Explore internships, competitions and student opportunities matched to your interests."
                );
    }

    if (
        opportunityButtons[2]
    ) {

        opportunityButtons[2].onclick =
            () =>
                openOpportunity(
                    "Student event",
                    "Review the event details, understand why it matters and save it for later."
                );
    }

    updateRadarUI();
}

/* =====================================================
   UPDATE RADAR UI
   ===================================================== */

function updateRadarUI() {

    const section =
        document.getElementById(
            "radar"
        );

    const navButton =
        document.querySelector(
            '.navlinks [data-target="radar"]'
        );

    if (!section) {
        return;
    }

    if (!currentUser) {

        section.style.display =
            "none";

        if (navButton) {
            navButton.style.display =
                "none";
        }

        return;
    }

    section.style.display =
        "block";

    if (navButton) {
        navButton.style.display =
            "";
    }

    const topics =
        document.getElementById(
            "radarTopics"
        );

    const content =
        document.getElementById(
            "radarContent"
        );

    if (topics) {

        topics.innerHTML =
            currentInterests.length
                ? currentInterests
                    .map(
                        (interest) =>
                            `<span class="chip">
                                ${escapeHtml(
                                    interest
                                )}
                            </span>`
                    )
                    .join("")
                : `
                    <span class="chip">
                        No interests selected yet
                    </span>
                `;
    }

    if (content) {

        if (
            currentInterests.length
        ) {

            content.innerHTML = `
                <h3>
                    Your personalized radar
                </h3>

                <p>
                    Your selected topics are
                    saved to your Gen Z Pulse
                    account.
                </p>

                <button
                    class="action"
                    type="button"
                    onclick="openInterestPicker()"
                >
                    Change my interests
                </button>
            `;

        } else {

            content.innerHTML = `
                <h3>
                    Choose your interests
                </h3>

                <p>
                    Select Technology, AI,
                    Education, Career, Jobs,
                    Government, Business,
                    Sports, Science,
                    Entertainment or Startups.
                </p>

                <button
                    class="apply"
                    type="button"
                    onclick="openInterestPicker()"
                >
                    Choose topics
                </button>
            `;
        }
    }
}

/* =====================================================
   OPPORTUNITY OPENING
   ===================================================== */

function openOpportunity(
    title,
    description
) {

    const content =
        document.getElementById(
            "modalContent"
        );

    const modal =
        document.getElementById(
            "modal"
        );

    if (!content || !modal) {
        return;
    }

    content.innerHTML = `
        <span class="tag">
            Gen Z Opportunity
        </span>

        <h2>
            ${escapeHtml(title)}
        </h2>

        <p>
            ${escapeHtml(description)}
        </p>

        <div
            class="card"
            style="margin-top:16px"
        >
            <h3>
                Opportunity details
            </h3>

            <p>
                This section is now interactive.
                It can later connect to the
                official scholarship, internship
                or event source.
            </p>
        </div>

        <button
            class="action"
            type="button"
            onclick="closeModal()"
        >
            Close
        </button>
    `;

    modal.classList.add(
        "show"
    );
}

/* =====================================================
   RADAR STARTUP
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        ensureRadarSection();

        if (currentUser) {

            loadInterestsForUser(
                currentUser
            );

        } else {

            updateRadarUI();
        }
    }
);


/* =====================================================
   START APPLICATION
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateAccountUI();

        loadNews(
            "India technology"
        );
    }
);



/* =====================================================
   GEN_Z_PULSE_FRONTEND_COMPATIBILITY_V1
   ===================================================== */

function initializeGenZPulseFrontend() {

    try {

        /* ---------------------------------------------
           EXPORT IMPORTANT FUNCTIONS TO WINDOW
           --------------------------------------------- */

        window.showAccount = showAccount;
        window.showModal = showModal;
        window.closeModal = closeModal;
        window.toast = toast;
        window.scrollToId = scrollToId;

        window.loadNews = loadNews;
        window.searchToday = searchToday;

        window.showNews = showNews;
        window.openFullArticle = openFullArticle;

        window.generateAISummary =
            generateAISummary;

        window.generateAIExplain =
            generateAIExplain;

        window.saveItem = saveItem;

        window.openInterestPicker =
            openInterestPicker;

        window.saveInterests =
            saveInterests;

        window.openOpportunity =
            openOpportunity;

        window.startPlusCheckout =
            startPlusCheckout;

        window.setFilter = setFilter;

        /* ---------------------------------------------
           ACCOUNT BUTTONS
           --------------------------------------------- */

        const profileButtons =
            document.querySelectorAll(
                "header .profile"
            );

        if (profileButtons[0]) {

            profileButtons[0].onclick =
                () => {

                    if (currentUser) {
                        showModal("profile");
                    } else {
                        showAccount("signin");
                    }

                };
        }

        if (profileButtons[1]) {

            profileButtons[1].onclick =
                () =>
                    showModal("profile");
        }

        const subscribeButton =
            document.querySelector(
                "header .btn"
            );

        if (subscribeButton) {

            subscribeButton.onclick =
                () =>
                    showAccount("subscribe");
        }

        /* ---------------------------------------------
           NAVIGATION
           --------------------------------------------- */

        document
            .querySelectorAll(
                ".navlinks button"
            )
            .forEach(
                (button) => {

                    button.onclick =
                        () => {

                            const target =
                                button.dataset.target;

                            if (target) {
                                scrollToId(target);
                            }
                        };
                }
            );

        /* ---------------------------------------------
           SEARCH TODAY BUTTON
           --------------------------------------------- */

        const searchArea =
            document.querySelector(
                ".search"
            );

        if (
            searchArea &&
            !document.getElementById(
                "searchTodayBtn"
            )
        ) {

            const searchButton =
                document.createElement(
                    "button"
                );

            searchButton.id =
                "searchTodayBtn";

            searchButton.type =
                "button";

            searchButton.className =
                "btn primary";

            searchButton.textContent =
                "Search Today";

            searchButton.style.whiteSpace =
                "nowrap";

            searchButton.onclick =
                searchToday;

            searchArea.appendChild(
                searchButton
            );
        }

        const searchInput =
            document.getElementById(
                "search"
            );

        if (searchInput) {

            if (
                !searchInput.dataset
                    .pulseSearchBound
            ) {

                searchInput.dataset
                    .pulseSearchBound =
                    "1";

                searchInput.addEventListener(
                    "keydown",
                    (event) => {

                        if (
                            event.key ===
                            "Enter"
                        ) {

                            event.preventDefault();

                            searchToday();
                        }
                    }
                );
            }
        }

        /* ---------------------------------------------
           RADAR SECTION
           --------------------------------------------- */

        ensureRadarSection();

        updateRadarUI();

        /* ---------------------------------------------
           EXPLAIN BUTTON
           --------------------------------------------- */

        const explainButton =
            document.querySelector(
                "#explain .card:first-child .action"
            );

        if (explainButton) {

            explainButton.onclick =
                () =>
                    showModal("explain");
        }

        const trustButton =
            document.querySelector(
                "#explain .card:nth-child(2) .action"
            );

        if (trustButton) {

            trustButton.onclick =
                () =>
                    showModal("trust");
        }

        /* ---------------------------------------------
           OPPORTUNITY BUTTONS
           --------------------------------------------- */

        const opportunityButtons =
            document.querySelectorAll(
                "#opportunity .apply"
            );

        const opportunities = [
            {
                title:
                    "Scholarship application",

                description:
                    "Explore scholarship information, eligibility and important deadlines."
            },

            {
                title:
                    "Campus opportunity",

                description:
                    "Explore internships, competitions and student opportunities matched to your interests."
            },

            {
                title:
                    "Student event",

                description:
                    "Review the event details, understand why it matters and save it for later."
            }
        ];

        opportunityButtons.forEach(
            (button, index) => {

                if (!opportunities[index]) {
                    return;
                }

                button.onclick =
                    () =>
                        openOpportunity(
                            opportunities[index]
                                .title,

                            opportunities[index]
                                .description
                        );
            }
        );

        /* ---------------------------------------------
           START NEWS LOADING
           --------------------------------------------- */

        if (
            !items ||
            items.length === 0
        ) {

            loadNews(
                "India technology"
            );
        }

        /* ---------------------------------------------
           INTEREST DATA
           --------------------------------------------- */

        if (currentUser) {

            loadInterestsForUser(
                currentUser
            );
        }

        console.log(
            "Gen Z Pulse frontend initialized."
        );

    } catch (error) {

        console.error(
            "Gen Z Pulse frontend initialization error:",
            error
        );
    }
}

/* Run after the complete document is ready */
if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeGenZPulseFrontend
    );

} else {

    initializeGenZPulseFrontend();
}

/* =====================================================
   GEN_Z_PULSE_RUNTIME_SAFETY_V1
   ===================================================== */

if (typeof openFullArticle !== "function") {

    window.openFullArticle =
        function (index) {

            if (
                typeof showNews ===
                "function"
            ) {
                showNews(index);
            }
        };
}

if (typeof saveItem !== "function") {

    window.saveItem =
        function () {

            if (
                typeof toast ===
                "function"
            ) {
                toast(
                    "Saving is available after sign in"
                );
            }
        };
}

if (
    typeof startPlusCheckout !==
    "function"
) {

    window.startPlusCheckout =
        function () {

            if (
                typeof toast ===
                "function"
            ) {
                toast(
                    "Opening subscription..."
                );
            }
        };
}

if (typeof setFilter !== "function") {

    window.setFilter =
        function (value, button) {

            if (typeof filter !== "undefined") {
                filter = value;
            }

            document
                .querySelectorAll(".filter")
                .forEach(
                    (item) =>
                        item.classList.remove(
                            "active"
                        )
                );

            if (button) {
                button.classList.add(
                    "active"
                );
            }

            if (
                typeof renderFlash ===
                "function"
            ) {
                renderFlash();
            }
        };
}

console.log(
    "Gen Z Pulse runtime safety loaded."
);
