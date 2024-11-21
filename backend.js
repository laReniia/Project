const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');  // Required for serving static files

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve static files (your frontend HTML, CSS, JS files)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to fetch search results
app.post('/search', async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        // Make a request to Google
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        // Parse results with Cheerio
        const $ = cheerio.load(data);
        const results = [];
        $('.tF2Cxc').each((i, element) => {
            const title = $(element).find('.DKV0Md').text();
            const link = $(element).find('a').attr('href');
            const snippet = $(element).find('.VwiC3b').text();
            if (title && link) {
                results.push({ title, link, snippet });
            }
        });

        res.json({ results });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch search results', details: error.message });
    }
});

// Start server on dynamic PORT
const PORT = process.env.PORT || 3000;  // Use the dynamic PORT if available
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
