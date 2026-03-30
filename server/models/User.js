const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

name:String,
email:String,
password:String,

role:{
type:String,
enum:["patient","doctor"],
default:"patient"
},

speciality:String,
location:String,
fee:Number,
experience:String,
img:String

});

module.exports = mongoose.model("User",UserSchema);
