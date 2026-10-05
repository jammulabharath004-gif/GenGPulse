// =====================================================
// GEN Z PULSE - FRONTEND
// =====================================================

const API_BASE =
    "https://gengpulse-1.onrender.com";

const CURRENT_USER_KEY =
    "genZPulseUser";

const OLD_USER_KEY =
    "genGPulseUser";

let items = [];

let filter =
    "All";

let saved = [];

let currentNewsIndex =
    null;

let currentUser =
    null;

let selectedInterests = [];


// =====================================================
// LOAD SAVED USER
// =====================================================

function loadSavedUser() {

    try {

        const newUser =
            localStorage.getItem(
                CURRENT_USER_KEY
            );

        const oldUser =
            localStorage.getItem(
                OLD_USER_KEY
            );

        currentUser =
            JSON.parse(
                newUser ||
                oldUser ||
                "null"
            );

        if (
            currentUser &&
            !newUser
        ) {

            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(
                    currentUser
                )
            );
        }

        selectedInterests =
            Array.isArray(
                currentUser?.interests
            )
                ? currentUser.interests
                : [];

    } catch (error) {

        console.error(
            "Could not load saved user:",
            error
        );

        currentUser =
            null;

        selectedInterests =
            [];
    }
}


loadSavedUser();


// =====================================================
// SAVE CURRENT USER
// =====================================================

function saveCurrentUser(
    user
) {

    currentUser =
        user;

    selectedInterests =
        Array.isArray(
            user?.interests
        )
            ? user.interests
            : [];

    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(
            user
        )
    );

    localStorage.setItem(
        "genZPulseInterests",
        JSON.stringify(
            selectedInterests
        )
    );

    updateAccountUI();

    updateInterestSummary();
}


// =====================================================
// CLEAR CURRENT USER
// =====================================================

function clearCurrentUser() {

    currentUser =
        null;

    selectedInterests =
        [];

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

    localStorage.removeItem(
        OLD_USER_KEY
    );

    localStorage.removeItem(
        "genZPulseInterests"
    );

    updateAccountUI();

    updateInterestSummary();
}


// =====================================================
// UPDATE ACCOUNT UI
// =====================================================

function updateAccountUI() {

    const profileButtons =
        document.querySelectorAll(
            ".profile"
        );

    if (
        !profileButtons.length
    ) {
        return;
    }

    if (
        currentUser
    ) {

        if (
            profileButtons[0]
        ) {

            profileButtons[0]
                .textContent =
                currentUser.name ||
                "Account";

            profileButtons[0]
                .onclick =
                () =>
                    showModal(
                        "profile"
                    );
        }

    } else {

        if (
            profileButtons[0]
        ) {

            profileButtons[0]
                .textContent =
                "Sign in";

            profileButtons[0]
                .onclick =
                () =>
                    showAccount(
                        "signin"
                    );
        }
    }
}


// =====================================================
// NEWS CATEGORY
// =====================================================

function getCategory(
    article
) {

    const text =
        `
            ${article.title || ""}
            ${article.description || ""}
            ${article.content || ""}
        `
            .toLowerCase();

    if (
        text.includes(
            "technology"
        ) ||
        text.includes(
            "tech"
        ) ||
        text.includes(
            "ai "
        ) ||
        text.includes(
            "artificial intelligence"
        ) ||
        text.includes(
            "software"
        ) ||
        text.includes(
            "digital"
        ) ||
        text.includes(
            "startup"
        )
    ) {

        return "Tech";
    }

    if (
        text.includes(
            "job"
        ) ||
        text.includes(
            "career"
        ) ||
        text.includes(
            "internship"
        ) ||
        text.includes(
            "employment"
        )
    ) {

        return "Career";
    }

    if (
        text.includes(
            "education"
        ) ||
        text.includes(
            "student"
        ) ||
        text.includes(
            "college"
        ) ||
        text.includes(
            "university"
        ) ||
        text.includes(
            "school"
        ) ||
        text.includes(
            "scholarship"
        )
    ) {

        return "Education";
    }

    return "India";
}


// =====================================================
// FORMAT NEWS TIME
// =====================================================

function formatNewsTime(
    dateString
) {

    if (
        !dateString
    ) {

        return "Recently";
    }

    const date =
        new Date(
            dateString
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Recently";
    }

    const now =
        new Date();

    const diffMinutes =
        Math.max(
            0,
            Math.floor(
                (
                    now -
                    date
                ) /
                60000
            )
        );

    if (
        diffMinutes <
        1
    ) {

        return "Just now";
    }

    if (
        diffMinutes <
        60
    ) {

        return `${diffMinutes} min ago`;
    }

    const diffHours =
        Math.floor(
            diffMinutes /
            60
        );

    if (
        diffHours <
        24
    ) {

        return `${diffHours} hr${
            diffHours > 1
                ? "s"
                : ""
        } ago`;
    }

    const diffDays =
        Math.floor(
            diffHours /
            24
        );

    return `${diffDays} day${
        diffDays > 1
            ? "s"
            : ""
    } ago`;
}


