const express = require('express');

const mysql = require('../bd/conexao');

const router = express.Router();

// Duas bibliotecas para segurança nas Rotas
const Joi = require('joi');
const bcrypt = require('bcrypt');

// Biblioteca Multer para subir arquivos
const multer = require("multer");
const path = require("path");



// CADASTRAR USUARIOS

// Configuração do multer para armazenar os arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "bd/uploads/"); // Pasta onde os arquivos serão salvos
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)); // Nome único para o arquivo
    }
});

// Filtro para aceitar apenas arquivos PDF ou Word
const fileFilter = (req, file, cb) => {
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error("Formato de arquivo não suportado. Envie um PDF, DOC ou DOCX."));
    }
    cb(null, true);
};

// Inicializando o multer
const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post("/voluntarios", upload.single("curriculo_voluntario"), async function (request, response, next) {
    try {
        // Capturar os dados do corpo da requisição
        const {
            name_voluntario,
            cpf_voluntario,
            email_voluntario,
            phone_voluntario,
            endereco_voluntario,
            observacao_voluntario,
            data_nascimento,
            preferencia_profissional
        } = request.body;

        // Verificar se os campos obrigatórios estão presentes
        if (!name_voluntario || !cpf_voluntario || !email_voluntario || !phone_voluntario || !endereco_voluntario) {
            return response.status(400).json({ message: "Os campos obrigatórios precisam ser preenchidos." });
        }

        // Caminho do arquivo enviado
        const curriculo_voluntario = request.file ? request.file.path : null;

        // Consulta SQL para inserir os dados
        const query = `
            INSERT INTO tb_voluntarios 
            (name_voluntario, cpf_voluntario, email_voluntario, phone_voluntario, endereco_voluntario, 
            observacao_voluntario, data_nascimento, preferencia_profissional, curriculo_voluntario) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Executar a consulta no banco de dados
        mysql.query(
            query,
            [
                name_voluntario,
                cpf_voluntario,
                email_voluntario,
                phone_voluntario,
                endereco_voluntario,
                observacao_voluntario || null,
                data_nascimento || null,
                preferencia_profissional || null,
                curriculo_voluntario
            ],
            function (error, data) {
                if (error) {
                    console.error('Erro ao inserir voluntário:', error);
                    return next(error);
                }

                response.status(201).json({
                    message: "Voluntário cadastrado com sucesso!",
                    voluntarioId: data.insertId
                });
            }
        );
    } catch (error) {
        console.error('Erro inesperado:', error);
        next(error);
    }
});



module.exports = router;