const QRCode = require('qrcode');

const generateUPIQR = async (upiId, businessName, merchantName, amount, planName) => {
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(planName + ' Plan - InterviewAI')}`;
  const qrDataUrl = await QRCode.toDataURL(upiUrl, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' }
  });
  return { qrDataUrl, upiUrl };
};

module.exports = { generateUPIQR };