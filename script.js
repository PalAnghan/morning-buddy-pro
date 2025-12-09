/* -------------------------------------------
   🌸 MORNING BUDDY PRO - FULL SCRIPT.JS
-------------------------------------------- */

const STUDY_MAX_HOURS = 8; // daily study goal

// Helper to get element by id
function el(id) {
  return document.getElementById(id);
}

/* HISTORY HELPERS */
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadHistory() {
  return JSON.parse(localStorage.getItem("history") || "{}");
}

function saveHistory(h) {
  localStorage.setItem("history", JSON.stringify(h));
}

/* TABS */
function showScreen(name, btn) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active-screen"));
  el("screen-" + name).classList.add("active-screen");

  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

/* LOTTIE */
if (window.lottie && el("lottieBox")) {
  lottie.loadAnimation({
    container: el("lottieBox"),
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "https://assets4.lottiefiles.com/packages/lf20_totrpclr.json"
  });
}

/* MASCOT */
const mascotLines = [
  "Good morning! I’m proud of you 💕",
  "You’re doing better than you think, princess ✨",
  "Small steps today, big dreams tomorrow 💫",
  "Thank you for taking care of yourself 💖",
  "Your morning magic makes the day brighter 🌸"
];

function rotateMascotMessage() {
  const m = el("mascotMessage");
  if (!m) return;
  const msg = mascotLines[Math.floor(Math.random() * mascotLines.length)];
  m.textContent = msg;
}

setInterval(rotateMascotMessage, 12000);

/* GOALS */
function saveGoals() {
  const myGoal = el("myGoal").value;
  const friendGoal = el("friendGoal").value;
  if (!myGoal || !friendGoal) {
    alert("Please set BOTH times 💕");
    return;
  }
  localStorage.setItem("myGoal", myGoal);
  localStorage.setItem("friendGoal", friendGoal);
  if (el("goalStatus")) {
    el("goalStatus").textContent = `🌅 Your Goal: ${myGoal} | 👸 Her Goal: ${friendGoal}`;
  }
}

/* ALARM */
let alarmSound = new Audio("alarm.mp3");
alarmSound.loop = true;

function saveAlarmTime() {
  const time = el("alarmTime").value;
  if (!time) return alert("Choose an alarm time!");

  localStorage.setItem("alarmTime", time);
  if (el("alarmSavedText")) el("alarmSavedText").textContent = "⏰ Alarm saved: " + time;

  if ("Notification" in window) Notification.requestPermission();
}

function playAlarm() {
  alarmSound.play();
  if (navigator.vibrate) navigator.vibrate([500, 300, 500]);
}

function stopAlarm() {
  alarmSound.pause();
  alarmSound.currentTime = 0;
}

function sendMorningNotification() {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("🌞 Wake Up!", {
      body: "Your cute morning alarm is ringing 💕"
    });
  }
}

setInterval(() => {
  const saved = localStorage.getItem("alarmTime");
  if (!saved) return;

  const now = new Date();
  const current =
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0");

  if (current === saved) {
    playAlarm();
    sendMorningNotification();
  }
}, 60000);

/* ACTIVITIES */
function addActivity(type) {
  const map = {
    essentials: el("essentialInput"),
    fitness: el("fitnessInput"),
    study: el("studyInput"),
    self: el("selfInput")
  };
  const inp = map[type];
  if (!inp) return;
  const value = inp.value.trim();
  if (!value) return;

  let list = JSON.parse(localStorage.getItem(type) || "[]");
  list.push(value);
  localStorage.setItem(type, JSON.stringify(list));
  inp.value = "";
  loadActivities();
}

function loadActivities() {
  ["essentials", "fitness", "study", "self"].forEach(type => {
    const container = el(type + "List");
    if (!container) return;
    const list = JSON.parse(localStorage.getItem(type) || "[]");
    container.innerHTML = "";
    list.forEach((item, i) => {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.innerHTML = `${item} <span onclick="removeActivity('${type}',${i})">x</span>`;
      container.appendChild(chip);
    });
  });
}

