const express = require('express');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const app = express();

const dataPath = path.join(__dirname, "brain.json");

if (!fs.existsSync(dataPath)) {
    fs.writeJsonSync(dataPath, {});
}

// --- স্মার্ট রিপ্লাই ফাংশন ---
async function getAIResponse(text) {
    try {
        // সোর্স ১: নতুন একটি দ্রুততম GPT প্রক্সি
        const res = await axios.get(`https://shuddho-ai-api.onrender.com/gpt?prompt=${encodeURIComponent(text)}`, { timeout: 8000 });
        if (res.data && res.data.answer) return res.data.answer;
        throw new Error("Source 1 Failed");
    } catch (e) {
        try {
            // সোর্স ২: বিকল্প চ্যাটবট এপিআই
            const res2 = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(text)}&owner=AkHi&botname=Bby`, { timeout: 8000 });
            if (res2.data && res2.data.response) return res2.data.response;
            throw new Error("Source 2 Failed");
        } catch (e2) {
            return null; // সব ফেইল করলে নাল রিটার্ন করবে
        }
    }
}

app.get('/simi', async (req, res) => {
    const text = req.query.text ? req.query.text.toLowerCase().trim() : null;
    if (!text) return res.json({ error: "Text missing!" });

    try {
        const brain = fs.readJsonSync(dataPath);

        // ১. আগে চেক করবে আপনি নিজে কিছু শিখিয়েছেন কি না
        if (brain[text]) {
            const replies = brain[text];
            return res.json({ reply: replies[Math.floor(Math.random() * replies.length)], status: "success" });
        }

        // ২. শিখিয়ে না থাকলে AI থেকে উত্তর আনবে
        const aiReply = await getAIResponse(text);
        
        if (aiReply) {
            return res.json({ reply: aiReply, status: "success" });
        } else {
            // ৩. সব এপিআই ফেইল করলে লোকাল ডাটাবেজ থেকে র‍্যান্ডম কথা বলবে
            const fallbackReplies = [
                "হুম বলো জানু, শুনছি তো।",
                "আমি ঠিক বুঝতে পারছি না, আর একবার বলো?",
                "বলো সোনা, আমি তোমার পাশেই আছি।",
                "এখন একটু নেটওয়ার্ক ডিস্টার্ব দিচ্ছে, কিন্তু তুমি বলো।"
            ];
            return res.json({ reply: fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)] });
        }

    } catch (e) {
        res.json({ reply: "হুম জানু, বলো আমি শুনছি।" });
    }
});

// --- টিচ রুট ---
app.get('/teach', async (req, res) => {
    const { ques, ans } = req.query;
    if (!ques || !ans) return res.json({ error: "Format: /teach?ques=hi&ans=hello" });

    try {
        const brain = fs.readJsonSync(dataPath);
        const q = ques.toLowerCase().trim();
        if (!brain[q]) brain[q] = [];
        brain[q].push(ans);
        fs.writeJsonSync(dataPath, brain);
        res.json({ status: "success", message: "Shikhya gesi!" });
    } catch (e) {
        res.json({ error: "Failed to save data" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Smart Server running on port ${PORT}`));
