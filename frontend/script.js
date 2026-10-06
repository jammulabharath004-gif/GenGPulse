/* =========================================================
   GEN Z PULSE â€” FRONTEND
   Complete frontend:
   - News
   - Topic search
   - AI summary / explanation
   - Save stories
   - Cloud saved stories
   - Radar cloud sync
   - Sign in / Sign up
   - Gen Z Plus
   - Swiping
   - Blindspot
========================================================= */

const API_BASE = window.location.origin;

const NEWS_API = `${API_BASE}/api/news`;
const AI_ANALYZE_API = `${API_BASE}/api/analyze-news`;

const SIGNUP_API = `${API_BASE}/api/signup`;
const SIGNIN_API = `${API_BASE}/api/signin`;

const SAVED_API = `${API_BASE}/api/saved`;
const SAVE_STORY_API = `${API_BASE}/api/save-story`;
const INTERESTS_API = `${API_BASE}/api/interests`;

const PLUS_ORDER_API = `${API_BASE}/api/create-plus-order`;
const PLUS_VERIFY_API = `${API_BASE}/api/verify-plus-payment`;

const state = {
  user: loadCurrentUser(),

  articles: [],

  savedIds: loadSavedIds(),

  savedArticles: loadSavedArticles(),

  blindspotCategories:
    loadBlindspotCategories(),

  swipingIndex: 0,

  blindspotIndex: 0,

  currentView: "home",

  loading: false,

  flashCategory: "All",

  flashSearch: "",

  homeSearch: ""
};


/* =========================================================
   CATEGORIES
========================================================= */

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
   IMAGES
========================================================= */

const fallbackImages = {

  technology:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",

  science:
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80",

  sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80",

  gaming:
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",

  entertainment:
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80",

  finance:
    "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1000&q=80",

  career:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=80",

  education:
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",

  startups:
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1000&q=80",

  environment:
    "https://images.unsplash.com/photo-1472141521881-95d0e87e2e39?auto=format&fit=crop&w=1000&q=80",

  health:
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1000&q=80",

  general:
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&q=80"
};


/* =========================================================
   FALLBACK ARTICLES
========================================================= */

const fallbackArticles = [

  {
    id: "fallback-ai",

    title:
      "AI is becoming a bigger part of student projects",

    description:
      "Students are increasingly using artificial intelligence for research, coding, presentations and creative projects.",

    content:
      "Artificial intelligence is becoming a common tool in education and student projects. The important part is learning how to use AI responsibly rather than depending on it for every task.",

    url:
      "https://ai.google/",

    image: "",

    publishedAt:
      hoursAgo(1),

    source: {
      name: "Google AI"
    },

    category:
      "Technology"
  },

  {
    id: "fallback-space",

    title:
      "India's space technology ecosystem keeps expanding",

    description:
      "Indian space startups and research organizations are working on new satellite, launch and Earth-observation technologies.",

    content:
      "India's space ecosystem includes government missions, private startups and research organizations. New technology is creating opportunities for engineering and technology students.",

    url:
      "https://www.isro.gov.in/",

    image: "",

    publishedAt:
      hoursAgo(3),

    source: {
      name: "ISRO"
    },

    category:
      "Science"
  },

  {
    id: "fallback-career",

    title:
      "Skills can matter as much as marks for early careers",

    description:
      "Projects, internships, communication and practical technical skills can help students demonstrate what they can actually do.",

    content:
      "Students can strengthen their career profile through projects, internships, competitions, certifications and practical experience.",

    url:
      "https://www.ncs.gov.in/",

    image: "",

    publishedAt:
      hoursAgo(5),

    source: {
      name: "National Career Service"
    },

    category:
      "Career"
  },

  {
    id: "fallback-startups",

    title:
      "Student founders are exploring AI-powered products",

    description:
      "Young founders are using AI to build tools for education, productivity, finance and everyday problems.",

    content:
      "AI has reduced some technical barriers for students who want to experiment with product ideas. Validation and solving a real problem remain important.",

    url:
      "https://www.startupindia.gov.in/",

    image: "",

    publishedAt:
      hoursAgo(7),

    source: {
      name: "Startup India"
    },

    category:
      "Startups"
  },

  {
    id: "fallback-finance",

    title:
      "Digital payments continue to shape everyday spending",

    description:
      "India's digital payment ecosystem keeps changing how students and young adults pay, save and manage money.",

    content:
      "Digital payments make transactions easier, but users still need to understand privacy, security and responsible money habits.",

    url:
      "https://www.rbi.org.in/",

    image: "",

    publishedAt:
      hoursAgo(9),

    source: {
      name: "Reserve Bank of India"
    },

    category:
      "Finance"
  },

  {
    id: "fallback-education",

    title:
      "Learning outside the classroom can build a stronger portfolio",

    description:
      "Competitions, certifications and practical projects can complement classroom learning and show real-world ability.",

    content:
      "A practical portfolio gives students examples of what they can build or solve. Combining coursework with projects can make learning more visible.",

    url:
      "https://www.education.gov.in/",

    image: "",

    publishedAt:
      hoursAgo(11),

    source: {
      name: "Ministry of Education"
    },

    category:
      "Education"
  },

  {
    id: "fallback-environment",

    title:
      "Clean-energy ideas are creating new opportunities",

    description:
      "Renewable energy, storage and efficiency projects are opening new paths for engineering, science and business students.",

    content:
      "The clean-energy transition needs technical, operational and business skills. Students can explore projects and internships around these areas.",

    url:
      "https://mnre.gov.in/",

    image: "",

    publishedAt:
      hoursAgo(14),

    source: {
      name: "MNRE"
    },

    category:
      "Environment"
  },

  {
    id: "fallback-gaming",

    title:
      "Game development is becoming more accessible",

    description:
      "Modern game engines and creator tools are lowering the barrier for students interested in developing games.",

    content:
      "Game development tools allow beginners to experiment with 2D and 3D projects without building an engine from scratch.",

    url:
      "https://unity.com/learn",

    image: "",

    publishedAt:
      hoursAgo(16),

    source: {
      name: "Unity Learn"
    },

    category:
      "Gaming"
  },

  {
    id: "fallback-sports",

    title:
      "Sports technology is changing how athletes train",

    description:
      "Wearable sensors, computer vision and performance analytics are increasingly being used in sports training.",

    content:
      "Sports technology can collect performance data such as movement, speed, workload and recovery indicators. Coaches can use this information to support training decisions.",

    url:
      "https://www.olympics.com/athletes",

    image: "",

    publishedAt:
      hoursAgo(18),

    source: {
      name: "Olympics"
    },

    category:
      "Sports"
  },

  {
    id: "fallback-health",

    title:
      "Health information is becoming more digital",

    description:
      "Apps, wearables and digital health platforms are giving people new ways to manage information and routines.",

    content:
      "Digital health tools can make information easier to access, but people should rely on qualified professionals for medical decisions.",

    url:
      "https://www.mohfw.gov.in/",

    image: "",

    publishedAt:
      hoursAgo(21),

    source: {
      name: "MoHFW"
    },

    category:
      "Health"
  },

  {
    id: "fallback-entertainment",

    title:
      "Streaming platforms are changing entertainment discovery",

    description:
      "Recommendation systems influence what viewers discover across movies, shows, music and online video.",

    content:
      "Digital platforms use recommendation systems to personalize content discovery. This can make finding new content easier while also creating content bubbles.",

    url:
      "https://www.youtube.com/creators/",

    image: "",

    publishedAt:
      hoursAgo(24),

    source: {
      name: "YouTube Creators"
    },

    category:
      "Entertainment"
  },

  {
    id: "fallback-fashion",

    title:
      "Sustainable fashion is becoming part of the design conversation",

    description:
      "Young creators and brands are experimenting with reused materials, smaller collections and lower-waste production.",

    content:
      "Sustainable fashion can include material choices, product lifecycles and responsible production practices.",

    url:
      "https://www.unep.org/",

    image: "",

    publishedAt:
      hoursAgo(28),

    source: {
      name: "UNEP"
    },

    category:
      "Fashion"
  }
];


/* =========================================================
   OPPORTUNITIES
========================================================= */