function removeActivity(type, i) {
  let list = JSON.parse(localStorage.getItem(type) || "[]");
  list.splice(i, 1);
  localStorage.setItem(type, JSON.stringify(list));
  loadActivities();
}

/* FUNNY MESSAGES */
const messages = [
  "Wake up, sleepy queen 💖",
  "If you wake up now, you gain +100 cute points ✨",
  "Your dreams are beautiful but morning is waiting 🌸",
  "Proud of your effort already 💕",
  "Wake up and shine like a princess 👑"
];

function sendMessage() {
  const msg = messages[Math.floor(Math.random() * messages.length)];
  typeWriter(msg);
}

function typeWriter(text, i = 0) {
  const box = el("messageBox");
  if (!box) return;
  box.innerHTML = text.substring(0, i);
  if (i < text.length) setTimeout(() => typeWriter(text, i + 1), 35);
}

/* STREAKS */
function increaseMyStreak() {
  let s = parseInt(localStorage.getItem("myStreak") || "0") + 1;
  localStorage.setItem("myStreak", s);

  let h = loadHistory();
  let key = todayKey();
  if (!h[key]) h[key] = {};
  h[key].me = true;
  saveHistory(h);

  loadStreaks();
  updateChart();
  buildCalendar();
  updateBadges();
}

function increaseFriendStreak() {
  let s = parseInt(localStorage.getItem("friendStreak") || "0") + 1;
  localStorage.setItem("friendStreak", s);

  let h = loadHistory();
  let key = todayKey();
  if (!h[key]) h[key] = {};
  h[key].friend = true;
  saveHistory(h);

  loadStreaks();
  updateChart();
  buildCalendar();
  updateBadges();
}

function loadStreaks() {
  const my = parseInt(localStorage.getItem("myStreak") || "0");
  const fr = parseInt(localStorage.getItem("friendStreak") || "0");

  if (el("myStreakText")) el("myStreakText").textContent = `🔥 ${my}`;
  if (el("friendStreakText")) el("friendStreakText").textContent = `🔥 ${fr}`;

  if (el("comboStreakText")) {
    if (my === fr && my > 0) {
      el("comboStreakText").textContent = `💥 Combo Streak: ${my} days!`;
    } else {
      el("comboStreakText").textContent = "";
    }
  }

  const homeSummary = el("homeStreakSummary");
  if (homeSummary) {
    if (my === 0 && fr === 0) {
      homeSummary.textContent = "No streak yet… your first morning will already be special 💖";
    } else {
      homeSummary.textContent = `You: ${my} days | Her: ${fr} days. Keep going 💑`;
    }
  }

  updateBattleBar(my, fr);
  updateBattleText(my, fr);
}

function updateBattleBar(my, fr) {
  const total = my + fr;
  const meBar = el("meBar");
  const friendBar = el("friendBar");
  if (!meBar || !friendBar) return;

  if (total === 0) {
    meBar.style.width = "0%";
    friendBar.style.width = "0%";
    return;
  }
  meBar.style.width = (my / total) * 100 + "%";
  friendBar.style.width = (fr / total) * 100 + "%";
}

function updateBattleText(my, fr) {
  const b = el("battleText");
  if (!b) return;

  if (my === 0 && fr === 0) b.textContent = "Start your morning battle ⚔️";
  else if (my > fr) b.textContent = `You lead by ${my - fr} days 👑`;
  else if (fr > my) b.textContent = `She leads by ${fr - my} days 👸`;
  else b.textContent = "Perfect tie 💞";
}

/* WAKE-UP 7-DAY CHART */
let progressChart;

