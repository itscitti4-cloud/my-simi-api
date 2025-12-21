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

        // ১. আগে চেক করবে আপনি নিজে কিছু শিখিয়েছেন কি না
        if (brain[text]) {
            const replies = brain[text];
            return res.json({ reply: replies[Math.floor(Math.random() * replies.length)], status: "success" });
        }

        // ২. শিখিয়ে না থাকলে এই উন্নত AI API ব্যবহার করবে
        const response = await axios.get(`https://api.sumon-host.click/gpt?prompt=${encodeURIComponent(text)}`);
        
        if (response.data && response.data.content) {
            return res.json({ reply: response.data.content, status: "success" });
        } else {
            throw new Error("AI failed");
        }

    } catch (e) {
        // ৩. যদি উপরের সব ফেইল করে, তবে সিমসিমি (সর্বশেষ চেষ্টা)
        try {
            const simi = await axios.get(`https://sandipbaruwal.onrender.com/simi?text=${encodeURIComponent(text)}&lc=bn`);
            res.json({ reply: simi.data.answer || "হুম বলো জানু!" });
        } catch (err) {
            res.json({ reply: "উফ জানু! আমার নেটওয়ার্কে খুব সমস্যা হচ্ছে। একটু পরে কথা বলি? 🥺" });
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
    
