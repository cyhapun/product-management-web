const GeneralSettings = require('../../models/generalSettings.model');

// [GET] /settings/general
module.exports.generalSettings = async (req, res) => {
  const settings = await GeneralSettings.findOne({});

  res.render('./admin/pages/settings/general.pug', {
    pageTitle: "General settings",
    settings:settings,
  });
}

// [PATCH] /settings/general
module.exports.generalSettingsPatch = async (req, res) => {
  try {
    let settings = await GeneralSettings.findOne({});
    if (!settings) {
      settings = new GeneralSettings(req.body);
    } else {
      settings.set(req.body); // Cập nhật các trường từ body
    }
    await settings.save();
    res.status(200).json({
      message:'success',
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({
      message:'error',
    });
  }
}
