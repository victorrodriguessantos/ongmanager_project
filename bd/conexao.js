const mysql = require('mysql2');

const env = require('dotenv').config();

// Conexão com o Banco

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});

connection.connect(function (err) {
    if (err) {
        console.error("Erro: Conexão com o Banco recusada: ", err.message);
    } else {
        console.log("Conexão com o Banco efetuada com sucesso!");
    }
});

module.exports = connection;