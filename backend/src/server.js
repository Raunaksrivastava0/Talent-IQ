import express from 'express';
import { ENV } from './libs/env.js';

const app = express();

console.log(ENV.PORT);
console.log(ENV.DB_URL);

app.get('/', (req, res) => {
  res.status(200).json({ msg:"sucess from ssi" });
})
app.listen(ENV.PORT, () => console.log('Server running on port ' + ENV.PORT));