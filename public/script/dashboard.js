const baseURL = 'http://localhost:8000/api';

const fetchDashboardData = async () => {
    try {
        const [doacoesRes, voluntariosRes] = await Promise.all([
            fetch(`${baseURL}/doacoes`),
            fetch(`${baseURL}/voluntarios`)
        ]);

        if (!doacoesRes.ok || !voluntariosRes.ok) throw new Error('Erro ao carregar dados.');

        const doacoes = await doacoesRes.json();
        const voluntarios = await voluntariosRes.json();

        // 🔹 Atualizando cards de quantidade
        document.getElementById('totalDoacoes').innerText = doacoes.length;

        // 🔹 Correção: Garantir que as comparações de datas funcionem corretamente
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // 🔹 Ignorar horário para comparações de data

        const semanaPassada = new Date();
        semanaPassada.setDate(semanaPassada.getDate() - 7);
        semanaPassada.setHours(0, 0, 0, 0);

        const mesPassado = new Date();
        mesPassado.setMonth(mesPassado.getMonth() - 1);
        mesPassado.setHours(0, 0, 0, 0);

        document.getElementById('doacoesDia').innerText = doacoes.filter(d => {
            const dataDoacao = new Date(d.data_doacao);
            dataDoacao.setHours(0, 0, 0, 0);
            return dataDoacao.getTime() === hoje.getTime();
        }).length;

        document.getElementById('doacoesSemana').innerText = doacoes.filter(d => new Date(d.data_doacao) >= semanaPassada).length;
        document.getElementById('doacoesMes').innerText = doacoes.filter(d => new Date(d.data_doacao) >= mesPassado).length;

        document.getElementById('totalVoluntarios').innerText = voluntarios.length;

        // 🔹 Calculando valores monetários das doações
        const formatCurrency = value => `R$ ${parseFloat(value || 0).toFixed(2).replace('.', ',')}`;

        document.getElementById('valorTotalDoacoes').innerText = formatCurrency(doacoes.reduce((acc, d) => acc + parseFloat(d.valor_doacao || 0), 0));

        document.getElementById('valorDoacoesDia').innerText = formatCurrency(doacoes.filter(d => {
            const dataDoacao = new Date(d.data_doacao);
            dataDoacao.setHours(0, 0, 0, 0);
            return dataDoacao.getTime() === hoje.getTime();
        }).reduce((acc, d) => acc + parseFloat(d.valor_doacao || 0), 0));

        document.getElementById('valorDoacoesSemana').innerText = formatCurrency(doacoes.filter(d => new Date(d.data_doacao) >= semanaPassada).reduce((acc, d) => acc + parseFloat(d.valor_doacao || 0), 0));

        document.getElementById('valorDoacoesMes').innerText = formatCurrency(doacoes.filter(d => new Date(d.data_doacao) >= mesPassado).reduce((acc, d) => acc + parseFloat(d.valor_doacao || 0), 0));

        // 🟢 Chamar as funções dos gráficos
        gerarGraficoDoacoes(doacoes);
        gerarGraficoValores(doacoes);

    } catch (error) {
        console.error(error.message);
    }
};

document.addEventListener('DOMContentLoaded', fetchDashboardData);

const gerarGraficoDoacoes = (doacoes) => {
    console.log("Doações carregadas para o gráfico:", doacoes);

    if (!doacoes.length) {
        console.warn("Nenhuma doação encontrada para o gráfico.");
        return;
    }

    const ctx = document.getElementById('graficoDoacoes').getContext('2d');

    const dias = [...Array(7)].map((_, i) => {
        const data = new Date();
        data.setDate(data.getDate() - i);
        return data.toISOString().split('T')[0];
    }).reverse();

    const doacoesPorDia = dias.map(dia => 
        doacoes.filter(d => new Date(d.data_doacao).toISOString().split('T')[0] === dia).length
    );

    if (window.graficoInstancia) {
        window.graficoInstancia.destroy();
    }

    window.graficoInstancia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dias,
            datasets: [{
                label: 'Doações nos últimos 7 dias',
                data: doacoesPorDia,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true
            }]
        }
    });
};

const gerarGraficoValores = (doacoes) => {
    console.log("Valores de doações recebidos:", doacoes);

    if (!doacoes.length) {
        console.warn("Nenhuma doação encontrada para o gráfico.");
        return;
    }

    const ctx = document.getElementById('graficoValores').getContext('2d');

    const dias = [...Array(7)].map((_, i) => {
        const data = new Date();
        data.setDate(data.getDate() - i);
        return data.toISOString().split('T')[0];
    }).reverse();

    const valoresPorDia = dias.map(dia => 
        doacoes.filter(d => new Date(d.data_doacao).toISOString().split('T')[0] === dia)
               .reduce((acc, d) => acc + parseFloat(d.valor_doacao || 0), 0)
    );

    if (window.graficoValoresInstancia) {
        window.graficoValoresInstancia.destroy();
    }

    window.graficoValoresInstancia = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dias,
            datasets: [{
                label: 'Valor de Doações nos últimos 7 dias',
                data: valoresPorDia,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: '#ff6384',
                borderWidth: 1
            }]
        }
    });
};

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