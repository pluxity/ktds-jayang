document.addEventListener("DOMContentLoaded", () => {
    const idInput = document.getElementById("id");
    const pwInput = document.getElementById("pw");

    const updateErrorState = (input, errorClass) => {
        const parentDiv = input.closest(`.${errorClass}`);
        const errorText = parentDiv.querySelector(".input-error__text");

        if (input.value.trim() === "") {
            parentDiv.classList.add("input-error--active");
            errorText.style.display = "block";
        } else {
            parentDiv.classList.remove("input-error--active");
            errorText.style.display = "none";
        }
    };

    // 이벤트 리스너 추가
    idInput.addEventListener("input", () => updateErrorState(idInput, "input-error"));
    pwInput.addEventListener("input", () => updateErrorState(pwInput, "input-error"));
});

let loginFailCnt = 0;
function doLogin() {
    const username = document.getElementById("id").value;
    const password = document.getElementById("pw").value;
    const failMessage = document.querySelector('.login-footer__warning');
    const param = {
        username: username,
        password: password
    };

    api.post('/auth/sign-in', param)
        .then((res) => {
            if (res.data?.result.username.toLowerCase() === 'admin') {
                window.location.href = '/admin/building/indoor';
            } else {
                window.location.href = '/viewer';
            }
        })
        .catch((err) => {
            loginFailCnt++;
            failMessage.style.display = 'block';
            failMessage.innerHTML = `
                로그인 정보가 일치하지 않습니다.<br>
                5회 이상 불일치 시 로그인이 제한됩니다.(${loginFailCnt}/5)
            `;
        });
}
document.getElementById('btn_login').onclick = doLogin;

const inputFields = document.querySelectorAll('#id, #pw');
inputFields.forEach(input => {
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            doLogin();
        }
    });
});