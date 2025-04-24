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

            searchInput.value += btn.textContent;
            removeBtn.classList.add('remove--active');
        });
    });

    searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim();

        removeBtn.classList.toggle('remove--active', term.length > 0);

        document.querySelectorAll('.store__letters button')
            .forEach(b => b.classList.remove('active'));

        if (term) {
            getStoreInfo('', term);
        } else {
            getStoreInfo();
        }
    });

    removeBtn.addEventListener('click', () => {
        const val = searchInput.value;
        if (val.length > 0) {
            searchInput.value = val.slice(0, -1);
        }
        if (!searchInput.value) {
            removeBtn.classList.remove('remove--active');
            letterButtons.forEach(b => b.classList.remove('active'));
        }
    });

    const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
    function getKeyInitial(name) {
        const ch = name.charAt(0);
        if (/[가-힣]/.test(ch)) {
            const code = ch.charCodeAt(0) - 0xAC00;
            return CHO[Math.floor(code / 588)];
        }
        if (/[A-Za-z]/.test(ch)) return ch.toUpperCase();
        if (/[0-9]/.test(ch)) return ch;
        return null;
    }

    function filterDummyList(initial = '', keyword = '') {
        const kioskList = document.querySelector('.kiosk-list');
        const emptyBox  = kioskList.querySelector('.kiosk-list__info--empty');
        const infoBox   = kioskList.querySelector('.kiosk-list__info:not(.kiosk-list__info--empty)');
        const items     = kioskList.querySelectorAll('.list > ul > li');

        // 컨테이너 보이기
        kioskList.style.display = '';

        // 각 <li> 숨김/보임
        items.forEach(li => {
            const nameEl = li.querySelector('.name');
            const name   = nameEl ? nameEl.textContent.trim() : '';
            let show = true;

            if (keyword) {
                show = name.includes(keyword);
            } else if (initial) {
                show = getKeyInitial(name) === initial;
            }

            li.style.display = show ? '' : 'none';
        });

        // 빈 결과일 때 안내문 토글
        const anyVisible = Array.from(items).some(li => li.style.display !== 'none');
        if (!anyVisible) {
            emptyBox.style.display = '';
            infoBox .style.display = 'none';
        } else {
            emptyBox.style.display = 'none';
            infoBox .style.display = '';
        }
    }
    function renderStoreList2(stores) {
        const kioskList= document.querySelector('.kiosk-list');
        const emptyBox = kioskList.querySelector('.kiosk-list__info--empty');
        const listBox = kioskList.querySelector('.kiosk-list__info:not(.kiosk-list__info--empty)');
        const ul = listBox.querySelector('.list > ul');
        kioskList.style.display = '';

        if (stores.length === 0) {
            emptyBox.style.display = '';
            listBox.style.display  = 'none';
            return;
        }

        emptyBox.style.display = 'none';
        listBox.style.display = '';

        // 테스트 후 추가예정
        ul.innerHTML = '';

        stores.forEach(s => {
            const li = document.createElement('li');
            li.innerHTML = `
              <div class="list__header">
                <div class="list__thumbnail"
                     style="background-image:url(${s.imageUrl || '/static/img/default.png'})"
                     role="img"
                     aria-label="${s.name} 이미지"></div>
                <div class="list__title">
                  <p class="name">${s.name}</p>
                </div>
                <span class="list__desc">${s.phoneNumber || ''}</span>
              </div>
              <ul class="list__footer">
                <li>
                  <button type="button" class="button">${s.floor || '정보 없음'}</button>
                </li>
                <li>
                  <button type="button" class="button button--location">위치 확인</button>
                </li>
              </ul>
            `;
            ul.appendChild(li);
        });
    }

    async function getStoreInfo (initial = '', keyword = '') {
        const stores = await PoiManager.getPoiList();
        let filtered = stores;

        if (keyword.trim()) {
            filtered = stores.filter(s => s.name.includes(keyword.trim()));
        } else if (initial) {
            filtered = stores.filter(s => getKeyInitial(s.name) === initial);
        }

        renderStoreList(filtered);
    }

})();
