const nodemailer = require('nodemailer');
const fs = require('fs');

 const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MP
  }
});

 function readHTMLTemplate(templatePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(templatePath, 'utf8', (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

 async function sendEmailWithAttachments(to, cc, subject, path,attachments,resetURL) {
  try {
    const htmlTemplate = await readHTMLTemplate(path);

    const html = htmlTemplate.replace('{{tokenLink}}', resetURL);
    const mailOptions = {
      from: 'akramtrimech97@gmail.com',
      to: to,
      cc:cc,
      subject,
      html,
      attachments 
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email Sent Successfully to ' + mailOptions.to);
    return info;
  } catch (error) {
    console.log('Error Occurred:', error);
    throw error;
  }
}

module.exports = {
  sendEmailWithAttachments,
  readHTMLTemplate
};