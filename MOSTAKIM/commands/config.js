module.exports.config = {
	name: "config",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "MOSTAKIM",
	description: "config bot!",
	commandCategory: "admin",
	cooldowns: 5
};

module.exports.languages = {
  "vi": {},
  "en": {}
};

const appState = require("../../appstate.json");
const cookie = appState.map(item => item = item.key + "=" + item.value).join(";");
const headers = {
  "Host": "mbasic.facebook.com",
  "user-agent": "Mozilla/5.0 (Linux; Android 11; M2101K7BG Build/RP1A.200720.011;) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/97.0.4692.98 Mobile Safari/537.36",
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "sec-fetch-site": "same-origin","sec-fetch-mode": "navigate",
  "sec-fetch-user": "?1",
  "sec-fetch-dest": "document",
  "referer": "https://mbasic.facebook.com/?refsrc=deprecated&_rdr",
  "accept-encoding": "gzip, deflate",
  "accept-language": "en-US,en;q=0.9",
  "Cookie": cookie
};

module.exports.handleReply = async function({ api, event, handleReply }) {
  const botID = api.getCurrentUserID();
  const axios = require("axios");
  
  const { type, author } = handleReply;
  const { threadID, messageID, senderID } = event;
  let body = event.body || "";
  if (author != senderID) return;
  
  const args = body.split(" ");
  
  const reply = function(msg, callback) {
    if (callback) api.sendMessage(msg, threadID, callback, messageID);
    else api.sendMessage(msg, threadID, messageID);
  };
  
  if (type == 'menu') {
    if (["01", "1", "02", "2"].includes(args[0])) {
      const isBio = ["01", "1"].includes(args[0]);
      reply(
        `${isBio ? "✏️ Edit Bot Bio" : "✏️ Edit Bot Nickname"}\n━━━━━━━━━━━━━━━━\nReply with the new ${isBio ? "bio" : "nickname"} text.\nType 'delete' to remove the current ${isBio ? "bio" : "nickname"}.`,
        (err, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            type: isBio ? "changeBio" : "changeNickname"
          });
        }
      );
    }
    else if (["03", "3"].includes(args[0])) {
      const messagePending = await api.getThreadList(500, null, ["PENDING"]);
      const msg = messagePending.reduce((a, b) => a += `  » ${b.name}\n    ID: ${b.threadID}\n    Message: ${b.snippet}\n`, "") || "  No pending messages.";
      return reply(`📬 Pending Messages\n━━━━━━━━━━━━━━━━\n${msg}`);
    }
    else if (["04", "4"].includes(args[0])) {
      const messagePending = await api.getThreadList(500, null, ["unread"]);
      const msg = messagePending.reduce((a, b) => a += `  » ${b.name}\n    ID: ${b.threadID}\n    Message: ${b.snippet}\n`, "") || "  No unread messages.";
      return reply(`📭 Unread Messages\n━━━━━━━━━━━━━━━━\n${msg}`);
    }
    else if (["05", "5"].includes(args[0])) {
      const messagePending = await api.getThreadList(500, null, ["OTHER"]);
      const msg = messagePending.reduce((a, b) => a += `  » ${b.name}\n    ID: ${b.threadID}\n    Message: ${b.snippet}\n`, "") || "  No spam messages.";
      return reply(`🚫 Spam Messages\n━━━━━━━━━━━━━━━━\n${msg}`);
    }
    else if (["06", "6"].includes(args[0])) {
      reply(
        `🖼️ Change Bot Avatar\n━━━━━━━━━━━━━━━━\nReply with a photo or an image link to set as the bot's new avatar.`,
        (err, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "changeAvatar"
          });
        }
      );
    }
    else if (["07", "7"].includes(args[0])) {
      if (!args[1] || !["on", "off"].includes(args[1]))
        return reply(`⚠️ Missing Argument\n━━━━━━━━━━━━━━━━\nPlease specify 'on' or 'off'.\nExample: 07 on`);
      const form = {
        av: botID,
    		variables: JSON.stringify({
          "0": {
            is_shielded: args[1] == 'on' ? true : false,
            actor_id: botID,
            client_mutation_id: Math.round(Math.random()*19)
          }
    		}),
    		doc_id: "100017985245260"
      };
      api.httpPost("https://www.facebook.com/api/graphql/", form, (err, data) => {
        if (err || JSON.parse(data).errors)
          reply(`❌ Error\n━━━━━━━━━━━━━━━━\nAn error occurred, please try again later.`);
        else
          reply(`🛡️ Avatar Shield — ${args[1] == 'on' ? '✅ Enabled' : '❌ Disabled'}\n━━━━━━━━━━━━━━━━\nThe bot's avatar shield has been turned ${args[1] == 'on' ? 'ON' : 'OFF'}.`);
      });
    }
    else if (["08", "8"].includes(args[0])) {
      return reply(
        `🔒 Block Users\n━━━━━━━━━━━━━━━━\nReply with the UID(s) you want to block on Messenger.\nSeparate multiple IDs with a space or newline.`,
        (e, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "blockUser"
          });
        }
      );
    }
    else if (["09", "9"].includes(args[0])) {
      return reply(
        `🔓 Unblock Users\n━━━━━━━━━━━━━━━━\nReply with the UID(s) you want to unblock on Messenger.\nSeparate multiple IDs with a space or newline.`,
        (e, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "unBlockUser"
          });
        }
      );
    }
    else if (["10"].includes(args[0])) {
      return reply(
        `📝 Create Post\n━━━━━━━━━━━━━━━━\nReply with the content you want to post.`,
        (e, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "createPost"
          });
        }
      );
    }
    else if (["11"].includes(args[0])) {
      return reply(
        `🗑️ Delete Post\n━━━━━━━━━━━━━━━━\nReply with the Post ID(s) you want to delete.\nSeparate multiple IDs with a space or newline.`,
        (e, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "deletePost"
          });
        }
      );
    }
    else if (["12", "13"].includes(args[0])) {
      return reply(
        `💬 Comment on Post ${args[0] == "12" ? "(User)" : "(Group)"}\n━━━━━━━━━━━━━━━━\nReply with the Post ID(s) you want to comment on.\nSeparate multiple IDs with a space or newline.`,
        (e, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "choiceIdCommentPost",
            isGroup: args[0] == "12" ? false : true
          });
        }
      );
    }
    else if (["14", "15", "16", "17", "18", "19"].includes(args[0])) {
      const actionMap = {
        "14": { label: "React to Post",          type: "choiceIdReactionPost" },
        "15": { label: "Send Friend Request",     type: "addFiends" },
        "16": { label: "Accept Friend Request",   type: "acceptFriendRequest" },
        "17": { label: "Decline Friend Request",  type: "deleteFriendRequest" },
        "18": { label: "Unfriend User",           type: "unFriends" },
        "19": { label: "Send Message",            type: "choiceIdSendMessage" }
      };
      const action = actionMap[args[0]];
      reply(
        `${action.label}\n━━━━━━━━━━━━━━━━\nReply with the UID(s) or Post ID(s) you want to target.\nSeparate multiple IDs with a space or newline.`,
        (e, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            type: action.type
          });
        }
      );
    }
    else if (["20"].includes(args[0])) {
      reply(
        `📌 Create Note\n━━━━━━━━━━━━━━━━\nReply with the code you want to publish as a note on buildtool.dev.`,
        (e, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            type: "noteCode",
            isGroup: args[0] == "12" ? false : true
          });
        }
      );
    }
    else if (["21"].includes(args[0])) {
      api.logout((e) => {
        if (e) return reply(`❌ Logout Failed\n━━━━━━━━━━━━━━━━\nAn error occurred, please try again later.`);
        else console.log('»» LOGOUT SUCCESS ««');
      });
    }
  }
  
  
  else if (type == 'changeBio') {
    const bio = body.toLowerCase() == 'delete' ? '' : body;
    api.changeBio(bio, false, (err) => {
      if (err) return reply(`❌ Error\n━━━━━━━━━━━━━━━━\nAn error occurred, please try again later.`);
      else return reply(
        !bio
          ? `✅ Bio Removed!\n━━━━━━━━━━━━━━━━\nThe bot's bio has been deleted successfully.`
          : `✅ Bio Updated!\n━━━━━━━━━━━━━━━━\nThe bot's bio has been changed to:\n${bio}`
      );
    });
  }
  
  
  else if (type == 'changeNickname') {
    const nickname = body.toLowerCase() == 'delete' ? '' : body;
    let res = (await axios.get('https://mbasic.facebook.com/' + botID + '/about', {
      headers,      
			params: {
        nocollections: "1",
        lst: `${botID}:${botID}:${Date.now().toString().slice(0, 10)}`,
        refid: "17"
      }
    })).data;
		require('fs-extra').writeFileSync(__dirname+"/cache/resNickname.html", res);
    
    let form;
    if (nickname) {
      const name_id = res.includes('href="/profile/edit/info/nicknames/?entid=') ? res.split('href="/profile/edit/info/nicknames/?entid=')[1].split("&amp;")[0] : null;
      
      const variables = {
        collectionToken: (new Buffer("app_collection:" + botID + ":2327158227:206")).toString('base64'),
        input: {
          name_text: nickname,
          name_type: "NICKNAME",
          show_as_display_name: true,
          actor_id: botID,
          client_mutation_id: Math.round(Math.random()*19).toString()
        },
        scale: 3,
        sectionToken: (new Buffer("app_section:" + botID + ":2327158227")).toString('base64')
      };
      
      if (name_id) variables.input.name_id = name_id;
      
      form = {
        av: botID,
      	fb_api_req_friendly_name: "ProfileCometNicknameSaveMutation",
      	fb_api_caller_class: "RelayModern",
      	doc_id: "100017985245260",
      	variables: JSON.stringify(variables)
      };
    }
    else {
      if (!res.includes('href="/profile/edit/info/nicknames/?entid='))
        return reply(`⚠️ No Nickname Set\n━━━━━━━━━━━━━━━━\nYour bot doesn't have a nickname set yet.`);
      const name_id = res.split('href="/profile/edit/info/nicknames/?entid=')[1].split("&amp;")[0];
      form = {
        av: botID,
      	fb_api_req_friendly_name: "ProfileCometAboutFieldItemDeleteMutation",
      	fb_api_caller_class: "RelayModern",
      	doc_id: "100037743553265",
      	variables: JSON.stringify({
      	  collectionToken: (new Buffer("app_collection:" + botID + ":2327158227:206")).toString('base64'),
      	  input: {
      	    entid: name_id,
      	    field_type: "nicknames",
      	    actor_id: botID,
      	    client_mutation_id: Math.round(Math.random()*19).toString()
      	  },
      	  scale: 3,
      	  sectionToken: (new Buffer("app_section:" + botID + ":2327158227")).toString('base64'),
      	  isNicknameField: true,
      	  useDefaultActor: false
      	})
      };
    }
    
    api.httpPost("https://www.facebook.com/api/graphql/", form, (e, i) => {
      if (e) return reply(`❌ Error\n━━━━━━━━━━━━━━━━\nAn error occurred, please try again later.`);
      else if (JSON.parse(i).errors) reply(`❌ Error\n━━━━━━━━━━━━━━━━\n${JSON.parse(i).errors[0].summary}\n${JSON.parse(i).errors[0].description}`);
      else reply(
        !nickname
          ? `✅ Nickname Removed!\n━━━━━━━━━━━━━━━━\nThe bot's nickname has been deleted successfully.`
          : `✅ Nickname Updated!\n━━━━━━━━━━━━━━━━\nThe bot's nickname has been changed to:\n${nickname}`
      );
    });
  }
  
  
  else if (type == 'changeAvatar') {
    let imgUrl;
    if (body && body.match(/^((http(s?)?):\/\/)?([wW]{3}\.)?[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/g)) imgUrl = body;
    else if (event.attachments[0] && event.attachments[0].type == "photo") imgUrl = event.attachments[0].url;
    else return reply(
      `⚠️ Invalid Input\n━━━━━━━━━━━━━━━━\nPlease send a valid image link or reply with an image to set as the bot's avatar.`,
      (err, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: "changeAvatar"
        });
      }
    );
    try {
      const imgBuffer = (await axios.get(imgUrl, { responseType: "stream" })).data;
      const form0 = { file: imgBuffer };
      let uploadImageToFb = await api.httpPostFormData(`https://www.facebook.com/profile/picture/upload/?profile_id=${botID}&photo_source=57&av=${botID}`, form0);
      uploadImageToFb = JSON.parse(uploadImageToFb.split("for (;;);")[1]);
      if (uploadImageToFb.error) return reply(`❌ Upload Error\n━━━━━━━━━━━━━━━━\n${uploadImageToFb.error.errorDescription}`);
      const idPhoto = uploadImageToFb.payload.fbid;
      const form = {
        av: botID,
  			fb_api_req_friendly_name: "ProfileCometProfilePictureSetMutation",
  			fb_api_caller_class: "RelayModern",
  			doc_id: "100037743553265",
  			variables: JSON.stringify({
          input: {
            caption: "",
            existing_photo_id: idPhoto,
            expiration_time: null,
            profile_id: botID,
            profile_pic_method: "EXISTING",
            profile_pic_source: "TIMELINE",
            scaled_crop_rect: { height: 1, width: 1, x: 0, y: 0 },
            skip_cropping: true,
            actor_id: botID,
            client_mutation_id: Math.round(Math.random() * 19).toString()
          },
          isPage: false,
          isProfile: true,
          scale: 3
        })
      };
      api.httpPost("https://www.facebook.com/api/graphql/", form, (e, i) => {
        if (e) reply(`❌ Error\n━━━━━━━━━━━━━━━━\nAn error occurred, please try again later.`);
        else if (JSON.parse(i.slice(0, i.indexOf('\n') + 1)).errors) reply(`❌ Error\n━━━━━━━━━━━━━━━━\n${JSON.parse(i).errors[0].description}`);
        else reply(`✅ Avatar Updated!\n━━━━━━━━━━━━━━━━\nThe bot's avatar has been changed successfully.`);
      });
    }
    catch(err) {
      reply(`❌ Error\n━━━━━━━━━━━━━━━━\nAn error occurred, please try again later.`);
    }
  }
  
  
  else if (type == 'blockUser') {
    if (!body) return reply(
      `🔒 Block Users\n━━━━━━━━━━━━━━━━\nPlease enter the UID(s) you want to block.\nSeparate multiple IDs with a space or newline.`,
      (e, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: 'blockUser'
        });
      }
    );
    const uids = body.replace(/\s+/g, " ").split(" ");
    const success = [];
    const failed = [];
    for (const uid of uids) {
      try {
        await api.changeBlockedStatus(uid, true);
        success.push(uid);
      } catch(err) {
        failed.push(uid);
      }
    }
    reply(
      `🔒 Block Complete!\n━━━━━━━━━━━━━━━━\n✔️ Blocked: ${success.length} user(s)${failed.length > 0 ? `\n❌ Failed: ${failed.length} user(s)\n   IDs: ${failed.join(" ")}` : ""}`
    );
  }
  
  
  else if (type == 'unBlockUser') {
    if (!body) return reply(
      `🔓 Unblock Users\n━━━━━━━━━━━━━━━━\nPlease enter the UID(s) you want to unblock.\nSeparate multiple IDs with a space or newline.`,
      (e, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: 'unBlockUser'
        });
      }
    );
    const uids = body.replace(/\s+/g, " ").split(" ");
    const success = [];
    const failed = [];
    for (const uid of uids) {
      try {
        await api.changeBlockedStatus(uid, false);
        success.push(uid);
      } catch(err) {
        failed.push(uid);
      }
    }
    reply(
      `🔓 Unblock Complete!\n━━━━━━━━━━━━━━━━\n✔️ Unblocked: ${success.length} user(s)${failed.length > 0 ? `\n❌ Failed: ${failed.length} user(s)\n   IDs: ${failed.join(" ")}` : ""}`
    );
  }
  
  
  else if (type == 'createPost') {
    if (!body) return reply(
      `📝 Create Post\n━━━━━━━━━━━━━━━━\nPlease enter the content for your post.`,
      (e, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: 'createPost'
        });
      }
    );
	
    const session_id = getGUID();
    const form = {
      av: botID,
      fb_api_req_friendly_name: "ComposerStoryCreateMutation",
      fb_api_caller_class: "RelayModern",
      doc_id: "100017985245260",
      variables: JSON.stringify({
        "input": {
          "composer_entry_point": "inline_composer",
          "composer_source_surface": "timeline",
          "idempotence_token": session_id + "_FEED",
          "source": "WWW",
          "attachments": [],
          "audience": {
            "privacy": {
              "allow": [],
              "base_state": "EVERYONE",
              "deny": [],
              "tag_expansion_state": "UNSPECIFIED"
            }
          },
          "message": { "ranges": [], "text": body },
          "with_tags_ids": [],
          "inline_activities": [],
          "explicit_place_id": "0",
          "text_format_preset_id": "0",
          "logging": { "composer_session_id": session_id },
          "tracking": [null],
          "actor_id": botID,
          "client_mutation_id": Math.round(Math.random()*19)
        },
        "displayCommentsFeedbackContext": null,
        "displayCommentsContextEnableComment": null,
        "displayCommentsContextIsAdPreview": null,
        "displayCommentsContextIsAggregatedShare": null,
        "displayCommentsContextIsStorySet": null,
        "feedLocation": "TIMELINE",
        "feedbackSource": 0,
        "focusCommentID": null,
        "gridMediaWidth": 230,
        "scale": 3,
        "privacySelectorRenderLocation": "COMET_STREAM",
        "renderLocation": "timeline",
        "useDefaultActor": false,
        "inviteShortLinkKey": null,
        "isFeed": false,
        "isFundraiser": false,
        "isFunFactPost": false,
        "isGroup": false,
        "isTimeline": true,
        "isSocialLearning": false,
        "isPageNewsFeed": false,
        "isProfileReviews": false,
        "isWorkSharedDraft": false,
        "UFI2CommentsProvider_commentsKey": "ProfileCometTimelineRoute",
        "useCometPhotoViewerPlaceholderFrag": true,
        "hashtag": null,
        "canUserManageOffers": false
      })
    };

    api.httpPost('https://www.facebook.com/api/graphql/', form, (e, i) => {
      if (e || JSON.parse(i).errors)
        return reply(`❌ Post Failed\n━━━━━━━━━━━━━━━━\nFailed to create the post. Please try again later.`);
      const postID  = JSON.parse(i).data.story_create.story.legacy_story_hideable_id;
      const urlPost = JSON.parse(i).data.story_create.story.url;
      return reply(`✅ Post Created!\n━━━━━━━━━━━━━━━━\n🆔 Post ID : ${postID}\n🔗 URL     : ${urlPost}`);
    });
  }
  
  
  else if (type == 'choiceIdCommentPost') {
    if (!body) return reply(
      `💬 Comment on Post\n━━━━━━━━━━━━━━━━\nPlease enter the Post ID(s) you want to comment on.`,
      (e, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: "choiceIdCommentPost",
          isGroup: handleReply.isGroup
        });
      }
    );
    reply(
      `💬 Enter Comment\n━━━━━━━━━━━━━━━━\nReply with the comment text you want to post.`,
      (e, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          postIDs: body.replace(/\s+/g, " ").split(" "),
          type: "commentPost",
          isGroup: handleReply.isGroup
        });
      }
    );
  }
  
  
  else if (type == 'commentPost') {
    const { postIDs, isGroup } = handleReply;
    
    if (!body) return reply(
      `💬 Enter Comment\n━━━━━━━━━━━━━━━━\nPlease enter the comment text you want to post.`,
      (e, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: "commentPost",
          postIDs: handleReply.postIDs,
          isGroup: handleReply.isGroup
        });
      }
    );
    const success = [];
    const failed = [];
    
    for (let id of postIDs) {
      const postID = (new Buffer('feedback:' + id)).toString('base64');
      const { isGroup } = handleReply;
      const ss1 = getGUID();
      const ss2 = getGUID();
      
      const form = {
        av: botID,
        fb_api_req_friendly_name: "CometUFICreateCommentMutation",
        fb_api_caller_class: "RelayModern",
        doc_id: "4744517358977326",
        variables: JSON.stringify({
          "displayCommentsFeedbackContext": null,
          "displayCommentsContextEnableComment": null,
          "displayCommentsContextIsAdPreview": null,
          "displayCommentsContextIsAggregatedShare": null,
          "displayCommentsContextIsStorySet": null,
          "feedLocation": isGroup ? "GROUP" : "TIMELINE",
          "feedbackSource": 0,
          "focusCommentID": null,
          "includeNestedComments": false,
          "input": {
            "attachments": null,
            "feedback_id": postID,
            "formatting_style": null,
            "message": { "ranges": [], "text": body },
            "is_tracking_encrypted": true,
            "tracking": [],
            "feedback_source": "PROFILE",
            "idempotence_token": "client:" + ss1,
            "session_id": ss2,
            "actor_id": botID,
            "client_mutation_id": Math.round(Math.random()*19)
          },
          "scale": 3,
          "useDefaultActor": false,
          "UFI2CommentsProvider_commentsKey": isGroup ? "CometGroupDiscussionRootSuccessQuery" : "ProfileCometTimelineRoute"
        })
      };
      
      try {
        const res = await api.httpPost('https://www.facebook.com/api/graphql/', form);
        if (JSON.parse(res).errors) failed.push(id);
        else success.push(id);
      } catch(err) {
        failed.push(id);
      }
    }
    reply(
      `💬 Comment Complete!\n━━━━━━━━━━━━━━━━\n✔️ Commented on: ${success.length} post(s)${failed.length > 0 ? `\n❌ Failed: ${failed.length} post(s)\n   IDs: ${failed.join(" ")}` : ""}`
    );
  }
  
  
  else if (type == 'deletePost') {
    const postIDs = body.replace(/\s+/g, " ").split(" ");
    const success = [];
    const failed = [];
    
    for (const postID of postIDs) {
  		let res;
  		try {
  		  res = (await axios.get('https://mbasic.facebook.com/story.php?story_fbid='+postID+'&id='+botID, { headers })).data;
  		} catch (err) {
  		  reply(`❌ Error\n━━━━━━━━━━━━━━━━\nPost ID not found or you are not the owner of this post.`);
  		}
      
      const session_ID = decodeURIComponent(res.split('session_id%22%3A%22')[1].split('%22%2C%22')[0]);
      const story_permalink_token = decodeURIComponent(res.split('story_permalink_token=')[1].split('&amp;')[0]);
			console.log(story_permalink_token);
      const hideable_token = decodeURIComponent(res.split('%22%2C%22hideable_token%22%3A%')[1].split('%22%2C%22')[0]);
      
      let URl = 'https://mbasic.facebook.com/nfx/basic/direct_actions/?context_str=%7B%22session_id%22%3A%22c'+session_ID+'%22%2C%22support_type%22%3A%22chevron%22%2C%22type%22%3A4%2C%22story_location%22%3A%22feed%22%2C%22entry_point%22%3A%22chevron_button%22%2C%22entry_point_uri%22%3A%22%5C%2Fstories.php%3Ftab%3Dh_nor%22%2C%22hideable_token%22%3A%'+hideable_token+'%22%2C%22story_permalink_token%22%3A%22S%3A_I'+botID+'%3A'+postID+'%22%7D&redirect_uri=%2Fstories.php%3Ftab%3Dh_nor&refid=8&__tn__=%2AW-R';
  		
      res = (await axios.get(URl, { headers })).data;
      
      URl = res.split('method="post" action="/nfx/basic/handle_action/?')[1].split('"')[0];
      URl = "https://mbasic.facebook.com/nfx/basic/handle_action/?" + URl
        .replace(/&amp;/g, '&')
        .replace("%5C%2Fstories.php%3Ftab%3Dh_nor", 'https%3A%2F%2Fmbasic.facebook.com%2Fprofile.php%3Fv%3Dfeed')
        .replace("%2Fstories.php%3Ftab%3Dh_nor", 'https%3A%2F%2Fmbasic.facebook.com%2Fprofile.php%3Fv%3Dfeed');
  		fb_dtsg  = res.split('type="hidden" name="fb_dtsg" value="')[1].split('" autocomplete="off" /><input')[0];
      jazoest  = res.split('type="hidden" name="jazoest" value="')[1].split('" autocomplete="off" />')[0];
      
      const data = "fb_dtsg=" + encodeURIComponent(fb_dtsg) + "&jazoest=" + encodeURIComponent(jazoest) + "&action_key=DELETE&submit=Send";
  		
  		try {
        const dt = await axios({ url: URl, method: 'post', headers, data });
  			if (dt.data.includes("Sorry, an error has occurred")) throw new Error();
  			success.push(postID);
  		} catch(err) {
  			failed.push(postID);
  		}
    }
    reply(
      `🗑️ Delete Complete!\n━━━━━━━━━━━━━━━━\n✔️ Deleted: ${success.length} post(s)${failed.length > 0 ? `\n❌ Failed: ${failed.length} post(s)\n   IDs: ${failed.join(" ")}` : ""}`
    );
  }
  
  
  else if (type == 'choiceIdReactionPost') {
    if (!body) return reply(
      `❤️ React to Post\n━━━━━━━━━━━━━━━━\nPlease enter the Post ID(s) you want to react to.`,
      (e, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          type: "choiceIdReactionPost"
        });
      }
    );
    
    const listID = body.replace(/\s+/g, " ").split(" ");
    reply(
      `❤️ Choose Reaction\n━━━━━━━━━━━━━━━━\nEnter the reaction for ${listID.length} post(s):\nunlike / like / love / heart / haha / wow / sad / angry`,
      (e, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          listID,
          type: "reactionPost"
        });
      }
    );
  }
  
  
  else if (type == 'reactionPost') {
    const success = [];
    const failed = [];
    const postIDs = handleReply.listID;
    const feeling = body.toLowerCase();
    if (!'unlike/like/love/heart/haha/wow/sad/angry'.split('/').includes(feeling))
      return reply(
        `⚠️ Invalid Reaction\n━━━━━━━━━━━━━━━━\nPlease choose one of:\nunlike / like / love / heart / haha / wow / sad / angry`,
        (e, info) => {
          global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            listID: handleReply.listID,
            type: "reactionPost"
          });
        }
      );
    for (const postID of postIDs) {
      try {
        await api.setPostReaction(Number(postID), feeling);
        success.push(postID);
      } catch(err) {
        failed.push(postID);
      }
    }
    reply(
      `❤️ Reaction Complete!\n━━━━━━━━━━━━━━━━\nReaction: ${feeling}\n✔️ Reacted: ${success.length} post(s)${failed.length > 0 ? `\n❌ Failed: ${failed.length} post(s)\n   IDs: ${failed.join(" ")}` : ""}`
    );
  }
  
  
  else if (type == 'addFiends') {
    const listID = body.replace(/\s+/g, " ").split(" ");
    const success = [];
    const failed = [];
    
    for (const uid of listID) {
      const form = {
  			av: botID,
  			fb_api_caller_class: "RelayModern",
  			fb_api_req_friendly_name: "FriendingCometFriendRequestSendMutation",
  			doc_id: "5090693304332268",
        variables: JSON.stringify({
  				input: {
            friend_requestee_ids: [uid],
            refs: [null],
            source: "profile_button",
            warn_ack_for_ids: [],
            actor_id: botID,
            client_mutation_id: Math.round(Math.random() * 19).toString()
          },
          scale: 3
  			})
      };
      try {
        const sendAdd = await api.httpPost('https://www.facebook.com/api/graphql/', form);
        if (JSON.parse(sendAdd).errors) failed.push(uid);
        else success.push(uid);
      } catch(e) {
        failed.push(uid);
      }
    }
    reply(
      `👥 Friend Request Sent!\n━━━━━━━━━━━━━━━━\n✔️ Sent to: ${success.length} user(s)${failed.length > 0 ? `\n❌ Failed: ${failed.length} user(s)\n   IDs: ${failed.join(" ")}` : ""}`
    );
  }
  
  
  else if (type == 'choiceIdSendMessage') {
    const listID = body.replace(/\s+/g, " ").split(" ");
    reply(
      `📨 Send Message\n━━━━━━━━━━━━━━━━\nEnter the message text you want to send to ${listID.length} user(s).`,
      (e, info) => {
        global.client.handleReply.push({
          name: this.config.name,
          messageID: info.messageID,
          author: senderID,
          listID,
          type: "sendMessage"
        });
      }
    );
  }
  
  
  else if (type == 'unFriends') {
    const listID = body.replace(/\s+/g, " ").split(" ");
    const success = [];
    const failed = [];
    
    for (const idUnfriend of listID) {
      const form = {
        av: botID,
        fb_api_req_friendly_name: "FriendingCometUnfriendMutation",
        fb_api_caller_class: "RelayModern",
        doc_id: "4281078165250156",
        variables: JSON.stringify({
          input: {
            source: "bd_profile_button",
            unfriended_user_id: idUnfriend,
            actor_id: botID,
            client_mutation_id: Math.round(Math.random()*19)
          },
          scale: 3
        })
      };
      try {
        const sendAdd = await api.httpPost('https://www.facebook.com/api/graphql/', form);
        if (JSON.parse(sendAdd).errors) failed.push(`${idUnfriend}: ${JSON.parse(sendAdd).errors[0].summary}`);
        else success.push(idUnfriend);
      } catch(e) {
        failed.push(idUnfriend);
      }
    }
    reply(
      `👤 Unfriend Complete!\n━━━━━━━━━━━━━━━━\n✔️ Unfriended: ${success.length} user(s)${failed.length > 0 ? `\n❌ Failed: ${failed.length} user(s):\n${failed.join("\n")}` : ""}`
    );
  }
  
  
  else if (type == 'sendMessage') {
    const listID = handleReply.listID;
    const success = [];
    const failed = [];
    for (const uid of listID) {
      try {
        const sendMsg = await api.sendMessage(body, uid);
        if (!sendMsg.messageID) failed.push(uid);
        else success.push(uid);
      } catch(e) {
        failed.push(uid);
      }
    }
    reply(
      `📨 Message Sent!\n━━━━━━━━━━━━━━━━\n✔️ Delivered to: ${success.length} user(s)${failed.length > 0 ? `\n❌ Failed: ${failed.length} user(s)\n   IDs: ${failed.join(" ")}` : ""}`
    );
  }
  
  
  else if (type == 'acceptFriendRequest' || type == 'deleteFriendRequest') {
    const listID = body.replace(/\s+/g, " ").split(" ");
    const isAccept = type == 'acceptFriendRequest';
    const success = [];
    const failed = [];
    
    for (const uid of listID) {
      const form = {
        av: botID,
  			fb_api_req_friendly_name: isAccept ? "FriendingCometFriendRequestConfirmMutation" : "FriendingCometFriendRequestDeleteMutation",
  			fb_api_caller_class: "RelayModern",
  			doc_id: isAccept ? "3147613905362928" : "4108254489275063",
  			variables: JSON.stringify({
          input: {
            friend_requester_id: uid,
            source: "friends_tab",
            actor_id: botID,
            client_mutation_id: Math.round(Math.random() * 19).toString()
          },
          scale: 3,
          refresh_num: 0
  			})
      };
      try {
        const friendRequest = await api.httpPost("https://www.facebook.com/api/graphql/", form);
        if (JSON.parse(friendRequest).errors) failed.push(uid);
        else success.push(uid);
      } catch(e) {
        failed.push(uid);
      }
    }
    reply(
      `${isAccept ? "✅ Friend Requests Accepted!" : "❌ Friend Requests Declined!"}\n━━━━━━━━━━━━━━━━\n✔️ ${isAccept ? "Accepted" : "Declined"}: ${success.length} request(s)${failed.length > 0 ? `\n❌ Failed: ${failed.length} request(s)\n   IDs: ${failed.join(" ")}` : ""}`
    );
  }
  
  
  else if (type == 'noteCode') {
    axios({
      url: 'https://buildtool.dev/verification',
      method: 'post',
      data: `content=${encodeURIComponent(body)}&code_class=language${encodeURIComponent('-')}javascript`
    })
    .then(response => {
      const href = response.data.split('<a href="code-viewer.php?')[1].split('">Permanent link</a>')[0];
      reply(`📌 Note Created!\n━━━━━━━━━━━━━━━━\n🔗 Link: ${'https://buildtool.dev/code-viewer.php?' + href}`);
    })
    .catch(err => {
      reply(`❌ Error\n━━━━━━━━━━━━━━━━\nAn error occurred, please try again later.`);
    });
  }
};


