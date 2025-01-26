const express = require('express');
const mysql = require('../ongmanager_project/bd/conexao');
const app = express();
const cors = require('cors');
const path = require('path');

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

const voluntarios = require('./Routers/voluntarios');
app.use('/', voluntarios);


// Suas rotas
app.get('/api/usuarios', (req, res) => {
    res.json({ message: 'Dados dos usuários' });
});

// Rota para o login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view', 'login.html'));
});

app.get('/usuarios', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view', 'usuarios.html'));
});

app.get('/voluntarios', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view', 'voluntarios.html'));
});



// Rodar servidor
app.listen(8000, () => {
    console.log("Servidor rodando http://localhost:8000/");
});