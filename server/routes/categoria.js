const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

//===============================
// Mostrar todas las categorias
//===============================

app.get('/categoria', verificaToken, (req,res) => {
    Categoria.find({})
                .sort('descripcion')
                .populate('usuario', 'nombre')  //revisa id's y carga informacion de otras colecciones
                .exec((err,categorias) => {
                    if( err ) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }
                    res.json({
                        ok: true,
                        categorias
                    });
                });
});

//===============================
// Mostrar una categoria por ID
//===============================

app.get('/categoria/:id', verificaToken, (req,res) => {
    //Categoria.findById();
    let id = req.params.id;

    Categoria.findById(id)
                .exec((err,categoriaDB) => {
                    if( err ) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    }
                    if( !categoriaDB ) {
                        return res.status(400).json({
                            ok: false,
                            err: {
                                message: 'El ID no fue encontrado'
                            }
                        });
                    }
                    res.json({
                        ok: true,
                        categoria: categoriaDB
                    });
                });

});

//===============================
// Crear nueva categoria
//===============================

app.post('/categoria', verificaToken, (req,res) => {
    //regresa la nueva categoria
    //req.usuario._id
    let body = req.body; //req.usuario._id
    // console.log(body);
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    categoria.save((err, categoriaDB) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if( !categoriaDB ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok:true,
            categoria: categoriaDB
        });
    });
});

//================================
// Actualizar una categoria por ID
//================================

app.put('/categoria/:id', (req,res) => {
    //actualiza
    let id = req.params.id;
    let cambiaDescripcion = {
        descripcion: req.body.descripcion
    };

    Categoria.findByIdAndUpdate(id, cambiaDescripcion, {new: true, runValidators: true}, (err, categoriaDB) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if( !categoriaDB ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    });


});

//===============================
// Borrar una categoria por ID
//===============================

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req,res) => {
    //borra una categoria, solo un administrador lo podra hacer
    //Categoria.findByIdAndRemove
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if ( !categoriaBorrada ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }
        res.json({
            ok: true,
            categoria: categoriaBorrada
        });
    });
});

module.exports = app;