/* =========================================================
   GEN G PULSE - COMPLETE FRONTEND JAVASCRIPT
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
   ========================================================= */

const API_BASE = "";
const NEWS_ENDPOINT = "/api/news";

const STORAGE_KEYS = {
    saved: "genGPulseSaved",
    notInterested: "genGPulseNotInterested",
    preferences: "genGPulsePreferences"
};

/* =========================================================
   APPLICATION STATE
   ========================================================= */

const state = {
    articles: [],
    blindspotArticles: [],
    savedArticles: [],
    notInterestedCategories: [],
    selectedArticle: null,
    currentView: "home",
    swipeIndex: 0,
    swipeStartX: 0,
    swipeCurrentX: 0,
    swipeDragging: false,
    isLoadingNews: false,
    isLoadingBlindspot: false
};

/* =========================================================
   FALLBACK DATA
   ========================================================= */

const fallbackArticles = [
    {
        id: "fallback-ai",
        title: "AI is changing how students learn and work",
        description:
            "Artificial intelligence is becoming part of education, productivity and everyday digital life.",
        content:
            "AI tools are increasingly being used by students and young professionals for learning, research, coding and productivity.",
        url: "https://www.google.com/search?q=AI+India+students",
        image: "",
        publishedAt: new Date().toISOString(),
        source: "Gen G Pulse",
        category: "technology"
    },
    {
        id: "fallback-space",
        title: "India's space technology ecosystem continues to grow",
        description:
            "New space technology companies and missions are expanding opportunities in India's technology sector.",
        content:
            "India's growing space ecosystem is creating opportunities across satellites, launch systems, data and advanced engineering.",
        url: "https://www.google.com/search?q=India+space+technology",
        image: "",
        publishedAt: new Date().toISOString(),
        source: "Gen G Pulse",
        category: "science"
    },
    {
        id: "fallback-campus",
        title: "Students can explore new campus and career opportunities",
        description:
            "Scholarships, competitions, internships and student programs can help students build experience.",
        content:
            "Students can use scholarships, competitions, internships and campus programs to build skills and experience.",
        url: "https://www.google.com/search?q=India+student+internships+scholarships",
        image: "",
        publishedAt: new Date().toISOString(),
        source: "Gen G Pulse",
        category: "campus"
    }
];

const fallbackBlindspotArticles = [
    {
        id: "blind-sports",
        title: "Indian sports continues to attract a huge young audience",
        description:
            "Sports remains one of the most followed entertainment categories among young audiences.",
        content:
            "Sports stories, tournaments and athlete performances continue to generate strong engagement among Indian audiences.",
        url: "https://www.google.com/search?q=India+sports+news",
        image: "",
        publishedAt: new Date().toISOString(),
        source: "Gen G Pulse",
        category: "sports"
    },
    {
        id: "blind-gaming",
        title: "Gaming continues to expand across India's digital audience",
        description:
            "Mobile and competitive gaming remain major parts of India's digital entertainment ecosystem.",
        content:
            "India's gaming audience continues to grow through mobile gaming, esports and gaming communities.",
        url: "https://www.google.com/search?q=India+gaming+news",
        image: "",
        publishedAt: new Date().toISOString(),
        source: "Gen G Pulse",
        category: "gaming"
    },
    {
        id: "blind-entertainment",
        title: "Entertainment trends are changing how Gen Z consumes content",
        description:
            "Streaming, creators and short-form content continue to influence entertainment habits.",
        content:
            "Digital platforms, creators and streaming services are changing how younger audiences discover entertainment.",
        url: "https://www.google.com/search?q=India+entertainment+news",
        image: "",
        publishedAt: new Date().toISOString(),
        source: "Gen G Pulse",
        category: "entertainment"
    }
];

/* =========================================================
   OPPORTUNITIES
   ========================================================= */

const opportunityData = [
    {
        id: "scholarship-1",
        type: "Scholarship",
        icon: "🎓",
        title: "National Scholarship Portal",
        description:
            "Explore government scholarship opportunities for eligible students through the official National Scholarship Portal.",
        action: "Apply",
        url: "https://scholarships.gov.in/",
        tag: "Scholarship"
    },
    {
        id: "campus-1",
        type: "Campus opportunity",
        icon: "💼",
        title: "AICTE Student & Internship Opportunities",
        description:
            "Explore official education, internship and student-development opportunities connected with India's technical education ecosystem.",
        action: "Connect",
        url: "https://www.aicte-india.org/",
        tag: "Campus"
    },
    {
        id: "event-1",
        type: "Student event",
        icon: "📅",
        title: "Student Events & Competitions",
        description:
            "Discover hackathons, competitions, internships and student events from a large Indian student opportunity platform.",
        action: "Attend",
        url: "https://unstop.com/",
        tag: "Event"
    },
    {
        id: "campus-2",
        type: "Campus opportunity",
        icon: "🚀",
        title: "Student innovation opportunities",
        description:
            "Look for innovation programs, entrepreneurship activities and student opportunities.",
        action: "Connect",
        url: "https://www.startupindia.gov.in/",
        tag: "Innovation"
    }
];

/* =========================================================
   CATEGORY INFORMATION
   ========================================================= */

const categoryInfo = {
    technology: {
        name: "Technology",
        emoji: "💻"
    },
    ai: {
        name: "AI",
        emoji: "🤖"
    },
    campus: {
        name: "Campus",
        emoji: "🎓"
    },
    education: {
        name: "Education",
        emoji: "📚"
    },
    jobs: {
        name: "Jobs & Careers",
        emoji: "💼"
    },
    finance: {
        name: "Finance",
        emoji: "💰"
    },
    startups: {
        name: "Startups",
        emoji: "🚀"
    },
    science: {
        name: "Science",
        emoji: "🔬"
    },
    space: {
        name: "Space",
        emoji: "🛰️"
    },
    sports: {
        name: "Sports",
        emoji: "🏏"
    },
    gaming: {
        name: "Gaming",
        emoji: "🎮"
    },
    entertainment: {
        name: "Entertainment",
        emoji: "🎬"
    },
    celebrity: {
        name: "Celebrity",
        emoji: "⭐"
    },
    policy: {
        name: "Policy",
        emoji: "🏛️"
    },
    general: {
        name: "General",
        emoji: "📰"
    }
};

const defaultNotInterestedCategories = [
    "sports",
    "gaming",
    "celebrity",
    "entertainment"
];

/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return Array.from(document.querySelectorAll(selector));
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function safeURL(value) {
    if (!value) {
        return "";
    }

    try {
        const url = new URL(String(value), window.location.origin);

        if (
            url.protocol === "http:" ||
            url.protocol === "https:"
        ) {
            return url.href;
        }
    } catch (error) {
        return "";
    }

    return "";
}

