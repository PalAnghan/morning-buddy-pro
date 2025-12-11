/* -------------------------------------------
   🌸 MORNING BUDDY PRO - CLOUD SYNC VERSION
-------------------------------------------- */

// 1) 🔑 Supabase Config (USE YOUR OWN)
const SUPABASE_URL = "https://oyafevedxciqqqzgbwgu.supabase.co"; 
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YWZldmVkeGNpcXFxemdid2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNjA2NDQsImV4cCI6MjA4MDkzNjY0NH0.KB2M7h8s1okT6eiTLF_2IrMQpC1KO5g1tH_l1XlwBmg";

// Initialize Supabase client
const supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("Supabase client:", supa);

// Global
let historyCache = {};
const STUDY_MAX_HOURS = 8;

function el(id) {
  return document.getElementById(id);
}

/* ============================================================
   🔄 SYNC FROM SUPABASE
============================================================ */
async function syncFromSupabase() {
  try {
    console.log("Sync: Loading from Supabase...");
    const { data, error } = await supa.from("daily_logs").select("*");

    if (error) {
      console.error("❌ Supabase load error:", error);
      return;
    }

    console.log("Loaded rows:", data);

    historyCache = {};
    data.forEach((row) => {
      historyCache[row.date] = {
        me: !!row.me,
        friend: !!row.friend,
        studyMe: row.study_me || 0,
        studyFriend: row.study_friend || 0,
      };
    });

    localStorage.setItem("history", JSON.stringify(historyCache));
  } catch (err) {
    console.error("❌ Sync failed:", err);
  }
}

function loadHistory() {
  if (Object.keys(historyCache).length === 0) {
    historyCache = JSON.parse(localStorage.getItem("history") || "{}");
  }
  return historyCache;
}

/* ============================================================
   💾 SAVE TO SUPABASE
============================================================ */
async function saveHistory(h) {
  historyCache = h;
  localStorage.setItem("history", JSON.stringify(h));

  const rows = Object.entries(h).map(([date, v]) => ({
    date,
    me: !!v.me,
    friend: !!v.friend,
    study_me: v.studyMe || 0,
    study_friend: v.studyFriend || 0,
  }));

  console.log("Saving rows:", rows);

  const { data, error } = await supa
    .from("daily_logs")
    .upsert(rows, { onConflict: "date" });

  if (error) console.error("❌ Save error:", error);
  else console.log("✅ Save success:", data);
}

/* ============================================================
   📅 DATE HELPERS
============================================================ */
function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/* ============================================================
   🔥 STREAKS
============================================================ */
function calculateStreak(field) {
  const h = loadHistory();
  let streak = 0;
  const today = new Date();

  while (true) {
    const d = new Date(today);
    d.setDate(today.getDate() - streak);

    const key = d.toISOString().slice(0, 10);
    if (!h[key] || !h[key][field]) break;

    streak++;
  }
  return streak;
}

function loadStreaks() {
  const my = calculateStreak("me");
  const fr = calculateStreak("friend");

  if (el("myStreakText")) el("myStreakText").textContent = `🔥 ${my}`;
  if (el("friendStreakText")) el("friendStreakText").textContent = `🔥 ${fr}`;

  const sum = el("homeStreakSummary");
  if (sum)
    sum.textContent =
      my === 0 && fr === 0
        ? "No streak yet… your first morning will already be special 💖"
        : `You: ${my} days | Her: ${fr} days 💑`;
}

/* ============================================================
   ☀️ WAKE-UP BUTTONS
============================================================ */
function increaseMyStreak() {
  let h = loadHistory();
  const k = todayKey();
  if (!h[k]) h[k] = { me: false, friend: false, studyMe: 0, studyFriend: 0 };
  h[k].me = true;

  saveHistory(h);
  refreshUI();
}

function increaseFriendStreak() {
  let h = loadHistory();
  const k = todayKey();
  if (!h[k]) h[k] = { me: false, friend: false, studyMe: 0, studyFriend: 0 };
  h[k].friend = true;

  saveHistory(h);
  refreshUI();
}

/* ============================================================
   👑 MASCOT
============================================================ */
const mascotLines = [
  "Good morning! I’m proud of you 💕",
  "You’re doing better than you think, princess ✨",
  "Small steps today, big dreams tomorrow 💫",
  "Thank you for taking care of yourself 💖",
  "Your morning magic makes the day brighter 🌸",
];

function rotateMascotMessage() {
  const m = el("mascotMessage");
  if (m) m.textContent = mascotLines[Math.floor(Math.random() * mascotLines.length)];
}

setInterval(rotateMascotMessage, 10000);

/* ============================================================
   📚 STUDY TRACKER
============================================================ */
function saveMyStudy() {
  let h = loadHistory();
  const k = todayKey();
  if (!h[k]) h[k] = { me: false, friend: false, studyMe: 0, studyFriend: 0 };

  h[k].studyMe = parseFloat(el("myStudyInput").value || 0);
  saveHistory(h);
  refreshUI();
}

function saveFriendStudy() {
  let h = loadHistory();
  const k = todayKey();
  if (!h[k]) h[k] = { me: false, friend: false, studyMe: 0, studyFriend: 0 };

  h[k].studyFriend = parseFloat(el("friendStudyInput").value || 0);
  saveHistory(h);
  refreshUI();
}

/* ============================================================
   🧹 RESET DATA
============================================================ */
function confirmReset() {
  historyCache = {};
  localStorage.removeItem("history");

  supa.from("daily_logs").delete().neq("date", null);

  refreshUI();
  alert("All progress reset 💕✨");
}

/* ============================================================
   🔄 UI REFRESHER
============================================================ */
function refreshUI() {
  loadStreaks();
}

/* ============================================================
   🚀 ON LOAD
============================================================ */
window.onload = async () => {
  console.log("Page loaded. Syncing...");
  await syncFromSupabase();
  refreshUI();
  rotateMascotMessage();

  console.log("Initialization complete!");
};
