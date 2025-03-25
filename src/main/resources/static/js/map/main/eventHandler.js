'use strict';
// TODO 버튼 상호 작용 등 을 넣으시오

(function () {
    const locationPath = window.location.pathname;
    // 미니맵
    const zoomInButton = document.querySelector('.tool-box__list .plus');
    const zoomOutButton = document.querySelector('.tool-box__list .minus');
    const homeButton = document.querySelector('.tool-box__list .home');
    const firstViewButton = document.querySelector('.tool-box__list .pov');
    const camera2D = document.querySelector('.tool-box__list .twd');

    let categoryList = [];

    const defaultStyle = ['bg-gray-100', 'border-gray-70'];
    const activeStyle = ['bg-primary-80', 'border-primary-60'];

    const headerTabList = document.querySelector('.header__tab');

    const equipmentList = document.querySelector('#toggle-menu');
    const equipmentListPop = document.getElementById('equipmentListPop');
    const equipGroupLinks = document.querySelectorAll('#equipmentListPop .equip-group a');

    const poiMenuList = document.querySelectorAll('.poi-menu__list li');
    const selectBtn = document.querySelectorAll('.select-box__btn');
    const searchText = document.querySelector('input[name="searchText"]');

    const equipmentGroup = document.querySelectorAll('.equip-group a');

    const closeButtons = document.querySelectorAll('.popup-basic .close');
    const popup = document.getElementById('layerPopup');
    const systemTabs = document.querySelectorAll('.system-tap li');
    
    // 팝업 close
    const closePop = () => {
        const subPopupList = ['elevatorPop', 'equipmentPop']
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                Px.VirtualPatrol.Clear();
                const target = event.target.closest('.popup-basic');
                layerPopup.closePlayers()
                target.style.display = 'none';
                const hasSubPopup = subPopupList.some(subId => target.querySelector(`#${subId}`));
                if (hasSubPopup) {
                    subPopupList.forEach(subId => {
                        const subPopup = target.querySelector(`#${subId}`);
                        if (subPopup) {
                            subPopup.style.display = 'none';
                            systemTabs.forEach(tab => {
                                tab.classList.remove('active')
                            });
                        }
                    });
                }
            });
        })
    }

    // header tab활성화
    const initTab = () => {
        headerTabList.addEventListener('click', (event) => {
            const headerTab = event.target.closest('li');
            const buildingId = headerTab.getAttribute('data-building-id');
            window.location.href = `/map?buildingId=${buildingId}`;

            // init할때..
            if (headerTab && headerTabList.contains(headerTab)) {
                event.preventDefault();

                headerTabList.querySelectorAll('li').forEach((tab) => {
                    tab.classList.remove('active');
                });
                headerTab.classList.add('active');

                if (buildingId) {
                    getBuilding(buildingId);
                }
            }
        });
    }

    const getBuildingId = () =>{
        const activeTab = headerTabList.querySelector("li.active");
        if(activeTab){
            return activeTab.getAttribute("data-building-id");
        }
        return null;
    }

    const viewEquipment = () => {
        equipmentGroup.forEach(equipment => {
            equipment.removeEventListener('click', handleEquipmentClick);
            equipment.addEventListener('click', handleEquipmentClick);
        });
    }

    const handleEquipmentClick = (event) => {
        event.preventDefault();
        const categoryId = Number(event.target.getAttribute('data-category-id'));
        const floor = document.querySelector('#floor-info .floor-info__detail ul li.active');
        const floorId = floor ? Number(floor.getAttribute('floor-id')) : null;
        const isActive = event.target.classList.toggle('active');

        if (floorId !== null) {
            if (isActive) {
                Px.Poi.ShowByPropertyArray({ "floorId": floorId, "poiCategoryId": categoryId });
            } else {
                Px.Poi.HideByPropertyArray({ "floorId": floorId, "poiCategoryId": categoryId });
            }
        } else {
            if (isActive) {
                Px.Poi.ShowByProperty("poiCategoryId", categoryId);
            } else {
                Px.Poi.HideByProperty("poiCategoryId", categoryId);
            }
        }
    }

    const viewEquipmentList = () => {
        equipmentList.addEventListener('click', (event) => {
            if (equipmentListPop.style.display === 'none') {
                equipmentListPop.style.display = 'inline-block';
                categoryList = PoiCategoryManager.findAll();
                equipGroupLinks.forEach(link => {
                    const linkClass = link.className.toLowerCase();
                    const matchedCategory = categoryList.find(category =>
                        category.name.toLowerCase() === linkClass);

                    if (matchedCategory) {
                        link.setAttribute('data-category-id', matchedCategory.id);
                    }
                });
            } else {
                equipmentListPop.style.display = 'none';
            }
        })
    }

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
    const equipmentPop = document.getElementById('equipmentPop');
    // 하단 systemTab handle
    const handleSystemTabClick = (event) => {
        const clickedItem = event.target.closest('li');
        const isActive = clickedItem.classList.contains('active');

        const closeAllPopups = () => {
            ['equipmentPop', 'elevatorPop'].forEach(id => {
                const popup = document.getElementById(id);
                if (popup) {
                    popup.style.display = 'none';
                }
            });
            systemPopup.style.display = 'none';
            systemTabs.forEach(tab => {
                tab.classList.remove('active')
            });
            layerPopup.closePlayers()
        };

        if (isActive) {
            closeAllPopups();
            return;
        }

        closeAllPopups();
        clickedItem.classList.add('active');
        systemPopup.querySelector('.popup-basic__head h2').textContent = clickedItem.textContent;

        systemPopup.style.position = 'absolute';
        systemPopup.style.top = '50%';
        systemPopup.style.left = '50%';
        systemPopup.style.transform = 'translate(-50%, -50%)';
        systemPopup.style.display = 'inline-block';
        const actions = {
            equipmentTab: () => {
                console.log("equipmentTab");
                layerPopup.setEquipmentTab();
                equipmentPop.style.display = 'block';
            },
            parkTab: () => {
                console.log("parkTab");
            },
            chargeTab: () => {
                console.log("chargeTab");
            },
            elevatorTab: () => {
                console.log("elevatorTab");
                layerPopup.setElevatorTab();
                elevatorPop.style.display = 'block';
            }
        };
        const matchedAction = Object.keys(actions).find(action => clickedItem.id === action);

        if (matchedAction) {
            actions[matchedAction]();
        }
    }

    function resetAccordions() {
        document.querySelectorAll('.accordion__btn').forEach(btn => btn.classList.remove('accordion__btn--active'));

        document.querySelectorAll('.accordion__detail').forEach(detail => {
            detail.style.display = 'none';
        });
    }

    function resetSelectBoxes() {
        const buildingBtn = document.querySelector('#buildingSelect .select-box__btn');
        if (buildingBtn) {
            buildingBtn.textContent = "건물 전체";
        }
        const floorBtn = document.querySelector('#floorSelect .select-box__btn');
        if (floorBtn) {
            floorBtn.textContent = "층 전체";
        }
    }

    // side
    const handlePoiMenuClick = (event) => {
        // event.preventDefault();

        if (searchText && searchText.value.trim() !== '') {
            searchText.value = '';
        }

        // poiMenuList.forEach(li => li.classList.remove('active'));

        selectBtn.forEach(btn => {
            if (btn.classList.contains('select-box__btn--active')) {
                btn.classList.remove('select-box__btn--active');
            }
        });

        const clickedItem = event.target.closest('li');
        const title = clickedItem.querySelector('span').textContent;
        const id = clickedItem.getAttribute('data-category-id');

        // 기존 팝업 닫기
        const mapLayerPopup = document.getElementById("mapLayerPopup");
        const layerPopup = document.getElementById("layerPopup");
        if(mapLayerPopup || layerPopup){
            mapLayerPopup.style.display = 'none';
            layerPopup.style.display = 'none';
            Px.VirtualPatrol.Clear();
            Px.Poi.ShowAll();
            const sopPopup = document.querySelector("#sopLayerPopup");
            if (sopPopup.style.display !== 'none') {
                sopPopup.style.display = 'none';
            }
            resetSelectBoxes();
            resetAccordions();
        }

        if (clickedItem.classList.contains('active')) {
            clickedItem.classList.remove('active');
        } else {
            poiMenuList.forEach(li => li.classList.remove('active'));
            clickedItem.classList.add('active');

            // 새로운 팝업 표시
            if (!clickedItem.closest('div').classList.contains('poi-menu__list--map')) {
                handlePoiCategoryClick(title, id);  // 상단 메뉴
            } else {
                handlePoiMapClick(clickedItem, title);  // 하단 메뉴
            }
        }
    };

    const handlePoiCategoryClick = (title, id) => {
        const viewResult = document.querySelector('#viewerResult');
        viewResult.setAttribute('data-category-id', id);
        PoiManager.getPoiByCategoryId(id).then(pois => {
            layerPopup.setCategoryData(title, pois);
        });
    };

    const handlePoiMapClick = (clickedItem, title) => {
        const poiMapMenuList = document.querySelectorAll('#poiMenuListMap li');
        const titleElement = document.querySelector('#mapLayerPopup .popup-basic__head .name');
        const mapPopup = document.getElementById('mapLayerPopup');
        mapPopup.style.display = 'inline-block';
        mapPopup.style.position = 'absolute';
        mapPopup.style.transform = 'translate(80px, 5%)';
        // mapPopup.style.zIndex = '50';

        titleElement.textContent = title;
        const actions = {
            closeAllPopups: () => {
                const popupIds = ['patrolPopup', 'maintenancePopup', 'sopPopup'];
                popupIds.forEach(id => {
                    const popup = mapPopup.querySelector(`#${id}`);
                    if (popup) {
                        popup.style.display = 'none';
                        Px.VirtualPatrol.Clear();
                        Px.Poi.ShowAll();
                    }
                });
            },
            patrol: () => {
                // patrol popup
                actions.closeAllPopups();
                const patrolPopup = mapPopup.querySelector('#patrolPopup')
                mapPopup.className = '';
                mapPopup.classList.add('popup-basic');
                patrolPopup.style.display = 'block';
                radioLive.checked = true; // live default
                radioLive.dispatchEvent(new Event("change"));// 강제 실행
            },
            sop: () => {
                // sop popup
                actions.closeAllPopups();
                const sopPopup = mapPopup.querySelector('#sopPopup');
                mapPopup.className = '';
                mapPopup.classList.add('popup-basic', 'popup-basic--middle');
                sopPopup.style.display = 'block';
            },
            maintenance: () => {
                // maintenance popup
                actions.closeAllPopups();
                const maintenancePopup = mapPopup.querySelector('#maintenancePopup')
                mapPopup.className = '';
                mapPopup.classList.add('popup-basic');
                maintenancePopup.style.display = 'block';
            },
            shelter: () => {
                // shelter popup
                console.log("shelter");
            }
        };

        const matchedAction = Object.keys(actions).find(action => clickedItem.classList.contains(action));
        if (matchedAction) {
            actions[matchedAction]();
        }
    };

    const viewSopDetail = () => {
        const accordionBtns = document.querySelectorAll('#sopPopup .accordion__btn');
        const sopDetailPopup = document.querySelector('#sopLayerPopup');
        const mapLayerPopup = document.getElementById('mapLayerPopup');
        accordionBtns.forEach(accordionBtn => {
            accordionBtn.addEventListener('click', (event) => {
                if (accordionBtn.id === 'escalator') {
                    const rect = mapLayerPopup.getBoundingClientRect();
                    sopDetailPopup.style.left = `${rect.right + 10}px`;
                    sopDetailPopup.style.top = `${rect.top}px`;
                    sopDetailPopup.style.display = 'inline-block';
                    sopDetailPopup.style.position = 'absolute';
                }
            })
        })
    }

    const poiMenuListView = () => {
        poiMenuList.forEach(item => {
            item.addEventListener('click', handlePoiMenuClick);
        });
    };


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
    const popupNotice = document.getElementById("noticePopup");
    noticePopup.addEventListener('click', async function () {
        if (popupNotice.style.display === 'inline-block') {
            console.log("style : ", popupNotice.style.display);
            popupNotice.style.display = 'none';
            return;
        }
        const noticeList = await NoticeManager.getNotices();
        if (noticeList.length === 0) {
            noticeAlert.style.display = 'flex'
            noticeAlert.style.position = 'absolute';
            noticeAlert.style.top = '50%';
            noticeAlert.style.left = '50%';
            noticeAlert.style.transform = 'translate(-50%, -50%)';
            // noticeAlert.style.zIndex = '30';
            const closeButton = noticeAlert.querySelector('button');
            closeButton.removeAttribute('disabled');
            closeButton.addEventListener('click', function () {
                noticeAlert.style.display = 'none';
            });
        } else {
            popupNotice.style.display = 'inline-block';
            popupNotice.style.position = 'absolute';
            popupNotice.style.top = '50%';
            popupNotice.style.left = '50%';
            popupNotice.style.transform = 'translate(-50%, -50%)';
            // popup.style.zIndex = '30';

            pagingNotice(noticeList, 1);
        }
    });

    function pagingNotice(noticeList, itemsPerPage = 1) {
        let currentPage = 1; // 초기 페이지
        const totalPages = Math.ceil(noticeList.length / itemsPerPage);

        const updatePaging = (page) => {
            const startIndex = (page - 1) * itemsPerPage;
            const currentNotice = noticeList[startIndex];

            const noticeTitle = document.querySelector('.notice-info__title p');
            const urgentLabel = document.querySelector('.notice-info__title .label');
            const noticeDate = document.querySelector('.notice-info__date');
            const pagingNumber = document.querySelector('.popup-event__paging .number');
            const noticeContent = document.querySelector('.notice-info__contents p');

            if (currentNotice) {
                noticeTitle.innerHTML = `${currentNotice.title} <span class="badge">N</span>`;
                urgentLabel.style.display = currentNotice.isUrgent ? 'inline' : 'none';
                noticeDate.textContent = formatDate(currentNotice.createdAt);
                noticeContent.textContent = currentNotice.content;
            }

            pagingNumber.innerHTML = `<span class="active">${page}</span>/<span>${totalPages}</span>`;
        };

        updatePaging(currentPage);

        document.querySelector('.popup-event__paging .left').addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                updatePaging(currentPage);
            }
        });

        document.querySelector('.popup-event__paging .right').addEventListener('click', function () {
            if (currentPage < totalPages) {
                currentPage++;
                updatePaging(currentPage);
            }
        });
    }
    const closeBtn = document.querySelector('#noticePopup .close');
    closeBtn.addEventListener('click', function () {
        const popup = document.getElementById('noticePopup');
        popup.style.display = 'none';
    });

    // date format
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();

        return `${year}년 ${month.toString().padStart(2, '0')}월 ${day.toString().padStart(2, '0')}일 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    const allCheck = document.getElementById('check');
    allCheck.addEventListener('change', () => {
        // floorid도 고려해서
        if (allCheck.checked) {
            equipmentGroup.forEach(equipment => {
                equipment.classList.add('active')
            });
            Px.Poi.ShowAll();
        } else {
            equipmentGroup.forEach(equipment => {
                equipment.classList.remove('active')
            });
            Px.Poi.HideAll();
        }
    })

    const initializeTexture = () => {
        Px.VirtualPatrol.LoadArrowTexture('/static/images/virtualPatrol/arrow.png', function () {
            console.log('화살표 로딩완료');
        });

        Px.VirtualPatrol.LoadCharacterModel('/static/assets/modeling/virtualPatrol/guardman.glb', function () {
            console.log('가상순찰 캐릭터 로딩 완료');
        });
    }

    function setButtonIconColor(button, color) {
        const buttonIcons = button.querySelectorAll('svg path');
        buttonIcons.forEach((buttonIcon) => {
            buttonIcon.setAttribute('stroke', color);
        });
    }

    function addButtonEvent(button, action, stopAction) {
        button.addEventListener('mousedown', () => {
            if (Px.Camera.FPS.IsOn()) {
                Px.Camera.FPS.Off();
            } else {
                Px.Util.PointPicker.Off();
                setButtonIconColor(firstViewButton, '#919193');
                firstViewButton.classList.remove(...activeStyle);
                firstViewButton.classList.add(...defaultStyle);
                firstViewButton.classList.remove('on');
            }

            setButtonIconColor(button, '#fff');
            button.classList.remove(...defaultStyle);
            button.classList.add(...activeStyle);
            action();
        });

        button.addEventListener('mouseup', () => {
            setButtonIconColor(button, '#919193');
            button.classList.remove(...activeStyle);
            button.classList.add(...defaultStyle);
            if (stopAction) {
                stopAction();
            }
        });

        button.addEventListener('mouseleave', () => {
            setButtonIconColor(button, '#919193');
            button.classList.remove(...activeStyle);
            button.classList.add(...defaultStyle);
            if (stopAction) {
                stopAction();
            }
        });
    }

    function addButtonPointerEvent(button, onAction, offAction) {
        button.addEventListener('pointerup', () => {
            const isOn = button.classList.contains('active');

            setButtonIconColor(button, '#fff');
            if (isOn) {
                setButtonIconColor(button, '#919193');
                button.classList.remove('active');
                button.classList.remove(...activeStyle);
                button.classList.add(...defaultStyle);
                offAction();
            } else {
                button.classList.add('active');
                button.classList.remove(...defaultStyle);
                button.classList.add(...activeStyle);
                onAction();
            }
        });
    }

    function handleZoomIn() {
        addButtonEvent(
            zoomInButton,
            () => {
                Px.Camera.StartZoomIn();
            },
            () => {
                Px.Camera.StopZoomIn();
            },
        );
    }

    function handleZoomOut() {
        addButtonEvent(
            zoomOutButton,
            () => {
                Px.Camera.StartZoomOut();
            },
            () => {
                Px.Camera.StopZoomOut();
            },
        );
    }

    function handleExtendView() {
        addButtonEvent(homeButton, () => {
            Px.Camera.ExtendView();
        });
    }

    function handleFirstView() {
        addButtonPointerEvent(
            firstViewButton,
            () => {
                Px.Camera.FPS.On();
            },
            () => {
                if (Px.Camera.FPS.IsOn()) {
                    Px.Camera.FPS.Off();
                } else {
                    Px.Util.PointPicker.Off();
                    Px.Camera.ExtendView();
                    const {camera3d} = BuildingManager.findById(BUILDING_ID);
                    if(camera3d) {
                        Px.Camera.SetState(JSON.parse(camera3d));
                    } else {
                        Px.Camera.ExtendView();
                    }
                }
            },
        );
    }

    function handle2D() {
        addButtonPointerEvent(
            camera2D,
            () => {
                // TODO: top-view 위치
                const building = BuildingManager.findById(BUILDING_ID);
                const option = JSON.parse(building.camera2d);
                if (option === null) {
                    console.error('2D 카메라 정보가 없습니다.');
                    return;
                }
                option.onComplete = () => {
                    Px.Camera.SetOrthographic();
                };
                Px.Camera.SetState(option);
            },
            () => {
                const building = BuildingManager.findById(BUILDING_ID);
                const option = JSON.parse(building.camera3d);
                if (option === null) {
                    console.error('3D 카메라 정보가 없습니다.');
                    return;
                }
                option.onComplete = () => {
                    Px.Camera.SetPerspective();
                };
                Px.Camera.SetState(option);
            },
        );
    }

    // 사이드바

    function initializePatrolRadio() {
        const patrolRadioLive = document.getElementById('radioLive');
        const patrolRadioHistory = document.getElementById('radioHistory');
        const patrolDateInput = document.getElementById('patrol-date-input');
        const patrolTimeInput = document.getElementById('patrol-time-input');
        const patrolHistorySearchBtn = document.getElementById('patrol-history-btn');
    
        function handleLiveMode() {
            Px.VirtualPatrol.Clear();
            Px.Poi.ShowAll();
            renderPatrol(true);
            setInputsState(true);
            clearInputValues();
        }
    
        function handleHistoryMode() {
            Px.VirtualPatrol.Clear();
            Px.Poi.ShowAll();
            renderPatrol(true);
            setInputsState(false);
            setCurrentDateTime();
        }
    
        function setInputsState(disabled) {
            patrolDateInput.disabled = disabled;
            patrolTimeInput.disabled = disabled;
            patrolHistorySearchBtn.disabled = disabled;
    
            const cursor = disabled ? "not-allowed" : "pointer";
            patrolTimeInput.style.cursor = cursor;
            patrolDateInput.style.cursor = cursor;
            patrolHistorySearchBtn.style.cursor = cursor;
    
            if (disabled) {
                patrolHistorySearchBtn.classList.add("button--solid-disabled");
            } else {
                patrolHistorySearchBtn.classList.remove("button--solid-disabled");
            }
        }
    
        function clearInputValues() {
            patrolDateInput.value = "";
            patrolTimeInput.value = "";
        }
    
        function setCurrentDateTime() {
            const now = new Date();
            patrolDateInput.value = now.toISOString().split('T')[0];
            
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            patrolTimeInput.value = `${hours}:${minutes}`;
        }
    
        function handleHistorySearch() {
            if (patrolRadioHistory.checked) {
                Px.VirtualPatrol.Clear();
                Px.Poi.ShowAll();
                renderPatrol(false, `${patrolDateInput.value} ${patrolTimeInput.value}`);
            }
        }
    
        // 이벤트 리스너 등록
        patrolRadioLive.addEventListener('change', () => {
            if (patrolRadioLive.checked) handleLiveMode();
        });
    
        patrolRadioHistory.addEventListener('change', () => {
            if (patrolRadioHistory.checked) handleHistoryMode();
        });
    
        patrolHistorySearchBtn.addEventListener('click', handleHistorySearch);
    }

    function renderPatrol(isLive = true, timestamp = null) {
        const buildingId = getBuildingId();
        let patrolList = PatrolManager.findByBuildingId(buildingId);
        console.log("patrolList : ",patrolList);
        // 실시간이 아닌 경우 timestamp 이전의 순찰 목록만 필터링
        if (!isLive && timestamp) {
            const filterTimeStamp = new Date(timestamp);

            patrolList = patrolList.filter(patrol => {
                const patrolCreateAt = new Date(patrol.createdAt);
                return patrolCreateAt < filterTimeStamp;
            });
        }

        const patrolContentList = document.querySelector('#patrolPopup .accordion');
        const poiList = PoiManager.findAll();
        const managerName = document.querySelector('.header__info .head__name').innerHTML;

        patrolContentList.innerHTML = '';

        const patrolControl = `
            <div class="patrol-info__ctrl">
                <button type="button" class="play" data-btn-type="play"><span class="hide">play</span></button>
                <button type="button" class="pause" data-btn-type="pause"><span class="hide">pause</span></button>
                <button type="button" class="stop" data-btn-type="stop"><span class="hide">stop</span></button>
            </div>
        `;

        if (patrolList.length === 0) {
            return patrolContentList.innerHTML += `<div class="error-text">저장된 가상순찰 목록이 없습니다.</div>`
        }

        patrolList.forEach((patrol) => {
            // pointName 별로 그룹화된 리스트 생성
            let pointsHTML = patrol.patrolPoints.map((point) => {
                // pois 배열을 기반으로 <li> 태그 생성
                let poisHTML = point.pois
                    .map((poiId) =>{
                        const poiData = poiList.find((poi) => poi.id === poiId);
                        return poiData ? `<li data-id="${poiData.id}">${poiData.name}</li>` : `` ;
                    })
                    .join('');

                return `
                    <li>
                        <div class="location">
                            <div class="location__title" data-id="${point.id}">${point.name}</div>
                            <ul class="poi__title">
                                ${poisHTML}
                            </ul>
                        </div>
                    </li>
                `;
            }).join('');

            patrolContentList.innerHTML += `
        <button class="accordion__btn" type="button" data-id="${patrol.id}">
            ${patrol.name} <span class="sub">${managerName}</span>
        </button>
        <div class="accordion__detail">
            <div class="patrol-info">
                ${patrolControl}
                <div class="patrol-info__output">
                <ol>
                    ${pointsHTML}
                </ol>
            </div>
            </div>
        </div>
    `;
        });
        accordionTab();
        controlPatrolPlay();
    }

    function accordionTab() {
        document.querySelectorAll('#patrolPopup .accordion__btn').forEach((btn) => {
            btn.addEventListener('click', (event) => {
                const target = event.currentTarget;

                // 다른 아코디언 버튼이 열려 있으면 닫기
                document.querySelectorAll('#patrolPopup .accordion__btn').forEach((otherBtn) => {
                    if (otherBtn !== target) {
                        otherBtn.classList.remove('accordion__btn--active');
                    }
                });
                target.classList.toggle('accordion__btn--active');
                Px.VirtualPatrol.Clear();
                Px.Poi.ShowAll();
                currentPatrol = -1;
            });
        });
    }

    let currentPatrolIndex = 0;
    let isPaused = false;
    let index = 0;
	let timeoutId;
    let currentPatrol = -1;
    let isFinished = false;

    const loopPatrolPoints = async (id) => {
        // 다른 patrol 선택시 위치 초기화 또는 순찰이 끝나면 초기화
        if (currentPatrol !== id || isFinished) {
            resetPatrolView(); //새로운 Patrol 시작 전 화면 초기화
            currentPatrolIndex = 0;
            currentPatrol = id;
            isFinished = false;
        }

        const patrol = PatrolManager.findById(id);
        Px.Model.Collapse({duration: 0});

        for (let i = currentPatrolIndex; i < patrol.patrolPoints.length; i++) {
            currentPatrolIndex = i;
            if (isPaused) {
                break;
            }
            await moveVirtualPatrol(id, patrol);
        }

        if (!isPaused) {
            isFinished = true;
        }
    };

    const resetPatrolView = () => {
        // POI 및 3D 모델 초기화
        Px.VirtualPatrol.RemoveAll();
        Px.VirtualPatrol.Editor.Off();
        Px.Model.Visible.HideAll();
        Px.Poi.HideAll();

        // 기존 `.active` 클래스 제거
        document.querySelectorAll(".floor-info__detail li").forEach(li => li.classList.remove("active"));
    };

    const moveVirtualPatrol = async (id, patrol) => {
        // CctvEventHandler.cctvPlayerClose();
        return new Promise(function (resolve, reject) {
            const point = patrol.patrolPoints[currentPatrolIndex];


            if (isPaused) {
                return resolve();
            }
            const floorElement = document.querySelector(".floor-info__detail .active");

               //층 이동 또는 처음시작할때 화면 렌더링
            if(!floorElement || point.floorId !== Number(floorElement.getAttribute("floor-id"))){

                // 기존 `active` 제거
                document.querySelectorAll(".floor-info__detail li").forEach(li => li.classList.remove("active"));

                // 새롭게 선택된 `li`에 `active` 추가
                const currentFloor = document.querySelector(`.floor-info__detail li[floor-id="${point.floorId}"]`);
                if (currentFloor) {
                    currentFloor.classList.add("active");
                }

                Px.VirtualPatrol.RemoveAll();
                Px.VirtualPatrol.Editor.Off();
                Px.VirtualPatrol.Import(PatrolManager.findByIdByImport(id, point.floorId));
                index = 0;
                Px.Model.Visible.HideAll();
                Px.Model.Visible.Show(point.floorId);
                Px.Poi.HideAll();

                patrol.patrolPoints
                      .filter(p => p.floorId === point.floorId)
                      .flatMap(p => p.pois)
                      .forEach(poiId => Px.Poi.Show(poiId));
            }

            Px.VirtualPatrol.MoveTo(0, index, 200, 5000, async () => {
                index++;
                highlightCurrentPatrolPoint(point.id);
                return resolve();
            });

        })

    }

    const highlightCurrentPatrolPoint = (pointId) => {

        const locationTitles = document.querySelectorAll('.location__title');
        locationTitles.forEach(title => {
            if (title.getAttribute('data-id') === pointId.toString()) {
                title.style.color = 'red'; // 텍스트 강조 색상
            } else {
                title.style.color = ''; // 기본 색상으로 복원
            }
        });
    }


    const play = (id) => {
        isPaused = false;
        loopPatrolPoints(id);
    }

    const pause = () => {
        isPaused = true;
    }

    const stop = () => {
        currentPatrolIndex = 0;
        index = 0;
        isPaused = true;
        currentPatrol = 0;
    }

    const sleep = (ms= 6000) => {
        return new Promise(function (resolve, reject) {
            timeoutId = setTimeout(resolve, ms);
        });

    }

    const controlPatrolPlay = () => {
        const controlButtons = document.querySelectorAll(".patrol-info__ctrl button");

        controlButtons.forEach((item) => {
            item.addEventListener('click', (event) => {
                const id = document.querySelector("#patrolPopup .accordion__btn--active")?.dataset.id;
                const target = event.currentTarget;

                controlButtons.forEach((button) => {
                    button.classList.remove('on');
                });
                target.classList.add('on');

                switch (item.dataset.btnType) {
                    case 'play':
                        play(id);
                        break;
                    case 'pause':
                        pause();
                        break;
                    case 'stop':
                        stop();
                        break;
                }
            });
        });
    }


    function renderPatrolPath() {
        const id = document.querySelector(".accordion .title.show")?.dataset.id;

        const floorName = document.querySelector("body > main > div.left-information > div.floor").dataset.floorName;

        if(floorName === '') return;

        const floorId = BuildingManager.findById(BUILDING_ID).floors.find(floor => floor.floorName === floorName).id;

        Px.VirtualPatrol.Import(PatrolManager.findByIdByImport(id, floorId));

    }

    const initEventSearchPopup = () => {
        document.querySelector('.event-container .category-tab li.on').classList.remove('on');
        document.querySelector('.event-container .category-tab li.all-category').classList.add('on');

        document.querySelector('.event-container .event-list li.on').classList.remove('on');
        document.querySelector('.event-container .event-list li.all-event').classList.add('on');

        const timezoneOffset = new Date().getTimezoneOffset() * 60000;
        const nowDate = new Date(Date.now() - timezoneOffset).toISOString();

        const start = `${nowDate.split('T')[0]}T00:00`;
        const end = `${nowDate.split('.')[0]}`;

        const eventStart = document.getElementById('eventStart');
        eventStart.setAttribute('value', start);
        eventStart.value = start;

        const eventFinish = document.getElementById('eventFinish');
        eventFinish.setAttribute('value', end);
        eventFinish.value = end;


        document.getElementById('eventStart').value = start;

        popup.createEventList();
    }

    const menuActions = {
        equipment: () => {
            popup.resetFloor();
            updateSidebar('equipment', '장비목록');
        },
        event: () => {
            updateSidebar('event', '이벤트 현황');
            initEventSearchPopup();
        },
        patrol: () => {
            renderPatrol();
            updateSidebar('patrol', '가상순찰');
        },
        evaluation: () => {
            handleEvaluationMenu(true);
        },
        'e-sop': () => {
            window.open(E_SOP_URL, '_blank', 'width=420px,height=880px,scrollbars=yes,top=70,left=1400');
        },
    };

    const menuCloseAction = {
        equipment: () => {
        },
        event: () => {
        },
        patrol: () => {
            isPaused = true;
            Px.VirtualPatrol.Clear();
        },
        evaluation: () => {
            handleEvaluationMenu(false);
        },
        'e-sop': () => {
        },
    }

    function handleEvaluationMenu(on) {
        if(on) {
            EvacRouteHandler.load((isExist) => {
                if (isExist) {
                    const currentFloor = document.querySelector('.left-information .floor .floor-list li.on');
                    const { floorName } = currentFloor.dataset;
                    if (floorName !== '') {
                        Px.Model.Visible.ShowAll();
                        currentFloor.classList.remove('on');
                        document.querySelector(`.left-information .floor .floor-list li[data-floor-name='']`).classList.add('on');

                    }
                    const {floors} = BuildingManager.findById(BUILDING_ID);
                    Px.Model.Expand({
                        name: floors[0].floorName,
                        interval: 200,
                        duration: 1000
                    });
                }
            });
        } else {
            Px.Evac.Clear();
        }
    }

    function updateSidebar(menu, title) {
        sideBar.dataset.menu = menu;
        headerTitle.textContent = title;

        contents.forEach((content) => {
            if (content.classList.contains(`${menu}-container`)) {
                content.style.display = 'grid';
            } else {
                content.style.display = 'none';
            }
        });
    }

    const initPoi = async (buildingId) => {
        await getPoiRenderingAndList(buildingId);
        PoiManager.renderAllPoiToEngineByBuildingId(buildingId);
    };

    // test중
    const getPoiRenderingAndList = async (buildingId) => {
        await PoiManager.getPoiList().then(() => {
            let filteredList = PoiManager.findByBuilding(buildingId)

            if (filteredList === undefined || filteredList.length < 1) {
                console.warn('POI 가 한 개도 없습니다.');
                return;
            }

            Px.Poi.HideAll();
            filteredList.forEach((poiInfo) => {
                Px.Poi.Show(poiInfo.id);
            });
        });

    };

    function getBuilding(buildingId) {
        const container = document.getElementById('webGLContainer');
        container.innerHTML = '';
        Px.Core.Initialize(container, async () => {

            const { buildingFile, floors } = await BuildingManager.findById(buildingId);
            const { directory } = buildingFile;

            const sbmDataArray = floors.map((floor) => {

                const url = `/Building/${directory}/${floor.sbmFloor[0].sbmFileName}`;
                const sbmData = {
                    url,
                    id: floor.sbmFloor[0].id,
                    displayName: floor.sbmFloor[0].sbmFileName,
                    baseFloor: floor.sbmFloor[0].sbmFloorBase,
                    groupId: floor.sbmFloor[0].sbmFloorGroup,
                };
                return sbmData;
            });

            Px.Loader.LoadSbmUrlArray({
                urlDataList: sbmDataArray,
                center: "",
                onLoad: function() {
                    initPoi(buildingId);
                    Px.Util.SetBackgroundColor('#333333');
                    Px.Camera.FPS.SetHeightOffset(15);
                    Px.Camera.FPS.SetMoveSpeed(500);

                    Px.Event.On();
                    Px.Event.AddEventListener('dblclick', 'sbm', Init.buildingDblclick);
                    initializeTexture();
                }
            });
        });
        handleZoomIn();
        handleZoomOut();
        handleExtendView();
        handleFirstView(buildingId);
        handle2D(buildingId);
    }

    // event 관련
    (async function initializeEvent() {
        await Promise.all([
            EventManager.initializeLatest24HoursList(17)
        ]);

        EventManager.eventState();
        EventManager.initializeAlarms();

    })();

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
            const param = new URLSearchParams(window.location.search);
            const buildingIdParam = param.get("buildingId")
            if (buildingIdParam) {
                const buildingId = parseInt(buildingIdParam, 10);
                console.log("notice.buildingIds : ", notice.buildingIds);
                console.log("buildingId : ", buildingId);
                console.log("includes :", notice.buildingIds.includes(buildingId));
                if (!notice.buildingIds.includes(buildingId)) {
                    return;
                }
            }
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

    initTab();
    viewEquipmentList();
    poiMenuListView();
    viewEquipment();
    // closePop();
    initializePatrolRadio();
    systemPopView();
    viewSopDetail();
    controlPatrolPlay();
})();
