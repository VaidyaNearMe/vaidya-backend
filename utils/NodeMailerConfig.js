module.exports = {
    service: "gmail",
    auth:{
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD
    }
};
