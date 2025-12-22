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

        // ১. লোকাল ডাটাবেস চেক
        if (brain[text] && brain[text].length > 0) {
            const replies = brain[text];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            return res.json({ reply: randomReply, status: "success", source: "local_brain" });
        }

        // ২. বিকল্প AI API (Heroku/Vercel ফ্রি API অনেক সময় ভালো কাজ করে)
        try {
            // আমি এখানে একটি পাবলিক Llama/GPT API ট্রাই করছি
            const response = await axios.get(`https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(text)}`);
            
            if (response.data && response.data.response) {
                return res.json({ reply: response.data.response, status: "success", source: "popcat_ai" });
            }
            throw new Error("AI API failed");

        } catch (aiErr) {
            // ৩. ব্যাকআপ হিসেবে সিমসিমি (SimSimi)
            const simi = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(text)}&lc=bn`);
            if (simi.data && simi.data.message) {
                return res.json({ reply: simi.data.message, source: "simsimi" });
            }
            throw new Error("All APIs failed");
        }

    } catch (e) {
        // ৪. ডিফল্ট মেসেজ
        const defaultMsgs = ["হুম বলো জানু, শুনছি তো।", "বুঝতে পারিনি সোনা, আবার বলো?", "সার্ভার একটু বিজি, আবার ট্রাই করো তো?"];
        res.json({ reply: defaultMsgs[Math.floor(Math.random() * defaultMsgs.length)], source: "default" });
    }
});

// শিখানো রুট (Teach) আগের মতোই থাকবে...
app.get('/teach', async (req, res) => {
    const { ques, ans } = req.query;
    if (!ques || !ans) return res.json({ error: "Format: /teach?ques=hi&ans=hello" });
    try {
        const brain = fs.readJsonSync(dataPath);
        const q = ques.toLowerCase().trim();
        if (!brain[q]) brain[q] = [];
        brain[q].push(ans);
        fs.writeJsonSync(dataPath, brain);
        res.json({ status: "success", message: "শিখে গেছি!" });
    } catch (e) {
        res.json({ error: "Failed to save data" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