function updateChart() {
  const canvas = el("progressChart");
  if (!canvas || !window.Chart) return;

  const h = loadHistory();
  const labels = [];
  const meData = [];
  const frData = [];

  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${day}`;
    const info = h[key] || {};

    labels.push(day);
    meData.push(info.me ? 1 : 0);
    frData.push(info.friend ? 1 : 0);
  }

  const ctx = canvas.getContext("2d");
  if (progressChart) progressChart.destroy();

  progressChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "You", data: meData, borderWidth: 2, tension: 0.3 },
        { label: "Her", data: frData, borderWidth: 2, tension: 0.3 }
      ]
    }
  });
}

/* STUDY TRACKER */
function saveMyStudy() {
  const input = el("myStudyInput");
  if (!input) return;
  let hours = parseFloat(input.value || "0");
  if (hours < 0) hours = 0;

  let h = loadHistory();
  let key = todayKey();
  if (!h[key]) h[key] = {};
  h[key].studyMe = hours;
  saveHistory(h);

  updateStudyUI();
  updateStudyChart();
  updateBadges();
}

function saveFriendStudy() {
  const input = el("friendStudyInput");
  if (!input) return;
  let hours = parseFloat(input.value || "0");
  if (hours < 0) hours = 0;

  let h = loadHistory();
  let key = todayKey();
  if (!h[key]) h[key] = {};
  h[key].studyFriend = hours;
  saveHistory(h);

  updateStudyUI();
  updateStudyChart();
  updateBadges();
}

function updateStudyUI() {
  const h = loadHistory();
  const key = todayKey();
  const info = h[key] || {};
  const myHours = info.studyMe || 0;
  const frHours = info.studyFriend || 0;

  if (el("myStudyHoursText")) el("myStudyHoursText").textContent = myHours + " h";
  if (el("friendStudyHoursText")) el("friendStudyHoursText").textContent = frHours + " h";

  const myP = Math.min(myHours / STUDY_MAX_HOURS, 1);
  const frP = Math.min(frHours / STUDY_MAX_HOURS, 1);

  if (el("myStudyCircleInner")) el("myStudyCircleInner").style.setProperty("--p", myP);
  if (el("friendStudyCircleInner")) el("friendStudyCircleInner").style.setProperty("--p", frP);

  const summary = el("studySummaryText");
  if (!summary) return;

  if (myHours === 0 && frHours === 0) {
    summary.textContent = "Log today's study 🌱";
  } else if (myHours > frHours) {
    summary.textContent = `You studied more today (${myHours}h vs ${frHours}h). Proud of you 💪`;
  } else if (frHours > myHours) {
    summary.textContent = `She studied more today (${frHours}h vs ${myHours}h). Support her 💕`;
  } else {
    summary.textContent = `Perfect match (${myHours}h each)! 💞`;
  }
}

/* STUDY 7-DAY CHART */
let studyChart;

function updateStudyChart() {
  const canvas = el("studyChart");
  if (!canvas || !window.Chart) return;

  const h = loadHistory();
  const labels = [];
  const meData = [];
  const frData = [];

  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${day}`;
    const info = h[key] || {};

    labels.push(day);
    meData.push(info.studyMe || 0);
    frData.push(info.studyFriend || 0);
  }

  const ctx = canvas.getContext("2d");
  if (studyChart) studyChart.destroy();

  studyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "You", data: meData, borderWidth: 2, tension: 0.3 },
        { label: "Her", data: frData, borderWidth: 2, tension: 0.3 }
      ]
    }
  });
}

