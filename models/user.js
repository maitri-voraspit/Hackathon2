var mongoose = require("mongoose");
var passportlocalmongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username:String,
	password:String,
	email:String,
	district:String,
	institute:String,
	role:String,
	skill:String
});

UserSchema.plugin(passportlocalmongoose);
module.exports = mongoose.model("User",UserSchema);