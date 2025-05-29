'use strict';

const popup = (function () {

    const ITEMS_PER_PAGE = 10;
    const CHOSEONG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
    function getKeyInitial(ch) {
        // 숫자
        if (/[0-9]/.test(ch)) return ch;
        // 영문
        if (/[a-zA-Z]/.test(ch)) return ch.toLowerCase();
        // 한글
        if (/[가-힣]/.test(ch)) {
            const code = ch.charCodeAt(0) - 0xAC00;
            return CHOSEONG[Math.floor(code / (21 * 28))];
        }

        return '';
    }
    let pages = [];
    let currentPage = 0;
    let leftBtn, rightBtn, pagingContainer;
    let currentFloor = 'all';
    let currentTerm = '';

    const initPagerControls = () => {
        leftBtn = document.querySelector('.kiosk-list__button--left');
        rightBtn = document.querySelector('.kiosk-list__button--right');
        pagingContainer = document.querySelector('.kiosk-list__paging');

        leftBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                renderPage(currentPage - 1);
            } else {
                renderPage(pages.length - 1);
            }
        });
        rightBtn.addEventListener('click', () => {
            if (currentPage < pages.length - 1) {
                renderPage(currentPage + 1);
            } else {
                renderPage(0)
            }
        });

        return { leftBtn, rightBtn, pagingContainer };
    };

    const renderPage = (pageIndex) => {
        document.querySelectorAll('.kiosk-layer').forEach(el => el.remove());
        currentPage = pageIndex;
        const emptyInfo = document.querySelector('.kiosk-list__info--empty');
        const listInfo  = document.querySelector('.kiosk-list__info:not(.kiosk-list__info--empty)');
        const storeList = document.getElementById('storeList');

        if (pages.length === 0) {
            emptyInfo.style.display = 'block';
            listInfo.style.display  = 'none';
            return;
        } else {
            emptyInfo.style.display = 'none';
            listInfo.style.display  = 'flex';
            storeList.innerHTML = '';
        }
        storeList.innerHTML = '';
        pages[pageIndex].forEach(poi => {
            let thumbnailUrl;
            if (poi.detail.logoFile) {
                const { directory, storedName, extension } = poi.detail.logoFile;
                thumbnailUrl = `/Logo/${directory}/${storedName}.${extension}`;
            } else {
                thumbnailUrl = '/static/img/kiosk/img_kiosk_thumb.svg';
            }
            const nameMap = {
                B2: 'B1',
                B1: 'G1'
            };

            const floor = BuildingManager.findFloorsByHistory().find(
                (floor) => floor.no === Number(poi.detail.floorNo),
            );

            const displayName = nameMap[floor.name] || floor.name;

            const li = document.createElement('li');
            li.innerHTML = `
                <div class="list__header">
                  <div
                    class="list__thumbnail"
                    role="img"
                    aria-label="${poi.common.name} 이미지"
                    style="
                      background-image: url('${thumbnailUrl}');
                      background-position: center;
                      background-size: contain;
                      background-repeat: no-repeat;
                    "
                  ></div>
                  <div class="list__title"><p class="name">${poi.common.name}</p></div>
                  <span class="list__desc">${poi.detail.phoneNumber || '&nbsp;'}</span>
                </div>
                <ul class="list__footer">
                  <li><button type="button" class="button">${displayName}</button></li>
                  <li><button type="button" class="button button--location" data-poi-id="${poi.common.id}" data-floor-id="${poi.common.floorNo}">위치 확인</button></li>
                </ul>
              `;
            // const layer = createBanner(poi);
            li.querySelector('.button--location')
                .addEventListener('click', () => {

                    eventHandler.updateKioskUIState({
                        showFloor: true,
                        floor: poi.common.floorNo
                    });
                    popup.showPoiPopup(poi.common);
                    Init.moveToKiosk(poi.common);
                });
            storeList.appendChild(li);
        });

        pagingContainer.innerHTML = '';
        pages.forEach((_, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'button' + (idx === pageIndex ? ' button--active' : '');
            btn.innerHTML = `<span class="hide">page${idx+1}</span>`;
            pagingContainer.appendChild(btn);
        });

        // leftBtn.style.display  = pageIndex > 0 ? 'inline-block' : 'none';
        // rightBtn.style.display = pageIndex < pages.length-1 ? 'inline-block' : 'none';
    };

    const createStorePopup = async () => {
        await setFloors();
        if (!leftBtn) initPagerControls();
        const searchInput = document.querySelector('.store__search input');
        const term = searchInput.value.trim();
        await setStores('all', term);
    }

    let cachedStoreList = [];
    const setStores = async (floorNo, term = '') => {

        const searchInput = document.querySelector('.store__search input');
        term = searchInput?.value.trim();

        const floor = BuildingManager.findFloorsByHistory().find(
            (floor) => floor.no === Number(floorNo),
        );
        if (floor) {
            currentFloor = floor.id;
        }
        currentTerm = term.trim().toLowerCase();
        if (floorNo === 'all') {
            const kioskPoiList = await KioskPoiManager.getKioskPoiDetailList();
            cachedStoreList = kioskPoiList
                .filter(poi => poi.common?.position != null)
                .filter(poi => poi.common?.isKiosk === false);
        }
        let storePoiList = floorNo === 'all'
            ? cachedStoreList
            : cachedStoreList.filter(poi => `${poi.common.floorNo}` === `${floorNo}`);

        if (currentTerm) {
            storePoiList = storePoiList.filter(poi => {
                const initials = Array.from(poi.common.name)
                    .map(c => getKeyInitial(c))
                    .join('');
                return initials.includes(currentTerm);
            });
        }
        pages = [];
        const ITEMS_PER_PAGE = window.matchMedia("(orientation: landscape)").matches ? 10 : 6;

        for (let i = 0; i < storePoiList.length; i += ITEMS_PER_PAGE) {
            pages.push(storePoiList.slice(i, i + ITEMS_PER_PAGE));
        }

        renderPage(0);
    };

    const setFloors = async () => {
        const storeSearch = document.getElementById("storeSearch");
        const floorTabList = storeSearch.querySelector(".kiosk-list__tab");
        floorTabList.innerHTML = '';
        const allFloorLi = document.createElement('li');
        allFloorLi.className = 'all active';
        allFloorLi.setAttribute('role', 'tab');
        allFloorLi.id = 'all';
        allFloorLi.innerHTML = '<button type="button">전층</button>';
        allFloorLi.addEventListener('click', () => {
            floorTabList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            allFloorLi.classList.add('active');
            setStores('all');
        });
        floorTabList.appendChild(allFloorLi);

        const storeBuilding = await BuildingManager.findStore();
        const kioskSet = new Set(['B2','B1','1F','2F']);
        const nameMap = {
            B2: 'B1',
            B1: 'G1'
        };
        const version = storeBuilding.getVersion()
        const floors = BuildingManager.findFloorsByHistory();
        floors
            .filter(floor => kioskSet.has(floor.name))
            .forEach((floor, idx) => {
            const floorLi = document.createElement('li');
            floorLi.setAttribute('role', 'tab');
            floorLi.id = `${floor.no}`;
            const displayName = nameMap[floor.name] || floor.name;
            floorLi.innerHTML = `<button type="button">${displayName}</button>`;
            floorLi.addEventListener('click', () => {
                floorTabList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                floorLi.classList.add('active');
                setStores(`${floor.no}`);
            });
            floorTabList.appendChild(floorLi);
        })
    }

    const showPoiPopup = (poiInfo) => {
        if(document.querySelector('.floorInfo__inner')){
            document.querySelector('.floorInfo__inner').remove();
        }
        if(!poiInfo.property?.isKiosk){
            const id = poiInfo.id;
            const floorNm = document.querySelector('.kiosk-info').innerText;
            api.get(`/kiosk/${id}`).then((res) => {
                const { result: resultData } = res.data;
                const layer = document.createElement('div');
                layer.classList.add("kiosk-layer__inner");
                layer.classList.add("floorInfo__inner")
                layer.innerHTML = `
                <div class="kiosk-layer__content">
                    <button type="button" class="kiosk-layer__close"><span class="hide">숨김</span></button>
                    <div class="kiosk-layer__title"><span class="name">${resultData.name}</span></div>
                    <div class="kiosk-layer__info">
                        <dl><dt>위치</dt><dd>${floorNm || ''}</dd></dl>
                        <dl><dt>연락처</dt><dd>${resultData.store.phoneNumber || ''}</dd></dl>
                        <dl style="visibility:hidden;"><dt>영업시간</dt><dd>&nbsp;</dd></dl>
                        <dl style="visibility:hidden;"><dt>주차할인</dt><dd>&nbsp;</dd></dl>   
                    </div>
                </div>
                <div class="kiosk-layer__image">
                    ${resultData.store.banners
                    .sort((a, b) => a.priority - b.priority)
                    .filter(banner => !banner.endDate || new Date(banner.endDate) >= new Date())
                    .map(banner => {
                        const bf = banner.bannerFile;
                        const imageUrl = `${bf.fileEntityType}/${bf.directory}/${bf.storedName}.${bf.extension}`;
                        return `
                                <div
                                    class="image"
                                    style="
                                        background-image: url('${imageUrl}');
                                        background-position: center;
                                        background-size: contain;
                                        background-repeat: no-repeat;
                                    "
                                    role="img"
                                    aria-label="${resultData.name} 이미지 ${banner.id}"
                                ></div>
                            `;
                    }).join('')}
                </div>
            `;

                // 기존 내용 제거 후 새로운 layer 추가
                document.body.appendChild(layer);

                // close 버튼 이벤트 리스너 추가
                layer.querySelector('.kiosk-layer__close').addEventListener('click', () => {
                    layer.remove();
                });
            });
        }

    }

    return {
        createStorePopup,
        setStores,
        showPoiPopup
    }
})();

