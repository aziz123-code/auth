document.addEventListener('DOMContentLoaded', () => {
    const $ = (s) => document.querySelector(s)

    async function handleFormSubmit(endpoint, method, body, 
    successCallback, submitBtn, errorMsg = 'Ошибка сервера. Попробуйте позже') {
        const isDelete = method.toUpperCase() === 'DELETE'
        if(submitBtn) submitBtn.disabled = true

        try {
            const res = await fetch(endpoint, {
                method: method,
                headers: isDelete ? {} : {'Content-Type': 'application/json'},
                credentials: 'include',
                body: isDelete ? null : JSON.stringify(body)
            });

            const data = await res.json()

            showSwal(data.message, res.ok ? 'success' : 'error', () => {
                if(res.ok && successCallback) {
                    successCallback(data)
                }  
            })
        } catch (error) {
            showSwal(`Frontend: ${errorMsg}`, 'error')
        } finally {
            if(submitBtn) submitBtn.disabled = false
        }
    }

    async function initSecurePage() {
        const logoutBtn = $('#logout-btn')
        const deleteBtn = $('#delete-btn')

        try {
            const res = await fetch('/main/page', {
                method: 'GET',
                credentials: 'include'
            })

            if(!res.ok) {
                window.location.href = '/login'
                return
            }

        } catch (error) {
            window.location.href = '/login'
            return
        }

        logoutBtn.addEventListener('click', async () => {
                const successCallback = () => {
                    window.location.href = '/login'
                }

                await handleFormSubmit('/api/auth/logout', 'DELETE', null, successCallback, logoutBtn,  'Ошибка при выходе')
            })

            deleteBtn.addEventListener('click', async () => {
                const confirmation = await Swal.fire({
                    title: 'Вы уверены',
                    text: 'Это действие нельзя будет отменить!',
                    icon: 'warning', 
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Да, удалить!',
                    cancelButtonText: 'Отмена'
                });

                if(confirmation.isConfirmed) {
                    const successCallback = () => {
                        window.location.href = '/login'
                    }

                    await handleFormSubmit('/api/auth/delete-account', 'DELETE', null, successCallback, deleteBtn, 'Ошибка при удаление аккаунта')
                }
            });
        }

        initSecurePage()
    });

    function showSwal(message, type = 'error', callback = null) {
        Swal.fire({
            icon: type,
            title: type === 'success' ? 'Успех' : 'Ошибка',
            text: message,
            timer: 2000,
            showConfirmButton: false,
        }).then(() => {
            if (callback) callback();
        });
    }








