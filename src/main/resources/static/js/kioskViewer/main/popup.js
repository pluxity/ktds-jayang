'use strict';

const popup = (function () {

    const ITEMS_PER_PAGE = 10;
    const CHOSEONG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
    function getKeyInitial(ch) {
        if (!/[가-힣]/.test(ch)) return '';
        const code = ch.charCodeAt(0) - 0xAC00;
        return CHOSEONG[Math.floor(code / (21 * 28))];
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
            if (currentPage > 0) renderPage(currentPage - 1);
        });
        rightBtn.addEventListener('click', () => {
            if (currentPage < pages.length - 1) renderPage(currentPage + 1);
        });

        return { leftBtn, rightBtn, pagingContainer };
    };

    const renderPage = (pageIndex) => {
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
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="list__header">
                  <div
                    class="list__thumbnail"
                    role="img"
                    aria-label="${poi.detail.name} 이미지"
                    style="
                      background-image: url('${thumbnailUrl}');
                      background-position: center;
                      background-size: contain;
                      background-repeat: no-repeat;
                    "
                  ></div>
                  <div class="list__title"><p class="name">${poi.detail.name}</p></div>
                  <span class="list__desc">${poi.detail.phoneNumber || '&nbsp;'}</span>
                </div>
                <ul class="list__footer">
                  <li><button type="button" class="button">${poi.detail.floorNm}</button></li>
                  <li><button type="button" class="button button--location">위치 확인</button></li>
                </ul>
              `;
            const layer = createBanner(poi);
            li.querySelector('.button--location')
                .addEventListener('click', () => layer.style.display = 'block');
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

        leftBtn.style.display  = pageIndex > 0 ? 'block' : 'none';
        rightBtn.style.display = pageIndex < pages.length-1 ? 'block' : 'none';
    };

    const createStorePopup = async () => {
        await setFloors();
        if (!leftBtn) initPagerControls();
        await setStores('all');
    }

    const setStores = async (floorId, term = '') => {

        currentFloor = floorId;
        currentTerm = term.trim();
        const kioskPoiList = await KioskPoiManager.getKioskPoiDetailList();
        let storePoiList = kioskPoiList
            .filter(poi => poi.common?.isKiosk === false)
            .filter(poi => floorId === 'all' || `${poi.common?.floorId}` === `${floorId}`);

        if (currentTerm) {
            storePoiList = storePoiList.filter(poi => {
                const initials = Array.from(poi.detail.name)
                    .map(c => getKeyInitial(c))
                    .join('');
                return initials.includes(currentTerm);
            });
        }

        pages = [];
        for (let i = 0; i < storePoiList.length; i += ITEMS_PER_PAGE) {
            pages.push(storePoiList.slice(i, i + ITEMS_PER_PAGE));
        }

        renderPage(0);
    };

    const createBanner = (poi) => {
        const footer = document.querySelector('.kiosk-footer');
        const parent = footer.parentElement;

        const layer = document.createElement('div');
        layer.className = 'kiosk-layer';
        layer.style.display = 'none';
        const today = new Date();
        const banners = poi.detail.banners
            .filter(b => {
                if (b.isPermanent) return true;
                if (b.startDate && new Date(b.startDate) > today) return false;
                if (b.endDate   && new Date(b.endDate)   < today) return false;
                return true;
            })
            .sort((a, b) => a.priority - b.priority);
        layer.innerHTML = `
            <div class="kiosk-layer__inner">
              <div class="kiosk-layer__content">
                <button type="button" class="kiosk-layer__close"><span class="hide">숨김</span></button>
                <div class="kiosk-layer__title"><span class="name">${poi.detail.name}</span></div>
                <div class="kiosk-layer__info">
                  <dl><dt>위치</dt><dd>${poi.detail.floorNm}</dd></dl>
                  <dl><dt>연락처</dt><dd>${poi.detail.phoneNumber}</dd></dl>
                  <dl style="visibility:hidden;"><dt>영업시간</dt><dd>&nbsp;</dd></dl>
                  <dl style="visibility:hidden;"><dt>주차할인</dt><dd>&nbsp;</dd></dl>   
                </div>
              </div>
              <div class="kiosk-layer__image">
                ${banners.map((b, i) => {
                    const bf = b.bannerFile;
                    const url = `/Banner/${bf.directory}/${bf.storedName}.${bf.extension}`;
                    return `
                    <div
                      class="image"
                      style="
                          background-image: url('${url}');
                          background-position: center;
                          background-size: contain;
                          background-repeat: no-repeat;
                        "
                      role="img"
                      aria-label="${poi.detail.name} 매장 이미지 ${i + 1}"
                    ></div>
                  `;
                }).join('')}
              </div>
            </div>
          `;

        // close 버튼 이벤트
        layer.querySelector('.kiosk-layer__close')
            .addEventListener('click', () => layer.style.display = 'none');
        // document.body.appendChild(layer);
        parent.insertBefore(layer, footer.nextSibling);
        return layer;
    }

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

        const storeBuilding = await BuildingManager.getStoreBuilding();

        // slice(0. 4) 는 테스트
        storeBuilding.floors.slice(0, 4).forEach((floor, idx) => {
            const floorLi = document.createElement('li');
            floorLi.setAttribute('role', 'tab');
            floorLi.id = `${floor.id}`;
            floorLi.innerHTML = `<button type="button">${floor.name}</button>`;
            floorLi.addEventListener('click', () => {
                floorTabList.querySelectorAll('li').forEach(li => li.classList.remove('active'));
                floorLi.classList.add('active');
                setStores(`${floor.id}`);
            });
            floorTabList.appendChild(floorLi);
        })
    }

    return {
        createStorePopup,
        setStores
    }
})();

