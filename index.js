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

        // ১. শেখানো উত্তর থাকলে সেটি আগে দিবে
        if (brain[text]) {
            const replies = brain[text];
            return res.json({ reply: replies[Math.floor(Math.random() * replies.length)], status: "success" });
        }

        // ২. নতুন স্টেবল GPT API (এটি অনেক দ্রুত কাজ করবে)
        const aiResponse = await axios.get(`https://noobs-api2.onrender.com/dipto/baby?prompt=${encodeURIComponent(text)}`);
        
        if (aiResponse.data && aiResponse.data.reply) {
            return res.json({ reply: aiResponse.data.reply, status: "success" });
        } else {
            throw new Error("AI Failed");
        }

    } catch (e) {
        // ৩. AI ফেইল করলে ব্যাকআপ Simsimi (Bengali)
        try {
            const simi = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(text)}&lc=bn`);
            res.json({ reply: simi.data.message });
        } catch (err) {
            res.json({ reply: "আমি একটু কনফিউজড হয়ে গেছি জানু, আবার বলো? 🥺" });
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
app.listen(PORT, () => console.log(`Smart AI Server running on port ${PORT}`));
                        
