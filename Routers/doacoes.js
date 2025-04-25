const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const mysql = require("../bd/conexao");

// Configuração de armazenamento para comprovantes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "bd/uploads/comprovantes");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Cadastrar doação
router.post("/api/doacoes", upload.single("comprovante"), (req, res) => {
  const {
    doador,
    data_doacao,
    tipo_doacao,
    valor_doacao,
    id_projeto,
    observacao,
  } = req.body;
  const comprovante = req.file ? req.file.filename : null;

  if (tipo_doacao === "dinheiro" && !id_projeto) {
    return res
      .status(400)
      .json({
        error: "Doações em dinheiro precisam estar vinculadas a um projeto.",
      });
  }

  const query = `
    INSERT INTO tb_doacoes (doador, data_doacao, tipo_doacao, valor_doacao, comprovante, id_projeto, observacao)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  mysql.query(
    query,
    [
      doador,
      data_doacao,
      tipo_doacao,
      valor_doacao || null,
      comprovante,
      id_projeto || null,
      observacao || null,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      // Atualiza valor_arrecadado
      if (tipo_doacao === "dinheiro" && id_projeto) {
        const update = `
          UPDATE tb_projetos SET valor_arrecadado = valor_arrecadado + ?
          WHERE id_projeto = ?
        `;
        mysql.query(update, [valor_doacao, id_projeto], (updateErr) => {
          if (updateErr) return res.status(500).json({ error: updateErr });
          return res
            .status(201)
            .json({
              message: "Doação registrada com sucesso e projeto atualizado.",
            });
        });
      } else {
        return res
          .status(201)
          .json({ message: "Doação registrada com sucesso." });
      }
    }
  );
});

// Listar todas as doações
router.get("/api/doacoes", (req, res) => {
  const query = `
      SELECT d.*, p.name_projeto 
      FROM tb_doacoes d
      LEFT JOIN tb_projetos p ON d.id_projeto = p.id_projeto
  `;

  mysql.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Buscar uma doação por ID
router.get("/api/doacoes/:id", (req, res) => {
  const { id } = req.params;
  mysql.query(
    "SELECT * FROM tb_doacoes WHERE id_doacoes = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0)
        return res.status(404).json({ error: "Doação não encontrada." });
      res.json(results[0]);
    }
  );
});

// Atualizar doação
router.put("/api/doacoes/:id", upload.single("comprovante"), (req, res) => {
  const { id } = req.params;
  const {
    doador,
    data_doacao,
    tipo_doacao,
    valor_doacao,
    id_projeto,
    observacao,
  } = req.body;
  const comprovante = req.file ? req.file.filename : null;

  const query = `
    UPDATE tb_doacoes SET
    doador = ?, data_doacao = ?, tipo_doacao = ?, valor_doacao = ?, comprovante = ?, id_projeto = ?, observacao = ?
    WHERE id_doacoes = ?
  `;

  mysql.query(
    query,
    [
      doador,
      data_doacao,
      tipo_doacao,
      valor_doacao || null,
      comprovante,
      id_projeto || null,
      observacao || null,
      id,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Doação atualizada com sucesso." });
    }
  );
});

// Deletar doação
router.delete("/api/doacoes/:id", (req, res) => {
  const { id } = req.params;
  mysql.query("DELETE FROM tb_doacoes WHERE id_doacoes = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Doação deletada com sucesso." });
  });
});

module.exports = router;
