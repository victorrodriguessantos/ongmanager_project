document.addEventListener('DOMContentLoaded', function () {
    const baseURL = 'http://localhost:8000/api'; // URL base da API
    const doacoesContainer = document.getElementById('doacoesContainer'); // Tabela de doações
    const filtroDoador = document.getElementById('filtroDoador'); // Filtro por nome
    const filtroData = document.getElementById('filtroData'); // Filtro por data
    const modal = document.getElementById('modal'); // Modal
    const modalCloseBtn = document.getElementById('modalCloseBtn'); // Botão para fechar o modal
    const modalForm = document.getElementById('modalForm'); // Formulário do modal
    const doacaoId = document.getElementById('doacaoId'); // Campo oculto para ID
    const doador = document.getElementById('doador'); // Nome do doador
    const dataDoacao = document.getElementById('data_doacao'); // Data da doação
    const tipoDoacao = document.getElementById('tipo_doacao'); // Tipo de doação
    const valorDoacao = document.getElementById('valor_doacao'); // Valor da doação
    const idProjeto = document.getElementById('id_projeto'); // Projeto vinculado
    const observacao = document.getElementById('observacao'); // Observação
    const comprovante = document.getElementById('comprovante'); // Comprovante de doação

    // Carregar Doações da API
    const fetchDoacoes = async () => {
        try {
            const response = await fetch(`${baseURL}/doacoes`);
            if (!response.ok) throw new Error('Erro ao carregar as doações.');
            const doacoes = await response.json();
            displayDoacoes(doacoes);
        } catch (error) {
            console.error(error.message);
        }
    };

    // Exibir Doações na Tabela
    const displayDoacoes = (doacoes) => {
        doacoesContainer.innerHTML = ''; // Limpa a tabela antes de renderizar
    
        doacoes
            .filter(doacao => {
                const doadorFiltro = doacao.doador.toLowerCase().includes(filtroDoador.value.toLowerCase());
                const dataFiltro = filtroData.value ? new Date(doacao.data_doacao).toISOString().split('T')[0] === filtroData.value : true;
                return doadorFiltro && dataFiltro;
            })
            .forEach(doacao => {
                const comprovanteBtn = doacao.comprovante 
                    ? `<button class="download-btn" title="Baixar Comprovante" data-url="/bd/uploads/comprovantes/${doacao.comprovante}"><i class="fi fi-rs-folder-download"></i></button>` 
                    : '';
    
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${doacao.doador}</td>
                    <td>${new Date(doacao.data_doacao).toLocaleDateString()}</td>
                    <td>R$ ${parseFloat(doacao.valor_doacao || 0).toFixed(2).replace('.', ',')}</td>
                    <td>${doacao.observacao || '-'}</td>
                    <td>
                        <button class="edit-btn" title="Editar" data-id="${doacao.id_doacoes}"><i class="fi fi-rr-file-edit"></i></button>
                        <button class="delete-btn" title="Excluir" data-id="${doacao.id_doacoes}"><i class="fi fi-rr-trash"></i></button>
                        ${comprovanteBtn}
                    </td>
                `;
                doacoesContainer.appendChild(row);
    
                // Adicionar eventos a cada botão
                const editBtn = row.querySelector('.edit-btn');
                const deleteBtn = row.querySelector('.delete-btn');
                const downloadBtn = row.querySelector('.download-btn');
    
                editBtn?.addEventListener('click', () => {
                    openEditModal(doacao);
                    fetchProjetos();
                });
    
                deleteBtn?.addEventListener('click', () => {
                    deleteDoacao(doacao.id_doacoes);
                });
    
                downloadBtn?.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.open(downloadBtn.dataset.url, '_blank');
                });
            });
    };
    

    // Abrir Modal para Editar
    const openEditModal = (doacao) => {
        modal.style.display = 'block';
        doacaoId.value = doacao.id_doacoes;
        doador.value = doacao.doador;
        dataDoacao.value = doacao.data_doacao;
        tipoDoacao.value = doacao.tipo_doacao;
        valorDoacao.value = doacao.valor_doacao || '';
        idProjeto.value = doacao.id_projeto || '';
        observacao.value = doacao.observacao || '';
        document.getElementById('modalTitle').innerText = 'Editar Doação';
    };

    // Abrir Modal para Nova Doação
    const openNewModal = () => {
        modal.style.display = 'block';
        modalForm.reset();
        doacaoId.value = '';
        document.getElementById('modalTitle').innerText = 'Nova Doação';
    };

    // Fechar Modal
    const closeModal = () => {
        modal.style.display = 'none';
        modalForm.reset();
    };

    modalCloseBtn.addEventListener('click', closeModal);

    // Submeter Formulário (Adicionar ou Editar Doação)
    modalForm.onsubmit = async (e) => {
        e.preventDefault();
        const id = doacaoId.value;
        const method = id ? 'PUT' : 'POST';
        const endpoint = id ? `${baseURL}/doacoes/${id}` : `${baseURL}/doacoes`;
    
        // Converte vírgula para ponto antes de enviar para o banco
        const valorCorrigido = valorDoacao.value.replace(',', '.');
    
        const formData = new FormData();
        formData.append('doador', doador.value.trim());
        formData.append('data_doacao', dataDoacao.value);
        formData.append('tipo_doacao', tipoDoacao.value);
        formData.append('valor_doacao', valorCorrigido || null);
        formData.append('id_projeto', idProjeto.value || null);
        formData.append('observacao', observacao.value.trim());
        formData.append('comprovante', comprovante.files[0] || null);
    
        try {
            const response = await fetch(endpoint, {
                method: method,
                body: formData
            });
    
            if (!response.ok) throw new Error('Erro ao salvar a doação.');
    
            closeModal();
            fetchDoacoes(); // Atualizar lista
        } catch (error) {
            console.error(error.message);
            alert('Erro ao salvar a doação. Verifique os dados.');
        }
    };

    // Excluir Doação
    const deleteDoacao = async (id) => {
        if (confirm('Tem certeza que deseja excluir esta doação?')) {
            try {
                const response = await fetch(`${baseURL}/doacoes/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Erro ao excluir.');
                fetchDoacoes(); // Atualizar lista
            } catch (error) {
                console.error(error.message);
                alert('Erro ao excluir a doação.');
            }
        }
    };

    // Eventos
    document.getElementById('novaDoacaoBtn').addEventListener('click', openNewModal);
    filtroDoador.addEventListener('input', fetchDoacoes);
    filtroData.addEventListener('input', fetchDoacoes);

    // Carregar doações ao iniciar
    fetchDoacoes();

    const fetchProjetos = async () => {
        try {
            const response = await fetch(`${baseURL}/projetos`);
            if (!response.ok) throw new Error('Erro ao carregar os projetos.');
            const projetos = await response.json();
    
            // Limpa e preenche o dropdown de projetos
            idProjeto.innerHTML = '<option value="">Selecione um projeto</option>';
            projetos.forEach(projeto => {
                const option = document.createElement('option');
                option.value = projeto.id_projeto;
                option.textContent = projeto.name_projeto;
                idProjeto.appendChild(option);
            });
        } catch (error) {
            console.error(error.message);
        }
    };
    
    // Chamar a função ao abrir o modal de Nova Doação
    document.getElementById('novaDoacaoBtn').addEventListener('click', () => {
        openNewModal();
        fetchProjetos(); // Carregar projetos no dropdown
    });
    
    // Chamar a função ao abrir o modal de Editar Doação
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const doacao = doacoes.find(d => d.id_doacoes == e.target.dataset.id);
            openEditModal(doacao);
            fetchProjetos(); // Carregar projetos no dropdown
        });
    });
});

// Função para gerar relatorio

document.getElementById('baixarRelatorioBtn').addEventListener('click', async () => {
    const apiURL = 'http://localhost:8000/api/doacoes'; // 🔹 Definição dentro do escopo da função
    console.log("BaseURL no relatório:", apiURL); // Debug para confirmar

    try {
        const response = await fetch(apiURL);
        if (!response.ok) throw new Error('Erro ao carregar as doações.');
        const doacoes = await response.json();

        // Criar um array formatado para exportação
        const dadosExcel = doacoes.map(doacao => ({
            Doador: doacao.doador,
            Data: new Date(doacao.data_doacao).toLocaleDateString(),
            Valor: `R$ ${parseFloat(doacao.valor_doacao || 0).toFixed(2).replace('.', ',')}`,
            Observação: doacao.observacao || '-',
        }));

        // Criar a planilha Excel
        const ws = XLSX.utils.json_to_sheet(dadosExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Doações");

        // Baixar o arquivo
        XLSX.writeFile(wb, "Relatorio_Doacoes.xlsx");
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