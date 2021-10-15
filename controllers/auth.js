const { response } = require('express');
/*Importando modelo */
const Usuario = require('../models/Usuario');
const Historia = require('../models/Historia');
/*bcryptjs*/
const bcrypt = require('bcryptjs');
/**JWT */
const { generarJWT } = require('../helpers/jwt');

const { validarDNI } = require('../functions/validaciones.js');

const { validarNombre } = require('../functions/validaciones.js');

const { validarRol } = require('../functions/validaciones.js');

const multer = require('multer');

const crearUsuario = async (req, res = response) => {
	const { nombre, dni, email, password, rol, telefono, foto_perfil } =
		req.body;
	try {
		let usuario = await Usuario.findOne({ dni });
		if (usuario) {
			return res.status(400).json({
				ok: false,
				msg: 'Ya existe un usuario con este DNI',
			});
		}

		// let historia= await Historia.findOne({dni_paciente})
		// console.log(historia)
		// if(historia !=null && rol=='Apoderado'){
		// 	return res.status(400).json({
		// 		ok: false,
		// 		msg: 'ERROR, La historia ya existe por lo tanto no puede registra',
		// });
		// if(historia.dni_paciente===dni_paciente){
		// 	return console.log('creado');
		// }
		// else{
		// 	console.log(historia)
		// }
		// }

		const ROLvalido = await validarRol(rol);
		if (!ROLvalido) {
			return res.status(400).json({
				ok: false,
				msg: 'ROL incorrecto',
			});
		}

		const DNIvalido = await validarDNI(dni);
		if (!DNIvalido) {
			return res.status(400).json({
				ok: false,
				msg: 'DNI incorrecto',
			});
		}
		const NOMBREvalido = await validarNombre(nombre);
		if (!NOMBREvalido) {
			return res.status(400).json({
				ok: false,
				msg: 'Nombre incorrecto',
			});
		}
		let usuario_email = await Usuario.findOne({ email });
		if (usuario_email) {
			return res.status(400).json({
				ok: false,
				msg: 'Ya existe un usuario con este correo',
			});
		}
		usuario = new Usuario(req.body);
		//Encriptar contraseña
		const salt = bcrypt.genSaltSync();
		usuario.password = bcrypt.hashSync(password, salt);

		// const dni_historia = await Historia.findOne({dni_paciente:dni_paciente})
		// console.log(dni_historia)
		// if(usuario.rol === "Apoderado"){
		// 	let usuario = new Usuario({
		// 		dni_paciente: dni_historia
		// 	});
		// 	console.log(usuario)
		// 	// await historia.save();
		// 	await usuario.save();
		// }
		// else{
		// 	// await usuario.save();
		// }
		// const fotoPefil= await Usuario.find(res.)
		// res.render({
		// 	usuario
		// })

		// usuario.foto_perfil='/uploads'
		// Usuario.foto_perfil = `/api/auth/uploads/${filename};


		// if(req.file){
		// 	const {filename} = req.file
		// 	usuario.setFotoPerfil(filename)
		// }
		// console.log(req.file)
		await usuario.save();

		//Generar JWT
		const token = await generarJWT(usuario.id, usuario.nombre);

		res.status(201).json({
			ok: true,
			uid: usuario.id,
			nombre: usuario.nombre,
			rol: usuario.rol,
			token,
		});
	} catch (error) {
		console.log('Error: ' + error.toString());
		res.status(500).json({
			ok: false,
			msg: 'Por favor hable con el administrador',
		});
	}
};

const loginUsuario = async (req, res = response) => {
	const { dni, password } = req.body;
	try {
		let usuario = await Usuario.findOne({ dni });
		console.log(usuario);
		if (!usuario) {
			return res.status(200).json({
				ok: false,
				msg: 'El usuario no existe con ese DNI',
			});
		}
		const validPassword = bcrypt.compareSync(
			password,
			usuario.password
		);

		if (!validPassword) {
			return res.status(200).json({
				ok: false,
				msg: 'Password incorrecto',
			});
		}

		const token = await generarJWT(usuario.id, usuario.nombre);
		res.status(201).json({
			ok: true,
			uid: usuario.id,
			name: usuario.name,
			rol: usuario.rol,

			token,
		});
	} catch (error) {
		console.log('Error: ' + error.toString());
		res.status(500).json({
			ok: false,
			msg: 'Por favor hable con el administrador',
		});
	}
};
const revalidarToken = async (req, res = response) => {
	/*Recibe req.uid y req.name del middleware*/
	const uid = req.uid;
	const name = req.name;
	/*Generar JWT*/
	const token = await generarJWT(uid, name);
	res.json({
		ok: true,
		uid,
		name,
		token,
	});
};

const EliminarUsuario = async (req, res = response) => {
	const usuarioId = req.params.id;
	const usuario = await Usuario.findByIdAndDelete(usuarioId);
	if (usuario) {
		console.log(usuario);
		return res.json({
			ok: true,
			msg: 'Usuario eliminado',
		});
	}
};

// const MostrarUsuario = async (req, res) => {
// 	const usuario = await Usuario.find();
// 	return res.json(usuario);
// };

const MostrarResponsable = async (req, res) => {
	const responsable = await Usuario.find({ rol: 'Apoderado' });
	if (responsable) {
		return res.json(responsable);
	}
};

// const CambiarFotoPerfil= async (req, res) =>{
// 	const storage = multer.diskStorage({
// 		destination: 'uploads/',
// 		filename: function (req, file, cb) {
// 			console.log(file)
// 			cb('',Date.now()+ '-' + file.originalname);
// 			// + mimeTypes.extension(file.mimetype)
// 		},
// 	});

// 	const upload = multer({
// 		storage: storage,
// 	});

// 	upload.single('avatar'), (req, res) => {
// 		console.log(req)
// 		res.send('todo bien');
// 	}

// }

const subirFotoPerfil = async (req, res) => {
	console.log(req.headers.id);
	const usuarioId=req.headers.id;
	const usuario = await Usuario.findById(usuarioId);
	if (usuario) {
		console.log("--------")
		console.log(usuario);
		const {filename} = req.file
		console.log(filename)
		// const fotoPerfil = `http://localhost:5000/api/auth/uploads/${filename}`
		const nuevoUsuario= {
			...req.body,
			foto_perfil: filename
		};

		const usuarioActualizado = await Usuario.findByIdAndUpdate(
			usuarioId,
			nuevoUsuario,
			{
				new: true,
			}
		);
		console.log("*********")
		console.log(usuarioActualizado)
		return res.json({
			ok: true,
			usuario:usuarioActualizado
		});
	}
	// const {filename} = req.file
	// console.log(filename)
	// const usuario = await Usuario.find(req.headers.id);
	// if (usuario) {
	// 	// return res.json(usuario);
	// 	console.log(usuario)
	// }

	// if(req.file){
	// 	const {filename} = req.file
	// 	usuario.setFotoPerfil(filename)
	// }

	// return res.json({
	// 	ok:true,
	// 	id: req.headers.id,
	
	// });
	// res.send('todo bien');
};

module.exports = {
	crearUsuario,
	loginUsuario,
	revalidarToken,
	EliminarUsuario,
	MostrarResponsable,
	subirFotoPerfil
	// CambiarFotoPerfil
};
