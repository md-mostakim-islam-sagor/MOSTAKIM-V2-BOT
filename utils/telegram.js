/**
 * Global Telegram notification utility
 * Usage: global.sendTg("message") anywhere in the bot
 */
const axios = require("axios");
const fs    = require("fs");
const path  = require("path");
const LIVELOG_FILE = path.join(__dirname, "../MAIN/bot-livelog.json");

// ── In-memory circular log buffer (last 100 lines) ─────────────────────────
const LOG_BUFFER_SIZE = 100;
global._logBuffer = global._logBuffer || [];

function _pushLog(level, ...args) {
  const tz   = (global.config && global.config.timeZone) || "Asia/Dhaka";
  const time = new Date().toLocaleTimeString("en-US", { timeZone: tz, hour12: false });
  const text = args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
  const line = `[${time}] [${level}] ${text}`;
  global._logBuffer.push(line);
  if (global._logBuffer.length > LOG_BUFFER_SIZE) global._logBuffer.shift();
  try { fs.writeFileSync(LIVELOG_FILE, JSON.stringify(global._logBuffer)); } catch (_) {}
}

// ── Intercept console.log → buffer ────────────────────────────────────────
const _origLog = console.log.bind(console);
console.log = (...args) => {
  _origLog(...args);
  try { _pushLog("LOG", ...args); } catch (_) {}
};

// ── Escape HTML special chars for Telegram HTML parse mode ─────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── Wrap content in Telegram code block (shows Copy button) ───────────────
function codeBlock(content) {
  return `<pre><code>${escHtml(content)}</code></pre>`;
}

// ── Core send function ─────────────────────────────────────────────────────
function sendTelegram(text, botToken, chatId) {
  if (!botToken || !chatId) return;
  const MAX = 4000;
  const chunks = [];
  for (let i = 0; i < text.length; i += MAX) chunks.push(text.slice(i, i + MAX));
  for (const chunk of chunks) {
    axios.get(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      params: { chat_id: chatId, text: chunk, parse_mode: "HTML" }
    }).catch(() => {});
  }
}

// ── Auto-detect bot name from config.json at runtime ──────────────────────
function _botName() {
  const cfg = global.config || {};
  return escHtml(cfg.BOTNAME || cfg.botName || cfg.name || "Bot");
}

