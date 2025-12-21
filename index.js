const express = require('express');
const axios = require('axios');
const app = express();

app.get('/simi', async (req, res) => {
    const text = req.query.text;
    if (!text) return res.json({ error: "Text missing!" });

    try {
        // পাবলিক সোর্স থেকে ডাটা আনা
        const response = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(text)}&lc=bn`);
        res.json({ reply: response.data.message });
    } catch (e) {
        res.json({ reply: "ওহ! আমার সার্ভারে একটু সমস্যা হয়েছে।" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
