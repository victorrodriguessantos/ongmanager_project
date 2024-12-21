const express = require('express');

const router = express.Router();

// Cadastrar Usuarios
router.post("/usuarios", async (req, res) => {
    return res.json ({
        mensagem:"Usuario cadastrado com sucesso!"
    })
});

module.exports = router;