const opportunityData = [

  {
    id:
      "opp-scholarship",

    type:
      "SCHOLARSHIP",

    icon:
      "SCH",

    title:
      "Scholarship opportunities",

    description:
      "Find student funding opportunities, eligibility details, documents and deadlines.",

    meta:
      ["Apply", "Students", "Funding"],

    action:
      "Apply",

    url:
      "https://scholarships.gov.in/",

    category:
      "Education",

    source:
      "National Scholarship Portal",

    article:
      "fallback-education"
  },

  {
    id:
      "opp-career",

    type:
      "CAMPUS / CAREER",

    icon:
      "JOB",

    title:
      "Career & internship opportunities",

    description:
      "Explore internships, competitions and early-career pathways that help you build practical experience.",

    meta:
      ["Connect", "Internships", "Skills"],

    action:
      "Connect",

    url:
      "https://internshala.com/",

    category:
      "Career",

    source:
      "Internshala",

    article:
      "fallback-career"
  },

  {
    id:
      "opp-events",

    type:
      "EVENTS",

    icon:
      "EVT",

    title:
      "Student events & hackathons",

    description:
      "Discover hackathons, workshops, bootcamps and community events you can attend.",

    meta:
      ["Attend", "Events", "Community"],

    action:
      "Attend",

    url:
      "https://unstop.com/",

    category:
      "Startups",

    source:
      "Unstop",

    article:
      "fallback-startups"
  }
];


const blindspotFallback =
  fallbackArticles.filter(
    article =>
      [
        "Sports",
        "Gaming",
        "Entertainment"
      ].includes(
        article.category
      )
  );


fallbackArticles.forEach(
  article => {
    article.isFallback = true;
  }
);


/* =========================================================
   HELPERS
========================================================= */

function $(selector) {
  return document.querySelector(selector);
}


function $all(selector) {
  return document.querySelectorAll(selector);
}


function hoursAgo(hours) {
  return new Date(
    Date.now() -
    hours * 3600000
  ).toISOString();
}


function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


function safeUrl(value) {

  if (!value) {
    return "";
  }

  try {

    const url =
      new URL(value);

    return [
      "http:",
      "https:"
    ].includes(
      url.protocol
    )
      ? url.href
      : "";

  } catch {

    return "";
  }
}


function categoryKey(value) {

  return String(
    value || ""
  )
    .toLowerCase()
    .replace(
      /[^a-z0-9]/g,
      ""
    );
}


function categoryIcon(category) {

  const icons = {

    technology:
      "AI",

    science:
      "SCI",

    career:
      "GO",

    startups:
      "ST",

    finance:
      "â‚¹",

    education:
      "EDU",

    sports:
      "SP",

    gaming:
      "GM",

    entertainment:
      "TV",

    fashion:
      "FD",

    health:
      "+",

    environment:
      "ECO",

    general:
      "â€¢"
  };

  return (
    icons[
      categoryKey(category)
    ] ||
    icons.general
  );
}


function timeAgo(value) {

  if (!value) {
    return "Recently";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently";
  }

  const mins =
    Math.max(
      0,
      Math.floor(
        (
          Date.now() -
          date.getTime()
        ) / 60000
      )
    );

  if (mins < 1) {
    return "Just now";
  }

  if (mins < 60) {
    return `${mins}m ago`;
  }

  const hours =
    Math.floor(
      mins / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric"
    }
  );
}


function normalizeCategory(article) {

  let category =
    article?.category ||
    article?.type ||
    article?.section ||
    "";

  if (
    typeof category ===
    "object"
  ) {
    category =
      category.name ||
      category.title ||
      "";
  }

  if (!category) {

    const text =
      `
        ${article?.title || ""}
        ${article?.description || ""}
      `.toLowerCase();

    if (
      /sport|cricket|football/.test(
        text
      )
    ) {
      return "Sports";
    }

    if (
      /gaming|game/.test(
        text
      )
    ) {
      return "Gaming";
    }

    if (
      /startup|founder/.test(
        text
      )
    ) {
      return "Startups";
    }

    if (
      /space|satellite|science/.test(
        text
      )
    ) {
      return "Science";
    }

    if (
      /ai|technology|tech/.test(
        text
      )
    ) {
      return "Technology";
    }

    if (
      /education|student|college|university/.test(
        text
      )
    ) {
      return "Education";
    }

    if (
      /finance|market|bank|economy/.test(
        text
      )
    ) {
      return "Finance";
    }

    if (
      /health|medical/.test(
        text
      )
    ) {
      return "Health";
    }

    if (
      /environment|climate|energy/.test(
        text
      )
    ) {
      return "Environment";
    }

    return "Technology";
  }

  return String(category)
    .trim()
    .replace(
      /\s+/g,
      " "
    )
    .replace(
      /^./,
      char =>
        char.toUpperCase()
    );
}


function sourceName(article) {

  if (
    article?.source &&
    typeof article.source ===
      "object"
  ) {

    return (
      article.source.name ||
      article.source.title ||
      "News"
    );
  }

  return (
    article?.source ||
    article?.sourceName ||
    "News"
  );
}


