const apiBaseUrl = "http://localhost:8000/api/usuarios"; // Altere a porta se necessário

// Selecionar elementos
const usersContainer = document.getElementById("usersContainer");
const createUserButton = document.getElementById("createUser");
const userModal = document.getElementById("userModal");
const userForm = document.getElementById("userForm");
const modalTitle = document.getElementById("modalTitle");
const cancelModalButton = document.getElementById("cancelModal");

// Estado para saber se estamos criando ou editando
let isEditing = false;
let editingUserId = null;

// Carregar usuários ao carregar a página
document.addEventListener("DOMContentLoaded", fetchUsers);

// Buscar lista de usuários
async function fetchUsers() {
  try {
    const response = await fetch(apiBaseUrl);
    const users = await response.json();

    // Limpar o container e exibir os usuários
    usersContainer.innerHTML = "";
    users.forEach((user) => addUserCard(user));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
  }
}

// Adicionar um card para cada usuário
function addUserCard(user) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <h3>${user.name_user}</h3>
    <div class="icon-user"> <i class="fi fi-bs-circle-user"></i></div>
    <p>${user.email_user}</p>
    <button class="edit" onclick="openEditModal(${user.id_user}, '${user.name_user}', '${user.email_user}')">Editar</button>
    <button class="delete" onclick="deleteUser(${user.id_user})">Excluir</button>
  `;

  usersContainer.appendChild(card);
}

// Abrir modal para criar usuário
createUserButton.addEventListener("click", () => {
  isEditing = false;
  userForm.reset();
  modalTitle.textContent = "Criar Usuário";
  userModal.classList.add("active");
});

// Abrir modal para editar usuário
function openEditModal(id, name, email) {
  isEditing = true;
  editingUserId = id;
  modalTitle.textContent = "Editar Usuário";
  document.getElementById("name").value = name;
  document.getElementById("email").value = email;
  document.getElementById("password").value = ""; // Senha será opcional no caso de edição
  userModal.classList.add("active");
}

// Fechar modal
cancelModalButton.addEventListener("click", () => {
  userModal.classList.remove("active");
});

// Submeter formulário
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    if (isEditing) {
      // Atualizar usuário
      const response = await fetch(`${apiBaseUrl}/${editingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_user: name,
          email_user: email,
          password_user: password,
        }),
      });

      if (response.ok) {
        alert("Usuário atualizado com sucesso!");
        fetchUsers();
      } else {
        alert("Erro ao atualizar usuário!");
      }
    } else {
      // Criar novo usuário
      const response = await fetch(apiBaseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_user: name,
          email_user: email,
          password_user: password,
        }),
      });

      if (response.ok) {
        alert("Usuário criado com sucesso!");
        fetchUsers();
      } else {
        alert("Erro ao criar usuário!");
      }
    }

    userModal.classList.remove("active");
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
  }
});

// Excluir usuário
async function deleteUser(userId) {
  if (!confirm("Deseja realmente excluir este usuário?")) return;

  try {
    const response = await fetch(`${apiBaseUrl}/${userId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Usuário excluído com sucesso!");
      fetchUsers();
    } else {
      alert("Erro ao excluir usuário!");
    }
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
  }
}

// Navegação

document.getElementById("dashboard").addEventListener("click", function () {
  window.location.href = "/dashboard";
});
document.getElementById("doacoes").addEventListener("click", function () {
  window.location.href = "/doacoes";
});
document.getElementById("projetos").addEventListener("click", function () {
  window.location.href = "/projetos";
});
document.getElementById("voluntarios").addEventListener("click", function () {
  window.location.href = "/voluntarios";
});
document.getElementById("usuarios").addEventListener("click", function () {
  window.location.href = "/usuarios";
});

// Troca do user-name dinamicamente
document.addEventListener("DOMContentLoaded", async () => {
  try {
      const response = await fetch("http://localhost:8000/user-info");
      const data = await response.json();

      if (response.ok) {
          document.querySelector(".user-name").innerText = data.name; // 🔹 Exibe o nome do usuário
      } else {
          console.error("Erro ao obter usuário:", data.error);
      }
  } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
  }
});

// Deslogar
document.querySelector(".logout").addEventListener("click", async () => {
  try {
      const response = await fetch("http://localhost:8000/logout", { method: "GET" });

      if (response.ok) {
          window.location.href = "/"; // 🔹 Redireciona para a tela de login
      } else {
          alert("Erro ao deslogar. Tente novamente.");
      }
  } catch (error) {
      console.error("Erro ao fazer logout:", error);
  }
});