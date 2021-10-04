const express =  require('express')
const {dbConnection} = 
require('./database/config')

const cors= require('cors')

require('dotenv').config()

const app = express()

dbConnection()

app.use(cors())

app.use(express.static('public'));
//lectura y parseo
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/Historia', require('./routes/Historia'));
app.use('/Cita', require('./routes/Cita'));
app.use('/Vacuna', require('./routes/Vacuna'));
app.use('/CitaVacuna', require('./routes/CitaVacuna'));
app.use('/HistClinica', require('./routes/HistClinica'));
app.use('/ExamenFisico', require('./routes/ExamenFisico'));
app.use('/AntecedenteNatal', require('./routes/AntecedenteNatal'));
app.use('/AntecedentePatologico', require('./routes/AntecedentePatologico'));
//Rutas

//listen

//Escuchar peticiones
app.listen(process.env.PORT, () => {
	console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});