function normalizeArticle(
  article,
  index = 0
) {

  if (
    !article ||
    typeof article !==
      "object"
  ) {
    return null;
  }

  const title =
    String(
      article.title ||
      article.headline ||
      article.name ||
      "Untitled story"
    );

  const description =
    String(
      article.description ||
      article.summary ||
      article.excerpt ||
      article.content ||
      "No description available."
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  const category =
    normalizeCategory(
      article
    );

  const image =
    safeUrl(
      article.image ||
      article.imageUrl ||
      article.urlToImage ||
      article.thumbnail ||
      ""
    ) ||
    fallbackImages[
      categoryKey(
        category
      )
    ] ||
    fallbackImages.general;

  return {

    ...article,

    id:
      String(
        article.id ||
        article.guid ||
        article.url ||
        `${title}-${index}`
      ),

    title,

    description,

    content:
      String(
        article.content ||
        description
      ),

    url:
      safeUrl(
        article.url ||
        article.link ||
        article.articleUrl ||
        ""
      ),

    image,

    publishedAt:
      article.publishedAt ||
      article.published_at ||
      article.date ||
      article.createdAt ||
      "",

    source: {
      name:
        sourceName(article)
    },

    category
  };
}


function extractArticles(
  payload
) {

  if (
    Array.isArray(payload)
  ) {
    return payload;
  }

  if (
    !payload ||
    typeof payload !==
      "object"
  ) {
    return [];
  }

  if (
    Array.isArray(
      payload.articles
    )
  ) {
    return payload.articles;
  }

  if (
    Array.isArray(
      payload.news
    )
  ) {
    return payload.news;
  }

  if (
    Array.isArray(
      payload.results
    )
  ) {
    return payload.results;
  }

  if (
    Array.isArray(
      payload.items
    )
  ) {
    return payload.items;
  }

  if (
    Array.isArray(
      payload.data
    )
  ) {
    return payload.data;
  }

  if (
    payload.data &&
    Array.isArray(
      payload.data.articles
    )
  ) {
    return payload.data.articles;
  }

  return [];
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadSavedIds() {

  try {

    const value =
      JSON.parse(
        localStorage.getItem(
          "genGPulseSaved"
        ) || "[]"
      );

    return Array.isArray(value)
      ? value.map(String)
      : [];

  } catch {

    return [];
  }
}


function loadSavedArticles() {

  try {

    const value =
      JSON.parse(
        localStorage.getItem(
          "genGPulseSavedArticles"
        ) || "[]"
      );

    return Array.isArray(value)
      ? value
      : [];

  } catch {

    return [];
  }
}


function saveSavedState() {

  localStorage.setItem(
    "genGPulseSaved",
    JSON.stringify(
      state.savedIds
    )
  );

  localStorage.setItem(
    "genGPulseSavedArticles",
    JSON.stringify(
      state.savedArticles
    )
  );
}


function loadBlindspotCategories() {

  try {

    const value =
      JSON.parse(
        localStorage.getItem(
          "genGPulseBlindspots"
        ) || "[]"
      );

    return (
      Array.isArray(value) &&
      value.length
    )
      ? value
      : [
          "Sports",
          "Gaming",
          "Entertainment"
        ];

  } catch {

    return [
      "Sports",
      "Gaming",
      "Entertainment"
    ];
  }
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
   ARTICLE COLLECTION
========================================================= */

function allArticles() {

  return [
    ...state.articles,
    ...state.savedArticles,
    ...fallbackArticles,

    ...opportunityData
      .map(
        item =>
          findArticle(
            item.article
          )
      )
      .filter(Boolean)
  ];
}


function findArticle(id) {

  return allArticlesRaw()
    .find(
      article =>
        String(article.id) ===
        String(id)
    );
}


function allArticlesRaw() {

  const map =
    new Map();

  [
    ...state.articles,
    ...state.savedArticles,
    ...fallbackArticles,
    ...blindspotFallback
  ]
    .forEach(
      article => {

        map.set(
          String(article.id),
          article
        );
      }
    );

  return [
    ...map.values()
  ];
}


/* =========================================================
   UI HELPERS
========================================================= */

function showToast(
  message
) {

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
    showToast.timer
  );

  showToast.timer =
    setTimeout(
      () =>
        toast.classList.remove(
          "show"
        ),
      2300
    );
}


function emptyState(
  title,
  description
) {

  return `
    <div class="empty-state">
      <div>
        <h3>
          ${escapeHtml(title)}
        </h3>

        <p>
          ${escapeHtml(description)}
        </p>
      </div>
    </div>
  `;
}


/* =========================================================
   NEWS CARD ACTIONS
========================================================= */

function actionButtons(
  article
) {

  const saved =
    state.savedIds.includes(
      String(article.id)
    );

  const linkText =
    article.isFallback
      ? "Open source â†’"
      : "Open direct article â†’";

  const link =
    article.url
      ? `
        <button
          class="news-action link article-read"
          data-id="${escapeHtml(article.id)}"
          type="button"
        >
          ${linkText}
        </button>
      `
      : `
        <button
          class="news-action link article-read"
          data-id="${escapeHtml(article.id)}"
          type="button"
        >
          Open article â†’
        </button>
      `;

  return `
    <div class="news-actions">

      <button
        class="news-action ai-btn"
        data-id="${escapeHtml(article.id)}"
        data-ai-type="summary"
        type="button"
      >
        AI Summary
      </button>

      <button
        class="news-action ai-btn"
        data-id="${escapeHtml(article.id)}"
        data-ai-type="explain"
        type="button"
      >
        AI Explanation
      </button>

      ${link}

      <button
        class="news-action save ${
          saved ? "active" : ""
        }"
        data-id="${escapeHtml(article.id)}"
        type="button"
      >
        ${
          saved
            ? "Saved âœ“"
            : "Save story"
        }
      </button>

    </div>
  `;
}


function createNewsCard(
  article,
  extraClass = ""
) {

  const image =
    article.image
      ? `
        <img
          src="${escapeHtml(article.image)}"
          alt=""
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='grid';"
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
    <article
      class="news-card ${extraClass}"
    >

      <div class="news-image">
        ${image}

        <span class="news-category">
          ${escapeHtml(article.category)}
        </span>
      </div>

      <div class="news-body">

        <div class="news-meta">

          <span>
            ${escapeHtml(
              article.source.name
            )}
          </span>

          <span>
            ${escapeHtml(
              timeAgo(
                article.publishedAt
              )
            )}
          </span>

        </div>

        <h3 class="news-title">
          ${escapeHtml(
            article.title
          )}
        </h3>

        <p class="news-description">
          ${escapeHtml(
            article.description
          )}
        </p>

        ${actionButtons(
          article
        )}

      </div>

    </article>
  `;
}


/* =========================================================
   HOME
========================================================= */

function currentHomeArticles() {

  const query =
    state.homeSearch
      .trim()
      .toLowerCase();

  return state.articles.filter(
    article =>
      !query ||
      `
        ${article.title}
        ${article.description}
        ${article.category}
        ${article.source.name}
      `
        .toLowerCase()
        .includes(query)
  );
}


function renderHome() {

  const grid =
    $("#homeNewsGrid");

  if (!grid) {
    return;
  }

  const articles =
    currentHomeArticles();

  grid.innerHTML =
    articles.length
      ? articles
          .map(
            createNewsCard
          )
          .join("")
      : emptyState(
          "No stories match your search",
          "Try a different topic or use Gen Z Flash filters."
        );
}


/* =========================================================
   FLASH
========================================================= */

function renderFlashFilters() {

  const bar =
    $("#flashFilterBar");

  if (!bar) {
    return;
  }

  const categories = [
    "All",
    ...availableCategories
  ];

  bar.innerHTML =
    categories
      .map(
        category =>
          `
            <button
              class="filter-btn ${
                state.flashCategory ===
                category
                  ? "active"
                  : ""
              }"
              data-flash-category="${escapeHtml(category)}"
              type="button"
            >
              ${escapeHtml(
                category
              )}
            </button>
          `
      )
      .join("");
}


function renderFlash() {

  const grid =
    $("#flashNewsGrid");

  if (!grid) {
    return;
  }

  renderFlashFilters();

  const query =
    state.flashSearch
      .trim()
      .toLowerCase();

  const articles =
    state.articles.filter(
      article =>
        (
          state.flashCategory ===
          "All" ||
          categoryKey(
            article.category
          ) ===
            categoryKey(
              state.flashCategory
            )
        ) &&
        (
          !query ||
          `
            ${article.title}
            ${article.description}
            ${article.category}
            ${article.source.name}
          `
            .toLowerCase()
            .includes(query)
        )
    );

  grid.innerHTML =
    articles.length
      ? articles
          .map(
            createNewsCard
          )
          .join("")
      : emptyState(
          "No matching stories",
          "Try another search or category."
        );
}


/* =========================================================
   REAL NEWS SEARCH
========================================================= */

async function searchNews(
  query
) {

  const q =
    String(
      query || ""
    ).trim();

  if (!q) {

    state.homeSearch = "";
    state.flashSearch = "";
    state.flashCategory =
      "All";

    showView(
      "home"
    );

    await loadNews();

    return;
  }

  const homeInput =
    $("#homeSearchInput");

  const flashInput =
    $("#flashSearchInput");

  if (homeInput) {
    homeInput.value =
      q;
  }

  if (flashInput) {
    flashInput.value =
      q;
  }

  state.homeSearch =
    q;

  state.flashSearch =
    q;

  state.flashCategory =
    "All";

  const homeGrid =
    $("#homeNewsGrid");

  if (homeGrid) {

    homeGrid.innerHTML = `
      <div class="loading-card">
        Searching all matching news...
      </div>
    `;
  }

  try {

    const response =
      await fetch(
        `${NEWS_API}?q=${encodeURIComponent(q)}`,
        {
          headers: {
            Accept:
              "application/json"
          },

          cache:
            "no-store"
        }
      );

    if (!response.ok) {
      throw new Error(
        `Search API returned ${response.status}`
      );
    }

    const payload =
      await response.json();

    const normalized =
      extractArticles(
        payload
      )
        .map(
          (
            article,
            index
          ) =>
            normalizeArticle(
              article,
              index
            )
        )
        .filter(Boolean);

    if (
      !normalized.length
    ) {
      throw new Error(
        "No matching articles returned."
      );
    }

    state.articles =
      normalized;

    state.homeSearch =
      "";

    state.flashSearch =
      "";

    renderHome();

    renderFlash();

    showView(
      "home"
    );

    showToast(
      `${normalized.length} matching news stories found`
    );

  } catch (error) {

    console.warn(
      "Topic search failed; using local matching stories.",
      error
    );

    const local =
      allArticlesRaw()
        .filter(
          article =>
            `
              ${article.title}
              ${article.description}
              ${article.category}
              ${article.source?.name || ""}
            `
              .toLowerCase()
              .includes(
                q.toLowerCase()
              )
        );

    state.articles =
      local.length
        ? local
            .map(
              (
                article,
                index
              ) =>
                normalizeArticle(
                  article,
                  index
                )
            )
            .filter(Boolean)
        : fallbackArticles
            .map(
              normalizeArticle
            )
            .filter(
              article =>
                `
                  ${article.title}
                  ${article.description}
                  ${article.category}
                  ${article.source.name}
                `
                  .toLowerCase()
                  .includes(
                    q.toLowerCase()
                  )
            );

    state.homeSearch =
      "";

    state.flashSearch =
      "";

    renderHome();

    renderFlash();

    showView(
      "home"
    );

    showToast(
      "Live search is unavailable right now; showing matching backup stories."
    );
  }
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

  grid.innerHTML =
    state.articles.length
      ? state.articles
          .map(
            createNewsCard
          )
          .join("")
      : emptyState(
          "No explainers yet",
          "Stories will appear here when news is available."
        );
}


/* =========================================================
   EXCITE
========================================================= */

const exciteSeedArticles = [

  {
    id:
      "excite-ai",

    title:
      "India's AI research is getting a stronger push",

    description:
      "New public and private initiatives are creating more space for young researchers, startups and deep-tech ideas.",

    content:
      "AI research and innovation are growing quickly across education, startups and public programs.",

    url:
      "https://indiaai.gov.in/",

    image:
      fallbackImages.technology,

    publishedAt:
      hoursAgo(2),

    source:
      {
        name:
          "IndiaAI"
      },

    category:
      "Technology"
  },

  {
    id:
      "excite-space",

    title:
      "India's next space chapter is opening new doors",

    description:
      "Private launch systems, satellite technology and research missions are creating new technical opportunities.",

    content:
      "India's space ecosystem is expanding through public missions and a growing private sector.",

    url:
      "https://www.isro.gov.in/",

    image:
      fallbackImages.science,

    publishedAt:
      hoursAgo(3),

    source:
      {
        name:
          "ISRO"
      },

    category:
      "Science"
  },

  {
    id:
      "excite-green",

    title:
      "Clean-energy innovation is moving closer to everyday life",

    description:
      "Solar, storage and smarter energy systems are creating new engineering and entrepreneurship opportunities.",

    content:
      "Clean-energy technology is becoming more practical and more connected to real-world products and infrastructure.",

    url:
      "https://mnre.gov.in/",

    image:
      fallbackImages.environment,

    publishedAt:
      hoursAgo(4),

    source:
      {
        name:
          "MNRE"
      },

    category:
      "Environment"
  },

  {
    id:
      "excite-startup",

    title:
      "Student founders are building products around real problems",

    description:
      "Young builders are turning campus problems into tools for education, productivity and small businesses.",

    content:
      "Student entrepreneurship is increasingly focused on validating useful products instead of only pitching ideas.",

    url:
      "https://www.startupindia.gov.in/",

    image:
      fallbackImages.startups,

    publishedAt:
      hoursAgo(6),

    source:
      {
        name:
          "Startup India"
      },

    category:
      "Startups"
  },

  {
    id:
      "excite-gaming",

    title:
      "Game creation tools are opening the door to more creators",

    description:
      "Modern engines and creator platforms make it easier to experiment with interactive experiences.",

    content:
      "Accessible development tools mean students can prototype games and interactive projects with smaller teams.",

    url:
      "https://unity.com/learn",

    image:
      fallbackImages.gaming,

    publishedAt:
      hoursAgo(8),

    source:
      {
        name:
          "Unity Learn"
      },

    category:
      "Gaming"
  },

  {
    id:
      "excite-education",

    title:
      "Coding is becoming a stronger everyday skill",

    description:
      "More students are learning to code not just for jobs, but to solve practical problems and build projects.",

    content:
      "Coding skills can support experimentation, automation and product building across many fields.",

    url:
      "https://www.education.gov.in/",

    image:
      fallbackImages.education,

    publishedAt:
      hoursAgo(10),

    source:
      {
        name:
          "Education Ministry"
      },

    category:
      "Education"
  }
];


function getExciteArticles() {

  return [
    ...exciteSeedArticles.map(
      article => ({
        ...article,
        isFallback: true
      })
    ),

    ...state.articles
  ]
    .map(
      normalizeArticle
    )
    .filter(Boolean)
    .slice(
      0,
      6
    );
}


function renderExcite() {

  const grid =
    $("#exciteStoryGrid");

  if (!grid) {
    return;
  }

  grid.innerHTML =
    getExciteArticles()
      .map(
        article =>
          createNewsCard(
            article,
            "excite-card"
          )
      )
      .join("");
}


/* =========================================================
   OPPORTUNITIES
========================================================= */

function renderOpportunities() {

  const grid =
    $("#opportunityGrid");

  if (!grid) {
    return;
  }

  grid.innerHTML =
    opportunityData
      .map(
        item => {

          const article =
            findArticle(
              item.article
            ) ||
            fallbackArticles[0];

          return `
            <article
              class="opportunity-card ${item.type
                .toLowerCase()
                .split(" ")[0]}"
            >

              <div class="opportunity-icon">
                ${item.icon}
              </div>

              <span class="opportunity-type">
                ${escapeHtml(
                  item.type
                )}
              </span>

              <h2>
                ${escapeHtml(
                  item.title
                )}
              </h2>

              <p>
                ${escapeHtml(
                  item.description
                )}
              </p>

              <div class="opportunity-meta">

                ${item.meta
                  .map(
                    meta =>
                      `
                        <span>
                          ${escapeHtml(
                            meta
                          )}
                        </span>
                      `
                  )
                  .join("")}

              </div>

              <div class="opportunity-tools">

                <button
                  class="ai-btn"
                  data-id="${escapeHtml(
                    article.id
                  )}"
                  data-ai-type="summary"
                  type="button"
                >
                  AI Summary
                </button>

                <button
                  class="ai-btn"
                  data-id="${escapeHtml(
                    article.id
                  )}"
                  data-ai-type="explain"
                  type="button"
                >
                  AI Explanation
                </button>

                <a
                  class="opportunity-btn"
                  href="${escapeHtml(
                    item.url
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ${escapeHtml(
                    item.action
                  )} â†’
                </a>

              </div>

            </article>
          `;
        }
      )
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

  const items =
    state.savedIds
      .map(
        id =>
          findArticle(id)
      )
      .filter(Boolean);

  grid.innerHTML =
    items.length
      ? items
          .map(
            createNewsCard
          )
          .join("")
      : emptyState(
          "Nothing saved yet",
          "Use Save story on any content card and it will appear here."
        );
}


/* =========================================================
   RADAR
========================================================= */

function renderRadar() {

  const controls =
    $("#interestControls");

  if (controls) {

    controls.innerHTML =
      availableCategories
        .map(
          category => {

            const active =
              state.blindspotCategories
                .some(
                  item =>
                    categoryKey(
                      item
                    ) ===
                    categoryKey(
                      category
                    )
                );

            return `
              <button
                class="interest-btn ${
                  active
                    ? "active"
                    : ""
                }"
                data-category="${escapeHtml(
                  category
                )}"
                type="button"
              >
                ${escapeHtml(
                  category
                )}

                ${
                  active
                    ? " âœ“"
                    : ""
                }
              </button>
            `;
          }
        )
        .join("");
  }

  const grid =
    $("#radarGrid");

  if (grid) {

    const items =
      state.articles
        .filter(
          article =>
            state.blindspotCategories
              .some(
                category =>
                  categoryKey(
                    category
                  ) ===
                  categoryKey(
                    article.category
                  )
              )
        )
        .slice(
          0,
          6
        );

    grid.innerHTML =
      items.length
        ? items
            .map(
              createNewsCard
            )
            .join("")
        : emptyState(
            "Your radar is ready",
            "Choose topics above to see stories from your current radar mix."
          );
  }
}


/* =========================================================
   SWIPING
========================================================= */

function getSwipingArticles() {

  return state.articles.length
    ? state.articles
    : [];
}


function getBlindspotArticles() {

  const selected =
    state.articles.filter(
      article =>
        state.blindspotCategories
          .some(
            category =>
              categoryKey(
                category
              ) ===
              categoryKey(
                article.category
              )
          )
    );

  if (selected.length) {
    return selected;
  }

  return blindspotFallback.filter(
    article =>
      state.blindspotCategories
        .some(
          category =>
            categoryKey(
              category
            ) ===
            categoryKey(
              article.category
            )
        )
  );
}


function createSwipeCard(
  article,
  index
) {

  const image =
    article.image
      ? `
        <img
          src="${escapeHtml(
            article.image
          )}"
          alt=""
          draggable="false"
        >
      `
      : `
        <div class="swipe-placeholder">
          ${categoryIcon(
            article.category
          )}
        </div>
      `;

  return `
    <article
      class="swipe-card ${
        index === 0
          ? "active"
          : ""
      }"
      data-swipe-id="${escapeHtml(
        article.id
      )}"
    >

      <div class="swipe-media">

        ${image}

        <span class="swipe-overlay-category">
          ${escapeHtml(
            article.category
          )}
        </span>

        <span class="swipe-media-time">
          ${escapeHtml(
            timeAgo(
              article.publishedAt
            )
          )}
        </span>

      </div>

      <div class="swipe-body">

        <span class="swipe-source">
          ${escapeHtml(
            article.source.name
          )}
        </span>

        <h2 class="swipe-title">
          ${escapeHtml(
            article.title
          )}
        </h2>

        <p class="swipe-description">
          ${escapeHtml(
            article.description
          )}
        </p>

        ${actionButtons(
          article
        )}

        <div class="swipe-secondary-actions">

          <button
            class="not-interested"
            data-id="${escapeHtml(
              article.id
            )}"
            type="button"
          >
            Not interested
          </button>

          <button
            class="save ${
              state.savedIds.includes(
                String(article.id)
              )
                ? "active"
                : ""
            }"
            data-id="${escapeHtml(
              article.id
            )}"
            type="button"
          >
            ${
              state.savedIds.includes(
                String(article.id)
              )
                ? "Saved"
                : "Save"
            }
          </button>

        </div>

      </div>

    </article>
  `;
}


function renderSwiping() {

  const deck =
    $("#swipeStage");

  if (!deck) {
    return;
  }

  const list =
    getSwipingArticles();

  const counter =
    $("#swipeCounter");

  if (!list.length) {

    deck.innerHTML =
      emptyState(
        "No stories to swipe",
        "Refresh the feed to load more stories."
      );

    if (counter) {
      counter.textContent =
        "0 / 0";
    }

    return;
  }

  state.swipingIndex =
    (
      state.swipingIndex %
      list.length +
      list.length
    ) %
    list.length;

  const cards = [];

  for (
    let i =
      Math.min(
        2,
        list.length - 1
      );
    i >= 0;
    i--
  ) {

    cards.push(
      createSwipeCard(
        list[
          (
            state.swipingIndex +
            i
          ) %
            list.length
        ],
        i === 0
          ? 0
          : i
      )
    );
  }

  deck.innerHTML =
    cards.join("");

  if (counter) {

    counter.textContent =
      `${state.swipingIndex + 1} / ${list.length}`;
  }

  setupSwipeGesture(
    deck,
    "swiping"
  );
}


function renderBlindspot() {

  const deck =
    $("#blindspotDeck");

  if (!deck) {
    return;
  }

  const list =
    getBlindspotArticles();

  if (!list.length) {

    deck.innerHTML =
      emptyState(
        "Blindspot is empty",
        "Choose some topics in Radar."
      );

    return;
  }

  state.blindspotIndex =
    (
      state.blindspotIndex %
      list.length +
      list.length
    ) %
    list.length;

  const cards = [];

  for (
    let i =
      Math.min(
        2,
        list.length - 1
      );
    i >= 0;
    i--
  ) {

    cards.push(
      createSwipeCard(
        list[
          (
            state.blindspotIndex +
            i
          ) %
            list.length
        ],
        i === 0
          ? 0
          : i
      )
    );
  }

  deck.innerHTML =
    cards.join("");

  setupSwipeGesture(
    deck,
    "blindspot"
  );
}


function nextSwiping() {

  const list =
    getSwipingArticles();

  if (!list.length) {
    return;
  }

  state.swipingIndex =
    (
      state.swipingIndex +
      1
    ) %
    list.length;

  renderSwiping();
}


function previousSwiping() {

  const list =
    getSwipingArticles();

  if (!list.length) {
    return;
  }

  state.swipingIndex =
    (
      state.swipingIndex -
      1 +
      list.length
    ) %
    list.length;

  renderSwiping();
}


function nextBlindspot() {

  const list =
    getBlindspotArticles();

  if (!list.length) {
    return;
  }

  state.blindspotIndex =
    (
      state.blindspotIndex +
      1
    ) %
    list.length;

  renderBlindspot();
}


function previousBlindspot() {

  const list =
    getBlindspotArticles();

  if (!list.length) {
    return;
  }

  state.blindspotIndex =
    (
      state.blindspotIndex -
      1 +
      list.length
    ) %
    list.length;

  renderBlindspot();
}


function setupSwipeGesture(
  deck,
  type
) {

  const active =
    deck.querySelector(
      ".swipe-card.active"
    );

  if (!active) {
    return;
  }

  let startX = 0;
  let currentX = 0;
  let dragging = false;

  active.addEventListener(
    "pointerdown",
    event => {

      if (
        event.target.closest(
          "button,a"
        )
      ) {
        return;
      }

      dragging = true;

      startX =
        currentX =
        event.clientX;

      active.classList.add(
        "dragging"
      );

      active.setPointerCapture?.(
        event.pointerId
      );
    }
  );

  active.addEventListener(
    "pointermove",
    event => {

      if (!dragging) {
        return;
      }

      currentX =
        event.clientX;

      const distance =
        currentX -
        startX;

      active.style.transform =
        `translateX(${distance}px) rotate(${distance / 18}deg)`;
    }
  );

  active.addEventListener(
    "pointerup",
    () => {

      if (!dragging) {
        return;
      }

      dragging = false;

      const distance =
        currentX -
        startX;

      active.classList.remove(
        "dragging"
      );

      if (
        Math.abs(distance) >
        95
      ) {

        if (
          type ===
          "swiping"
        ) {

          distance < 0
            ? nextSwiping()
            : previousSwiping();

        } else {

          distance < 0
            ? nextBlindspot()
            : previousBlindspot();
        }

      } else {

        active.style.transform =
          "";
      }
    }
  );

  active.addEventListener(
    "pointercancel",
    () => {

      dragging = false;

      active.classList.remove(
        "dragging"
      );

      active.style.transform =
        "";
    }
  );
}


/* =========================================================
   CLOUD SAVE / REMOVE
========================================================= */

async function toggleSave(
  id
) {

  const key =
    String(id);

  const article =
    findArticle(key);

  if (!article) {
    return;
  }


  /* =======================================================
     NOT SIGNED IN
     Browser-only save
  ======================================================= */

  if (!state.user?.id) {

    if (
      state.savedIds.includes(
        key
      )
    ) {

      state.savedIds =
        state.savedIds.filter(
          item =>
            String(item) !==
            key
        );

      state.savedArticles =
        state.savedArticles.filter(
          savedArticle =>
            String(
              savedArticle.id
            ) !==
            key
        );

      showToast(
        "Removed from Saved"
      );

    } else {

      state.savedIds.push(
        key
      );

      state.savedArticles = [
        ...state.savedArticles.filter(
          savedArticle =>
            String(
              savedArticle.id
            ) !==
            key
        ),

        article
      ];

      showToast(
        "Story saved in this browser"
      );
    }

    saveSavedState();

    renderEverything();

    return;
  }


  /* =======================================================
     SIGNED IN
     CLOUD SAVE / REMOVE
  ======================================================= */

  try {

    /* =====================================================
       REMOVE FROM CLOUD
    ===================================================== */

    if (
      state.savedIds.includes(
        key
      )
    ) {

      const response =
        await fetch(
          `${SAVED_API}/${encodeURIComponent(
            state.user.id
          )}`,
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({
                story:
                  article
              })
          }
        );

      const data =
        await response
          .json()
          .catch(
            () => ({})
          );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
          "Unable to remove the saved story."
        );
      }

      state.savedArticles =
        (
          data.savedStories ||
          []
        )
          .map(
            (
              saved,
              index
            ) =>
              normalizeArticle(
                saved,
                index
              )
          )
          .filter(Boolean);

      state.savedIds =
        state.savedArticles.map(
          saved =>
            String(
              saved.id
            )
        );

      saveSavedState();

      renderEverything();

      showToast(
        "Removed from Saved"
      );

      return;
    }


    /* =====================================================
       SAVE TO CLOUD
    ===================================================== */

    const response =
      await fetch(
        SAVE_STORY_API,
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
                state.user.id,

              story:
                article
            })
        }
      );

    const data =
      await response
        .json()
        .catch(
          () => ({})
        );

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
        "Unable to save the story."
      );
    }

    state.savedArticles =
      (
        data.savedStories ||
        []
      )
        .map(
          (
            saved,
            index
          ) =>
            normalizeArticle(
              saved,
              index
            )
        )
        .filter(Boolean);

    state.savedIds =
      state.savedArticles.map(
        saved =>
          String(
            saved.id
          )
      );

    saveSavedState();

    renderEverything();

    showToast(
      "Story saved to your account"
    );

  } catch (error) {

    console.warn(
      "Cloud save failed:",
      error
    );

    showToast(
      error.message ||
      "Unable to sync saved story."
    );
  }
}


