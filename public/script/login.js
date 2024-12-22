document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', { // Verifique se a rota está correta
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email_user: email, password_user: password }),
        });

        const result = await response.json();

        if (response.ok) {
            // Redirecionar para a página de usuários
            window.location.href = '/view/usuarios.html';
        } else {
            // Exibir erro
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').textContent = result.error;
        }
    } catch (err) {
        console.error('Erro:', err);
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = 'Erro no servidor. Tente novamente mais tarde.';
    }
});
