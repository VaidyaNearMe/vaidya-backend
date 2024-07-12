const mongoose = require("mongoose");

mongoose.connect(process.env.MONGOOSE_URL,
    {useUnifiedTopology: true, useNewUrlParser: true});

const connection = mongoose.connection;

module.exports = connection;
