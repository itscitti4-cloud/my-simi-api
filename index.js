const express = require('express'); // 'const' ছোট হাতের করা হয়েছে
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const app = express();

// Render-এ /tmp ফোল্ডার ব্যবহার করা বেশি নিরাপদ অথবা রুট ডিরেক্টরি
const dataPath = path.join(__dirname, "brain.json");

// ডাটা ফাইল নিশ্চিত করা
if (!fs.existsSync(dataPath)) {
    fs.writeJsonSync(dataPath, {});
}

async function getSmartReply(text, brainData) {
    const input = text.toLowerCase().trim();
    
    if (brainData[input] && brainData[input].length > 0) {
        const replies = brainData[input];
        return {
            reply: replies[Math.floor(Math.random() * replies.length)],
            source: "local_brain"
        };
    }

    try {
        const res = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(input)}&lc=bn`, { timeout: 10000 });
        
        if (res.data && res.data.message) {
            const botReply = res.data.message;

            if (!brainData[input]) brainData[input] = [];
            if (!brainData[input].includes(botReply)) {
                brainData[input].push(botReply);
                fs.writeJsonSync(dataPath, brainData, { spaces: 2 });
            }

            return { reply: botReply, source: "simsimi_api" };
        }
        throw new Error("No response");
    } catch (err) {
        const fallbacks = ["হুম বলো জানু, শুনছি তো।", "বুঝতে পারিনি সোনা, আবার বলো?"];
        return {
            reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
            source: "default_fallback"
        };
    }
}

app.get('/simi', async (req, res) => {
    const text = req.query.text;
    if (!text) return res.json({ error: "Text missing!" });
    try {
        const brain = fs.readJsonSync(dataPath);
        const result = await getSmartReply(text, brain);
        res.json({ status: "success", reply: result.reply, source: result.source });
    } catch (e) {
        res.json({ error: "Server Error" });
    }
});

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
        res.json({ status: "success", message: "Success!" });
    } catch (e) {
        res.json({ error: "Failed" });
    }
});

app.get('/', (req, res) => {
    res.send("Smart AI Chatbot API is Running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
