var express = require("express");
var Imagen = require("./models/imagenes");
var router = express.Router();
var fs = require("fs");
var redis = require("redis");

var client = redis.createClient();
var image_finder_middleware = require("./middlewares/find_image");

/*C:\>npm config get prefix
C:\Users\username\AppData\Roaming\npm

C:\>set PATH=%PATH%;C:\Windows\System32;
*/

/* app.com/app */
router.get("/", function(req,res){
	Imagen.find({})
		.populate("creator")
		.exec(function(err,imagenes){
			if(err) console.log(err);
			res.render("app/home",{imagenes: imagenes});
		});	
});

/* REST */

router.get("/imagenes/new",function(req,res){
	res.render("app/imagenes/new");
});

router.all("/imagenes/:id*",image_finder_middleware);

router.get("/imagenes/:id/edit",function(req,res){
	res.render("app/imagenes/edit");
	/*Imagen.findById(req.params.id, function(err, imagen){
					res.render("app/imagenes/edit",{imagen : imagen})
				});*/
});

router.route("/imagenes/:id")
	.get(function(req,res){
		client.publish("images",res.locals.imagen.toString());
		res.render("app/imagenes/show");
		/*Imagen.findById(req.params.id, function(err, imagen){
					res.render("app/imagenes/show",{imagen : imagen})
				});*/
	})
	.put(function(req,res){
			res.locals.imagen.title = req.fields.title;
			res.locals.imagen.save(function(err){
						if(!err){
							res.render("app/imagenes/show");
						}else{
							res.render("app/imagenes/"+req.params.id+"/edit");
						}
					})
			//res.render("app/imagenes/show",{imagen : imagen});
		/*Imagen.findById(req.params.id, function(err, imagen){
					imagen.title = req.body.title;
					imagen.save(function(errito){
						if(!err){
							res.render("app/imagenes/show",{imagen:imagen})
						}else{
							res.render("app/imagenes/edit",{imagen:imagen})

						}
					})
					res.render("app/imagenes/show",{imagen : imagen})
			});*/
	})
	.delete(function(req,res){
			Imagen.findOneAndRemove({_id: req.params.id}, function(err){
				if(!err){
					res.redirect("/app/imagenes");
				}
				else{
					console.log(err);
					res.redirect("/app/imagenes/"+req.params.id);
				}
			});
	});

router.route("/imagenes")
	.get(function(req,res){
		Imagen.find({creator: res.locals.user},function(err,imagenes){
			if(err){res.redirect("/app");return;}
			res.render("app/imagenes/index",{imagenes: imagenes});
		});
	})
	.post(function(req,res){
		//pop me devuelve el ultimo de un arreglo
		var extension = req.files.archivo.name.split(".").pop();
		var data = {
			title: req.fields.title,
			creator: res.locals.user._id,
			extension: extension
		}

		var imagen = new Imagen(data);

		imagen.save(function(err){
			if(!err){

				var imgJSON = {
					"id": imagen._id,
					"title": imagen.title,
					"extension": imagen.extension
				}
				client.publish("images",JSON.stringify(imgJSON));	
				//client.publish("images",imagen.toString());
				fs.rename(req.files.archivo.path, "public/images/"+imagen._id+"."+extension);
				res.redirect("/app/imagenes/"+imagen._id);
			}else{
				console.log(imagen);
				res.render(err);
			}
		});
	});


module.exports = router;
