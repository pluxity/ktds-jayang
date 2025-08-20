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
                            TagManager.clearTags();
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
        await PoiManager.renderAllPoiToEngineByBuildingId(buildingId);
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
                    initPoi(buildingId).then(() => {
                        moveToPoiFromSession();
                    });
                    Px.Util.SetBackgroundColor('#333333');
                    Px.Camera.FPS.SetHeightOffset(15);
                    Px.Camera.FPS.SetMoveSpeed(500);
                    Px.Camera.EnableScreenPanning();
                    // PoiManager.renderAllPoiToEngineByBuildingId(buildingId);
                    Px.Event.On();
                    Px.Event.AddEventListener('dblclick', 'poi', (poiInfo) => {
                        const clickedPoiId = String(poiInfo.id);
                        const allPopups = document.querySelectorAll('.popup-info');
                        let samePopupOpen = false;
                        allPopups.forEach(popup => {
                            const poiIdInput = popup.querySelector('.poi-id');
                            const popupPoiId = poiIdInput?.value;

                            if (popupPoiId === clickedPoiId) {
                                popup.remove();
                                TagManager.clearTags();
                                layerPopup.closePlayers();
                                samePopupOpen = true;
                            } else {
                                layerPopup.closePlayers();
                                popup.remove();
                                TagManager.clearTags();
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

                    Px.Effect.Outline.HoverEventOn('area_no');
                    if(building?.camera3d)
                        Px.Camera.SetState(JSON.parse(building.camera3d));

                    contents.style.position = 'static';
                    initializeTexture();
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

    const moveToPoiFromSession = async () => {

        const mainCctv = JSON.parse(sessionStorage.getItem('mainCctv'));
        const selectedPoiId = JSON.parse(sessionStorage.getItem('selectedPoiId'));


        if (selectedPoiId) {
            moveToPoi(selectedPoiId);
            Px.Poi.Show(selectedPoiId);
            const poiData = Px.Poi.GetData(selectedPoiId);
            await renderPoiInfo(poiData);
        }

        if (mainCctv) {
            const mainCCTVTemplate = await EventManager.createMainCCTVPopup(mainCctv);
            mainCCTVTemplate.style.position = 'fixed';
            mainCCTVTemplate.style.top = '50%';
            mainCCTVTemplate.style.transform = 'translateY(-50%)';
            mainCCTVTemplate.style.left = `${(window.innerWidth / 2) - mainCCTVTemplate.offsetWidth}px`;
        }

        // 세션 스토리지 정리
        sessionStorage.removeItem('mainCctv');
        sessionStorage.removeItem('selectedPoiId');
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
            console.warn("POI 데이터가 없습니다. ID:", poiId);
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
        if (poiInfo.group.toLowerCase() === "cctv") {
            const poiProperty = poiInfo.property;
            const cctvTemplate = document.getElementById('cctv-popup-template');
            const popupInfo = cctvTemplate.content.cloneNode(true).querySelector('.popup-info');
            const canvasId = `cctv-${poiInfo.id}`;

            // 데이터 바인딩
            popupInfo.querySelector(`[data-camera-name]`).textContent = poiProperty.name;
            popupInfo.querySelector('.video__container canvas').id = canvasId;

            const cameraNameEl = popupInfo.querySelector(`[data-camera-name]`);
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.className = 'poi-id';
            hiddenInput.value = poiInfo.id;
            cameraNameEl.parentNode.insertBefore(hiddenInput, cameraNameEl.nextSibling);

            const {x, y} = Px.Poi.Get2DPosition(poiInfo.id);
            popupInfo.style.position = 'fixed';
            popupInfo.style.zIndex = '999';
            popupInfo.style.left = `${x}px`;
            popupInfo.style.top = `${y}px`;

            document.body.appendChild(popupInfo);
            setupCctvControls(popupInfo, poiProperty);

            const updatePosition = () => {
                const { x, y } = Px.Poi.Get2DPosition(poiInfo.id);
                popupInfo.style.left = `${x}px`;
                popupInfo.style.top = `${y}px`;

                if (!activePopups.has(poiInfo.id)) return;
                requestAnimationFrame(updatePosition);
            };

            activePopups.set(poiInfo.id, { dom: popupInfo });
            updatePosition();

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

            console.log("poiProperty : ", poiProperty);

            popupInfo.className = 'popup-info';
            const statusCell = poiProperty.poiCategoryName === '공기질'
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

            if (poiProperty.poiCategoryName == "조명") {
                const head = popupInfo.querySelector('.popup-info__head');
                head.querySelectorAll('h2').forEach(h => h.remove());

                const h2 = document.createElement('h2');
                h2.append(document.createTextNode(`${poiProperty.lightGroup || ''}`));
                h2.append(document.createElement('br'));
                h2.append(document.createTextNode(poiProperty.name));

                const hidden = head.querySelector('input.poi-id');
                hidden.after(h2);
            }

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

            // 태그 등록 및 조회
            const result = await TagManager.addTagsAndShowTagData(poiProperty, popupInfo, statusCell);
            if (!result.success) {
                // 에러 처리
                const tbody = popupInfo.querySelector('tbody');
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3">데이터 조회에 실패했습니다.</td>
                    </tr>
                `;
            }

            // 새로고침 이벤트
            const refreshBtn = popupInfo.querySelector('.date__refresh');
            refreshBtn.addEventListener('click', () => {
                TagManager.mapTagDataToPopup(poiProperty, popupInfo);
            });

            // 닫기 이벤트
            const closeBtn = popupInfo.querySelector('.close');
            closeBtn.addEventListener('click', (event) => {

                // 조명 poi일 때는 선택도 풀리게
                const poiId = document.querySelector('.popup-info .poi-id')?.value || null;
                const poiData = Px.Poi.GetData(Number(poiId));
                if (poiData.group == '조명') {
                    Px.Poi.RestoreColorAll();
                    selectedGroup = null;
                    selectedId = null;
                }
                // 이벤트 리스너 제거
                refreshBtn.removeEventListener('click', () => {
                    TagManager.mapTagDataToPopup(poiProperty, popupInfo);
                });
                // 팝업 제거
                popupInfo.remove();
                TagManager.clearTags();
            });
        }
    }

    // 재생 버튼 색상과 날짜 초기화 함수
    function resetPlaybackControls(popupInfo) {
        // 재생 버튼 색상 초기화
        popupInfo.querySelectorAll('.playback__button').forEach(btn => {
            btn.style.backgroundColor = '';
        });

        // 날짜/시간 입력값 초기화
        popupInfo.querySelector('#startDate').value = '';
        popupInfo.querySelector('#startTime').value = '';
        popupInfo.querySelector('#endHours').value = '0';
        popupInfo.querySelector('#endMinutes').value = '30';
        popupInfo.querySelector('#endSeconds').value = '0';
    }

    async function setupCctvControls(popupInfo, poiInfo) {
        resetPlaybackControls(popupInfo);

        // LIVE/PLAYBACK 모드 전환
        const liveBtn = popupInfo.querySelector('.button--solid-middle');
        const playbackBtn = popupInfo.querySelector('.button--ghost-lower');
        const canvasId = `cctv-${poiInfo.id}`;
        const cameraIp = poiInfo.cameraIp;

        liveBtn.addEventListener('click', async () => {
            resetPlaybackControls(popupInfo);

            const player = window.livePlayers[canvasId];
            if (player) {
                player.cameraIp = cameraIp; // player에 카메라 IP 설정

                // player 상태 초기화
                if (player.isPaused === undefined) {
                    player.isPaused = false;
                }
            }

            if(player){
                player.stopPlayback(); // playback 정지
                player.isLive = true; // player live 상태
            }
            liveBtn.classList.add('button--solid-middle');
            liveBtn.classList.remove('button--ghost-lower');
            playbackBtn.classList.add('button--ghost-lower');
            playbackBtn.classList.remove('button--solid-middle');

            // LIVE 모드 활성화
            await EventManager.playLiveStream(canvasId, cameraIp); // live 실행
        });

        playbackBtn.addEventListener('click', () => {
            const player = window.livePlayers[canvasId];
            if (player) {
                player.cameraIp = cameraIp; // player에 카메라 IP 설정

                player.onPlaybackError = (errorType, message) => {
                    console.log("Playback Error:", errorType, message);

                    popupInfo.querySelectorAll('.playback__button').forEach(btn => {
                        btn.style.backgroundColor = '';
                    });

                    // 재생 상태 초기화
                    if (player.isPaused !== undefined) {
                        player.isPaused = false;
                    }

                    // 에러 타입별 처리
                    switch (errorType) {
                        case "NO_DATA":
                            console.log("해당 시간에 데이터가 없음");
                            break;
                        case "NETWORK_ERROR":
                            console.log("네트워크 오류");
                            break;
                        default:
                            console.log("알 수 없는 오류");
                    }
                };
            }
            playbackBtn.classList.add('button--solid-middle');
            playbackBtn.classList.remove('button--ghost-lower');
            liveBtn.classList.add('button--ghost-lower');
            liveBtn.classList.remove('button--solid-middle');

            resetPlaybackControls(popupInfo); // 재생 버튼 색상과 날짜 초기화

            // PLAYBACK 모드 활성화
            if(player) {
                player.cancelDraw && player.cancelDraw(); // live 정지
                player.isLive = false; // player playback 상태
            }
        });

        // PTZ 컨트롤 설정
        setUpPtzControls(popupInfo);


        let joystick = new JOYSTICK(document.getElementById('joystick-area'));

        const throttledLivePlayMove = throttle(async (canvasId, x, y) => {
            await EventManager.livePlayMove(canvasId, x, y);
        }, 100);

        joystick.stick.addEventListener('moveStick', async (e) => {
            await throttledLivePlayMove(canvasId, e.detail.x, e.detail.y);
        })


        await EventManager.playLiveStream(canvasId, cameraIp); // live 실행
    }

    function setUpPtzControls(popupInfo) {
        // PTZ 요소들이 있는지 확인 (특정 팝업 내에서만)
        const ptzViewer = popupInfo.querySelector('.ptz-viewer');
        if (!ptzViewer) return;

        // PTZ 제어 패널 토글
        const handleToggleControlPanel = () => {
            const panel = popupInfo.querySelector('#slidePanel');
            const isActive = panel.classList.contains('ptz-viewer__panel--active');

            if (isActive) {
                panel.classList.remove('ptz-viewer__panel--active');
            } else {
                panel.classList.add('ptz-viewer__panel--active');
            }
        };

        const handleModeSwitch = async (mode) => {
            const playbackContainer = popupInfo.querySelector('.playback');
            const modeBtns = popupInfo.querySelectorAll('.playback__mode .button');
            const actionGroup = popupInfo.querySelector('.playback__action');
            const actionButtons = actionGroup?.querySelectorAll('.playback__button');

            // 시간 설정 컨트롤
            const timeControls = popupInfo.querySelector('#timeControls');

            // PTZ 컨트롤
            const joystick = popupInfo.querySelector('.joystick');
            const ptzControls = popupInfo.querySelector('.controls');
            const resetBtn = popupInfo.querySelector('.controls__reset');

            const panel = popupInfo.querySelector('#slidePanel');

            // 모든 모드 버튼 스타일 초기화
            modeBtns.forEach(btn => {
                btn.classList.remove('button--solid-middle', 'button--ghost-lower');
                const btnText = btn.textContent.trim().toLowerCase();
                if ((mode === 'live' && btnText === 'live') ||
                    (mode === 'playback' && (btnText === 'play back' || btnText === 'playback'))) {
                    btn.classList.add('button--solid-middle');
                } else {
                    btn.classList.add('button--ghost-lower');
                }
            });

            // 컨테이너 클래스 변경
            if (playbackContainer) {
                playbackContainer.classList.remove('playback--live', 'playback--playback');
                playbackContainer.classList.add(`playback--${mode}`);
            }

            // 재생 컨트롤 버튼 활성화 상태 관리
            if (actionGroup) {
                if (mode === 'playback') {
                    actionGroup.classList.add('playback__action--active');
                    actionButtons?.forEach(btn => btn.removeAttribute('disabled'));
                } else {
                    actionGroup.classList.remove('playback__action--active');
                    actionButtons?.forEach(btn => btn.setAttribute('disabled', 'disabled'));
                }
            }

            // PTZ 컨트롤 표시/숨김 관리 (하나로 묶어서)
            if (ptzControls) {
                const canvasId = popupInfo.querySelector('canvas').id;
                const poiInfo = Px.Poi.GetData(canvasId.slice(5));
                const isPTZ = poiInfo?.property?.poiMiddleCategoryName === 'PTZ';

                if (mode === 'live' && isPTZ) {
                    // LIVE 모드이면서 PTZ 카메라: PTZ 컨트롤 표시
                    ptzControls.style.display = 'flex';
                    joystick.style.display = 'flex';
                    resetBtn.style.display = 'flex';
                    timeControls.style.display = 'none';
                    panel.style.padding = '20px 20px';
                } else if (mode === 'playback') {
                    // 그 외: PTZ 컨트롤 숨김
                    ptzControls.style.display = 'none';
                    joystick.style.display = 'none';
                    resetBtn.style.display = 'none';
                    panel.style.padding = '20px 20px';
                    timeControls.style.display = 'flex';
                } else {
                    ptzControls.style.display = 'none';
                    joystick.style.display = 'none';
                    resetBtn.style.display = 'none';
                    timeControls.style.display = 'none';
                    panel.style.padding = 0;
                }
            }

            console.log(`Mode switched to: ${mode.toUpperCase()}`);
        };


        // 슬라이더 진행도 업데이트 함수
        const updateSliderProgress = (slider) => {
            const progress = slider.parentElement.querySelector('.controls__progress');
            const value = slider.value;
            const max = slider.max;
            const percentage = (value / max) * 100;
            progress.style.width = percentage + '%';
            progress.setAttribute('data-progress', value);
        };

        // 슬라이더 값 변경 함수
        const changeSliderValue = (type, change) => {
            const slider = popupInfo.querySelector(`[data-type="${type}"]`);
            if (!slider) return;

            const currentValue = parseInt(slider.value);
            const newValue = Math.max(0, Math.min(100, currentValue + change));

            slider.value = newValue;
            updateSliderProgress(slider);

            const label = slider.closest('.controls__group')?.querySelector('.controls__label')?.textContent;
            console.log(`${label}: ${newValue}`);
        };



        // 이벤트 리스너 설정
        const initEventListeners = () => {
            // 토글 버튼 이벤트
            const toggleBtn = popupInfo.querySelector('#toggleControl');

            if (toggleBtn) {
                toggleBtn.addEventListener('click', handleToggleControlPanel);

                // 토글 버튼 상태 업데이트
                const updateToggleButton = () => {
                    const panel = popupInfo.querySelector('#slidePanel');
                    if (panel && panel.classList.contains('ptz-viewer__panel--active')) {
                        toggleBtn.classList.add('playback__toggle--active');
                    } else {
                        toggleBtn.classList.remove('playback__toggle--active');
                    }
                };

                toggleBtn.addEventListener('click', () => {
                    setTimeout(updateToggleButton, 10);
                });
            }

            // 모드 버튼 이벤트 리스너
            popupInfo.querySelectorAll('.playback__mode .button').forEach(btn => {
                btn.addEventListener('click', function() {
                    const btnText = this.textContent.trim().toLowerCase();
                    const mode = btnText === 'live' ? 'live' : 'playback';
                    handleModeSwitch(mode);
                });
            });

            // 초기 상태 설정 (LIVE 모드로 시작)
            handleModeSwitch('live');

                    // 재생 버튼 색상 변경 함수
            const updatePlaybackButtonColor = (activeButton) => {
                // 모든 재생 버튼 색상 초기화
                popupInfo.querySelectorAll('.playback__button').forEach(btn => {
                    btn.style.backgroundColor = '';
                });
                // 활성화된 버튼만 색상 적용
                if (activeButton) {
                    activeButton.style.backgroundColor = '#00f5bf';
                }
            };

            // 재생 컨트롤 버튼 이벤트 리스너
            popupInfo.querySelectorAll('.playback__button').forEach(btn => {
                btn.addEventListener('click', async function () {

                    const canvasId = popupInfo.querySelector('canvas').id;
                    const player = window.livePlayers[canvasId];
                    let cameraIp = null;
                    if(player){
                        cameraIp = player.cameraIp;
                    }else{
                        const poiInfo = Px.Poi.GetData(canvasId.slice(5));
                        cameraIp = poiInfo.property.cameraIp;
                    }

                    const dateValue = document.querySelector('.ptz-viewer__panel input[type="date"]').value;
                    const timeValue = document.querySelector('.ptz-viewer__panel input[type="time"]').value;

                    if (!dateValue || !timeValue) {
                        alertSwal("재생할 날짜와 시간을 선택해주세요.");
                        return;
                    }

                    if (this.hasAttribute('disabled')) return;

                    const btnClass = this.className;
                    if (btnClass.includes('playback__button--play')) {
                        console.log('Playback: Play');
                        if (player && player.isPaused) {
                            player.isPaused = false;
                            player.resumePlayback();
                        } else {

                            const endHours = parseInt(popupInfo.querySelector('#endHours').value) || 0;
                            const endMinutes = parseInt(popupInfo.querySelector('#endMinutes').value) || 0;
                            const endSeconds = parseInt(popupInfo.querySelector('#endSeconds').value) || 0;

                            const startDate = new Date(`${dateValue}T${timeValue}`);
                            const endTime = {
                                hour: endHours,
                                minutes: endMinutes,
                                second: endSeconds
                            };

                            await EventManager.playPlaybackStream(canvasId, cameraIp, startDate, endTime);
                        }
                        updatePlaybackButtonColor(this);

                    } else if (btnClass.includes('playback__button--pause')) {
                        player.isPaused = true; // 일시정지 상태로 변경
                        player.pausePlayback();
                        updatePlaybackButtonColor(this);
                    } else if (btnClass.includes('playback__button--stop')) {
                        player.isPaused = false; // 일시정지 상태 해제
                        player.stopPlayback();
                        updatePlaybackButtonColor(this);
                    }
                });
            });

            // PTZ 컨트롤 버튼들
            const ptzButtons = [
                { btn: popupInfo.querySelector('.controls__btn--zoom-in[data-target="zoomIn"]'), type: 'zoom', direction: 0.3, startMethod: 'continuousZoom', stopMethod: 'stopZoom' },
                { btn: popupInfo.querySelector('.controls__btn--zoom-out[data-target="zoomOut"]'), type: 'zoom', direction: -0.3, startMethod: 'continuousZoom', stopMethod: 'stopZoom' },
                { btn: popupInfo.querySelector('.controls__btn--focus-in[data-target="focusIn"]'), type: 'focus', direction: 0.3, startMethod: 'continuousFocus', stopMethod: 'stopFocus' },
                { btn: popupInfo.querySelector('.controls__btn--focus-out[data-target="focusOut"]'), type: 'focus', direction: -0.3, startMethod: 'continuousFocus', stopMethod: 'stopFocus' },
                { btn: popupInfo.querySelector('.controls__btn--iris-in[data-target="irisIn"]'), type: 'iris', direction: 0.3, startMethod: 'continuousIris', stopMethod: 'stopIris' },
                { btn: popupInfo.querySelector('.controls__btn--iris-out[data-target="irisOut"]'), type: 'iris', direction: -0.3, startMethod: 'continuousIris', stopMethod: 'stopIris' }
            ];

            // PTZ 버튼 이벤트 설정
            ptzButtons.forEach(({ btn, type, direction, startMethod, stopMethod }) => {
                if (btn) {
                    btn.addEventListener('mousedown', async () => {
                        const canvasId = popupInfo.querySelector('canvas').id;
                        const player = window.livePlayers[canvasId];
                        if (player) {
                            await EventManager[startMethod](canvasId, direction);
                        }
                    });

                    btn.addEventListener('mouseup', async () => {
                        const canvasId = popupInfo.querySelector('canvas').id;
                        const player = window.livePlayers[canvasId];
                        if (player) {
                            await EventManager[stopMethod](canvasId);
                        }
                    });
                }
            });

            // 리셋 버튼
            const resetBtn = popupInfo.querySelector('#resetCamera');
            if (resetBtn) {
                resetBtn.addEventListener('click', async () => {
                    const canvasId = popupInfo.querySelector('canvas').id;
                    const player = window.livePlayers[canvasId];
                    if (player) {
                        await EventManager.resetCamera(canvasId);
                    }
                });
            }
        };

        initEventListeners();

        setTimeout(() => {
            handleModeSwitch('live');
        }, 100);
    }

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
        if (e.target.matches('.ptz-viewer__panel input[type="date"], .ptz-viewer__panel input[type="time"]')) {
            const cctvContainer = e.target.closest('.main-cctv-item, .cctv-item');
            if (!cctvContainer) return;
            const canvas = cctvContainer.querySelector('canvas');
            if (!canvas) return;
            const canvasId = canvas.id;
            resetPlaybackState(canvasId);
        }
    });

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