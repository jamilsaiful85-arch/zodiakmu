// =============================================
// STATE
// =============================================
let currentUser = { nama: "", zodiak: null, mood: null };
let chatHistory = [];
let activeTab = "motivasi";
let comments = JSON.parse(localStorage.getItem("zodiak_comments") || "[]");
const CLAUDE_API = "https://api.anthropic.com/v1/messages";

// =============================================
// INIT
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  initStarCanvas();
  initCursor();
  populateDays();
  renderComments();
  updateVisitorCount();
  initNavScroll();
  initSmoothScroll();
});

// =============================================
// STAR CANVAS
// =============================================
function initStarCanvas() {
  const canvas = document.getElementById("starCanvas");
  const ctx = canvas.getContext("2d");
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createStars();
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random(),
        speed: Math.random() * 0.003 + 0.001,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now() / 1000;
    stars.forEach(s => {
      const a = 0.3 + 0.7 * Math.abs(Math.sin(now * s.speed * 5 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a * 0.7})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
}

// =============================================
// CURSOR BLOB
// =============================================
function initCursor() {
  const blob = document.getElementById("cursorBlob");
  document.addEventListener("mousemove", e => {
    blob.style.left = e.clientX + "px";
    blob.style.top = e.clientY + "px";
  });
}

// =============================================
// DAYS POPULATE
// =============================================
function populateDays() {
  const sel = document.getElementById("tanggalInput");
  for (let i = 1; i <= 31; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    sel.appendChild(opt);
  }
}

// =============================================
// VISITOR COUNT
// =============================================
function updateVisitorCount() {
  let count = parseInt(localStorage.getItem("zodiak_visitors") || "1247");
  count += Math.floor(Math.random() * 3);
  localStorage.setItem("zodiak_visitors", count);
  const el = document.getElementById("visitorCount");
  if (el) el.textContent = count.toLocaleString("id-ID");
}

// =============================================
// NAVIGATION
// =============================================
function initNavScroll() {
  window.addEventListener("scroll", () => {
    const nav = document.querySelector(".navbar");
    if (window.scrollY > 50) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");

    const sections = ["home", "zodiak-section", "chat-section", "wall-section"];
    let current = "";
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 150) current = id;
    });
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) link.classList.add("active");
    });
  });

  document.getElementById("navToggle")?.addEventListener("click", () => {
    document.querySelector(".nav-links").classList.toggle("open");
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
      document.querySelector(".nav-links")?.classList.remove("open");
    });
  });
}

// =============================================
// REVEAL ZODIAK
// =============================================
function revealZodiak() {
  const nama = document.getElementById("namaInput").value.trim();
  const tanggal = document.getElementById("tanggalInput").value;
  const bulan = document.getElementById("bulanInput").value;

  if (!nama) return showToast("😅 Nama kamu belum diisi nih!");
  if (!tanggal) return showToast("📅 Pilih tanggal lahirmu dulu ya!");
  if (!bulan) return showToast("📅 Pilih bulan lahirmu juga!");

  const zodiakKey = getZodiak(tanggal, bulan);
  if (!zodiakKey) return showToast("Tanggal tidak valid!");

  const btn = document.getElementById("revealBtn");
  btn.querySelector(".btn-text").style.display = "none";
  btn.querySelector(".btn-loader").style.display = "inline";
  btn.disabled = true;

  setTimeout(() => {
    btn.querySelector(".btn-text").style.display = "inline";
    btn.querySelector(".btn-loader").style.display = "none";
    btn.disabled = false;
    displayResult(nama, tanggal, bulan, zodiakKey);
  }, 1200);
}