// ── Get current time string ────────────────────────────────────────────────
function _now() {
  const tz = (global.config && global.config.timeZone) || "Asia/Dhaka";
  return new Date().toLocaleString("en-US", {
    timeZone: tz, hour12: true,
    month: "2-digit", day: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/**
 * Setup global.sendTg() using config and intercept console.error/warn
 * Call this once after global.config is populated.
 */
function setupTelegramConsole() {
  const cfg = global.config || {};
  const tg  = cfg.telegramNotify || {};
  if (!tg.enable || !tg.botToken || !tg.chatId) return;

  const token  = tg.botToken;
  const chatId = tg.chatId;

  // ── Global helper ──────────────────────────────────────────────────────
  global.sendTg = (msg) => sendTelegram(String(msg), token, chatId);

  // ── Noise filter: skip Node.js internal warnings & TLS notices ─────────
  const _shouldSkip = (msg) => {
    if (!msg) return false;
    const s = String(msg);
    if (/^\(node:\d+\) Warning:/i.test(s))          return true;
    if (s.includes("NODE_TLS_REJECT_UNAUTHORIZED"))  return true;
    if (s.includes("TLS connections and HTTPS"))     return true;
    if (s.includes("getAllowUnauthorized"))           return true;
    if (s.includes("DeprecationWarning"))            return true;
    if (s.includes("ExperimentalWarning"))           return true;
    return false;
  };

  // ── Override console.error → buffer + Telegram ────────────────────────
  const _origError = console.error.bind(console);
  console.error = (...args) => {
    _origError(...args);
    try {
      const combined = args.map(a => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ");
      _pushLog("ERR", combined);
      if (_shouldSkip(combined)) return;
      const msg =
        `❌ <b>ERROR</b>\n` +
        `⏰ <b>Time:</b> ${_now()}\n` +
        `🤖 <b>Bot:</b> ${_botName()}\n\n` +
        `📋 <b>Detail:</b>\n` +
        codeBlock(combined.slice(0, 3000));
      sendTelegram(msg, token, chatId);
    } catch (_) {}
  };

  // ── Override console.warn → buffer + Telegram ─────────────────────────
  const _origWarn = console.warn.bind(console);
  console.warn = (...args) => {
    _origWarn(...args);
    try {
      const combined = args.map(a => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ");
      _pushLog("WARN", combined);
      if (_shouldSkip(combined)) return;
      const msg =
        `⚠️ <b>WARNING</b>\n` +
        `⏰ <b>Time:</b> ${_now()}\n` +
        `🤖 <b>Bot:</b> ${_botName()}\n\n` +
        `📋 <b>Detail:</b>\n` +
        codeBlock(combined.slice(0, 3000));
      sendTelegram(msg, token, chatId);
    } catch (_) {}
  };

  // ── Uncaught exceptions ────────────────────────────────────────────────
  process.removeAllListeners("uncaughtException");
  process.on("uncaughtException", (err) => {
    const errMsg   = err && err.message ? err.message : String(err);
    const errStack = err && err.stack   ? err.stack.slice(0, 2000) : "";
    const msg =
      `💥 <b>UNCAUGHT EXCEPTION</b>\n` +
      `⏰ <b>Time:</b> ${_now()}\n` +
      `🤖 <b>Bot:</b> ${_botName()}\n\n` +
      `📋 <b>Error:</b>\n` +
      codeBlock(errMsg) +
      (errStack ? `\n📌 <b>Stack:</b>\n` + codeBlock(errStack) : "");
    sendTelegram(msg, token, chatId);
  });

  // ── Unhandled promise rejections ───────────────────────────────────────
  process.removeAllListeners("unhandledRejection");
  process.on("unhandledRejection", (reason) => {
    const detail = reason && reason.message ? reason.message : String(reason);
    const stack  = reason && reason.stack   ? reason.stack.slice(0, 1500) : "";
    const msg =
      `🔴 <b>UNHANDLED REJECTION</b>\n` +
      `⏰ <b>Time:</b> ${_now()}\n` +
      `🤖 <b>Bot:</b> ${_botName()}\n\n` +
      `📋 <b>Reason:</b>\n` +
      codeBlock(detail) +
      (stack ? `\n📌 <b>Stack:</b>\n` + codeBlock(stack) : "");
    sendTelegram(msg, token, chatId);
  });

  // ── Process exit / SIGTERM ─────────────────────────────────────────────
  process.on("exit", (code) => {
    if (code !== 0) {
      const msg =
        `🛑 <b>BOT PROCESS EXITED</b>\n` +
        `⏰ <b>Time:</b> ${_now()}\n` +
        `🤖 <b>Bot:</b> ${_botName()}\n\n` +
        `📋 <b>Exit Code:</b>\n` +
        codeBlock(String(code));
      sendTelegram(msg, token, chatId);
    }
  });
}

/**
 * Detect the type of Facebook login error and return a human-readable label.
 */
function classifyLoginError(err) {
  const str = (typeof err === "object" ? JSON.stringify(err) : String(err)).toLowerCase();
  if (str.includes("checkpoint") || str.includes("suspended") || str.includes("disabled"))
    return "🚫 FACEBOOK ACCOUNT CHECKPOINT/SUSPENDED";
  if (str.includes("incorrect password") || str.includes("wrong password"))
    return "🔑 WRONG PASSWORD";
  if (str.includes("two-factor") || str.includes("2fa") || str.includes("otp"))
    return "🔐 TWO-FACTOR AUTH REQUIRED";
  if (str.includes("logout") || str.includes("logged out") || str.includes("session"))
    return "🔓 SESSION EXPIRED / LOGGED OUT";
  if (str.includes("rate") || str.includes("limit") || str.includes("too many"))
    return "⏱️ RATE LIMITED BY FACEBOOK";
  if (str.includes("network") || str.includes("econnrefused") || str.includes("timeout"))
    return "🌐 NETWORK ERROR";
  if (str.includes("cookiestate") || str.includes("cookie") || str.includes("appstate"))
    return "🍪 INVALID COOKIE / APPSTATE";
  return "❓ LOGIN FAILED";
}

// ── Exported as getBotName so other files can also auto-detect bot name ────
const getBotName = _botName;

module.exports = { sendTelegram, setupTelegramConsole, classifyLoginError, escHtml, codeBlock, getBotName };
