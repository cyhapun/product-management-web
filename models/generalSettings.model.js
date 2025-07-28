const mongoose = require("mongoose");

const generalSettingsSchema = new mongoose.Schema(
  {
    websiteName: String,
    logo: String,
    phone: String,
    email: String,
    address: String,
    copyright: String,
  },
  {
    timestamps: true,
  }
);

const GeneralSettings = mongoose.model("GeneralSettings", generalSettingsSchema, "general-settings");

module.exports = GeneralSettings;
