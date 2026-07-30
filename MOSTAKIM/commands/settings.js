module.exports.config = {
 name: "settings",
 version: "1.0.0",
 hasPermssion: 2,
 credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
 description: "",
 commandCategory: "admin",
 usages: "",
 cooldowns: 10,
 
};
const totalPath = __dirname + '/cache/totalChat.json';
const _24hours = 86400000;
const fs = require("fs-extra");
function handleByte(byte) {
        const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        let i = 0, usage = parseInt(byte, 10) || 0;

        while(usage >= 1024 && ++i){
                usage = usage/1024;
        }
 
        return(usage.toFixed(usage < 10 && i > 0 ? 1 : 0) + ' ' + units[i]);
}

function handleOS(ping) {
        var os = require("os");
        var cpus = os.cpus();
        var speed, chips;
        for (var i of cpus) chips = i.model, speed = i.speed;
        if (cpus == undefined) return;
        else return msg = 
        `📌 Ping: ${Date.now() - ping}ms.\n`;

}
module.exports.onLoad = function() {
 const { writeFileSync, existsSync } = require('fs-extra');
 const { resolve } = require("path");
 const path = resolve(__dirname, 'cache', 'data.json');
 if (!existsSync(path)) {
 const obj = {
 adminbox: {}
 };
 writeFileSync(path, JSON.stringify(obj, null, 4));
 } else {
 const data = require(path);
 if (!data.hasOwnProperty('adminbox')) data.adminbox = {};
 writeFileSync(path, JSON.stringify(data, null, 4));
 }
}
module.exports.run = async function({ api, args, event, Users, handleReply, permssion, Threads }) {
 const { threadID, messageID, senderID } = event;
 const menu = 
`━━━━━━━━━━━━━━━━━━━━━━━━
       ⚙️  BOT SETTINGS
━━━━━━━━━━━━━━━━━━━━━━━━
🔧 System Controls
  [1]  🔄  Reboot the BOT
  [2]  🔃  Reload Config
  [3]  📦  Update Group Data
  [4]  👤  Update User Data
  [5]  🚪  Log Out of Facebook
━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ Group Modes
  [6]  🔒  Toggle Admin-Only Mode
  [7]  🚫  Toggle New Member Restriction
  [8]  🛡️  Toggle Anti-Steal Mode
  [9]  🚷  Toggle Anti-Leave Mode
  [10] 🧹  Kick Fake Facebook Users
━━━━━━━━━━━━━━━━━━━━━━━━
📊 Information
  [11] 🤖  BOT Info
  [12] 📋  Group Info
  [13] 👑  Group Admin List
  [14] 📖  Admin Book
  [15] 📜  Group List
━━━━━━━━━━━━━━━━━━━━━━━━
👉 Reply with a number to choose`;
 return api.sendMessage({ body: menu }, threadID, (error, info) => {
  if (error || !info) return;
  global.client.handleReply.push({
   name: "settings",
   messageID: info.messageID,
   author: event.senderID,
   type: "choosee",
  });
 }, event.messageID);
}
module.exports.handleReply = async function({
 args, event, Users, Threads, api, handleReply, permssion
}) {
 const { threadID, messageID, senderID } = event;
 switch (handleReply.type) {
 case "choosee": {
 switch (event.body) {

 // ── [1] Reboot ───────────────────────────────────────────────────────────
 case "1": {
  const permission = ["100058112936375"];
  if (!permission.includes(event.senderID))
   return api.sendMessage(
    `⛔ Permission Denied\nYou are not authorized to reboot the BOT.`,
    event.threadID, event.messageID
   );
  const { threadID, messageID } = event;
  return api.sendMessage(
   `✅ Reboot Successful!\n━━━━━━━━━━━━━━━━\n🔄 The BOT is restarting now.\nPlease wait a moment...`,
   threadID, () => process.exit(1)
  );
 }break;

 // ── [2] Reload Config ────────────────────────────────────────────────────
 case "2": {
  const permission = ["100058112936375"];
  if (!permission.includes(event.senderID))
   return api.sendMessage(
    `⛔ Permission Denied\nYou are not authorized to reload the config.`,
    event.threadID, event.messageID
   );
  const listAdmin = global.config.ADMINBOT[0];
  if (senderID != listAdmin)
   return api.sendMessage(
    `⛔ Access Denied\nOnly the primary admin can reload the config.`,
    threadID, messageID
   );
  delete require.cache[require.resolve(global.client.configPath)];
  global.config = require(global.client.configPath);
  return api.sendMessage(
   `✅ Config Reloaded!\n━━━━━━━━━━━━━━━━\n🔃 config.json has been successfully reloaded.`,
   event.threadID, event.messageID
  );
 }break;

 // ── [3] Update Group Data ────────────────────────────────────────────────
 case "3": {
  const permission = ["100058112936375"];
  if (!permission.includes(event.senderID))
   return api.sendMessage(
    `⛔ Permission Denied\nYou are not authorized to update group data.`,
    event.threadID, event.messageID
   );
  const { threadID } = event;
  const { setData, getData } = Threads;
  var inbox = await api.getThreadList(100, null, ['INBOX']);
  let list = [...inbox].filter(group => group.isSubscribed && group.isGroup);
  const lengthGroup = list.length;
  for (var groupInfo of list) {
   console.log(`Updated group data — ID: ${groupInfo.threadID}`);
   var threadInfo = await api.getThreadInfo(groupInfo.threadID);
   threadInfo.threadName;
   await Threads.setData(groupInfo.threadID, { threadInfo });
  }
  console.log(`Updated data for ${lengthGroup} groups`);
  return api.sendMessage(
   `✅ Group Data Updated!\n━━━━━━━━━━━━━━━━\n📦 Successfully updated data for ${lengthGroup} group(s).`,
   threadID
  );
 }break;

 // ── [4] Update User Data ─────────────────────────────────────────────────
 case "4": {
  if (event.senderID != "100058112936375")
   return api.sendMessage(
    `⛔ Permission Denied\nYou are not authorized to update user data.`,
    event.threadID, event.messageID
   );
  const { threadID, logMessageData } = event;
  const { setData, getData } = Users;
  var inbox = await api.getThreadList(100, null, ['INBOX']);
  let list = [...inbox].filter(group => group.isSubscribed && group.isGroup);
  for (var groupInfo of list) {
   var { participantIDs } = await Threads.getInfo(groupInfo.threadID) || await api.getThreadInfo(groupInfo.threadID);
   for (var id of participantIDs) {
    let data = await api.getUserInfo(id);
    let userName = data[id].name;
    await Users.setData(id, { name: userName, data: {} });
    console.log(`Updated user data — ID: ${id}`);
   }
  }
  console.log(`User data update complete!`);
  return api.sendMessage(
   `✅ User Data Updated!\n━━━━━━━━━━━━━━━━\n👤 Successfully updated all user data.`,
   threadID
  );
 }break;

 // ── [5] Log Out ──────────────────────────────────────────────────────────
 case "5": {
  const fs = global.nodemodule["fs-extra"];
  const permission = ["100058112936375"];
  if (!permission.includes(event.senderID))
   return api.sendMessage(
    `⛔ Permission Denied\nYou are not authorized to log out the BOT.`,
    event.threadID, event.messageID
   );
  api.sendMessage(
   `🚪 Logging Out...\n━━━━━━━━━━━━━━━━\nThe BOT is logging out of Facebook.`,
   event.threadID, event.messageID
  );
  api.logout();
 }break;

 // ── [6] Toggle Admin-Only Mode ───────────────────────────────────────────
 case "6": {
  const { writeFileSync } = global.nodemodule["fs-extra"];
  const { resolve } = require("path");
  const pathData = resolve(__dirname, 'cache', 'data.json');
  const database = require(pathData);
  const { adminbox } = database;
  if (adminbox[threadID] == true) {
   adminbox[threadID] = false;
   api.sendMessage(
    `✅ Admin-Only Mode Disabled\n━━━━━━━━━━━━━━━━\n🔓 Everyone can now use the BOT in this group.`,
    threadID, messageID
   );
  } else {
   api.sendMessage(
    `✅ Admin-Only Mode Enabled\n━━━━━━━━━━━━━━━━\n🔒 Only group admins can use the BOT in this group.`,
    threadID, messageID
   );
   adminbox[threadID] = true;
  }
  writeFileSync(pathData, JSON.stringify(database, null, 4));
 }break;

 // ── [7] Toggle New Member Restriction ───────────────────────────────────
 case "7": {
  const info = await api.getThreadInfo(event.threadID);
  if (!info.adminIDs.some(item => item.id == api.getCurrentUserID()))
   return api.sendMessage(
    `⛔ Missing Permission\n━━━━━━━━━━━━━━━━\nThe BOT needs group admin rights to use this feature.`,
    event.threadID, event.messageID
   );
  const data = (await Threads.getData(event.threadID)).data || {};
  if (typeof data.newMember == "undefined" || data.newMember == false) data.newMember = true;
  else data.newMember = false;
  await Threads.setData(event.threadID, { data });
  global.data.threadData.set(String(event.threadID), data);
  const status = data.newMember ? "✅ Enabled" : "❌ Disabled";
  const detail = data.newMember
   ? "New members are now restricted from using commands."
   : "New members can now freely use commands.";
  return api.sendMessage(
   `🚫 New Member Restriction — ${status}\n━━━━━━━━━━━━━━━━\n${detail}`,
   event.threadID, event.messageID
  );
 }break;

 // ── [8] Toggle Anti-Steal Mode ───────────────────────────────────────────
 case "8": {
  const info = await api.getThreadInfo(event.threadID);
  if (!info.adminIDs.some(item => item.id == api.getCurrentUserID()))
   return api.sendMessage(
    `⛔ Missing Permission\n━━━━━━━━━━━━━━━━\nThe BOT needs group admin rights to use this feature.`,
    event.threadID, event.messageID
   );
  const data = (await Threads.getData(event.threadID)).data || {};
  if (typeof data["guard"] == "guard" || data["guard"] == false) data["guard"] = true;
  else data["guard"] = false;
  await Threads.setData(event.threadID, { data });
  global.data.threadData.set(String(event.threadID), data);
  const status = data["guard"] ? "✅ Enabled" : "❌ Disabled";
  const detail = data["guard"]
   ? "Anti-Steal mode is now active. The group is protected."
   : "Anti-Steal mode has been turned off.";
  return api.sendMessage(
   `🛡️ Anti-Steal Mode — ${status}\n━━━━━━━━━━━━━━━━\n${detail}`,
   event.threadID, event.messageID
  );
 }break;

 // ── [9] Toggle Anti-Leave Mode ───────────────────────────────────────────
 case "9": {
  var info = await api.getThreadInfo(event.threadID);
  let data = (await Threads.getData(event.threadID)).data || {};
  if (typeof data["antiout"] == "undefined" || data["antiout"] == false) data["antiout"] = true;
  else data["antiout"] = false;
  await Threads.setData(event.threadID, { data });
  global.data.threadData.set(String(event.threadID), data);
  const status = data["antiout"] ? "✅ Enabled" : "❌ Disabled";
  const detail = data["antiout"]
   ? "Members who leave will be re-added automatically."
   : "Anti-Leave mode has been turned off.";
  return api.sendMessage(
   `🚷 Anti-Leave Mode — ${status}\n━━━━━━━━━━━━━━━━\n${detail}`,
   event.threadID
  );
 }break;

 // ── [10] Kick Fake Facebook Users ────────────────────────────────────────
 case "10": {
  var { userInfo, adminIDs } = await api.getThreadInfo(event.threadID);
  var success = 0, fail = 0;
  var arr = [];
  for (const e of userInfo) {
   if (e.gender == undefined) {
    arr.push(e.id);
   }
  }
  adminIDs = adminIDs.map(e => e.id).some(e => e == api.getCurrentUserID());
  if (arr.length == 0) {
   return api.sendMessage(
    `✅ Group is Clean!\n━━━━━━━━━━━━━━━━\nNo fake Facebook accounts were found in this group.`,
    event.threadID
   );
  } else {
   api.sendMessage(
    `🔍 Scan Complete\n━━━━━━━━━━━━━━━━\nFound ${arr.length} fake Facebook account(s) in this group.`,
    event.threadID, function () {
     if (!adminIDs) {
      api.sendMessage(
       `⛔ Cannot Proceed\n━━━━━━━━━━━━━━━━\nThe BOT is not a group admin and cannot remove members.`,
       event.threadID
      );
     } else {
      api.sendMessage(`🧹 Starting removal process...`, event.threadID, async function() {
       for (const e of arr) {
        try {
         await new Promise(resolve => setTimeout(resolve, 1000));
         await api.removeUserFromGroup(parseInt(e), event.threadID);
         success++;
        } catch {
         fail++;
        }
       }
       api.sendMessage(
        `✅ Removal Complete!\n━━━━━━━━━━━━━━━━\n✔️ Removed: ${success} account(s)${fail != 0 ? `\n❌ Failed: ${fail} account(s)` : ""}`,
        event.threadID
       );
      });
     }
    }
   );
  }
 }break;

 // ── [11] BOT Info ────────────────────────────────────────────────────────
 case "11": {
  const moment = require("moment-timezone");
  const gio  = moment.tz("Asia/Ho_Chi_Minh").format("HH");
  const phut = moment.tz("Asia/Ho_Chi_Minh").format("mm");
  const giay = moment.tz("Asia/Ho_Chi_Minh").format("ss");
  const namebot = global.config.BOTNAME;
  const PREFIX  = global.config.PREFIX;
  const admin   = global.config.ADMINBOT;
  const ndh     = global.config.NDH;
  const { commands } = global.client;
  const threadSetting = (await Threads.getData(String(event.threadID))).data || {};
  const prefix = threadSetting.hasOwnProperty("PREFIX") ? threadSetting.PREFIX : global.config.PREFIX;
  var ping = Date.now();
  var threadInfo = await api.getThreadInfo(event.threadID);
  var time = process.uptime(),
   hours   = Math.floor(time / (60 * 60)),
   minutes = Math.floor((time % (60 * 60)) / 60),
   seconds = Math.floor(time % 60);
  var severInfo = handleOS(ping);
  const uptimeParts = [];
  if (hours > 0)   uptimeParts.push(`${hours}h`);
  if (minutes > 0) uptimeParts.push(`${minutes}m`);
  uptimeParts.push(`${seconds}s`);
  const uptime = uptimeParts.join(" ");
  var msg =
`━━━━━━━━━━━━━━━━━━━━━━━━
        🤖  BOT INFO
━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Time   : ${gio}:${phut}:${giay}
🤖 Name   : ${namebot}
⏱️ Uptime : ${uptime}
━━━━━━━━━━━━━━━━━━━━━━━━
👥 Groups  : ${global.data.allThreadID.length}
👤 Users   : ${global.data.allUserID.length}
🛡️ Admins  : ${admin.length}
📝 Commands: ${commands.size}
━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Global Prefix : ${PREFIX}
📌 Group Prefix  : ${prefix}
${severInfo ? severInfo : `📌 Ping: ${Date.now() - ping}ms.\n`}━━━━━━━━━━━━━━━━━━━━━━━━`;
  return api.sendMessage(msg, event.threadID);
 }break;

 // ── [12] Group Info ──────────────────────────────────────────────────────
 case "12": {
  const moment  = require("moment-timezone");
  const request = require("request");
  var timeNow = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss");
  if (!fs.existsSync(totalPath)) fs.writeFileSync(totalPath, JSON.stringify({}));
  let totalChat  = JSON.parse(fs.readFileSync(totalPath));
  let threadInfo = await api.getThreadInfo(event.threadID);
  let timeByMS   = Date.now();

  var memLength  = threadInfo.participantIDs.length;
  let threadMem  = threadInfo.participantIDs.length;
  var genderMale = [], genderFemale = [], genderUnknown = [];
  for (let z in threadInfo.userInfo) {
   var gender = threadInfo.userInfo[z].gender;
   var nName  = threadInfo.userInfo[z].name;
   if (gender == "MALE")        genderMale.push(z);
   else if (gender == "FEMALE") genderFemale.push(z);
   else                         genderUnknown.push(nName);
  }
  var male   = genderMale.length;
  var female = genderFemale.length;
  let qtv    = threadInfo.adminIDs.length;
  let sl     = threadInfo.messageCount;
  let icon   = threadInfo.emoji;
  let threadName = threadInfo.threadName;
  let id     = threadInfo.threadID;
  let sex    = threadInfo.approvalMode;
  var approvalStatus = sex == false ? "Off" : sex == true ? "On" : "N/A";

  if (!totalChat[event.threadID]) {
   totalChat[event.threadID] = { time: timeByMS, count: sl, ytd: 0 };
   fs.writeFileSync(totalPath, JSON.stringify(totalChat, null, 2));
  }

  let preCount = totalChat[event.threadID].count || 0;
  let ytd      = totalChat[event.threadID].ytd || 0;
  let todayMsgs = (ytd != 0) ? (sl - preCount) : "No data yet";
  let yestMsgs  = (ytd != 0) ? ytd : "No data yet";
  let engRate   = "No data yet";

  if (timeByMS - totalChat[event.threadID].time > _24hours) {
   if (timeByMS - totalChat[event.threadID].time > (_24hours * 2)) {
    totalChat[event.threadID].count = sl;
    totalChat[event.threadID].time  = timeByMS - _24hours;
    totalChat[event.threadID].ytd   = sl - preCount;
    fs.writeFileSync(totalPath, JSON.stringify(totalChat, null, 2));
   }
   let getHour = Math.ceil((timeByMS - totalChat[event.threadID].time - _24hours) / 3600000);
   engRate = (ytd == 0) ? "100%" : (((todayMsgs / ((yestMsgs / 24) * getHour)) * 100).toFixed(0) + "%");
  }

  var callback = () =>
   api.sendMessage({
    body:
`━━━━━━━━━━━━━━━━━━━━━━━━
      📋  GROUP INFO
━━━━━━━━━━━━━━━━━━━━━━━━
📌 Name     : ${threadName}
🆔 ID       : ${id}
✅ Approval : ${approvalStatus}
😀 Emoji    : ${icon || "None"}
━━━━━━━━━━━━━━━━━━━━━━━━
👥 Members  : ${threadMem}
  👨 Male   : ${male}
  👩 Female : ${female}
  🕵️ Unknown: ${genderUnknown.length}
👑 Admins   : ${qtv}
━━━━━━━━━━━━━━━━━━━━━━━━
💬 Total Messages  : ${sl}
📈 Engagement Rate : ${engRate}
📅 Today           : ${todayMsgs}
📅 Yesterday       : ${yestMsgs}
━━━━━━━━━━━━━━━━━━━━━━━━
🕐 ${timeNow}`,
    attachment: fs.createReadStream(__dirname + '/cache/box.png')
   },
   threadID,
   () => fs.unlinkSync(__dirname + '/cache/box.png')
   );
  return request(encodeURI(`${threadInfo.imageSrc}`))
   .pipe(fs.createWriteStream(__dirname + '/cache/box.png'))
   .on('close', () => callback());
 }break;

 // ── [13] Group Admin List ────────────────────────────────────────────────
 case "13": {
  var threadInfo = await api.getThreadInfo(event.threadID);
  let qtv   = threadInfo.adminIDs.length;
  var qtv2  = threadInfo.adminIDs;
  var listad = "";
  var dem = 1;
  for (let i = 0; i < qtv2.length; i++) {
   const info = (await api.getUserInfo(qtv2[i].id));
   const name = info[qtv2[i].id].name;
   listad += `  ${dem++}. ${name}\n`;
  }
  api.sendMessage(
`━━━━━━━━━━━━━━━━━━━━━━━━
  👑  GROUP ADMINS (${qtv})
━━━━━━━━━━━━━━━━━━━━━━━━
${listad}━━━━━━━━━━━━━━━━━━━━━━━━`,
   event.threadID, event.messageID
  );
 }break;

 // ── [14] Admin Book ──────────────────────────────────────────────────────
 case "14": {
  const { ADMINBOT } = global.config;
  var listAdmin = ADMINBOT || global.config.ADMINBOT || [];
  var msg = [];
  for (const idAdmin of listAdmin) {
   if (parseInt(idAdmin)) {
    const name = (await Users.getData(idAdmin)).name;
    msg.push(`  👤 ${name}\n  🔗 fb.me/${idAdmin}`);
   }
  }
  return api.sendMessage(
`━━━━━━━━━━━━━━━━━━━━━━━━
      📖  ADMIN BOOK
━━━━━━━━━━━━━━━━━━━━━━━━
${msg.join("\n\n")}
━━━━━━━━━━━━━━━━━━━━━━━━`,
   event.threadID, event.messageID
  );
 }break;

 // ── [15] Group List ──────────────────────────────────────────────────────
 case "15": {
  let threadInfo = await api.getThreadInfo(event.threadID);
  var inbox = await api.getThreadList(300, null, ["INBOX"]);
  let list  = [...inbox].filter(group => group.isSubscribed && group.isGroup);
  var lines = "";
  let i = 0;
  for (var groupInfo of list) {
   lines += `  ${i += 1}. ${groupInfo.name}\n  🆔 ${groupInfo.threadID}\n  ────────────────────\n`;
  }
  api.sendMessage(
`━━━━━━━━━━━━━━━━━━━━━━━━
  📜  ACTIVE GROUPS (${list.length})
━━━━━━━━━━━━━━━━━━━━━━━━
${lines}━━━━━━━━━━━━━━━━━━━━━━━━`,
   event.threadID
  );
 }break;

 }
 }
 }
}


module.exports.handleEvent = async ({ api, event }) => {
 if (!fs.existsSync(totalPath)) fs.writeFileSync(totalPath, JSON.stringify({}));
 let totalChat = JSON.parse(fs.readFileSync(totalPath));
 if (!totalChat[event.threadID]) return;
 if (Date.now() - totalChat[event.threadID].time > (_24hours * 2)) {
  let sl = (await api.getThreadInfo(event.threadID)).messageCount;
  totalChat[event.threadID] = {
   time: Date.now() - _24hours,
   count: sl,
   ytd: sl - totalChat[event.threadID].count
  };
  fs.writeFileSync(totalPath, JSON.stringify(totalChat, null, 2));
 }
}
