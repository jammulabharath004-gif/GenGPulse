/* =========================================================
   GEN G PULSE
   COMPLETE FRONTEND JAVASCRIPT
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE = "http://localhost:3000";

/*
   IMPORTANT:
   Your backend returns:

   {
       success: true,
       query: "...",
       totalArticles: 123,
       articles: [...]
   }

   Therefore we read payload.articles.
*/

const NEWS_API = `${API_BASE}/api/news`;


/*
   These endpoints are optional.

   If your backend later provides them, the frontend
   can use them automatically.

   The frontend NEVER contains your Gemini API key.
*/

const AI_ENDPOINTS = {
    summary: `${API_BASE}/api/ai-summary`,
    explain: `${API_BASE}/api/ai-explain`
};


/* =========================================================
   STATE
========================================================= */

const state = {

    articles: [],

    savedIds: loadSavedIds(),

    /*
       Topics selected here appear in Blindspot Feed.
    */
    blindspotCategories: loadBlindspotCategories(),

    swipingIndex: 0,

    blindspotIndex: 0,

    currentView: "home",

    loading: false
};


/* =========================================================
   FALLBACK DATA
========================================================= */

/*
   These are only used if the API temporarily returns
   no articles.

   This means your website won't become completely empty.
*/

function hoursAgo(hours) {

    return new Date(
        Date.now() - hours * 60 * 60 * 1000
    ).toISOString();
}


const fallbackArticles = [

    {
        id: "fallback-ai-student",
        title: "AI is becoming a bigger part of student projects",
        description:
            "Students are increasingly using artificial intelligence for research, coding, presentations and creative projects.",
        content:
            "Artificial intelligence is becoming a common tool in education and student projects. The important part is learning how to use AI responsibly rather than depending on it for every task.",
        url: "",
        image: "",
        publishedAt: hoursAgo(1),
        source: {
            name: "Gen G Pulse"
        },
        category: "Technology"
    },

    {
        id: "fallback-space",
        title: "India's space technology ecosystem keeps expanding",
        description:
            "Indian space startups and research organizations are working on new satellite, launch and Earth-observation technologies.",
        content:
            "India's space ecosystem includes government missions, private startups and research organizations. New technology is creating opportunities for engineering and technology students.",
        url: "",
        image: "",
        publishedAt: hoursAgo(3),
        source: {
            name: "Gen G Pulse"
        },
        category: "Science"
    },

    {
        id: "fallback-career",
        title: "Skills can matter as much as marks for early careers",
        description:
            "Projects, internships, communication and practical technical skills can help students demonstrate what they can actually do.",
        content:
            "Students can strengthen their career profile through projects, internships, competitions, certifications and practical experience.",
        url: "",
        image: "",
        publishedAt: hoursAgo(5),
        source: {
            name: "Gen G Pulse"
        },
        category: "Career"
    },

    {
        id: "fallback-startup",
        title: "Student startups are exploring AI-powered products",
        description:
            "Young founders are using AI to build tools for education, productivity, finance and everyday problems.",
        content:
            "AI has reduced some of the technical barriers for students who want to experiment with product ideas. Validation and solving a real problem remain important.",
        url: "",
        image: "",
        publishedAt: hoursAgo(8),
        source: {
            name: "Gen G Pulse"
        },
        category: "Startups"
    }
];


/*
   Guaranteed Blindspot stories.

   These make sure Blindspot Feed has something to show
   even when the real API doesn't contain those categories.
*/

const fallbackBlindspotArticles = [

    {
        id: "blindspot-sports",
        title: "Sports technology is changing how athletes train",
        description:
            "Wearable sensors, computer vision and performance analytics are increasingly being used in sports training.",
        content:
            "Sports technology can collect performance data such as movement, speed, workload and recovery indicators. Coaches can use this information to make training decisions.",
        url: "",
        image: "",
        publishedAt: hoursAgo(2),
        source: {
            name: "Gen G Pulse"
        },
        category: "Sports"
    },

    {
        id: "blindspot-gaming",
        title: "Game development is becoming more accessible",
        description:
            "Modern game engines and creator tools are lowering the barrier for students interested in developing games.",
        content:
            "Game development tools allow beginners to experiment with 2D and 3D projects without building an engine from scratch.",
        url: "",
        image: "",
        publishedAt: hoursAgo(7),
        source: {
            name: "Gen G Pulse"
        },
        category: "Gaming"
    },

    {
        id: "blindspot-entertainment",
        title: "Streaming platforms are changing entertainment discovery",
        description:
            "Recommendation systems influence what viewers discover across movies, shows, music and online video.",
        content:
            "Digital platforms use recommendation systems to personalize content discovery. This can make finding new content easier while also creating personalized content bubbles.",
        url: "",
        image: "",
        publishedAt: hoursAgo(12),
        source: {
            name: "Gen G Pulse"
        },
        category: "Entertainment"
    }
];