// =====================================================
// LOAD REAL NEWS
// =====================================================

async function loadNews(
    query = "India technology"
) {

    const cards =
        document.getElementById(
            "flashCards"
        );

    const empty =
        document.getElementById(
            "empty"
        );

    if (
        !cards
    ) {
        return;
    }

    cards.innerHTML = `
        <div class="card">
            <h3>
                Loading today's news...
            </h3>

            <p>
                Please wait while
                Gen Z Pulse loads
                the latest news.
            </p>
        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE}/api/news?q=${encodeURIComponent(
                    query
                )}`
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Failed to load news."
            );
        }

        items =
            (data.articles || [])
                .map(
                    article => ({

                        cat:
                            getCategory(
                                article
                            ),

                        tag:
                            article
                                .source
                                ?.name ||
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
                            article
                                .source
                                ?.name ||
                            "Unknown source",

                        image:
                            article.image ||
                            ""
                    })
                );

        renderFlash();

        updateInterestSummary();

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
                    Gen Z Pulse could not
                    load the latest news.
                </p>

                <button
                    class="action"
                    onclick="loadNews('India technology')"
                >
                    Try again
                </button>

            </div>
        `;

        if (
            empty
        ) {

            empty.style.display =
                "none";
        }
    }
}


// =====================================================
// TODAY'S PULSE SEARCH
// =====================================================

async function searchToday() {

    const searchInput =
        document.getElementById(
            "search"
        );

    const cards =
        document.getElementById(
            "flashCards"
        );

    const empty =
        document.getElementById(
            "empty"
        );

    if (
        !searchInput ||
        !cards
    ) {

        return;
    }

    const query =
        searchInput.value
            .trim();

    if (
        !query
    ) {

        toast(
            "Type something to search today's pulse."
        );

        return;
    }

    cards.innerHTML = `
        <div class="card">

            <span class="tag">
                SEARCHING
            </span>

            <h3>
                Searching today's pulse...
            </h3>

            <p>
                Finding fresh news for
                "${escapeHtml(query)}"
            </p>

        </div>
    `;

    if (
        empty
    ) {

        empty.style.display =
            "none";
    }

    try {

        const response =
            await fetch(
                `${API_BASE}/api/news?q=${encodeURIComponent(
                    query
                )}`
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Search failed."
            );
        }

        items =
            (data.articles || [])
                .map(
                    article => ({

                        cat:
                            getCategory(
                                article
                            ),

                        tag:
                            article
                                .source
                                ?.name ||
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
                            article
                                .source
                                ?.name ||
                            "Unknown source",

                        image:
                            article.image ||
                            ""
                    })
                );

        filter =
            "All";

        document
            .querySelectorAll(
                "#flash .filter"
            )
            .forEach(
                button =>
                    button.classList
                        .remove(
                            "active"
                        )
            );

        document
            .querySelector(
                "#flash .filter"
            )
            ?.classList.add(
                "active"
            );

        renderFlash();

        toast(
            `${items.length} fresh results found`
        );

    } catch (error) {

        console.error(
            "Today's pulse search error:",
            error
        );

        cards.innerHTML = `
            <div class="card">

                <span class="tag">
                    SEARCH ERROR
                </span>

                <h3>
                    Today's pulse search
                    is temporarily unavailable.
                </h3>

                <p>
                    Please try again in
                    a moment.
                </p>

                <button
                    class="action"
                    onclick="searchToday()"
                >
                    Try again
                </button>

            </div>
        `;

        if (
            empty
        ) {

            empty.style.display =
                "none";
        }
    }
}


// =====================================================
// FILTER
// =====================================================

function setFilter(
    value,
    element
) {

    filter =
        value;

    document
        .querySelectorAll(
            "#flash .filter"
        )
        .forEach(
            button =>
                button.classList
                    .remove(
                        "active"
                    )
        );

    if (
        element
    ) {

        element.classList.add(
            "active"
        );
    }

    renderFlash();
}


// =====================================================
// INTEREST MATCHING
// =====================================================

function interestScore(
    item
) {

    const text =
        `
            ${item.title}
            ${item.text}
            ${item.tag}
            ${item.source}
            ${item.cat}
        `
            .toLowerCase();

    let score =
        0;

    selectedInterests
        .forEach(
            interest => {

                const value =
                    String(
                        interest
                    )
                        .toLowerCase();

                if (
                    text.includes(
                        value
                    )
                ) {

                    score +=
                        10;
                }

                if (
                    value ===
                    "technology" &&
                    item.cat ===
                    "Tech"
                ) {

                    score +=
                        15;
                }

                if (
                    value ===
                    "career" &&
                    item.cat ===
                    "Career"
                ) {

                    score +=
                        15;
                }

                if (
                    value ===
                    "education" &&
                    item.cat ===
                    "Education"
                ) {

                    score +=
                        15;
                }

            }
        );

    return score;
}


// =====================================================
// RENDER NEWS CARDS
// =====================================================

function renderFlash() {

    const searchBox =
        document.getElementById(
            "search"
        );

    const cards =
        document.getElementById(
            "flashCards"
        );

    const empty =
        document.getElementById(
            "empty"
        );

    if (
        !cards
    ) {

        return;
    }

    const query =
        searchBox
            ? searchBox.value
                .toLowerCase()
                .trim()
            : "";

    const list =
        items
            .filter(
                item => {

                    const matchesFilter =
                        filter ===
                            "All" ||
                        item.cat ===
                            filter;

                    const searchableText =
                        `
                            ${item.title}
                            ${item.text}
                            ${item.tag}
                            ${item.source}
                            ${item.cat}
                        `
                            .toLowerCase();

                    const matchesSearch =
                        searchableText.includes(
                            query
                        );

                    return (
                        matchesFilter &&
                        matchesSearch
                    );
                }
            )
            .sort(
                (a, b) =>
                    interestScore(
                        b
                    ) -
                    interestScore(
                        a
                    )
            );

    if (
        list.length ===
        0
    ) {

        cards.innerHTML =
            "";

        if (
            empty
        ) {

            empty.style.display =
                "block";
        }

        return;
    }

    if (
        empty
    ) {

        empty.style.display =
            "none";
    }

    cards.innerHTML =
        list
            .map(
                item => {

                    const originalIndex =
                        items.indexOf(
                            item
                        );

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
                }
            )
            .join("");
}


// =====================================================
// NEWS MODAL
// =====================================================

function showNews(
    index
) {

    const item =
        items[index];

    if (
        !item
    ) {

        return;
    }

    currentNewsIndex =
        index;

    const content =
        document.getElementById(
            "modalContent"
        );

    const modal =
        document.getElementById(
            "modal"
        );

    if (
        !content ||
        !modal
    ) {

        return;
    }

    content.innerHTML = `

        <span class="tag">
            ${escapeHtml(
                item.tag
            )}
            ·
            ${escapeHtml(
                item.cat
            )}
        </span>

        <h2>
            ${escapeHtml(
                item.title
            )}
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

            ${escapeHtml(
                item.source
            )}

            <br>

            <strong>
                Published:
            </strong>

            ${escapeHtml(
                item.time
            )}

        </div>

        <div
            style="margin-top:20px"
        >

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

    modal.classList.add(
        "show"
    );
}


