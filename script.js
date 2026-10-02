document.addEventListener("DOMContentLoaded", () => {
    // Lista de horários padrão da clínica
    const horarios = [
        "08:00", "09:00", "10:00", "11:00",
        "14:00", "15:00", "16:00", "17:00"
    ];

    const campoData = document.getElementById("data");
    const selectHorario = document.getElementById("horario");
    const radiosTipo = document.querySelectorAll('input[name="tipo"]');
    const containerEndereco = document.getElementById("endereco");
    const formulario = document.getElementById("formulario");
    const cepInput = document.getElementById("cep");

    // 1. Mostrar/Esconder Endereço dependendo do Tipo de Atendimento
    if (containerEndereco) {
        containerEndereco.style.display = "none";
    }

    radiosTipo.forEach(radio => {
        radio.addEventListener("change", (e) => {
            if (containerEndereco) {
                containerEndereco.style.display = (e.target.value === "domiciliar") ? "block" : "none";
            }
        });
    });

    // 2. Carregar Horários Disponíveis e Indisponíveis por Data
    function carregarHorarios() {
        if (!selectHorario) return;

        selectHorario.innerHTML = "";

        if (!campoData || !campoData.value) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Selecione uma data primeiro";
            selectHorario.appendChild(option);
            return;
        }

        // Busca o banco de dados global dos pacientes
        const bd = JSON.parse(localStorage.getItem("bd_pacientes")) || {};

        // Extrai todos os agendamentos já realizados na data selecionada
        const agendamentosNaData = [];
        Object.values(bd).forEach(paciente => {
            if (paciente.agendamentos) {
                paciente.agendamentos.forEach(ag => {
                    if (ag.data === campoData.value) {
                        agendamentosNaData.push(ag.horario);
                    }
                });
            }
        });

        // Preenche o select com status
        horarios.forEach(horario => {
            const ocupado = agendamentosNaData.includes(horario);
            const option = document.createElement("option");

            option.value = horario;

            if (ocupado) {
                option.textContent = `${horario} ❌ Indisponível`;
                option.disabled = true;
            } else {
                option.textContent = `${horario} ✅ Disponível`;
            }

            selectHorario.appendChild(option);
        });
    }

    if (campoData) {
        campoData.addEventListener("change", carregarHorarios);
    }

    // 3. Preenchimento Automático do Endereço via CEP (ViaCEP)
    if (cepInput) {
        cepInput.addEventListener("blur", () => {
            const cep = cepInput.value.replace(/\D/g, "");

            if (cep.length === 8) {
                const elRua = document.getElementById("rua");
                const elBairro = document.getElementById("bairro");

                if (elRua) elRua.placeholder = "Carregando...";
                if (elBairro) elBairro.placeholder = "Carregando...";

                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                    .then(resposta => resposta.json())
                    .then(dados => {
                        if (!dados.erro) {
                            if (elRua) elRua.value = dados.logradouro;
                            if (elBairro) elBairro.value = dados.bairro;

                            const cidadeSelect = document.getElementById("cidade");
                            if (cidadeSelect && dados.localidade) {
                                const cidadeApi = dados.localidade.toLowerCase();
                                if (cidadeApi.includes("nova odessa")) {
                                    cidadeSelect.value = "nova-odessa";
                                } else if (cidadeApi.includes("americana")) {
                                    cidadeSelect.value = "americana";
                                } else if (cidadeApi.includes("sumaré") || cidadeApi.includes("sumare")) {
                                    cidadeSelect.value = "sumare";
                                }
                            }

                            const elNumero = document.getElementById("numero");
                            if (elNumero) elNumero.focus();
                        } else {
                            alert("CEP não encontrado!");
                            limparEndereco();
                        }
                    })
                    .catch(() => {
                        alert("Erro ao buscar CEP.");
                        limparEndereco();
                    });
            }
        });
    }

    function limparEndereco() {
        const elRua = document.getElementById("rua");
        const elBairro = document.getElementById("bairro");
        if (elRua) {
            elRua.value = "";
            elRua.placeholder = "Rua";
        }
        if (elBairro) {
            elBairro.value = "";
            elBairro.placeholder = "Bairro";
        }
    }

    // 4. Processamento do Formulário e Salvamento do Agendamento
    if (formulario) {
        formulario.addEventListener("submit", (event) => {
            event.preventDefault();

            const nome = document.getElementById("nome").value.trim();
            const email = document.getElementById("email").value.trim();
            const telefone = document.getElementById("telefone").value.trim();
            const data = document.getElementById("data").value;
            const horario = selectHorario ? selectHorario.value : "";

            const tipoSelecionado = document.querySelector('input[name="tipo"]:checked');

            if (!tipoSelecionado) {
                alert("Selecione o tipo de atendimento.");
                return;
            }

            if (!horario) {
                alert("Por favor, selecione um horário válido.");
                return;
            }

            const tipo = tipoSelecionado.value;
            let enderecoCompleto = "";

            if (tipo === "domiciliar") {
                const rua = document.getElementById("rua").value.trim();
                const numero = document.getElementById("numero").value.trim();
                const bairro = document.getElementById("bairro").value.trim();
                const cidadeSelect = document.getElementById("cidade");
                const cidade = cidadeSelect ? cidadeSelect.value : "";

                enderecoCompleto = `${rua}, Nº ${numero} - ${bairro} (${cidade})`;
            }

            // Gerar ID único limpo baseado no e-mail do paciente
            const idPaciente = email.toLowerCase().replace(/[^a-z0-9]/g, "");

            // Buscar banco de dados
            let bd = JSON.parse(localStorage.getItem("bd_pacientes")) || {};

            // Trava de segurança: verifica novamente se o horário foi ocupado por outro paciente
            let ocupado = false;
            Object.values(bd).forEach(p => {
                if (p.agendamentos) {
                    p.agendamentos.forEach(ag => {
                        if (ag.data === data && ag.horario === horario) {
                            ocupado = true;
                        }
                    });
                }
            });

            if (ocupado) {
                alert("Este horário já foi agendado! Por favor, escolha outro.");
                carregarHorarios();
                return;
            }

            // Cria o cadastro do paciente caso seja novo
            if (!bd[idPaciente]) {
                bd[idPaciente] = {
                    nome: nome,
                    email: email,
                    telefone: telefone,
                    agendamentos: []
                };
            } else {
                bd[idPaciente].nome = nome;
                bd[idPaciente].email = email;
                bd[idPaciente].telefone = telefone;
            }

            // Adiciona o novo agendamento à lista do paciente
            bd[idPaciente].agendamentos.push({
                data: data,
                horario: horario,
                tipo: tipo,
                endereco: enderecoCompleto
            });

            // Salva no banco de dados centralizado
            localStorage.setItem("bd_pacientes", JSON.stringify(bd));

            alert("Agendamento realizado com sucesso!");

            // Redireciona para o perfil único do paciente
            window.location.href = `perfil.html?id=${idPaciente}`;
        });
    }
});