/* =========================================================
   OPEN ARTICLE
========================================================= */

function readArticle(
  id
) {

  const article =
    findArticle(id);

  if (!article?.url) {

    showToast(
      "Direct article link is not available."
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
   AI
========================================================= */

function localSummary(
  article
) {

  return `
AI Summary

${article.description}

Why it matters:

This story may be relevant to students and young adults because it highlights a development in ${article.category.toLowerCase()}.

Source:

${article.source.name}
`;
}


function localExplain(
  article
) {

  return `
AI Explanation

What's happening?

${article.description}

In simple words:

This is a ${article.category.toLowerCase()} update. The useful part is understanding what changed and what it could mean for your choices, studies, work or daily life.

Quick takeaway:

Read the source for the full details when this topic matters to you.
`;
}


async function openAiModal(
  article,
  type
) {

  if (!article) {
    return;
  }

  const modal =
    $("#aiModal");

  const content =
    $("#modalContent");

  const title =
    $("#modalTitle");

  const label =
    $("#modalLabel");

  const icon =
    $("#modalIcon");

  if (
    !modal ||
    !content
  ) {
    return;
  }

  modal.classList.remove(
    "hidden"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  const isSummary =
    type ===
    "summary";

  icon.textContent =
    isSummary
      ? "âœ¦"
      : "?";

  label.textContent =
    isSummary
      ? "AI SUMMARY"
      : "AI EXPLANATION";

  title.textContent =
    isSummary
      ? "Quick Summary"
      : "Explained Simply";

  content.textContent =
    isSummary
      ? localSummary(article)
      : localExplain(article);

  try {

    const response =
      await fetch(
        AI_ANALYZE_API,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              article: {
                title:
                  article.title,

                description:
                  article.description,

                content:
                  article.content,

                source:
                  article.source?.name ||
                  article.source,

                url:
                  article.url
              }
            })
        }
      );

    const data =
      await response
        .json()
        .catch(
          () => ({})
        );

    if (
      response.ok &&
      data.success
    ) {

      const result =
        data.analysis ||
        data.aiResponse ||
        data.summary ||
        data.explanation ||
        data.text ||
        data.result;

      if (result) {

        content.textContent =
          String(result);
      }

    } else if (
      !response.ok
    ) {

      showToast(
        "AI is temporarily unavailable; showing the local explanation."
      );
    }

  } catch (error) {

    console.warn(
      "AI request failed",
      error
    );

    showToast(
      "AI is unavailable; showing the local version."
    );
  }
}


function closeModal() {

  const modal =
    $("#aiModal");

  if (!modal) {
    return;
  }

  modal.classList.add(
    "hidden"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );
}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderEverything() {

  renderHome();

  renderFlash();

  renderExplain();

  renderExcite();

  renderOpportunities();

  renderSaved();

  renderRadar();

  renderSwiping();

  renderBlindspot();
}


function showLoadingState() {

  const html = `
    <div class="loading-card">
      Loading Gen Z Pulse...
    </div>
  `;

  [
    "#homeNewsGrid",
    "#flashNewsGrid",
    "#explainGrid",
    "#radarGrid"
  ]
    .forEach(
      selector => {

        const element =
          $(selector);

        if (element) {

          element.innerHTML =
            html;
        }
      }
    );
}


/* =========================================================
   LOAD NEWS
========================================================= */

async function loadNews() {

  if (state.loading) {
    return;
  }

  state.loading =
    true;

  showLoadingState();

  try {

    const response =
      await fetch(
        NEWS_API,
        {
          headers: {
            Accept:
              "application/json"
          },

          cache:
            "no-store"
        }
      );

    if (!response.ok) {

      throw new Error(
        `News API returned ${response.status}`
      );
    }

    const payload =
      await response.json();

    const normalized =
      extractArticles(
        payload
      )
        .map(
          (
            article,
            index
          ) =>
            normalizeArticle(
              article,
              index
            )
        )
        .filter(Boolean);

    state.articles =
      normalized.length
        ? normalized
        : fallbackArticles.map(
            normalizeArticle
          );

  } catch (error) {

    console.warn(
      "Live news unavailable; using backup stories.",
      error
    );

    state.articles =
      fallbackArticles.map(
        normalizeArticle
      );

    showToast(
      "Showing backup stories because live news is unavailable."
    );

  } finally {

    state.loading =
      false;

    state.swipingIndex =
      0;

    state.blindspotIndex =
      0;

    state.homeSearch =
      "";

    state.flashSearch =
      "";

    state.flashCategory =
      "All";

    renderEverything();
  }
}


/* =========================================================
   RADAR / BLINDSPOT
========================================================= */

async function syncInterestsToCloud() {

  if (!state.user?.id) {
    return;
  }

  try {

    const response =
      await fetch(
        INTERESTS_API,
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
                state.user.id,

              interests:
                state.blindspotCategories
            })
        }
      );

    const data =
      await response
        .json()
        .catch(
          () => ({})
        );

    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Unable to sync Radar preferences."
      );
    }

    if (
      Array.isArray(
        data.interests
      )
    ) {

      state.blindspotCategories =
        data.interests;

      saveBlindspotCategories();

      renderRadar();
    }

  } catch (error) {

    console.warn(
      "Radar cloud sync failed:",
      error
    );

    showToast(
      "Radar saved locally; cloud sync failed."
    );
  }
}


