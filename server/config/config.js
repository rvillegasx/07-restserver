//===============
//Puerto
//===============
process.env.PORT = process.env.PORT || 3000;


//===============
//Entorno
//===============

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

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



