const express = require('express');

const mysql = require('../ongmanager_project/bd/conexao')

const app = express();

const usuarios = require('./Routers/usuarios');
app.use('/', usuarios);









// Rodar servidor
app.listen(8080, () => {
    console.log("Servidor rodando http://localhost:8080");
});

