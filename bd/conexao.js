const mysql = require('mysql2');

const env = require('dotenv').config();

// Conexão com o Banco

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});

connection.connect ( function (err) {
    try {
        console.log("Conexão com o Banco efetuada com sucesso!")
    } catch {
        console.error("Erro: Conexão com o Banco recusada: ", error)
    }
});


 /* Testando a consulta com o banco

connection.query("SELECT * FROM tb_usuarios", function (error, rows, fields) {
    if (!error) {
        console.log("Resultado: ", rows);
    } else {
        console.log("Consulta não realizada", error)
    }

}); 

*/

module.exports = connection;