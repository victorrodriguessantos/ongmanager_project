const express = require('express');
const mysql = require('../ongmanager_project/bd/conexao');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
// Configuração do CORS para qualquer origem
app.use(cors({
    origin: '*', // Permite qualquer origem
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
}));

const usuarios = require('./Routers/usuarios');
app.use('/', usuarios);



// Suas rotas
app.get('/usuarios', (req, res) => {
    res.json({ message: 'Dados dos usuários' });
});

// Rodar servidor
app.listen(8000, () => {
    console.log("Servidor rodando http://localhost:8000");
});