const express = require('express');

const mysql = require('../bd/conexao');
const fs = require('fs');

const router = express.Router();

// Duas bibliotecas para segurança nas Rotas
const Joi = require('joi');
const bcrypt = require('bcrypt');



//  LISTAR PROJETOS
router.get("/api/projetos", async function(request, response, next) {

    var query = "SELECT * FROM tb_projetos";

    mysql.query(query, function(error, data){
        if(error){
            throw error;
        }
        else {
            response.json(data);
        }

    });
});


// CADASTRAR USUARIOS
router.post('/api/projetos', async function(request, response, next) {

    try {
        // Capturar os dados do corpo da requisição
        const {
            name_projeto,
            descricao,
            data_projeto,
            status_projeto,
        } = request.body;
    
        // Verificar se os campos obrigatórios estão presentes
        if (!name_projeto || !descricao) {
            return response.status(400).json({ message: "Os campos obrigatórios precisam ser preenchidos." });
        }
    
        const query = `INSERT INTO tb_projetos (name_projeto, descricao, data_projeto, status_projeto) VALUES (?, ?, ?, ?)`;
    
        mysql.query(
            query,
            [
                name_projeto,
                descricao,
                data_projeto,
                status_projeto
            ],
            function (error, data) {
                if (error) {
                    console.error('Erro ao criar o projeto:', error);
                    return next(error);
                }
    
                response.status(201).json({
                    message: "Projeto criado com sucesso!",
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