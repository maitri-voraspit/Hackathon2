var express = require("express");
var mongoose = require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var passportLocalMongoose =require("passport-local-mongoose");
var User = require("./models/user");
var Project =require("./models/project");
var Submission = require("./models/submission");
var Comment =require("./models/comment");

var Job =require("./models/job")

const axios = require('axios');
// var Game = require("./models/game");
var app = express();




mongoose.connect('mongodb://localhost:27017/swtn', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));



app.use(express.static(__dirname + '/public'));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({encoded:true}));


app.use(require("express-session")({
	
	secret:"Rusty is the best",
	resave:false,
	saveUninitialized:false
	
}));

//Initialize and session should always come after requiring express and session
app.use(passport.initialize());
app.use(passport.session());
		
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req,res,next){
	
	res.locals.currentUser = req.user;
	
	next();
});



app.get("/",function(req,res){
	res.render("index");
});

//////////////////////chat/////////////////////////////
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get("/chat",function(req, res){
  res.render("chat");
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

io.on('connection', (socket) => {
  socket.on('5'+'chat message', (msg) => {
    console.log('message: ' + msg);
  });
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});
//////////////////////////////////////////////////


app.get("/index",function(req,res){
	res.render("index");
});



app.get("/showtable",function(req,res){
	res.render("ranks");
});

app.get("/register",function(req,res){
	res.render("register");
});

app.post("/register",function(req,res){
	User.register(new User({username:req.body.username,email:req.body.email,district:req.body.district,institute:req.body.institute,role:req.body.role,skill:req.body.skill}),req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req,res,function(){
			res.render("login");
		})
	})
})

app.get("/login",function(req,res){
	res.render("login");
})

app.post("/login",passport.authenticate("local",{
	successRedirect:"/index",
	failureRedirect:"/login"
}),function(req,res){
	console.log(req.user);
})

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
})



app.get("/upload",isAdmin,function(req,res){
	res.render("upload");	
})


app.post("/upload",isAdmin,function(req,res){
	Project.create(new Project({topic:req.body.topic,district:req.body.district,image:req.body.image,genre:req.body.genre,introduction:req.body.introduction,deadline:req.body.deadline,idea_found:false}),function(err,project){
		if(err){
			console.log(err);
			return res.render("upload");
		}
		res.redirect("/dashboard");
	})
})

app.get("/dashboard",function(req,res){
	Project.find({},function(err,allprojects){
		if(err){
			console.log(err);
			return res.render("index");
		}
		else{
			res.render("dashboard",{projects:allprojects});
		}
	})
})

app.get("/dashboard/:id",function(req,res){
	
	Project.findById(req.params.id).populate("comments").exec(function(err,project){
		if(err){
			console.log(err)
		}else{
			
			res.render("showproject",{single_project:project,currentUser:req.user});
		}
	})
})

app.get("/dashboard/:id/submit",isStudent,function(req,res){
	Project.findById(req.params.id,function(err,foundproject){
		if(err){
			console.log(err);
		}else{
			res.render("submit",{project:foundproject});
		}
	})
	
})

app.get("/dashboard/:id/project_subs",isAdmin,function(req,res){
	
	Project.findById(req.params.id).populate("subs").exec(function(err, foundProject){
		if(err){
			console.log(err);
		}else{
			console.log(req.params.id)
			res.render("allsub",{project:foundProject});
		}
	})
	
})


app.post("/:id/submit",isStudent,function(req,res){
	Project.findById(req.params.id,function(err,project){
		if(err){
			console.log(err);
		}else{
			Submission.create(req.body.submission,function(err,submission){
				if(err){
					console.log(err);
				}else{
					console.log(submission.upvotes);
					submission.upvotes = 1;
					console.log(submission.upvotes);
					submission.save();
					project.subs.push(submission);
					project.save();
					res.redirect("/dashboard");
				}
			})
		}
	})
})

