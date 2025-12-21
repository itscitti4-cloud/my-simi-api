const express = require('express');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const app = express();

const dataPath = path.join(__dirname, "brain.json");

// ডাটাবেজ ফাইল না থাকলে তৈরি করবে
if (!fs.existsSync(dataPath)) {
    const defaultData = {
        "কেমন আছো": ["আমি ভালো আছি জানু, তুমি?", "খুব ভালো, তুমি কেমন আছো সোনা?"],
        "হাই": ["হ্যালো জানু!", "বলো সোনা শুনছি।"]
    };
    fs.writeJsonSync(dataPath, defaultData);
}

app.get('/simi', async (req, res) => {
    const text = req.query.text ? req.query.text.toLowerCase().trim() : null;
    if (!text) return res.json({ error: "Text missing!" });

    try {
        const brain = fs.readJsonSync(dataPath);

        // ১. আগে চেক করবে আপনার ডাটাবেজে (Teach) উত্তর আছে কি না
        if (brain[text]) {
            const replies = brain[text];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            return res.json({ reply: randomReply, status: "success" });
        }

        // ২. ডাটাবেজে না থাকলে Gemini AI ব্যবহার করবে
        try {
            const geminiRes = await axios.get(`https://api.kenliejugarap.com/gemini/?prompt=${encodeURIComponent(text)}`);
            
            if (geminiRes.data && geminiRes.data.response) {
                return res.json({ 
                    reply: geminiRes.data.response, 
                    status: "success",
                    model: "Gemini" 
                });
            } else {
                throw new Error("Gemini error");
            }
        } catch (geminiError) {
            // ৩. Gemini ফেইল করলে ব্যাকআপ হিসেবে চ্যাটবট এপিআই
            const backupRes = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(text)}&owner=AkHi&botname=Bby`);
            return res.json({ reply: backupRes.data.response, status: "success" });
        }

    } catch (e) {
        // ৪. সব ফেইল করলে লোকাল র‍্যান্ডম রিপ্লাই
        const fallbacks = [
            "হুম জানু বলো, শুনতেছি।",
            "বুঝতে পারিনি সোনা, আবার বলবে কি?",
            "আমি তোমার সাথেই আছি।"
        ];
        res.json({ reply: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
    }
});

// --- টিচ রুট ---
app.get('/teach', async (req, res) => {
    const { ques, ans } = req.query;
    if (!ques || !ans) return res.json({ error: "Format: /teach?ques=hi&ans=hello" });

    try {
        const brain = fs.readJsonSync(dataPath);
        const q = ques.toLowerCase().trim();
        const a = ans.trim();

        if (!brain[q]) brain[q] = [];
        brain[q].push(a);

        fs.writeJsonSync(dataPath, brain);
        res.json({ status: "success", message: "Shikhya gesi!" });
    } catch (e) {
        res.json({ error: "Failed to save data" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gemini-Hybrid API running on port ${PORT}`));
