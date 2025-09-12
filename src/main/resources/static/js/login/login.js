document.addEventListener("DOMContentLoaded", () => {
    const idInput = document.getElementById("id");
    const pwInput = document.getElementById("pw");

    const updateErrorState = (input, errorClass) => {
        const parentDiv = input.closest(`.${errorClass}`);
        const errorText = parentDiv.querySelector(".input-error__text");

        if (!(input.value.trim() === "")) {
            parentDiv.classList.remove("input-error--active");
            errorText.style.display = "none";
        }
    };

    // 이벤트 리스너 추가
    idInput.addEventListener("input", () => updateErrorState(idInput, "input-error"));
    pwInput.addEventListener("input", () => updateErrorState(pwInput, "input-error"));
});

function doLogin() {
    const username = document.getElementById("id").value.trim();
    const password = document.getElementById("pw").value.trim();
    const failMessage = document.querySelector('.login-footer__warning');
    let pwErrorDiv = document.getElementById("pw").closest(".input-error");
    let idErrorDiv = document.getElementById("id").closest(".input-error");

    // 에러 메시지 초기화
    failMessage.style.display = 'none';
    failMessage.innerHTML = '';

    // 입력값 검증
    let hasError = false;

    if (username === "") {
        idErrorDiv.classList.add("input-error--active");
        idErrorDiv.querySelector(".input-error__text").style.display = "block";
        hasError = true;
    }

    if (password === "") {
        pwErrorDiv.classList.add("input-error--active");
        pwErrorDiv.querySelector(".input-error__text").style.display = "block";
        hasError = true;
    }

    // 입력값이 없으면 API 호출하지 않음
    if (hasError) {
        return;
    }

    const param = {
        username: username,
        password: password
    };

    // API 호출
    api.post('/auth/sign-in', param, {
        headers: { 'X-Skip-Error-Alert': 'true' }
    }).then((res) => {
        window.location.href = '/viewer';
    }).catch((err) => {
        idErrorDiv.classList.add("input-error--active");
        pwErrorDiv.classList.add("input-error--active");
        failMessage.style.display = 'block';
        failMessage.innerHTML = `
            로그인 정보가 일치하지 않습니다.<br>
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