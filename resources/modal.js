const loginView = document.getElementById('loginView');
const signUpView = document.getElementById('signUpView');
const modalTitle = document.getElementById('authModalTitle');

document.getElementById('switchToSignUp').addEventListener('click', () => {
    loginView.classList.add('d-none');
    signUpView.classList.remove('d-none');
    modalTitle.textContent = 'Create Account';
    signUpView.querySelector('input[name="new_username"]').focus();
});

document.getElementById('switchToLogin').addEventListener('click', () => {
    signUpView.classList.add('d-none');
    loginView.classList.remove('d-none');
    modalTitle.textContent = 'Account Login';
    loginView.querySelector('input[name="username"]').focus();
});

document.querySelectorAll('.authForm').forEach(form => {
    form.addEventListener('submit', function (event) {
        if (!this.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.classList.add('was-validated');
    });
});

document.getElementById('authModal').addEventListener('shown.bs.modal', () => {
    loginView.querySelector('input[name="username"]').focus();
});