/* =========================================================
   CATEGORY INFORMATION
========================================================= */

const categoryIcons = {

    technology: "💻",

    tech: "💻",

    science: "🔬",

    space: "🚀",

    career: "💼",

    jobs: "💼",

    startup: "🚀",

    startups: "🚀",

    finance: "💰",

    business: "📈",

    education: "🎓",

    campus: "🏫",

    sports: "⚽",

    gaming: "🎮",

    entertainment: "🎬",

    celebrity: "⭐",

    fashion: "👟",

    health: "❤️",

    policy: "🏛️",

    politics: "🏛️",

    environment: "🌱",

    climate: "🌍",

    default: "📰"
};


const availableCategories = [

    "Technology",
    "Science",
    "Career",
    "Startups",
    "Finance",
    "Education",
    "Sports",
    "Gaming",
    "Entertainment",
    "Fashion",
    "Health",
    "Environment"
];


/* =========================================================
   DOM HELPERS
========================================================= */

function $(selector) {

    return document.querySelector(selector);
}


function $all(selector) {

    return document.querySelectorAll(selector);
}


/* =========================================================
   STORAGE
========================================================= */

function loadSavedIds() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem("genGPulseSaved") || "[]"
            );

        return Array.isArray(data) ? data : [];

    } catch {

        return [];
    }
}


function saveSavedIds() {

    localStorage.setItem(
        "genGPulseSaved",
        JSON.stringify(state.savedIds)
    );
}


function loadBlindspotCategories() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    "genGPulseBlindspots"
                ) || "[]"
            );

        if (Array.isArray(data) && data.length) {

            return data;
        }

    } catch {
        // Ignore storage errors.
    }


    /*
       Default topics.

       User can change them in Radar.
    */

    return [
        "Sports",
        "Gaming",
        "Entertainment"
    ];
}


function saveBlindspotCategories() {

    localStorage.setItem(
        "genGPulseBlindspots",
        JSON.stringify(
            state.blindspotCategories
        )
    );
}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {

        return "";
    }

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}


/* =========================================================
   URL SAFETY
========================================================= */

function safeUrl(value) {

    if (!value) {

        return "";
    }

    try {

        const url = new URL(value);

        if (
            url.protocol === "http:" ||
            url.protocol === "https:"
        ) {

            return url.href;
        }

    } catch {
        // Invalid URL.
    }

    return "";
}


/* =========================================================
   DATE / TIME
========================================================= */

/*
   THIS FIXES:

   ${diffHours} hrs ago

   The website will now show:

   Just now
   15 min ago
   2 hrs ago
   1 day ago
   etc.
*/

