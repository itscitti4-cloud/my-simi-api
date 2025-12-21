const express = require('express');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const app = express();

const dataPath = path.join(__dirname, "brain.json");

// ডাটা ফাইল নিশ্চিত করা
if (!fs.existsSync(dataPath)) {
    fs.writeJsonSync(dataPath, {});
}

app.get('/simi', async (req, res) => {
    const text = req.query.text ? req.query.text.toLowerCase().trim() : null;
    if (!text) return res.json({ error: "Text missing!" });

    try {
        const brain = fs.readJsonSync(dataPath);

        // ১. লোকাল ডাটাবেস চেক (শিখানো উত্তর)
        if (brain[text] && brain[text].length > 0) {
            const replies = brain[text];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            return res.json({ reply: randomReply, status: "success", source: "local_brain" });
        }

        // ২. Meta AI (Llama 3) কল করা
        try {
            // অনেক সময় ফ্রি এপিআই স্লো থাকে, তাই টাইমআউট একটু বাড়ানো হয়েছে
            const response = await axios.get(`https://api.shuddho-ai-api.onrender.com/llama?prompt=${encodeURIComponent(text)}`, { timeout: 15000 });
            
            if (response.data && response.data.answer) {
                return res.json({ reply: response.data.answer, status: "success", source: "llama_3" });
            } else {
                console.log("Llama API response format error:", response.data);
                throw new Error("Llama API format error");
            }
        } catch (llamaErr) {
            console.error("Llama AI failed, trying SimSimi...", llamaErr.message);
            throw llamaErr; // এটি পরবর্তী catch ব্লকে পাঠিয়ে দিবে
        }

    } catch (e) {
        // ৩. ব্যাকআপ হিসেবে সিমসিমি
        try {
            const simi = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(text)}&lc=bn`);
            if (simi.data && simi.data.message) {
                return res.json({ reply: simi.data.message, source: "simsimi" });
            }
            throw new Error("SimSimi failed");
        } catch (err) {
            // ৪. সব ফেইল করলে ডিফল্ট মেসেজ
            const defaultMsgs = ["হুম বলো জানু, শুনছি তো।", "বুঝতে পারিনি সোনা, আবার বলো?", "বলো জানু, আমি তোমার পাশেই আছি।"];
            res.json({ reply: defaultMsgs[Math.floor(Math.random() * defaultMsgs.length)], source: "default" });
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
app.listen(PORT, () => console.log(`Meta AI (Llama 3) API running on port ${PORT}`));
            
