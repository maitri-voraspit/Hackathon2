var mongoose = require("mongoose");


var ProjectSchema = new mongoose.Schema({
	topic:String,
	district:String,
	idea_found:Boolean,
	image:String,
	genre:String,
	introduction:String,
	deadline:String,
	// submissions:Number,
	subs:[{
	   type:mongoose.Schema.Types.ObjectId,
	   ref:"Submission"
	}],
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
	final_sub:{
	   type:mongoose.Schema.Types.ObjectId,
	   ref:"Submission"
	}
});


module.exports = mongoose.model("Project",ProjectSchema);