// =====================================================
// OPEN ORIGINAL ARTICLE
// =====================================================

function openFullArticle(
    index
) {

    const item =
        items[index];

    if (
        !item ||
        !item.url
    ) {

        toast(
            "Original article unavailable."
        );

        return;
    }

    window.open(
        item.url,
        "_blank",
        "noopener,noreferrer"
    );
}


// =====================================================
// GEMINI AI SUMMARY
// =====================================================

async function generateAISummary(
    index
) {

    const item =
        items[index];

    const summaryBox =
        document.getElementById(
            "aiSummary"
        );

    if (
        !item ||
        !summaryBox
    ) {

        return;
    }

    summaryBox.innerHTML = `

        <div class="ai-summary-block">

            <h3>
                🤖 AI Generated Summary
            </h3>

            <p>
                Gemini is analyzing
                this article...
            </p>

        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE}/api/analyze-news`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
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

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "AI analysis failed."
            );
        }

        summaryBox.innerHTML =
            formatAIResponse(
                data.analysis ||
                data.aiResponse ||
                "",
                "🤖 AI Generated Summary"
            );

    } catch (
        error
    ) {

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
                    Gemini could not
                    analyze this article
                    right now.
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


// =====================================================
// GEN Z EXPLAIN
// =====================================================

async function generateAIExplain(
    index
) {

    const item =
        items[index];

    const explainBox =
        document.getElementById(
            "aiExplain"
        );

    if (
        !item ||
        !explainBox
    ) {

        return;
    }

    explainBox.innerHTML = `

        <div class="ai-summary-block">

            <h3>
                🤖 Gen Z Explain
            </h3>

            <p>
                Gemini is explaining
                this news in simple
                language...
            </p>

        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE}/api/analyze-news`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
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

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "AI explanation failed."
            );
        }

        explainBox.innerHTML =
            formatAIResponse(
                data.analysis ||
                data.aiResponse ||
                "",
                "🤖 Gen Z Explain"
            );

    } catch (
        error
    ) {

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
                    Gemini could not
                    explain this article
                    right now.
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


// =====================================================
// FORMAT AI RESPONSE
// =====================================================

function formatAIResponse(
    text,
    heading =
        "🤖 AI Generated Summary"
) {

    if (
        !text
    ) {

        return `

            <div class="ai-summary-block">

                <h3>
                    ${heading}
                </h3>

                <p>
                    No AI response
                    was returned.
                </p>

            </div>
        `;
    }

    const cleaned =
        text
            .replace(
                /\r/g,
                ""
            )
            .trim();

    const sections = {

        "WHAT HAPPENED?":
            "",

        "WHY DOES IT MATTER?":
            "",

        "KEY POINTS:":
            "",

        "WHAT SHOULD YOU KNOW?":
            ""
    };

    const headings =
        Object.keys(
            sections
        );

    let currentHeading =
        null;

    const lines =
        cleaned.split(
            "\n"
        );

    for (
        let line of lines
    ) {

        line =
            line.trim();

        if (
            !line
        ) {

            continue;
        }

        const detectedHeading =
            headings.find(
                item =>
                    line
                        .toUpperCase() ===
                    item
            );

        if (
            detectedHeading
        ) {

            currentHeading =
                detectedHeading;

            continue;
        }

        if (
            currentHeading
        ) {

            sections[
                currentHeading
            ] +=
                (
                    sections[
                        currentHeading
                    ]
                        ? "\n"
                        : ""
                ) +
                line;
        }
    }

    let html = `

        <div class="ai-summary-block">

            <h3>
                ${escapeHtml(
                    heading
                )}
            </h3>

        </div>
    `;

    if (
        sections[
            "WHAT HAPPENED?"
        ]
    ) {

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
        sections[
            "WHY DOES IT MATTER?"
        ]
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

    if (
        sections[
            "KEY POINTS:"
        ]
    ) {

        const points =
            sections[
                "KEY POINTS:"
            ]
                .split(
                    "\n"
                )
                .map(
                    point =>
                        point
                            .replace(
                                /^[*\-•]\s*/,
                                ""
                            )
                            .trim()
                )
                .filter(
                    Boolean
                );

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
                            point =>
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


// =====================================================
// TEXT FORMAT
// =====================================================

function formatText(
    text
) {

    return escapeHtml(
        text
    )
        .replace(
            /\n/g,
            "<br>"
        );
}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
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


// =====================================================
// ACCOUNT MODAL
// =====================================================

function showAccount(
    type
) {

    const content =
        document.getElementById(
            "modalContent"
        );

    const modal =
        document.getElementById(
            "modal"
        );

    if (
        !content ||
        !modal
    ) {

        return;
    }


    // =================================================
    // SIGN IN
    // =================================================

    if (
        type ===
        "signin"
    ) {

        content.innerHTML = `

            <span class="tag">
                Account
            </span>

            <h2>
                Sign in to Gen Z Pulse
            </h2>

            <p>
                Sign in to continue
                and choose the topics
                you care about.
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

    }


    // =================================================
    // SIGN UP
    // =================================================

    else if (
        type ===
        "signup"
    ) {

        content.innerHTML = `

            <span class="tag">
                Create Account
            </span>

            <h2>
                Join Gen Z Pulse
            </h2>

            <p>
                Create your account,
                then choose your
                favourite topics.
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
    }


    // =================================================
    // SUBSCRIBE
    // =================================================

    else if (
        type ===
        "subscribe"
    ) {

        content.innerHTML = `

            <span class="tag">
                Gen Z Pulse Plus
            </span>

            <h2>
                Choose your plan
            </h2>

            <p>
                Start with Free or upgrade
                to Plus for a more
                personalized Gen Z Pulse
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

    modal.classList.add(
        "show"
    );
}


// =====================================================
// SIGN UP
// =====================================================

async function signUpUser() {

    const name =
        document
            .getElementById(
                "signupName"
            )
            ?.value
            .trim();

    const email =
        document
            .getElementById(
                "signupEmail"
            )
            ?.value
            .trim();

    const password =
        document
            .getElementById(
                "signupPassword"
            )
            ?.value;

    if (
        !name ||
        !email ||
        !password
    ) {

        toast(
            "Please fill all fields."
        );

        return;
    }

    if (
        password.length <
        6
    ) {

        toast(
            "Password must be at least 6 characters."
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
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            name,
                            email,
                            password
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
                "Account creation failed."
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

        setTimeout(
            () => {

                openInterestPicker(
                    true
                );

            },
            350
        );

    } catch (
        error
    ) {

        console.error(
            "Sign up error:",
            error
        );

        toast(
            "Cannot connect to Gen Z Pulse server."
        );
    }
}


// =====================================================
// SIGN IN
// =====================================================

async function signInUser() {

    const email =
        document
            .getElementById(
                "signinEmail"
            )
            ?.value
            .trim();

    const password =
        document
            .getElementById(
                "signinPassword"
            )
            ?.value;

    if (
        !email ||
        !password
    ) {

        toast(
            "Please enter email and password."
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
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email,
                            password
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
                "Sign in failed."
            );

            return;
        }

        saveCurrentUser(
            data.user
        );

        closeModal();

        await loadUserInterests();

        toast(
            `Welcome back, ${
                data.user.name
            }!`
        );

        setTimeout(
            () => {

                openInterestPicker(
                    true
                );

            },
            350
        );

    } catch (
        error
    ) {

        console.error(
            "Sign in error:",
            error
        );

        toast(
            "Cannot connect to Gen Z Pulse server."
        );
    }
}


// =====================================================
// LOAD USER INTERESTS
// =====================================================

async function loadUserInterests() {

    if (
        !currentUser ||
        !currentUser.id
    ) {

        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE}/api/interests/${encodeURIComponent(
                    currentUser.id
                )}`
            );

        const data =
            await response.json();

        if (
            response.ok &&
            data.success &&
            Array.isArray(
                data.interests
            )
        ) {

            selectedInterests =
                data.interests;

            currentUser.interests =
                data.interests;

            localStorage.setItem(
                CURRENT_USER_KEY,
                JSON.stringify(
                    currentUser
                )
            );

            localStorage.setItem(
                "genZPulseInterests",
                JSON.stringify(
                    selectedInterests
                )
            );

            updateInterestSummary();

            renderFlash();
        }

    } catch (
        error
    ) {

        console.error(
            "Load interests error:",
            error
        );
    }
}


// =====================================================
// LOGOUT
// =====================================================

function logoutUser() {

    clearCurrentUser();

    closeModal();

    toast(
        "Signed out successfully."
    );
}


// =====================================================
// INTEREST OPTIONS
// =====================================================

const INTERESTS = [

    {
        id:
            "Technology",

        label:
            "Technology"
    },

    {
        id:
            "AI",

        label:
            "AI"
    },

    {
        id:
            "Education",

        label:
            "Education"
    },

    {
        id:
            "Career",

        label:
            "Career & Jobs"
    },

    {
        id:
            "Government",

        label:
            "Government"
    },

    {
        id:
            "Business",

        label:
            "Business"
    },

    {
        id:
            "Sports",

        label:
            "Sports"
    },

    {
        id:
            "Science",

        label:
            "Science"
    },

    {
        id:
            "Entertainment",

        label:
            "Entertainment"
    },

    {
        id:
            "Startups",

        label:
            "Startups"
    }
];


// =====================================================
// CREATE INTEREST MODAL
// =====================================================

function ensureInterestModal() {

    if (
        document.getElementById(
            "interestModal"
        )
    ) {

        return;
    }

    const buttons =
        INTERESTS
            .map(
                interest => `

                    <button
                        type="button"
                        class="filter interest-option"
                        data-interest="${interest.id}"
                        onclick="toggleInterest(this)"
                    >
                        ${interest.label}
                    </button>
                `
            )
            .join("");

    document.body.insertAdjacentHTML(
        "beforeend",
        `

        <div
            class="modal"
            id="interestModal"
        >

            <div
                class="modalBox"
            >

                <button
                    class="close"
                    onclick="closeInterestPicker()"
                >
                    ✕
                </button>

                <span class="tag">
                    PERSONALIZATION
                </span>

                <h2>
                    Choose your interests
                </h2>

                <p>
                    Tell Gen Z Pulse what
                    you care about. Your
                    choices will be saved
                    to your account and
                    used to prioritize
                    relevant stories.
                </p>

                <div
                    id="interestOptions"
                    class="filters"
                    style="
                        margin-top:18px;
                        margin-bottom:10px
                    "
                >
                    ${buttons}
                </div>

                <button
                    class="apply"
                    onclick="saveInterests()"
                >
                    Save interests
                </button>

                <button
                    class="action"
                    onclick="closeInterestPicker()"
                >
                    Skip for now
                </button>

            </div>

        </div>
        `
    );
}


// =====================================================
// OPEN INTEREST PICKER
// =====================================================

function openInterestPicker(
    afterAuth = false
) {

    ensureInterestModal();

    if (
        !currentUser
    ) {

        closeModal();

        showAccount(
            "signin"
        );

        return;
    }

    const savedSet =
        new Set(
            selectedInterests
        );

    document
        .querySelectorAll(
            ".interest-option"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    savedSet.has(
                        button.dataset
                            .interest
                    )
                );
            }
        );

    document
        .getElementById(
            "interestModal"
        )
        ?.classList.add(
            "show"
        );
}


// =====================================================
// CLOSE INTEREST PICKER
// =====================================================

function closeInterestPicker() {

    document
        .getElementById(
            "interestModal"
        )
        ?.classList.remove(
            "show"
        );

    updateInterestSummary();

    renderFlash();
}


// =====================================================
// TOGGLE INTEREST
// =====================================================

function toggleInterest(
    button
) {

    if (
        !button
    ) {

        return;
    }

    button.classList.toggle(
        "active"
    );
}


// =====================================================
// SAVE INTERESTS
// =====================================================

async function saveInterests() {

    if (
        !currentUser
    ) {

        toast(
            "Please sign in first."
        );

        return;
    }

    const selected =
        Array.from(
            document.querySelectorAll(
                ".interest-option.active"
            )
        )
            .map(
                button =>
                    button.dataset
                        .interest
            )
            .filter(
                Boolean
            );

    try {

        toast(
            "Saving your interests..."
        );

        const response =
            await fetch(
                `${API_BASE}/api/interests`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
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

        selectedInterests =
            Array.isArray(
                data.interests
            )
                ? data.interests
                : selected;

        currentUser.interests =
            selectedInterests;

        localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify(
                currentUser
            )
        );

        localStorage.setItem(
            "genZPulseInterests",
            JSON.stringify(
                selectedInterests
            )
        );

        updateInterestSummary();

        renderFlash();

        closeInterestPicker();

        toast(
            selectedInterests.length
                ? "Your interests are saved."
                : "Interests cleared."
        );

    } catch (
        error
    ) {

        console.error(
            "Save interests error:",
            error
        );

        toast(
            "Could not save interests. Please try again."
        );
    }
}


// =====================================================
// UPDATE INTEREST SUMMARY
// =====================================================

function updateInterestSummary() {

    let summary =
        document.getElementById(
            "interestSummary"
        );

    if (
        !summary
    ) {

        return;
    }

    if (
        selectedInterests.length
    ) {

        summary.innerHTML = `

            <span class="tag">
                YOUR INTERESTS
            </span>

            <h3>
                ${selectedInterests
                    .map(
                        interest =>
                            escapeHtml(
                                interest
                            )
                    )
                    .join(
                        " · "
                    )}
            </h3>

            <p>
                Your Gen Z Pulse feed
                will prioritize stories
                related to these topics.
            </p>
        `;

    } else {

        summary.innerHTML = `

            <span class="tag">
                PERSONALIZATION
            </span>

            <h3>
                Make your Pulse more relevant
            </h3>

            <p>
                Choose the topics you care
                about and Gen Z Pulse will
                prioritize related stories.
            </p>
        `;
    }
}


// =====================================================
// CREATE RADAR & RELEVANCE SECTION
// =====================================================

function ensureRadarSection() {

    if (
        document.getElementById(
            "radar"
        )
    ) {

        updateInterestSummary();

        return;
    }

    const flash =
        document.getElementById(
            "flash"
        );

    if (
        !flash
    ) {

        return;
    }

    const section =
        document.createElement(
            "section"
        );

    section.className =
        "section";

    section.id =
        "radar";

    section.innerHTML = `

        <div
            class="sectionHead"
        >

            <div>

                <h2>
                    Radar & Relevance
                </h2>

                <p>
                    Personalize your
                    Gen Z Pulse feed.
                </p>

            </div>

        </div>

        <div
            class="card"
        >

            <div
                id="interestSummary"
            ></div>

            <button
                class="action"
                style="
                    width:auto;
                    padding:12px 18px
                "
                onclick="openInterestPicker()"
            >
                Choose interests
            </button>

        </div>
    `;

    flash.insertAdjacentElement(
        "afterend",
        section
    );

    updateInterestSummary();

    addRadarNavigation();
}


// =====================================================
// ADD RADAR TO NAVIGATION
// =====================================================

function addRadarNavigation() {

    const nav =
        document.querySelector(
            ".navlinks"
        );

    if (
        !nav ||
        nav.querySelector(
            '[data-target="radar"]'
        )
    ) {

        return;
    }

    const button =
        document.createElement(
            "button"
        );

    button.dataset.target =
        "radar";

    button.textContent =
        "Radar & Relevance";

    button.onclick =
        () =>
            scrollToId(
                "radar"
            );

    nav.appendChild(
        button
    );
}


// =====================================================
// RAZORPAY PLUS CHECKOUT
// =====================================================

async function startPlusCheckout() {

    if (
        !currentUser
    ) {

        toast(
            "Please sign in before subscribing."
        );

        showAccount(
            "signin"
        );

        return;
    }

    if (
        currentUser.subscription ===
        "plus"
    ) {

        toast(
            "You are already a Plus member."
        );

        return;
    }

    if (
        typeof Razorpay ===
        "undefined"
    ) {

        toast(
            "Razorpay Checkout did not load."
        );

        return;
    }

    try {

        toast(
            "Creating secure payment..."
        );

        const response =
            await fetch(
                `${API_BASE}/api/create-plus-order`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
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
                "Could not create payment order."
            );

            return;
        }

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

                color:
                    "#6957ff"
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
                            "Payment window closed."
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

    } catch (
        error
    ) {

        console.error(
            "Razorpay error:",
            error
        );

        toast(
            "Unable to start payment."
        );
    }
}


