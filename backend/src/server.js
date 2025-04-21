const app = require('./app'); // import the Express app from app.js
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



// const express = require('express');
// const app = express();
// const PORT = process.env.PORT || 3001;

// // Default route to handle "/"
// app.get('/', (req, res) => {
//     res.send('Backend is running!');
// });

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