/* =========================================================
   DATE / TIME
   ========================================================= */

function timeAgo(value) {
    if (!value) {
        return "Recently";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Recently";
    }

    const difference = Date.now() - date.getTime();

    if (difference < 0) {
        return "Just now";
    }

    const minutes = Math.floor(difference / 60000);

    if (minutes < 1) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hr${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Recently";
    }

    return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

/* =========================================================
   CATEGORY DETECTION
   ========================================================= */

function inferCategory(article) {
    const text = (
        `${article.title || ""} ${article.description || ""} ${article.content || ""}`
    ).toLowerCase();

    if (
        /\b(ai|artificial intelligence|machine learning|gemini|chatgpt|openai|robotics|robot)\b/.test(
            text
        )
    ) {
        return "ai";
    }

    if (
        /\b(scholarship|college|campus|student|university|education|exam|academic|iit|engineering college)\b/.test(
            text
        )
    ) {
        return "education";
    }

    if (
        /\b(internship|job|jobs|career|hiring|recruitment|employment|workforce)\b/.test(
            text
        )
    ) {
        return "jobs";
    }

    if (
        /\b(stock|stocks|market|nifty|sensex|share|shares|mutual fund|ipo|investor|investment)\b/.test(
            text
        )
    ) {
        return "finance";
    }

    if (
        /\b(startup|startup india|entrepreneur|funding|venture capital)\b/.test(
            text
        )
    ) {
        return "startups";
    }

    if (
        /\b(space|satellite|rocket|isro|orbit|astronaut|moon|mars)\b/.test(
            text
        )
    ) {
        return "space";
    }

    if (
        /\b(science|research|quantum|physics|biology|chemistry|medical research)\b/.test(
            text
        )
    ) {
        return "science";
    }

    if (
        /\b(cricket|football|sport|sports|ipl|tennis|hockey|athlete|match|tournament)\b/.test(
            text
        )
    ) {
        return "sports";
    }

    if (
        /\b(gaming|game|esports|esport|playstation|xbox|steam|gaming)\b/.test(
            text
        )
    ) {
        return "gaming";
    }

    if (
        /\b(movie|film|cinema|bollywood|tollywood|web series|streaming|actor|actress|music)\b/.test(
            text
        )
    ) {
        return "entertainment";
    }

    if (
        /\b(celebrity|celeb|star|influencer)\b/.test(
            text
        )
    ) {
        return "celebrity";
    }

    if (
        /\b(government|minister|policy|law|regulation|parliament)\b/.test(
            text
        )
    ) {
        return "policy";
    }

    if (
        /\b(technology|tech|software|cyber|digital|computer|smartphone|internet)\b/.test(
            text
        )
    ) {
        return "technology";
    }

    return "general";
}

/* =========================================================
   ARTICLE NORMALIZATION
   ========================================================= */

function normalizeArticle(item, index = 0) {
    if (!item) {
        return null;
    }

    const sourceObject =
        typeof item.source === "object" && item.source !== null
            ? item.source
            : {
                  name: item.source || "News"
              };

    const title = String(
        item.title ||
            item.name ||
            "Untitled news article"
    ).trim();

    if (!title) {
        return null;
    }

    const description = String(
        item.description ||
            item.content ||
            "No description available."
    ).trim();

    const content = String(
        item.content ||
            item.description ||
            ""
    ).trim();

    const article = {
        id: String(
            item.id ||
                `${index}-${title}`
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
        ),
        title,
        description,
        content,
        url: safeURL(item.url || item.link || ""),
        image: safeURL(item.image || item.imageUrl || ""),
        publishedAt:
            item.publishedAt ||
            item.published_at ||
            item.date ||
            new Date().toISOString(),
        source: String(
            sourceObject.name ||
                item.sourceName ||
                "News"
        ),
        sourceUrl: safeURL(
            sourceObject.url ||
                item.sourceUrl ||
                ""
        ),
        category: item.category
            ? String(item.category).toLowerCase()
            : inferCategory(item)
    };

    if (!categoryInfo[article.category]) {
        article.category = inferCategory(article);
    }

    return article;
}

/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function loadStorage() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.saved) || "[]"
        );

        const notInterested = JSON.parse(
            localStorage.getItem(
                STORAGE_KEYS.notInterested
            ) || "null"
        );

        state.savedArticles = Array.isArray(saved)
            ? saved
            : [];

        state.notInterestedCategories =
            Array.isArray(notInterested)
                ? notInterested
                : [...defaultNotInterestedCategories];
    } catch (error) {
        console.warn(
            "Unable to read localStorage:",
            error
        );

        state.savedArticles = [];
        state.notInterestedCategories = [
            ...defaultNotInterestedCategories
        ];
    }
}

function saveStorage() {
    try {
        localStorage.setItem(
            STORAGE_KEYS.saved,
            JSON.stringify(state.savedArticles)
        );

        localStorage.setItem(
            STORAGE_KEYS.notInterested,
            JSON.stringify(
                state.notInterestedCategories
            )
        );
    } catch (error) {
        console.warn(
            "Unable to save localStorage:",
            error
        );
    }
}

/* =========================================================
   SAVED ARTICLES
   ========================================================= */

function isSaved(articleId) {
    return state.savedArticles.some(
        article => String(article.id) === String(articleId)
    );
}

function toggleSave(article) {
    if (!article) {
        return;
    }

    const existingIndex =
        state.savedArticles.findIndex(
            item =>
                String(item.id) ===
                String(article.id)
        );

    if (existingIndex >= 0) {
        state.savedArticles.splice(
            existingIndex,
            1
        );

        showToast("Removed from Saved");
    } else {
        state.savedArticles.unshift(article);

        showToast("Saved to your feed ⭐");
    }

    saveStorage();

    renderAllRelevantViews();
}

/* =========================================================
   NEWS API
   ========================================================= */

async function fetchNewsQuery(query) {
    const url =
        `${NEWS_ENDPOINT}?query=` +
        encodeURIComponent(query);

    const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(
            `News API returned ${response.status}`
        );
    }

    const payload = await response.json();

    const rawArticles =
        Array.isArray(payload)
            ? payload
            : payload.articles ||
              payload.news ||
              payload.data ||
              payload.results ||
              payload.items ||
              [];

    if (!Array.isArray(rawArticles)) {
        return [];
    }

    return rawArticles
        .map((item, index) =>
            normalizeArticle(item, index)
        )
        .filter(Boolean);
}

