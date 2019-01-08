
const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express(); //inicializar variable de express

let Producto = require('../models/producto');

//=====================================
// Obtener todos los productos
//=====================================
app.get('/producto', verificaToken, (req,res) => {
    //trae todos los productos
    // populate: usuario categoria
    //paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    Producto.find({disponible:true})
                .skip(desde)
                .limit(limite)  
                .sort('nombre')
                .populate('usuario', 'nombre')  //revisa id's y carga informacion de otras colecciones
                .populate('categoria', 'descripcion')  //revisa id's y carga informacion de otras colecciones
                .exec((err,productos) => {
                    if( err ) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    }
                    res.json({
                        ok: true,
                        productos: productos
                    });
                });

});

//=====================================
// Buscar productos
//=====================================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({nombre: regex})
            .populate('usuario', 'nombre')
            .populate('categoria', 'descripcion')
            .exec((err, productosQuery) => {
                if( err ) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                res.json({
                    ok:true,
                    productos: productosQuery
                });
            });
});

//=====================================
// Obtener un productos por ID
//=====================================
app.get('/producto/:id', verificaToken, (req,res) => {
    // populate: usuario categoria
    let id = req.params.id;
    Producto.findById(id)
                .populate('usuario', 'nombre')  //revisa id's y carga informacion de otras colecciones
                .populate('categoria', 'descripcion')  //revisa id's y carga informacion de otras colecciones
                .exec((err,productoDB) => {
                    if( err ) {
                        return res.status(500).json({
                            ok: false,
                            err
                        });
                    }
                    if(!productoDB) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }
                    res.json({
                        ok: true,
                        producto: productoDB
                    });
                });
});

//=====================================
// Crear un nuevo producto
//=====================================
app.post('/producto', verificaToken, (req,res) => {
    // grabar el usuario
    // grabar una categoria del listado
    // en el verificaToken estamos mandando los datos del usuario que se logueo y solicito el token

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if( !productoDB ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok:true,
            producto: productoDB
        });
    });
});

//=====================================
// Actualizar un producto
//=====================================
app.put('/producto/:id', verificaToken, (req,res) => {
    // grabar el usuario
    // grabar una categoria del listado
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }
        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {
            if( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productoGuardado
            })
        });
    });
});

//=====================================
// Borrar un producto
//=====================================
app.delete('/producto/:id', verificaToken, (req,res) => {
    // disponible pasa a falso
    let id = req.params.id;
    Producto.findById(id, (err, productoDB) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if( !productoDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        }

        productoDB.disponible = false;
        productoDB.save((err, productoBorrado) => {
            if( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'Producto borrado'
            })
        });
    });


});

module.exports = app;