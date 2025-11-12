'use strict';
(async function () {
    const cookieMatch = document.cookie.match('(^|;) ?USER_ID=([^;]*)(;|$)');
    const USER_ID = cookieMatch ? cookieMatch[2] : null;
    if (!USER_ID || USER_ID.toLowerCase() === 'kiosk') {
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
    const userType = getCookie("USER_TYPE");
    const decoded = userRole ? decodeURIComponent(userRole) : "";
    const roles = decoded ? decoded.split(",") : [];
    const adminButton = document.querySelector(".profile__layer .head");
    adminButton.addEventListener("click", event => {
        window.open("/admin/building/indoor", "_blank");
    })
    if (!userType.includes("ADMIN")) {
        adminButton.style.display = "none";
    }

    
    await SystemSettingManager.getSystemSetting().then((systemSetting) => {
        const { } = systemSetting;
    });
    await NoticeManager.getNoticeIsActive().then((notices) => {
        notices.forEach(async (notice) => {
            if(notice.isRead === 'undefined' || notice.isRead === null) {
                const profileBadge = document.querySelector(".profile__btn .badge")
                const badge = document.querySelector('#notice .badge');
                profileBadge.style.display = '';
                badge.style.display = '';
            }
        })
    });
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

    // viewer에만
    await BuildingManager.getOutdoorBuilding().then((outdoorBuilding) => {
        loadBuildingInfo(outdoorBuilding.id, async () => {
            // camPos.setData(mapInfo.camPosJson);
            await Init.initializeOutdoorBuilding();
            // 도면 휠 이벤트
            document
                .querySelector('canvas')
                .addEventListener('mousedown wheel resize ', () => {
                    hidePoiMenu();
                });
        });
    })
    function loadBuildingInfo(buildingId, callback) {
        BuildingManager.getBuildingById(buildingId).then((building) => {
            const buildingList = BuildingManager.findAll();
            const index = buildingList.findIndex(building => building.id === Number(buildingId));
            buildingList[index] = building;

            if (callback) callback();
        });
    }

    await PoiManager.getFilteredPoiListBatch();
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

    Init.initCategoryId();
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
            document.getElementById('loadingLayer').classList.add('on');
            const buildingName = document.getElementById('buildingName');
            buildingName.style.display = 'none';
            buildingName.style.zIndex = '0';
            buildingName.style.left = '';
            buildingName.style.top = '';
            const container = document.getElementById('container');
            container.innerHTML = '';
            Px.Core.Initialize(container, async () => {
                const {buildingFile, floors, code, camera3d, lod, version} = BuildingManager.findById(BUILDING_ID);
                const {directory, storedName, extension} = buildingFile;

                const minimap = document.getElementById('minimapBox');
                minimap.className = "B"+code.split('-')[1];

                Px.Loader.LoadFbx({
                    url: `/Building/${directory}/${version}/${storedName}.${extension}`,
                    onLoad: async () => {
                        Px.Util.SetBackgroundColor('#333333');
                        Px.Camera.FPS.SetHeightOffset(15);
                        Px.Camera.FPS.SetMoveSpeed(500);
                        PoiManager.renderAllPoiToEngineByBuildingId(BUILDING_ID);
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

    // 분리
    const setCategoryId = (elements, categoryList) => {
        elements.forEach(element => {
            let elementText = "";
            if (element.closest("#poiMenuList")) {
                elementText = element.querySelector('a span').textContent.trim().toLowerCase();
            } else {
                elementText = element.textContent.trim().toLowerCase();
            }

            const matchedCategory = categoryList.find(category => {
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
    };

    const initCategoryId = () => {
        const categoryList = PoiCategoryManager.findAll();
        const poiMenuList = document.querySelectorAll('.poi-menu__list li');

        setCategoryId(poiMenuList, categoryList);
    };

    const initBuildingList = () => {
        const buildingList = BuildingManager.findAll();
        const buildingUl = document.querySelector('#systemTab ul')

        const priorityMap = [
            { keyword: "외부", priority: 1 },
            { keyword: "A", priority: 2 },
            { keyword: "B", priority: 3 },
            { keyword: "판매", priority: 4 },
            { keyword: "주차장", priority: 5 }
        ];

        const sortedBuildings = buildingList.sort((buildingA, buildingB) => {
            const priorityA = priorityMap.find(p => buildingA.name.includes(p.keyword))?.priority ?? 999;
            const priorityB = priorityMap.find(p => buildingB.name.includes(p.keyword))?.priority ?? 999;
            return priorityA - priorityB;
        });

        sortedBuildings.forEach(building => {
            const buildingLi = document.createElement('li');
            buildingLi.setAttribute('building-id', building.id);
            buildingLi.textContent = building.name;
            buildingUl.appendChild(buildingLi);
        });
        clickBuilding();
    }

    const clickBuilding = () => {
        const buildingBtns = document.querySelectorAll('#systemTab ul li');
        // btnClick
        buildingBtns.forEach(buildingBtn => {
            buildingBtn.style.cursor = 'pointer';
            buildingBtn.addEventListener('click', event => {

                    const buildingList = BuildingManager.findAll();
                    const display = buildingBtn.textContent;
                    const matched = buildingList.find(b =>
                        typeof b.name === 'string' && (display.includes(b.name) || b.name.includes(display))
                    );
                    console.log("matched : ", matched)
                    if (!matched) {
                        return;
                    }

                    window.location.href = `/map?buildingId=${matched.id}`;

            });
        })
    }

    const initializeOutdoorBuilding = async (onComplete) => {
        try {
            const container = document.getElementById('webGLContainer');
            container.innerHTML = '';
            const contents = document.querySelector('.contents');

            const outdoorBuilding = await BuildingManager.getOutdoorBuilding();
            const version = outdoorBuilding.getVersion();
            await BuildingManager.getFloorsByHistoryVersion(version);
            const firstIndoorBuilding = BuildingManager.findAll().find(value => value.isIndoor === 'Y');
            const allBuilding = BuildingManager.findAll();
            let buildingId = outdoorBuilding ? outdoorBuilding.id : null;
            //initFloors(buildingId);
            initBuildingList();
            document.getElementById("buildingName").setAttribute("building-id", buildingId);
            document.getElementById("buildingName").setAttribute("building-name", outdoorBuilding.name);

            const buildingNames = allBuilding.map(b => b.name);
            Px.Core.Initialize(container, async () => {
                let sbmDataArray = [];
                if (outdoorBuilding) {
                    const { buildingFile, floors } = outdoorBuilding;
                    const version = outdoorBuilding.getVersion();
                    const { directory } = buildingFile;
                    sbmDataArray = floors.flatMap(floor =>
                        floor.sbmFloor.map(sbm => {
                            const parts = sbm.sbmFileName.split('_');
                            const alias = parts.length >= 2 ? parts[parts.length - 2] : '';
                            return {
                                url: `/Building/${directory}/${version}/${sbm.sbmFileName}`,
                                id: floor.id,
                                displayName: alias,
                                baseFloor: sbm.sbmFloorBase,
                                groupId: sbm.sbmFloorGroup,
                                isSelectable: alias !== '기타시설' && buildingNames.includes(alias),
                                property: sbm.sbmFloorBase
                            };
                        })
                    );
                    console.log("sbmDataArray : ", sbmDataArray);
                } else {
                    sbmDataArray.push({
                        url: "/static/assets/modeling/outside/KTDS_Out_All_250109/KTDS_Out_All_250109_1F_0.sbm",
                        id: 0,
                        displayName: "외부 전경",
                        baseFloor: 1,
                        groupId: 0,
                        property: 'sbm'
                    });
                }

                Px.Loader.LoadSbmUrlArray({
                    urlDataList: sbmDataArray,
                    center: "",
                    onLoad: function() {
                        initPoi(buildingId);
                        initPatrol();
                        Px.Camera.SetState({
                            position: {
                                x: -1583.4784782983606,
                                y: 2080.5211006735,
                                z: -1567.1665244322335
                            },
                            rotation: {
                                x: -2.204705910626318,
                                y: -0.4727504332541018,
                                z: -2.587026956765043
                            },
                            target: {
                                x: -698.124967435856,
                                y: 685.7181604055714,
                                z: -541.8192260742188
                            }
                        });

                        Px.Model.Visible.ShowAll();
                        Px.Camera.EnableScreenPanning()
                        Px.Util.SetBackgroundColor('#111316');
                        Px.Camera.FPS.SetHeightOffset(15);
                        Px.Camera.FPS.SetMoveSpeed(500);
                        Px.Event.AddEventListener('dblclick', 'poi', (poiInfo) => {
                            moveToPoi(poiInfo.id)
                        });

                        // Px.Effect.Outline.HoverEventOn('area_no');

                        // Px.Event.AddEventListener('pointerup', 'sbm', (data)=>{
                        //     Px.Effect.Outline.Add(data.floorId);
                        // });
                        // Px.Effect.Outline.AddHoverEventCallback(
                        //     throttle(async (event) => {
                        //         if (outdoorBuilding.floors && outdoorBuilding.floors.length > 0) {
                        //             const firstFloorId = outdoorBuilding.floors[0].id;
                        //             Px.Effect.Outline.Add(firstFloorId);
                        //         }
                        //     }, 10)
                        // );

                        Px.Event.On();
                        setTimeout(() => {
                            Px.Event.On();
                        }, 1000)
                        // Px.Effect.Outline.Add(sbmDataArray[0].baseFloor)
                        Px.Event.AddEventListener('dblclick', 'sbm', (data) => {
                            const buildingList = BuildingManager.findAll();

                            console.log('마우 버튼 눌림', data);
                            if (!data.displayName) return;

                            const display = data.displayName;
                            const matched = buildingList.find(b =>
                                typeof b.name === 'string' && (display.includes(b.name) || b.name.includes(display))
                            );
                            console.log("matched : ", matched)
                            if (!matched) {
                                return;
                            }

                            window.location.href = `/map?buildingId=${matched.id}`;
                        });

                        contents.style.position = 'static';
                        if (onComplete) onComplete();

                    }
                });
            });
            handleZoomIn();
            handleZoomOut();
            handleExtendView();
            handleFirstView(buildingId);
            handle2D(buildingId);
        } catch (error) {
            console.error('PX Engine Initial', error);
        }
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

    // zoomIn btn
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

    function handleFirstView(buildingId) {
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
                let option = JSON.parse(building.camera2d);
                if (option === null || option === "" || option === undefined) {
                    option = {
                        position: {x: -134.91073489593867, y: 4048.653041121009, z: -418.59942425930194},
                        rotation: {x: 0, y: 0, z: 0},
                        target: {x: -134.91382798752565, y: 6.060831375368665e-14, z: -418.59681190865894}
                    };
                    Px.Camera.SetOrthographic();
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
                };
                Px.Camera.SetState(option);

            },
        );
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

    const moveToPoi = (id) => {
        let poiId;
        if (id.constructor.name === 'PointerEvent') {
            poiId = id.currentTarget.getAttribute('poiid');
        } else {
            poiId = id;
        }
        // const poiData = Px.Poi.GetData(poiId);
        const poiData = PoiManager.findById(poiId);

        if (poiData) {
            const floor = BuildingManager.findFloorsByHistory().find(
                (floor) => Number(floor.no) === Number(poiData.property.floorNo),
            );
            Px.Model.Visible.HideAll();
            // Px.Model.Visible.Show(Number(poiData.property.floorId));
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

    const initPoi = async (buildingId) => {
        PoiManager.renderAllPoiToEngineByBuildingId(buildingId);

        document.querySelector('#webGLContainer').addEventListener('pointerup', () => {
            const popupList = document.querySelectorAll(
                '#webGLContainer .dropdown-content',
            );
            popupList.forEach((popup) => {
                popup.remove();
            });
        });

    };

    const initPatrol = () => {

        Px.VirtualPatrol.LoadArrowTexture('/static/images/virtualPatrol/arrow.png', function () {
            console.log('화살표 로딩완료');
        });

        Px.VirtualPatrol.LoadCharacterModel('/static/assets/modeling/virtualPatrol/guardman.glb', function () {
            console.log('가상순찰 캐릭터 로딩 완료');
        });

        Px.VirtualPatrol.Editor.SetPointCreateCallback(savePoint);	//가상순찰 점찍을때 콜백

    }

    const savePoint = (pointData) => {

        const id = document.querySelector("#patrolListTable > tbody > tr.active").dataset.id;
        const floorNo = document.querySelector("#floorNo").value;

        let param = {
            floorId : floorNo
            // ,pointLocation : JSON.stringify(pointData.position)
            ,pointLocation : pointData.position
        };

        api.patch(`/patrols/${id}/points`,param).then(() => {
            patrolPointOnComplete(() => {
                Px.VirtualPatrol.Editor.On();
            });
        });
    }

    const poiDblclick = (poiInfo) => {
        const {id} = poiInfo.property;

        popup.setPoiEvent(id);
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
        // await initializeIndoorBuilding();
        setBuildingNameAndFloors();
    }

    const renderingBuildingNameDom = (data) => {
        const {pointerEventData, property} = data;
        const buildingName = document.getElementById('buildingName');
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
                            const {id: floorId} = data.floors.find(floor => floor.floorName === floorName);
                            Px.Poi.ShowByPropertyArray({"floorId": floorId, "poiCategoryId": Number(poiCategoryId)});
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

                    const {id: floorId} = floors.find(floor => floor.floorName === floorName);
                    Px.Poi.ShowByProperty("floorId", floorId);

                    if (onComplete) onComplete();
                }
            });
        }
        if(camera3d) Px.Camera.SetState(JSON.parse(camera3d));

    }

    return {
        // initializeIndoorBuilding,
        initializeOutdoorBuilding,
        initCategoryId,
        poiDblclick,
        setBuildingNameAndFloors,
        changeFloor,
    }
})();