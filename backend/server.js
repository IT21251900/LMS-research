const express = require('express');
const app = express();
const port = 3000;

// A sample route
app.get('/', (req, res) => {
    res.send('Hello, PDF Extraction!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
