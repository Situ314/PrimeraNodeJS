var Imagen = require("../models/imagenes");
var owner_check = require("./imagen_permission")

module.exports = function(req,res,next){
	Imagen.findById(req.params.id)
					.populate("creator")
					.exec(function(err,imagen){
		if(imagen != null && owner_check(imagen,req,res)){
			console.log("ENCONTRE IMAGEN "+imagen.title+" de "+imagen.creator);
			res.locals.imagen = imagen;
			next();
		}
		else{
			res.redirect("/app");
		}
	});
}