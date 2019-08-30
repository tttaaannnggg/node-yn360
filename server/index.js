const path = require('path');
const express = require('express');
const app = express();
const LightController = require('./controllers/LightController'));
const port = 3000;

app.post('/write', LightController.setLight, (req, res)=>{
  return res.json(res.locals.state);
})

app.get('/status', LightController.getState, (req, res)=>{
  return res.json(res.locals.state);
})

app.use((err, req, res, next)=>{
  console.error('error!', err);
  res.status(err.status).send(err.details);
})

app.listen(port, (err)=>{
  console.log(err||`listening on port ${port});
});
