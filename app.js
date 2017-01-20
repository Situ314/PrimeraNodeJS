var express = require("express");
var bodyParser = require("body-parser");
var User = require("./models/user").User;
var session = require("express-session");
var formidable = require("express-formidable");
var RedisStore = require("connect-redis")(session);
var http = require("http");
var realtime = require("./realtime");
//con Cookies
//var cookieSession = require("cookie-session");
var routes_app = require("./routes_app");
var session_middleware = require("./middlewares/session")

var methodOverride = require("method-override");
var app = express();
//Para Socket.io
var server = http.Server(app);

var sessionMiddleware = session({
	store: new RedisStore({}),
	secret: "ajstyles",
	resave: false,
	saveUninitialized: false 
});

realtime(server,sessionMiddleware);
//Collections => tablas
//Documentos => filas

app.set("view engine", "pug");

app.use("/estatico",express.static('public'));
app.use(bodyParser.json()); //para application/json
//app.use(bodyParser.urlencoded({extended: true}));
//SESIONES
/*app.use(session({
	secret: "meliasdsadasdasmeli",
	resave: false,
	saveUninitialized: false 
}));
*/
/* Todas cuando el usuario este logueado
/app */

/* Todas las rutas cuando no este logueado
	/
*/
app.use(methodOverride("_method"));

app.use(sessionMiddleware);
/*
app.use(cookieSession({
	name: "session",
	keys: ["llave-1","llave-2"]
}))*/
app.use(formidable({ keepExtensions: true }));

//Verbos Http => GET / POST

app.get("/", function(req,res){
	//Express: send cierra la aplicacion, no se necesita end
	console.log(req.session.user_id);
	res.render("index");
	});

app.get("/signup", function(req,res){
	User.find(function(err,doc){
		console.log(doc);
		res.render("signup");
	});
	
});

app.get("/login", function(req,res){
	User.find(function(err,doc){
		//console.log(doc);
		res.render("login");
	});
	
});

app.post("/users",function(req,res){

	var user = new User({
					email: req.fields.email, 
					password: req.fields.password,
					username: req.fields.username,
					password_confirmation: req.fields.password_confirmation
					});

	//Guardar a la BD de MongoDB
	user.save(function(err,user,numero){
		if(err){
			console.log(String(err));
		}
		res.send("Recibimos y guardamos Usuario");
	});
});

app.post("/sessions",function(req,res){
/*
	User.find({email: req.body.email, password: req.body.password},function(err,docs){
		console.log(docs);
		res.send("Login try");
	})
*/
	User.findOne({email: req.fields.email, password: req.fields.password},function(err,user)
	{
		console.log(user);		
		req.session.user_id = user._id;
		res.redirect("/app");
		//res.send("Guardada sesión");
	})
});

app.use("/app",session_middleware);
app.use("/app",routes_app);
//App recibe peticines
//app.listen(8080);
//servidor
server.listen(8080);




/*Express HTTP

Socket.io WEBSOCKET

Redis se utilizará como intermediario

*/