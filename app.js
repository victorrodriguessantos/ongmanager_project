const express = require('express');

const mysql = require('../ongmanager_project/bd/conexao')

const app = express();

app.listen(3000, () => {
    console.log("Servidor rodando http://localhost:3000");
});