var mongoose = require("mongoose");


var SubmissionSchema = new mongoose.Schema({
	brief:String,
	techstack:String,
	details:String,
	image:String,
	name:String,
	upvotes:Number
});


module.exports = mongoose.model("Submission",SubmissionSchema);