function toggleBlindspotCategory(
  category
) {

  const index =
    state.blindspotCategories
      .findIndex(
        item =>
          categoryKey(
            item
          ) ===
          categoryKey(
            category
          )
      );

  if (index === -1) {

    state.blindspotCategories.push(
      category
    );

    showToast(
      `${category} added to Blindspot`
    );

  } else {

    state.blindspotCategories.splice(
      index,
      1
    );

    showToast(
      `${category} removed from Blindspot`
    );
  }

  saveBlindspotCategories();

  syncInterestsToCloud();

  state.swipingIndex =
    0;

  state.blindspotIndex =
    0;

  renderRadar();

  renderSwiping();

  renderBlindspot();
}


function resetRadar() {

  state.blindspotCategories =
    [
      "Sports",
      "Gaming",
      "Entertainment"
    ];

  saveBlindspotCategories();

  syncInterestsToCloud();

  state.swipingIndex =
    0;

  state.blindspotIndex =
    0;

  renderEverything();

  showToast(
    "Radar preferences reset"
  );
}


/* =========================================================
   CLOUD ACCOUNT DATA
========================================================= */

async function loadCloudUserData() {

  if (!state.user?.id) {
    return;
  }

  try {

    /* ================================================
       LOAD SAVED STORIES
    ================================================ */

    const savedResponse =
      await fetch(
        `${SAVED_API}/${encodeURIComponent(
          state.user.id
        )}`,
        {
          headers: {
            Accept:
              "application/json"
          },

          cache:
            "no-store"
        }
      );

    if (
      savedResponse.ok
    ) {

      const savedData =
        await savedResponse
          .json()
          .catch(
            () => ({})
          );

      if (
        savedData.success
      ) {

        state.savedArticles =
          (
            savedData.savedStories ||
            []
          )
            .map(
              (
                story,
                index
              ) =>
                normalizeArticle(
                  story,
                  index
                )
            )
            .filter(Boolean);

        state.savedIds =
          state.savedArticles.map(
            story =>
              String(
                story.id
              )
          );

        saveSavedState();
      }
    }


    /* ================================================
       LOAD RADAR INTERESTS
    ================================================ */

    const interestsResponse =
      await fetch(
        `${INTERESTS_API}/${encodeURIComponent(
          state.user.id
        )}`,
        {
          headers: {
            Accept:
              "application/json"
          },

          cache:
            "no-store"
        }
      );

    if (
      interestsResponse.ok
    ) {

      const interestsData =
        await interestsResponse
          .json()
          .catch(
            () => ({})
          );

      if (
        interestsData.success &&
        Array.isArray(
          interestsData.interests
        )
      ) {

        const valid =
          interestsData.interests
            .filter(
              interest =>
                availableCategories.some(
                  category =>
                    categoryKey(
                      category
                    ) ===
                    categoryKey(
                      interest
                    )
                )
            );

        if (valid.length) {

          state.blindspotCategories =
            valid;

          saveBlindspotCategories();
        }
      }
    }

    renderEverything();

  } catch (error) {

    console.warn(
      "Cloud account data could not be loaded:",
      error
    );
  }
}


