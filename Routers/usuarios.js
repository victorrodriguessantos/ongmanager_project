const express = require('express');

const mysql = require('../bd/conexao');

const router = express.Router();

// Duas bibliotecas para segurança nas Rotas
const Joi = require('joi');
const bcrypt = require('bcrypt');



// CADASTRAR USUARIOS

router.post("/usuarios", async function (request, response, next) {
    try {
        // Capturar os dados do corpo da requisição
        const { name_user, email_user, password_user } = request.body;

        // Verificar se todos os campos estão presentes
        if (!name_user || !email_user || !password_user) {
            return response.status(400).json({ message: "Todos os campos são obrigatórios." });
        }

        // Criptografar a senha
        const hashedPassword = await bcrypt.hash(password_user, 10);

        const query = `INSERT INTO tb_usuarios (name_user, email_user, password_user) VALUES (?, ?, ?)`;

        mysql.query(query, [name_user, email_user, hashedPassword], function (error, data) {
            if (error) {
                console.error('Erro ao inserir usuário:', error);
                return next(error);
            }

            response.status(201).json({ message: "Usuário cadastrado com sucesso!", userId: data.insertId });
        });
    } catch (error) {
        console.error('Erro inesperado:', error);
        next(error);
    }
});


// LISTAR USUARIOS

router.get("/usuarios", async function(request, response, next){

	var query = "SELECT * FROM tb_usuarios";

	mysql.query(query, function(error, data){

		if(error)
		{
			throw error; 
		}
		else
		{
			response.json(data);
		}

	});

});

// EDITAR USUARIOS

// Rota para atualizar usuário por ID 
router.put('/usuarios/:id', async function (request, response, next) {
    try {
        const { id } = request.params;

        // Validação dos dados recebidos
        const schema = Joi.object({
            name_user: Joi.string().min(3).max(50),
            email_user: Joi.string().email(),
            password_user: Joi.string().min(4).max(30),
        });

        const { error, value } = schema.validate(request.body);
        if (error) {
            return response.status(400).send(error.details[0].message);
        }

        const { name_user, email_user, password_user } = value;
        let hashedPassword = null;
        if (password_user) {
            hashedPassword = await bcrypt.hash(password_user, 10);
        }

        const updates = [];
        const params = [];

        if (name_user) {
            updates.push('name_user = ?');
            params.push(name_user);
        }
        if (email_user) {
            updates.push('email_user = ?');
            params.push(email_user);
        }
        if (hashedPassword) {
            updates.push('password_user = ?');
            params.push(hashedPassword);
        }
        if (updates.length === 0) {
            return response.status(400).send('Nenhum campo para atualizar.');
        }

        params.push(id);

        const query = `UPDATE tb_usuarios SET ${updates.join(', ')} WHERE id_user = ?`;

        mysql.query(query, params, function (error, data) {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    return response.status(400).send('E-mail já cadastrado.');
                }
                return next(error);
            } else {
                response.send('Usuário atualizado com sucesso!');
            }
        });
    } catch (error) {
        next(error);
    }
});

// EXCLUIR USUARIOS

router.delete("/usuarios/:id", function (request, response, next) {
    const { id } = request.params;

    // Validação do ID
    if (!id || isNaN(id)) {
        return response.status(400).send("ID inválido.");
    }

    const query = `DELETE FROM tb_usuarios WHERE id_user = ?`;

    mysql.query(query, [id], function (error, data) {
        if (error) {
            next(error);

        } else if (data.affectedRows === 0) {
            response.status(404).send("Usuário não encontrado.");
        } else {
            response.send("Usuário excluído com sucesso!");
        }
    });
});

// ROTA DO LOGIN

router.post('/login', (req, res) => {
    const { email_user, password_user } = req.body;

    const query = 'SELECT * FROM tb_usuarios WHERE email_user = ?';

    mysql.query(query, [email_user], async (error, results) => {
        if (error) return res.status(500).json({ error: 'Erro no servidor' });

        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        const user = results[0];

        // Verificar a senha
        const isPasswordValid = await bcrypt.compare(password_user, user.password_user);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        res.json({ message: 'Login bem-sucedido' });
    });
});


module.exports = router;