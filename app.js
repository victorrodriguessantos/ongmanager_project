const express = require('express');
const mysql = require('../ongmanager_project/bd/conexao');
const app = express();
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'bd/uploads/' });


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/bd/uploads', express.static(path.join(__dirname, 'bd/uploads')));

// Configuração do CORS para qualquer origem
app.use(cors({
    origin: '*', // Permite qualquer origem
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
    exposedHeaders: ['Content-Disposition'], // Permite que o cliente veja o cabeçalho Content-Disposition
}));

const usuarios = require('./Routers/usuarios');
app.use('/', usuarios);

const voluntarios = require('./Routers/voluntarios');
app.use('/', voluntarios);

const projetos = require('./Routers/projetos');
app.use('/', projetos);


// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro detectado no servidor:', err);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
});

// Suas rotas

app.post('/upload', upload.single('curriculo_voluntario'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }

    const filePath = `bd/uploads/${req.file.filename}`;
    console.log(`Arquivo salvo em: ${filePath}`);
    res.json({ filePath }); // Retorna o caminho do arquivo
});



app.get('/api/usuarios', (req, res) => {
    res.json({ message: 'Dados dos usuários' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view', 'login.html'));
});

app.get('/usuarios', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view', 'usuarios.html'));
});

app.get('/voluntarios', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view', 'voluntarios.html'));
});

app.get('/projetos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'view', 'projetos.html'));
});


// Rodar servidor
app.listen(8000, () => {
    console.log("Servidor rodando http://localhost:8000/");
});