/* =========================================================
   ACCOUNT
========================================================= */

function loadCurrentUser() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "gengpulse_user"
      ) || "null"
    );

  } catch {

    return null;
  }
}


function saveCurrentUser(
  user
) {

  state.user =
    user || null;

  if (user) {

    localStorage.setItem(
      "gengpulse_user",
      JSON.stringify(
        user
      )
    );

  } else {

    localStorage.removeItem(
      "gengpulse_user"
    );

    state.savedIds =
      [];

    state.savedArticles =
      [];

    saveSavedState();
  }

  updateAccountButton();
}


function updateAccountButton() {

  const button =
    $("#signInBtn");

  if (!button) {
    return;
  }

  button.textContent =
    state.user?.name
      ? `Hi, ${String(
          state.user.name
        ).split(" ")[0]}`
      : "Sign in";

  button.title =
    state.user?.email ||
    "Sign in to Gen Z Pulse";
}


function setAccountModal(
  html,
  title =
    "Sign in to Gen Z Pulse"
) {

  const modal =
    $("#aiModal");

  if (!modal) {
    return;
  }

  $("#modalIcon").textContent =
    "â—‹";

  $("#modalLabel").textContent =
    "ACCOUNT";

  $("#modalTitle").textContent =
    title;

  $("#modalContent").innerHTML =
    html;

  modal.classList.remove(
    "hidden"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );
}


