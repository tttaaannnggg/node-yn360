const light = require('../util/light');
const LightController = {};

LightController.setLight(req, res, next)=>{
  const options = req.body;
  light.sendWrite(options,(err, state)=>{
    if(err) return next(err);
    res.locals.state = state;
    return next();
  })
}

LightController.getState(req, res, next)=>{
  res.locals.state = light.getState();
  return next();
}

module.exports = LightController;
