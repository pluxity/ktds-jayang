'use strict';

(async function () {
    const cookieMatch = document.cookie.match('(^|;) ?USER_ID=([^;]*)(;|$)');
    const USER_ID = cookieMatch ? cookieMatch[2] : null;

    if (!USER_ID) {
        window.location.href = '/login';
    }
    api.get(`/users/userid/${USER_ID}`).then((result) => {
        const {result: data} = result.data;
        document.querySelector('.header__info .head__name').innerHTML = data.name;
        document.querySelector('.header__info .head__level').innerHTML = data.groupName;
        // if (data.role !== 'ADMIN') {
        //     document.querySelector("#userBox > div.user-content-wrap > button.admin-button").style.display = 'none';
        // }
    });

    function getCookie(name) {
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            const [key, value] = cookie.split("=");
            if (key === name) {
                return decodeURIComponent(value);
            }
        }
        return null;
    }
    // 관리자 여부
    const userRole = getCookie("USER_ROLE");
    const roles = userRole ? userRole.split(",") : [];
    const adminButton = document.querySelector(".profile__layer .head");
    adminButton.addEventListener("click", event => {
        window.location.href = "/admin/system-setting";
    })
    if (!roles.includes("ADMIN")) {
        adminButton.style.display = "none";
    }

    const floorInfo = document.querySelector('#floor-info .floor-info__button');
    const floorDetail = document.querySelector('#floor-info .floor-info__detail');
    floorInfo.addEventListener('click', event => {
        if (floorDetail.style.display == 'none') {
            floorDetail.style.display = 'block';
        } else {
            floorDetail.style.display = 'none';
        }
    })

    function setCategoryId(elements, categoryIds, isEquipment) {
        const params = new URLSearchParams(window.location.search);
        let buildingId = params.get('buildingId');
        elements.forEach(element => {
            // const elementClasses = element.className.split(' ').map(className => className.toLowerCase());
            let elementText = "";
            if (element.closest("#poiMenuList")) {
                elementText = element.querySelector('a span').textContent.trim().toLowerCase();
            } else {
                elementText = element.textContent.trim().toLowerCase();
            }

            const matchedCategory = categoryIds.find(category => {
                const categoryName = category.name.toLowerCase();
                if (categoryName === '출입통제') {
                    return elementText.includes('출입');
                }
                return categoryName === elementText;
            });

            if (matchedCategory) {
                element.setAttribute('data-category-id', matchedCategory.id);
            }
        });
        if (isEquipment) {
            const allPois = PoiManager.findAll();
            const filteredPois = allPois.filter(poi => poi.buildingId === Number(buildingId));
            elements.forEach(element => {
                const categoryId = element.getAttribute('data-category-id');
                filteredPois.forEach(poi => {
                    if (poi.poiCategory == categoryId && poi.property.poiCategoryName.toLowerCase() == 'cctv') {
                        if (poi.position !== null) {
                            element.classList.add('active');
                        }
                    }
                });
            });
        }
    }

    const initCategory = () => {
        const equipmentGroup = document.querySelectorAll('#equipmentGroup a')
        const poiMenuList = document.querySelectorAll('#poiMenuList ul li');
        const systemTabList = document.querySelectorAll('.system-tap ul li');
        let allCategoryIds = PoiCategoryManager.findAll();
        setCategoryId(poiMenuList, allCategoryIds, false);
        setCategoryId(equipmentGroup, allCategoryIds, true);
        setCategoryId(systemTabList, allCategoryIds, false);
    }


    const initBuilding = async () => {
        const params = new URLSearchParams(window.location.search);
        let buildingId = params.get('buildingId');

        const tabList = document.querySelector('.header__tab');
        BuildingManager.getBuildingList().then(buildings => {
            buildings.forEach(building => {
                const tab = document.createElement('li');
                tab.setAttribute('role', 'tab');
                tab.setAttribute('aria-controls', `tabpanel${building.id}`);
                tab.setAttribute('aria-selected', 'false');
                tab.setAttribute('tabindex', '0');
                tab.setAttribute('data-building-id', building.id);
                const link = document.createElement('a');
                link.setAttribute('href', `javascript:void(0)`);
                link.textContent = building.name;
                tab.appendChild(link);
                tabList.appendChild(tab);

                if (Number(buildingId) === building.id) {
                    tab.classList.add('active');
                    tab.setAttribute('aria-selected', 'true'); // 선택 상태도 true로 변경
                }
            })
        })
        await Init.getBuilding(buildingId);
    }

    // paging
    const updateFloorPage = (floorUl, startIndex, itemsPerPage) => {
        const allItems = floorUl.querySelectorAll('li');
        allItems.forEach((li, index) => {
            if (index >= startIndex && index < startIndex + itemsPerPage) {
                li.style.display = 'inline-block';
            } else {
                li.style.display = 'none';
            }
        });
    };

    const updateButtons = (startIndex, totalItems, itemsPerPage, upButton, downButton) => {
        upButton.style.display = startIndex > 0 ? 'inline-block' : 'none';
        downButton.style.display = startIndex + itemsPerPage < totalItems ? 'inline-block' : 'none';
    };

    const initFloors = () => {
        const params = new URLSearchParams(window.location.search);
        let buildingId = params.get('buildingId');
        const building = BuildingManager.findById(buildingId);
        const version = building.getVersion();

        BuildingManager.getFloorsByHistoryVersion(version).then((floors) => {

            // floor setting
            const floorUl = document.querySelector('#floor-info .floor-info__detail ul')
            const upButton = document.querySelector('#floor-info .floor-info__detail .up');
            const downButton = document.querySelector('#floor-info .floor-info__detail .down');
            // upButton.style.transform = "rotate(-90deg)";
            // downButton.style.transform = "rotate(-90deg)";
            floors.forEach(floor => {
                const floorLi = document.createElement('li');
                floorLi.setAttribute('floor-id', floor.no);
                floorLi.textContent = floor.name
                floorUl.appendChild(floorLi);
            })

            const itemsPerPage = 10;
            const totalItems = floors.length;
            let startIndex = 0;

            updateFloorPage(floorUl, startIndex, itemsPerPage);
            updateButtons(startIndex, totalItems, itemsPerPage, upButton, downButton);

            // 1층단위
            upButton.addEventListener('click', () => {
                if (startIndex > 0) {
                    startIndex -= 10;
                    // startIndex = Math.max(0, startIndex - 10);
                    updateFloorPage(floorUl, startIndex, itemsPerPage);
                    updateButtons(startIndex, totalItems, itemsPerPage, upButton, downButton);
                }
            });

            downButton.addEventListener('click', () => {
                if (startIndex + itemsPerPage < totalItems) {
                    startIndex += 10;
                    // startIndex = Math.min(totalItems - itemsPerPage, startIndex + 10);
                    updateFloorPage(floorUl, startIndex, itemsPerPage);
                    updateButtons(startIndex, totalItems, itemsPerPage, upButton, downButton);
                }
            });
            clickFloor();
        });

    }

    const clickFloor = () => {
        const floorBtns = document.querySelectorAll('#floor-info .floor-info__detail ul li');
        // btnClick
        floorBtns.forEach(floorBtn => {
            floorBtn.style.cursor = 'pointer';
            floorBtn.addEventListener('click', event => {

                floorBtns.forEach(btn => btn.classList.remove('active'));
                floorBtn.classList.add('active');
                Px.VirtualPatrol.Clear();
                Px.Model.Visible.HideAll();
                Px.Poi.HideAll();
                let floorNo = floorBtn.getAttribute('floor-id');
                // 다른 층 클릭하면 기존 poi popup 제거
                const allPopups = document.querySelectorAll('.popup-info');
                if (allPopups) {
                    allPopups.forEach(popup => {
                        const popupPoiId = popup.querySelector('.poi-id').value;
                        const poiInfo = Px.Poi.GetData(popupPoiId);
                        if (poiInfo.property.floorNo !== Number(floorNo)) {
                            popup.remove();
                            layerPopup.closePlayers();
                        }
                    })
                }
                const floor = BuildingManager.findFloorsByHistory().find(
                    (floor) => Number(floor.no) === Number(floorNo),
                );

                Px.Model.Visible.Show(floor.id);
                const allPois = PoiManager.findAll();
                const filteredPois = allPois.filter(poi => poi.floorNo === Number(floorNo));
                filteredPois.forEach(poi => {
                    Px.Poi.Show(Number(poi.id));
                });
                Px.Camera.ExtendView();
            })
        })
        // allFloor
        const allFloor = document.querySelector('.floor-info__ctrl .all');
        allFloor.style.cursor = 'pointer';
        allFloor.addEventListener('click', event => {
            floorBtns.forEach(btn => btn.classList.remove('active'));
            Px.Poi.ShowAll();
            Px.Model.Visible.ShowAll();
            Px.VirtualPatrol.Clear();
            Px.Camera.ExtendView();
        })

        const expandBtn = document.querySelector('.floor-info__ctrl .scale');
        expandBtn.addEventListener('click', event => {
            event.target.closest('.floor-info__ctrl')
            const params = new URLSearchParams(window.location.search);
            let buildingId = params.get('buildingId');
            const {floors} = BuildingManager.findById(buildingId);
            const activeLi = document.querySelector('.floor-info__detail ul li.active');
            const targetFloorId = activeLi
                ? activeLi.getAttribute('floor-id')
                : floors[0].id;
            if (expandBtn.classList.contains("scale--down")) {
                Px.Model.Expand({
                    duration: 1000,
                    interval: 100,
                    name: Number(targetFloorId),
                });
                expandBtn.classList.remove("scale--down");
            } else {
                Px.Model.Collapse({
                    duration: 1000,
                });
                expandBtn.classList.add("scale--down");
            }
        })
    }

    // 화면 세팅
    await SystemSettingManager.getSystemSetting().then((systemSetting) => {
        const { } = systemSetting;
    });
    await NoticeManager.getNotices();
    await IconSetManager.getIconSetList();
    await PoiCategoryManager.getPoiCategoryList();
    await PoiMiddleCategoryManager.getPoiMiddleCategoryList();

    await BuildingManager.getBuildingList().then((buildingList) => {
        buildingList.forEach(async (building) => {
            const {id} = building;
            await BuildingManager.getBuildingById(id).then((building) => {
                BuildingManager.findById(id).setDetails(building);
            });
        })
    });

    // await PoiManager.getFilteredPoiList();
    await PatrolManager.getPatrolList();
    const updateCurrentTime = () => {
        const dateElement = document.querySelector('.header__info .date');

        const now = new Date();

        const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
        const date = String(now.getDate()).padStart(2, '0');
        const day = days[now.getDay()];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const formattedTime = `${year}년 ${month}월 ${date}일(${day} ${hours}:${minutes}:${seconds})`;

        dateElement.textContent = formattedTime;
    }

    const setDateTime = () => {
        const renderDateTime = () => {
            const dateTimeFormat = new Intl.DateTimeFormat('ko', {
                dateStyle: 'short',
                timeStyle: 'short',
            });
            const dateTimeString = dateTimeFormat.format(new Date());
        };

        renderDateTime();

        Cron.addCronjob('* * * * * *', renderDateTime);
    };

    initFloors();
    initCategory();
    initBuilding();
    setDateTime();
    setInterval(updateCurrentTime, 1000);

})();

