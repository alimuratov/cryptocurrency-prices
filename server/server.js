const express = require('express');
const axios = require('axios');
const cors = require('cors'); 
const crypto = require('crypto');
const app = express();
const PORT = 5001;
const REFRESH_INTERVAL = 3000;

app.use(cors({exposedHeaders: ['etag']}));

app.use(express.json());

let eTagBlock = {
    eTag: "",
    data: null, 
    lastUpdated: new Date(0)
};

function updateETagData(newData) {
    const newETag = generateETag(newData);
    eTagBlock = {
        eTag: newETag,
        data: newData,
        lastUpdated: new Date()
    };
}

function generateETag(data) {
    const dataStringified = JSON.stringify(data);
    const hash = crypto.createHash('sha256').update(dataStringified).digest('hex');
    return hash;
}

app.get('/api/prices', async (req, res) => {
    const requestETag = req.headers['if-none-match'];
    const currentETag = eTagBlock.eTag;

    console.log("requestETag: ", requestETag, ", currentETag: ", currentETag);
    
    const isDataOld = new Date() - eTagBlock.lastUpdated > REFRESH_INTERVAL;

    if (isDataOld) {
        try {
            const response = await axios.get('https://api.coincap.io/v2/assets?ids=bitcoin,ethereum,litecoin,monero,xrp,dogecoin,dash');
            updateETagData(response.data.data);
        } catch (error) {
            console.log("Error: ", error);
        }
    } else if (requestETag === currentETag ) {
        return res.status(304).end(); 
    }

    res.setHeader('etag', eTagBlock.eTag);
    res.json(eTagBlock.data);
});

app.listen(PORT, () => {
    console.log("Server is running on: ", PORT);
});