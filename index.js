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

        // ১. আপনার শেখানো উত্তর আগে চেক করবে (এটি কখনো ফেইল হবে না)
        if (brain[text]) {
            const replies = brain[text];
            return res.json({ reply: replies[Math.floor(Math.random() * replies.length)], status: "success" });
        }

        // ২. সরাসরি Simsimi API (এটি অনেক বেশি স্টেবল)
        const simiRes = await axios.get(`https://api.simsimi.vn/v1/simtalk`, {
            params: { text: text, lc: 'bn' }
        });

        if (simiRes.data && simiRes.data.message) {
            return res.json({ reply: simiRes.data.message, status: "success" });
        } else {
            throw new Error("Simsimi Failed");
        }

    } catch (e) {
        // ৩. যদি সিমসিমিও ফেইল করে তবে একটি স্মার্ট ডিফল্ট রিপ্লাই
        const fallbacks = [
            "হুম বলো জানু, শুনছি।",
            "বুঝতে পারিনি সোনা, আবার বলো?",
            "আমি তোমার সাথেই আছি।",
            "কি বললা? আবার বলো তো!"
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
        if (!brain[q]) brain[q] = [];
        brain[q].push(ans);
        fs.writeJsonSync(dataPath, brain);
        res.json({ status: "success", message: "Shikhya gesi!" });
    } catch (e) {
        res.json({ error: "Failed to save data" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Stable API running on port ${PORT}`));
