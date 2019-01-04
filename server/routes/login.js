const express = require('express');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req,res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !usuarioDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if ( !bcrypt.compareSync(body.password, usuarioDB.password) ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); //variable en config.js

        res.json({
            ok: true,
            usuario: usuarioDB,
            token: token
        });

    });
});

//Configuraciones de Google
async function verify( token ) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
//   console.log(payload.name);
//   console.log(payload.email);
//   console.log(payload.picture);
  return {
      nombre: payload.name,
      email: payload.email,
      img: payload.picture,
      google: true
  }
}

app.post('/google', async (req,res) => {
    let token = req.body.idtoken; //recibimos el token

    let googleUser = await verify(token)  //verificamos el token
                        .catch(e => {
                            return res.status(403).json({
                                ok: false,
                                err: e
                            });
                        });

    // res.json({
    //     usuario: googleUser
    // });
    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => { //checamos si ya existe un usuario con ese correo
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if(usuarioDB) {
            if(usuarioDB.google === false) { //si el usuario existe en la BD, pero no es de tipo google
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else { // si el usuario existe y si es de tipo google
                let token = jwt.sign({ //se renueva el token
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); //variable en config.js
                return res.json({ //se regresa el token renovado
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            //Si el usuario no existe en nuestra base de datos y es de tipo google
            let usuario = new Usuario(); //creo un nuevo objeto usuario
            usuario.nombre = googleUser.nombre; //le asigno las propiedades
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; //el password no se usa, se asigna uno por default

            usuario.save((err, usuarioDB) => { //salvo el usuario en la BD
                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };
                let token = jwt.sign({ //se crea el token
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); //variable en config.js
                return res.json({ //se regresa el token creado
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }

    });
});


module.exports = app;