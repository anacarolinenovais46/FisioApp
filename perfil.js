// Nome do paciente
const nome = localStorage.getItem("nome");
document.getElementById("nomePaciente").innerHTML = nome;

// Lista de agendamentos
let lista = JSON.parse(localStorage.getItem("agendamentos")) || [];

const div = document.getElementById("listaAgendamentos");

// Carregar agendamentos
function carregarAgendamentos(){

    div.innerHTML = "";

    if(lista.length === 0){

        div.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
        return;

    }

    lista.forEach(function(consulta, indice){

        div.innerHTML += `

        <div class="card">

            <h3>Agendamento ${indice + 1}</h3>

            <p><b>📅 Data:</b> ${consulta.data}</p>

            <p><b>⏰ Horário:</b> ${consulta.horario}</p>

            <p><b>🏥 Tipo:</b> ${consulta.tipo}</p>

            ${
                consulta.tipo === "domiciliar"
                ? `<p><b>📍 Endereço:</b> ${consulta.endereco}</p>`
                : ""
            }

            <button onclick="cancelar(${indice})">
                ❌ Cancelar Agendamento
            </button>

            <hr>

        </div>

        `;

    });

}

carregarAgendamentos();

// Cancelar agendamento
function cancelar(indice){

    if(confirm("Deseja cancelar este agendamento?")){

        lista.splice(indice,1);

        localStorage.setItem(
            "agendamentos",
            JSON.stringify(lista)
        );

        carregarAgendamentos();

        alert("Agendamento cancelado com sucesso!");

    }

}

// Compartilhar último agendamento
function compartilhar(){

    if(lista.length === 0){

        alert("Não há agendamentos para compartilhar.");
        return;

    }

    const ultimo = lista[lista.length - 1];

    const texto = `COMPROVANTE DE AGENDAMENTO

Paciente: ${nome}

Data: ${ultimo.data}

Horário: ${ultimo.horario}

Tipo: ${ultimo.tipo}

Endereço: ${ultimo.endereco || "Consultório"}

Clínica de Fisioterapia`;

    if(navigator.share){

        navigator.share({

            title: "Agendamento",

            text: texto

        });

    }else{

        alert("Seu navegador não suporta compartilhamento.");

    }

}

// Baixar comprovante
function baixar(){

    if(lista.length === 0){

        alert("Não há agendamentos para baixar.");
        return;

    }

    const ultimo = lista[lista.length - 1];

    const texto = `COMPROVANTE DE AGENDAMENTO

Paciente: ${nome}

Data: ${ultimo.data}

Horário: ${ultimo.horario}

Tipo: ${ultimo.tipo}

Endereço: ${ultimo.endereco || "Consultório"}

Clínica de Fisioterapia`;

    const arquivo = new Blob([texto], {type:"text/plain"});

    const link = document.createElement("a");

    link.href = URL.createObjectURL(arquivo);

    link.download = "Comprovante.txt";

    link.click();

}

function cancelarTodos(){

    if(lista.length === 0){

        alert("Não há agendamentos.");

        return;

    }

    if(confirm("Deseja cancelar TODOS os agendamentos?")){

        lista = [];

        localStorage.setItem(
            "agendamentos",
            JSON.stringify(lista)
        );

        carregarAgendamentos();

        alert("Todos os agendamentos foram cancelados!");

    }

}