/* =========================================================
   LOAD MAIN NEWS
   ========================================================= */

async function loadNews() {
    if (state.isLoadingNews) {
        return;
    }

    state.isLoadingNews = true;

    setLoadingState(true);

    try {
        const articles = await fetchNewsQuery(
            "India technology AI students education jobs startups science"
        );

        if (articles.length > 0) {
            state.articles = deduplicateArticles(
                articles
            );
        } else {
            state.articles = [...fallbackArticles];
        }

        updateNewsStatus(
            `Live news loaded • ${state.articles.length} stories`
        );
    } catch (error) {
        console.error(
            "Unable to load news:",
            error
        );

        if (state.articles.length === 0) {
            state.articles = [
                ...fallbackArticles
            ];
        }

        updateNewsStatus(
            "Live news temporarily unavailable • starter feed shown"
        );
    } finally {
        state.isLoadingNews = false;

        setLoadingState(false);

        renderAllRelevantViews();
    }
}

/* =========================================================
   LOAD BLINDSPOT NEWS
   ========================================================= */

async function loadBlindspotNews() {
    if (state.isLoadingBlindspot) {
        return;
    }

    state.isLoadingBlindspot = true;

    try {
        const articles = await fetchNewsQuery(
            "India sports gaming entertainment celebrity movies"
        );

        if (articles.length > 0) {
            state.blindspotArticles =
                deduplicateArticles(articles);
        } else {
            state.blindspotArticles = [
                ...fallbackBlindspotArticles
            ];
        }
    } catch (error) {
        console.error(
            "Unable to load blindspot news:",
            error
        );

        state.blindspotArticles = [
            ...fallbackBlindspotArticles
        ];
    } finally {
        state.isLoadingBlindspot = false;

        renderBlindspot();
    }
}

/* =========================================================
   DEDUPLICATE
   ========================================================= */

function deduplicateArticles(articles) {
    const map = new Map();

    articles.forEach(article => {
        const key =
            article.url ||
            article.title
                .toLowerCase()
                .trim();

        if (!map.has(key)) {
            map.set(key, article);
        }
    });

    return Array.from(map.values());
}

/* =========================================================
   LOADING STATE
   ========================================================= */

function setLoadingState(isLoading) {
    document.body.classList.toggle(
        "news-loading",
        isLoading
    );
}

function updateNewsStatus(message) {
    const elements = $$(
        "[data-news-status]"
    );

    elements.forEach(element => {
        element.textContent = message;
    });
}

/* =========================================================
   CATEGORY HELPERS
   ========================================================= */

function getCategoryName(category) {
    return (
        categoryInfo[category]?.name ||
        "General"
    );
}

function getCategoryEmoji(category) {
    return (
        categoryInfo[category]?.emoji ||
        "📰"
    );
}

/* =========================================================
   IMAGE
   ========================================================= */

function articleImage(article) {
    if (article.image) {
        return `
            <img
                class="article-image"
                src="${escapeHTML(article.image)}"
                alt=""
                loading="lazy"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
            >
            <div class="article-image-fallback">
                ${getCategoryEmoji(article.category)}
            </div>
        `;
    }

    return `
        <div class="article-image-fallback">
            ${getCategoryEmoji(article.category)}
        </div>
    `;
}

/* =========================================================
   ARTICLE CARD
   ========================================================= */

function articleCard(article, options = {}) {
    const {
        showActions = true,
        compact = false
    } = options;

    const saved = isSaved(article.id);

    return `
        <article
            class="news-card ${compact ? "compact-card" : ""}"
            data-article-id="${escapeHTML(article.id)}"
        >

            <div class="news-card-image">
                ${articleImage(article)}
            </div>

            <div class="news-card-body">

                <div class="news-meta">
                    <span>
                        ${getCategoryEmoji(article.category)}
                        ${escapeHTML(
                            getCategoryName(
                                article.category
                            )
                        )}
                    </span>

                    <span>
                        ${escapeHTML(article.source)}
                    </span>

                    <span>
                        ${timeAgo(
                            article.publishedAt
                        )}
                    </span>
                </div>

                <h3>
                    ${escapeHTML(article.title)}
                </h3>

                <p>
                    ${escapeHTML(
                        article.description
                    )}
                </p>

                ${
                    showActions
                        ? `
                    <div class="article-actions">

                        <button
                            class="action-btn ai-btn"
                            data-action="summary"
                            data-id="${escapeHTML(
                                article.id
                            )}"
                        >
                            🤖 AI Generated Summary
                        </button>

                        <button
                            class="action-btn explain-btn"
                            data-action="explain"
                            data-id="${escapeHTML(
                                article.id
                            )}"
                        >
                            🤖 Gen Z Explain
                        </button>

                        <button
                            class="action-btn read-btn"
                            data-action="read"
                            data-id="${escapeHTML(
                                article.id
                            )}"
                        >
                            📰 Read Full Article
                        </button>

                        <button
                            class="save-btn ${
                                saved ? "saved" : ""
                            }"
                            data-action="save"
                            data-id="${escapeHTML(
                                article.id
                            )}"
                        >
                            ${
                                saved
                                    ? "⭐ Saved"
                                    : "☆ Save"
                            }
                        </button>

                    </div>
                `
                        : ""
                }

            </div>
        </article>
    `;
}

/* =========================================================
   FIND ARTICLE
   ========================================================= */

function findArticle(articleId) {
    const all = [
        ...state.articles,
        ...state.blindspotArticles,
        ...state.savedArticles,
        ...fallbackArticles,
        ...fallbackBlindspotArticles
    ];

    return (
        all.find(
            article =>
                String(article.id) ===
                String(articleId)
        ) || null
    );
}

/* =========================================================
   HOME
   ========================================================= */

