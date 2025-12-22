Const express = require('express');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const app = express();

const dataPath = path.join(__dirname, "brain.json");

// ডাটা ফাইল নিশ্চিত করা
if (!fs.existsSync(dataPath)) {
    fs.writeJsonSync(dataPath, {});
}

/**
 * স্মার্ট রিপ্লাই ফাংশন
 * এটি প্রথমে লোকাল ব্রেইন চেক করবে, না পেলে API কল করবে এবং উত্তরটি ভবিষ্যতে ব্যবহারের জন্য সেভ করে রাখবে।
 */
async function getSmartReply(text, brainData) {
    const input = text.toLowerCase().trim();
    
    // ১. লোকাল ডাটাবেস চেক
    if (brainData[input] && brainData[input].length > 0) {
        const replies = brainData[input];
        return {
            reply: replies[Math.floor(Math.random() * replies.length)],
            source: "local_brain"
        };
    }

    // ২. AI API কল (SimSimi - যা বর্তমানে বেশ স্টেবল)
    try {
        const res = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(input)}&lc=bn`, { timeout: 10000 });
        
        if (res.data && res.data.message) {
            const botReply = res.data.message;

            // অটো-সেভ লজিক (Auto-Teach): উত্তরটি লোকাল মেমরিতে সেভ করে রাখা
            if (!brainData[input]) brainData[input] = [];
            if (!brainData[input].includes(botReply)) {
                brainData[input].push(botReply);
                fs.writeJsonSync(dataPath, brainData, { spaces: 2 });
            }

            return { reply: botReply, source: "simsimi_api" };
        }
        throw new Error("No response from API");

    } catch (err) {
        console.log("API Error:", err.message);
        // ৩. সব ফেইল করলে ডিফল্ট মেসেজ
        const fallbacks = ["হুম বলো জানু, শুনছি তো।", "বুঝতে পারিনি সোনা, আবার বলো?", "সার্ভার একটু বিজি, আবার ট্রাই করো?"];
        return {
            reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
            source: "default_fallback"
        };
    }
}

// --- API রুটস ---

// ১. সিমসিমি চ্যাট রুট
app.get('/simi', async (req, res) => {
    const text = req.query.text;
    if (!text) return res.json({ error: "Text missing!" });

    try {
        const brain = fs.readJsonSync(dataPath);
        const result = await getSmartReply(text, brain);
        
        res.json({
            status: "success",
            reply: result.reply,
            source: result.source
        });
    } catch (e) {
        res.json({ error: "Server Error", message: e.message });
    }
});

// ২. টিচ রুট (ম্যানুয়ালি শিখানোর জন্য)
app.get('/teach', async (req, res) => {
    const { ques, ans } = req.query;
    if (!ques || !ans) return res.json({ error: "Format: /teach?ques=hi&ans=hello" });

    try {
        const brain = fs.readJsonSync(dataPath);
        const q = ques.toLowerCase().trim();
        const a = ans.trim();

        if (!brain[q]) brain[q] = [];
        if (!brain[q].includes(a)) {
            brain[q].push(a);
            fs.writeJsonSync(dataPath, brain, { spaces: 2 });
        }
        
        res.json({ status: "success", message: "শিখানো সফল হয়েছে!", data: { ques: q, ans: a } });
    } catch (e) {
        res.json({ error: "Failed to save data" });
    }
});

// ৩. হোম রুট
app.get('/', (req, res) => {
    res.send("Smart AI Chatbot API is Running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`Server is running on port: ${PORT}`);
    console.log(`Local Brain: ${dataPath}`);
    console.log(`========================================`);
});

এই file টি Api index.js হিসেবে কাজ করবে?