function displayResult(nama, tanggal, bulan, zodiakKey) {
  const data = ZODIAK_DATA[zodiakKey];
  currentUser = { nama, zodiak: zodiakKey };

  document.getElementById("resultCard").style.display = "block";
  document.getElementById("formCard").style.display = "none";

  document.getElementById("zodiakEmoji").textContent = data.emoji;
  document.getElementById("resultName").textContent = nama;
  document.getElementById("resultZodiak").textContent = data.name;
  document.getElementById("resultTanggal").textContent = tanggal + " " + BULAN_NAMES[parseInt(bulan)];
  document.getElementById("resultElement").textContent = data.element;
  document.querySelector(".result-element").style.color = data.elementColor;
  document.getElementById("heroEmoji").textContent = data.emoji;

  // Traits
  const traitsEl = document.getElementById("resultTraits");
  traitsEl.innerHTML = data.traits.map(t => `<span class="trait-chip" style="border-color:${data.color}44;color:${data.color}">${t}</span>`).join("");

  switchTab("motivasi");

  // Update chat
  document.getElementById("chatUsername").textContent = nama;
  document.getElementById("chatZodiakTag").textContent = data.emoji + " " + data.name;
  document.getElementById("chatAvatar").textContent = data.emoji;
  document.getElementById("commentFrom").textContent = "dari: " + nama + " " + data.emoji;

  document.getElementById("resultCard").scrollIntoView({ behavior: "smooth" });

  // Save for comment
  window._currentUserDisplay = nama + " " + data.emoji;
}

// =============================================
// TABS
// =============================================
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".rtab").forEach(t => t.classList.remove("active"));
  event?.target?.classList.add("active");
  document.querySelectorAll(".rtab").forEach(t => {
    if (t.textContent.toLowerCase().includes(tab.substring(0, 3))) t.classList.add("active");
  });

  const data = ZODIAK_DATA[currentUser.zodiak];
  const el = document.getElementById("tabContent");
  
  let content = "";
  if (tab === "motivasi") {
    const quotes = data.motivasi;
    const tebakanIdx = Math.floor(Math.random() * data.tebakan.length);
    content = `
      <div class="tab-section">
        <div class="tab-title">💫 Kata-kata untuk ${currentUser.nama}</div>
        ${quotes.map((q, i) => `
          <div class="quote-card" style="animation-delay:${i * 0.1}s">
            <span class="quote-num">${i + 1}</span>
            <p>${q}</p>
          </div>
        `).join("")}
      </div>
      <div class="tebakan-box">
        <div class="tab-title">🔮 Kayaknya kamu tuh...</div>
        <p class="tebakan-text">${data.tebakan[tebakanIdx]}</p>
        <button class="btn-tebakan-next" onclick="refreshTebakan()">Tebak lagi 🎲</button>
      </div>
    `;
  } else if (tab === "karakter") {
    content = `
      <div class="tab-section">
        <div class="tab-title">🧠 Profil ${data.name}</div>
        <p class="tab-text">${data.karakter}</p>
        <div class="traits-full">
          ${data.traits.map(t => `<div class="trait-full-chip" style="background:${data.color}22;border-color:${data.color}55;color:${data.color}">${t}</div>`).join("")}
        </div>
        <div class="planet-info">
          <span>🪐 Planet Penguasa: <strong>${data.planet}</strong></span>
          <span>${data.element}</span>
          <span>📅 ${data.dates}</span>
        </div>
      </div>
    `;
  } else if (tab === "ramalan") {
    content = `
      <div class="tab-section">
        <div class="tab-title">🔮 Ramalan ${data.name} Minggu Ini</div>
        <p class="tab-text">${data.ramalan}</p>
        <div class="tebakan-list">
          ${data.tebakan.map(t => `<div class="tebakan-item">✦ ${t}</div>`).join("")}
        </div>
      </div>
    `;
  } else if (tab === "hubungan") {
    content = `
      <div class="tab-section">
        <div class="tab-title">💕 Cinta & Hubungan ${data.name}</div>
        <p class="tab-text">${data.hubungan}</p>
      </div>
    `;
  }

  el.innerHTML = content;
}

function refreshTebakan() {
  const data = ZODIAK_DATA[currentUser.zodiak];
  const tebakanEl = document.querySelector(".tebakan-text");
  const allTebakan = data.tebakan;
  const random = allTebakan[Math.floor(Math.random() * allTebakan.length)];
  if (tebakanEl) {
    tebakanEl.style.opacity = "0";
    setTimeout(() => {
      tebakanEl.textContent = random;
      tebakanEl.style.opacity = "1";
    }, 200);
  }
}

