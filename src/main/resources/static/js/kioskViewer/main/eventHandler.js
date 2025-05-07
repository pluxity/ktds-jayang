'use strict';
// TODO 버튼 상호 작용 등 을 넣으시오

const eventHandler = (function () {
    // 미니맵
    const koreanLetters = document.querySelector('.store__letters .hangul-letters');
    const consonants= document.querySelector('.store__letters .consonants');
    const numberLetters= document.querySelector('.store__letters .number');
    const toggleBtns = document.querySelectorAll('.store__buttons button');
    const letterButtons = document.querySelectorAll('.store__letters button');
    const searchInput = document.querySelector('.store__search input');
    const removeBtn = document.querySelector('.store__search .remove');
    const footerButtons = document.querySelectorAll('.kiosk-footer__buttons button[role="tab"]');
    const zoomInButton = document.querySelector('.kiosk-3d__control .plus');
    const zoomOutButton = document.querySelector('.kiosk-3d__control .minus');

    footerButtons.forEach(btn => {
        btn.addEventListener('click', () => {

            if (btn.id === 'floor_info') {
                updateKioskUIState({
                   showFloor: true
                });
            } else {
                updateKioskUIState({
                    showFloor: false
                });
                popup.createStorePopup();
            }
        });
    });

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.textContent === '한') {
                koreanLetters.style.display = window.matchMedia("(orientation: landscape)").matches ? 'block' : 'grid';
                numberLetters.style.display = window.matchMedia("(orientation: landscape)").matches ? 'block' : 'grid';
                koreanLetters.classList.add("active");
                consonants.style.display   = 'none';
                consonants.classList.remove("active");
            } else {
                consonants.style.display = window.matchMedia("(orientation: landscape)").matches ? 'inline' : 'grid';
                numberLetters.style.display = window.matchMedia("(orientation: landscape)").matches ? 'inline' : 'grid';
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

    const updateKioskUIState = (option) => {
        const {
            showFloor,
            floor
        } = option;

        const floorDiv = document.getElementById('floorInfo');
        const storeDiv = document.getElementById('storeSearch');
        const floorBtn = document.getElementById('floor_info');
        const storeBtn = document.getElementById('store_info');
        const footerPanels = document.querySelectorAll('.kiosk-footer__contents[role="tabpanel"]');

        const floorInfo = document.querySelector('.kiosk-main .kiosk-info');
        const floorList = document.querySelectorAll('#storeFloorList li');

        const storePopup = document.querySelector('.kiosk-layer__inner');

        if(showFloor) { // floor
            floorDiv.style.display = 'block';
            storeDiv.style.display = 'none';
            floorBtn.classList.add('active');
            storeBtn.classList.remove('active');
            footerPanels.forEach(panel => {
                panel.style.display = panel.getAttribute('aria-labelledby') === 'floor_info' ? '' : 'none';
            })
            floorInfo.style.display = '';
            storePopup?.remove();
        }else{ // store
            floorDiv.style.display = 'none';
            storeDiv.style.display = 'block';
            floorBtn.classList.remove('active');
            storeBtn.classList.add('active');
            footerPanels.forEach(panel => {
                panel.style.display = panel.getAttribute('aria-labelledby') === 'store_info' ? '' : 'none';
            })
            floorInfo.style.display = 'none';
            storePopup?.remove();
        }

        if(floor) {
            floorList.forEach(li => {
               if(Number(li.getAttribute('id')) === Number(floor)){
                   li.querySelector('button').classList.add('active');
                   floorInfo.innerHTML = li.querySelector('button').innerHTML;
               }else{
                     li.querySelector('button').classList.remove('active');
               }
            });
        }
    }

    return {
        updateKioskUIState
    }
})();
