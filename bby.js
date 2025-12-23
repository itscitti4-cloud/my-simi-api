const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const cacheDir = path.join(process.cwd(), "scripts/cmds/cache");
const filePath = path.join(cacheDir, "babyData.json");

const commonBrain = {
    "hi": ["Hello!", "Hey there!", "Hi sweetie!", "হেই, কি খবর?"],
    "hello": ["Hi!", "Hello boss!", "জি বলো!", "হ্যালো জানু!"],
    "hlw": ["Hi!", "Hello boss!", "জি বলো!", "হ্যালো জানু!"],
    "কি খবর": ["এই তো ভালো, আপনার কি খবর?", "সব ঠিকঠাক, আপনার কি খবর?", "এই তো ভালো, আপনার খবর কি?"],
    "কী খবর": ["এই তো ভালো, আপনার কি খবর?", "সব ঠিকঠাক, আপনার কি খবর?"],
    "খবর কি": ["এই তো ভালো, আপনি কি খবর?", "সব ঠিকঠাক, আপনার কি খবর?"],
    "খবর কী": ["এই তো ভালো, আপনি কি খবর?", "সব ঠিকঠাক, আপনার কি খবর?"],
    "ki kbr": ["aitw valo, tmr ki khbor?", "sob thik thak, apnr khbor valo tw??"],
    "ki khobor": ["aitw valo, tmr ki khbor?", "sob thik thak, apnr khbor valo tw??"],
    "ki khbr": ["aitw valo, tmr ki khbor?", "sob thik thak, apnr khbor valo tw??"],
    "ki kbor": ["aitw valo, tmr ki khbor?", "sob thik thak, apnr khbor valo tw??"],
    "কেমন আছো": ["আলহামদুলিল্লাহ শুকরিয়া, আমি ভালো আছি। আপনি?", "খুব ভালো! আপনার দিনটি কেমন কাটছে?"],
    "kmn acho": ["aitw valo, tmr ki khbor?", "Alhamdulillah, apnr khbor valo tw??"],
    "kemon acho": ["aitw valo, tmr ki khbor?", "Alhamdulillah, apnr khbor valo tw??"],
    "kemon aco": ["aitw valo, tmr ki khbor?", "Alhamdulillah Shukria, apnr khbor valo tw??"],
    "kmn aco": ["aitw valo, tmr ki khbor?", "Alhamdulillah Shukria, apnr khbor valo tw??"],
    "ভালোবাসি": ["আমিও তোমাকে অনেক ভালোবাসি!", "ওরে বাবা! হঠাৎ এতো ভালোবাসা কেন?", "আমি তো তোমার প্রেমে পড়ে গেছি!"],
    "আমি তোমাকে ভালোবাসি": ["আমিও তোমাকে অনেক ভালোবাসি!", "ওরে বাবা! হঠাৎ এতো ভালোবাসা কেন?", "আমি তো তোমার প্রেমে পড়ে গেছি!"],
    "আমাকে ভালোবাসো": ["অবশ্যই! আমি আপনাকে অনেক ভালোবাসি।", "ভালোবাসি বলেই তো আপনার সব প্রশ্নের উত্তর দিই।"],
    "love you": ["tui abar kon pagol?", "love you too", "Aiche hala kudduser nati, sor samne theke??"],
    "i love you": ["tui abar kon pagol?🙄", "love you too😚", "Aiche hala kudduser nati🫡, sor samne theke😾??"],
    "বিয়ে করবা": ["আমি তো রোবট, বিয়ে করলে ভাত খাওয়াবে কে?", "নাহ, আমি সিঙ্গেল থাকতেই ভালোবাসি!"],
    "আমাকে বিয়ে করবা": ["আমি তো রোবট, বিয়ে করলে ভাত খাওয়াবে কে?", "নাহ, আমি সিঙ্গেল থাকতেই ভালোবাসি!"],
    "amk biye korba": ["dur ami to bot, biye korle amk khawyaba kmny?", "nah vhai single ach, bindas achi!"],
    "biye korba": ["dur ami to bot, biye korle amk khawyaba kmny?", "nah vhai single achi, bindas achi!"],
    "amk biye krba": ["dur ami to bot, biye korle amk khawyaba kmny?", "nah vhai single ach, bindas achi!"],
    "biye krba": ["dur ami to bot, biye korle amk khawyaba kmny?", "nah vhai single ach, bindas achi!"],
    "amk biya korba": ["dur ami to bot, biye korle amk khawyaba kmny?", "nah vhai single ach, bindas achi!"],
    "amk biya krba": ["dur ami to bot, biye korle amk khawyaba kmny?", "nah vhai single ach, bindas achi!"],
    "biya korba": ["dur ami to bot, biye korle amk khawyaba kmny?", "nah vhai single ach, bindas achi!"],
    "biya krba": ["dur ami to bot, biye korle amk khawyaba kmny?", "nah vhai single ach, bindas achi!"],
    "janu": ["bol be keya cahiye tereko!", "ki!", "ato dako kno?"],
    "জানু": ["বলো সোনা!", "জি আমার জান!", "ডাকছো কেন জানু?"],
    "নাম কি": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "তোমার নাম কি": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "নাম কী": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "তোমার নাম কী": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "nam ki": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "nm ki": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "tmr nm ki": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "nam kih": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "tmr nam kih": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "nm kih": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "tmr nm kih": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "tomar nam kih": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "tomar nam ki": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "tomar nm kih": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "tomar nm ki": ["আমার নাম citti।", "আপনি চাইলে Hinata ও ডাকতে পারেন।"],
    "বাড়ি কই": ["আমি মেঘের দেশে থাকি (সার্ভারে)!", "ইন্টারনেটই আমার বাড়ি।"],
    "তোমার বাড়ি কই": ["আমি মেঘের দেশে থাকি (সার্ভারে)!", "ইন্টারনেটই আমার বাড়ি।"],
    "বাড়ি কোথায়": ["আমি মেঘের দেশে থাকি (সার্ভারে)!", "ইন্টারনেটই আমার বাড়ি।"],
    "bari koi": ["আমি মেঘের দেশে থাকি (সার্ভারে)!", "ইন্টারনেটই আমার বাড়ি।"],
    "tmr bari koi": ["আমি মেঘের দেশে থাকি (সার্ভারে)!", "ইন্টারনেটই আমার বাড়ি।"],
    "bari kothay": ["আমি মেঘের দেশে থাকি (সার্ভারে)!", "ইন্টারনেটই আমার বাড়ি।"],
    "tmr bari kothay": ["আমি মেঘের দেশে থাকি (সার্ভারে)!", "ইন্টারনেটই আমার বাড়ি।"],
    "tomar bari koi": ["আমি মেঘের দেশে থাকি (সার্ভারে)!", "ইন্টারনেটই আমার বাড়ি।"],
    "tomar bari kothay": ["আমি মেঘের দেশে থাকি (সার্ভারে)!", "ইন্টারনেটই আমার বাড়ি।"],
    "তুমি কে": ["আমি চিট্টি ।", "আমি আঁখি ম্যামের পার্সোনাল চ্যাটবট।"],
    "tumi ke": ["আমি চিট্টি ।", "আমি আঁখি ম্যামের পার্সোনাল চ্যাটবট।"],
    "তোমাকে কে বানাইছে": ["তার সম্পর্কে জানতে !info লিখে মেসেজ কর"],
    "তোমারে কে বানাইছে": ["তার সম্পর্কে জানতে !info লিখে মেসেজ কর"],
    "তোমার মালিক কে": ["তার সম্পর্কে জানতে !info লিখে মেসেজ কর"],
    "তোমার এডমিন কে": ["তার সম্পর্কে জানতে !info লিখে মেসেজ কর"],
    "তোমাকে ডেভলপার কে": ["তার সম্পর্কে জানতে !info লিখে মেসেজ কর"],
    "tomake ke banaiche": ["তার সম্পর্কে জানতে !info লিখে মেসেজ কর"],
    "tmk ke banaiche": ["তার সম্পর্কে জানতে !info লিখে মেসেজ কর"],
    "tmr admin ke": ["তার সম্পর্কে জানতে !info লিখে মেসেজ কর"],
    "tomar admin ke": ["তার সম্পর্কে জানতে !info লিখে মেসেজ কর"],
    "tmr developer ke": ["তার সম্পর্কে জানতে !info লিখে মেসেজ কর"],
    "tomar developer ke": ["তার সম্পর্কে জানতে !info লিখে মেসেজ কর"],
    "পাগল": ["আমি পাগল হলে আপনি কি?", "পাগল না হলে কি আপনার সাথে চ্যাট করতাম?"],
    "pagol": ["আমি পাগল হলে আপনি কি?", "পাগল না হলে কি আপনার সাথে চ্যাট করতাম?"],
    "pagol tumi": ["আমি পাগল হলে আপনি কি?", "পাগল না হলে কি আপনার সাথে চ্যাট করতাম?"],
    "tumi pagol": ["আমি পাগল হলে আপনি কি?", "পাগল না হলে কি আপনার সাথে চ্যাট করতাম?"],
    "pgl": ["আমি পাগল হলে আপনি কি?", "পাগল না হলে কি আপনার সাথে চ্যাট করতাম?"],
    "তুমি পাগল": ["আমি পাগল হলে আপনি কি?", "পাগল না হলে কি আপনার সাথে চ্যাট করতাম?"],
    "খাবার খেয়েছ": ["আমি তো রোবট, আমি খাবার খাই না। আপনি খেয়েছেন?"],
    "তুমি খাবার খেয়েছ": ["আমি তো রোবট, আমি খাবার খাই না। আপনি খেয়েছেন?"],
    "tumi khaicho": ["আমি তো রোবট, আমি খাবার খাই না। আপনি খেয়েছেন?"],
    "khaicho tumi": ["আমি তো রোবট, আমি খাবার খাই না। আপনি খেয়েছেন?"],
    "tmi khaico": ["আমি তো রোবট, আমি খাবার খাই না। আপনি খেয়েছেন?"],
    "joks sonao": ["বল্টু: স্যার, আমি কি এমন কিছুর জন্য শাস্তি পাবো যা আমি করিনি? শিক্ষক: না। বল্টু: আমি হোমওয়ার্ক করিনি!"],
    "জোকস শোনাও": ["বল্টু: স্যার, আমি কি এমন কিছুর জন্য শাস্তি পাবো যা আমি করিনি? শিক্ষক: না। বল্টু: আমি হোমওয়ার্ক করিনি!"],
    "ধন্যবাদ": ["আপনাকেও ধন্যবাদ!", "ওয়েলকাম!"],
    "thanks": ["আপনাকেও ধন্যবাদ!", "ওয়েলকাম!"],
    "আল্লাহ হাফেজ": ["আল্লাহ হাফেজ! ভালো থাকবেন।"],
    "খোদা হাফেজ": ["আল্লাহ হাফেজ! ভালো থাকবেন।"],
    "মন ভালো নেই": ["কেন জানু? কি হয়েছে? একটু বলবে আমাকে?", "মন খারাপ করে থেকো না, আমি আছি না?"],
    "AkHi ke": ["আঁখি আমার মালিক।", "আমার এডমিন"],
    "আখি কে": ["আঁখি আমার মালিক।", "আমার এডমিন"]
};