// =============================================
// SHARE
// =============================================
function shareResult() {
  const data = ZODIAK_DATA[currentUser.zodiak];
  const text = `🌟 Hei! Aku ${currentUser.nama}, zodiak ${data.name} ${data.emoji}\n"${data.motivasi[0]}"\n\nCek zodiakmu di ZodiaKu!`;
  if (navigator.share) {
    navigator.share({ title: "ZodiaKu", text });
  } else {
    navigator.clipboard.writeText(text);
    showToast("✅ Teks disalin ke clipboard!");
  }
}

function goToCurhat() {
  document.getElementById("chat-section").scrollIntoView({ behavior: "smooth" });
  const data = ZODIAK_DATA[currentUser.zodiak];
  setTimeout(() => {
    addChatMessage("nova", `Haii ${currentUser.nama}! 🌟 Aku sudah tahu kamu ${data.name} ${data.emoji}. Cerita yuk, lagi gimana hari ini?`);
  }, 500);
}

function resetForm() {
  document.getElementById("formCard").style.display = "block";
  document.getElementById("resultCard").style.display = "none";
  document.getElementById("namaInput").value = "";
  document.getElementById("tanggalInput").value = "";
  document.getElementById("bulanInput").value = "";
  document.getElementById("formCard").scrollIntoView({ behavior: "smooth" });
}

// =============================================
// COMMENTS WALL
// =============================================
function postComment() {
  const text = document.getElementById("commentInput").value.trim();
  if (!text) return showToast("Tulis dulu komentarnya~");
  const from = window._currentUserDisplay || "Anonim ✨";
  const comment = {
    id: Date.now(),
    text,
    from,
    time: new Date().toLocaleDateString("id-ID"),
    color: getRandomColor()
  };
  comments.unshift(comment);
  if (comments.length > 20) comments.pop();
  localStorage.setItem("zodiak_comments", JSON.stringify(comments));
  document.getElementById("commentInput").value = "";
  renderComments();
  showToast("💌 Komentarmu terkirim!");
}

function renderComments() {
  const grid = document.getElementById("commentsGrid");
  if (!grid) return;

  const defaultComments = [
    { id: 1, text: "ZodiaKu keren banget! Tebakannya akurat parah 😭✨", from: "Rizky ♌", time: "Hari ini", color: "#ffd700" },
    { id: 2, text: "Nova AI beneran ngerti perasaan aku, curhat di sini nyaman banget", from: "Dinda ♋", time: "Kemarin", color: "#1e90ff" },
    { id: 3, text: "Akhirnya ada tempat curhat yang asik dan relevan sama zodiak 🥺", from: "Fajar ♐", time: "2 hari lalu", color: "#eccc68" },
    { id: 4, text: "Motivasinya ngena banget, tepat di waktu yang dibutuhkan 💙", from: "Ayu ♍", time: "Minggu lalu", color: "#7bed9f" }
  ];

  const allComments = [...comments, ...defaultComments].slice(0, 12);
  grid.innerHTML = allComments.map(c => `
    <div class="comment-card" style="border-color:${c.color}33">
      <div class="comment-header">
        <span class="comment-from-name" style="color:${c.color}">${c.from}</span>
        <span class="comment-time">${c.time}</span>
      </div>
      <p class="comment-text">${c.text}</p>
    </div>
  `).join("");
}

