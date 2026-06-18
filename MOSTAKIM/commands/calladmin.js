"use strict";

const moment = require("moment-timezone");

module.exports.config = {
    name:            "calladmin",
    version:         "2.3.0",
    hasPermssion:    0,
    credits:         "MOSTAKIM",
    description:     "Admin কে সরাসরি message পাঠাও",
    commandCategory: "utility",
    usages:          "calladmin [message]",
    cooldowns:       30
};

function getTime() {
    const tz = (global.config && global.config.timeZone) || "Asia/Dhaka";
    return moment().tz(tz).format("DD MMM YYYY, hh:mm A");
}

function getAdmins() {
    return [
        ...(global.config.ADMINBOT   || []),
        ...(global.config.SUPERADMIN || [])
    ].map(String).filter((v, i, a) => a.indexOf(v) === i);
}

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const out = (msg) => api.sendMessage(msg, threadID, messageID);

    const userMsg = args.join(" ").trim();
    if (!userMsg) {
        return out(
            `📞 𝗖𝗔𝗟𝗟 𝗔𝗗𝗠𝗜𝗡\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `Admin কে message পাঠাতে:\n\n` +
            `Usage: /calladmin [message]\n\n` +
            `Example:\n` +
            `/calladmin আমার সাহায্য দরকার\n\n` +
            `⚠️ Spam করলে ban হতে পারো।`
        );
    }

    const adminUIDs = getAdmins();
    if (adminUIDs.length === 0) {
        return out("❌ কোনো admin configured নেই। পরে চেষ্টা করো।");
    }

    // ── User info ─────────────────────────────────────────────────────────────
    let senderName = "Unknown User";
    try {
        const uinfo = await api.getUserInfo(senderID);
        senderName  = (uinfo[senderID] && uinfo[senderID].name) || senderName;
    } catch (_) {}

    let groupName = "Unknown";
    let isGroup   = false;
    try {
        const tinfo = await api.getThreadInfo(threadID);
        groupName   = tinfo.threadName || "Unknown";
        isGroup     = tinfo.isGroup;
    } catch (_) {}

    // ── 1. User কে confirmation ───────────────────────────────────────────────
    out(
        `✅ 𝗠𝗘𝗦𝗦𝗔𝗚𝗘 𝗦𝗘𝗡𝗧\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `তোমার message admin কে পাঠানো হয়েছে!\n\n` +
        `📩 Message:\n"${userMsg}"\n\n` +
        `💬 Admin reply করলে তুমি এখানেই দেখতে পাবে।\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `⏰ ${getTime()}`
    );

    // ── 2. Admin দের message পাঠাও ───────────────────────────────────────────
    const adminMsg =
        `📞 𝗡𝗘𝗪 𝗖𝗔𝗟𝗟 𝗔𝗗𝗠𝗜𝗡\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `👤 User    : ${senderName}\n` +
        `🆔 UID     : ${senderID}\n` +
        `📍 Location: ${isGroup ? groupName : "Private Chat"}\n` +
        `🧵 Thread  : ${threadID}\n` +
        `⏰ Time    : ${getTime()}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `💬 Message:\n${userMsg}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `↩️ এই message এ reply করো user কে respond করতে।`;

    for (const adminID of adminUIDs) {
        try {
            await new Promise((resolve, reject) => {
                api.sendMessage(adminMsg, adminID, (err, info) => {
                    if (err) return reject(err);
                    global.client.handleReply.push({
                        name:             "calladmin",
                        messageID:        info.messageID,
                        author:           adminID,
                        originalThreadID: threadID,
                        senderID:         senderID,
                        senderName:       senderName,
                        groupName:        isGroup ? groupName : "Private Chat",
                        originalMessage:  userMsg,
                        allAdmins:        adminUIDs
                    });
                    resolve();
                });
            });
        } catch (_) {}
    }
};

// ── Admin reply করলে user এর কাছে পাঠাও ─────────────────────────────────────
module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, messageID, senderID, body } = event;

    const allAdmins = (handleReply.allAdmins || getAdmins()).map(String);
    const isAdmin   = allAdmins.includes(String(senderID));
    if (!isAdmin) return;

    const adminReply = (body || "").trim();
    if (!adminReply) return;

    // Admin এর নাম
    let adminName = "Admin";
    try {
        const ainfo = await api.getUserInfo(senderID);
        adminName   = (ainfo[senderID] && ainfo[senderID].name) || adminName;
    } catch (_) {}

    // ── 1. User এর কাছে admin reply পাঠাও ───────────────────────────────────
    const userReplyMsg =
        `💬 𝗔𝗗𝗠𝗜𝗡 𝗥𝗘𝗣𝗟𝗬\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `👑 Admin : ${adminName}\n` +
        `⏰ Time  : ${getTime()}\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `তোমার message:\n"${handleReply.originalMessage}"\n\n` +
        `Admin এর reply:\n${adminReply}`;

    let sentOk = false;
    try {
        await api.sendMessage(userReplyMsg, handleReply.originalThreadID);
        sentOk = true;
    } catch (_) {}

    // ── 2. Admin কে delivery confirmation ────────────────────────────────────
    if (sentOk) {
        api.sendMessage(
            `✅ 𝗥𝗘𝗣𝗟𝗬 𝗗𝗘𝗟𝗜𝗩𝗘𝗥𝗘𝗗\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `তোমার reply user এর কাছে পাঠানো হয়েছে!\n\n` +
            `👤 User  : ${handleReply.senderName}\n` +
            `📍 Group : ${handleReply.groupName}\n\n` +
            `💬 তোমার reply:\n"${adminReply}"\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `⏰ ${getTime()}`,
            threadID,
            () => {},
            messageID
        );
    } else {
        api.sendMessage(
            `❌ Reply পাঠাতে ব্যর্থ!\n` +
            `User এর thread এ message যায়নি।\n` +
            `Thread ID: ${handleReply.originalThreadID}`,
            threadID,
            () => {},
            messageID
        );
    }
};
