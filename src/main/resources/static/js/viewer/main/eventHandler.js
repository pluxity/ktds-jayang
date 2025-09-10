'use strict';
// TODO 버튼 상호 작용 등 을 넣으시오

(function () {

    // 장비보기 클릭 > popup
    const equipmentGroup = document.querySelectorAll('.equip-group a');
    equipmentGroup.forEach(equipment => {
        equipment.addEventListener('click', function (event) {
            event.preventDefault();
            let categoryId = event.target.getAttribute('data-category-id');
            if (event.target.classList.contains('active')) {
                event.target.classList.remove('active');
                Px.Poi.HideByProperty("poiCategoryId", Number(categoryId));
            } else {
                event.target.classList.add('active');
                Px.Poi.ShowByProperty("poiCategoryId", Number(categoryId));
            }
        });
    });
    // menu list click
    const poiMenuList = document.querySelectorAll('.poi-menu__list .default_group li');
    const selectBtn = document.querySelectorAll('.select-box__btn');
    const searchText = document.querySelector('input[name="searchText"]');
    poiMenuList.forEach(item => {
        item.addEventListener('click', function (event) {
            event.preventDefault();
            if (searchText && searchText.value.trim() !== '') {
                searchText.value = '';
            }

            const clickedItem = event.target.closest('li');
            if (clickedItem.classList.contains('active')) {
                clickedItem.classList.remove('active');
            } else {
                clickedItem.classList.add('active');
            }
            poiMenuList.forEach(li => {
                if (li !== clickedItem) {
                    li.classList.remove('active');
                }
            });
            selectBtn.forEach(btn => {
                if (btn.classList.contains('select-box__btn--active')) {
                    btn.classList.remove('select-box__btn--active');
                }
            })

            let name = clickedItem.className;

            let title = clickedItem.querySelector('span').textContent;
            let id = clickedItem.getAttribute('data-category-id');
            const viewResult = document.querySelector('#viewerResult');
            viewResult.setAttribute('data-category-id', id);
            const poiList = PoiManager.findAll();
            const filteringPoiList = poiList.filter(poi => poi.poiCategory === Number(id));
            layerPopup.setCategoryData(title, filteringPoiList);
        });
    });

    // profile btn
    const profileBtn = document.querySelector('.header__info .profile .profile__btn');
    profileBtn.addEventListener('click', () => {
        if (profileBtn.classList.contains('profile__btn--active')) {
            profileBtn.classList.remove('profile__btn--active')
        } else {
            profileBtn.classList.add('profile__btn--active');
        }
    })


    const noticePopup = document.querySelector('.header__info .profile #notice');
    const noticeAlert = document.getElementById('noticeAlert');
    noticePopup.addEventListener('click', async function () {
        const noticeList = await NoticeManager.getNotices();
        if (noticeList.length === 0) {
            noticeAlert.style.display = 'flex'
            noticeAlert.style.position = 'absolute';
            noticeAlert.style.top = '50%';
            noticeAlert.style.left = '50%';
            noticeAlert.style.transform = 'translate(-50%, -50%)';
            noticeAlert.style.zIndex = '30';
            const closeButton = noticeAlert.querySelector('button');
            closeButton.removeAttribute('disabled');
            closeButton.addEventListener('click', function () {
                noticeAlert.style.display = 'none';
            });
        } else {
            const popup = document.getElementById('noticePopup');
            popup.style.display = 'inline-block';
            popup.style.position = 'absolute';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.zIndex = '30';

            layerPopup.pagingNotice(noticeList, 1);
        }
    });

    // event 관련
    (async function initializeEvent(){
        await Promise.all([
            EventManager.initializeProcessChart(),
            EventManager.initializeDateChart(),
            EventManager.initializeLatest24HoursList(20)
        ]);

        EventManager.eventState();
        EventManager.initializeAlarms();

    })();

    // 추 후 공통으로 합칠 예정
    function createSseConnection(url, eventName, onEvent, onError) {
        const eventSource = new EventSource(url);

        eventSource.addEventListener(eventName, (event) => {
            try {
                const data = JSON.parse(event.data);
                onEvent(data);
            } catch (err) {
                console.error("SSE 이벤트 데이터 파싱 오류:", err);
            }
        });

        eventSource.onerror = (error) => {
            if (typeof onError === 'function') {
                onError(error);
            } else {
                console.error("SSE 오류 발생:", error);
            }
        };

        return eventSource;
    }

    // 여기서 popup 1회 호출(
    const sse = createSseConnection(
        '/sse/notice',
        'notice',
        function (notice) {
            const popup = document.getElementById('noticePopup');
            popup.style.display = 'inline-block';
            popup.style.position = 'absolute';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.zIndex = '999';

            layerPopup.pagingNotice([notice], 1);
        },
        function (error) {
            console.error('SSE Connection Error:', error);
        }
    );

    const eventStateBtn = document.querySelector(".event-state__title .event-state__button");
    eventStateBtn.addEventListener('click', async event => {
        await layerPopup.createEventPopup(true);
    });

    const systemTabs = document.querySelectorAll('.system_group li');

    // system tab
    const systemPopup = document.getElementById('systemPopup');
    const systemPopView = () => {
        systemTabs.forEach(tab => {
            tab.addEventListener('click', (event) => {
                handleSystemTabClick(event);
            })
        })
    }
    const elevatorPop = document.getElementById('elevatorPop');
    const lightPop = document.getElementById('lightPop');
    const energyPop = document.getElementById('energyPop');
    const airPop = document.getElementById('airPop');
    const parkingPop = document.getElementById('parkingPop');
    const electricPop = document.getElementById('electricPop');
    // 하단 systemTab handle
    const handleSystemTabClick = (event) => {
        const clickedItem = event.target.closest('li');
        const isActive = clickedItem.classList.contains('active');

        const closeAllPopups = () => {
            ['lightPop', 'elevatorPop', 'parkingPop', 'airPop', 'energyPop', 'electricPop'].forEach(id => {
                const popup = document.getElementById(id);
                if (popup) {
                    if (popup.id.startsWith('light')) {
                        popup.querySelector('.section__detail').innerHTML = '';
                    }
                    popup.style.display = 'none';
                }
            });
            systemPopup.style.display = 'none';
            systemTabs.forEach(tab => {
                tab.classList.remove('active')
            });
            // layerPopup.clearAllIntervals();
            layerPopup.closePlayers()
        };

        

        const currentPopup = document.getElementById('systemPopup');
        document.querySelectorAll(".popup-basic").forEach(element => {
            if (element !== currentPopup) {
                element.style.display = 'none';
                document.querySelectorAll("#poiMenuList ul li, #poiMenuListMap ul li").forEach(li => {
                    li.classList.remove("active");
                })
            }
        });

        if (isActive) {
            closeAllPopups();
            return;
        }

        closeAllPopups();
        clickedItem.classList.add('active');

        systemPopup.style.position = 'absolute';
        systemPopup.style.top = '50%';
        systemPopup.style.left = '50%';
        systemPopup.style.transform = 'translate(-50%, -50%)';
        systemPopup.style.display = 'inline-block';
        const actions = {
            lightTab: () => {
                console.log("lightTab");
                layerPopup.setLight();
                lightPop.querySelector('.popup-basic__head h2').textContent = clickedItem.textContent;
                lightPop.style.display = 'block';
            },
            elevatorTab: async () => {
                showLoading("승강기 정보를 불러오는 중입니다...");
                try{
                    await api.get('/api/tags/elevator/add');
                    await layerPopup.setElevator();

                    const elevatorTab = document.querySelector('.elevator-tab');
                    const escalatorTab = document.querySelector('.escalator-tab');
                    const elevatorContent = document.getElementById('elevatorContent');
                    const escalatorContent = document.getElementById('escalatorContent');

                    initPopup(elevatorPop, clickedItem);
                    registerTabHandlers({
                        firstTab: elevatorTab,
                        secondTab: escalatorTab,
                        firstContent: elevatorContent,
                        secondContent: escalatorContent,
                    });

                }finally {
                    hideLoading();
                }
            },
            parkingTab: () => {

                const guideTab = document.querySelector('.parking-guide-tab');
                const monitorTab = document.querySelector('.parking-monitor-tab');
                const guideContent = document.getElementById('parkingGuideContent');
                const monitorContent = document.getElementById('parkingMonitorContent');

                initPopup(parkingPop, clickedItem);
                // registerTabHandlers({
                //     firstTab: guideTab,
                //     secondTab: monitorTab,
                //     firstContent: guideContent,
                //     secondContent: monitorContent
                // });
                layerPopup.resetParkingFilterUI();
                layerPopup.setParking();
            },
            airTab: async () => {
                showLoading("에어컨 정보를 불러오는 중입니다...");
                try{
                    await layerPopup.loadAircons();
                    layerPopup.setAirTab();
                    initPopup(airPop, clickedItem);
                }finally {
                    hideLoading();
                }
            },
            energyTab: () => {
                console.log("energyTab");
                energyPop.querySelector('.popup-basic__head h2').textContent = clickedItem.textContent;
                energyPop.style.display = 'block';
            },
            electricTab: () => {
                console.log("electricTab");
                electricPop.querySelector('.popup-basic__head h2').textContent = clickedItem.textContent;
                electricPop.style.display = 'block';
            }
        };
        const matchedAction = Object.keys(actions).find(action => clickedItem.id === action);

        if (matchedAction) {
            actions[matchedAction]();
        }
    }

    const registerTabHandlers = (option) => {
        const  {
            firstTab,
            secondTab,
            firstContent,
            secondContent
        } = option;

        const clearActiveBtns = (container) => {
            container.querySelectorAll('.select-box__btn--active')
                .forEach(btn => btn.classList.remove('select-box__btn--active'));
        }

        firstTab.addEventListener('click', () => {
            switchTab(firstTab, secondTab, firstContent, secondContent);
            clearActiveBtns(secondContent);
            layerPopup.setElevator();
        });

        secondTab.addEventListener('click', () => {
            switchTab(secondTab, firstTab, secondContent, firstContent);
            clearActiveBtns(firstContent);
            layerPopup.setEscalator();
        });

        // 초기 상태 설정
        switchTab(firstTab, secondTab, firstContent, secondContent);
        // layerPopup.setElevator();
    };

    const initPopup = (popup, clickedItem) => {
        console.log("viewer initPoup")
        popup.querySelector('.popup-basic__head h2').textContent = clickedItem.textContent;
        popup.style.display = 'block';
    };

    const switchTab = (activeTab, inactiveTab, activeContent, inactiveContent) => {
        activeTab.classList.add('active');
        inactiveTab.classList.remove('active');
        activeContent.style.display = 'block';
        inactiveContent.style.display = 'none';
    };

    systemPopView();
})();