app.get("/upvote/:id",isAdmin,function(req,res){
	Submission.findById(req.params.id,function(err,foundSubmission){
		if(err){
			console.log(err);
		}else{
			console.log(foundSubmission);
			foundSubmission.upvotes = foundSubmission.upvotes + 1;
			foundSubmission.save();
			res.redirect("/dashboard");
			// res.redirect("/dashboard/"+foundSubmission._id+"/project_subs");
		}
	})
})

app.get("/approve/:proj_id/:sub_id",isAdmin,function(req,res){
	Submission.findById(req.params.sub_id,function(err,foundSubmission){
		if(err){
			console.log(err);
		}else{
			Project.findById(req.params.proj_id,function(err,foundProject){
				if(err){
					console.log(err);
				}else{
					foundProject.final_sub = foundSubmission;
					foundProject.idea_found = true;
					foundProject.save();
				}
			})
			res.redirect("/dashboard");
		}
	})
})


////////jobPOst//////////
app.get("/post",function(req,res){
	res.render("post");
});

app.post("/post",function(req,res){
	Job.create(new Job({vacancy:req.body.vacany,title:req.body.title,location:req.body.location,item:req.body.item,details:req.body.details,money:req.body.money}),function(err,job){
		if(err){
			console.log(err);
			return res.render("register");
		}
		res.redirect("/jobpost");
	})
});

app.get("/jobpost",isCreator,function(req,res){
	// console.log(req.user);
	//retrieve data from the database
	Job.find({},function(err,alljobs){
		if(err){
			console.log(err);
		}
		else{
			res.render("jobpost",{jobs:alljobs,currentUser:req.user})
		}
	})
});

app.get("/apply/:id",isCreator,function(req,res){
	//find the job by using findbyid
	
	
	// Job.findById(req.params.id,function(err,job){
	// 	if(err){
	// 		console.log(err);
	// 	}else{
	// 		var currjob = {
	// 			title:job.title,
	// 			item:job.item
	// 		}
	// 		req.user.jobs.push(currjob);
	// 		req.user.save();
			
	// 		res.send("You have applied for this job!!")
	// 	}
	// })	
	//add it to the current user schema
	res.send("You have applied for this job!!")
})


////////////////////////////////

app.get("/dashboard/:id/final",function(req,res){
	Project.findById(req.params.id,function(err,foundProject){
		if(err){
			console.log(err);
		}else{
			console.log(foundProject.final_sub);
			Submission.findById(foundProject.final_sub,function(err,foundSubmission){
				if(err){
					console.log(err);
				}
				else{
					res.render("finalsub",{submission:foundSubmission});
				}
			})
			
		}
	})
})

//////////////faq//////////////////
app.get("/comment/:id/new",function(req,res){
	Project.findById(req.params.id,function(err,project){
		if(err){
			console.log(err)
		}else{
			res.render("comment",{project:project});
		}
	})
})
app.post("/dashboard/:id/comments",function(req,res){
	Project.findById(req.params.id,function(err,project){
		if(err){
			console.log(err);
		}
		else{
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					console.log(err);
				}
				else{
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					project.comments.push(comment);
					project.save();
					res.redirect("/dashboard/"+project.id)
				}
		})
	}
})
})

//////////////////////\


//////////////////middkeware/////////
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/register");
}
function isCreator(req,res,next){
	if(req.isAuthenticated()){
		if(req.user.role  == "Creator"){
			return next();
		}
	}
	res.redirect("/register");
}

function isAdmin(req,res,next){
	if(req.isAuthenticated()){
		if(req.user.role == "Admin"){
			return next();
		}
	}
	res.redirect("/register");
}
function isStudent(req,res,next){
	if(req.isAuthenticated()){
		if(req.user.role == "I am a student"){
			return next();
		}
	}
	res.redirect("/register");
}

///////////////////////////////

// app.listen(process.env.PORT || 3000,process.env.IP,function(){
// 	console.log("Server has started..");
//  });

http.listen(3000, () => {
  console.log('listening on *:3000');
});