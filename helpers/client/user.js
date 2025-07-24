const PASS_EMAIL =  process.env.PASS_EMAIL;
const EMAIL =  process.env.EMAIL;
const nodemailer = require('nodemailer');

module.exports.generateOTP = (length = 4) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};


module.exports.sendMail = (targetEmail, subjectMail, htmlContent) => {
  const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:  `${EMAIL}`,
    pass: `${PASS_EMAIL}`
  }
});

const mailOptions = {
  from: `${EMAIL}`,
  to: `${targetEmail}`,
  subject: `${subjectMail}`,
  html: `${htmlContent}`,
};

transporter.sendMail(mailOptions, function(error, info) {
  if (error) 
    console.log(error);
  else {
    console.log('Email sent: ' + info.response);
    // do something useful
  }
});

}