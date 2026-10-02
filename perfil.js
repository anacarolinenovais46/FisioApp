document.addEventListener("DOMContentLoaded", () => {
    // ⚙️ CONFIGURAÇÃO: Mesmo número do WhatsApp da clínica configurado no script.js
    const NUMERO_WHATSAPP_CLINICA = "5519999999999";

    const urlParams = new URLSearchParams(window.location.search);
    const idPaciente = urlParams.get('id');

    let bd = JSON.parse(localStorage.getItem("bd_pacientes")) || {};
    let paciente = bd[idPaciente];

    if (!idPaciente || !paciente) {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: sans-serif;">
                <h1>⚠️ Paciente não encontrado!</h1>
                <p>Por favor, realize um novo agendamento primeiro.</p>
                <br>
                <a href="index.html" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voltar ao Início</a>
            </div>
        `;
        return;
    }

    const elNome = document.getElementById("nomePaciente");
    if (elNome) elNome.textContent = paciente.nome;

    function carregarAgendamentos() {
        const div = document.getElementById("listaAgendamentos");
        if (!div) return;
        
        div.innerHTML = "";

        if (!paciente.agendamentos || paciente.agendamentos.length === 0) {
            div.innerHTML = "<p>Nenhum agendamento encontrado.</p>";
            return;
        }

        paciente.agendamentos.forEach((consulta, indice) => {
            const dataFmt = consulta.data ? consulta.data.split("-").reverse().join("/") : consulta.data;
            div.innerHTML += `
                <div class="card" style="border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                    <h3>Agendamento ${indice + 1}</h3>
                    <p><b>📅 Data:</b> ${dataFmt}</p>
                    <p><b>⏰ Horário:</b> ${consulta.horario}</p>
                    <p><b>🏥 Tipo:</b> ${consulta.tipo === 'domiciliar' ? 'Domiciliar' : 'Consultório'}</p>
                    ${consulta.tipo === "domiciliar" ? `<p><b>📍 Endereço:</b> ${consulta.endereco}</p>` : ""}
                    <br>
                    <button type="button" onclick="cancelar(${indice})">❌ Cancelar Agendamento</button>
                </div>
            `;
        });
    }

    function salvar() {
        localStorage.setItem("bd_pacientes", JSON.stringify(bd));
    }

    // 💬 Botão de Lembrete / Confirmação via WhatsApp
    window.confirmarWhatsApp = function () {
        if (!paciente.agendamentos || paciente.agendamentos.length === 0) {
            alert("Não há agendamentos para confirmar.");
            return;
        }

        const ultimo = paciente.agendamentos[paciente.agendamentos.length - 1];
        const dataFmt = ultimo.data ? ultimo.data.split("-").reverse().join("/") : ultimo.data;
        const tipoTexto = ultimo.tipo === "domiciliar" ? "Domiciliar" : "Consultório";

        let texto = `Olá! Gostaria de confirmar meu agendamento de Fisioterapia:%0A%0A`;
        texto += `👤 *Paciente:* ${paciente.nome}%0A`;
        texto += `📅 *Data:* ${dataFmt}%0A`;
        texto += `⏰ *Horário:* ${ultimo.horario}%0A`;
        texto += `🏥 *Tipo:* ${tipoTexto}%0A`;

        if (ultimo.tipo === "domiciliar" && ultimo.endereco) {
            texto += `📍 *Endereço:* ${ultimo.endereco}%0A`;
        }

        window.open(`https://wa.me/${NUMERO_WHATSAPP_CLINICA}?text=${texto}`, "_blank");
    };

    window.cancelar = function (indice) {
        if (confirm("Deseja cancelar este agendamento?")) {
            paciente.agendamentos.splice(indice, 1);
            salvar();
            carregarAgendamentos();
        }
    };

    window.cancelarTodos = function () {
        if (!paciente.agendamentos || paciente.agendamentos.length === 0) return alert("Não há agendamentos.");
        if (confirm("Deseja cancelar TODOS os agendamentos?")) {
            paciente.agendamentos = [];
            salvar();
            carregarAgendamentos();
        }
    };

    window.compartilhar = function () {
        if (!paciente.agendamentos || paciente.agendamentos.length === 0) return alert("Não há agendamentos.");
        const ultimo = paciente.agendamentos[paciente.agendamentos.length - 1];
        const dataFmt = ultimo.data ? ultimo.data.split("-").reverse().join("/") : ultimo.data;
        const texto = `AGENDAMENTO FISIOTERAPIA\nPaciente: ${paciente.nome}\nData: ${dataFmt} às ${ultimo.horario}`;

        if (navigator.share) {
            navigator.share({ title: "Agendamento", text: texto }).catch(() => {});
        } else {
            alert(texto);
        }
    };

    window.baixar = function () {
        if (!paciente.agendamentos || paciente.agendamentos.length === 0) return alert("Não há agendamentos.");
        const ultimo = paciente.agendamentos[paciente.agendamentos.length - 1];
        const dataFmt = ultimo.data ? ultimo.data.split("-").reverse().join("/") : ultimo.data;
        const texto = `COMPROVANTE DE AGENDAMENTO\n\nPaciente: ${paciente.nome}\nData: ${dataFmt}\nHorário: ${ultimo.horario}\nTipo: ${ultimo.tipo}\nEndereço: ${ultimo.endereco || "Consultório"}`;

        const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Comprovante_${paciente.nome.replace(/\s+/g, '_')}.txt`;
        link.click();
    };

    carregarAgendamentos();
});