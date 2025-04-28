const express = require('express');
const mysql = require('../ongmanager_project/bd/conexao');
const app = express();
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'bd/uploads/' });
const bcrypt = require("bcrypt");

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

// Controle de Sessão
const session = require("express-session");

app.use(session({
    secret: "4A2RwZqnTY3AAH1s5OqfOvLdx0aY2L", // 🔹 Chave secreta para criptografar a sessão
    resave: false, // 🔹 Evita salvar a sessão se não for modificada
    saveUninitialized: false, // 🔹 Não cria sessões para usuários que não estão logados
    cookie: { secure: false, httpOnly: true } // 🔹 Configuração básica de cookies
}));

app.post("/login", async (req, res) => {
    const { email_user, password_user } = req.body;

    const query = "SELECT id_user, name_user FROM tb_usuarios WHERE email_user = ?";
    mysql.query(query, [email_user], async (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao acessar o banco de dados" });

        if (results.length === 0) {
            return res.status(401).json({ error: "Usuário ou senha incorretos!" });
        }

        req.session.userId = results[0].id_user;  
        req.session.userName = results[0].name_user; // 🔹 Agora salva o nome do usuário na sessão

        res.json({ success: true, message: "Login bem-sucedido!" });
    });
});

// Verificação de Sessão
const verificarAutenticacao = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/"); // 🔹 Se não estiver logado, redireciona para o login
    }
    next(); // 🔹 Caso contrário, permite o acesso
};

// Rota para Deslogar
app.get("/logout", (req, res) => {
    console.log("Rota de logout acessada!"); // 🔹 Para verificar no console do servidor

    req.session.destroy((err) => {
        if (err) {
            console.error("Erro ao destruir sessão:", err);
            return res.status(500).json({ error: "Erro ao sair do sistema." });
        }
        res.redirect("/"); // 🔹 Redireciona para a tela de login
    });
});

const usuarios = require('./Routers/usuarios');
app.use('/', usuarios);

const voluntarios = require('./Routers/voluntarios');
app.use('/', voluntarios);

const projetos = require('./Routers/projetos');
app.use('/', projetos);

const doacoes = require('./Routers/doacoes');
app.use('/', doacoes);


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

app.get("/user-info", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Usuário não autenticado." });
    }
    
    res.json({ name: req.session.userName });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "view", "login.html"));
});

app.get("/usuarios", verificarAutenticacao, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "view", "usuarios.html"));
});

app.get("/voluntarios", verificarAutenticacao, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "view", "voluntarios.html"));
});

app.get("/projetos", verificarAutenticacao, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "view", "projetos.html"));
});

app.get("/doacoes", verificarAutenticacao, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "view", "doacoes.html"));
});

app.get("/agenda", verificarAutenticacao, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "view", "agenda.html"));
});

app.get("/dashboard", verificarAutenticacao, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "view", "dashboard.html"));
});

// Rodar servidor
app.listen(8000, () => {
    console.log("Servidor rodando http://localhost:8000/");
});