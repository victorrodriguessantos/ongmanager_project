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
            window.location.href = '/usuarios';
        } else {
            // Exibir erro
            alert("Usuario ou Senha invalida, por favor tente novamente.");

        }
    } catch (err) {
        console.error('Erro:', err);
    }
});
