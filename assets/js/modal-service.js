document.addEventListener("DOMContentLoaded", () => {
  const inputServico = document.getElementById("campoFormulario");
  const modal = document.getElementById("modalServicos");
  const fecharModal = document.getElementById("fecharModal");
  const listaServicos = document.getElementById("listaServicos");
  if (!inputServico || !modal || !fecharModal || !listaServicos) return;

  const isOpen = () => modal.style.display === "block";

  function abrir() {
    modal.style.display = "block";
    const first = listaServicos.querySelector("li");
    if (first) first.focus();
  }

  function fechar() {
    modal.style.display = "none";
    inputServico.focus();
  }

  // Mostrar modal ao clicar no input (ou Enter/Espaço pelo teclado)
  inputServico.addEventListener("click", abrir);
  inputServico.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      abrir();
    }
  });

  // Fechar modal ao clicar no botão ×
  fecharModal.addEventListener("click", fechar);

  // Selecionar serviço e preencher o input
  listaServicos.querySelectorAll("li").forEach(item => {
    item.addEventListener("click", () => {
      const p = item.querySelector("p");
      if (p) {
        inputServico.value = p.textContent.trim();
      }
      fechar();

      // Aplica visual de campo válido
      inputServico.classList.add('input-success');
      inputServico.classList.remove('input-error');

      // Remove mensagem de erro se existir
      const errorElement = inputServico.nextElementSibling;
      if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = '';
        errorElement.classList.remove('active');
      }
    });

    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        item.click();
      }
    });
  });

  // Fechar modal ao clicar fora da área do conteúdo
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      fechar();
    }
  });

  // Fechar com Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      fechar();
    }
  });
});
