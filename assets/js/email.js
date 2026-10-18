document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('#contact-form input');

    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            if (!this.classList.contains('input-success')) {
                this.classList.add('input-error');
            }
        });

        input.addEventListener('input', function () {
            validateField(this);
        });

        input.addEventListener('blur', function () {
            validateField(this);
        });
    });

    function validateField(input) {
        removeError(input);
        let isValid = true;

        if (input.required && input.value.trim() === '') {
            showError(input, 'Este campo é obrigatório');
            isValid = false;
        }

        switch (input.id) {
            case 'name':
            case 'empresa':
            case 'empresaGPS':
                if (input.value.trim().length < 8) {
                    showError(input, 'Deve ter pelo menos 8 caracteres');
                    isValid = false;
                }
                break;

            case 'number':
                input.value = input.value.replace(/\D/g, '');
                if (input.value.length > 9) {
                    input.value = input.value.slice(0, 9);
                }
                if (!/^\d{9}$/.test(input.value)) {
                    showError(input, 'O telefone deve ter exatamente 9 dígitos numéricos');
                    isValid = false;
                }
                break;

            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                    showError(input, 'Por favor, insira um email válido');
                    isValid = false;
                }
                break;

            case 'campoFormulario':
                if (input.value.trim() === '') {
                    showError(input, 'Por favor, selecione um pacote');
                    isValid = false;
                }
                break;
        }

        if (isValid) {
            input.classList.add('input-success');
            input.classList.remove('input-error');
        } else {
            input.classList.add('input-error');
            input.classList.remove('input-success');
        }

        return isValid;
    }

    function showError(input, message) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
            errorElement.classList.add('active');
            input.classList.add('input-error');
            input.classList.remove('input-success');
        }
    }

    function removeError(input) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = '';
            errorElement.classList.remove('active');
        }
    }

    document.getElementById('contact-form').addEventListener('submit', function (e) {
    e.preventDefault();
    let formIsValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            formIsValid = false;
        }
    });

    if (formIsValid) {
        const submitBtn = document.querySelector('#contact-form button[type="submit"]');
        submitBtn.disabled = true;
        startLoadingAnimation(submitBtn);

        const templateParams = {
            subject: `Novo contato de ${document.getElementById('name').value}`,
            name: document.getElementById('name').value,
            phone: document.getElementById('number').value,
            email: document.getElementById('email').value,
            company: document.getElementById('empresa').value,
            location: document.getElementById('empresaGPS').value,
            service: document.getElementById('campoFormulario').value,
            submission_date: new Date().toLocaleString()
        };

        let timeout = setTimeout(() => {
            stopLoadingAnimation(submitBtn);
            showFailureModal();
            submitBtn.disabled = false;
        }, 5000);

        emailjs.send('service_ypnwarg', 'template_xt23rn8', templateParams)
            .then(function (response) {
                clearTimeout(timeout);
                stopLoadingAnimation(submitBtn);
                showSuccessModal();
                document.getElementById('contact-form').reset();
                resetFieldStyles();
            }, function (error) {
                clearTimeout(timeout);
                stopLoadingAnimation(submitBtn);
                showFailureModal();
            })
            .finally(() => {
                submitBtn.disabled = false;
            });
        }
    });

    function startLoadingAnimation(button) {
        let dots = 0;
        button.textContent = 'Enviando';
        button.loadingInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            button.textContent = 'Enviando' + '.'.repeat(dots);
        }, 500);
    }

    function stopLoadingAnimation(button) {
        clearInterval(button.loadingInterval);
        button.textContent = 'Enviar';
    }

    function showSuccessModal() {
        showToast('success', 'Mensagem enviada com sucesso.');
    }

    function showFailureModal() {
        showToast('error', 'Falha ao enviar. Tente novamente ou contacte-me pelo WhatsApp.');
    }

    function showToast(type = 'success', message = '') {
        const containerId = 'toast-container';
        let container = document.getElementById(containerId);

        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.setAttribute('role', 'status');
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast' + (type === 'error' ? ' error' : '');

        const content = document.createElement('div');
        content.className = 'toast__content';
        const label = document.createElement('span');
        label.className = 'toast__label';
        label.textContent = type === 'error' ? 'Erro' : 'Enviado';
        const text = document.createElement('span');
        text.textContent = message;
        content.append(label, text);

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'close-btn';
        closeBtn.setAttribute('aria-label', 'Fechar notificação');
        closeBtn.innerHTML = '&times;';

        toast.append(content, closeBtn);
        container.appendChild(toast);

        const removeToast = () => {
            if (!toast.isConnected || toast.classList.contains('is-leaving')) return;
            toast.classList.add('is-leaving');
            setTimeout(() => toast.remove(), 350);
        };

        const autoRemove = setTimeout(removeToast, 6000);

        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            removeToast();
        });
    }

    function resetFieldStyles() {
        inputs.forEach(input => {
            input.classList.remove('input-success', 'input-error', 'campo-preenchido');
            removeError(input);
        });
    }

    // Limpar também os estados visuais ao carregar em "Limpar"
    document.getElementById('contact-form').addEventListener('reset', function () {
        resetFieldStyles();
    });
});


  
  