/* CALENDAR with stagger fade */
function buildCalendar() {
  const grid = el("calendarGrid");
  const header = el("calendarHeader");
  if (!grid || !header) return;

  const h = loadHistory();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const dayNames = ["S","M","T","W","T","F","S"];

  header.textContent = `${monthNames[month]} ${year}`;
  grid.innerHTML = "";

  let cellIndex = 0;

  // Day names row
  dayNames.forEach(d => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell calendar-day-name";
    cell.textContent = d;
    cell.style.setProperty("--i", cellIndex++);
    grid.appendChild(cell);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Empty leading cells
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell dim";
    cell.style.setProperty("--i", cellIndex++);
    grid.appendChild(cell);
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    const mStr = String(month + 1).padStart(2, "0");
    const dStr = String(d).padStart(2, "0");
    const key = `${year}-${mStr}-${dStr}`;
    const info = h[key];

    if (info && info.me && info.friend) cell.classList.add("both-day");
    else if (info && info.me) cell.classList.add("me-day");
    else if (info && info.friend) cell.classList.add("friend-day");

    if (info && (info.studyMe || info.studyFriend)) {
      cell.classList.add("study-day");
    }

    cell.textContent = d;
    cell.style.setProperty("--i", cellIndex++);
    grid.appendChild(cell);
  }
}

/* BADGES */
function updateBadges() {
  const badgeList = el("badgeList");
  if (!badgeList) return;
  badgeList.innerHTML = "";

  const h = loadHistory();
  let totalMy = 0, totalHer = 0, both = 0;
  let totalMyStudy = 0, totalHerStudy = 0;

  Object.values(h).forEach(d => {
    if (d.me) totalMy++;
    if (d.friend) totalHer++;
    if (d.me && d.friend) both++;
    if (d.studyMe) totalMyStudy += d.studyMe;
    if (d.studyFriend) totalHerStudy += d.studyFriend;
  });

  function addBadge(txt) {
    const span = document.createElement("span");
    span.className = "reward-badge";
    span.textContent = txt;
    badgeList.appendChild(span);
  }

  // Wake-up badges
  if (totalMy > 0 || totalHer > 0) addBadge("🚀 First Morning Logged");
  if (totalMy >= 3) addBadge("🔥 3-Day You Streak");
  if (totalHer >= 3) addBadge("👸 She’s Consistent");
  if (both >= 3) addBadge("💜 Teamwork Trio");
  if (both >= 7) addBadge("🌈 Perfect Partners");

  // Study badges
  if (totalMyStudy >= 1 || totalHerStudy >= 1) addBadge("📚 First Study Logged");
  if (totalMyStudy >= 15) addBadge("🔥 Study Warrior (You)");
  if (totalHerStudy >= 15) addBadge("👸 Study Princess");
  if (totalMyStudy + totalHerStudy >= 30) addBadge("🏆 30+ Hour Study Champions");
}

/* RESET MODAL */
function resetStreaks() {
  el("resetModal").style.display = "flex";
}

function closeResetModal() {
  el("resetModal").style.display = "none";
}

function confirmReset() {
  localStorage.setItem("myStreak", 0);
  localStorage.setItem("friendStreak", 0);
  localStorage.removeItem("history");

  loadStreaks();
  updateChart();
  updateStudyChart();
  buildCalendar();
  updateBadges();

  closeResetModal();

  setTimeout(() => {
    alert("All progress reset, princess 💕✨");
  }, 150);
}

/* ON LOAD */
window.onload = () => {
  showScreen("home", document.querySelector(".tab-btn.active"));
  rotateMascotMessage();

  loadActivities();
  loadStreaks();
  updateChart();
  updateStudyUI();
  updateStudyChart();
  buildCalendar();
  updateBadges();

  const myGoal = localStorage.getItem("myGoal");
  const frGoal = localStorage.getItem("friendGoal");
  if (myGoal && frGoal) {
    if (el("goalStatus")) {
      el("goalStatus").textContent =
        `🌅 Your Goal: ${myGoal} | 👸 Her Goal: ${frGoal}`;
    }
    if (el("myGoal")) el("myGoal").value = myGoal;
    if (el("friendGoal")) el("friendGoal").value = frGoal;
  }

  const alarmTime = localStorage.getItem("alarmTime");
  if (alarmTime) {
    if (el("alarmSavedText")) el("alarmSavedText").textContent = "⏰ Alarm saved: " + alarmTime;
    if (el("alarmTime")) el("alarmTime").value = alarmTime;
  }

  rotateMascotMessage();
};