function renderHome() {
    const container =
        $("#homeView") ||
        $("#home");

    if (!container) {
        return;
    }

    const topArticles =
        state.articles.slice(0, 6);

    const cards = topArticles.length
        ? topArticles
              .map(article =>
                  articleCard(article, {
                      showActions: true,
                      compact: true
                  })
              )
              .join("")
        : `
            <div class="empty-state">
                <div>📰</div>
                <h3>Loading your pulse...</h3>
            </div>
        `;

    const html = `
        <div class="hero-section">

            <div class="hero-content">

                <div class="hero-badge">
                    ⚡ REAL-TIME GEN G NEWS
                </div>

                <h1>
                    The internet,
                    <span>but Gen Z gets it.</span>
                </h1>

                <p>
                    Fast news. AI summaries.
                    Gen Z explanations.
                    Opportunities you can actually use.
                </p>

                <div class="hero-buttons">

                    <button
                        class="primary-btn"
                        data-view-target="flash"
                    >
                        ⚡ Explore Flash
                    </button>

                    <button
                        class="secondary-btn"
                        data-view-target="swiping"
                    >
                        👆 Start Swiping
                    </button>

                </div>

            </div>

        </div>

        <div class="stats-grid">

            <div class="stat-card">
                <strong>
                    ${state.articles.length}
                </strong>
                <span>Live stories</span>
            </div>

            <div class="stat-card">
                <strong>
                    ${state.savedArticles.length}
                </strong>
                <span>Saved</span>
            </div>

            <div class="stat-card">
                <strong>
                    ${state.notInterestedCategories.length}
                </strong>
                <span>Blindspot topics</span>
            </div>

            <div class="stat-card">
                <strong>AI</strong>
                <span>Powered explainers</span>
            </div>

        </div>

        <section class="content-section">

            <div class="section-heading">
                <div>
                    <span class="section-kicker">
                        TRENDING NOW
                    </span>

                    <h2>
                        What's happening?
                    </h2>
                </div>

                <button
                    class="small-btn"
                    data-view-target="flash"
                >
                    See all →
                </button>
            </div>

            <div class="news-grid">
                ${cards}
            </div>

        </section>
    `;

    container.innerHTML = html;
}

/* =========================================================
   GEN Z VIEW
   ========================================================= */

function renderGenZ() {
    const container =
        $("#genzView") ||
        $("#genz");

    if (!container) {
        return;
    }

    const articles =
        state.articles.slice(0, 12);

    container.innerHTML = `
        <section class="page-header">

            <span class="section-kicker">
                GEN Z
            </span>

            <h1>
                News that matters to your generation
            </h1>

            <p>
                Technology, education, careers,
                startups, science and more.
            </p>

        </section>

        <div class="news-grid">
            ${
                articles.length
                    ? articles
                          .map(article =>
                              articleCard(
                                  article
                              )
                          )
                          .join("")
                    : `
                        <div class="empty-state">
                            Loading news...
                        </div>
                    `
            }
        </div>
    `;
}

/* =========================================================
   FLASH VIEW
   ========================================================= */

function renderFlash() {
    const container =
        $("#flashView") ||
        $("#flash");

    if (!container) {
        return;
    }

    const articles = state.articles;

    container.innerHTML = `
        <section class="page-header">

            <div class="header-row">

                <div>
                    <span class="section-kicker">
                        ⚡ FLASH
                    </span>

                    <h1>
                        Fast. Fresh. No fluff.
                    </h1>

                    <p>
                        Live articles from your news pipeline.
                    </p>
                </div>

                <button
                    class="primary-btn"
                    id="refreshNewsBtn"
                >
                    ↻ Refresh News
                </button>

            </div>

            <div
                class="news-status"
                data-news-status
            >
                Live news
            </div>

        </section>

        <div class="news-grid">

            ${
                articles.length
                    ? articles
                          .map(article =>
                              articleCard(article)
                          )
                          .join("")
                    : `
                        <div class="empty-state">
                            <div>📰</div>
                            <h3>No news available</h3>
                        </div>
                    `
            }

        </div>
    `;
}

/* =========================================================
   EXPLAIN VIEW
   ========================================================= */

function renderExplain() {
    const container =
        $("#explainView") ||
        $("#explain");

    if (!container) {
        return;
    }

    const articles =
        state.articles.slice(0, 8);

    container.innerHTML = `
        <section class="page-header">

            <span class="section-kicker">
                🤖 GEN Z EXPLAIN
            </span>

            <h1>
                No complicated news language.
            </h1>

            <p>
                Pick a story and get a simple,
                Gen Z-friendly explanation.
            </p>

        </section>

        ${
            state.selectedArticle
                ? `
                    <div class="selected-explain-card">

                        <div class="selected-explain-header">
                            <span>
                                Selected story
                            </span>

                            <button
                                class="small-btn"
                                id="closeSelectedExplain"
                            >
                                ✕ Close
                            </button>
                        </div>

                        <h2>
                            ${escapeHTML(
                                state.selectedArticle.title
                            )}
                        </h2>

                        <button
                            class="primary-btn"
                            data-action="explain"
                            data-id="${escapeHTML(
                                state.selectedArticle.id
                            )}"
                        >
                            🤖 Explain this story
                        </button>

                    </div>
                `
                : ""
        }

        <div class="news-grid">

            ${
                articles.length
                    ? articles
                          .map(article => `
                              <article class="explain-select-card">

                                  <div class="explain-card-category">
                                      ${getCategoryEmoji(
                                          article.category
                                      )}
                                      ${escapeHTML(
                                          getCategoryName(
                                              article.category
                                          )
                                      )}
                                  </div>

                                  <h3>
                                      ${escapeHTML(
                                          article.title
                                      )}
                                  </h3>

                                  <p>
                                      ${escapeHTML(
                                          article.description
                                      )}
                                  </p>

                                  <button
                                      class="primary-btn"
                                      data-action="select-explain"
                                      data-id="${escapeHTML(
                                          article.id
                                      )}"
                                  >
                                      🤖 Explain
                                  </button>

                              </article>
                          `)
                          .join("")
                    : `
                        <div class="empty-state">
                            No articles available.
                        </div>
                    `
            }

        </div>
    `;
}

/* =========================================================
   OPPORTUNITIES
   ========================================================= */