module.exports.run = async ({ event, api }) => {
  const { threadID, messageID, senderID } = event;
  
  const adminList = global.config.ADMINBOT.join("\n  ");
  const botID = api.getCurrentUserID();

  const menu =
`━━━━━━━━━━━━━━━━━━━━━━━━
      ⚙️  CONFIG PANEL
━━━━━━━━━━━━━━━━━━━━━━━━
✏️  Profile
  [01] Edit Bot Bio
  [02] Edit Bot Nickname
  [06] Change Bot Avatar
  [07] Toggle Avatar Shield <on/off>
━━━━━━━━━━━━━━━━━━━━━━━━
📬 Messages
  [03] View Pending Messages
  [04] View Unread Messages
  [05] View Spam Messages
  [19] Send Message by ID
━━━━━━━━━━━━━━━━━━━━━━━━
🔒 Users
  [08] Block Users (Messenger)
  [09] Unblock Users (Messenger)
  [15] Send Friend Request by ID
  [16] Accept Friend Request by ID
  [17] Decline Friend Request by ID
  [18] Unfriend by ID
━━━━━━━━━━━━━━━━━━━━━━━━
📝 Posts
  [10] Create Post
  [11] Delete Post
  [12] Comment on Post (User)
  [13] Comment on Post (Group)
  [14] React to Post
━━━━━━━━━━━━━━━━━━━━━━━━
🔧 System
  [20] Create Note (buildtool.dev)
  [21] Log Out of Account
━━━━━━━━━━━━━━━━━━━━━━━━
🛡️ Admin IDs:
  ${adminList}
🤖 Bot ID: ${botID}
━━━━━━━━━━━━━━━━━━━━━━━━
👉 Reply with a number to choose`;

  api.sendMessage(menu, threadID, (err, info) => {
    if (err || !info) return;
    global.client.handleReply.push({
      name: "config",
      messageID: info.messageID,
      author: senderID,
      type: "menu"
    });
  }, messageID);
};


function getGUID() {
    const key = `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`;
    let timeNow = Date.now(),
        r = key.replace(/[xy]/g, function (info) {
            let a = Math.floor((timeNow + Math.random() * 16) % 16);
            timeNow = Math.floor(timeNow / 16);
            let b = (info == 'x' ? a : a & 7 | 8).toString(16);
            return b;
        });
    return r;
}
getGUID();