// =====================================================
// VERIFY PAYMENT
// =====================================================

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
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

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
                "Payment verification failed."
            );

            return;
        }

        saveCurrentUser(
            data.user
        );

        closeModal();

        toast(
            "🎉 Gen Z Pulse Plus activated!"
        );

    } catch (
        error
    ) {

        console.error(
            "Payment verification error:",
            error
        );

        toast(
            "Payment verification failed."
        );
    }
}


// =====================================================
// SAVED STORIES
// =====================================================

function saveItem(
    index
) {

    if (
        !currentUser
    ) {

        toast(
            "Sign in to save stories."
        );

        showAccount(
            "signin"
        );

        return;
    }

    if (
        !saved.includes(
            index
        )
    ) {

        saved.push(
            index
        );

        updateSaved();

        toast(
            "Saved to your Pulse."
        );

    } else {

        toast(
            "Already saved."
        );
    }

    syncSavedStory(
        index
    );
}


// =====================================================
// SAVE STORY TO SUPABASE
// =====================================================

async function syncSavedStory(
    index
) {

    if (
        !currentUser ||
        !currentUser.id
    ) {

        return;
    }

    const item =
        items[index];

    if (
        !item
    ) {

        return;
    }

    try {

        await fetch(
            `${API_BASE}/api/save-story`,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        userId:
                            currentUser.id,

                        story:
                            item
                    })
            }
        );

    } catch (
        error
    ) {

        console.error(
            "Saved story sync error:",
            error
        );
    }
}


