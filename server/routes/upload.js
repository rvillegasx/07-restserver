const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs= require('fs');  //para manipular el filesystem
const path = require('path') //para poder acceder a otra ruta

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (Object.keys(req.files).length == 0) {
        return res.status(400)
                    .json({
                        ok: false,
                        err: {
                            message: 'No se subio ningun archivo'
                        }
                    });
    }

    //Validar tipo
    let tiposValidos = ['productos','usuarios'];
    if ( tiposValidos.indexOf(tipo) < 0 ) {
        return res.status(400).json({
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', ')
            }
        });
    }

    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    let dataFile = req.files.archivo;
    let nombreSeparado = dataFile.name.split('.');
    let extension = nombreSeparado[nombreSeparado.length - 1];
//    console.log(extension);

    if ( extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }
    //cambiar nombre al archivo
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    // Use the mv() method to place the file somewhere on your server
    dataFile.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });
        // Aqui se que la imagen se cargo al filesystem
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

        // res.json({
        //     ok: true,
        //     message: 'Archivo subido con exito'
        // });
    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        };

        // let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${ usuarioDB.img }`);
        // if ( fs.existsSync(pathImagen) ) {
        //     fs.unlinkSync(pathImagen);
        // }

        //borra archivo previo si existe
        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });

    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        };

        //borra archivo previo si existe
        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });

    });
}

function borraArchivo(nombreImagen, folder) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${ folder }/${ nombreImagen }`);
    if ( fs.existsSync(pathImagen) ) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;