function renderOpportunities() {
    const container =
        $("#opportunitiesView") ||
        $("#opportunities");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <section class="page-header">

            <span class="section-kicker">
                🎯 OPPORTUNITIES
            </span>

            <h1>
                Don't just read. Do something.
            </h1>

            <p>
                Scholarships, campus opportunities
                and student events.
            </p>

        </section>

        <div class="opportunity-notice">
            <span>🔎</span>
            <div>
                <strong>
                    Always verify eligibility and deadlines
                </strong>
                <p>
                    These links open the relevant official
                    or opportunity platform. Check the current
                    details before applying or attending.
                </p>
            </div>
        </div>

        <div class="opportunities-grid">

            ${opportunityData
                .map(opportunity => `
                    <article
                        class="opportunity-card"
                        data-opportunity-id="${escapeHTML(
                            opportunity.id
                        )}"
                    >

                        <div class="opportunity-icon">
                            ${opportunity.icon}
                        </div>

                        <span class="opportunity-type">
                            ${escapeHTML(
                                opportunity.type
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                opportunity.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                opportunity.description
                            )}
                        </p>

                        <div class="opportunity-footer">

                            <span>
                                ${escapeHTML(
                                    opportunity.tag
                                )}
                            </span>

                            <button
                                class="opportunity-btn"
                                data-opportunity-url="${escapeHTML(
                                    opportunity.url
                                )}"
                            >
                                ${escapeHTML(
                                    opportunity.action
                                )}
                                →
                            </button>

                        </div>

                    </article>
                `)
                .join("")}

        </div>
    `;
}

/* =========================================================
   SAVED VIEW
   ========================================================= */

function renderSaved() {
    const container =
        $("#savedView") ||
        $("#saved");

    if (!container) {
        return;
    }

    container.innerHTML = `
        <section class="page-header">

            <span class="section-kicker">
                ⭐ SAVED
            </span>

            <h1>
                Your saved stories
            </h1>

            <p>
                Stories you don't want to lose.
            </p>

        </section>

        ${
            state.savedArticles.length
                ? `
                    <div class="news-grid">
                        ${state.savedArticles
                            .map(article =>
                                articleCard(article)
                            )
                            .join("")}
                    </div>
                `
                : `
                    <div class="empty-state large-empty">

                        <div>⭐</div>

                        <h3>
                            Nothing saved yet
                        </h3>

                        <p>
                            Tap ☆ Save on any story
                            to keep it here.
                        </p>

                        <button
                            class="primary-btn"
                            data-view-target="flash"
                        >
                            Explore News
                        </button>

                    </div>
                `
        }
    `;
}

/* =========================================================
   RADAR VIEW
   ========================================================= */

function renderRadar() {
    const container =
        $("#radarView") ||
        $("#radar");

    if (!container) {
        return;
    }

    const categories = Object.keys(
        categoryInfo
    );

    container.innerHTML = `
        <section class="page-header">

            <span class="section-kicker">
                📡 RADAR
            </span>

            <h1>
                Control your news radar.
            </h1>

            <p>
                Mark topics you are not interested in.
                Those topics become your Blindspot Feed.
            </p>

        </section>

        <div class="radar-panel">

            <div class="radar-panel-header">

                <div>
                    <h2>
                        Your topic preferences
                    </h2>

                    <p>
                        Tap a category to toggle
                        "Not interested".
                    </p>
                </div>

                <span class="radar-count">
                    ${
                        state.notInterestedCategories.length
                    }
                    not interested
                </span>

            </div>

            <div class="category-chips">

                ${categories
                    .map(category => {

                        const active =
                            state.notInterestedCategories.includes(
                                category
                            );

                        return `
                            <button
                                class="category-chip ${
                                    active
                                        ? "not-interested"
                                        : ""
                                }"
                                data-category-toggle="${escapeHTML(
                                    category
                                )}"
                            >
                                ${getCategoryEmoji(
                                    category
                                )}
                                ${escapeHTML(
                                    getCategoryName(
                                        category
                                    )
                                )}

                                ${
                                    active
                                        ? " ✕"
                                        : ""
                                }
                            </button>
                        `;
                    })
                    .join("")}

            </div>

            <div class="blindspot-preview">

                <div>
                    <strong>
                        👀 Blindspot Feed
                    </strong>

                    <p>
                        ${
                            state.notInterestedCategories.length
                        }
                        topics are currently marked
                        as not interested.
                    </p>
                </div>

                <button
                    class="primary-btn"
                    data-view-target="blindspot"
                >
                    Open Blindspot Feed →
                </button>

            </div>

        </div>
    `;
}

/* =========================================================
   SWIPING VIEW
   ========================================================= */

function renderSwiping() {
    const container =
        $("#swipingView") ||
        $("#swiping");

    if (!container) {
        return;
    }

    if (!state.articles.length) {
        container.innerHTML = `
            <section class="page-header">
                <span class="section-kicker">
                    👆 SWIPING
                </span>

                <h1>
                    Swipe through the pulse.
                </h1>
            </section>

            <div class="empty-state">
                Loading stories...
            </div>
        `;

        return;
    }

    if (
        state.swipeIndex >=
        state.articles.length
    ) {
        state.swipeIndex = 0;
    }

    const current =
        state.articles[state.swipeIndex];

    const next =
        state.articles[
            (state.swipeIndex + 1) %
                state.articles.length
        ];

    const previous =
        state.articles[
            (state.swipeIndex -
                1 +
                state.articles.length) %
                state.articles.length
        ];

    container.innerHTML = `
        <section class="page-header swipe-page-header">

            <div>
                <span class="section-kicker">
                    👆 SWIPING
                </span>

                <h1>
                    Your news, one swipe at a time.
                </h1>

                <p>
                    Swipe right for the next story.
                    Swipe left to move past it.
                </p>
            </div>

            <div class="swipe-counter">
                ${
                    state.swipeIndex + 1
                }
                /
                ${state.articles.length}
            </div>

        </section>

        <div class="swipe-instructions">
            <span>← Pass</span>
            <strong>Drag the card</strong>
            <span>Next →</span>
        </div>

        <div
            class="swipe-stage"
            id="swipeStage"
        >

            <div class="swipe-card swipe-card-back">
                <div class="swipe-card-placeholder">
                    ${getCategoryEmoji(
                        previous.category
                    )}
                </div>
            </div>

            <div class="swipe-card swipe-card-next">
                <div class="swipe-card-placeholder">
                    ${getCategoryEmoji(
                        next.category
                    )}
                </div>
            </div>

            <article
                class="swipe-card swipe-card-active"
                id="activeSwipeCard"
                data-swipe-id="${escapeHTML(
                    current.id
                )}"
            >

                <div class="swipe-image">
                    ${articleImage(current)}
                </div>

                <div class="swipe-content">

                    <div class="news-meta">

                        <span>
                            ${getCategoryEmoji(
                                current.category
                            )}
                            ${escapeHTML(
                                getCategoryName(
                                    current.category
                                )
                            )}
                        </span>

                        <span>
                            ${escapeHTML(
                                current.source
                            )}
                        </span>

                        <span>
                            ${timeAgo(
                                current.publishedAt
                            )}
                        </span>

                    </div>

                    <h2>
                        ${escapeHTML(
                            current.title
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            current.description
                        )}
                    </p>

                    <div class="swipe-actions">

                        <button
                            class="action-btn ai-btn"
                            data-action="summary"
                            data-id="${escapeHTML(
                                current.id
                            )}"
                        >
                            🤖 AI Generated Summary
                        </button>

                        <button
                            class="action-btn explain-btn"
                            data-action="explain"
                            data-id="${escapeHTML(
                                current.id
                            )}"
                        >
                            🤖 Gen Z Explain
                        </button>

                        <button
                            class="action-btn read-btn"
                            data-action="read"
                            data-id="${escapeHTML(
                                current.id
                            )}"
                        >
                            📰 Read Full Article
                        </button>

                    </div>

                    <div class="swipe-bottom-actions">

                        <button
                            class="round-action"
                            data-swipe-action="previous"
                            aria-label="Previous story"
                        >
                            ↶
                        </button>

                        <button
                            class="round-action not-interested-action"
                            data-swipe-action="not-interested"
                            aria-label="Not interested"
                        >
                            ✕
                        </button>

                        <button
                            class="round-action save-round ${
                                isSaved(
                                    current.id
                                )
                                    ? "active"
                                    : ""
                            }"
                            data-action="save"
                            data-id="${escapeHTML(
                                current.id
                            )}"
                            aria-label="Save story"
                        >
                            ⭐
                        </button>

                        <button
                            class="round-action"
                            data-swipe-action="next"
                            aria-label="Next story"
                        >
                            →
                        </button>

                    </div>

                </div>

            </article>

        </div>

        <div class="swipe-hint">
            💡 Tip: You can also use the buttons
            below the card.
        </div>
    `;

    setupSwipeGestures();
}

/* =========================================================
   BLINDSPOT VIEW
   ========================================================= */

function getBlindspotArticles() {
    const categories =
        state.notInterestedCategories;

    const apiBlindspots =
        state.blindspotArticles.filter(
            article =>
                categories.includes(
                    article.category
                )
        );

    if (apiBlindspots.length > 0) {
        return apiBlindspots;
    }

    const fallbackMatching =
        fallbackBlindspotArticles.filter(
            article =>
                categories.includes(
                    article.category
                )
        );

    if (fallbackMatching.length > 0) {
        return fallbackMatching;
    }

    return state.blindspotArticles.length
        ? state.blindspotArticles
        : fallbackBlindspotArticles;
}

function renderBlindspot() {
    const container =
        $("#blindspotView") ||
        $("#blindspot");

    if (!container) {
        return;
    }

    const articles =
        getBlindspotArticles();

    container.innerHTML = `
        <section class="page-header blindspot-header">

            <div>

                <span class="section-kicker">
                    👀 BLINDSPOT FEED
                </span>

                <h1>
                    Stuff outside your usual bubble.
                </h1>

                <p>
                    This feed intentionally surfaces
                    topics you've marked as
                    <strong>not interested</strong>.
                </p>

            </div>

            <div class="blindspot-count">
                ${articles.length}
                stories
            </div>

        </section>

        <div class="blindspot-category-bar">

            <span>
                Your blindspot topics:
            </span>

            ${state.notInterestedCategories
                .map(
                    category => `
                        <span class="blindspot-tag">
                            ${getCategoryEmoji(
                                category
                            )}
                            ${escapeHTML(
                                getCategoryName(
                                    category
                                )
                            )}
                        </span>
                    `
                )
                .join("")}

        </div>

        ${
            articles.length
                ? `
                    <div class="news-grid">
                        ${articles
                            .map(article =>
                                articleCard(
                                    article
                                )
                            )
                            .join("")}
                    </div>
                `
                : `
                    <div class="empty-state">

                        <div>👀</div>

                        <h3>
                            Your blindspot is empty
                        </h3>

                        <p>
                            Go to Radar and mark
                            some topics as
                            "Not interested".
                        </p>

                        <button
                            class="primary-btn"
                            data-view-target="radar"
                        >
                            Open Radar
                        </button>

                    </div>
                `
        }
    `;
}

/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAllRelevantViews() {
    renderHome();
    renderGenZ();
    renderFlash();
    renderExplain();
    renderOpportunities();
    renderSaved();
    renderRadar();
    renderSwiping();
    renderBlindspot();

    updateSavedButtons();
}

/* =========================================================
   UPDATE SAVE BUTTONS
   ========================================================= */

function updateSavedButtons() {
    $$("[data-action='save']").forEach(button => {
        const id =
            button.getAttribute("data-id");

        const saved = isSaved(id);

        if (
            button.classList.contains(
                "save-btn"
            )
        ) {
            button.classList.toggle(
                "saved",
                saved
            );

            button.textContent = saved
                ? "⭐ Saved"
                : "☆ Save";
        }

        if (
            button.classList.contains(
                "save-round"
            )
        ) {
            button.classList.toggle(
                "active",
                saved
            );
        }
    });
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {
    document.addEventListener(
        "click",
        event => {

            const target =
                event.target.closest(
                    "[data-view-target]"
                );

            if (!target) {
                return;
            }

            const view =
                target.getAttribute(
                    "data-view-target"
                );

            if (!view) {
                return;
            }

            event.preventDefault();

            showView(view);
        }
    );

    $$("[data-view]").forEach(button => {
        button.addEventListener(
            "click",
            () => {
                const view =
                    button.getAttribute(
                        "data-view"
                    );

                showView(view);
            }
        );
    });
}

function findViewElement(viewName) {
    const possibilities = [
        `#${viewName}View`,
        `#${viewName}`
    ];

    for (const selector of possibilities) {
        const element = $(selector);

        if (element) {
            return element;
        }
    }

    return null;
}