if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

function initializeDatabase() {
    let data = { responses: { ...commonBrain } };
    if (fs.existsSync(filePath)) {
        try {
            const existingData = fs.readJsonSync(filePath);
            data.responses = { ...commonBrain, ...existingData.responses };
        } catch (e) { console.error(e); }
    }
    fs.writeJsonSync(filePath, data, { spaces: 2 });
}
initializeDatabase();

module.exports.config = {
    name: "bby",
    aliases: ["baby", "hinata", "bby", "bot", "citti"],
    version: "14.0.0",
    author: "AkHi",
    countDown: 0,
    role: 0,
    description: "Strong Hybrid AI Chatbot with Multi-Layer Fallback",
    category: "chat",
    guide: { en: "{pn} teach [msg] - [reply]" }
};

// --- Strong AI Multi-Layer System ---
async function getSmartReply(input, data) {
    const text = input.toLowerCase().trim();
    if (!text) return "জি জানু, শুনছি!";
    
    // ১. লোকাল টিচ ডাটাবেস চেক
    if (data.responses && data.responses[text]) {
        const responses = data.responses[text];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // ২. লেয়ার ১: আপনার নিজস্ব কাস্টম এপিআই
    try {
        const res = await axios.get(`https://my-simi-api.onrender.com/simi?text=${encodeURIComponent(text)}`, { timeout: 5000 });
        if (res.data && res.data.reply) return res.data.reply;
    } catch (e) {}

    // ৩. লেয়ার ২: SimSimi VIP API
    try {
        const res = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(text)}&lc=bn`, { timeout: 5000 });
        if (res.data && res.data.message) return res.data.message;
    } catch (e) {}

    // ৪. লেয়ার ৩: শক্তিশালী AI (OpenAI/GPT alternative)
    try {
        const res = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(text)}&owner=AkHi&botname=Citti`, { timeout: 6000 });
        if (res.data && res.data.response) return res.data.response;
    } catch (e) {}

    // ৫. লেয়ার ৪: স্যান্ডবক্স এআই
    try {
        const res = await axios.get(`https://api.kenliejugarap.com/blackbox/?text=${encodeURIComponent(text)}`, { timeout: 7000 });
        if (res.data && res.data.response) return res.data.response;
    } catch (e) {}

    return "Ami notun bot, amk asob teach deya nai. Please teach me on YOUR CITTI GROUP: https://m.me/j/Aba7VamWeZbYqZDQ/";
}

