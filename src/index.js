const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001
app.use(express.json());

app.use('/', (req, res, next) => {
  res.send("gello");
})

app.listen(PORT, () => {
  console.log("App is listening on PORT " + PORT);
});