function showView(viewName) {
    if (!viewName) {
        return;
    }

    state.currentView = viewName;

    const allViews = [
        "home",
        "genz",
        "flash",
        "explain",
        "opportunities",
        "saved",
        "radar",
        "swiping",
        "blindspot"
    ];

    allViews.forEach(name => {
        const element =
            findViewElement(name);

        if (element) {
            element.classList.toggle(
                "active",
                name === viewName
            );

            element.hidden =
                name !== viewName;
        }
    });

    $$("[data-view]").forEach(button => {
        button.classList.toggle(
            "active",
            button.getAttribute(
                "data-view"
            ) === viewName
        );
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (viewName === "swiping") {
        renderSwiping();
    }

    if (viewName === "blindspot") {
        renderBlindspot();
    }

    if (viewName === "radar") {
        renderRadar();
    }

    if (viewName === "saved") {
        renderSaved();
    }
}

/* =========================================================
   ARTICLE ACTIONS
   ========================================================= */

function setupArticleActions() {
    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );

            if (!button) {
                return;
            }

            const action =
                button.getAttribute(
                    "data-action"
                );

            const id =
                button.getAttribute(
                    "data-id"
                );

            if (action === "save") {
                event.preventDefault();

                const article =
                    findArticle(id);

                toggleSave(article);

                return;
            }

            if (action === "read") {
                event.preventDefault();

                const article =
                    findArticle(id);

                openFullArticle(article);

                return;
            }

            if (action === "summary") {
                event.preventDefault();

                const article =
                    findArticle(id);

                openAIResult(
                    article,
                    "summary"
                );

                return;
            }

            if (action === "explain") {
                event.preventDefault();

                const article =
                    findArticle(id);

                openAIResult(
                    article,
                    "explain"
                );

                return;
            }

            if (
                action === "select-explain"
            ) {
                event.preventDefault();

                const article =
                    findArticle(id);

                state.selectedArticle =
                    article;

                showView("explain");

                renderExplain();

                return;
            }
        }
    );
}

