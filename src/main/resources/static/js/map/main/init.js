'use strict';

(async function () {
    // const USER_ID = document.cookie.match('(^|;) ?USER_ID=([^;]*)(;|$)')[2];
    // api.get(`/users/userid/${USER_ID}`).then((result) => {
    //     const {result: data} = result.data;
    //     document.querySelector('.header__info .head__name').innerHTML = data.name;
    //     document.querySelector('.header__info .head__level').innerHTML = data.groupName;
    //     // if (data.role !== 'ADMIN') {
    //     //     document.querySelector("#userBox > div.user-content-wrap > button.admin-button").style.display = 'none';
    //     // }
    // });
    const floorInfo = document.querySelector('#floor-info .floor-info__button');
    const floorDetail = document.querySelector('#floor-info .floor-info__detail');
    floorInfo.addEventListener('click', event => {
        if (floorDetail.style.display == 'none') {
            floorDetail.style.display = 'block';
        } else {
            floorDetail.style.display = 'none';
        }
    })
    function setCategoryId(elements, categoryIds, isEqupiment) {
        const params = new URLSearchParams(window.location.search);
        let buildingId = params.get('buildingId');
        elements.forEach(element => {
            const elementClasses = element.className.split(' ').map(className => className.toLowerCase());
            const matchedCategory = categoryIds.find(category =>
                elementClasses.includes(category.name.toLowerCase())
            );

            if (matchedCategory) {
                element.setAttribute('data-category-id', matchedCategory.id);
            }
        });
        if (isEqupiment) {
            PoiManager.getPoisByBuildingId(buildingId).then(pois => {
                elements.forEach(element => {
                    const categoryId = element.getAttribute('data-category-id');
                    pois.forEach(poi => {
                        if (poi.poiCategory == categoryId) {
                            element.classList.add('active');
                        }
                    });
                });
            })
        }
    }

    const initCategory = () => {
        const equipmentGroup = document.querySelectorAll('#equipmentGroup a')
        const poiMenuList = document.querySelectorAll('#poiMenuList li');
        let allCategoryIds = PoiCategoryManager.findAll();
        setCategoryId(poiMenuList, allCategoryIds, false);
        setCategoryId(equipmentGroup, allCategoryIds, true);
    }

    // 수정 필요
    const initBuilding = () => {
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
        Init.getBuilding(buildingId);
    }

    // paging 수정중
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
        const { floors } = BuildingManager.findById(buildingId);
        // floor setting
        const floorUl = document.querySelector('#floor-info .floor-info__detail ul')
        const upButton = document.querySelector('#floor-info .floor-info__detail .up');
        const downButton = document.querySelector('#floor-info .floor-info__detail .down');
        // upButton.style.transform = 'rotate(-90deg)';
        // downButton.style.transform = 'rotate(-90deg)';
        floors.forEach(floor => {
            const floorLi = document.createElement('li');
            floorLi.setAttribute('floor-id', floor.id);
            floorLi.textContent = floor.name
            floorUl.appendChild(floorLi);
        })

        const itemsPerPage = 10;
        const totalItems = floors.length;
        let startIndex = 0;

        updateFloorPage(floorUl, startIndex, itemsPerPage);
        updateButtons(startIndex, totalItems, itemsPerPage, upButton, downButton);

        upButton.addEventListener('click', () => {
            if (startIndex > 0) {
                startIndex--;
                updateFloorPage(floorUl, startIndex, itemsPerPage);
                updateButtons(startIndex, totalItems, itemsPerPage, upButton, downButton);
            }
        });

        downButton.addEventListener('click', () => {
            if (startIndex + itemsPerPage < totalItems) {
                startIndex++;
                updateFloorPage(floorUl, startIndex, itemsPerPage);
                updateButtons(startIndex, totalItems, itemsPerPage, upButton, downButton);
            }
        });

        clickFloor();
    }

    const clickFloor = () => {
        const floorBtns = document.querySelectorAll('#floor-info .floor-info__detail ul li');
        // btnClick
        floorBtns.forEach(floorBtn => {
            floorBtn.addEventListener('click', event => {
                Px.Model.Visible.HideAll();
                Px.Poi.HideAll();
                let floorId = floorBtn.getAttribute('floor-id')
                Px.Model.Visible.Show(Number(floorId));
                PoiManager.getPoisByFloorId(floorId).then(pois => {
                    pois.forEach(poi => {
                        Px.Poi.Show(Number(poi.id));
                    })
                })
            })
        })
        // allFloor
        const allFloor = document.querySelector('.floor-info__ctrl');
        allFloor.addEventListener('click', event => {
            Px.Model.Visible.ShowAll();
        })
    }


    // 화면 세팅
    await SystemSettingManager.getSystemSetting().then((systemSetting) => {
        const { } = systemSetting;
    });
    await IconSetManager.getIconSetList();
    await BuildingManager.getBuildingList().then((buildingList) => {
        buildingList.forEach(async (building) => {
            const {id} = building;
            await BuildingManager.getBuildingById(id).then((building) => {
                BuildingManager.findById(id).setDetails(building);
            });
        })
    });

    await PoiCategoryManager.getPoiCategoryList();

    await PoiManager.getPoiList();
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

    // await Init.initializeOutdoorBuilding();
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
                const { buildingFile, code} = BuildingManager.findById(firstBuildingId);
                const { directory, storedName, extension } = buildingFile;

                const {floors} = BuildingManager.findById(firstBuildingId);
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

    const getBuilding = async (buildingId) => {
        const container = document.getElementById('webGLContainer');
        container.innerHTML = '';
        // contents position은 테스트용으로 일단 static으로...
        // 추후 변경 예정
        const contents = document.querySelector('.contents');
        Px.Core.Initialize(container, async () => {

            let buildingInfo = BuildingManager.findById(buildingId);
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
                    PoiManager.renderAllPoiToEngineByBuildingId(buildingId);
                    Px.Event.On();
                    Px.Event.AddEventListener('dblclick', 'poi', (poiInfo) => {
                        moveToPoi(poiInfo.id)
                    });
                    Px.Event.AddEventListener('pointerup', 'sbm', (event) => {

                    })
                    Px.Effect.Outline.HoverEventOn('area_no');
                    Px.Effect.Outline.AddHoverEventCallback(
                        throttle((event) => {

                        }, 1000)
                    );

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
        initializeIndoorBuilding,
        poiDblclick,
        setBuildingNameAndFloors,
        changeFloor,
        getBuilding,
    }
})();