const Init = (function () {
    const zoomInButton = document.querySelector('.tool-box__list .plus');
    const zoomOutButton = document.querySelector('.tool-box__list .minus');
    const homeButton = document.querySelector('.tool-box__list .home');
    const firstViewButton = document.querySelector('.tool-box__list .pov');
    const camera2D = document.querySelector('.tool-box__list .twd');
    const defaultStyle = ['bg-gray-100', 'border-gray-70'];
    const activeStyle = ['bg-primary-80', 'border-primary-60'];

    const initializeTexture = () => {
        Px.VirtualPatrol.LoadArrowTexture('/static/images/virtualPatrol/arrow.png', function () {
            console.log('화살표 로딩완료');
        });

        Px.VirtualPatrol.LoadCharacterModel('/static/assets/modeling/virtualPatrol/guardman.glb', function () {
            console.log('가상순찰 캐릭터 로딩 완료');
        });
    }

    const initializeIndoorBuilding = async (onComplete) => {
        try {
            const buildingName = document.getElementById('buildingName');
            buildingName.style.display = 'none';
            buildingName.style.zIndex = '0';
            buildingName.style.left = '';
            buildingName.style.top = '';
            const container = document.getElementById('container');
            container.innerHTML = '';
            Px.Core.Initialize(container, async () => {
                Px.Util.SetBackgroundColor('#1b1c2f'); // 백그라운드 색깔지정
                // BuildingManager.findById(BUILDING_ID).getDetail();
                const { buildingFile, code, camera3d, version} = BuildingManager.findById(firstBuildingId);
                const { directory, storedName, extension } = buildingFile;

                const {floors} = BuildingManager.findById(firstBuildingId);
                const sbmDataArray = floors
                    .flatMap(floor =>
                        floor.sbmFloor.map(sbm => ({
                            url: `/Building/${directory}/${version}/${sbm.sbmFileName}`,
                            id: floor.id,
                            displayName: sbm.sbmFileName,
                            baseFloor: sbm.sbmFloorBase,
                            groupId: sbm.sbmFloorGroup,
                        }))
                    );

                Px.Loader.LoadFbx({
                    urlDataList: sbmDataArray,
                    center: '',
                    onLoad: async () => {
                        Px.Util.SetBackgroundColor('#333333');
                        Px.Camera.FPS.SetHeightOffset(15);
                        Px.Camera.FPS.SetMoveSpeed(500);
                        PoiManager.renderAllPoiToEngineByBuildingId(firstBuildingId);
                        Px.Lod.SetLodData(lod);
                        if (floors.length > 1) {
                            Px.Model.Expand({
                                duration: 200,
                                interval: 200,
                                name: floors[0].floorName,
                                onComplete: () => {
                                    if(camera3d) {
                                        Px.Camera.SetState(JSON.parse(camera3d));
                                    }

                                }
                            });
                        } else {
                            if(camera3d) {
                                Px.Camera.SetState(JSON.parse(camera3d));
                            }
                        }

                        resetFloorName();

                        Px.Event.On();
                        Px.Event.RemoveEventListener('dblclick', 'sbm', buildingDblclick);

                        Px.Effect.Outline.HoverEventOff();
                        Px.Effect.Outline.RemoveHoverEventCallback(renderingBuildingNameDom);
                        initializeTexture();

                        document.getElementById('loadingLayer').classList.remove('on');
                        if (onComplete) onComplete();
                        renderingPoiList();
                        Init.setBuildingNameAndFloors();

                        if(camera3d) Px.Camera.SetState(JSON.parse(camera3d));
                    },
                });
            });
        } catch (error) {
            console.error('PX Engine Initial', error);
        }
    }

    const poiDblclick = (poiInfo) => {
        const {id} = poiInfo.property;

        popup.setPoiEvent(id);
    }

    const initPoi = async (buildingId) => {
        await getPoiRenderingAndList(buildingId);
        PoiManager.renderAllPoiToEngineByBuildingId(buildingId);
    };

    const getPoiRenderingAndList = async (buildingId) => {
        await PoiManager.getFilteredPoiList().then(() => {
            let filteredList = PoiManager.findByBuilding(buildingId)

            if (filteredList === undefined || filteredList.length < 1) {
                console.warn('POI 가 한 개도 없습니다.');
                return;
            }

            Px.Poi.HideAll();
            filteredList
                .filter(poiInfo => poiInfo.poiCategoryDetail?.name?.toLowerCase() === 'cctv').forEach((poiInfo) => {
                console.log("poiInfo : ", poiInfo);
                Px.Poi.Show(poiInfo.id);
            });

            if (filteredList.some(poiInfo => poiInfo.poiCategoryDetail?.name?.toLowerCase() === 'cctv')) {
                const cctvLink = document.querySelector('#equipmentGroup .cctv');
                if (cctvLink) {
                    cctvLink.classList.add('active');
                }
            }
        });
    };
    let selectedGroup = null;
    let selectedId = null;
    const getBuilding = async (buildingId) => {
        const container = document.getElementById('webGLContainer');
        container.innerHTML = '';

        const contents = document.querySelector('.contents');
        Px.Core.Initialize(container, async () => {

            const building = await BuildingManager.findById(buildingId);
            const { buildingFile} = building;
            const { directory } = buildingFile;
            const version = building.getVersion();
            const floors =  await BuildingManager.getFloorsByHistoryVersion(building.getVersion());

            const sbmDataArray = floors
                .flatMap(floor =>
                    floor.sbmFloor.map(sbm => ({
                        url: `/Building/${directory}/${version}/${sbm.sbmFileName}`,
                        id: floor.id,
                        displayName: sbm.sbmFileName,
                        baseFloor: sbm.sbmFloorBase,
                        groupId: sbm.sbmFloorGroup,
                    }))
                );

            Px.Loader.LoadSbmUrlArray({
                urlDataList: sbmDataArray,
                center: "",
                onLoad: function() {
                    initPoi(buildingId);
                    Px.Util.SetBackgroundColor('#333333');
                    Px.Camera.FPS.SetHeightOffset(15);
                    Px.Camera.FPS.SetMoveSpeed(500);
                    Px.Camera.EnableScreenPanning();
                    // PoiManager.renderAllPoiToEngineByBuildingId(buildingId);
                    Px.Event.On();
                    Px.Event.AddEventListener('dblclick', 'poi', (poiInfo) => {
                        moveToPoi(poiInfo.id);
                    });

                    Px.Event.AddEventListener('pointerup', 'poi', (poiInfo) =>{
                        const clickedPoiId = String(poiInfo.id);
                        const allPopups = document.querySelectorAll('.popup-info');
                        let samePopupOpen = false;
                        allPopups.forEach(popup => {
                            const poiIdInput = popup.querySelector('.poi-id');
                            const popupPoiId = poiIdInput?.value;

                            if (popupPoiId === clickedPoiId) {
                                popup.remove();
                                layerPopup.closePlayers();
                                samePopupOpen = true;
                            } else {
                                layerPopup.closePlayers();
                                popup.remove();
                            }
                        });
                        if (poiInfo.property.isLight) {

                            if (selectedGroup === poiInfo.property.lightGroup) {
                                if (selectedId === poiInfo.id) {
                                    Px.Poi.RestoreColorAll();
                                    selectedGroup = null;
                                    selectedId = null;
                                } else {
                                    selectedId = poiInfo.id;
                                }

                            } else {
                                Px.Poi.RestoreColorAll();
                                Px.Poi.SetColorByProperty('lightGroup', poiInfo.property.lightGroup, '#f80606');
                                selectedGroup = poiInfo.property.lightGroup;
                                selectedId = poiInfo.id;
                            }
                        }
                        if (samePopupOpen) return;
                        if (poiInfo.group.toLowerCase() === 'cctv') {
                            setTimeout(() => {
                                renderPoiInfo(poiInfo);
                            }, 100)
                        } else {
                            renderPoiInfo(poiInfo);
                        }


                    });
                    Px.Event.AddEventListener('pointerup', 'sbm', (event) => {
                        console.log("event : ", event);
                    })

                    Px.Effect.Outline.HoverEventOn('area_no');
                    Px.Effect.Outline.AddHoverEventCallback(
                        throttle((event) => {

                        }, 1000)
                    );
                    if(building?.camera3d)
                        Px.Camera.SetState(JSON.parse(building.camera3d));

                    contents.style.position = 'static';
                    initializeTexture();

                    setTimeout(() =>{
                        moveToPoiFromSession();
                        // 세션에 저장된 POI 데이터와 CCTV 정보 확인
                        const mainCctv = JSON.parse(sessionStorage.getItem('mainCctv'));
                        const selectedPoiId = JSON.parse(sessionStorage.getItem('selectedPoiId'));
                        // 임시 제거
                        // if (selectedPoiId) {
                        //     renderPoiInfo(Px.Poi.GetData(selectedPoiId));
                        // }

                        if (mainCctv) {
                            const mainCCTVTemplate = EventManager.createMainCCTVPopup(mainCctv);
                            mainCCTVTemplate.style.position = 'fixed';
                            mainCCTVTemplate.style.top = '50%';
                            mainCCTVTemplate.style.transform = 'translateY(-50%)';
                            mainCCTVTemplate.style.left = `${(window.innerWidth / 2) - mainCCTVTemplate.offsetWidth}px`;
                        }

                        // 세션 스토리지 정리
                        sessionStorage.removeItem('mainCctv');
                        sessionStorage.removeItem('selectedPoiId');
                    },500);

                }
            });
        });

        handleZoomIn();
        handleZoomOut();
        handleExtendView();
        handleFirstView(buildingId);
        handle2D(buildingId);
    };

    const moveToPoiFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const poiId = urlParams.get('poiId');
    
        if (poiId) {
            const poiData = Px.Poi.GetData(poiId);
            if (poiData) {
                Px.Model.Visible.Show(String(poiData.property.floorNo));
                Px.Camera.MoveToPoi({
                    id: poiId,
                    isAnimation: true,
                    duration: 500,
                });
            }
        }
    };

    const moveToPoiFromSession = () => {
        const selectedPoiId = sessionStorage.getItem('selectedPoiId');
        if(selectedPoiId){
            moveToPoi(selectedPoiId);
            Px.Poi.Show(selectedPoiId);
        }
    }

    const moveToPoi = (id) => {
        let poiId;
        if (id.constructor.name === 'PointerEvent') {
            poiId = id.currentTarget.getAttribute('poiid');
        } else {
            poiId = id;
        }
        const poiData = Px.Poi.GetData(poiId);

        if (poiData) {

            const floor = BuildingManager.findFloorsByHistory().find(
                (floor) => Number(floor.no) === Number(poiData.property.floorNo),
            );

            Px.Model.Visible.HideAll();
            // Px.Model.Visible.Show(Number(poiData.property.floorNo));
            Px.Model.Visible.Show(Number(floor.id));
            Px.Poi.HideAll();
            Px.Poi.ShowByProperty("floorNo", Number(poiData.property.floorNo));
            Px.Camera.MoveToPoi({
                id: poiId,
                isAnimation: true,
                duration: 500,
            });
        } else {
            alertSwal('POI를 배치해주세요');
        }
    };

    // poi-info 팝업 외부 클릭시 모든 poi-info 팝업 정리
    const handleOutsideClick = (event) => {
        if (!event.target.closest('.popup-info')) {
            const popups = document.querySelectorAll('.popup-info');
            popups.forEach(popup => popup.remove());
        }
    };

    // document.addEventListener('mousedown', handleOutsideClick);

    /**
     * POI 클릭 시 상태 표시
     * - 태그 데이터를 실시간으로 조회하여 표시
     * - 새로고침 버튼으로 갱신
     */

    function closeEventPopup(event) {
        const target = event.target;
        const mainPopup = target.closest('.main-cctv-container');
        const subPopup = target.closest('.cctv-item');
        const sopPopup = target.closest('.sop-container');

        if (sopPopup) {
            sopPopup.remove();
        }
        if (mainPopup) {
            mainPopup.remove();
        }
        if (subPopup) {
            subPopup.remove();
        }
    }

    const activePopups = new Map();

    const renderPoiInfo = async (poiInfo) => {
        console.log("renderPoiInfo poiInfo : ", poiInfo);
        if (poiInfo.group.toLowerCase() === "cctv") {
            const poiProperty = poiInfo.property;
            const popupInfo = document.createElement('div');

            popupInfo.className = 'main-cctv-container';
            popupInfo.classList.add('popup-info');
            const canvasId = `cctv-${poiInfo.id}`;
            popupInfo.innerHTML =
                `<div class="main-cctv-item" data-cctv-id="${poiInfo.id}">
                    <div class="cctv-header">
                        <span class="cctv-title">${poiInfo.displayText}</span>
                        <button type="button" class="cctv-close">×</button>
                    </div>
                    <div class="cctv-content">
                        <input type="hidden" class="poi-id" value="${poiInfo.id}">
                        <canvas id="cctv-${poiInfo.id}" width="800" height="450"></canvas>
<!--                        <video id="cctv-${poiInfo.id}" width="100%" height="100%"></video>-->                    
                    </div>
                     <div class="cctv-bottom">
                        <div class="cctv-mode-switch">
                            <label style="display:flex; align-items:center; gap:2px; cursor:pointer;">
                                <input type="radio" name="cctv-mode-${poiInfo.id}" value="live" checked style="accent-color:#007bff;"> Live
                            </label>
                            <label style="display:flex; align-items:center; gap:2px; cursor:pointer;">
                                <input type="radio" name="cctv-mode-${poiInfo.id}" value="playback" style="accent-color:#007bff;"> Playback
                            </label>
                        </div>                          
                        <div class="cctv-controls">
                            <button class="cctv-controls-btn play" type="button" data-btn-type="play">
                                <span class="hide">play</span>
                            </button>
                            <button class="cctv-controls-btn pause" type="button" data-btn-type="pause">
                                <span class="hide">pause</span>
                            </button>
                            <button class="cctv-controls-btn stop" type="button" data-btn-type="stop">
                                <span class="hide">stop</span>
                            </button>
                        </div>
                     </div>
                    <div class="cctv-footer" style="display: none;">
                        <div class="date-picker" >
                            <input type="date">
                        </div>
                        <div class="time-picker">
                            <input type="time">
                        </div>
                    </div>
                </div>`;
            const {x, y} = Px.Poi.Get2DPosition(poiInfo.id);
            popupInfo.style.position = 'fixed';
            popupInfo.style.zIndex = '999';
            popupInfo.style.left = `${x}px`;
            popupInfo.style.top = `${y}px`;

            document.body.appendChild(popupInfo);

            const updatePosition = () => {
                const { x, y } = Px.Poi.Get2DPosition(poiInfo.id);
                popupInfo.style.left = `${x}px`;
                popupInfo.style.top = `${y}px`;

                if (!activePopups.has(poiInfo.id)) return;
                requestAnimationFrame(updatePosition);
            };

            activePopups.set(poiInfo.id, { dom: popupInfo });
            updatePosition();
            await EventManager.playLiveStream(canvasId,poiInfo.property.cameraIp);


            const closeBtn = popupInfo.querySelector('.cctv-close');
            closeBtn.addEventListener('click', () => {
                // 팝업 제거
                popupInfo.remove();
                layerPopup.closePlayer(canvasId);
            });
            return popupInfo;
        } else {
            const poiProperty = poiInfo.property;
            const popupInfo = document.createElement('div');

            popupInfo.className = 'popup-info';
            const statusCell = poiProperty.poiCategoryName === '공기질센서'
                ? `<th>단계</th>`
                : '';
            popupInfo.innerHTML =
                `<div class="popup-info__head">
                    <input type="hidden" class="poi-id" value="${poiInfo.id}">
                    <h2>${poiProperty.poiCategoryName} ${poiProperty.name}</h2>
                    <button type="button" class="close"><span class="hide">close</span></button>
                </div>
                <div class="popup-info__content">
                    <div class="title">${poiProperty.buildingName} - ${poiProperty.floorName}</div>
                    <div class="date">
                        <span class="timestamp">업데이트 일시 : ${new Date().toLocaleString()}</span>
                        <button type="button" class="date__refresh"><span class="hide date">새로고침</span></button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>수집정보</th>
                                <th>측정값</th>
                                ${statusCell}
                            </tr>
                        </thead>
                        <tbody>
                             <tr>
                                <td colspan="3">데이터를 불러오는 중...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>`;

            // poi 상태 가져오기
            const updateTagData = async () => {
                try {

                    const response = await api.post('/poi/test-status', poiProperty.tagNames);
                    // const response = await fetch(`/poi/test-status`, {
                    //     method: 'POST',
                    //     headers: {
                    //         'Content-Type': 'application/json'
                    //     },
                    //     body: JSON.stringify(poiProperty)
                    // });
                    // const data = await response.json();

                    const data = response.data;
                    const tbody = popupInfo.querySelector('tbody');
                    if (data.TAGCNT > 0) {
                        if (poiProperty.poiMiddleCategoryName == '에스컬레이터') {
                            const esclNumMatch = data.TAGs[0].tagName.match(/ESCL-(\d+)/);
                            const esclNum = esclNumMatch ? parseInt(esclNumMatch[1], 10) : null;
                            const esclBaseMap = {
                                1: 'B2F-B1F',
                                3: 'B1F-1F',
                                5: '1F-2F',
                                7: 'B4F-B3F',
                                9: 'B3F-B2F',
                                11: 'B7F-B6F',
                                13: 'B6F-B5F',
                                15: 'B5F-B4F',
                                17: 'B4F-B3F',
                                19: 'B3F-B2F',
                                21: 'B2F-B1F',
                                23: 'B1F-1F',
                                25: '1F-2F',
                                27: 'B4F-B3F',
                                29: 'B3F-B2F',
                                31: 'B2F-B1F',
                                33: 'B1F-1F',
                                35: '1F-2F',
                                37: '2F-3F',
                                39: '3F-4F',
                                41: 'B1F-1F',
                                43: 'B1F-1F',
                            };

                            let section = '-';
                            if (esclNum && esclBaseMap[esclNum % 2 === 0 ? esclNum - 1 : esclNum]) {
                                const base = esclBaseMap[esclNum % 2 === 0 ? esclNum - 1 : esclNum];
                                section = (esclNum % 2 === 0) ? `${base.split('-')[0]}->${base.split('-')[1]}`
                                    : `${base.split('-')[1]}<-${base.split('-')[0]}`;
                            }

                            const tagMap = Object.fromEntries(data.TAGs.map(t => [t.tagName.split('-').pop(), t.currentValue]));
                            const direction = (tagMap['UpDir'] === 'OFF') ? '하향'
                                : (tagMap['UpDir'] ? '상향' : '-');

                            let runState = '-';
                            if (tagMap['Run'] && tagMap['Run'] !== '0' && tagMap['Run'] !== 'OFF') {
                                runState = '운행';
                            } else if (tagMap['Stop'] && tagMap['Stop'] !== '0' && tagMap['Stop'] !== 'OFF') {
                                runState = '정지';
                            } else if (tagMap['Fault'] && tagMap['Fault'] !== '0' && tagMap['Fault'] !== 'OFF') {
                                runState = tagMap['Fault'];
                            }

                            tbody.innerHTML = `
                                  <tr>
                                    <td>운행 구간</td>
                                    <td>${section}</td>
                                  </tr>
                                  <tr>
                                    <td>운행 상태</td>
                                    <td>${runState}</td>
                                  </tr>
                                  <tr>
                                    <td>운행 방향</td>
                                    <td>${direction}</td>
                                  </tr>
                                `;
                        } else if (poiProperty.poiMiddleCategoryName === '승강기') {
                            let addedGroup1 = false;
                            let addedGroup2 = false;
                            tbody.innerHTML = data.TAGs
                                .map(tag => {
                                    const prefix = tag.tagName.charAt(0);
                                    const suffix = tag.tagName.substring(tag.tagName.lastIndexOf('-') + 1);
                                    let label = '';
                                    let displayValue = tag.currentValue;
                                    if (prefix === 'A' || prefix === 'B') {
                                        // A, B 건물
                                        switch (suffix) {
                                            case 'CurrentFloor':
                                                if (tag.currentValue == '0G') {
                                                    displayValue = 'G';
                                                }
                                                label = '현재 층';
                                                break;
                                            case 'DrivingState':
                                                label = '운행 상태';
                                                break;
                                            case 'Door':
                                                label = '도어';
                                                break;
                                            case 'Direction':
                                                label = '운행 방향';
                                                break;
                                            default:
                                                label = suffix;
                                                break;
                                        }
                                    } else {

                                        if (suffix === 'UpDir') {
                                            label = '운행 방향';
                                            displayValue = (tag.currentValue === '상향') ? '상향' : '하향';
                                        }
                                        else if (suffix === 'Door opened') {
                                            label = '도어';
                                            displayValue = (tag.currentValue === 'OFF') ? '문닫힘' : '문열림';
                                        }
                                        else if (suffix === 'CurrentFloor') {
                                            label = '현재 층';
                                        }
                                        else if ([
                                            'AUTO', 'Fault', 'Checking', 'Parking', 'Independent driving',
                                            'Overweight', '1st fire driving', 'Second fire driving',
                                            'Fire control driving', 'Fire control driving results'
                                        ].includes(suffix)) {
                                            if (tag.currentValue === 'OFF' || tag.currentValue === '0') {
                                                return '';
                                            }

                                            if (['1st fire driving', 'Fire control driving results'].includes(suffix)) {
                                                if (addedGroup1) {
                                                    return '';
                                                } else {
                                                    addedGroup1 = true;
                                                    label = '운행 상태';
                                                }
                                            }
                                            else if (['Second fire driving', 'Fire control driving'].includes(suffix)) {
                                                if (addedGroup2) {
                                                    return '';
                                                } else {
                                                    addedGroup2 = true;
                                                    label = '운행 상태';
                                                }
                                            }
                                            else {
                                                label = '운행 상태';
                                            }
                                        }
                                        else {
                                            return '';
                                        }
                                    }

                                    return `
                                        <tr>
                                            <td>${label}</td>
                                            <td>${displayValue}</td>
                                            ${statusCell}
                                        </tr>
                                    `;
                                })
                                .filter(row => row.trim() !== '')
                                .join('');
                        } else if (['소방', '출입통제', '누수', '비상벨'].includes(poiProperty.poiCategoryName)) {
                            tbody.innerHTML = data.TAGs.map(tag => {
                                const statusText = { 0: '정상', 1: '경보' }[tag.currentValue];
                                return `
                                    <tr>
                                        <td>상태</td>
                                        <td>${statusText}</td>
                                    </tr>
                                `;
                            }).join('');
                        } else if (['비상발전기', '저압 배전반', '특고압 배전반', '특고압 변압기'].includes(poiProperty.poiMiddleCategoryName)) {

                            console.log("poiProperty.poiMiddleCategoryName : ", poiProperty.poiMiddleCategoryName);

                            // GEN일 때도 따로 처리해야됨.
                            // 충전기 전압, 배터리 전압, 주파수, 역률 등등 추가 정보
                            if (poiProperty.poiMiddleCategoryName === '특고압 변압기') {
                                tbody.innerHTML = data.TAGs.map(tag => {
                                    const statusText = { 0: '정상', 1: '경보' }[tag.currentValue];
                                    return `
                                    <tr>
                                        <td>상태</td>
                                        <td>${statusText}</td>
                                    </tr>
                                `;
                                }).join('');
                                return;
                            }
                            const TAG_LABEL_MAP = {
                                "충전기_전압": "충전기 전압",
                                "배터리_전압": "배터리 전압",
                                "주파수": "주파수",
                                "역률": "역률",
                                "R상_전압": "R상 전압",
                                "S상_전압": "S상 전압",
                                "T상_전압": "T상 전압",
                                "R_S_선간전압": "R-S 선간전압",
                                "S_T_선간전압": "S-T 선간전압",
                                "T_R_선간전압": "T-R 선간전압",
                                "R상_전류": "R상 전류",
                                "S상_전류": "S상 전류",
                                "T상_전류": "T상 전류",
                                "3상_유효전력": "유효전력",
                                "3상_무효전력": "무효전력",
                                "유효전력량": "유효 전력량",
                                "무효전력량": "무효 전력량"
                            };

                            const unmatchedTags = [];
                            const unmatchedGroups = {
                                OCR: [],
                                OCGR: [],
                                UVR: [],
                                CB_ON: [],
                                ATS: [],
                                NVR: [],
                                ELD: [],
                                ETC: []
                            };

                            const rowList = data.TAGs.map(tag => {
                                const tagNamePart = tag.tagName.split('-').pop();
                                const parts = tagNamePart.split('_');
                                let key = '';
                                if (parts.length >= 3 && ['R', 'S', 'T', '3상'].includes(parts[parts.length - 3])) {
                                    key = parts.slice(-3).join('_');
                                }
                                else if (parts.length >= 2 && TAG_LABEL_MAP[parts.slice(-2).join('_')]) {
                                    key = parts.slice(-2).join('_');
                                }
                                else if (TAG_LABEL_MAP[parts.slice(-1)[0]]) {
                                    key = parts.slice(-1)[0];
                                }
                                else {
                                    key = '';
                                }

                                if (TAG_LABEL_MAP[key]) {
                                    let unit = '';
                                    switch (true) {
                                        case key.includes('전력량'):
                                            unit = 'kWH';
                                            break;
                                        case key.includes('전류'):
                                            unit = 'A';
                                            break;
                                        case key.includes('전압'):
                                            unit = 'KV';
                                            break;
                                        case key.includes('전력'):
                                            unit = 'kW';
                                            break;
                                        default:
                                            unit = '';
                                    }

                                    return {
                                        label: TAG_LABEL_MAP[key],
                                        value: `${tag.currentValue}${unit}`
                                    };
                                } else {
                                    unmatchedTags.push({
                                        tagName: tag.tagName,
                                        currentValue: tag.currentValue
                                    });
                                    if (tag.tagName.includes('OCR_OCGR')) {
                                        unmatchedGroups.OCR.push({
                                            tagName: tag.tagName,
                                            currentValue: tag.currentValue
                                        });
                                        unmatchedGroups.OCGR.push({
                                            tagName: tag.tagName,
                                            currentValue: tag.currentValue
                                        });
                                    } else if (tag.tagName.includes('OCGR')) {
                                        unmatchedGroups.OCGR.push({
                                            tagName: tag.tagName,
                                            currentValue: tag.currentValue
                                        });
                                    } else if (tag.tagName.includes('OCR')) {
                                        unmatchedGroups.OCR.push({
                                            tagName: tag.tagName,
                                            currentValue: tag.currentValue
                                        });
                                    } else if (tag.tagName.includes('UVR')) {
                                        unmatchedGroups.UVR.push({
                                            tagName: tag.tagName,
                                            currentValue: tag.currentValue
                                        });
                                    } else if (tag.tagName.includes('ATS')) {
                                        unmatchedGroups.ATS.push({
                                            tagName: tag.tagName,
                                            currentValue: tag.currentValue
                                        });
                                    } else if (tag.tagName.includes('NVR')) {
                                        unmatchedGroups.NVR.push({
                                            tagName: tag.tagName,
                                            currentValue: tag.currentValue
                                        });
                                    } else if (tag.tagName.includes('ELD')) {
                                        unmatchedGroups.ELD.push({
                                            tagName: tag.tagName,
                                            currentValue: tag.currentValue
                                        });
                                    } else if (tag.tagName.includes('ACB_ON') || tag.tagName.includes('VCB_ON')) {
                                        unmatchedGroups.CB_ON.push({
                                            tagName: tag.tagName,
                                            currentValue: tag.currentValue
                                        });
                                    } else {
                                        unmatchedGroups.ETC.push({
                                            tagName: tag.tagName,
                                            currentValue: tag.currentValue
                                        });
                                    }

                                    return null;
                                }
                            }).filter(Boolean);

                            if (rowList.length <= 10) {
                                tbody.innerHTML = rowList.map(row => `
                                    <tr>
                                        <td>${row.label}</td>
                                        <td>${row.value}</td>
                                    </tr>
                                `).join('');
                            } else {
                                const thead = popupInfo.querySelector('table thead');
                                thead.innerHTML = `
                                    <tr>
                                        <th>수집정보</th>
                                        <th>측정값</th>
                                        <th style="border-left: 1px solid;">수집정보</th>
                                        <th>측정값</th>
                                    </tr>
                                `;

                                let html = '';
                                for (let i = 0; i < 10; i++) {
                                    const left = rowList[i]
                                        ? `<td>${rowList[i].label}</td><td>${rowList[i].value}</td>`
                                        : `<td>-</td><td>-</td>`;
                                    const right = rowList[i + 10]
                                        ? `<td style="border-left: 1px solid;">${rowList[i + 10].label}</td><td>${rowList[i + 10].value}</td>`
                                        : `<td style="border-left: 1px solid;">-</td><td>-</td>`;

                                    html += `<tr>${left}${right}</tr>`;
                                }

                                tbody.innerHTML = html;

                            }

                            const content = popupInfo.querySelector('.popup-info__content');
                            const oldButtons = content.querySelector('.alert-buttons');
                            if (oldButtons) oldButtons.remove();

                            const buttonWrapper = document.createElement('div');
                            buttonWrapper.className = 'alert-buttons';
                            buttonWrapper.style.marginTop = '12px';
                            buttonWrapper.style.display = 'flex';
                            buttonWrapper.style.flexDirection = 'column';
                            buttonWrapper.style.alignItems = 'center';

                            const row1 = document.createElement('div');
                            row1.style.display = 'flex';
                            row1.style.gap = '8px';
                            row1.style.marginBottom = '8px';

                            const row2 = document.createElement('div');
                            row2.style.display = 'flex';
                            row2.style.gap = '8px';

                            const alertGroups = ['CB_ON', 'OCR', 'OCGR', 'UVR', 'NVR', 'ELD', 'ATS'];
                            alertGroups.forEach((group, i) => {
                                // tag에 있는거만 버튼만듬
                                const groupData = unmatchedGroups[group];
                                const filtered = groupData.filter(tag => tag.tagName.includes(group));
                                if (filtered.length === 0) return;
                                const isActive = unmatchedGroups[group]?.some(tag => tag.currentValue === '1');

                                const btn = document.createElement('button');
                                btn.type = 'button';
                                btn.textContent = group;
                                btn.style.width = '5rem';
                                btn.style.height = '1.8rem';
                                btn.className = 'button button--solid-middle';
                                if (isActive) {
                                    btn.style.backgroundColor = 'red';
                                    btn.style.color = 'white';
                                }

                                if (i < 4) {
                                    row1.appendChild(btn);
                                } else {
                                    row2.appendChild(btn);
                                }
                            });

                            buttonWrapper.appendChild(row1);
                            buttonWrapper.appendChild(row2);
                            content.appendChild(buttonWrapper);

                            // label 색깔 처리 테스트중
                            ['OCR', 'OCGR', 'UVR', 'CB_ON', 'ATS', 'NVR', 'ELD'].forEach(group => {
                                const found = unmatchedGroups[group].find(tag => tag.currentValue == '1');
                                if (found) {
                                    console.log(`${group} group has active tag:`, found);
                                }
                            });

                        }  else if (poiProperty.poiMiddleCategoryName === '무정전전원장치') {

                            const { lineVoltageData, phaseVoltageData, currentData, batteryData, statusBtns } = processUPSData(data.TAGs);
                            const tableHTML = generateUPSTables(lineVoltageData, phaseVoltageData, currentData, batteryData, statusBtns);

                            // 기존 테이블과 버튼들을 제거하고 새로운 테이블들을 추가 (이벤트 리스너 보존)
                            const contentDiv = popupInfo.querySelector('.popup-info__content');
                            const existingTables = contentDiv.querySelectorAll('table');
                            const existingButtons = contentDiv.querySelectorAll('.alert-buttons');
                            existingTables.forEach(table => table.remove());
                            existingButtons.forEach(buttons => buttons.remove());

                            // 새로운 테이블들을 contentDiv에 직접 추가
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = tableHTML;
                            while (tempDiv.firstChild) {
                                contentDiv.appendChild(tempDiv.firstChild);
                            }

                        } else if (poiProperty.poiMiddleCategoryName === 'FPU') {
                            tbody.innerHTML  = data.TAGs.map(tag => {
                                // "A-4-VAV-FPU-104105-4F_FPU_104105_PRI_ACTUAL_FLOW" -> "PRI_ACTUAL_FLOW"
                                const parts = tag.tagName.split('_');
                                const suffix = parts.slice(3).join('_'); // 처음 3개 부분 제거 후 나머지 조인
                                let label = '';
                                let unit = '';
                                switch (suffix) {
                                    case 'SPACE_TEMP':
                                        label = '현재온도';
                                        unit = '℃';
                                        break;
                                    case 'PRI_FLOW_STPT':
                                        label = '요구풍량';
                                        unit = 'm²/s';
                                        break;
                                    case 'PRI_ACTUAL_FLOW':
                                        label = '현재풍량';
                                        unit = 'm²/s';
                                        break;
                                    case 'ACT_ROOM_STPT':
                                        label = '설정온도';
                                        unit = '℃';
                                        break;
                                    case 'MIN_VOLUME':
                                        label = '최소풍량';
                                        unit = 'm²/s';
                                        break;
                                    case 'MAX_VOLUME':
                                        label = '최대풍량';
                                        unit = 'm²/s';
                                        break;
                                    case 'POSITION':
                                        label = '댐퍼개도';
                                        unit = '%';
                                        break;
                                    case 'COOL_HEAT':
                                        label = '냉/난방';
                                        break;
                                    case 'MANUAL_DMP_OPEN':
                                        label = '운전모드';
                                        break;
                                    case 'FAN':
                                        label = '팬운전';
                                        break;
                                    case 'VLV_24V_ON_OFF':
                                        label = '밸브운전';
                                        break;
                                    default:
                                        label = suffix;
                                        break;
                                }

                                return `
                                       <tr>
                                           <td>${label}</td>
                                           <td>${tag.currentValue || '-'}${unit}</td>
                                       </tr>
                                   `;
                            }).join('');
                        }else if(poiProperty.poiMiddleCategoryName === 'VAV'){
                            tbody.innerHTML = data.TAGs.map(tag => {
                                // "A-8-VAV-VAV-108121-8F_VAV_108121_SPACE_TEMP" -> "SPACE_TEMP"
                                const parts = tag.tagName.split('_');
                                const suffix = parts.slice(3).join('_'); // 처음 3개 부분 제거 후 나머지 조인
                                let label = '';
                                let unit = '';

                                switch (suffix) {
                                    case 'SPACE_TEMP':
                                        label = '현재온도';
                                        unit = '℃';
                                        break;
                                    case 'PRI_FLOW_STPT':
                                        label = '요구풍량';
                                        unit = 'm²/s';
                                        break;
                                    case 'PRI_ACTUAL_FLOW':
                                        label = '현재풍량';
                                        unit = 'm²/s';
                                        break;
                                    case 'ACT_ROOM_STPT':
                                        label = '설정온도';
                                        unit = '℃';
                                        break;
                                    case 'MIN_VOLUME':
                                        label = '최소풍량';
                                        unit = 'm²/s';
                                        break;
                                    case 'MAX_VOLUME':
                                        label = '최대풍량';
                                        unit = 'm²/s';
                                        break;
                                    case 'POSITION':
                                        label = '댐퍼개도';
                                        unit = '%';
                                        break;
                                    case 'COOL_HEAT':
                                        label = '냉/난방';
                                        break;
                                    case 'MANUAL_DMP_OPEN':
                                        label = '운전모드';
                                        break;
                                    default:
                                        label = suffix;
                                        break;
                                }

                                return `
                                          <tr>
                                              <td>${label}</td>
                                              <td>${tag.currentValue || '-'}${unit}</td>
                                          </tr>
                                      `;
                            }).join('');
                        } else if(poiProperty.poiMiddleCategoryName === 'PV') {
                            tbody.innerHTML = data.TAGs.map(tag => {
                                // "C-RF-SU-PV-null-현재발전량" -> "현재발전량"
                                const label = tag.tagName.substring(tag.tagName.lastIndexOf('-') + 1);

                                return `
                                          <tr>
                                              <td>${label || '-'}</td>
                                              <td>${tag.currentValue || '-'}</td>
                                          </tr>
                                      `;
                            }).join('');
                        }else if(poiProperty.poiMiddleCategoryName === 'BIPV'){
                            // 태그를 두 그룹으로 분리
                            const regularTags = data.TAGs.filter(tag => !tag.tagName.includes('-G-'));
                            const comprehensiveTags = data.TAGs.filter(tag => tag.tagName.includes('-G-'));

                            const tableHTML = generateBIPVTable(regularTags);
                            const comprehensiveTableHTML = generateBIPVTable(comprehensiveTags);
                            console.log("comprehensiveTableHTML", comprehensiveTableHTML);

                            const contentDiv = popupInfo.querySelector('.popup-info__content');
                            const existingTables = contentDiv.querySelectorAll('table');
                            existingTables.forEach(table => table.remove());

                            // 새로운 테이블들을 contentDiv에 직접 추가
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = tableHTML;
                            tempDiv.innerHTML += comprehensiveTableHTML;
                            contentDiv.appendChild(tempDiv.firstChild);
                            contentDiv.appendChild(tempDiv.firstChild);
                        } else if(poiProperty.poiMiddleCategoryName == "연료전지") {
                            tbody.innerHTML = data.TAGs.map(tag => {
                                const parts = tag.tagName.split('-');
                                const suffix = parts[parts.length - 1];
                                let label = '';
                                let unit = '';

                                switch (suffix) {
                                    case 'LNGConsum':
                                        label = 'LNG소비량';
                                        unit = 'Nm³';
                                        break;
                                    case 'GenKwh':
                                        label = '발전량';
                                        unit = 'kWh';
                                        break;
                                    case 'GenKCal':
                                        label = '생산열량';
                                        unit = 'Kcal';
                                        break;
                                    default:
                                        label = suffix;
                                        break;
                                }

                                return `
                                          <tr>
                                              <td>${label}</td>
                                              <td>${tag.currentValue || '-'}${unit}</td>
                                          </tr>
                                      `;
                            }).join('');
                        }

                        else {
                            tbody.innerHTML = data.TAGs.map(tag => {
                                const statusCell = poiProperty.poiCategoryName === '공기질센서'
                                    ? `<td>${getStatusText(tag.S)}</td>`
                                    : '';
                                return `
                                    <tr>
                                        <td>${tag.label}</td>
                                        <td>${tag.desc}</td>
                                        ${statusCell}
                                    </tr>
                                `;
                            }).join('');
                        }
                    } else {
                        tbody.innerHTML = `
                                <tr>
                                    <td colspan="3">태그 데이터가 없습니다.</td>
                                </tr>
                            `;
                    }

                    // 업데이트 시간 갱신
                    popupInfo.querySelector('.date .timestamp').textContent =
                        `업데이트 일시 : ${new Date().toLocaleString()}`;
                } catch (error) {
                    console.error('태그 데이터 조회 실패:', error);
                    const tbody = popupInfo.querySelector('tbody');
                    tbody.innerHTML = `
                <tr>
                    <td colspan="3">데이터 조회에 실패했습니다.</td>
                </tr>
            `;
                }
            };

            // 초기 데이터 로드
            await updateTagData();

            // 새로고침 이벤트
            const refreshBtn = popupInfo.querySelector('.date__refresh');
            refreshBtn.addEventListener('click', updateTagData);

            // 닫기 이벤트
            const closeBtn = popupInfo.querySelector('.close');
            closeBtn.addEventListener('click', () => {
                // 이벤트 리스너 제거
                refreshBtn.removeEventListener('click', updateTagData);
                // 팝업 제거
                popupInfo.remove();
            });

            // 위치 설정
            const {x, y} = Px.Poi.Get2DPosition(poiInfo.id);
            popupInfo.style.position = 'fixed';
            popupInfo.style.zIndex = '9999';
            popupInfo.style.left = `${x}px`;
            popupInfo.style.top = `${y}px`;

            document.body.appendChild(popupInfo);

            const updatePosition = () => {
                const { x, y } = Px.Poi.Get2DPosition(poiInfo.id);
                popupInfo.style.left = `${x}px`;
                popupInfo.style.top = `${y}px`;

                if (!activePopups.has(poiInfo.id)) return;
                requestAnimationFrame(updatePosition);
            };

            activePopups.set(poiInfo.id, { dom: popupInfo });
            updatePosition();
        }
    }

    document.addEventListener('change', async function (e) {
        // CCTV 모드 라디오 버튼 변경 시
        if (e.target.matches('input[name^="cctv-mode-"]')) {
            const selectedValue = e.target.value;
            const poiId = e.target.name.replace('cctv-mode-', '');
            const poiInfo = Px.Poi.GetData(poiId);
            const cameraIp = poiInfo.property.cameraIp;
            const canvasId = `cctv-${poiId}`;
            const player = window.livePlayers[canvasId];
            const cctvContainer = document.querySelector('.main-cctv-item');
            const controlButtons = cctvContainer.querySelectorAll('.cctv-controls-btn');

            // 모드에 따른 처리
            if (selectedValue === 'live') {
                player.stopPlayback(); // playback 정지
                player.isLive = true; // player live 상태
                document.querySelector('.cctv-footer').style.display = 'none'; // 하단 playback 메뉴 비활성화

                controlButtons.forEach(btn => {
                    btn.disabled = true;
                });

                await EventManager.playLiveStream(canvasId, cameraIp); // live 실행

            } else if (selectedValue === 'playback') {
                player.cancelDraw && player.cancelDraw(); // live 정지
                player.isLive = false; // player playback 상태
                controlButtons.forEach(btn => {
                    btn.disabled = false;
                });

                // 하단 활성화
                document.querySelector('.cctv-footer').style.display = 'flex'; // 하단 playback 메뉴 활성화
            }
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target.matches('.cctv-controls-btn')) {
            const button = e.target.closest('.cctv-controls-btn');
            handlePlayButton(button);
        }
    });


    async function handlePlayButton(button) {
        console.log(button.getAttribute('data-btn-type'));

        // 버튼이 속한 CCTV 팝업의 ID 찾기
        const cctvContainer = button.closest('.main-cctv-item');
        if (!cctvContainer) {
            return;
        }
        const canvas = cctvContainer.querySelector('canvas');
        const canvasId = canvas.id;
        const player = window.livePlayers[canvasId];
        const btnType = button.getAttribute('data-btn-type');

        if (!player.cameraIp) {
            const poiId = canvasId.slice(5);
            const poiInfo = Px.Poi.GetData(poiId);
            player.cameraIp = poiInfo.property.cameraIp;

        }

        switch (btnType) {
            case 'play':
                if(player.isPaused) {
                    // 일시정지 상태에서 재생
                    console.log("일시정지 상태에서 재생");
                    player.resumePlayback();
                }else {
                    // 처음 재생
                    console.log("처음 재생");
                    const dateValue = document.querySelector('.cctv-footer input[type="date"]').value;
                    const timeValue = document.querySelector('.cctv-footer input[type="time"]').value;

                    if(!dateValue || !timeValue) {
                        alertSwal("재생할 날짜와 시간을 선택해주세요.");
                        return;
                    }
                    const startDate = new Date(`${dateValue}T${timeValue}`);
                    // 임시로 30분 설정
                    const endTime = {
                        minutes:30
                    }
                    await EventManager.playPlaybackStream(canvasId, player.cameraIp, startDate, endTime);
                }
                player.isPaused = false;
                break;
            case 'pause':
                player.isPaused = true; // 일시정지 상태로 변경
                player.pausePlayback();
                break;
            case 'stop':
                player.isPaused = false; // 일시정지 상태 해제
                player.stopPlayback();
                break;
        }
    }

    function resetPlaybackState(canvasId) {
        const player = window.livePlayers[canvasId];
        if (player) {
            player.isPaused = false;
            player.stopPlayback();
        }
    }

    document.addEventListener('change', function(e) {
        if (e.target.matches('.cctv-bottom input[type="date"], .cctv-bottom input[type="time"]')) {
            const cctvContainer = e.target.closest('.main-cctv-item, .cctv-item');
            if (!cctvContainer) return;
            const canvas = cctvContainer.querySelector('canvas');
            if (!canvas) return;
            const canvasId = canvas.id;
            resetPlaybackState(canvasId);
        }
    });

    function processUPSData(apiData) {
        const lineVoltageData = { input: {}, output: {} };  // 선간전압
        const phaseVoltageData = { input: {}, output: {} }; // 상간전압
        const currentData = { input: {}, output: {} };      // 전류
        const batteryData = {}; // 축전지 및 기타 단일 데이터
        const statusBtns = {};


        apiData.forEach(item => {
            const { tagName, currentValue } = item;
            const type = tagName.includes('입력') ? 'input' : 'output';

            if (tagName.includes('선간전압')) {
                // 선간전압: L1_L2, L2_L3, L3_L1
                const phase = tagName.split('_').slice(-2).join('_');
                lineVoltageData[type][phase] = currentValue;
            } else if (tagName.includes('상간전압')) {
                // 상간전압: L1_N, L2_N, L3_N
                const phase = tagName.split('_').slice(-2).join('_');
                phaseVoltageData[type][phase] = currentValue;
            } else if (tagName.includes('전류') && (tagName.includes('입력전류') || tagName.includes('출력전류'))) {
                // 전류: L1, L2, L3
                const phase = tagName.split('_').pop();
                currentData[type][phase] = currentValue;
            } else if (tagName.includes('축전지전압')) {
                batteryData.voltage = currentValue;
            } else if (tagName.includes('축전지전류')) {
                batteryData.current = currentValue;
            } else if (tagName.includes('출력주파수')) {
                batteryData.frequency = currentValue;
            } else if(tagName.includes('BYPASSMODE_OFF')) {
                statusBtns.BYPASSMODE_OFF = currentValue;
            } else if(tagName.includes('배터리방전')) {
                statusBtns.배터리방전 = currentValue;
            } else if(tagName.includes('정류부불량')) {
                statusBtns.정류부불량 = currentValue;
            } else if(tagName.includes('인버터이상')) {
                statusBtns.인버터이상 = currentValue;
            } else if(tagName.includes('온도이상')) {
                statusBtns.온도이상 = currentValue;
            }
        });

        return { lineVoltageData, phaseVoltageData, currentData, batteryData, statusBtns };
    }

    function generateUPSTables(lineVoltageData, phaseVoltageData, currentData, batteryData, statusBtns) {
        // 표1: 선간전압
        const lineVoltageTable = `
            
                <table style="width: 100%; margin-bottom: 1rem;">
                    <thead>
                        <tr>
                            <th>PHASE</th>
                            <th>입력선간전압</th>
                            <th>출력선간전압</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${['L1_L2', 'L2_L3', 'L3_L1'].map(phase => `
                            <tr>
                                <td>V ${phase}</td>
                                <td>${lineVoltageData.input[phase] || '-'}V</td>
                                <td>${lineVoltageData.output[phase] || '-'}V</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
          
        `;

        // 표2: 상간전압
        const phaseVoltageTable = `
           
                <table style="width: 100%; margin-bottom: 1rem;">
                    <thead>
                        <tr>
                            <th>PHASE</th>
                            <th>입력상간전압</th>
                            <th>출력상간전압</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${['L1_N', 'L2_N', 'L3_N'].map(phase => `
                            <tr>
                                <td>V ${phase}</td>
                                <td>${phaseVoltageData.input[phase] || '-'}V</td>
                                <td>${phaseVoltageData.output[phase] || '-'}V</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
           
        `;

        // 표3: 전류
        const currentTable = `
           
                <table style="width: 100%;margin-bottom: 1rem;">
                    <thead>
                        <tr>
                            <th>PHASE</th>
                            <th>입력전류</th>
                            <th>출력전류</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${['L1', 'L2', 'L3'].map(phase => `
                            <tr>
                                <td>A ${phase}</td>
                                <td>${currentData.input[phase] || '-'}A</td> 
                                <td>${currentData.output[phase] || '-'}A</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            
        `;

        // 표4: 축전지 및 주파수
        const batteryTable = `
           
                <table style="width: 100%; margin-bottom: 1rem;">
                    <thead>
                        <tr>
                            <th>축전지전압</th>
                            <th>축전지전류</th>
                            <th>출력주파수</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${batteryData.voltage || '-'}V</td>
                            <td>${batteryData.current || '-'}A</td>
                            <td>${batteryData.frequency || '-'}Hz</td>
                        </tr>
                    </tbody>
                </table>
          
        `;

        // UPS 상태 버튼들
        const statusButtons = `
            <div class="alert-buttons" style="margin-top: 12px; display: flex; flex-direction: column; align-items: center;">
                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    ${statusBtns.BYPASSMODE_OFF !== undefined ? `
                        <button type="button" class="button button--solid-middle" style="width: 5rem; height: 1.8rem; ${statusBtns.BYPASSMODE_OFF === '1' ? 'background-color: red; color: white;' : ''}">
                            인버터
                        </button>
                    ` : ''}
                    ${statusBtns.배터리방전 !== undefined ? `
                        <button type="button" class="button button--solid-middle" style="width: 5rem; height: 1.8rem; ${statusBtns.배터리방전 === '1' ? 'background-color: red; color: white;' : ''}">
                            배터리방전
                        </button>
                    ` : ''}
                    ${statusBtns.정류부불량 !== undefined ? `
                        <button type="button" class="button button--solid-middle" style="width: 5rem; height: 1.8rem; ${statusBtns.정류부불량 === '1' ? 'background-color: red; color: white;' : ''}">
                            정류부불량
                        </button>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 8px;">
                    ${statusBtns.인버터이상 !== undefined ? `
                        <button type="button" class="button button--solid-middle" style="width: 5rem; height: 1.8rem; ${statusBtns.인버터이상 === '1' ? 'background-color: red; color: white;' : ''}">
                            인버터이상
                        </button>
                    ` : ''}
                    ${statusBtns.온도이상 !== undefined ? `
                        <button type="button" class="button button--solid-middle" style="width: 5rem; height: 1.8rem; ${statusBtns.온도이상 === '1' ? 'background-color: red; color: white;' : ''}">
                            온도이상
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        return lineVoltageTable + phaseVoltageTable + currentTable + batteryTable + statusButtons;
    }

    function generateBIPVTable(data) {
        const tbody = data.map(tag => {
            const tagName = tag.tagName.substring(tag.tagName.lastIndexOf('-') + 1);
            let label = '';

            switch (tagName) {
                case 'KW':
                    label = '현재 발전량';
                    break;
                case 'Today_GEN':
                    label = '금일 발전량';
                    break;
                case 'Total_GEN':
                    label = '누적 발전량';
                    break;
                case '현재발전량':
                    label = '종합 현재발전량';
                    break;
                case '금일발전량':
                    label = '종합 금일발전량';
                    break;
                case '급일발전량':
                    label = '종합 급일발전량';
                    break;
                case '누적발전량':
                    label = '종합 누적발전량';
                    break;
                default:
                    label = tagName;
                    break;
            }

            return `
                <tr>
                    <td>${label}</td>
                    <td>${tag.currentValue || '-'}</td>
                </tr>
            `;
        }).join('');

        return `<table style="width: 100%;">
                    <thead>
                        <tr>
                            <th>수집정보</th>
                            <th>측정값</th>
                        </tr>
                    </thead>
                <tbody>
                    ${tbody}
                </tbody>
        </table>`;
    }

    // poi 상태
    const getStatusText = (code) => {
        const STATUS = {
            0: 'Normal',
            1: 'Failed',
            2: 'OutOfService',
            4: 'SystemAlarm',
            128: 'Unload'
        };
        return STATUS[code];
    }


    function throttle(callback, interval) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if ((now - lastCall) >= interval) {
                lastCall = now;
                callback(...args);
            }
        }
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
                firstViewButton.classList.remove('active');
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

    function setButtonIconColor(button, color) {
        const buttonIcons = button.querySelectorAll('svg path');
        buttonIcons.forEach((buttonIcon) => {
            buttonIcon.setAttribute('stroke', color);
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
                }
            },
        );
    }

    function handle2D(buildingId) {
        addButtonPointerEvent(
            camera2D,
            () => {
                // TODO: top-view 위치
                const building = BuildingManager.findById(buildingId);
                let option = '';
                const camera2dStr = building?.camera2d;
                if (camera2dStr === null || camera2dStr === "" || camera2dStr === undefined) {
                    option = {
                        position: {x: -134.91073489593867, y: 4048.653041121009, z: -418.59942425930194},
                        rotation: {x: 0, y: 0, z: 0},
                        target: {x: -134.91382798752565, y: 6.060831375368665e-14, z: -418.59681190865894}
                    };
                    Px.Camera.SetOrthographic();
                }else{
                    option = JSON.parse(camera2dStr);
                }
                option.onComplete = () => {
                    Px.Camera.SetOrthographic();
                };
                Px.Camera.SetState(option);
            },
            () => {
                const building = BuildingManager.findById(buildingId);
                const option = JSON.parse(building.camera3d);
                if (option === null) {
                    console.error('3D 카메라 정보가 없습니다.');
                    return;
                }
                option.onComplete = () => {
                    Px.Camera.SetPerspective();
                }
                Px.Camera.SetState(option);

            },
        );
    }

    const buildingDblclick = async (buildingInfo) => {
        const {area_no} = buildingInfo.property;
        const building = BuildingManager.findAll().find(building => building.code != null && building.code.split("-")[1] === area_no);

        if (building == null) {
            return;
        }

        Px.Model.Clear();
        Px.Poi.Clear();
        Px.VirtualPatrol.Clear();
        Px.Evac.Clear();

        popup.closeAllPopup();
        BUILDING_ID = building.id;
        await initializeIndoorBuilding();
        setBuildingNameAndFloors();
    }

    const renderingBuildingNameDom = (data) => {
        const {pointerEventData, property} = data;
        // const buildingName = document.getElementById('buildingName');
        const buildingName = document.querySelector('ul.header__tab li.active a');
        if (property === null || !BuildingManager.findAll().some(building => building.code != null && building.code.split("-")[1] === property.area_no)) {
            buildingName.style.display = 'none';
            buildingName.style.zIndex = '0';
            buildingName.style.left = '';
            buildingName.style.top = '';
            return;
        } else {
            const building = BuildingManager.findAll().find(building => building.code != null && building.code.split("-")[1] === property.area_no );
            if (building === undefined) {
                buildingName.style.display = 'none';
                buildingName.style.zIndex = '0';
                buildingName.style.display = 'none';
                buildingName.style.left = '';
                buildingName.style.top = '';
                return;
            }
            buildingName.style.zIndex = 45;
            buildingName.style.display = 'flex';
            buildingName.style.position = 'absolute';
            buildingName.style.left = `${pointerEventData.clientX}px`;
            buildingName.style.top = `${pointerEventData.clientY-50}px`;
            buildingName.innerHTML = building.name;
        }
    }

    const renderingPoiList = () => {
        const poiCategoryList = PoiCategoryManager.findAll();
        const poiCategoryBox = document.querySelector('#poiCategoryBox');
        const categorySelect = document.querySelector('.equipment-category-select');
        const categoryList = document.querySelector('.equipment-category-list');

        categorySelect.innerHTML = '';
        categoryList.innerHTML = '';
        poiCategoryBox.innerHTML = '';

        const isDefault = poiCategoryList[0];

        poiCategoryList?.forEach((poiCategory, index) => {
            const {id, name} = poiCategory;

            poiCategoryBox.innerHTML += `
           <div class='poi-category'>
                <input type='checkbox' id='poiCategory${index}' value='${id}' checked>
                <label for='poiCategory${index}'></label>
                <span class='poi-category-name on'>${name.toUpperCase()}</span>
            </div>
        `

            categorySelect.innerHTML = `
            <span class="selected-category">${isDefault.name} <span class="equipment-quantity"></span></span>
            <img src="/static/images/viewer/icons/arrow/down.png" alt="arrow" />
        `;
            categorySelect.dataset.eventCategory = isDefault.id;

            categoryList.innerHTML += `<li class="event-count" data-event-category=${id}>${name} <span class="equipment-quantity"></span></li>`;
        });

        categoryList.style.display = 'none';

        const floorTabContainer = document.querySelector('.equipment-location .floor-tab');
        const floorTab = floorTabContainer.querySelectorAll('.floor');

        floorTabContainer.addEventListener('click', (event) => {
            const clickedFloor = event.target.closest('.floor');
            if (clickedFloor) {
                floorTab.forEach((floor) => {
                    floor.classList.remove('on');
                });

                const floorId = clickedFloor.dataset.floor;
                const categoryId = categorySelect.getAttribute('data-event-category')

                clickedFloor.classList.add('on');

                popup.filterPoi(floorId, categoryId);
            }
        });

        poiCategoryBox
            .querySelectorAll('INPUT[type=checkbox]')
            .forEach((checkbox) => {
                checkbox.addEventListener('change', (event) => {
                    const poiCategoryId = event.target.value;
                    const isChecked = event.target.checked;
                    const poiCategoryName = event.target.parentNode.querySelector('.poi-category-name');

                    if (!isChecked) {
                        Px.Poi.HideByProperty("poiCategoryId", Number(poiCategoryId));
                        poiCategoryName.classList.remove('on');
                        return;
                    }
                    // Px.Poi.ShowByProperty("poiCategoryId", Number(poiCategoryId));
                    poiCategoryName.classList.add('on')
                    const floorName = document.querySelector("body > main > div.left-information > div.floor").dataset.floorName;
                    if(floorName) {
                        BuildingManager.findById(BUILDING_ID).getDetail().then((data) => {
                            const {id: floorNo} = data.floors.find(floor => floor.floorName === floorName);
                            Px.Poi.ShowByPropertyArray({"floorNo": floorNo, "poiCategoryId": Number(poiCategoryId)});
                        });
                    } else {
                        Px.Poi.ShowByPropertyArray({"poiCategoryId": Number(poiCategoryId)});
                    }
                });
            });
        let defaultCategoryId;

        PoiCategoryManager.findAll().forEach((category, index) => {
            const poiData = PoiManager.findByPoiCategory(BUILDING_ID, '', category.id).filter((poi) => poi.position !== null)
            const defaultCount = document.querySelector(`.selected-category .equipment-quantity`)
            const count = document.querySelector(`.event-count[data-event-category="${category.id}"] .equipment-quantity`);
            count.textContent = `(${poiData.length.toString()})`;

            if (index === 0) {
                defaultCategoryId = category.id;
                const defaultData = PoiManager.findByPoiCategory(BUILDING_ID, '', String(defaultCategoryId)).filter((poi) => poi.position !== null)

                defaultCount.textContent = `(${defaultData.length.toString()})`;
            }
            popup.filterPoi('', defaultCategoryId)
        })
    }

    const setBuildingNameAndFloors = () => {
        const {name, floors} = BuildingManager.findById(BUILDING_ID)
        document.querySelector('.left-information .building .txt').innerHTML = name;
        let html = '<li class="on" data-floor-name="">전체층</li>';
        let equipmentFloorHTML = '<li class="floor on" data-floor="" data-floor-name="">전체층</li>';
        floors.forEach((floor) => {
            const {id, floorName} = floor;
            html += `<li data-floor-name=${floorName}>${floorName}</li>`;
            equipmentFloorHTML += `<li class="floor" data-floor=${id}>${floorName}</li>`;
        })
        document.querySelector('.left-information .floor .floor-list').innerHTML = html;

        const floorTabContainer = document.querySelector('.equipment-location .floor-tab');
        floorTabContainer.innerHTML = '';

        if (floors.length < 2) {
            document.querySelector('.left-information .floor').classList.add('hidden');
            document.querySelector('.equipment-location .location').innerText = name;
        } else {
            document.querySelector('.left-information .floor').classList.remove('hidden');

            // 좌측 위 층변경 버튼
            document.querySelectorAll('.left-information .floor .floor-list li').forEach((floor) => {
                floor.addEventListener('click', (event) => {
                    const {floorName} = event.currentTarget.dataset;
                    if(floorName === '') {
                        resetFloorName();
                        changeFloor(floorName);
                        return;
                    }
                    document.querySelector("body > main > div.left-information > div.floor").dataset.floorName = floorName;
                    document.querySelector("body > main > div.left-information > div.floor > div").classList.remove('on');
                    document.querySelector("body > main > div.left-information > div.floor > ul").classList.remove('on');

                    changeFloor(floorName);
                })
                //장비목록 내부 건물명 & 층변경

                floorTabContainer.innerHTML = equipmentFloorHTML;
                document.querySelector('.equipment-location .location').innerText = name;
                floorTabContainer.querySelectorAll('.floor').forEach((floor) => {
                    floor.addEventListener('click', (event) => {
                        floorTabContainer.querySelector('.floor.on').classList.remove('on');
                        const target = event.currentTarget;
                        const {floor: floorId} = target.dataset;
                        target.classList.add('on');

                        // const {eventCategory: categoryId} = document.querySelector('.event-count.on').dataset;
                        popup.filterPoi(floorId, '');
                    })
                })

            });

        }
    }

    const resetFloorName = () => {
        document.querySelector("body > main > div.left-information > div.floor").dataset.floorName = '';
        document.querySelector("body > main > div.left-information > div.floor > .btn-floor-change > .txt").textContent = '전체층';
        document.querySelector("body > main > div.left-information > div.floor > div").classList.remove('on');
        document.querySelector("body > main > div.left-information > div.floor > ul").classList.remove('on')
    }

    const changeFloor = (floorName, onComplete) => {
        const {floors, camera3d} = BuildingManager.findById(BUILDING_ID);
        if (floorName === '') {
            Px.Poi.ShowAll();
            Px.Model.Visible.ShowAll();
            Px.Model.Expand({
                duration: 200,
                interval: 100,
                name: floors[0].floorName,
                onComplete: () => {
                Px.Camera.ExtendView();
            }
            });


        } else {
            Px.Model.Collapse({
                duration: 0,
                onComplete: () => {
                    Px.Model.Visible.HideAll();
                    Px.Model.Visible.Show(floorName);

                    Px.Poi.HideAll();

                    const {id: floorNo} = floors.find(floor => floor.floorName === floorName);
                    Px.Poi.ShowByProperty("floorNo", floorNo);

                    if (onComplete) onComplete();
                }
            });
        }
        if(camera3d) Px.Camera.SetState(JSON.parse(camera3d));

    }

    return {
        initializeIndoorBuilding,
        poiDblclick,
        setBuildingNameAndFloors,
        changeFloor,
        getBuilding,
        renderPoiInfo,
        getPoiRenderingAndList
    }
})();