function openSignInModal() {

  setAccountModal(`
    <form
      id="accountForm"
      class="account-form"
      data-mode="signin"
      novalidate
    >

      <label>
        Email

        <input
          id="accountEmail"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
        >
      </label>

      <label>
        Password

        <input
          id="accountPassword"
          type="password"
          autocomplete="current-password"
          placeholder="Your password"
          required
        >
      </label>

      <button
        class="account-submit"
        type="submit"
      >
        Sign in
      </button>

      <p class="account-switch">
        New here?

        <button
          type="button"
          class="account-link"
          id="showSignupBtn"
        >
          Create account
        </button>
      </p>

      <div
        class="account-message"
        id="accountMessage"
        role="status"
        aria-live="polite"
      ></div>

    </form>
  `);
}


function openSignupModal() {

  setAccountModal(
    `
      <form
        id="accountForm"
        class="account-form"
        data-mode="signup"
        novalidate
      >

        <label>
          Name

          <input
            id="accountName"
            type="text"
            autocomplete="name"
            placeholder="Your name"
            required
          >
        </label>

        <label>
          Email

          <input
            id="accountEmail"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            required
          >
        </label>

        <label>
          Password

          <input
            id="accountPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Create a password"
            minlength="6"
            required
          >
        </label>

        <button
          class="account-submit"
          type="submit"
        >
          Create account
        </button>

        <p class="account-switch">
          Already have an account?

          <button
            type="button"
            class="account-link"
            id="showSigninBtn"
          >
            Sign in
          </button>
        </p>

        <div
          class="account-message"
          id="accountMessage"
          role="status"
          aria-live="polite"
        ></div>

      </form>
    `,
    "Create your Gen Z Pulse account"
  );
}


function openAccountModal() {

  if (!state.user) {

    openSignInModal();

    return;
  }

  setAccountModal(
    `
      <div class="account-profile">

        <div class="account-profile-mark">
          ${escapeHtml(
            String(
              state.user.name ||
              "G"
            )
              .charAt(0)
              .toUpperCase()
          )}
        </div>

        <div>

          <strong>
            ${escapeHtml(
              state.user.name ||
              "Gen Z Pulse user"
            )}
          </strong>

          <span>
            ${escapeHtml(
              state.user.email ||
              ""
            )}
          </span>

        </div>

      </div>

      <div class="account-status">

        <span>
          Plan
        </span>

        <strong>
          ${
            state.user.subscription ===
            "plus"
              ? "Gen Z Plus"
              : "Free"
          }
        </strong>

      </div>

      <button
        class="account-submit secondary-account"
        id="signOutBtn"
        type="button"
      >
        Sign out
      </button>
    `,
    "Your Gen Z Pulse account"
  );
}


async function handleAccountSubmit(
  form
) {

  const mode =
    form.dataset.mode ||
    "signin";

  const message =
    $("#accountMessage");

  const submit =
    form.querySelector(
      'button[type="submit"]'
    );

  const email =
    $("#accountEmail")
      ?.value
      .trim()
      .toLowerCase() ||
    "";

  const password =
    $("#accountPassword")
      ?.value ||
    "";

  const name =
    $("#accountName")
      ?.value
      .trim() ||
    "";

  if (
    mode === "signup" &&
    !name
  ) {

    message.textContent =
      "Please enter your name.";

    return;
  }

  if (
    !email ||
    !password
  ) {

    message.textContent =
      "Please enter your email and password.";

    return;
  }

  if (
    mode === "signup" &&
    password.length < 6
  ) {

    message.textContent =
      "Password must be at least 6 characters.";

    return;
  }

  submit.disabled =
    true;

  submit.textContent =
    mode === "signup"
      ? "Creating..."
      : "Signing in...";

  message.textContent =
    "";

  try {

    const response =
      await fetch(
        mode === "signup"
          ? SIGNUP_API
          : SIGNIN_API,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(
              mode === "signup"
                ? {
                    name,
                    email,
                    password
                  }
                : {
                    email,
                    password
                  }
            )
        }
      );

    const data =
      await response
        .json()
        .catch(
          () => ({})
        );

    if (
      !response.ok ||
      !data.success
    ) {

      throw new Error(
        data.message ||
        "Account request failed."
      );
    }

    saveCurrentUser(
      data.user
    );

    await loadCloudUserData();

    closeModal();

    showToast(
      mode === "signup"
        ? "Account created successfully."
        : "Signed in successfully."
    );

    renderEverything();

  } catch (error) {

    message.textContent =
      error.message ||
      "Unable to complete the request.";

  } finally {

    submit.disabled =
      false;

    submit.textContent =
      mode === "signup"
        ? "Create account"
        : "Sign in";
  }
}


/* =========================================================
   GEN Z PLUS
========================================================= */

function openPlusModal(
  message = ""
) {

  const modal =
    $("#aiModal");

  const content =
    $("#modalContent");

  if (
    !modal ||
    !content
  ) {
    return;
  }

  $("#modalIcon").textContent =
    "+";

  $("#modalLabel").textContent =
    "GEN Z PLUS";

  $("#modalTitle").textContent =
    "â‚¹49 / month";

  if (
    state.user?.subscription ===
    "plus"
  ) {

    content.innerHTML = `
      <div class="plus-active">

        <strong>
          You already have Gen Z Plus.
        </strong>

        <span>
          Enjoy deeper AI explanations,
          stronger personalization and
          premium reading features.
        </span>

      </div>

      <button
        class="account-submit secondary-account"
        id="closePlusBtn"
        type="button"
      >
        Close
      </button>
    `;

  } else {

    content.innerHTML = `
      <div class="plus-copy">

        <p>
          Upgrade Gen Z Pulse with
          premium reading features.
        </p>

        <div class="plus-features">

          <span>
            âœ“ Deeper AI explanations
          </span>

          <span>
            âœ“ Stronger personalization
          </span>

          <span>
            âœ“ Premium reading features
          </span>

        </div>

        <div class="plus-note">
          â‚¹49 payment through Razorpay
          for Gen Z Plus.
        </div>

      </div>

      <button
        class="account-submit"
        id="plusCheckoutBtn"
        type="button"
      >
        ${
          state.user
            ? "Upgrade to Gen Z Plus â€” â‚¹49"
            : "Sign in to continue"
        }
      </button>

      <div
        class="account-message"
        id="plusMessage"
        role="status"
        aria-live="polite"
      >
        ${escapeHtml(message)}
      </div>
    `;
  }

  modal.classList.remove(
    "hidden"
  );

  modal.setAttribute(
    "aria-hidden",
    "false"
  );
}


async function loadRazorpayCheckout() {

  if (
    window.Razorpay
  ) {
    return true;
  }

  await new Promise(
    (
      resolve,
      reject
    ) => {

      const existing =
        document.querySelector(
          'script[data-rzp="checkout"]'
        );

      if (existing) {

        existing.addEventListener(
          "load",
          () => resolve()
        );

        existing.addEventListener(
          "error",
          reject
        );

        return;
      }

      const script =
        document.createElement(
          "script"
        );

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.dataset.rzp =
        "checkout";

      script.onload =
        resolve;

      script.onerror =
        reject;

      document.head.appendChild(
        script
      );
    }
  );

  return !!window.Razorpay;
}


