const mysql = require('mysql2');

// Conexão com o Banco

const connection = mysql.createConnection({
    host: "127.0.0.1",
    user:"root",
    password: "",
    database: "dbongmanager"
});

connection.connect ( function (err) {
    try {
        console.log("Conexão com o Banco efetuada com sucesso!")
    } catch {
        console.error("Erro: Conexão com o Banco recusada: ", error)
    }
});

 // Testando a consulta com o banco

connection.query("SELECT * FROM tb_usuarios", function (error, rows, fields) {
    if (!error) {
        console.log("Resultado: ", rows);
    } else {
        console.log("Consulta não realizada", error)
    }

});