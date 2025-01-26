// script.js
document.addEventListener('DOMContentLoaded', function () {
    const baseURL = 'http://localhost:8000';
    const voluntariosContainer = document.getElementById('voluntariosContainer');
    const filtroNome = document.getElementById('filtroNome');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const viewModal = document.getElementById('viewModal');
    const closeViewModal = document.getElementById('closeViewModal');
    const novoVoluntarioBtn = document.getElementById('novoVoluntarioBtn');
    const voluntarioForm = document.getElementById('voluntarioForm');
    const modalTitle = document.getElementById('modalTitle');
    const voluntarioId = document.getElementById('voluntarioId');
    const voluntarioInfo = document.getElementById('voluntarioInfo');
  
    const fetchVoluntarios = async () => {
        const response = await fetch(`${baseURL}/voluntario`);
        const voluntarios = await response.json();
        displayVoluntarios(voluntarios);
    };
  
    const displayVoluntarios = (voluntarios) => {
        voluntariosContainer.innerHTML = '';
        voluntarios
            .filter(vol => vol.name_voluntario.toLowerCase().includes(filtroNome.value.toLowerCase()))
            .forEach(voluntario => {
                const card = document.createElement('div');
                card.className = 'voluntario-card';
                card.innerHTML = `
                    <div class="voluntario-details">
                        <span>${voluntario.name_voluntario}</span>
                        <span>${voluntario.email_voluntario}</span>
                        <span>${voluntario.phone_voluntario}</span>
                        <span>${voluntario.preferencia_profissional}</span>
                    </div>
                    <div class="voluntario-buttons">
                        <button class="view-btn" data-id="${voluntario.id_voluntario}">Ver Mais</button>
                        <button class="edit-btn" data-id="${voluntario.id_voluntario}">Editar</button>
                        <button class="delete-btn" data-id="${voluntario.id_voluntario}">Excluir</button>
                        <button class="download-btn" data-url="${baseURL}/uploads/${voluntario.curriculo_voluntario}">Baixar Currículo</button>
                    </div>
                `;
                voluntariosContainer.appendChild(card);
            });
  
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', (e) => openViewModal(voluntarios.find(vol => vol.id_voluntario == e.target.dataset.id)));
        });
  
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => openEditModal(voluntarios.find(vol => vol.id_voluntario == e.target.dataset.id)));
        });
  
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const confirmDelete = confirm('Você tem certeza que deseja excluir este voluntário?');
                if (confirmDelete) {
                    deleteVoluntario(e.target.dataset.id);
                }
            });
        });
  
        document.querySelectorAll('.download-btn').forEach(button => {
            button.addEventListener('click', (e) => window.open(e.target.dataset.url));
        });
    };
  
    const deleteVoluntario = async (id) => {
        await fetch(`${baseURL}/voluntario/${id}`, { method: 'DELETE' });
        fetchVoluntarios();
    };
  
    const openEditModal = (voluntario) => {
        modalTitle.innerText = 'Editar Voluntário';
        voluntarioId.value = voluntario.id_voluntario;
        document.getElementById('name_voluntario').value = voluntario.name_voluntario;
        document.getElementById('cpf_voluntario').value = voluntario.cpf_voluntario;
        document.getElementById('email_voluntario').value = voluntario.email_voluntario;
        document.getElementById('phone_voluntario').value = voluntario.phone_voluntario;
        document.getElementById('endereco_voluntario').value = voluntario.endereco_voluntario;
        document.getElementById('observacao_voluntario').value = voluntario.observacao_voluntario;
        document.getElementById('data_nascimento').value = voluntario.data_nascimento;
        document.getElementById('preferencia_profissional').value = voluntario.preferencia_profissional;
        modal.style.display = 'block';
    };
  
    const openNewModal = () => {
        modalTitle.innerText = 'Novo Voluntário';
        voluntarioId.value = ''; // Garante que o id do voluntário esteja vazio
        voluntarioForm.reset();
        modal.style.display = 'block';
    };
  
    const closeModalFunc = () => {
        modal.style.display = 'none';
    };
  
    const openViewModal = (voluntario) => {
        voluntarioInfo.innerHTML = `
            <p><strong>Nome:</strong> ${voluntario.name_voluntario}</p>
            <p><strong>CPF:</strong> ${voluntario.cpf_voluntario}</p>
            <p><strong>Email:</strong> ${voluntario.email_voluntario}</p>
            <p><strong>Telefone:</strong> ${voluntario.phone_voluntario}</p>
            <p><strong>Endereço:</strong> ${voluntario.endereco_voluntario}</p>
            <p><strong>Observação:</strong> ${voluntario.observacao_voluntario}</p>
            <p><strong>Data de Nascimento:</strong> ${voluntario.data_nascimento}</p>
            <p><strong>Preferência Profissional:</strong> ${voluntario.preferencia_profissional}</p>
        `;
        viewModal.style.display = 'block';
    };
  
    const closeViewModalFunc = () => {
        viewModal.style.display = 'none';
    };
  
    voluntarioForm.onsubmit = async (e) => {
        e.preventDefault();
        const data = new FormData(voluntarioForm);
        const id = voluntarioId.value;
  
        if (id) {
            await fetch(`${baseURL}/voluntario/${id}`, {
                method: 'PUT',
                body: data
            });
        } else {
            await fetch(`${baseURL}/voluntarios`, {
                method: 'POST',
                body: data
            });
        }
        closeModalFunc();
        fetchVoluntarios();
    };
  
    filtroNome.addEventListener('input', fetchVoluntarios);
    closeModal.addEventListener('click', closeModalFunc);
    closeViewModal.addEventListener('click', closeViewModalFunc);
    novoVoluntarioBtn.addEventListener('click', openNewModal);
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModalFunc();
        } else if (event.target == viewModal) {
            closeViewModalFunc();
        }
    };
  
    fetchVoluntarios();
  });
  
  // Navegação

document.getElementById("dashboard").addEventListener("click", function() { 
    window.location.href = "/view/dashboard.html"; }); 
  document.getElementById("doacoes").addEventListener("click", function() { 
    window.location.href = "/view/doacoes.html"; }); 
  document.getElementById("projetos").addEventListener("click", function() { 
    window.location.href = "/view/projetos.html"; }); 
  document.getElementById("voluntarios").addEventListener("click", function() { 
    window.location.href = "/view/voluntarios.html"; }); 
  document.getElementById("usuarios").addEventListener("click", function() { 
    window.location.href = "/view/usuarios.html"; });