async function startPlusCheckout(){

  if(!state.user){

    openSignInModal();

    showToast(
      "Sign in before upgrading to Gen Z Plus."
    );

    return;
  }

  const message =
    $("#plusMessage");

  const button =
    $("#plusCheckoutBtn");

  if(!button)return;

  try{

    button.disabled = true;

    button.textContent =
      "Preparing checkout...";

    if(message){
      message.textContent = "";
    }

    const ready =
      await loadRazorpayCheckout();

    if(!ready){

      throw new Error(
        "Razorpay checkout could not be loaded."
      );
    }

    const response =
      await fetch(
        PLUS_ORDER_API,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            userId:
              state.user?.id || "",

            email:
              state.user?.email || ""
          })
        }
      );

    const data =
      await response
        .json()
        .catch(() => ({}));

    if(
      !response.ok ||
      !data.success
    ){

      throw new Error(
        data.message ||
        "Unable to create the Gen Z Plus order."
      );
    }

    if(data.userId){

      state.user = {
        ...state.user,
        id: data.userId
      };

      saveCurrentUser(
        state.user
      );
    }

    const options = {

      key:
        data.razorpayKeyId,

      amount:
        data.amount,

      order_id:
        data.orderId ||
        data.order?.id,

      currency:
        data.currency ||
        "INR",

      name:
        "Gen Z Pulse",

      description:
        "Gen Z Plus - \u20B9 49",

      prefill: {

        name:
          state.user.name || "",

        email:
          state.user.email || ""
      },

      theme: {

        color:
          "#26734d"
      },

      handler:
        async function(payment){

          try{

            const verifyResponse =
              await fetch(
                PLUS_VERIFY_API,
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json"
                  },

                  body: JSON.stringify({

                    userId:
                      state.user?.id || "",

                    email:
                      state.user?.email || "",

                    razorpay_order_id:
                      payment.razorpay_order_id,

                    razorpay_payment_id:
                      payment.razorpay_payment_id,

                    razorpay_signature:
                      payment.razorpay_signature
                  })
                }
              );

            const result =
              await verifyResponse
                .json()
                .catch(() => ({}));

            if(
              !verifyResponse.ok ||
              !result.success
            ){

              throw new Error(
                result.message ||
                "Payment verification failed."
              );
            }

            saveCurrentUser(
              result.user ||
              {
                ...state.user,
                subscription:
                  "plus"
              }
            );

            closeModal();

            showToast(
              "Gen Z Plus activated successfully."
            );

            renderEverything();

          }catch(error){

            console.error(
              "Payment verification error:",
              error
            );

            if(message){

              message.textContent =
                error.message ||
                "Payment verification failed.";
            }
          }
        },

      modal: {

        ondismiss:
          function(){

            button.disabled = false;

            button.textContent =
              "Upgrade to Gen Z Plus - \u20B9 49";
          }
      }
    };

    const rzp =
      new Razorpay(options);

    rzp.open();

  }catch(error){

    console.error(
      "Gen Z Plus checkout error:",
      error
    );

    if(message){

      message.textContent =
        error.message ||
        "Unable to start payment.";
    }

    button.disabled = false;

    button.textContent =
      "Upgrade to Gen Z Plus - \u20B9 49";
  }
}
function showView(
  viewName
) {

  const target =
    document.getElementById(
      `${viewName}View`
    );

  if (!target) {
    return;
  }

  $all(
    ".view"
  )
    .forEach(
      view => {

        view.hidden =
          true;

        view.classList.remove(
          "active"
        );
      }
    );

  target.hidden =
    false;

  target.classList.add(
    "active"
  );

  $all(
    ".nav-btn"
  )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.view ===
            viewName
        );
      }
    );

  state.currentView =
    viewName;

  if (
    viewName ===
    "radar"
  ) {
    renderRadar();
  }

  if (
    viewName ===
    "swiping"
  ) {
    renderSwiping();
  }

  if (
    viewName ===
    "blindspot"
  ) {
    renderBlindspot();
  }

  if (
    viewName ===
    "saved"
  ) {
    renderSaved();
  }

  window.scrollTo(
    {
      top: 0,
      behavior:
        "smooth"
    }
  );
}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

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


      const save =
        event.target.closest(
          ".save"
        );

      if (
        save?.dataset.id
      ) {

        event.preventDefault();

        event.stopPropagation();

        toggleSave(
          save.dataset.id
        );

        return;
      }


      const ai =
        event.target.closest(
          ".ai-btn"
        );

      if (
        ai?.dataset.id
      ) {

        event.preventDefault();

        event.stopPropagation();

        openAiModal(
          findArticle(
            ai.dataset.id
          ),
          ai.dataset.aiType ||
            "summary"
        );

        return;
      }


      const read =
        event.target.closest(
          ".article-read"
        );

      if (
        read?.dataset.id
      ) {

        event.preventDefault();

        event.stopPropagation();

        readArticle(
          read.dataset.id
        );

        return;
      }


      const notInterested =
        event.target.closest(
          ".not-interested"
        );

      if (
        notInterested?.dataset.id
      ) {

        event.preventDefault();

        event.stopPropagation();

        const article =
          findArticle(
            notInterested.dataset.id
          );

        if (article) {

          if (
            !state.blindspotCategories.some(
              category =>
                categoryKey(
                  category
                ) ===
                categoryKey(
                  article.category
                )
            )
          ) {

            state.blindspotCategories.push(
              article.category
            );
          }

          saveBlindspotCategories();

          syncInterestsToCloud();

          renderSwiping();

          renderBlindspot();

          renderRadar();

          showToast(
            `${article.category} added to Blindspot`
          );
        }

        return;
      }


      const interest =
        event.target.closest(
          ".interest-btn"
        );

      if (
        interest?.dataset.category
      ) {

        event.preventDefault();

        toggleBlindspotCategory(
          interest.dataset.category
        );

        return;
      }


      const flashCategory =
        event.target.closest(
          "[data-flash-category]"
        );

      if (flashCategory) {

        state.flashCategory =
          flashCategory.dataset.flashCategory ||
          "All";

        renderFlash();

        return;
      }


      const exciteTopic =
        event.target.closest(
          "[data-excite-topic]"
        );

      if (exciteTopic) {

        event.preventDefault();

        const topic =
          exciteTopic.dataset.exciteTopic ||
          "Technology";

        state.flashCategory =
          topic;

        state.flashSearch =
          "";

        showView(
          "flash"
        );

        renderFlash();

        return;
      }
    }
  );


  /* HOME SEARCH */

  $("#homeSearchInput")
    ?.addEventListener(
      "input",
      event => {

        state.homeSearch =
          event.target.value ||
          "";
      }
    );


  $("#homeSearchInput")
    ?.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Enter"
        ) {

          searchNews(
            event.target.value
          );
        }
      }
    );


  $("#homeSearchBtn")
    ?.addEventListener(
      "click",
      () => {

        searchNews(
          $("#homeSearchInput")
            ?.value ||
            ""
        );
      }
    );


  /* FLASH SEARCH */

  $("#flashSearchInput")
    ?.addEventListener(
      "input",
      event => {

        state.flashSearch =
          event.target.value ||
          "";

        renderFlash();
      }
    );


  $("#flashSearchInput")
    ?.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Enter"
        ) {

          searchNews(
            event.target.value
          );
        }
      }
    );


  $("#refreshFlashBtn")
    ?.addEventListener(
      "click",
      loadNews
    );


  /* SWIPING */

  $("#swipeNext")
    ?.addEventListener(
      "click",
      nextSwiping
    );

  $("#swipePrevious")
    ?.addEventListener(
      "click",
      previousSwiping
    );


  /* BLINDSPOT */

  $("#blindspotNext")
    ?.addEventListener(
      "click",
      nextBlindspot
    );

  $("#blindspotPrevious")
    ?.addEventListener(
      "click",
      previousBlindspot
    );


  /* RADAR */

  $("#resetRadarBtn")
    ?.addEventListener(
      "click",
      resetRadar
    );


  /* MODAL */

  $("#closeModal")
    ?.addEventListener(
      "click",
      closeModal
    );

  $("#modalOverlay")
    ?.addEventListener(
      "click",
      closeModal
    );


  /* ACCOUNT */

  $("#signInBtn")
    ?.addEventListener(
      "click",
      openAccountModal
    );


  /* PLUS */

  $("#plusBtn")
    ?.addEventListener(
      "click",
      openPlusModal
    );


  /* ACCOUNT FORM */

  document.addEventListener(
    "submit",
    event => {

      if (
        event.target?.id ===
        "accountForm"
      ) {

        event.preventDefault();

        handleAccountSubmit(
          event.target
        );
      }
    }
  );


  /* ACCOUNT / PLUS BUTTONS */

  document.addEventListener(
    "click",
    event => {

      if (
        event.target?.id ===
        "showSignupBtn"
      ) {

        event.preventDefault();

        openSignupModal();

        return;
      }


      if (
        event.target?.id ===
        "showSigninBtn"
      ) {

        event.preventDefault();

        openSignInModal();

        return;
      }


      if (
        event.target?.id ===
        "signOutBtn"
      ) {

        event.preventDefault();

        saveCurrentUser(
          null
        );

        closeModal();

        showToast(
          "Signed out"
        );

        return;
      }


      if (
        event.target?.id ===
        "plusCheckoutBtn"
      ) {

        event.preventDefault();

        startPlusCheckout();

        return;
      }


      if (
        event.target?.id ===
        "closePlusBtn"
      ) {

        event.preventDefault();

        closeModal();

        return;
      }
    }
  );


  /* PROFILE */

  $("#profileBtn")
    ?.addEventListener(
      "click",
      () => {

        showView(
          "radar"
        );
      }
    );


  /* KEYBOARD */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {
        closeModal();
      }


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
   INIT
========================================================= */

async function init() {

  setupEvents();

  updateAccountButton();

  renderEverything();

  if (state.user?.id) {

    await loadCloudUserData();
  }

  loadNews();
}


document.addEventListener(
  "DOMContentLoaded",
  init
);





