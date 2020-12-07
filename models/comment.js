var mongoose = require("mongoose");
 
var commentSchema = new mongoose.Schema({
    text: String,
    author: {
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref:"User"
			//id is a reference to a User model Id
		},
	username: String
	}
	
});
 
module.exports = mongoose.model("Comment", commentSchema);
