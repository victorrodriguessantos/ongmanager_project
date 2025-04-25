// script.js
document.addEventListener('DOMContentLoaded', function () {
    const baseURL = 'http://localhost:8000/api';
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
        const response = await fetch(`${baseURL}/voluntarios`);
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
                        <span class="name-voluntario"><i class="fi fi-rr-clipboard-user"></i> ${voluntario.name_voluntario}</span>
                        <span><i class="fi fi-rr-envelope"></i> ${voluntario.email_voluntario}</span>
                        <span><i class="fi fi-rr-phone-call"></i> ${voluntario.phone_voluntario}</span>
                        <span><i class="fi fi-rs-person-cv"></i> ${voluntario.preferencia_profissional}</span>
                    </div>
                    <div class="voluntario-buttons">
                        <button title="Ver mais" class="view-btn" data-id="${voluntario.id_voluntario}"><i class="fi fi-ts-overview"></i></button>
                        <button title="Editar" class="edit-btn" data-id="${voluntario.id_voluntario}"><i class="fi fi-rr-file-edit"></i></button>
                        <button title="Excluir" class="delete-btn" data-id="${voluntario.id_voluntario}"><i class="fi fi-rr-trash"></i></button>
                        <button title="Baixar CV" class="download-btn" data-url="http://localhost:8000/${voluntario.curriculo_voluntario}"><i class="fi fi-rr-file-download"></i></button>
                    </div>
                `;
                voluntariosContainer.appendChild(card);
            });
  
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const voluntario = voluntarios.find(vol => vol.id_voluntario == id);
                openViewModal(voluntario);
            });
        });
            
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const voluntario = voluntarios.find(vol => vol.id_voluntario == id);
                openEditModal(voluntario);
            });
        });
            
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const confirmDelete = confirm('Você tem certeza que deseja excluir este voluntário?');
                if (confirmDelete) {
                        deleteVoluntario(id);
                }
            });
        });            

        document.querySelectorAll('.download-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const url = e.currentTarget.dataset.url;
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                document.body.appendChild(a); // Adiciona o elemento ao DOM
                a.click();
                document.body.removeChild(a); // Remove o elemento do DOM
            });
        });        
        
    };
  
    const deleteVoluntario = async (id) => {
        await fetch(`${baseURL}/voluntarios/${id}`, { method: 'DELETE' });
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
            <div class="voluntario-info">
                <div><strong>Nome:</strong> ${voluntario.name_voluntario}</div>
                <div><strong>CPF:</strong> ${voluntario.cpf_voluntario}</div>
                <div><strong>Email:</strong> ${voluntario.email_voluntario}</div>
                <div><strong>Telefone:</strong> ${voluntario.phone_voluntario}</div>
                <div><strong>Endereço:</strong> ${voluntario.endereco_voluntario}</div>
                <div><strong>Observação:</strong> ${voluntario.observacao_voluntario}</div>
                <div><strong>Data de Nascimento:</strong> ${voluntario.data_nascimento}</div>
                <div><strong>Preferência Profissional:</strong> ${voluntario.preferencia_profissional}</div>
            </div>
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
            await fetch(`${baseURL}/voluntarios/${id}`, {
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

  // Função para gerar relatorio

  document.getElementById('baixarRelatorioBtn').addEventListener('click', async () => {
    try {
        const apiURL = 'http://localhost:8000/api/voluntarios'; // 🔹 Definição dentro do escopo da função
        const response = await fetch(apiURL);
        if (!response.ok) throw new Error('Erro ao carregar os voluntários.');
        const voluntarios = await response.json();

        // Criar um array formatado para exportação
        const dadosExcel = voluntarios.map(voluntario => ({
            Nome: voluntario.name_voluntario,
            CPF: voluntario.cpf_voluntario,
            Email: voluntario.email_voluntario,
            Telefone: voluntario.phone_voluntario,
            Endereço: voluntario.endereco_voluntario,
            Observação: voluntario.observacao_voluntario || '-',
            Data_Nascimento: new Date(voluntario.data_nascimento).toLocaleDateString(),
            Preferência_Profissional: voluntario.preferencia_profissional,
        }));

        // Criar a planilha Excel
        const ws = XLSX.utils.json_to_sheet(dadosExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Voluntários");

        // Baixar o arquivo
        XLSX.writeFile(wb, "Relatorio_Voluntarios.xlsx");
    } catch (error) {
        console.error(error.message);
        alert('Erro ao gerar relatório.');
    }
});
  
  // Navegação

document.getElementById("dashboard").addEventListener("click", function() { 
    window.location.href = "/dashboard"; }); 
  document.getElementById("doacoes").addEventListener("click", function() { 
    window.location.href = "/doacoes"; }); 
  document.getElementById("projetos").addEventListener("click", function() { 
    window.location.href = "/projetos"; }); 
  document.getElementById("voluntarios").addEventListener("click", function() { 
    window.location.href = "/voluntarios"; }); 
  document.getElementById("usuarios").addEventListener("click", function() { 
    window.location.href = "/usuarios"; });