/* =========================================================
   READ ARTICLE
   ========================================================= */

function openFullArticle(article) {
    if (!article) {
        showToast(
            "Article could not be found."
        );

        return;
    }

    if (!article.url) {
        showToast(
            "This article does not have a valid link."
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
   AI SUMMARY / EXPLAIN
   ========================================================= */

async function requestAI(endpoint, article) {
    try {
        const response = await fetch(
            endpoint,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    title: article.title,
                    description:
                        article.description,
                    content: article.content,
                    url: article.url
                })
            }
        );

        if (!response.ok) {
            return null;
        }

        const payload =
            await response.json();

        return (
            payload.summary ||
            payload.explanation ||
            payload.result ||
            payload.message ||
            null
        );
    } catch (error) {
        console.warn(
            "Optional AI endpoint unavailable:",
            endpoint
        );

        return null;
    }
}

function localSummary(article) {
    if (!article) {
        return "No summary available.";
    }

    const text =
        article.content ||
        article.description ||
        "";

    const sentences =
        text
            .split(/(?<=[.!?])\s+/)
            .filter(Boolean);

    if (sentences.length >= 2) {
        return sentences
            .slice(0, 2)
            .join(" ");
    }

    if (text.length > 260) {
        return `${text.slice(0, 257)}...`;
    }

    return (
        text ||
        "This article contains information relevant to the current Gen G Pulse feed."
    );
}

function localGenZExplain(article) {
    if (!article) {
        return "No explanation available.";
    }

    const category =
        getCategoryName(
            article.category
        );

    return `
        <strong>What's happening?</strong><br>
        ${escapeHTML(
            localSummary(article)
        )}
        <br><br>

        <strong>Why should Gen Z care?</strong><br>
        This story is connected to
        <strong>${escapeHTML(
            category
        )}</strong>
        and could affect how people study,
        work, spend, create, communicate or
        use technology.
        <br><br>

        <strong>In simple words:</strong><br>
        The headline gives you the big picture.
        Read the full article for the complete
        context before making decisions based
        on it.
    `;
}

async function openAIResult(
    article,
    type
) {
    if (!article) {
        showToast(
            "Article could not be found."
        );

        return;
    }

    const title =
        type === "summary"
            ? "🤖 AI Generated Summary"
            : "🤖 Gen Z Explain";

    const modal = createModal(
        title,
        `
            <div class="ai-loading">
                <div class="loading-spinner"></div>
                <p>
                    Preparing your
                    ${type === "summary"
                        ? "summary"
                        : "Gen Z explanation"}...
                </p>
            </div>
        `
    );

    let result = null;

    if (type === "summary") {
        result = await requestAI(
            `${API_BASE}/api/ai-summary`,
            article
        );

        if (!result) {
            result = localSummary(
                article
            );
        }
    } else {
        result = await requestAI(
            `${API_BASE}/api/ai-explain`,
            article
        );

        if (!result) {
            result =
                localGenZExplain(
                    article
                );
        }
    }

    if (!modal) {
        return;
    }

    const content =
        modal.querySelector(
            ".modal-content-area"
        );

    if (!content) {
        return;
    }

    content.innerHTML = `
        <div class="ai-result">

            <div class="ai-result-label">
                ${title}
            </div>

            <h3>
                ${escapeHTML(
                    article.title
                )}
            </h3>

            <div class="ai-result-text">
                ${
                    type === "summary"
                        ? escapeHTML(
                              result
                          ).replace(
                              /\n/g,
                              "<br>"
                          )
                        : result
                }
            </div>

            <div class="ai-source-note">
                Source:
                ${escapeHTML(
                    article.source
                )}
                •
                ${timeAgo(
                    article.publishedAt
                )}
            </div>

            <div class="modal-actions">

                <button
                    class="primary-btn"
                    data-action="read"
                    data-id="${escapeHTML(
                        article.id
                    )}"
                >
                    📰 Read Full Article
                </button>

                <button
                    class="secondary-btn"
                    data-close-modal
                >
                    Close
                </button>

            </div>

        </div>
    `;
}

/* =========================================================
   MODAL
   ========================================================= */

function createModal(
    title,
    content
) {
    closeModal();

    const overlay =
        document.createElement("div");

    overlay.className =
        "modal-overlay";

    overlay.innerHTML = `
        <div
            class="modal"
            role="dialog"
            aria-modal="true"
        >

            <div class="modal-header">

                <h2>
                    ${escapeHTML(title)}
                </h2>

                <button
                    class="modal-close"
                    data-close-modal
                    aria-label="Close"
                >
                    ✕
                </button>

            </div>

            <div class="modal-content-area">
                ${content}
            </div>

        </div>
    `;

    document.body.appendChild(
        overlay
    );

    requestAnimationFrame(() => {
        overlay.classList.add(
            "visible"
        );
    });

    overlay.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                overlay
            ) {
                closeModal();
            }

            if (
                event.target.closest(
                    "[data-close-modal]"
                )
            ) {
                closeModal();
            }
        }
    );

    return overlay;
}

function closeModal() {
    const existing =
        $(".modal-overlay");

    if (existing) {
        existing.remove();
    }
}

document.addEventListener(
    "keydown",
    event => {
        if (event.key === "Escape") {
            closeModal();
        }
    }
);

/* =========================================================
   OPPORTUNITY BUTTONS
   ========================================================= */

function setupOpportunityActions() {
    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-opportunity-url]"
                );

            if (!button) {
                return;
            }

            const url =
                safeURL(
                    button.getAttribute(
                        "data-opportunity-url"
                    )
                );

            if (!url) {
                showToast(
                    "Opportunity link is unavailable."
                );

                return;
            }

            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );
        }
    );
}

/* =========================================================
   RADAR CATEGORY TOGGLE
   ========================================================= */

