document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const oauth = params.get('oauth');

    if(oauth === 'cancelled') {
        showSwal('Вы отменили вход через Google', 'info')
    } else if(oauth === 'error') {
        showSwal('Произошла ошибка при входе через Google', 'warning')
    } else if(oauth === 'failed') {
        showSwal('Произошла ошибка при входе через Google', 'error')
    }

    if(oauth) {
        window.history.replaceState({}, '', window.location.pathname)
    }
    

    const $ = (s) => document.querySelector(s);
    const path = window.location.pathname;


    async function handleFormSubmit(endpoint, method, body, successCallback, submitBtn, errorMsg = 'Ошибка сервера. Попробуйте позже') {
        let originalText = '';
        let spinner;
        let btnText;

        if (submitBtn) {
            submitBtn.disabled = true;
            spinner = submitBtn.querySelector('.spinner');
            btnText = submitBtn.querySelector('.btn-text');
            if (btnText) {
                originalText = btnText.textContent; 
                btnText.textContent = 'Загрузка...'; 
            }
            if (spinner) spinner.classList.remove('hidden');
        }

        await new Promise(res => setTimeout(res, 100))

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            const data = await res.json();

            showSwal(data.message, res.ok ? 'success' : 'error', () => {
                if (res.ok && successCallback) successCallback(data);
            });

        } catch (error) {
            showSwal(`Frontend: ${errorMsg}`, 'error'); 
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                if (spinner) spinner.classList.add('hidden');
                if (btnText) btnText.textContent = originalText; 
            }
        }
    }



    if (path === '/register') {
        initRegister();
    } else if (path === '/login') {
        initLogin();
    } else if (path === '/reset-password') {
        initResetPassword();
    } else if (path === '/reset-code') {
        initCodeInput('/api/reset/reset-code', '/new-password', 
            localStorage.getItem('resetEmail'), { showTimer: true, isReset: true });
    } else if (path === '/new-password') {
        initNewPassword();
    } else if (path === '/verify-register') {
        initCodeInput('/api/auth/verify-register', '/main/page', 
            localStorage.getItem('registerEmail'), { showTimer: false, isReset: false });
    }


    function initRegister() {
        const form = $('#register-form');
        const email = $('#email');
        const username = $('#username');
        const password = $('#password');
        const confirmPassword = $('#confirm-password');
        const submitBtn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            if (password.value !== confirmPassword.value) {
                showSwal('Пароли не совпадают');
                return;
            }

            const body = {
                email: email.value,
                username: username.value,
                password: password.value
            };

            const successCallback = () => {
                localStorage.setItem('registerEmail', email.value);
                window.location.href = '/verify-register';
            };

            await handleFormSubmit('/api/auth/register', 'POST', body, successCallback, submitBtn, 'Ошибка при регистрации');
        });
    }

    function initLogin() {
        const form = $('#login-form');
        const password = $('#password');
        const email = $('#email');
        const submitBtn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const body = {
                email: email.value,
                password: password.value
            }

            const successCallback = () => {
                window.location.href = '/main/page'
            }

            await handleFormSubmit('/api/auth/login', 'POST', body, successCallback, submitBtn, 'Ошибка при входе')
        })
    }

    function initResetPassword() {
        const form = $('#reset-form');
        const emailReset = $('#email');
        const submitBtn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault()

            const body = {email: emailReset.value}
            
            const successCallback = () => {
                localStorage.setItem('resetEmail', emailReset.value); 
                window.location.href = '/reset-code'
            }

            await handleFormSubmit('/api/reset/reset-password', 'POST', body, successCallback, submitBtn, 'Ошибка запроса сброса')
        })
    }

    function initNewPassword() {
        const newPassword = $('#new-password');
        const confirmPassword = $('#confirm-password');
        const form = $('#new-password-form');
        const email = localStorage.getItem('resetEmail');
        const submitBtn = form.querySelector('button[type="submit"]');

        if(!email){
            showSwal('Email для сброса не найден. Начните заново', 'error', () => {
                window.location.href = '/reset-password'
            })
            return
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault() 

            if (confirmPassword && newPassword.value !== confirmPassword.value) {
                showSwal('Пароли не совпадают');
                return;
            }

            const body = {email, password: newPassword.value}

            const successCallback = () => {
                localStorage.removeItem('resetEmail'); 
                window.location.href = '/login'
            }

            await handleFormSubmit('/api/reset/new-password', 'POST', body, successCallback, submitBtn, 'Ошибка при обновлении пароля')
        })
    }

    function initCodeInput(endpoint, redirect, email, options) { 
        const boxes = document.querySelectorAll('.code-box');
        const timerEl = $('#timer');
        const resendBtn = $('#resendBtn');
        const { showTimer, isReset } = options;

        if (!email) {
            showSwal('Email не найден', 'error', () => {
                window.location.href = isReset ? '/reset-password' : '/register';
            });
            return;
        }

        $('#email-text').textContent = email;

        if (showTimer && timerEl) {
             timerEl.parentElement.classList.remove('hidden');
        } else if (timerEl) {
             timerEl.parentElement.classList.add('hidden');
        }

        if (showTimer && resendBtn) {
            startTimer(10, resendBtn); 
        } else if (resendBtn) {
            resendBtn.classList.add('hidden');
        }

        const submitCode = async() => {
            const code = Array.from(boxes).map(b => b.value).join('');
            if (code.length !== boxes.length) return;

            const body = { code, email };
            
            const successCallback = () => {
                if (endpoint.includes('/verify-register')) {
                    localStorage.removeItem('registerEmail');
                } 
                window.location.href = redirect; 
            };
            
            await handleFormSubmit(endpoint, 'POST', body, successCallback, null, 'Ошибка при проверке кода');
        };

        boxes[0].addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = (e.clipboardData || window.clipboardData)
                .getData('Text')
                .replace(/\D/g, '')
                .slice(0, boxes.length); 

            if (pastedData) {
                pastedData.split('').forEach((char, index) => {
                    if (index < boxes.length) {
                        boxes[index].value = char;
                    }
                });
                
                const lastIndex = Math.min(pastedData.length, boxes.length) - 1;
                boxes[lastIndex].focus();

                if (pastedData.length === boxes.length) {
                    submitCode();
                }
            }
        });
        
        boxes.forEach((box, index) => {
            box.addEventListener('input', () => {
                box.value = box.value.replace(/\D/g, "").slice(0, 1); 

                if (box.value && index < boxes.length - 1) {
                    boxes[index + 1].focus();
                }

                if (Array.from(boxes).every(b => b.value.length === 1)) {
                    submitCode();
                }
            });

            box.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !box.value && index > 0) {
                    boxes[index - 1].focus();
                } else if (e.key === 'ArrowLeft' && index > 0) {
                    boxes[index - 1].focus();
                } else if (e.key === 'ArrowRight' && index < boxes.length - 1) {
                    boxes[index + 1].focus();
                }
            });
        });


        if (resendBtn && isReset) {
            resendBtn.addEventListener('click', async () => {
                if(!email) {
                    showSwal('Email не найден resendBTN', 'error')
                    return
                }

                const resendEndpoint = isReset ? '/api/reset/resend-code' : '/api/auth/reset-code'; 
                const body = { email };

                const successCallback = () => {
                    boxes.forEach(box => box.value = '');
                    localStorage.removeItem('resetTimer');
                    startTimer(10, resendBtn);
                    resendBtn.classList.add('hidden');
                };

                await handleFormSubmit(resendEndpoint, 'POST', body, successCallback, resendBtn, 'Ошибка при переотправке кода');
            })
        }
    }



    function showSwal(message, type = 'error', callback = null) {
        Swal.fire({
            icon: type,
            title: type === 'success' ? 'Успешно' : 'Ошибка',
            text: message,
            timer: 2000,
            showConfirmButton: false,
        }).then(() => {
            if (callback) callback();
        });
    }


    function startTimer(duration, resendBtn) {
        const timeEl = $('#timer');
        const storedTime = parseInt(localStorage.getItem('resetTimer'), 10);
        
        let timeInSeconds = (!isNaN(storedTime) && storedTime > 0) ? storedTime : duration;

        if (resendBtn) {
            resendBtn.classList.toggle('hidden', timeInSeconds > 0);
        }


        const updateDisplay = () => {
            const minutes = String(Math.floor(timeInSeconds / 60)).padStart(2, '0');
            const seconds = String(timeInSeconds % 60).padStart(2, '0');
            if (timeEl) timeEl.textContent = `${minutes}:${seconds}`;
        };

        updateDisplay();

        if (window.timerInterval) {
            clearInterval(window.timerInterval);
        }

        if (timeInSeconds <= 0) {
             localStorage.removeItem('resetTimer'); 
             return;
        }

        window.timerInterval = setInterval(() => {
            timeInSeconds--;
            updateDisplay();
            localStorage.setItem('resetTimer', timeInSeconds);

            if (timeInSeconds <= 0) {
                clearInterval(window.timerInterval);
                localStorage.removeItem('resetTimer');
                if (timeEl) timeEl.textContent = '00:00';
                
                if (resendBtn) resendBtn.classList.remove('hidden');
            }
        }, 1000);
    }
})