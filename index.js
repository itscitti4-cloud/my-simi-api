const express = require('express');
const axios = require('axios');
const app = express();

app.get('/simi', async (req, res) => {
    const text = req.query.text;
    if (!text) return res.json({ error: "Text missing!" });

    try {
        /* এখানে আমরা একটি ফ্রি AI API ব্যবহার করছি যা GPT-3/4 এর মতো কাজ করে।
           এটি না পেলে বিকল্প হিসেবে Simsimi ব্যবহার করবে।
        */
        const response = await axios.get(`https://api.popcat.xyz/chatbot`, {
            params: {
                msg: text,
                owner: "AkHi",
                botname: "Bby"
            }
        });

        if (response.data && response.data.response) {
            return res.json({ 
                reply: response.data.response,
                status: "success",
                author: "AkHi"
            });
        } else {
            throw new Error("AI failed");
        }

    } catch (e) {
        // AI ফেইল করলে ব্যাকআপ হিসেবে Simsimi ব্যবহার করবে
        try {
            const simi = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(text)}&lc=bn`);
            res.json({ reply: simi.data.message });
        } catch (err) {
            res.json({ reply: "আমি এখন একটু ব্যস্ত, পরে কথা বলি? 🥺" });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Smart AI Server running on port ${PORT}`));
