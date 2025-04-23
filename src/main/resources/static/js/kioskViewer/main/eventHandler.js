'use strict';
// TODO 버튼 상호 작용 등 을 넣으시오

(function () {
    // 미니맵
    const hangulLetters = document.querySelector('.korean');
    const consonants   = document.querySelector('.consonants');
    const toggleBtns   = document.querySelectorAll('.store__buttons button');
    const letterButtons = document.querySelectorAll('.store__letters button');
    const searchInput   = document.querySelector('.store__search input');
    const removeBtn     = document.querySelector('.store__search .remove');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.textContent === '한') {
                hangulLetters.style.display = 'block';
                consonants.style.display   = 'none';
            } else {
                consonants.style.display   = 'block';
                hangulLetters.style.display = 'none';
            }
        });
    });

    letterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            letterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            searchInput.value = btn.textContent;
            removeBtn.classList.add('remove--active');
        });
    });

    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim()) {
            removeBtn.classList.add('remove--active');
        } else {
            removeBtn.classList.remove('remove--active');
        }
    });

    removeBtn.addEventListener('click', () => {
        searchInput.value = '';
        removeBtn.classList.remove('remove--active');
        letterButtons.forEach(b => b.classList.remove('active'));
    });

})();