// =====================================================
// UPDATE SAVED
// =====================================================

function updateSaved() {

    const list =
        document.getElementById(
            "savedList"
        );

    const text =
        document.getElementById(
            "savedText"
        );

    if (
        !list ||
        !text
    ) {

        return;
    }

    text.textContent =
        saved.length
            ? `${saved.length} item${
                saved.length >
                1
                    ? "s"
                    : ""
            } saved to your personal Pulse.`
            : "Nothing saved yet. Use the Save button on a story to build your personal pulse.";

    list.innerHTML =
        saved
            .map(
                index => {

                    const item =
                        items[index];

                    if (
                        !item
                    ) {

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
                }
            )
            .join("");
}


// =====================================================
// STATIC MODALS
// =====================================================

function showModal(
    type,
    data
) {

    const content =
        document.getElementById(
            "modalContent"
        );

    const modal =
        document.getElementById(
            "modal"
        );

    if (
        !content ||
        !modal
    ) {

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
                                Interests:
                            </strong>

                            ${
                                currentUser
                                    .interests
                                    ?.length
                                    ? escapeHtml(
                                        currentUser
                                            .interests
                                            .join(
                                                ", "
                                            )
                                    )
                                    : "Not selected yet"
                            }
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

                        <button
                            class="action"
                            onclick="
                                closeModal();
                                openInterestPicker()
                            "
                        >
                            Edit interests
                        </button>

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
                                        onclick="
                                            closeModal();
                                            showAccount('subscribe')
                                        "
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
                Gen Z Explain helps users
                understand what happened,
                why it matters and what
                they should know next.
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

    modal.classList.add(
        "show"
    );
}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeModal() {

    document
        .getElementById(
            "modal"
        )
        ?.classList.remove(
            "show"
        );
}


// =====================================================
// TOAST
// =====================================================

function toast(
    message
) {

    const element =
        document.getElementById(
            "toast"
        );

    if (
        !element
    ) {

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
        2400
    );
}


// =====================================================
// SCROLL
// =====================================================

function scrollToId(
    id
) {

    const element =
        document.getElementById(
            id
        );

    if (
        element
    ) {

        element.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"
        });
    }
}


