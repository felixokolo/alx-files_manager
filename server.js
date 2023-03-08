const express = require('express');
import router from './routes/index';
const app = express();
const port = process.env.PORT || 5000;
router(app);
 
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
