const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    Writer:mongoose.Schema.Types.String,
    Title:mongoose.Schema.Types.String,
    Briefnews:mongoose.Schema.Types.String,
    Content:mongoose.Schema.Types.String,
    Attime:mongoose.Schema.Types.String,
    Status:mongoose.Schema.Types.String,
    Kind:mongoose.Schema.Types.String,
    image:mongoose.Schema.Types.String
});

module.exports = mongoose.model('blog',userSchema)