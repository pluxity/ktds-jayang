'use strict';
// TODO 버튼 상호 작용 등 을 넣으시오

(function () {
    // 미니맵
    const koreanLetters = document.querySelector('.store__letters .hangul-letters');
    const consonants= document.querySelector('.store__letters .consonants');
    const toggleBtns = document.querySelectorAll('.store__buttons button');
    const letterButtons = document.querySelectorAll('.store__letters button');
    const searchInput = document.querySelector('.store__search input');
    const removeBtn = document.querySelector('.store__search .remove');

    const footerButtons = document.querySelectorAll('.kiosk-footer__buttons button[role="tab"]');
    const footerPanels = document.querySelectorAll('.kiosk-footer__contents[role="tabpanel"]');
    const floorDiv = document.getElementById('floorInfo');
    const kioskList = document.querySelector('.kiosk-list');
    const kioskInfo = document.querySelector('.kiosk-main .kiosk-info');
    const searchStoreSpan = document.getElementById("kioskInfoSpan");

    const zoomInButton = document.querySelector('.kiosk-3d__control .plus');
    const zoomOutButton = document.querySelector('.kiosk-3d__control .minus');

    footerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            footerButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            footerPanels.forEach(panel => {
                const labelled = panel.getAttribute('aria-labelledby');
                panel.style.display = (labelled === btn.id) ? '' : 'none';
            });

            if (btn.id === 'floor_info') {
                floorDiv.style.display = '';
                kioskInfo.style.display = '';
                searchStoreSpan.style.display = 'none';
                kioskList.style.display = 'none';
            } else {
                const existPoiPopup = document.querySelector('.kiosk-layer__inner.floorInfo__inner')
                if (existPoiPopup) {
                    existPoiPopup.remove();
                }
                document.querySelectorAll('.store__letters button')
                    .forEach(btn => btn.classList.remove("active"))
                floorDiv.style.display = 'none';
                kioskInfo.style.display = 'none';
                searchStoreSpan.style.display = '';
                kioskList.style.display = 'block';
                document.querySelector('.store__search input').value = '';
                popup.createStorePopup();
            }
        });
    });
    const letters = document.querySelector('.store__letters');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.textContent === '한') {
                koreanLetters.style.display = 'block';
                koreanLetters.classList.add("active");
                consonants.style.display = 'none';
                consonants.classList.remove("active");
            } else {
                consonants.style.display = 'block';
                consonants.classList.add("active");
                koreanLetters.style.display = 'none';
                koreanLetters.classList.remove("active");
            }
        });
    });

    letterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            letterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            searchInput.value += btn.textContent;
            removeBtn.classList.add('remove--active');
            const floorId = document.querySelector('.kiosk-list__tab li.active').id;
            popup.setStores(floorId, searchInput.value.trim());
        });
    });

    searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim();

        removeBtn.classList.toggle('remove--active', term.length > 0);

        document.querySelectorAll('.store__letters button')
            .forEach(b => b.classList.remove('active'));
        const floorId = document.querySelector('.kiosk-list__tab li.active').id;
        popup.setStores(floorId, term);
    });

    removeBtn.addEventListener('click', () => {
        if (searchInput.value) {
            searchInput.value = searchInput.value.slice(0, -1);
        }
        const term = searchInput.value.trim();
        removeBtn.classList.toggle('remove--active', term.length > 0);
        if (!term) {
            letterButtons.forEach(b => b.classList.remove('active'));
        }
        const floorId = document.querySelector('.kiosk-list__tab li.active').id;
        popup.setStores(floorId, term);

    });

    const addZoomEventListener = (button, startAction, stopAction) => {
        button.addEventListener('touchstart', startAction);
        button.addEventListener('mousedown',startAction);
        button.addEventListener('touchend', stopAction);
        button.addEventListener('mouseup',stopAction);
    };

    addZoomEventListener(zoomInButton,
        () => Px.Camera.StartZoomIn(),
        () => Px.Camera.StopZoomIn()
    );

    addZoomEventListener(zoomOutButton,
        () => Px.Camera.StartZoomOut(),
        () => Px.Camera.StopZoomOut()
    );
})();
