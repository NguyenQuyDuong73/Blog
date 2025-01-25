const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    Username: {
        type: String,
        required: true,
        unique: true, // Ensures username uniqueness
        trim: true // Removes any leading/trailing whitespace
      },
    Password:mongoose.Schema.Types.String,
    Email:mongoose.Schema.Types.String,
    Role:mongoose.Schema.Types.String
});

module.exports = mongoose.model('acc',userSchema)