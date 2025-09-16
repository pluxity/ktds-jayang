let userInfoData;

const getUserInfo = (onComplete) => {
    api.get('/users/me').then((res) => {
        userInfoData = res.data.result;
        console.log("userInfoData : ", userInfoData);
        if(onComplete) onComplete();
    });
}


function renderUserInfoTable() {

    document.getElementById("user-id").textContent = userInfoData.username;
    document.getElementById("user-name").textContent = userInfoData.name;
    document.getElementById("user-group").textContent = userInfoData.groupName;
}

function getCookie(name){
    const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? match.pop() : '';
}

function changePassword() {
    const currentPasswd = document.getElementById("currentPasswd").value.trim();
    const newPasswd = document.getElementById("newPasswd").value.trim();
    const newPasswdConfirm = document.getElementById("newPasswdConfirm").value.trim();
    const error = document.getElementById('passwordErr');

    if (!currentPasswd)  return alertSwal('현재 비밀번호를 입력하세요.');
    if (!newPasswd)  return alertSwal('변경 비밀번호를 입력하세요.');
    if (!newPasswdConfirm) return alertSwal('변경 비밀번호를 재입력하세요.');
    if (newPasswd !== newPasswdConfirm) return alertSwal('입력한 비밀번호가 일치하지 않습니다.');

    const okLength = newPasswd.length >= 8 && newPasswd.length <= 16;
    const okPattern = /^[a-zA-Z0-9!@#$%^&*()_+=\-]+$/.test(newPasswd);
    if (!okLength || !okPattern) return alertSwal('비밀번호는 8~16자리 영문, 숫자,\n특수문자 조합으로 설정하세요.');

    error.style.display = 'none';

    const params = {
        currentPassword: currentPasswd,
        newPassword: newPasswd,
        confirmPassword: newPasswdConfirm
    };
    api.post('/users/me/password', params)
        .then(() => {
            bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'))?.hide();
            alertSwal('비밀번호가 변경되었습니다.\n다시 로그인해 주세요.')
                .then(() => api.post('/logout'))
                .then(() => location.replace('/login'))
                .catch(() => location.replace('/login'));
        })
        .catch(e => {
            const msg = e?.response?.data?.message || '비밀번호 변경 실패';
            if (msg.includes('현재 비밀번호')) return alertSwal('현재 비밀번호가 올바르지 않습니다.');
            err.textContent = msg; err.style.display = 'block';
        });
}

document.addEventListener(
    'keydown',
    function (event) {
        if (event.code === 'Enter') {
            getUserInfo();
        }
    },
    true,
);

getUserInfo(() => {
    renderUserInfoTable();
});