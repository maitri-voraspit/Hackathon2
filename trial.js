var express = require("express");
var app = express();
const axios = require('axios');


axios.get("https://rawg-video-games-database.p.rapidapi.com/games/"grand (query)"?rapidapi-key=397a6b412amsh1f555687ce1bac4p1d9e21jsne1dc8f5d1d65")
  .then(function (response) {
		var data=response.data;
      // res.render("results", {data:data});
	console.log(data);
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function () {

  });


var bodyParser = require("body-parser");// we need a body parser to parse the information sent by the form or any other imput mechanism

app.use(bodyParser.urlencoded({extended: true}));

//kya
//meet chat




 app.listen(process.env.PORT || 3000,process.env.IP,function(){ 	console.log("Server has started..");
});

