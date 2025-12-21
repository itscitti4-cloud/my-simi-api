const express = require('express');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const app = express();

const dataPath = path.join(__dirname, "brain.json");

if (!fs.existsSync(dataPath)) {
    fs.writeJsonSync(dataPath, {});
}

app.get('/simi', async (req, res) => {
    const text = req.query.text ? req.query.text.toLowerCase().trim() : null;
    if (!text) return res.json({ error: "Text missing!" });

    try {
        const brain = fs.readJsonSync(dataPath);

        // ১. আগে চেক করবে আপনার শিখানো উত্তর (Fastest)
        if (brain[text]) {
            const replies = brain[text];
            return res.json({ reply: replies[Math.floor(Math.random() * replies.length)], status: "success" });
        }

        // ২. শিখানো উত্তর না থাকলে নতুন সুপার ফাস্ট GPT-4o API
        const response = await axios.get(`https://api.deku-genshin.eu.org/gpt4o?prompt=${encodeURIComponent(text)}`, { timeout: 10000 });
        
        if (response.data && response.data.answer) {
            return res.json({ reply: response.data.answer, status: "success" });
        } else {
            throw new Error("Fast AI Failed");
        }

    } catch (e) {
        // ৩. ব্যাকআপ হিসেবে সিমসিমি (যদি GPT দেরি করে)
        try {
            const simi = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(text)}&lc=bn`);
            res.json({ reply: simi.data.message });
        } catch (err) {
            res.json({ reply: "হুম জানু বলো, আমি তোমার কথা শুনতেছি। 😘" });
        }
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
app.listen(PORT, () => console.log(`Super Fast AI API running on port ${PORT}`));