// =====================================================
// SEARCH ENTER KEY
// =====================================================

function setupSearch() {

    const search =
        document.getElementById(
            "search"
        );

    if (
        !search ||
        search.dataset
            .genZSearchReady ===
            "true"
    ) {

        return;
    }

    search.dataset
        .genZSearchReady =
        "true";

    search.addEventListener(
        "keydown",
        event => {

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


// =====================================================
// REBUILD SEARCH BOX BUTTON
// =====================================================

function ensureSearchButton() {

    const search =
        document.getElementById(
            "search"
        );

    if (
        !search
    ) {

        return;
    }

    const parent =
        search.parentElement;

    if (
        !parent
    ) {

        return;
    }

    if (
        parent.querySelector(
            ".today-search-button"
        )
    ) {

        return;
    }

    const button =
        document.createElement(
            "button"
        );

    button.type =
        "button";

    button.className =
        "action today-search-button";

    button.textContent =
        "Search";

    button.style.width =
        "auto";

    button.style.marginTop =
        "0";

    button.style.padding =
        "12px 16px";

    button.onclick =
        searchToday;

    parent.appendChild(
        button
    );
}


// =====================================================
// UPDATE EXISTING VISIBLE NAMES
// =====================================================

function updateVisibleNames() {

    const replacements = [
        [
            "Gen G Pulse",
            "Gen Z Pulse"
        ],
        [
            "Gen G Flash",
            "Gen Z Flash"
        ],
        [
            "Gen G Explain",
            "Gen Z Explain"
        ],
        [
            "Gen G Opportunity",
            "Gen Z Opportunity"
        ]
    ];

    const walker =
        document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );

    const textNodes =
        [];

    let node;

    while (
        node =
            walker.nextNode()
    ) {

        textNodes.push(
            node
        );
    }

    textNodes.forEach(
        textNode => {

            let value =
                textNode.nodeValue;

            replacements.forEach(
                pair => {

                    value =
                        value.replace(
                            pair[0],
                            pair[1]
                        );
                }
            );

            textNode.nodeValue =
                value;
        }
    );
}


// =====================================================
// NAVIGATION
// =====================================================

function setupNavigation() {

    document
        .querySelectorAll(
            ".navlinks button"
        )
        .forEach(
            button => {

                button.onclick =
                    () =>
                        scrollToId(
                            button.dataset
                                .target
                        );
            }
        );
}


// =====================================================
// MODAL OUTSIDE CLICK
// =====================================================

function setupModalClose() {

    const modal =
        document.getElementById(
            "modal"
        );

    if (
        modal &&
        !modal.dataset
            .closeReady
    ) {

        modal.dataset
            .closeReady =
            "true";

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    closeModal();
                }
            }
        );
    }
}


