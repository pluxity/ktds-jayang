document.addEventListener("DOMContentLoaded", () => {
    const idInput = document.getElementById("id");
    const pwInput = document.getElementById("pw");

    // 입력 감지 및 상태 업데이트 함수
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

document.getElementById('btn_login').onclick = () => {
    const username = document.getElementById("id").value;
    const password = document.getElementById("pw").value;
    const param = {
        username: username,
        password: password
    };

    api.post('/auth/sign-in', param).then((res) => {
        window.location.href = '/viewer';
    });
}