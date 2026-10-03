const API_BASE = "http://localhost:3000";

let items = [];
let filter = "All";
let saved = [];
let currentNewsIndex = null;

/* =====================================================
   LOAD REAL NEWS FROM GNEWS BACKEND
   ===================================================== */

async function loadNews(query = "India technology") {
    const cards = document.getElementById("flashCards");
    const empty = document.getElementById("empty");

    cards.innerHTML = `
        <div class="card">
            <h3>Loading today's news...</h3>
            <p>Please wait while Gen G Pulse loads the latest news.</p>
        </div>
    `;

    try {
        const response = await fetch(
            `${API_BASE}/api/news?q=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || "Failed to load news");
        }

        items = (data.articles || []).map((article) => ({
            cat: getCategory(article),
            tag: article.source?.name || "News",
            title: article.title || "Untitled news",
            text:
                article.description ||
                article.content ||
                "No description available.",
            time: formatNewsTime(article.publishedAt),
            url: article.url || "",
            source: article.source?.name || "Unknown source",
            image: article.image || ""
        }));

        renderFlash();

    } catch (error) {
        console.error("News loading error:", error);

        cards.innerHTML = `
            <div class="card">
                <span class="tag">ERROR</span>
                <h3>Unable to load news</h3>
                <p>
                    Make sure the Gen G Pulse backend is running on
                    http://localhost:3000
                </p>
                <button class="action" onclick="loadNews('India technology')">
                    Try again
                </button>
            </div>
        `;

        empty.style.display = "none";
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
    const diffMinutes = Math.floor((now - date) / 60000);

    if (diffMinutes < 1) {
        return "Just now";
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
        return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);

    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}


/* =====================================================
   FILTER
   ===================================================== */

function setFilter(value, element) {
    filter = value;

    document
        .querySelectorAll(".filter")
        .forEach((button) => button.classList.remove("active"));

    element.classList.add("active");

    renderFlash();
}


/* =====================================================
   RENDER NEWS CARDS
   ===================================================== */

function renderFlash() {
    const searchBox = document.getElementById("search");
    const cards = document.getElementById("flashCards");
    const empty = document.getElementById("empty");

    if (!cards) {
        return;
    }

    const query = searchBox
        ? searchBox.value.toLowerCase().trim()
        : "";

    const list = items.filter((item) => {
        const matchesFilter =
            filter === "All" || item.cat === filter;

        const searchableText = `
            ${item.title}
            ${item.text}
            ${item.tag}
            ${item.source}
            ${item.cat}
        `.toLowerCase();

        const matchesSearch =
            searchableText.includes(query);

        return matchesFilter && matchesSearch;
    });

    if (list.length === 0) {
        cards.innerHTML = "";
        empty.style.display = "block";
        return;
    }

    empty.style.display = "none";

    cards.innerHTML = list
        .map((item) => {
            const originalIndex = items.indexOf(item);

            return `
                <article class="card">

                    ${
                        item.image
                            ? `
                                <img
                                    src="${escapeHtml(item.image)}"
                                    alt=""
                                    class="news-card-image"
                                    onerror="this.style.display='none'"
                                >
                            `
                            : ""
                    }

                    <span class="tag">
                        ${escapeHtml(item.tag)} · ${escapeHtml(item.cat)}
                    </span>

                    <h3>
                        ${escapeHtml(item.title)}
                    </h3>

                    <p>
                        ${escapeHtml(item.text)}
                    </p>

                    <div class="meta">
                        <span>${escapeHtml(item.time)}</span>
                        <span>
                            ${escapeHtml(item.source)}
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

    const content = document.getElementById("modalContent");

    content.innerHTML = `
        <span class="tag">
            ${escapeHtml(item.tag)} · ${escapeHtml(item.cat)}
        </span>

        <h2>
            ${escapeHtml(item.title)}
        </h2>

        ${
            item.image
                ? `
                    <img
                        src="${escapeHtml(item.image)}"
                        alt=""
                        class="news-card-image"
                        onerror="this.style.display='none'"
                    >
                `
                : ""
        }

        <div class="news-source-box">
            <strong>Source:</strong>
            ${escapeHtml(item.source)}
            <br>

            <strong>Published:</strong>
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

        <div id="aiSummary" style="margin-top:20px"></div>
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
        toast("Original article unavailable");
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

    const summaryBox = document.getElementById("aiSummary");

    if (!summaryBox) {
        return;
    }

    summaryBox.innerHTML = `
        <div class="ai-summary-block">
            <h3>🤖 AI Generated Summary</h3>
            <p>Gemini is analyzing this article...</p>
        </div>
    `;

    try {
        const response = await fetch(
            `${API_BASE}/api/analyze-news`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: item.title,
                    source: item.source,
                    description: item.text,
                    content: item.text,
                    url: item.url
                })
            }
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message || "AI analysis failed"
            );
        }

        summaryBox.innerHTML = formatAIResponse(
            data.analysis || data.aiResponse || ""
        );

    } catch (error) {
        console.error("AI summary error:", error);

        summaryBox.innerHTML = `
            <div class="ai-summary-block">
                <h3>🤖 AI Generated Summary</h3>
                <p>
                    Gemini could not analyze this article right now.
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
   FORMAT GEMINI RESPONSE
   ===================================================== */

function formatAIResponse(text) {
    if (!text) {
        return `
            <div class="ai-summary-block">
                <h3>🤖 AI Generated Summary</h3>
                <p>No AI summary was returned.</p>
            </div>
        `;
    }

    let cleaned = text
        .replace(/\r/g, "")
        .trim();

    const sections = {
        "WHAT HAPPENED?": "",
        "WHY DOES IT MATTER?": "",
        "KEY POINTS:": "",
        "WHAT SHOULD YOU KNOW?": ""
    };

    const headings = Object.keys(sections);

    let currentHeading = null;

    const lines = cleaned.split("\n");

    for (let line of lines) {
        line = line.trim();

        if (!line) {
            continue;
        }

        const heading = headings.find(
            (item) => line.toUpperCase() === item
        );

        if (heading) {
            currentHeading = heading;
            continue;
        }

        if (currentHeading) {
            sections[currentHeading] +=
                (sections[currentHeading] ? "\n" : "") +
                line;
        }
    }

    let html = `
        <div class="ai-summary-block">
            <h3>🤖 AI Generated Summary</h3>
        </div>
    `;

    if (sections["WHAT HAPPENED?"]) {
        html += `
            <div class="ai-summary-block">
                <h3>WHAT HAPPENED?</h3>
                <p>
                    ${formatText(sections["WHAT HAPPENED?"])}
                </p>
            </div>
        `;
    }

    if (sections["WHY DOES IT MATTER?"]) {
        html += `
            <div class="ai-summary-block">
                <h3>WHY DOES IT MATTER?</h3>
                <p>
                    ${formatText(sections["WHY DOES IT MATTER?"])}
                </p>
            </div>
        `;
    }

    if (sections["KEY POINTS:"]) {
        const points = sections["KEY POINTS:"]
            .split("\n")
            .map((point) =>
                point
                    .replace(/^[*\-•]\s*/, "")
                    .trim()
            )
            .filter(Boolean);

        html += `
            <div class="ai-summary-block">
                <h3>KEY POINTS</h3>
                <ul style="color:var(--muted);line-height:1.7;padding-left:20px">
                    ${points
                        .map(
                            (point) =>
                                `<li>${escapeHtml(point)}</li>`
                        )
                        .join("")}
                </ul>
            </div>
        `;
    }

    if (sections["WHAT SHOULD YOU KNOW?"]) {
        html += `
            <div class="ai-summary-block">
                <h3>WHAT SHOULD YOU KNOW?</h3>
                <p>
                    ${formatText(
                        sections["WHAT SHOULD YOU KNOW?"]
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
    return escapeHtml(text).replace(/\n/g, "<br>");
}


/* =====================================================
   HTML ESCAPE
   ===================================================== */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   ACCOUNT MODAL
   ===================================================== */

function showAccount(type) {
    const content =
        document.getElementById("modalContent");

    if (type === "signin") {
        content.innerHTML = `
            <span class="tag">Account</span>

            <h2>
                Sign in to Gen G Pulse
            </h2>

            <p>
                Sign in to save stories, personalize
                your feed and manage your subscription.
            </p>

            <input
                placeholder="Email address"
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
                type="password"
                placeholder="Password"
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
                onclick="toast('Demo sign-in submitted');closeModal()"
            >
                Sign in
            </button>

            <p
                style="
                    text-align:center;
                    font-size:13px
                "
            >
                New here?
                <b>Create an account</b>
            </p>
        `;

    } else {

        content.innerHTML = `
            <span class="tag">
                Gen G Pulse Plus
            </span>

            <h2>
                Choose your plan
            </h2>

            <p>
                Start with Free or upgrade to Plus
                for a more personalized Gen G Pulse
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
                        Core news, Gen G Flash,
                        basic explanations and saved stories.
                    </p>

                    <ul
                        style="
                            color:var(--muted);
                            line-height:1.8;
                            padding-left:20px
                        "
                    >
                        <li>Daily pulse</li>
                        <li>Basic explanations</li>
                        <li>Save stories</li>
                    </ul>

                    <button
                        class="action"
                        onclick="toast('Free plan selected');closeModal()"
                    >
                        Continue with Free
                    </button>

                </div>

                <div
                    class="card"
                    style="border-color:var(--accent)"
                >

                    <span class="tag">
                        Plus
                    </span>

                    <h3>
                        ₹99/month
                    </h3>

                    <p>
                        Enhanced personalization and
                        deeper AI-powered explanations.
                    </p>

                    <ul
                        style="
                            color:var(--muted);
                            line-height:1.8;
                            padding-left:20px
                        "
                    >
                        <li>Personalized topics</li>
                        <li>Deeper explanations</li>
                        <li>Enhanced saved content</li>
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
                Payments will be processed securely
                through Razorpay once the payment
                gateway is connected.
            </p>
        `;
    }

    document
        .getElementById("modal")
        .classList.add("show");
}


/* =====================================================
   PLUS CHECKOUT
   ===================================================== */

function startPlusCheckout() {
    toast(
        "Razorpay setup required before payment"
    );
}


/* =====================================================
   SAVED ITEMS
   ===================================================== */

function saveItem(index) {
    if (!saved.includes(index)) {
        saved.push(index);
        updateSaved();
        toast("Saved to your Pulse");
    } else {
        toast("Already saved");
    }
}


function updateSaved() {
    const list =
        document.getElementById("savedList");

    const text =
        document.getElementById("savedText");

    if (!list || !text) {
        return;
    }

    text.textContent = saved.length
        ? `${saved.length} item${
              saved.length > 1 ? "s" : ""
          } saved to your personal Pulse.`
        : "Nothing saved yet. Use the Save button on a story to build your personal pulse.";

    list.innerHTML = saved
        .map((index) => {
            const item = items[index];

            if (!item) {
                return "";
            }

            return `
                <div
                    class="card"
                    style="margin-top:10px"
                >

                    <span class="tag">
                        ${escapeHtml(item.tag)}
                        ·
                        ${escapeHtml(item.cat)}
                    </span>

                    <h3>
                        ${escapeHtml(item.title)}
                    </h3>

                    <p>
                        ${escapeHtml(item.text)}
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
   MODAL
   ===================================================== */

function showModal(type, data) {
    const content =
        document.getElementById("modalContent");

    const html = {

        profile: `
            <span class="tag">
                Personalization
            </span>

            <h2>
                Your Pulse
            </h2>

            <p>
                In the full product, users can choose
                topics and the platform can learn from
                interactions such as dwell time, saves,
                shares and deep-dive taps.
            </p>

            <button
                class="action"
                onclick="closeModal()"
            >
                Got it
            </button>
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
                <b>1.</b> Find important information.<br>
                <b>2.</b> Summarize it into a quick flash.<br>
                <b>3.</b> Explain context and relevance.<br>
                <b>4.</b> Connect users to an action when one exists.
            </p>
        `,

        explain: `
            <span class="tag">
                Gen G Explain
            </span>

            <h2>
                Context before conclusions
            </h2>

            <p>
                This prototype demonstrates the product
                principle: explain what happened, why it
                matters and what a user can do next.
                In the real product, important or
                developing news would receive human
                verification before publication.
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
                ✓ Find the original source<br>
                ✓ Check the date<br>
                ✓ Separate facts from opinions<br>
                ✓ Look for evidence<br>
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
                Gen G Flash
            </span>

            <h2>
                ${escapeHtml(data?.title || "Gen G Pulse")}
            </h2>

            <p>
                ${escapeHtml(data?.text || "")}
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


function closeModal() {
    document
        .getElementById("modal")
        .classList.remove("show");
}


/* =====================================================
   TOAST
   ===================================================== */

function toast(message) {
    const element =
        document.getElementById("toast");

    if (!element) {
        return;
    }

    element.textContent = message;

    element.classList.add("show");

    setTimeout(() => {
        element.classList.remove("show");
    }, 2200);
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
    .querySelectorAll(".navlinks button")
    .forEach((button) => {
        button.onclick = () => {
            scrollToId(button.dataset.target);
        };
    });


/* =====================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
   ===================================================== */

document
    .getElementById("modal")
    ?.addEventListener("click", (event) => {
        if (event.target.id === "modal") {
            closeModal();
        }
    });


/* =====================================================
   START APPLICATION
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadNews("India technology");
});