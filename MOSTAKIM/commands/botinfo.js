"use strict";

const os   = require("os");
const fs   = require("fs-extra");
const path = require("path");

const BOT_STATS_PATH = path.join(process.cwd(), "MAIN", "bot-stats.json");

function getLiveStats() {
  try { return JSON.parse(fs.readFileSync(BOT_STATS_PATH, "utf-8")); }
  catch { return null; }
}

function fmtUptime(ms) {
  const sec = Math.floor((Date.now() - ms) / 1000);
  const d   = Math.floor(sec / 86400);
  const h   = Math.floor((sec % 86400) / 3600);
  const m   = Math.floor((sec % 3600) / 60);
  const s   = Math.floor(sec % 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

module.exports = {
  config: {
    name:            "botinfo",
    aliases:         ["bi", "about"],
    version:         "1.0.0",
    hasPermssion:    0,
    credits:         "MOSTAKIM",
    description:     "Bot এর সব তথ্য দেখায়",
    commandCategory: "info",
    usages:          "botinfo",
    cooldowns:       5,
    prefix:          false,
  },

  run: async function ({ api, event }) {
    const { threadID, messageID } = event;

    try {
      const cfg   = global.config     || {};
      const cmds  = global.client?.commands;
      const evts  = global.client?.events;
      const live  = getLiveStats();

      // ── Bot identity ──────────────────────────────────────────────────────────
      const botName    = cfg.BOTNAME   || "MOSTAKIM V2 BOT";
      const botVersion = cfg.version   || "1.0.0";
      const prefix     = cfg.PREFIX    || "/";
      const ownerName  = cfg.AUTHOR_NAME || "MOSTAKIM";
      const ownerUID   = cfg.AUTHOR_UID  || "N/A";
      const language   = (cfg.language  || "en").toUpperCase();
      const timeZone   = cfg.timeZone   || "Asia/Dhaka";

      // ── Counts ────────────────────────────────────────────────────────────────
      const cmdCount   = cmds  ? cmds.size  : 0;
      const evtCount   = evts  ? evts.size  : 0;
      const aliasCount = global.client?.aliases ? global.client.aliases.size : 0;

      const userCount  = live?.userCount
        || (global.data?.allUserID?.length)
        || 0;
      const grpCount   = live?.threadCount
        || (global.data?.allThreadID?.length)
        || 0;

      // ── Uptime ────────────────────────────────────────────────────────────────
      const timeStart  = live?.timeStart || global.client?.timeStart;
      const uptime     = timeStart ? fmtUptime(timeStart) : "N/A";

      // ── System ────────────────────────────────────────────────────────────────
      const nodeVer    = process.version;
      const platform   = `${os.type()} ${os.arch()}`;
      const ramTotal   = (os.totalmem() / 1024 / 1024).toFixed(0);
      const ramFree    = (os.freemem()  / 1024 / 1024).toFixed(0);
      const ramUsed    = (Number(ramTotal) - Number(ramFree)).toFixed(0);
      const ramPct     = ((ramUsed / ramTotal) * 100).toFixed(1);
      const heap       = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

      // ── Bot status ────────────────────────────────────────────────────────────
      const isOnline   = live && live.botStatus === "Online"
        && live.updatedAt && (Date.now() - live.updatedAt) < 30000;
      const statusIcon = isOnline ? "🟢 Online" : "🔴 Offline";

      // ── Categories ────────────────────────────────────────────────────────────
      const cats = new Set();
      if (cmds) for (const [, mod] of cmds) {
        const c = mod.config?.commandCategory || mod.config?.category;
        if (c) cats.add(c.toLowerCase());
      }

      const msg =
`╭━━━━━━━━━━━━━━━━━━━━━━╮
│   🤖 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡
╰━━━━━━━━━━━━━━━━━━━━━━╯

🏷️ 𝗕𝗢𝗧 𝗗𝗘𝗧𝗔𝗜𝗟𝗦
┣ 📛 Name     : ${botName}
┣ 🔖 Version  : v${botVersion}
┣ 🔰 Prefix   : ${prefix}
┣ 🌐 Language : ${language}
┣ 🕐 Timezone : ${timeZone}
┗ 📡 Status   : ${statusIcon}

👑 𝗢𝗪𝗡𝗘𝗥
┣ 👤 Name : ${ownerName}
┗ 🆔 UID  : ${ownerUID}

📊 𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗖𝗦
┣ ⚡ Commands  : ${cmdCount} (${aliasCount} aliases)
┣ 📌 Events    : ${evtCount}
┣ 📂 Categories: ${cats.size}
┣ 👥 Users     : ${userCount.toLocaleString()}
┣ 💬 Groups    : ${grpCount}
┗ ⏱️ Uptime    : ${uptime}

💻 𝗦𝗬𝗦𝗧𝗘𝗠
┣ 🟩 Node.js  : ${nodeVer}
┣ 🖥️ Platform : ${platform}
┣ 💾 RAM      : ${ramUsed}MB / ${ramTotal}MB (${ramPct}%)
┗ 🧠 Heap     : ${heap} MB

━━━━━━━━━━━━━━━━━━━━━━━
⚡ Powered by MOSTAKIM V2 BOT`;

      return api.sendMessage(msg, threadID, messageID);

    } catch (err) {
      return api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
    }
  }
};
