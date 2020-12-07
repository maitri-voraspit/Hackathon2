var mongoose = require("mongoose");
var passportlocalmongoose = require("passport-local-mongoose");

var JobSchema = new mongoose.Schema({
	vacancy:String,
	title:String,
	location:String,
	item:String,//finished product
	details:String,
	money:String,
	
});

module.exports = mongoose.model("Job",JobSchema);