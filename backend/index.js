const express = require('express');
const app = express();
const port = 8080;

app.get('/', (req, res) => {
  res.send('Hello World from Express.js!');
});

app.listen(port, () => {
  console.log(`Express server running at http://localhost:${port}`);
});