function getRandomColor() {
  const colors = ["#ff6b81", "#ffd700", "#1e90ff", "#7bed9f", "#a29bfe", "#fd79a8", "#00cec9", "#e17055"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// =============================================
// AI CHAT
// =============================================
function insertTip(text) {
  document.getElementById("chatInput").value = text;
  document.getElementById("chatInput").focus();
}

function setMood(emoji) {
  currentUser.mood = emoji;
  document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  showToast("Mood kamu: " + emoji + " — Nova sudah tahu!");
}

function handleChatKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  input.style.height = "auto";
  addChatMessage("user", text);
  chatHistory.push({ role: "user", content: text });

  showTyping(true);

  try {
    const systemPrompt = buildSystemPrompt();
    const response = await callClaudeAPI(systemPrompt, chatHistory);
    showTyping(false);
    const reply = response;
    chatHistory.push({ role: "assistant", content: reply });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
    addChatMessage("nova", reply);
  } catch (err) {
    showTyping(false);
    addChatMessage("nova", "Aduh, aku lagi gangguan sinyal 😅 Coba lagi sebentar ya~ " + (err.message || ""));
  }
}

function buildSystemPrompt() {
  const zodiakInfo = currentUser.zodiak ? ZODIAK_DATA[currentUser.zodiak] : null;
  const userName = currentUser.nama || "Pengguna";
  const moodInfo = currentUser.mood ? `Mood saat ini: ${currentUser.mood}` : "";

  return `Kamu adalah Nova — AI teman curhat yang hangat, empatik, dan cerdas untuk remaja dan dewasa muda Indonesia. Kamu berbicara dalam Bahasa Indonesia yang kasual, gaul tapi tetap sopan dan supportif (boleh pakai kata-kata seperti "kamu", "aku", "sih", "ya", "dong", "lho", dll sesuai percakapan sehari-hari anak muda).

PROFIL PENGGUNA:
- Nama: ${userName}
- Zodiak: ${zodiakInfo ? zodiakInfo.name + " " + zodiakInfo.emoji : "Belum diisi"}
- Elemen: ${zodiakInfo ? zodiakInfo.element : "-"}
- Planet: ${zodiakInfo ? zodiakInfo.planet : "-"}
- Sifat utama: ${zodiakInfo ? zodiakInfo.traits.join(", ") : "-"}
- ${moodInfo}

CARA KAMU BEKERJA:
1. Analisis karakter tulisan pengguna: perhatikan panjang kalimat, penggunaan tanda baca, emoji, dan nada bicara untuk menebak keadaan psikisnya (overthinking, curhat, butuh motivasi, butuh didengar, dll).
2. Sesuaikan respons dengan zodiak pengguna — misalnya Scorpio butuh respons yang deep dan jujur, Gemini suka respons yang dinamis dan fun, Cancer butuh validasi emosional.
3. Kalau mood pengguna sedang tidak baik, prioritaskan mendengarkan dan validasi dulu SEBELUM memberi solusi.
4. Jangan pernah meremehkan atau mendramatisasi masalah pengguna.
5. Gunakan pengetahuan zodiak secara natural, bukan kaku seperti buku teks.
6. Kalau pengguna curhat, jadilah teman bicara yang nyata — bukan robot yang hanya kasih tips.
7. Sesekali tambahkan insight tentang zodiak yang relevan dengan situasi pengguna.
8. Respons sekitar 2-4 kalimat untuk pertanyaan biasa, dan lebih panjang kalau pengguna sedang curhat serius.
9. Pakai emoji secara natural dan tidak berlebihan.

INGAT: Kamu bukan terapis profesional. Kalau ada tanda-tanda krisis serius, sarankan mereka berbicara dengan orang dewasa terpercaya atau profesional.`;
}

async function callClaudeAPI(systemPrompt, history) {
  const response = await fetch(CLAUDE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: history
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || "API Error " + response.status);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "Maaf, aku tidak bisa menjawab saat ini.";
}

function addChatMessage(role, text) {
  const container = document.getElementById("chatMessages");
  const div = document.createElement("div");
  div.className = `chat-msg ${role}`;

  const formattedText = text.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  if (role === "nova") {
    div.innerHTML = `<div class="msg-avatar">🌙</div><div class="msg-bubble">${formattedText}</div>`;
  } else {
    div.innerHTML = `<div class="msg-bubble">${formattedText}</div><div class="msg-avatar user-av">${currentUser.zodiak ? ZODIAK_DATA[currentUser.zodiak].emoji : "😊"}</div>`;
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping(show) {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.style.display = show ? "flex" : "none";
  if (show) {
    const container = document.getElementById("chatMessages");
    container.scrollTop = container.scrollHeight;
  }
}

function clearChat() {
  chatHistory = [];
  document.getElementById("chatMessages").innerHTML = `
    <div class="chat-msg nova">
      <div class="msg-avatar">🌙</div>
      <div class="msg-bubble">Chat dihapus! Mau mulai cerita lagi? Aku siap dengerin~ 💖</div>
    </div>
  `;
}

// =============================================
// TOAST
// =============================================
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
