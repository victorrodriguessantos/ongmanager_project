const express = require("express");

const mysql = require("../bd/conexao");
const fs = require("fs");

const router = express.Router();

// Duas bibliotecas para segurança nas Rotas
const Joi = require("joi");
const bcrypt = require("bcrypt");

// Biblioteca Multer para subir arquivos
const multer = require("multer");
const path = require("path");

router.use("/uploads", express.static(path.join(__dirname, "../bd/uploads")));

// CADASTRAR VOLUNTARIOS
// Configuração do multer para armazenar os arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "bd/uploads/"); // Pasta onde os arquivos serão salvos
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    ); // Nome único para o arquivo
  },
});

// Filtro para aceitar apenas arquivos PDF ou Word
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error("Formato de arquivo não suportado. Envie um PDF, DOC ou DOCX.")
    );
  }
  cb(null, true);
};

// Inicializando o multer
const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post(
  "/api/voluntarios",
  upload.single("curriculo_voluntario"),
  async function (request, response, next) {
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
        preferencia_profissional,
      } = request.body;

      // Verificar se os campos obrigatórios estão presentes
      if (
        !name_voluntario ||
        !cpf_voluntario ||
        !email_voluntario ||
        !phone_voluntario ||
        !endereco_voluntario
      ) {
        return response
          .status(400)
          .json({
            message: "Os campos obrigatórios precisam ser preenchidos.",
          });
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
          curriculo_voluntario,
        ],
        function (error, data) {
          if (error) {
            console.error("Erro ao inserir voluntário:", error);
            return next(error);
          }

          response.status(201).json({
            message: "Voluntário cadastrado com sucesso!",
            voluntarioId: data.insertId,
          });
        }
      );
    } catch (error) {
      console.error("Erro inesperado:", error);
      next(error);
    }
  }
);

// LISTAR VOLUNTARIOS
router.get("/api/voluntarios", async function (request, response, next) {
  var query = "SELECT * FROM tb_voluntarios";

  mysql.query(query, function (error, data) {
    if (error) {
      throw error;
    } else {
      response.json(data);
    }
  });
});

// LISTAR VOLUNTARIO PELO ID
router.get("/api/voluntarios/:id", async function (request, response, next) {
  const id = request.params.id;

  const query = "SELECT * FROM tb_voluntarios WHERE id_voluntario = ?";

  mysql.query(query, [id], function (error, data) {
    if (error) {
      response.status(500).json({ error: "Erro ao buscar voluntário" });
    } else if (data.length === 0) {
      response.status(404).json({ error: "Voluntário não encontrado" });
    } else {
      response.json(data[0]); // Retorna o primeiro registro
    }
  });
});

// EXCLUIR VOLUNTARIOS
router.delete("/api/voluntarios/:id", function (request, response, next) {
  const { id } = request.params;

  if (!id || isNaN(id)) {
      return response.status(400).send("ID inválido.");
  }

  const getFileQuery = "SELECT curriculo_voluntario FROM tb_voluntarios WHERE id_voluntario = ?";
  mysql.query(getFileQuery, [id], function (error, results) {
      if (error) {
          return next(error);
      } else if (results.length === 0) {
          return response.status(404).send("Voluntário não encontrado.");
      }

      const fileName = results[0].curriculo_voluntario;
      const filePath = fileName ? path.resolve(__dirname, "../", fileName) : null;

      console.log("Caminho do arquivo a ser excluído:", filePath);

      // Exclui voluntário do banco de dados
      const deleteQuery = `DELETE FROM tb_voluntarios WHERE id_voluntario = ?`;
      mysql.query(deleteQuery, [id], function (error, data) {
          if (error) {
              return next(error);
          } else if (data.affectedRows === 0) {
              return response.status(404).send("Voluntário não encontrado.");
          }

          // 🔹 Somente tenta excluir o arquivo se `filePath` não for `null`
          if (filePath) {
              fs.access(filePath, fs.constants.F_OK, (err) => {
                  if (!err) {
                      fs.unlink(filePath, (unlinkErr) => {
                          if (unlinkErr) console.error("Erro ao excluir arquivo:", unlinkErr);
                      });
                  }
              });
          }

          response.send("Voluntário excluído com sucesso!");
      });
  });
});

// EDITAR VOLUNTARIOS
router.put(
  "/api/voluntarios/:id",
  upload.single("curriculo_voluntario"),
  async function (request, response, next) {
    try {
      const voluntarioId = request.params.id;

      // Capturar os dados do corpo da requisição
      const {
        name_voluntario,
        cpf_voluntario,
        email_voluntario,
        phone_voluntario,
        endereco_voluntario,
        observacao_voluntario,
        data_nascimento,
        preferencia_profissional,
      } = request.body;

      // Verificar se o ID do voluntário foi fornecido
      if (!voluntarioId) {
        return response
          .status(400)
          .json({ message: "O ID do voluntário é obrigatório." });
      }

      // Construir dinamicamente a consulta SQL com base nos campos enviados
      let fieldsToUpdate = [];
      let values = [];

      if (name_voluntario) {
        fieldsToUpdate.push("name_voluntario = ?");
        values.push(name_voluntario);
      }
      if (cpf_voluntario) {
        fieldsToUpdate.push("cpf_voluntario = ?");
        values.push(cpf_voluntario);
      }
      if (email_voluntario) {
        fieldsToUpdate.push("email_voluntario = ?");
        values.push(email_voluntario);
      }
      if (phone_voluntario) {
        fieldsToUpdate.push("phone_voluntario = ?");
        values.push(phone_voluntario);
      }
      if (endereco_voluntario) {
        fieldsToUpdate.push("endereco_voluntario = ?");
        values.push(endereco_voluntario);
      }
      if (observacao_voluntario) {
        fieldsToUpdate.push("observacao_voluntario = ?");
        values.push(observacao_voluntario);
      }
      if (data_nascimento) {
        fieldsToUpdate.push("data_nascimento = ?");
        values.push(data_nascimento);
      }
      if (preferencia_profissional) {
        fieldsToUpdate.push("preferencia_profissional = ?");
        values.push(preferencia_profissional);
      }
      if (request.file) {
        fieldsToUpdate.push("curriculo_voluntario = ?");
        values.push(request.file.path);
      }

      // Verificar se há campos para atualizar
      if (fieldsToUpdate.length === 0) {
        return response
          .status(400)
          .json({ message: "Nenhum campo para atualizar foi enviado." });
      }

      // Adicionar o ID do voluntário ao final dos valores
      values.push(voluntarioId);

      // Montar a consulta SQL dinamicamente
      const query = `
            UPDATE tb_voluntarios
            SET ${fieldsToUpdate.join(", ")}
            WHERE id_voluntario = ?
        `;

      // Executar a consulta no banco de dados
      mysql.query(query, values, function (error, data) {
        if (error) {
          console.error("Erro ao atualizar voluntário:", error);
          return next(error);
        }

        if (data.affectedRows === 0) {
          return response
            .status(404)
            .json({ message: "Voluntário não encontrado." });
        }

        response.status(200).json({
          message: "Voluntário atualizado com sucesso!",
        });
      });
    } catch (error) {
      console.error("Erro inesperado:", error);
      next(error);
    }
  }
);

module.exports = router;
