const API_BASE = "http://localhost:3000";

// =====================================================
// NEWS DATA
// =====================================================

let items = [];

const demoItems = [
    {
        cat: "India",
        tag: "Policy",
        title: "What changed today in India?",
        text: "Demo content shown when the real news service is unavailable.",
        time: "Demo",
        source: "Gen G Pulse Demo",
        image: "",
        url: ""
    },
    {
        cat: "Tech",
        tag: "Technology",
        title: "AI is moving from experiments to everyday tools",
        text: "Demo technology update.",
        time: "Demo",
        source: "Gen G Pulse Demo",
        image: "",
        url: ""
    }
];

let filter = "All";
let saved = [];


// =====================================================
// LOAD REAL NEWS FROM GNEWS
// =====================================================

async function loadNews() {

    const cards = document.getElementById("flashCards");

    if (cards) {
        cards.innerHTML = `
            <div class="card">
                <h3>Loading latest news...</h3>
                <p>Please wait while Gen G Pulse fetches the latest updates.</p>
            </div>
        `;
    }

    try {

        const response = await fetch(
            `${API_BASE}/api/news?q=India%20technology`
        );

        if (!response.ok) {
            throw new Error(
                `News request failed: ${response.status}`
            );
        }

        const data = await response.json();

        if (
            !data.success ||
            !Array.isArray(data.articles) ||
            data.articles.length === 0
        ) {
            throw new Error("No news articles received.");
        }

        items = data.articles.map(article => {

            return {
                cat: detectCategory(article),

                tag: detectTag(article),

                title:
                    article.title ||
                    "Untitled news article",

                text:
                    article.description ||
                    article.content ||
                    "No description available.",

                time:
                    formatPublishedTime(
                        article.publishedAt
                    ),

                source:
                    article.source?.name ||
                    "Unknown source",

                image:
                    article.image ||
                    "",

                url:
                    article.url ||
                    ""
            };

        });

        console.log(
            `Loaded ${items.length} real news articles.`
        );

        renderFlash();

    }

    catch (error) {

        console.error(
            "News loading error:",
            error
        );

        items = [...demoItems];

        renderFlash();

        toast(
            "Live news unavailable. Showing demo news."
        );
    }
}


// =====================================================
// CATEGORY DETECTION
// =====================================================

function detectCategory(article) {

    const text =
        `${article.title || ""} ${article.description || ""}`
            .toLowerCase();

    if (
        text.includes("job") ||
        text.includes("career") ||
        text.includes("employment") ||
        text.includes("internship") ||
        text.includes("hiring")
    ) {
        return "Career";
    }

    if (
        text.includes("education") ||
        text.includes("student") ||
        text.includes("university") ||
        text.includes("college") ||
        text.includes("school") ||
        text.includes("scholarship")
    ) {
        return "Education";
    }

    if (
        text.includes("ai") ||
        text.includes("artificial intelligence") ||
        text.includes("technology") ||
        text.includes("tech") ||
        text.includes("semiconductor") ||
        text.includes("software") ||
        text.includes("digital")
    ) {
        return "Tech";
    }

    return "India";
}


// =====================================================
// TAG DETECTION
// =====================================================

function detectTag(article) {

    const text =
        `${article.title || ""} ${article.description || ""}`
            .toLowerCase();

    if (
        text.includes("government") ||
        text.includes("policy") ||
        text.includes("minister") ||
        text.includes("law") ||
        text.includes("scheme")
    ) {
        return "Policy";
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
        text.includes("school") ||
        text.includes("college")
    ) {
        return "Education";
    }

    if (
        text.includes("job") ||
        text.includes("career") ||
        text.includes("hiring")
    ) {
        return "Career";
    }

    return "News";
}


// =====================================================
// TIME FORMAT
// =====================================================

