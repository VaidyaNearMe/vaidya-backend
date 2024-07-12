const nodemailer = require("nodemailer");
const nodemailerConfig = require("./NodeMailerConfig");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport(nodemailerConfig)
  try {
    return transporter.sendMail({
      from: process.env.SMPT_MAIL,
      to: options.email,
      subject: options.subject,
      html: options.data
    }, function (err) {
      if (err)
        console.log(err, "pppppppppppppppppppp");
    });
  } catch (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = sendEmail;
