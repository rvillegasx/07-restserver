//===============
//Puerto
//===============
process.env.PORT = process.env.PORT || 3000;


//===============
//Entorno
//===============

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//===============
//Vencimiento del token
//===============
//60 segundos
//60 minutos
//24 horas
//30 dias
// process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;
process.env.CADUCIDAD_TOKEN = '48h';


//===============
//Seed de autenticacion
//===============
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

//===============
//Base de Datos
//===============
let urlDB;

if (process.env.NODE_ENV === 'dev' ) {
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    // urlDB = 'mongodb://cafe-user:a123456@ds245523.mlab.com:45523/07-cafe';
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//================
//Google Client ID
//================

process.env.CLIENT_ID = process.env.CLIENT_ID || '285302666979-dl8tp2mp4acbob5sa9sqid14t041cipj.apps.googleusercontent.com';