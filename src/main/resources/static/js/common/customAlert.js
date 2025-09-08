const alertBox = (message, detail) => {
    return new Promise((resolve) => {
        const alertEl = document.getElementById('customAlert');
        const messageEl = alertEl.querySelector('.alert__message');
        const detailEl = alertEl.querySelector('.alert__detail');
        const okBtn = alertEl.querySelector('.alert-ok');

        messageEl.innerHTML = message;
        messageEl.style.marginBottom = '10%';

        detailEl.textContent = detail || '';
        alertEl.querySelector('.alert-cancel').style.display = 'none';
        alertEl.style.display = 'block';

        const handler = () => {
            alertEl.style.display = 'none';
            okBtn.removeEventListener('click', handler);
            resolve(true);
        };

        okBtn.addEventListener('click', handler);
    });
};

// 확인/취소 있는 confirm
const confirmBox = (message) => {
    return new Promise((resolve, reject) => {
        const alertEl = document.getElementById('customAlert');
        alertEl.querySelector('.alert__message').textContent = message;
        alertEl.querySelector('.alert-cancel').style.display = 'inline-block';
        alertEl.style.display = 'block';

        const okBtn = alertEl.querySelector('.alert-ok');
        const cancelBtn = alertEl.querySelector('.alert-cancel');

        const cleanup = () => {
            alertEl.style.display = 'none';
            okBtn.removeEventListener('click', okHandler);
            cancelBtn.removeEventListener('click', cancelHandler);
        };

        const okHandler = () => {
            cleanup();
            resolve(true);
        };
        const cancelHandler = () => {
            cleanup();
            reject(false);
        };

        okBtn.addEventListener('click', okHandler);
        cancelBtn.addEventListener('click', cancelHandler);
    });
};