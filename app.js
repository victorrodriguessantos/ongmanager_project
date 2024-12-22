const express = require('express');
const mysql = require('../ongmanager_project/bd/conexao');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const usuarios = require('./Routers/usuarios');
app.use('/', usuarios);


// Rodar servidor
app.listen(8080, () => {
    console.log("Servidor rodando http://localhost:8080");
});