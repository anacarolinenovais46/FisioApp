// Mostrar ou esconder o endereço
const radios = document.querySelectorAll('input[name="tipo"]');
const divEndereco = document.getElementById("endereco");

radios.forEach(radio => {

    radio.addEventListener("change", function(){

        if(this.value === "domiciliar"){

            divEndereco.style.display = "block";

        }else{

            divEndereco.style.display = "none";

        }

    });

});

// Horários disponíveis
const horarios = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00"
];

const campoData = document.getElementById("data");
const selectHorario = document.getElementById("horario");

// Quando escolher uma data, mostra os horários
campoData.addEventListener("change", carregarHorarios);

function carregarHorarios(){

    selectHorario.innerHTML = "";

    const agendamentos =
    JSON.parse(localStorage.getItem("agendamentos")) || [];

    horarios.forEach(horario => {

        const ocupado = agendamentos.some(consulta =>
            consulta.data === campoData.value &&
            consulta.horario === horario
        );

        const option = document.createElement("option");

        option.value = horario;

        if(ocupado){

            option.textContent = horario + " ❌ Indisponível";
            option.disabled = true;

        }else{

            option.textContent = horario + " ✅ Disponível";

        }

        selectHorario.appendChild(option);

    });

}

// Formulário
const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", function(event){

    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;
    const data = document.getElementById("data").value;
    const horario = document.getElementById("horario").value;

    const tipoSelecionado = document.querySelector('input[name="tipo"]:checked');

    if(!tipoSelecionado){

        alert("Selecione o tipo de atendimento.");

        return;

    }

    const tipo = tipoSelecionado.value;

    let endereco = "";

    if(tipo === "domiciliar"){

        endereco =
            document.getElementById("rua").value +
            ", Nº " +
            document.getElementById("numero").value;

    }

    // Verifica se o horário foi ocupado enquanto o usuário preenchia
    let agendamentos =
    JSON.parse(localStorage.getItem("agendamentos")) || [];

    const ocupado = agendamentos.some(consulta =>
        consulta.data === data &&
        consulta.horario === horario
    );

    if(ocupado){

        alert("Este horário já foi agendado. Escolha outro.");

        carregarHorarios();

        return;

    }

    localStorage.setItem("nome", nome);

    agendamentos.push({

        nome,
        email,
        telefone,
        data,
        horario,
        tipo,
        endereco

    });

    localStorage.setItem(
        "agendamentos",
        JSON.stringify(agendamentos)
    );

    alert("Agendamento realizado com sucesso!");

    window.location.href = "perfil.html";

});

// 1. Ocultar/Exibir Endereço dependendo da escolha
const radiosTipo = document.querySelectorAll('input[name="tipo"]');
const containerEndereco = document.getElementById('endereco');

// Inicia oculto por padrão
containerEndereco.style.display = 'none';

radiosTipo.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'domiciliar') {
            containerEndereco.style.display = 'block';
        } else {
            containerEndereco.style.display = 'none';
        }
    });
});

// 2. Preenchimento Automático do Endereço via CEP (ViaCEP)
const cepInput = document.getElementById('cep');

cepInput.addEventListener('blur', () => {
    const cep = cepInput.value.replace(/\D/g, '');

    if (cep.length === 8) {
        document.getElementById('rua').placeholder = "Carregando...";
        document.getElementById('bairro').placeholder = "Carregando...";

        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(resposta => resposta.json())
            .then(dados => {
                if (!dados.erro) {
                    document.getElementById('rua').value = dados.logradouro;
                    document.getElementById('bairro').value = dados.bairro;

                    const cidadeSelect = document.getElementById('cidade');
                    const cidadeApi = dados.localidade.toLowerCase();

                    if (cidadeApi.includes('nova odessa')) {
                        cidadeSelect.value = 'nova-odessa';
                    } else if (cidadeApi.includes('americana')) {
                        cidadeSelect.value = 'americana';
                    } else if (cidadeApi.includes('sumaré') || cidadeApi.includes('sumare')) {
                        cidadeSelect.value = 'sumare';
                    }

                    document.getElementById('numero').focus();
                } else {
                    alert('CEP não encontrado!');
                    limparEndereco();
                }
            })
            .catch(() => {
                alert('Erro ao buscar CEP.');
                limparEndereco();
            });
    }
});

function limparEndereco() {
    document.getElementById('rua').value = '';
    document.getElementById('bairro').value = '';
    document.getElementById('rua').placeholder = "Rua";
    document.getElementById('bairro').placeholder = "Bairro";
}