document.addEventListener('DOMContentLoaded', function () {
  const baseURL = 'http://localhost:8000/api'; // URL base da API
  const projetosContainer = document.getElementById('projetosContainer'); // Contêiner dos projetos
  const filtroNome = document.getElementById('filtroNome'); // Campo de filtro
  const modal = document.getElementById('modal'); // Modal de edição/cadastro
  const modalCloseBtn = document.getElementById('modalCloseBtn'); // Botão para fechar o modal
  const modalForm = document.getElementById('modalForm'); // Formulário do modal
  const projetoId = document.getElementById('projetoId'); // Campo oculto para ID
  const nameProjeto = document.getElementById('name_projeto'); // Nome do projeto
  const descricao = document.getElementById('descricao'); // Descrição do projeto
  const metaArrecadacao = document.getElementById('meta_arrecadacao'); // Meta de arrecadação
  const statusProjeto = document.getElementById('status_projeto'); // Status do projeto

  // Carregar Projetos da API
  const fetchProjetos = async () => {
      try {
          const response = await fetch(`${baseURL}/projetos`);
          if (!response.ok) throw new Error('Erro ao carregar os projetos.');
          const projetos = await response.json();
          displayProjetos(projetos);
      } catch (error) {
          console.error(error.message);
      }
  };


  // Exibir Projetos no Container
  const displayProjetos = (projetos) => {
    projetosContainer.innerHTML = ''; // Limpa o container antes de renderizar os projetos
    projetos
        .filter(proj => proj.name_projeto.toLowerCase().includes(filtroNome.value.toLowerCase())) // Filtro pelo nome
        .forEach(projeto => {
            const valorArrecadado = parseFloat(projeto.valor_arrecadado) > 0 
                ? `R$ ${parseFloat(projeto.valor_arrecadado).toFixed(2).replace('.', ',')}` 
                : 'R$ 00,00'; // Ajuste para valores nulos ou zero

            const card = document.createElement('div');
            card.className = 'projeto-card';
            card.innerHTML = `
                <div class="projeto-details">
                    <span class="name-projeto"><i class="fi fi-bs-diagram-project"></i> ${projeto.name_projeto}</span>
                    <hr>
                    <span><strong>Descrição:</strong> ${projeto.descricao}</span>
                    <br>
                    <span><strong>Meta:</strong> R$ ${parseFloat(projeto.meta_arrecadacao).toFixed(2).replace('.', ',')}</span>
                    <span><strong>Arrecadado:</strong> ${valorArrecadado}</span>
                    <br>
                    <span><strong>Status:</strong> ${projeto.status_projeto}</span>
                    <hr>
                    <button class="edit-btn" data-id="${projeto.id_projeto}"><i class="fi fi-rr-file-edit"></i></button>
                    <button class="delete-btn" data-id="${projeto.id_projeto}"><i class="fi fi-rr-trash"></i></button>
                </div>
            `;
            projetosContainer.appendChild(card);
        });

    // Adicionar eventos aos botões
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => openEditModal(projetos.find(proj => proj.id_projeto == e.target.dataset.id)));
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => deleteProjeto(e.target.dataset.id));
    });
};

  // Abrir Modal para Editar
  const openEditModal = (projeto) => {
      modal.style.display = 'block';
      nameProjeto.value = projeto.name_projeto;
      descricao.value = projeto.descricao;
      metaArrecadacao.value = projeto.meta_arrecadacao;
      statusProjeto.value = projeto.status_projeto;
      projetoId.value = projeto.id_projeto; // Atribuir ID ao campo oculto
      document.getElementById('modalTitle').innerText = 'Editar Projeto'; // Atualizar título
  };

  // Abrir Modal para Novo Projeto
  const openNewModal = () => {
      modal.style.display = 'block';
      modalForm.reset(); // Limpar formulário
      projetoId.value = ''; // Certificar que o ID está vazio
      document.getElementById('modalTitle').innerText = 'Novo Projeto'; // Atualizar título
  };

  // Fechar Modal
  const closeModal = () => {
      modal.style.display = 'none';
      modalForm.reset(); // Resetar formulário
  };

  modalCloseBtn.addEventListener('click', closeModal);

  // Submeter Formulário (Editar ou Criar)
  modalForm.onsubmit = async (e) => {
      e.preventDefault();
      const id = projetoId.value;
      const method = id ? 'PUT' : 'POST'; // Editar ou Criar
      const endpoint = id ? `${baseURL}/projetos/${id}` : `${baseURL}/projetos`;

      const data = {
          name_projeto: nameProjeto.value.trim(),
          descricao: descricao.value.trim(),
          meta_arrecadacao: parseFloat(metaArrecadacao.value), // Garantir que seja um número
          status_projeto: statusProjeto.value
      };

      try {
          const response = await fetch(endpoint, {
              method: method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
          });

          if (!response.ok) throw new Error('Erro ao salvar o projeto.');
          closeModal();
          fetchProjetos(); // Atualizar lista
      } catch (error) {
          console.error(error.message);
          alert('Ocorreu um erro ao salvar o projeto. Verifique os dados e tente novamente.');
      }
  };

  // Excluir Projeto
  const deleteProjeto = async (id) => {
      if (confirm('Tem certeza que deseja excluir este projeto?')) {
          try {
              const response = await fetch(`${baseURL}/projetos/${id}`, { method: 'DELETE' });
              if (!response.ok) throw new Error('Erro ao excluir o projeto.');
              fetchProjetos(); // Atualizar lista
          } catch (error) {
              console.error(error.message);
              alert('Erro ao excluir o projeto.');
          }
      }
  };

  // Buscar Projetos em Tempo Real
  filtroNome.addEventListener('input', fetchProjetos);

  // Evento para abrir o modal de Novo Projeto
  document.getElementById('ProjetoBtn').addEventListener('click', openNewModal);

  // Inicializar ao carregar a página
  fetchProjetos();
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
