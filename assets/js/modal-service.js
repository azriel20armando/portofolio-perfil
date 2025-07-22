document.addEventListener("DOMContentLoaded", () => {
  const inputServico = document.getElementById("campoFormulario");
  const modal = document.getElementById("modalServicos");
  const fecharModal = document.getElementById("fecharModal");
  const listaServicos = document.getElementById("listaServicos");

  // Mostrar modal ao clicar no input
  inputServico.addEventListener("click", () => {
    modal.style.display = "block";
  });

  // Fechar modal ao clicar no botão X
  fecharModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Selecionar serviço e preencher o input
  listaServicos.querySelectorAll("li").forEach(item => {
    item.addEventListener("click", () => {
      const p = item.querySelector("p");
      if (p) {
        inputServico.value = p.textContent.trim();
      }
      modal.style.display = "none";

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
  });


  // Fechar modal ao clicar fora da área do conteúdo
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});
