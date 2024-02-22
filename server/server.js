const express = require('express');
const axios = require('axios');
const cors = require('cors'); 
const app = express();
const PORT = 5001;

app.use(cors()); 
app.use(express.json());

app.get('/api/prices', async (req, res) => {
    try {
        const response = await axios.get('https://api.coincap.io/v2/assets');
        res.json(response.data);
    } catch (error) {
        console.log("Error: ", error);
    }
});

app.listen(PORT, () => {
    console.log("Server is running on: ", PORT);
});