document.getElementById('btn_login').onclick = () => {
    const username = document.getElementById("id").value;
    const password = document.getElementById("pw").value;
    const param = {
        username: username,
        password: password
    };

    api.post('/auth/sign-in', param).then((res) => {
        localStorage.setItem('accessToken', res.data.result.accessToken);
        localStorage.setItem('refreshToken', res.data.result.refreshToken);
        window.location.href = '/admin/system-setting';
    });
}