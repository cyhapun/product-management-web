const GeneralSettings = require('../../models/generalSettings.model');

module.exports.generalSettings = async (req, res, next) => {
  const settings = await GeneralSettings.findOne({});
  res.locals.generalSettings = settings;
  next();
} 