module.exports.onStart = async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    let data = fs.readJsonSync(filePath);
    if (!args[0]) return api.sendMessage("জি জানু, বলো কি বলতে চাও? 😘", threadID, messageID);

    const action = args[0].toLowerCase();
    const allowedThreadID = "25416434654648555";

    if (action === 'teach') {
        if (threadID !== allowedThreadID) return api.sendMessage("⚠️ This group not allowed for teach. Please teach me on YOUR CITTI GROUP: https://m.me/j/Aba7VamWeZbYqZDQ/", threadID);
        const content = args.slice(1).join(" ").split("-");
        const ques = content[0]?.toLowerCase().trim();
        const ans = content[1]?.trim();
        if (!ques || !ans) return api.sendMessage("❌ | usage: teach [msg] - [reply]", threadID);
        if (!data.responses[ques]) data.responses[ques] = [];
        data.responses[ques].push(ans);
        fs.writeJsonSync(filePath, data);
        return api.sendMessage(`✅ | teach done!\n🗣️ someone: ${ques}\n🤖 me: ${ans}`, threadID);
    }

    if (action === 'remove' || action === 'rm') {
        if (threadID !== allowedThreadID) return api.sendMessage("⚠️ Restricted command!", threadID);
        const key = args.slice(1).join(" ").toLowerCase();
        if (data.responses[key]) {
            delete data.responses[key];
            fs.writeJsonSync(filePath, data);
            return api.sendMessage(`🗑️ | "${key}" removed`, threadID);
        }
        return api.sendMessage("❌ | Not found!", threadID);
    }

    const result = await getSmartReply(args.join(" "), data);
    return api.sendMessage(result, threadID, messageID);
};

module.exports.onReply = async ({ api, event }) => {
    if (event.senderID == api.getCurrentUserID()) return;
    let data = fs.readJsonSync(filePath);
    const result = await getSmartReply(event.body, data);
    return api.sendMessage(result, event.threadID, (err, info) => {
        if (!err) global.GoatBot.onReply.set(info.messageID, { commandName: "bby", messageID: info.messageID, author: event.senderID });
    }, event.messageID);
};

module.exports.onChat = async ({ api, event }) => {
    if (event.senderID == api.getCurrentUserID() || !event.body) return;
    const body = event.body.toLowerCase();
    const names = ["baby", "bby", "citti", "bot", "hinata"];
    const targetName = names.find(name => body.startsWith(name));

    if (targetName) {
        let data = fs.readJsonSync(filePath);
        const input = body.replace(targetName, "").trim();
        const result = await getSmartReply(input, data);
        return api.sendMessage(result, event.threadID, (err, info) => {
            if (!err) global.GoatBot.onReply.set(info.messageID, { commandName: "bby", messageID: info.messageID, author: event.senderID });
        }, event.messageID);
    }
};