function timeAgo(dateValue) {

    if (!dateValue) {

        return "Recently";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {

        return "Recently";
    }

    let diffMs =
        Date.now() - date.getTime();

    /*
       Future dates can happen because of timezone differences.
    */

    if (diffMs < 0) {

        diffMs = 0;
    }


    const diffMinutes =
        Math.floor(
            diffMs / (1000 * 60)
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

        return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
    }


    const diffDays =
        Math.floor(
            diffHours / 24
        );


    if (diffDays < 7) {

        return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    }


    const diffWeeks =
        Math.floor(
            diffDays / 7
        );


    if (diffWeeks < 5) {

        return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
    }


    const diffMonths =
        Math.floor(
            diffDays / 30
        );


    return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
}


/* =========================================================
   CATEGORY
========================================================= */

function normalizeCategory(article) {

    let category =
        article.category ||
        article.type ||
        article.section ||
        "";


    if (typeof category === "object") {

        category =
            category.name ||
            category.title ||
            "";
    }


    if (!category) {

        const text = (
            `${article.title || ""} ${article.description || ""}`
        ).toLowerCase();


        if (
            text.includes("sport") ||
            text.includes("cricket") ||
            text.includes("football")
        ) {

            return "Sports";
        }


        if (
            text.includes("game") ||
            text.includes("gaming")
        ) {

            return "Gaming";
        }


        if (
            text.includes("startup") ||
            text.includes("founder")
        ) {

            return "Startups";
        }


        if (
            text.includes("space") ||
            text.includes("satellite")
        ) {

            return "Space";
        }


        if (
            text.includes("ai") ||
            text.includes("technology") ||
            text.includes("tech")
        ) {

            return "Technology";
        }


        if (
            text.includes("education") ||
            text.includes("student") ||
            text.includes("college")
        ) {

            return "Education";
        }


        return "Technology";
    }


    return String(category)
        .trim()
        .replace(/\s+/g, " ")
        .replace(/^./, char => char.toUpperCase());
}


function categoryKey(category) {

    return String(category || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}


function categoryIcon(category) {

    return (
        categoryIcons[
            categoryKey(category)
        ] ||
        categoryIcons.default
    );
}


/* =========================================================
   SOURCE
========================================================= */

function getSourceName(article) {

    if (
        article.source &&
        typeof article.source === "object"
    ) {

        return (
            article.source.name ||
            article.source.title ||
            "News"
        );
    }


    return (
        article.source ||
        article.sourceName ||
        "News"
    );
}


/* =========================================================
   ARTICLE NORMALIZATION
========================================================= */

function normalizeArticle(article, index) {

    if (!article || typeof article !== "object") {

        return null;
    }


    const title =
        article.title ||
        article.headline ||
        article.name ||
        "Untitled story";


    const description =
        article.description ||
        article.summary ||
        article.excerpt ||
        article.content ||
        "No description available.";


    const content =
        article.content ||
        description;


    const url =
        safeUrl(
            article.url ||
            article.link ||
            article.articleUrl ||
            ""
        );


    const image =
        safeUrl(
            article.image ||
            article.imageUrl ||
            article.urlToImage ||
            article.thumbnail ||
            ""
        );


    const publishedAt =
        article.publishedAt ||
        article.published_at ||
        article.date ||
        article.published ||
        article.createdAt ||
        "";


    const sourceName =
        getSourceName(article);


    const category =
        normalizeCategory(article);


    const id =
        String(
            article.id ||
            article.guid ||
            article.url ||
            `${title}-${index}`
        );


    return {

        ...article,

        id,

        title: String(title),

        description:
            String(description)
                .replace(/\s+/g, " ")
                .trim(),

        content: String(content),

        url,

        image,

        publishedAt,

        source: {
            name: String(sourceName)
        },

        category

    };
}


/* =========================================================
   API RESPONSE NORMALIZATION
========================================================= */

function extractArticles(payload) {

    if (Array.isArray(payload)) {

        return payload;
    }


    if (!payload || typeof payload !== "object") {

        return [];
    }


    /*
       Your actual backend format:

       payload.articles
    */

    if (Array.isArray(payload.articles)) {

        return payload.articles;
    }


    /*
       Additional formats supported just in case.
    */

    if (Array.isArray(payload.news)) {

        return payload.news;
    }


    if (Array.isArray(payload.results)) {

        return payload.results;
    }


    if (Array.isArray(payload.items)) {

        return payload.items;
    }


    if (
        payload.data &&
        Array.isArray(payload.data)
    ) {

        return payload.data;
    }


    if (
        payload.data &&
        Array.isArray(payload.data.articles)
    ) {

        return payload.data.articles;
    }


    return [];
}


/* =========================================================
   FETCH NEWS
========================================================= */

async function loadNews() {

    if (state.loading) {

        return;
    }


    state.loading = true;


    showLoadingState();


    try {

        const response =
            await fetch(
                NEWS_API,
                {
                    method: "GET",

                    headers: {
                        "Accept": "application/json"
                    },

                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `News API returned ${response.status}`
            );
        }


        const payload =
            await response.json();


        const rawArticles =
            extractArticles(payload);


        const normalized =
            rawArticles
                .map(
                    normalizeArticle
                )
                .filter(Boolean);


        if (!normalized.length) {

            /*
               API worked but returned no usable articles.
            */

            state.articles =
                fallbackArticles.map(
                    normalizeArticle
                );

        } else {

            state.articles =
                normalized;
        }


        state.swipingIndex = 0;
        state.blindspotIndex = 0;


        renderEverything();


    } catch (error) {

        console.error(
            "Gen G Pulse news error:",
            error
        );


        /*
           Instead of repeatedly showing:

           ERROR
           Unable to load news

           we use fallback content.

           The real API remains the primary source.
        */

        state.articles =
            fallbackArticles.map(
                normalizeArticle
            );


        renderEverything();


        showToast(
            "Live news could not be reached. Showing backup stories."
        );

    } finally {

        state.loading = false;
    }
}


/* =========================================================
   LOADING STATE
========================================================= */

function showLoadingState() {

    const loadingHtml = `
        <div class="loading-card">
            <div>
                📰 Loading Gen Z news...
            </div>
        </div>
    `;


    const grids = [
        "#homeNewsGrid",
        "#flashNewsGrid",
        "#explainGrid"
    ];


    grids.forEach(selector => {

        const element = $(selector);

        if (element) {

            element.innerHTML =
                loadingHtml;
        }
    });
}


/* =========================================================
   NEWS CARD
========================================================= */

function createNewsCard(article) {

    const saved =
        state.savedIds.includes(
            article.id
        );


    const imageHtml =
        article.image

            ? `
                <img
                    src="${escapeHtml(article.image)}"
                    alt=""
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
                >

                <div
                    class="news-image-placeholder"
                    style="display:none"
                >
                    ${categoryIcon(article.category)}
                </div>
            `

            : `
                <div class="news-image-placeholder">
                    ${categoryIcon(article.category)}
                </div>
            `;


    return `
        <article class="news-card">

            <div class="news-image">

                ${imageHtml}

                <span class="news-category">
                    ${escapeHtml(article.category)}
                </span>

            </div>


            <div class="news-body">

                <div class="news-meta">

                    <span>
                        ${escapeHtml(article.source.name)}
                    </span>

                    <span>
                        ${timeAgo(article.publishedAt)}
                    </span>

                </div>


                <h3 class="news-title">
                    ${escapeHtml(article.title)}
                </h3>


                <p class="news-description">
                    ${escapeHtml(article.description)}
                </p>


                <div class="news-actions">

                    <button
                        class="action-btn ai-btn"
                        data-id="${escapeHtml(article.id)}"
                        data-ai-type="summary"
                    >
                        🤖 Summary
                    </button>


                    <button
                        class="action-btn ai-btn"
                        data-id="${escapeHtml(article.id)}"
                        data-ai-type="explain"
                    >
                        🤖 Explain
                    </button>


                    <button
                        class="action-btn save ${saved ? "active" : ""}"
                        data-id="${escapeHtml(article.id)}"
                    >
                        ${saved ? "★" : "☆"} Save
                    </button>


                    ${
                        article.url

                            ? `
                                <button
                                    class="action-btn read article-read"
                                    data-id="${escapeHtml(article.id)}"
                                >
                                    📰 Read
                                </button>
                            `

                            : ""
                    }

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   HOME
========================================================= */

function renderHome() {

    const grid =
        $("#homeNewsGrid");


    if (!grid) {

        return;
    }


    const articles =
        state.articles.slice(0, 6);


    if (!articles.length) {

        grid.innerHTML =
            emptyState(
                "📰",
                "No stories yet",
                "News will appear here when available."
            );

        return;
    }


    grid.innerHTML =
        articles
            .map(createNewsCard)
            .join("");
}


/* =========================================================
   FLASH
========================================================= */

function renderFlash() {

    const grid =
        $("#flashNewsGrid");


    if (!grid) {

        return;
    }


    const articles =
        state.articles;


    if (!articles.length) {

        grid.innerHTML =
            emptyState(
                "📰",
                "No news available",
                "Try refreshing the feed."
            );

        return;
    }


    grid.innerHTML =
        articles
            .map(createNewsCard)
            .join("");
}


/* =========================================================
   EXPLAIN
========================================================= */

function renderExplain() {

    const grid =
        $("#explainGrid");


    if (!grid) {

        return;
    }


    const articles =
        state.articles.slice(0, 12);


    if (!articles.length) {

        grid.innerHTML =
            emptyState(
                "🤖",
                "No explainers yet",
                "Stories will appear here when news is available."
            );

        return;
    }


    grid.innerHTML =
        articles
            .map(createNewsCard)
            .join("");
}


/* =========================================================
   SAVED
========================================================= */

function renderSaved() {

    const grid =
        $("#savedGrid");


    if (!grid) {

        return;
    }


    const articles =
        state.articles.filter(
            article =>
                state.savedIds.includes(
                    article.id
                )
        );


    if (!articles.length) {

        grid.innerHTML =
            emptyState(
                "🔖",
                "Nothing saved yet",
                "Tap ☆ Save on a story to keep it here."
            );

        return;
    }


    grid.innerHTML =
        articles
            .map(createNewsCard)
            .join("");
}


/* =========================================================
   EMPTY STATE
========================================================= */

function emptyState(
    icon,
    title,
    description
) {

    return `
        <div class="empty-state">

            <div class="empty-icon">
                ${icon}
            </div>

            <h3>
                ${escapeHtml(title)}
            </h3>

            <p>
                ${escapeHtml(description)}
            </p>

        </div>
    `;
}


/* =========================================================
   SAVE ARTICLE
========================================================= */

function toggleSave(id) {

    const index =
        state.savedIds.indexOf(id);


    if (index === -1) {

        state.savedIds.push(id);

        showToast(
            "Story saved 🔖"
        );

    } else {

        state.savedIds.splice(index, 1);

        showToast(
            "Removed from Saved"
        );
    }


    saveSavedIds();


    renderHome();
    renderFlash();
    renderExplain();
    renderSaved();
    renderSwiping();
    renderBlindspot();
}


/* =========================================================
   FIND ARTICLE
========================================================= */

function findArticle(id) {

    return state.articles.find(
        article =>
            String(article.id) === String(id)
    );
}


/* =========================================================
   READ ARTICLE
========================================================= */

function readArticle(id) {

    const article =
        findArticle(id);


    if (!article) {

        showToast(
            "Article not found."
        );

        return;
    }


    if (!article.url) {

        showToast(
            "Full article link is not available for this story."
        );

        return;
    }


    window.open(
        article.url,
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================================
   AI FALLBACK SUMMARY
========================================================= */

function createLocalSummary(article) {

    const description =
        article.description ||
        "This story explains a recent development.";


    return `
AI Generated Summary

${description}

Why it matters:
This story is relevant because it describes a development that may affect technology, society, students, business or everyday life.

Source:
${article.source.name}

Published:
${timeAgo(article.publishedAt)}
`;
}


/* =========================================================
   GEN Z EXPLAIN
========================================================= */

function createLocalExplain(article) {

    const category =
        article.category;


    return `
Gen Z Explain

What's happening?

${article.description}

In simple words:
This headline is basically about a new development in ${category.toLowerCase()}.

Why should you care?

The important thing is not just the headline. The development can create changes, opportunities, risks or new conversations around the topic.

Quick takeaway:
Know the basic idea first, then read the full article if it matters to you.
`;
}


/* =========================================================
   OPEN AI MODAL
========================================================= */

async function openAiModal(
    article,
    type
) {

    if (!article) {

        return;
    }


    const modal =
        $("#aiModal");

    const title =
        $("#modalTitle");

    const label =
        $("#modalLabel");

    const icon =
        $("#modalIcon");

    const content =
        $("#modalContent");


    modal.classList.remove("hidden");


    if (type === "summary") {

        icon.textContent = "🤖";

        label.textContent =
            "AI GENERATED SUMMARY";

        title.textContent =
            "Quick Summary";

        content.textContent =
            createLocalSummary(article);

    } else {

        icon.textContent = "🧠";

        label.textContent =
            "GEN Z EXPLAIN";

        title.textContent =
            "Explained Simply";

        content.textContent =
            createLocalExplain(article);
    }


    /*
       Try backend AI endpoint.

       If it doesn't exist, local explanation remains.
    */

    try {

        const endpoint =
            AI_ENDPOINTS[type];


        const response =
            await fetch(
                endpoint,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        article: {
                            title:
                                article.title,

                            description:
                                article.description,

                            content:
                                article.content,

                            source:
                                article.source.name
                        }
                    })
                }
            );


        if (!response.ok) {

            return;
        }


        const data =
            await response.json();


        const aiText =
            data.summary ||
            data.explanation ||
            data.text ||
            data.result ||
            data.message;


        if (aiText) {

            content.textContent =
                aiText;
        }


    } catch {

        /*
           Backend AI endpoint may not exist yet.

           Local fallback is already displayed.
        */
    }
}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {

    const modal =
        $("#aiModal");

    if (modal) {

        modal.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   BLINDSPOT LOGIC
========================================================= */

function isBlindspotArticle(article) {

    const category =
        normalizeCategory(article);


    return state.blindspotCategories.some(
        selected =>
            categoryKey(selected) ===
            categoryKey(category)
    );
}


function getBlindspotArticles() {

    const realBlindspots =
        state.articles.filter(
            isBlindspotArticle
        );


    /*
       Add guaranteed backup stories if needed.
    */

    const combined = [
        ...realBlindspots,
        ...fallbackBlindspotArticles
    ];


    /*
       Remove duplicates.
    */

    const unique = [];

    const ids = new Set();


    for (const article of combined) {

        if (!ids.has(article.id)) {

            ids.add(article.id);

            unique.push(article);
        }
    }


    return unique;
}


function getSwipingArticles() {

    const normal =
        state.articles.filter(
            article =>
                !isBlindspotArticle(article)
        );


    /*
       If everything was filtered out,
       use the normal articles.
    */

    return normal.length
        ? normal
        : state.articles;
}


/* =========================================================
   SWIPE CARD
========================================================= */

function createSwipeCard(
    article,
    index,
    activeIndex
) {

    const saved =
        state.savedIds.includes(
            article.id
        );


    const active =
        index === activeIndex;


    const image =
        article.image

            ? `
                <img
                    src="${escapeHtml(article.image)}"
                    alt=""
                    draggable="false"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
                >

                <div
                    class="swipe-placeholder"
                    style="display:none"
                >
                    ${categoryIcon(article.category)}
                </div>
            `

            : `
                <div class="swipe-placeholder">
                    ${categoryIcon(article.category)}
                </div>
            `;


    return `
        <article
            class="swipe-card ${active ? "active" : ""}"
            data-swipe-index="${index}"
            data-id="${escapeHtml(article.id)}"
        >

            <div class="swipe-media">

                ${image}

                <span class="swipe-overlay-category">
                    ${categoryIcon(article.category)}
                    ${escapeHtml(article.category)}
                </span>

                <span class="swipe-media-time">
                    ${timeAgo(article.publishedAt)}
                </span>

            </div>


            <div class="swipe-body">

                <div class="swipe-source">
                    ${escapeHtml(article.source.name)}
                </div>


                <h2 class="swipe-title">
                    ${escapeHtml(article.title)}
                </h2>


                <p class="swipe-description">
                    ${escapeHtml(article.description)}
                </p>


                <div class="swipe-actions">

                    <button
                        class="swipe-action ai ai-btn"
                        data-id="${escapeHtml(article.id)}"
                        data-ai-type="summary"
                    >
                        🤖 AI Generated<br>
                        Summary
                    </button>


                    <button
                        class="swipe-action explain ai-btn"
                        data-id="${escapeHtml(article.id)}"
                        data-ai-type="explain"
                    >
                        🤖 Gen Z<br>
                        Explain
                    </button>


                    <button
                        class="swipe-action read article-read"
                        data-id="${escapeHtml(article.id)}"
                    >
                        📰 Read Full<br>
                        Article
                    </button>

                </div>


                <div class="swipe-secondary-actions">

                    <button
                        class="save ${saved ? "active" : ""}"
                        data-id="${escapeHtml(article.id)}"
                    >
                        ${saved ? "★ Saved" : "☆ Save"}
                    </button>


                    <button
                        class="not-interested"
                        data-id="${escapeHtml(article.id)}"
                    >
                        👎 Not interested
                    </button>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   RENDER SWIPING
========================================================= */

function renderSwiping() {

    const deck =
        $("#swipeDeck");

    const counter =
        $("#swipeCounter");


    if (!deck) {

        return;
    }


    const articles =
        getSwipingArticles();


    if (!articles.length) {

        deck.innerHTML =
            emptyState(
                "👆",
                "No stories",
                "There are no stories to swipe right now."
            );

        if (counter) {

            counter.textContent = "0 / 0";
        }

        return;
    }


    if (
        state.swipingIndex >=
        articles.length
    ) {

        state.swipingIndex = 0;
    }


    /*
       Only render a few cards around the current card.
       This makes the deck feel like a social app.
    */

    const visible = [];


    for (
        let offset = 0;
        offset < 3;
        offset++
    ) {

        const index =
            (
                state.swipingIndex +
                offset
            ) % articles.length;


        visible.push(
            createSwipeCard(
                articles[index],
                offset,
                0
            )
        );
    }


    deck.innerHTML =
        visible.reverse().join("");


    if (counter) {

        counter.textContent =
            `${state.swipingIndex + 1} / ${articles.length}`;
    }


    setupSwipeGesture(
        deck,
        "swiping"
    );
}


/* =========================================================
   RENDER BLINDSPOT
========================================================= */

function renderBlindspot() {

    const deck =
        $("#blindspotDeck");


    if (!deck) {

        return;
    }


    const articles =
        getBlindspotArticles();


    if (!articles.length) {

        deck.innerHTML =
            emptyState(
                "🕳️",
                "Blindspot is empty",
                "Choose some topics in Radar."
            );

        return;
    }


    if (
        state.blindspotIndex >=
        articles.length
    ) {

        state.blindspotIndex = 0;
    }


    const visible = [];


    for (
        let offset = 0;
        offset < 3;
        offset++
    ) {

        const index =
            (
                state.blindspotIndex +
                offset
            ) % articles.length;


        visible.push(
            createSwipeCard(
                articles[index],
                offset,
                0
            )
        );
    }


    deck.innerHTML =
        visible.reverse().join("");


    setupSwipeGesture(
        deck,
        "blindspot"
    );
}


/* =========================================================
   NEXT / PREVIOUS
========================================================= */

function nextSwiping() {

    const articles =
        getSwipingArticles();


    if (!articles.length) {

        return;
    }


    state.swipingIndex =
        (
            state.swipingIndex + 1
        ) % articles.length;


    renderSwiping();
}


function previousSwiping() {

    const articles =
        getSwipingArticles();


    if (!articles.length) {

        return;
    }


    state.swipingIndex =
        (
            state.swipingIndex - 1 +
            articles.length
        ) % articles.length;


    renderSwiping();
}


function nextBlindspot() {

    const articles =
        getBlindspotArticles();


    if (!articles.length) {

        return;
    }


    state.blindspotIndex =
        (
            state.blindspotIndex + 1
        ) % articles.length;


    renderBlindspot();
}


function previousBlindspot() {

    const articles =
        getBlindspotArticles();


    if (!articles.length) {

        return;
    }


    state.blindspotIndex =
        (
            state.blindspotIndex - 1 +
            articles.length
        ) % articles.length;


    renderBlindspot();
}


/* =========================================================
   SWIPE GESTURE
========================================================= */

function setupSwipeGesture(
    deck,
    type
) {

    const activeCard =
        deck.querySelector(
            ".swipe-card.active"
        );


    if (!activeCard) {

        return;
    }


    let startX = 0;

    let currentX = 0;

    let dragging = false;


    activeCard.addEventListener(
        "pointerdown",
        event => {

            /*
               Don't start dragging if user clicked
               a button or link.
            */

            if (
                event.target.closest(
                    "button, a"
                )
            ) {

                return;
            }


            dragging = true;

            startX =
                event.clientX;

            currentX =
                startX;

            activeCard.classList.add(
                "dragging"
            );

            activeCard.setPointerCapture(
                event.pointerId
            );
        }
    );


    activeCard.addEventListener(
        "pointermove",
        event => {

            if (!dragging) {

                return;
            }


            currentX =
                event.clientX;


            const diff =
                currentX - startX;


            activeCard.style.transform =
                `translateX(${diff}px) rotate(${diff / 18}deg)`;
        }
    );


    activeCard.addEventListener(
        "pointerup",
        event => {

            if (!dragging) {

                return;
            }


            dragging = false;

            const diff =
                currentX - startX;


            activeCard.classList.remove(
                "dragging"
            );


            if (Math.abs(diff) > 100) {

                if (type === "swiping") {

                    if (diff < 0) {

                        nextSwiping();

                    } else {

                        previousSwiping();
                    }

                } else {

                    if (diff < 0) {

                        nextBlindspot();

                    } else {

                        previousBlindspot();
                    }
                }

            } else {

                activeCard.style.transform =
                    "";
            }
        }
    );


    activeCard.addEventListener(
        "pointercancel",
        () => {

            dragging = false;

            activeCard.classList.remove(
                "dragging"
            );

            activeCard.style.transform =
                "";
        }
    );
}


/* =========================================================
   NOT INTERESTED
========================================================= */

function markNotInterested(id) {

    const article =
        findArticle(id);


    if (!article) {

        return;
    }


    const category =
        normalizeCategory(article);


    if (
        !state.blindspotCategories.some(
            existing =>
                categoryKey(existing) ===
                categoryKey(category)
        )
    ) {

        state.blindspotCategories.push(
            category
        );

        saveBlindspotCategories();
    }


    showToast(
        `${category} added to Blindspot Feed`
    );


    state.swipingIndex = 0;

    renderSwiping();
    renderBlindspot();
    renderRadar();
}


/* =========================================================
   RADAR
========================================================= */

function renderRadar() {

    const container =
        $("#interestControls");


    if (!container) {

        return;
    }


    container.innerHTML =
        availableCategories
            .map(category => {

                const active =
                    state.blindspotCategories.some(
                        selected =>
                            categoryKey(selected) ===
                            categoryKey(category)
                    );


                return `
                    <button
                        class="interest-btn ${active ? "active" : ""}"
                        data-category="${escapeHtml(category)}"
                    >
                        ${categoryIcon(category)}
                        ${escapeHtml(category)}
                        ${active ? " ✓" : ""}
                    </button>
                `;
            })
            .join("");
}


function toggleBlindspotCategory(
    category
) {

    const index =
        state.blindspotCategories.findIndex(
            selected =>
                categoryKey(selected) ===
                categoryKey(category)
        );


    if (index === -1) {

        state.blindspotCategories.push(
            category
        );

    } else {

        state.blindspotCategories.splice(
            index,
            1
        );
    }


    saveBlindspotCategories();


    state.blindspotIndex = 0;
    state.swipingIndex = 0;


    renderRadar();
    renderSwiping();
    renderBlindspot();


    showToast(
        index === -1
            ? `${category} added to Blindspot`
            : `${category} removed from Blindspot`
    );
}


function resetRadar() {

    state.blindspotCategories = [
        "Sports",
        "Gaming",
        "Entertainment"
    ];


    saveBlindspotCategories();


    state.swipingIndex = 0;
    state.blindspotIndex = 0;


    renderRadar();
    renderSwiping();
    renderBlindspot();


    showToast(
        "Radar preferences reset"
    );
}


/* =========================================================
   NAVIGATION
========================================================= */

function showView(viewName) {

    const target =
        document.getElementById(
            `${viewName}View`
        );


    if (!target) {

        console.warn(
            `View not found: ${viewName}`
        );

        return;
    }


    $all(".view").forEach(view => {

        view.classList.remove(
            "active"
        );
    });


    target.classList.add(
        "active"
    );


    $all(".nav-btn").forEach(btn => {

        btn.classList.toggle(
            "active",
            btn.dataset.view === viewName
        );
    });


    state.currentView =
        viewName;


    /*
       Re-render special views whenever opened.
    */

    if (viewName === "swiping") {

        renderSwiping();
    }


    if (viewName === "blindspot") {

        renderBlindspot();
    }


    if (viewName === "saved") {

        renderSaved();
    }


    if (viewName === "radar") {

        renderRadar();
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderEverything() {

    renderHome();

    renderFlash();

    renderExplain();

    renderSaved();

    renderRadar();

    renderSwiping();

    renderBlindspot();
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(message) {

    const toast =
        $("#toast");


    if (!toast) {

        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );
}


/* =========================================================
   EVENT HANDLING
========================================================= */

function setupEvents() {


    /*
       Navigation
    */

    document.addEventListener(
        "click",
        event => {

            const viewButton =
                event.target.closest(
                    "[data-view]"
                );


            if (viewButton) {

                event.preventDefault();

                showView(
                    viewButton.dataset.view
                );

                return;
            }


            /*
               Save
            */

            const saveButton =
                event.target.closest(
                    ".save"
                );


            if (
                saveButton &&
                saveButton.dataset.id
            ) {

                event.stopPropagation();

                toggleSave(
                    saveButton.dataset.id
                );

                return;
            }


            /*
               AI
            */

            const aiButton =
                event.target.closest(
                    ".ai-btn"
                );


            if (aiButton) {

                event.stopPropagation();


                const article =
                    findArticle(
                        aiButton.dataset.id
                    );


                openAiModal(
                    article,
                    aiButton.dataset.aiType
                );


                return;
            }


            /*
               Read article
            */

            const readButton =
                event.target.closest(
                    ".article-read"
                );


            if (readButton) {

                event.stopPropagation();

                readArticle(
                    readButton.dataset.id
                );

                return;
            }


            /*
               Not interested
            */

            const notInterested =
                event.target.closest(
                    ".not-interested"
                );


            if (notInterested) {

                event.stopPropagation();

                markNotInterested(
                    notInterested.dataset.id
                );

                return;
            }


            /*
               Radar category
            */

            const interestButton =
                event.target.closest(
                    ".interest-btn"
                );


            if (interestButton) {

                toggleBlindspotCategory(
                    interestButton.dataset.category
                );

                return;
            }

        }
    );


    /*
       Home / refresh etc.
    */

    const refresh =
        $("#refreshNewsBtn");


    if (refresh) {

        refresh.addEventListener(
            "click",
            () => {

                loadNews();
            }
        );
    }


    const next =
        $("#swipeNext");


    if (next) {

        next.addEventListener(
            "click",
            nextSwiping
        );
    }


    const previous =
        $("#swipePrevious");


    if (previous) {

        previous.addEventListener(
            "click",
            previousSwiping
        );
    }


    const blindNext =
        $("#blindspotNext");


    if (blindNext) {

        blindNext.addEventListener(
            "click",
            nextBlindspot
        );
    }


    const blindPrevious =
        $("#blindspotPrevious");


    if (blindPrevious) {

        blindPrevious.addEventListener(
            "click",
            previousBlindspot
        );
    }


    const resetRadarButton =
        $("#resetRadarBtn");


    if (resetRadarButton) {

        resetRadarButton.addEventListener(
            "click",
            resetRadar
        );
    }


    const close =
        $("#closeModal");


    if (close) {

        close.addEventListener(
            "click",
            closeModal
        );
    }


    const overlay =
        $("#modalOverlay");


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeModal
        );
    }


    /*
       Escape closes AI modal.
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeModal();
            }


            /*
               Keyboard navigation for swiping.
            */

            if (
                state.currentView ===
                "swiping"
            ) {

                if (
                    event.key ===
                    "ArrowRight"
                ) {

                    nextSwiping();
                }


                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    previousSwiping();
                }
            }


            if (
                state.currentView ===
                "blindspot"
            ) {

                if (
                    event.key ===
                    "ArrowRight"
                ) {

                    nextBlindspot();
                }


                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    previousBlindspot();
                }
            }

        }
    );
}


/* =========================================================
   INITIALIZE
========================================================= */

function init() {

    setupEvents();

    renderEverything();

    loadNews();
}


/*
   Start application.
*/

document.addEventListener(
    "DOMContentLoaded",
    init
);