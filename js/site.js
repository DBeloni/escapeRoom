const siteState = {
    messagesSent: 0,
    lastProtocol: null
};

const protocolPrefix = "ER";
const feedbackMessages = [
    "Transmissão recebida. A equipe vai analisar o sinal.",
    "Mensagem registrada no terminal dos desenvolvedores.",
    "Contato armazenado. Nenhuma resposta real será enviada por este formulário."
];

function createProtocol() {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `${protocolPrefix}-${randomNumber}`;
}

function setupContactForm() {
    const form = document.querySelector("[data-fake-form]");
    const status = document.querySelector("[data-form-status]");

    if (!form || !status) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = new FormData(form);
        const name = String(data.get("nome") || "jogador").trim() || "jogador";

        siteState.messagesSent += 1;
        siteState.lastProtocol = createProtocol();

        const message = feedbackMessages[siteState.messagesSent % feedbackMessages.length];
        status.textContent = `${message} Olá, ${name}! Protocolo ${siteState.lastProtocol}.`;
        status.setAttribute("role", "status");

        form.reset();
    });
}

function setupDate() {
    const year = document.querySelector("[data-year]");
    if (year) {
        year.textContent = new Date().getFullYear();
    }
}

setupContactForm();
setupDate();
