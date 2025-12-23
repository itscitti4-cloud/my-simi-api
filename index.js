//const express/// = require('express');
//const axios = require('axios');
//const fs = require('fs-extra');
const path = require('path');
const app = express();

// ডাটা ফাইল পাথ (Render-এ ফাইল সেভ করার জন্য brain.json রুটেই থাকবে)
const dataPath = path.join(__dirname, "brain.json");

// ডাটা ফাইল না থাকলে তৈরি করা
if (!fs.existsSync(dataPath)) {
    fs.writeJsonSync(dataPath, {});
}

/**
 * Smart Reply Logic
 */
async function getSmartReply(text, brainData) {
    const input = text.toLowerCase().trim();
    
    // ১. লোকাল ডাটাবেস চেক
    if (brainData[input] && Array.isArray(brainData[input]) && brainData[input].length > 0) {
        const replies = brainData[input];
        return {
            reply: replies[Math.floor(Math.random() * replies.length)],
            source: "local_brain"
        };
    }

    // ২. সিমসিমি API কল
    try {
        const res = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(input)}&lc=bn`, { timeout: 10000 });
        
        if (res.data && res.data.message) {
            const botReply = res.data.message;

            // অটো-টিচ: ভবিষ্যতে ব্যবহারের জন্য সেভ করা
            if (!brainData[input]) brainData[input] = [];
            if (!brainData[input].includes(botReply)) {
                brainData[input].push(botReply);
                // ফাইল রাইট করার সময় এরর হ্যান্ডলিং
                await fs.writeJson(dataPath, brainData, { spaces: 2 });
            }

            return { reply: botReply, source: "simsimi_api" };
        }
        throw new Error("API_NO_RESPONSE");
    } catch (err) {
        // ৩. ফলব্যাক (যদি API কাজ না করে)
        const fallbacks = ["হুম বলো জানু, শুনছি তো।", "বুঝতে পারিনি সোনা, আবার বলো?", "একটু পরে চেষ্টা করো জানু।"];
        return {
            reply: fallbacks[Math.floor(Math.random() * fallbacks.length)],
            source: "default_fallback"
        };
    }
}

// --- Routes ---

// চ্যাট রুট
app.get('/simi', async (req, res) => {
    const text = req.query.text;
    if (!text) return res.status(400).json({ error: "Text parameter is missing!" });

    try {
        const brain = await fs.readJson(dataPath);
        const result = await getSmartReply(text, brain);
        res.json({
            status: "success",
            reply: result.reply,
            source: result.source
        });
    } catch (e) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// টিচ রুট
app.get('/teach', async (req, res) => {
    const { ques, ans } = req.query;
    if (!ques || !ans) return res.status(400).json({ error: "Format: /teach?ques=hi&ans=hello" });

    try {
        const brain = await fs.readJson(dataPath);
        const q = ques.toLowerCase().trim();
        const a = ans.trim();

        if (!brain[q]) brain[q] = [];
        if (!brain[q].includes(a)) {
            brain[q].push(a);
            await fs.writeJson(dataPath, brain, { spaces: 2 });
        }
        
        res.json({ status: "success", message: "Successfully taught!", data: { ques: q, ans: a } });
    } catch (e) {
        res.status(500).json({ error: "Failed to save data" });
    }
});

app.get('/', (req, res) => {
    res.send("Smart AI Chatbot API is Running smoothly!");
});

// Port configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
