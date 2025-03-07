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


// CADASTRAR PROJETOS
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


// EXCLUIR PROJETOS

router.delete("/api/projetos/:id", function (request, response, next) {
    const { id } = request.params;

    // Validação do ID
    if (!id || isNaN(id)) {
        return response.status(400).send("ID inválido.");
    }

    const query = `DELETE FROM tb_projetos WHERE id_projeto = ?`;

    mysql.query(query, [id], function (error, data) {
        if (error) {
            next(error);

        } else if (data.affectedRows === 0) {
            response.status(404).send("Projeto não encontrado.");
        } else {
            response.send("Projeto excluído com sucesso!");
        }
    });
});


// EDITAR PROJETOS
router.put("/api/projetos/:id", async function(request, response, next) {
    try {
        const { id } = request.params;
        const { name_projeto, descricao, data_projeto, status_projeto } = request.body;

        // Validação do ID
        if (!id || isNaN(id)) {
            return response.status(400).json({ message: "ID inválido." });
        }

        // Verificar se ao menos um campo foi enviado para atualização
        if (!name_projeto && !descricao && !data_projeto && !status_projeto) {
            return response.status(400).json({ message: "Nenhum campo foi fornecido para atualização." });
        }

        // Criar a query dinamicamente com os campos preenchidos
        let query = "UPDATE tb_projetos SET ";
        let fields = [];
        let values = [];

        if (name_projeto) {
            fields.push("name_projeto = ?");
            values.push(name_projeto);
        }
        if (descricao) {
            fields.push("descricao = ?");
            values.push(descricao);
        }
        if (data_projeto) {
            fields.push("data_projeto = ?");
            values.push(data_projeto);
        }
        if (status_projeto) {
            fields.push("status_projeto = ?");
            values.push(status_projeto);
        }

        query += fields.join(", ") + " WHERE id_projeto = ?";
        values.push(id);

        // Executar a query
        mysql.query(query, values, function(error, data) {
            if (error) {
                console.error("Erro ao atualizar o projeto:", error);
                return next(error);
            }

            if (data.affectedRows === 0) {
                return response.status(404).json({ message: "Projeto não encontrado." });
            }

            response.json({ message: "Projeto atualizado com sucesso!" });
        });

    } catch (error) {
        console.error("Erro inesperado:", error);
        next(error);
    }
});



module.exports = router;