function setupRadarActions() {
    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-category-toggle]"
                );

            if (!button) {
                return;
            }

            const category =
                button.getAttribute(
                    "data-category-toggle"
                );

            if (!category) {
                return;
            }

            const index =
                state.notInterestedCategories.indexOf(
                    category
                );

            if (index >= 0) {
                state.notInterestedCategories.splice(
                    index,
                    1
                );

                showToast(
                    `${getCategoryName(
                        category
                    )} added back to your radar`
                );
            } else {
                state.notInterestedCategories.push(
                    category
                );

                showToast(
                    `${getCategoryName(
                        category
                    )} marked as not interested`
                );
            }

            saveStorage();

            renderRadar();
            renderBlindspot();
            renderHome();
        }
    );
}

/* =========================================================
   SWIPE GESTURES
   ========================================================= */

function setupSwipeGestures() {
    const card =
        $("#activeSwipeCard");

    if (!card) {
        return;
    }

    card.addEventListener(
        "pointerdown",
        swipePointerDown
    );

    card.addEventListener(
        "pointermove",
        swipePointerMove
    );

    card.addEventListener(
        "pointerup",
        swipePointerUp
    );

    card.addEventListener(
        "pointercancel",
        swipePointerCancel
    );

    card.addEventListener(
        "pointerleave",
        event => {
            if (
                state.swipeDragging &&
                event.pointerType === "mouse"
            ) {
                swipePointerUp(event);
            }
        }
    );

    card.addEventListener(
        "dragstart",
        event => {
            event.preventDefault();
        }
    );

    document
        .querySelectorAll(
            "[data-swipe-action]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.getAttribute(
                            "data-swipe-action"
                        );

                    if (
                        action === "next"
                    ) {
                        nextSwipe();
                    }

                    if (
                        action === "previous"
                    ) {
                        previousSwipe();
                    }

                    if (
                        action ===
                        "not-interested"
                    ) {
                        markCurrentNotInterested();
                    }
                }
            );
        });
}

function swipePointerDown(event) {
    if (
        event.target.closest(
            "button"
        )
    ) {
        return;
    }

    state.swipeDragging = true;

    state.swipeStartX =
        event.clientX;

    state.swipeCurrentX =
        event.clientX;

    this.setPointerCapture(
        event.pointerId
    );

    this.classList.add(
        "is-dragging"
    );
}

function swipePointerMove(event) {
    if (
        !state.swipeDragging
    ) {
        return;
    }

    state.swipeCurrentX =
        event.clientX;

    const delta =
        state.swipeCurrentX -
        state.swipeStartX;

    const rotation =
        delta * 0.04;

    this.style.transform =
        `translateX(${delta}px) rotate(${rotation}deg)`;

    this.style.opacity = String(
        Math.max(
            0.65,
            1 -
                Math.abs(delta) /
                    500
        )
    );
}

function swipePointerUp(event) {
    if (
        !state.swipeDragging
    ) {
        return;
    }

    state.swipeDragging = false;

    const delta =
        state.swipeCurrentX -
        state.swipeStartX;

    this.classList.remove(
        "is-dragging"
    );

    if (Math.abs(delta) > 100) {

        if (delta < 0) {
            animateSwipeOut(
                this,
                "left",
                () => nextSwipe()
            );
        } else {
            animateSwipeOut(
                this,
                "right",
                () => previousSwipe()
            );
        }

        return;
    }

    this.style.transform = "";
    this.style.opacity = "";
}

function swipePointerCancel(event) {
    state.swipeDragging = false;

    const card = event.currentTarget;

    card.classList.remove(
        "is-dragging"
    );

    card.style.transform = "";
    card.style.opacity = "";
}

function animateSwipeOut(
    card,
    direction,
    callback
) {
    const distance =
        direction === "left"
            ? -window.innerWidth
            : window.innerWidth;

    card.style.transition =
        "transform .3s ease, opacity .3s ease";

    card.style.transform =
        `translateX(${distance}px) rotate(${
            direction === "left"
                ? -25
                : 25
        }deg)`;

    card.style.opacity = "0";

    setTimeout(() => {
        callback();
    }, 300);
}

function nextSwipe() {
    if (!state.articles.length) {
        return;
    }

    state.swipeIndex =
        (state.swipeIndex + 1) %
        state.articles.length;

    renderSwiping();
}

function previousSwipe() {
    if (!state.articles.length) {
        return;
    }

    state.swipeIndex =
        (state.swipeIndex -
            1 +
            state.articles.length) %
        state.articles.length;

    renderSwiping();
}

function markCurrentNotInterested() {
    const article =
        state.articles[
            state.swipeIndex
        ];

    if (!article) {
        return;
    }

    if (
        !state.notInterestedCategories.includes(
            article.category
        )
    ) {
        state.notInterestedCategories.push(
            article.category
        );

        saveStorage();

        showToast(
            `${getCategoryName(
                article.category
            )} added to Blindspot Feed`
        );
    } else {
        showToast(
            "This topic is already in your Blindspot Feed"
        );
    }

    nextSwipe();
}

/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {
    let toast =
        $(".gen-g-toast");

    if (!toast) {
        toast =
            document.createElement(
                "div"
            );

        toast.className =
            "gen-g-toast";

        document.body.appendChild(
            toast
        );
    }

    toast.textContent = message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toast._hideTimer
    );

    toast._hideTimer =
        setTimeout(() => {
            toast.classList.remove(
                "show"
            );
        }, 2600);
}

/* =========================================================
   REFRESH BUTTON
   ========================================================= */

function setupRefreshButton() {
    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "#refreshNewsBtn"
                );

            if (!button) {
                return;
            }

            button.disabled = true;

            button.textContent =
                "↻ Loading...";

            loadNews().finally(() => {
                button.disabled =
                    false;

                button.textContent =
                    "↻ Refresh News";
            });
        }
    );
}

/* =========================================================
   CLOSE EXPLAIN SELECTION
   ========================================================= */

function setupExplainActions() {
    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "#closeSelectedExplain"
                );

            if (!button) {
                return;
            }

            state.selectedArticle =
                null;

            renderExplain();
        }
    );
}

/* =========================================================
   INIT
   ========================================================= */

async function init() {
    console.log(
        "Gen G Pulse frontend starting..."
    );

    loadStorage();

    setupNavigation();

    setupArticleActions();

    setupOpportunityActions();

    setupRadarActions();

    setupRefreshButton();

    setupExplainActions();

    renderAllRelevantViews();

    await Promise.allSettled([
        loadNews(),
        loadBlindspotNews()
    ]);

    renderAllRelevantViews();

    console.log(
        "Gen G Pulse frontend ready."
    );
}

/* =========================================================
   START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        init
    );
} else {
    init();
}