function formatPublishedTime(dateString) {

    if (!dateString) {
        return "Recently";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Recently";
    }

    const now = new Date();

    const difference =
        Math.floor(
            (now.getTime() - date.getTime()) / 1000
        );

    if (difference < 60) {
        return "Just now";
    }

    if (difference < 3600) {

        const minutes =
            Math.floor(difference / 60);

        return `${minutes} min ago`;
    }

    if (difference < 86400) {

        const hours =
            Math.floor(difference / 3600);

        return `${hours} hr ago`;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


// =====================================================
// FILTER
// =====================================================

function setFilter(value, element) {

    filter = value;

    document
        .querySelectorAll(".filter")
        .forEach(button => {
            button.classList.remove("active");
        });

    if (element) {
        element.classList.add("active");
    }

    renderFlash();
}


// =====================================================
// RENDER NEWS
// =====================================================

function renderFlash() {

    const searchElement =
        document.getElementById("search");

    const cards =
        document.getElementById("flashCards");

    if (!cards) {
        return;
    }

    const query =
        searchElement
            ? searchElement.value.toLowerCase().trim()
            : "";

    const list =
        items.filter(item => {

            const matchesFilter =
                filter === "All" ||
                item.cat === filter;

            const searchableText =
                `${item.title} ${item.text} ${item.tag} ${item.cat} ${item.source}`
                    .toLowerCase();

            const matchesSearch =
                searchableText.includes(query);

            return (
                matchesFilter &&
                matchesSearch
            );
        });


    cards.innerHTML =
        list.map(item => {

            const index =
                items.indexOf(item);

            const imageHTML =
                item.image
                    ? `
                        <img
                            src="${escapeHTML(item.image)}"
                            alt="${escapeHTML(item.title)}"
                            style="
                                width:100%;
                                height:190px;
                                object-fit:cover;
                                border-radius:14px;
                                margin-bottom:14px;
                            "
                            onerror="this.style.display='none'"
                        >
                    `
                    : "";


            return `
                <article class="card">

                    ${imageHTML}

                    <span class="tag">
                        ${escapeHTML(item.tag)}
                        ·
                        ${escapeHTML(item.cat)}
                    </span>

                    <h3>
                        ${escapeHTML(item.title)}
                    </h3>

                    <p>
                        ${escapeHTML(item.text)}
                    </p>

                    <div class="meta">

                        <span>
                            ${escapeHTML(item.time)}
                        </span>

                        <span>
                            ${escapeHTML(item.source)}
                        </span>

                    </div>


                    <button
                        class="action"
                        onclick="showNews(${index})">
                        Read Full News
                    </button>


                    ${
                        item.url
                            ? `
                                <button
                                    class="action"
                                    onclick="openSource(${index})">
                                    Open Original Source →
                                </button>
                            `
                            : ""
                    }


                    <button
                        class="action"
                        onclick="saveItem(${index})">
                        ☆ Save
                    </button>

                </article>
            `;

        }).join("");


    const empty =
        document.getElementById("empty");

    if (empty) {

        empty.style.display =
            list.length === 0
                ? "block"
                : "none";
    }
}


// =====================================================
// OPEN ORIGINAL SOURCE
// =====================================================

function openSource(index) {

    const item =
        items[index];

    if (!item || !item.url) {

        toast(
            "Original source unavailable."
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
// ACCOUNT MODAL
// =====================================================

function showAccount(type) {

    const modal =
        document.getElementById("modal");

    const content =
        document.getElementById("modalContent");

    if (!modal || !content) {
        console.error(
            "Account modal elements not found."
        );
        return;
    }


    // -------------------------------------------------
    // SIGN IN
    // -------------------------------------------------

    if (type === "signin") {

        content.innerHTML = `

            <div class="account-modal">

                <div class="modal-kicker">
                    GEN G ACCOUNT
                </div>

                <h2>
                    Welcome back
                </h2>

                <p class="modal-description">
                    Sign in to save stories,
                    personalize your pulse and
                    manage your subscription.
                </p>

                <label class="form-label">
                    Email address
                </label>

                <input
                    id="signinEmail"
                    class="form-input"
                    type="email"
                    placeholder="Enter your email"
                    autocomplete="email"
                >

                <label class="form-label">
                    Password
                </label>

                <input
                    id="signinPassword"
                    class="form-input"
                    type="password"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                >

                <button
                    class="modal-primary-button"
                    onclick="signInUser()">
                    Sign in
                </button>

                <p
                    id="signinMessage"
                    class="form-message">
                </p>

            </div>
        `;

    }


    // -------------------------------------------------
    // SUBSCRIBE
    // -------------------------------------------------

    else if (type === "subscribe") {

        content.innerHTML = `

            <div class="subscription-modal">

                <div class="modal-kicker">
                    GEN G PULSE PLUS
                </div>

                <h2>
                    Choose your plan
                </h2>

                <p class="modal-description">
                    Start free or unlock a more
                    personalized Gen G Pulse experience.
                </p>


                <div class="subscription-plans">

                    <div class="subscription-plan">

                        <div class="plan-label">
                            FREE
                        </div>

                        <h3>
                            ₹0
                        </h3>

                        <p class="plan-description">
                            Essential updates for
                            everyday awareness.
                        </p>

                        <ul>
                            <li>Daily Pulse</li>
                            <li>Basic explanations</li>
                            <li>Save stories</li>
                        </ul>

                        <button
                            class="plan-button secondary"
                            onclick="
                                toast('Free plan selected');
                                closeModal();
                            ">
                            Continue with Free
                        </button>

                    </div>


                    <div class="subscription-plan featured">

                        <div class="plan-label">
                            PLUS
                        </div>

                        <h3>
                            ₹49<span>/month</span>
                        </h3>

                        <p class="plan-description">
                            More personalization and
                            deeper explanations.
                        </p>

                        <ul>
                            <li>Personalized topics</li>
                            <li>Deeper explanations</li>
                            <li>Enhanced saved content</li>
                        </ul>

                        <button
                            class="plan-button primary"
                            onclick="startPlusCheckout()">
                            Subscribe to Plus →
                        </button>

                    </div>

                </div>

                <p class="payment-note">
                    Secure payments will be processed
                    through Razorpay.
                </p>

            </div>
        `;

    }


    else {

        console.warn(
            "Unknown account modal type:",
            type
        );

        return;
    }


    openModal();
}


// =====================================================
// SIGN IN
// =====================================================

async function signInUser() {

    const emailElement =
        document.getElementById("signinEmail");

    const passwordElement =
        document.getElementById("signinPassword");

    const message =
        document.getElementById("signinMessage");


    if (
        !emailElement ||
        !passwordElement ||
        !message
    ) {
        return;
    }


    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value;


    if (!email || !password) {

        message.textContent =
            "Please enter your email and password.";

        message.className =
            "form-message error";

        return;
    }


    try {

        message.textContent =
            "Signing in...";

        message.className =
            "form-message";


        const response =
            await fetch(
                `${API_BASE}/api/auth/signin`,
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

            message.textContent =
                data.message ||
                "Sign in failed.";

            message.className =
                "form-message error";

            return;
        }


        localStorage.setItem(
            "genGToken",
            data.token
        );

        localStorage.setItem(
            "genGUser",
            JSON.stringify(data.user)
        );


        message.textContent =
            "Sign in successful!";

        message.className =
            "form-message success";


        setTimeout(() => {

            closeModal();

            updateLoginButton();

            toast(
                `Welcome, ${data.user.name}!`
            );

        }, 700);

    }

    catch (error) {

        console.error(
            "Sign in error:",
            error
        );

        message.textContent =
            "Cannot connect to Gen G Pulse server.";

        message.className =
            "form-message error";
    }
}


// =====================================================
// LOGIN / PROFILE STATE
// =====================================================

function updateLoginButton() {

    const user =
        JSON.parse(
            localStorage.getItem("genGUser") ||
            "null"
        );

    const profileButtons =
        document.querySelectorAll(
            ".profile-btn"
        );


    if (!profileButtons.length) {
        return;
    }


    if (user) {

        profileButtons.forEach(button => {

            button.title =
                `Profile: ${user.name}`;

        });

    } else {

        profileButtons.forEach(button => {

            button.title =
                "Profile";

        });
    }
}


// =====================================================
// PROFILE
// =====================================================

function showProfile() {

    const user =
        JSON.parse(
            localStorage.getItem("genGUser") ||
            "null"
        );

    const content =
        document.getElementById(
            "modalContent"
        );


    if (!content) {
        return;
    }


    if (!user) {

        content.innerHTML = `

            <div class="account-modal">

                <div class="modal-kicker">
                    GEN G PULSE
                </div>

                <h2>
                    Your profile
                </h2>

                <p class="modal-description">
                    Sign in to manage your profile,
                    save stories and personalize your pulse.
                </p>

                <button
                    class="modal-primary-button"
                    onclick="showAccount('signin')">
                    Sign in
                </button>

            </div>
        `;

    } else {

        content.innerHTML = `

            <div class="account-modal">

                <div class="modal-kicker">
                    YOUR ACCOUNT
                </div>

                <h2>
                    ${escapeHTML(user.name)}
                </h2>

                <p class="modal-description">
                    ${escapeHTML(user.email)}
                </p>

                <div class="profile-info">

                    <div>
                        <span>Plan</span>
                        <strong>
                            ${user.plan || "Free"}
                        </strong>
                    </div>

                    <div>
                        <span>Saved stories</span>
                        <strong>
                            ${saved.length}
                        </strong>
                    </div>

                </div>

                <button
                    class="modal-secondary-button"
                    onclick="signOutUser()">
                    Sign out
                </button>

            </div>
        `;
    }


    openModal();
}


// =====================================================
// SIGN OUT
// =====================================================

async function signOutUser() {

    const token =
        localStorage.getItem("genGToken");


    if (token) {

        try {

            await fetch(
                `${API_BASE}/api/auth/signout`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        } catch (error) {

            console.error(
                "Sign out error:",
                error
            );
        }
    }


    localStorage.removeItem(
        "genGToken"
    );

    localStorage.removeItem(
        "genGUser"
    );


    closeModal();

    updateLoginButton();

    toast(
        "Signed out successfully"
    );
}


// =====================================================
// RAZORPAY
// =====================================================

function startPlusCheckout() {

    toast(
        "Razorpay subscription setup is next."
    );
}


// =====================================================
// SAVED STORIES
// =====================================================

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

    const savedText =
        document.getElementById(
            "savedText"
        );

    const savedList =
        document.getElementById(
            "savedList"
        );


    if (!savedText || !savedList) {
        return;
    }


    savedText.textContent =
        saved.length
            ? `${saved.length} item${saved.length > 1 ? "s" : ""} saved to your personal Pulse.`
            : "Nothing saved yet. Use the Save button on a story to build your personal pulse.";


    savedList.innerHTML =
        saved.map(index => {

            const item =
                items[index];

            if (!item) {
                return "";
            }

            return `

                <div
                    class="card"
                    style="margin-top:10px">

                    ${
                        item.image
                            ? `
                                <img
                                    src="${escapeHTML(item.image)}"
                                    alt="${escapeHTML(item.title)}"
                                    style="
                                        width:100%;
                                        max-height:180px;
                                        object-fit:cover;
                                        border-radius:14px;
                                        margin-bottom:12px;
                                    "
                                    onerror="this.style.display='none'"
                                >
                            `
                            : ""
                    }

                    <span class="tag">
                        ${escapeHTML(item.tag)}
                        ·
                        ${escapeHTML(item.cat)}
                    </span>

                    <h3>
                        ${escapeHTML(item.title)}
                    </h3>

                    <p>
                        ${escapeHTML(item.text)}
                    </p>

                    <button
                        class="action"
                        onclick="showNews(${index})">
                        Open story
                    </button>

                </div>
            `;

        }).join("");
}


// =====================================================
// NEWS MODAL
// =====================================================

function showNews(index) {

    const item =
        items[index] ||
        items[0];

    if (!item) {
        return;
    }

    showModal(
        "news",
        item
    );
}


// =====================================================
// GENERAL MODALS
// =====================================================

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
            <div class="account-modal">

                <div class="modal-kicker">
                    YOUR PULSE
                </div>

                <h2>
                    Personalization
                </h2>

                <p class="modal-description">
                    Choose topics and the platform
                    can learn from interactions such
                    as saves and deep-dive taps.
                </p>

                <button
                    class="modal-primary-button"
                    onclick="closeModal()">
                    Got it
                </button>

            </div>
        `,


        how: `
            <div class="account-modal">

                <div class="modal-kicker">
                    THE IDEA
                </div>

                <h2>
                    Less information overload.
                    More understanding.
                </h2>

                <p class="modal-description">

                    <strong>1.</strong>
                    Find important information.

                    <br><br>

                    <strong>2.</strong>
                    Summarize it into a quick flash.

                    <br><br>

                    <strong>3.</strong>
                    Explain context and relevance.

                    <br><br>

                    <strong>4.</strong>
                    Connect users to an action
                    when one exists.

                </p>

            </div>
        `,


        explain: `
            <div class="account-modal">

                <div class="modal-kicker">
                    GEN G EXPLAIN
                </div>

                <h2>
                    Context before conclusions
                </h2>

                <p class="modal-description">
                    This prototype demonstrates
                    the product principle:
                    explain what happened,
                    why it matters and
                    what a user can do next.
                </p>

            </div>
        `,


        trust: `
            <div class="account-modal">

                <div class="modal-kicker">
                    TRUST CHECKLIST
                </div>

                <h2>
                    Before you believe or share
                </h2>

                <p class="modal-description">

                    ✓ Find the original source
                    <br><br>

                    ✓ Check the date
                    <br><br>

                    ✓ Separate facts from opinions
                    <br><br>

                    ✓ Look for evidence
                    <br><br>

                    ✓ Compare credible sources

                </p>

            </div>
        `,


        workflow: `
            <div class="account-modal">

                <div class="modal-kicker">
                    OPERATIONS
                </div>

                <h2>
                    Content workflow
                </h2>

                <p class="modal-description">
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

            </div>
        `
    };


    // -------------------------------------------------
    // NEWS MODAL
    // -------------------------------------------------

    if (type === "news") {

        content.innerHTML = `

            <div class="account-modal">

                <div class="modal-kicker">
                    ${escapeHTML(data.tag)}
                    ·
                    ${escapeHTML(data.cat)}
                </div>

                ${
                    data.image
                        ? `
                            <img
                                src="${escapeHTML(data.image)}"
                                alt="${escapeHTML(data.title)}"
                                style="
                                    width:100%;
                                    max-height:280px;
                                    object-fit:cover;
                                    border-radius:16px;
                                    margin:12px 0 18px;
                                "
                                onerror="this.style.display='none'"
                            >
                        `
                        : ""
                }

                <h2>
                    ${escapeHTML(data.title)}
                </h2>

                <p class="modal-description">
                    ${escapeHTML(data.text)}
                </p>

                <p>
                    <strong>Published:</strong>
                    ${escapeHTML(data.time)}
                </p>

                <p>
                    <strong>Source:</strong>
                    ${escapeHTML(data.source)}
                </p>


                ${
                    data.url
                        ? `
                            <button
                                class="modal-primary-button"
                                onclick="openSource(${items.indexOf(data)})">
                                Open Original Source →
                            </button>
                        `
                        : ""
                }


                <button
                    class="modal-secondary-button"
                    onclick="closeModal()">
                    Back to Pulse
                </button>

            </div>
        `;

    } else {

        content.innerHTML =
            html[type] ||
            `
                <div class="account-modal">

                    <div class="modal-kicker">
                        GEN G PULSE
                    </div>

                    <h2>
                        Gen G Pulse
                    </h2>

                    <p class="modal-description">
                        Information →
                        Explanation →
                        Relevance →
                        Action
                    </p>

                </div>
            `;
    }


    openModal();
}


// =====================================================
// OPEN MODAL
// =====================================================

function openModal() {

    const modal =
        document.getElementById(
            "modal"
        );

    if (!modal) {
        console.error(
            "Modal element not found."
        );
        return;
    }


    modal.classList.add("show");

    document.body.classList.add(
        "modal-open"
    );
}


// =====================================================
// CLOSE MODAL
// =====================================================

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


    document.body.classList.remove(
        "modal-open"
    );
}


// =====================================================
// TOAST
// =====================================================

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


    setTimeout(() => {

        element.classList.remove(
            "show"
        );

    }, 2200);
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =====================================================
// SCROLL
// =====================================================

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


// =====================================================
// CLOSE MODAL WITH ESC
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {
            closeModal();
        }

    }
);


// =====================================================
// MODAL BACKGROUND CLICK
// =====================================================

document.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "modal"
            );

        if (
            modal &&
            event.target === modal
        ) {
            closeModal();
        }

    }
);


// =====================================================
// START APP
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadNews();

        updateSaved();

        updateLoginButton();

        console.log(
            "Gen G Pulse frontend loaded successfully."
        );

    }
);