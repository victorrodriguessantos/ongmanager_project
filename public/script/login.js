document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim(); // 🔹 Removendo espaços extras
  const password = document.getElementById("password").value.trim();

  const loginButton = document.querySelector("#loginForm button"); 
  loginButton.disabled = true; // 🔹 Evita múltiplos cliques durante o envio

  try {
      const response = await fetch("/login", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ email_user: email, password_user: password }),
      });

      if (!response.ok) throw new Error("Usuário ou senha inválidos.");

      const result = await response.json();

      if (response.ok && result) {
        window.location.replace("/dashboard"); // 🔹 `replace()` pode forçar o redirecionamento
    } else {
        throw new Error(result.message || "Erro ao autenticar.");
    }

  } catch (err) {
      console.error("Erro:", err);
      alert(err.message); // 🔹 Agora o erro exibe a mensagem correta

  } finally {
      loginButton.disabled = false; // 🔹 Reabilita o botão após a tentativa
  }
});