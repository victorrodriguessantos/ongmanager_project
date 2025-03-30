const express = require('express');

const mysql = require('../bd/conexao');

const router = express.Router();

// LISTAR PROJETOS
router.get("/api/projetos", async function(request, response, next) {
    const query = "SELECT * FROM tb_projetos";
    
    mysql.query(query, function(error, data) {
        if (error) {
            console.error('Erro ao listar projetos:', error);
            return response.status(500).json({ message: "Erro ao buscar projetos." });
        }
        response.json(data);
    });
});

// CADASTRAR PROJETOS
router.post('/api/projetos', async function(request, response, next) {
    try {
        // Capturar os dados do corpo da requisição
        const { name_projeto, descricao, meta_arrecadacao, status_projeto } = request.body;

        // Verificar se os campos obrigatórios estão presentes
        if (!name_projeto || !descricao || !meta_arrecadacao) {
            return response.status(400).json({ message: "Os campos obrigatórios precisam ser preenchidos." });
        }

        const query = `INSERT INTO tb_projetos (name_projeto, descricao, meta_arrecadacao, valor_arrecadado, status_projeto) VALUES (?, ?, ?, 0.00, ?)`;

        mysql.query(
            query,
            [name_projeto, descricao, meta_arrecadacao, status_projeto],
            function (error, data) {
                if (error) {
                    console.error('Erro ao criar o projeto:', error);
                    return next(error);
                }

                response.status(201).json({
                    message: "Projeto criado com sucesso!",
                    projetoId: data.insertId
                });
            }
        );
    } catch (error) {
        console.error('Erro inesperado:', error);
        next(error);
    }
});


// EDITAR PROJETO
router.put('/api/projetos/:id', async function(request, response, next) {
    try {
        const { id } = request.params;
        const { name_projeto, descricao, meta_arrecadacao, status_projeto } = request.body;
        
        if (!name_projeto || !descricao || !meta_arrecadacao) {
            return response.status(400).json({ message: "Os campos obrigatórios precisam ser preenchidos." });
        }

        const query = `UPDATE tb_projetos SET name_projeto = ?, descricao = ?, meta_arrecadacao = ?, status_projeto = ? WHERE id_projeto = ?`;
        
        mysql.query(query, [name_projeto, descricao, meta_arrecadacao, status_projeto, id], function(error, data) {
            if (error) {
                console.error('Erro ao editar projeto:', error);
                return next(error);
            }
            response.json({ message: "Projeto atualizado com sucesso!" });
        });
    } catch (error) {
        console.error('Erro inesperado:', error);
        next(error);
    }
});

// EXCLUIR PROJETO
router.delete('/api/projetos/:id', async function(request, response, next) {
    try {
        const { id } = request.params;
        
        const query = `DELETE FROM tb_projetos WHERE id_projeto = ?`;
        
        mysql.query(query, [id], function(error, data) {
            if (error) {
                console.error('Erro ao excluir projeto:', error);
                return next(error);
            }
            response.json({ message: "Projeto excluído com sucesso!" });
        });
    } catch (error) {
        console.error('Erro inesperado:', error);
        next(error);
    }
});

module.exports = router;