// =====================================================
// RAZORPAY SCRIPT
// =====================================================

function ensureRazorpayScript() {

    if (
        document.querySelector(
            'script[src*="checkout.razorpay.com"]'
        )
    ) {

        return;
    }

    const script =
        document.createElement(
            "script"
        );

    script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

    script.async =
        true;

    document.head.appendChild(
        script
    );
}


// =====================================================
// START APPLICATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        updateVisibleNames();

        ensureInterestModal();

        ensureRadarSection();

        ensureSearchButton();

        setupSearch();

        setupNavigation();

        setupModalClose();

        ensureRazorpayScript();

        updateAccountUI();

        updateInterestSummary();

        await loadNews(
            "India technology"
        );

        if (
            currentUser
        ) {

            await loadUserInterests();
        }
    }
);


// =====================================================
// EXPOSE FUNCTIONS FOR HTML onclick
// =====================================================

window.loadNews =
    loadNews;

window.searchToday =
    searchToday;

window.setFilter =
    setFilter;

window.showNews =
    showNews;

window.openFullArticle =
    openFullArticle;

window.generateAISummary =
    generateAISummary;

window.generateAIExplain =
    generateAIExplain;

window.showAccount =
    showAccount;

window.signUpUser =
    signUpUser;

window.signInUser =
    signInUser;

window.logoutUser =
    logoutUser;

window.startPlusCheckout =
    startPlusCheckout;

window.verifyPlusPayment =
    verifyPlusPayment;

window.saveItem =
    saveItem;

window.showModal =
    showModal;

window.closeModal =
    closeModal;

window.toast =
    toast;

window.scrollToId =
    scrollToId;

window.openInterestPicker =
    openInterestPicker;

window.closeInterestPicker =
    closeInterestPicker;

window.toggleInterest =
    toggleInterest;

window.saveInterests =
    saveInterests;

window.loadUserInterests =
    loadUserInterests;