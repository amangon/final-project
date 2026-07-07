const Settings = require('../models/Settings');

exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.find({ isPublic: true });
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json({ success: true, settings: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
};

exports.adminGetSettings = async (req, res) => {
  try {
    const settings = await Settings.find({});
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
};

exports.adminUpdateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await Settings.findOneAndUpdate(
      { key }, { value }, { new: true, upsert: true }
    );
    res.json({ success: true, setting });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
};

exports.adminUpdateMultiple = async (req, res) => {
  try {
    const { settings } = req.body;
    const updates = Object.entries(settings).map(([key, value]) =>
      Settings.findOneAndUpdate({ key }, { value }, { upsert: true, new: true })
    );
    await Promise.all(updates);
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};