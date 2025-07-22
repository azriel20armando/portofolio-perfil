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
            const submitBtn = document.querySelector('button[type="submit"]');
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
        showToast('success', 'Mensagem enviada com sucesso', true);
    }

    function showFailureModal() {
        showToast('error', 'Falha ao enviar', false);
    }

    function showToast(type = 'success', message = '', showLink = false) {
        const containerId = 'toast-container';
        let container = document.getElementById(containerId);

        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast ' + (type === 'error' ? 'error' : '');
        toast.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: ${type === 'error' ? '#c62828' : '#1e8e3e'};
            color: #fff;
            padding: 12px 16px;
            margin-top: 10px;
            border-radius: 4px;
            min-width: 320px;
            max-width: 400px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            font-family: Arial, sans-serif;
            animation: slideIn 0.4s ease, fadeOut 0.4s ease 4.6s;
        `;

        toast.innerHTML = `
            <div class="toast-content" style="display: flex; align-items: center; flex-grow: 1;">
                <i style="margin-right: 8px; font-size: 18px;">${type === 'error' ? '❌' : '✅'}</i>
                <span>${message}</span>
            </div>
            <div class="toast-actions" style="margin-left: 16px; display: flex; align-items: center; gap: 10px;">
                <span class="close-btn" style="cursor: pointer; font-size: 18px;">&times;</span>
            </div>
        `;

        container.appendChild(toast);

        const autoRemove = setTimeout(() => {
            toast.remove();
        }, 5000000000);

        toast.querySelector('.close-btn').addEventListener('click', () => {
            clearTimeout(autoRemove);
            toast.remove();
        });

        if (showLink) {
            toast.querySelector('.toast-link').addEventListener('click', () => {
                alert('Abrindo biblioteca...'); // Aqui você pode navegar para onde quiser
            });
        }
    }
    
    function resetFieldStyles() {
        inputs.forEach(input => {
            input.classList.remove('input-success', 'input-error');
        });
    }
});


  
  