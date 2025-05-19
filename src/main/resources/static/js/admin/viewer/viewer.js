(async function () {
    // 시스템 셋팅
    await SystemSettingManager.getSystemSetting();
    await IconSetManager.getIconSetList();
    await PoiCategoryManager.getPoiCategoryList();
    await PoiMiddleCategoryManager.getPoiMiddleCategoryList();
    await BuildingManager.getBuildingList().then(() => {
        loadBuildingInfo(BUILDING_ID, async () => {
            // camPos.setData(mapInfo.camPosJson);
            await leftPoiListInit();
            initBuilding();
            // 도면 휠 이벤트
            document
                .querySelector('canvas')
                .addEventListener('mousedown wheel resize ', () => {
                    hidePoiMenu();
                });

            // 층 콤보 박스 생성
            let floorListOpt = "<option value=''>전체</option>";
            BuildingManager.findById(BUILDING_ID).floors.forEach((item) => {
                floorListOpt += `<option value='${item.id}'>${item.name}</option>`;
            });
            const floorNo = document.querySelector('#floorNo');
            floorNo.innerHTML = floorListOpt;

            floorNo.addEventListener('change', function () {
                changeEventFloor(this.value);
            });

        });
    });
    await PatrolManager.getPatrolList();


    // 버튼 정의
    const eventTypeList = [
        'mousedown',
        'mouseup',
        'touchstart',
        'touchend',
        'pointerup',
    ];
    for (const eventType of eventTypeList) {
        document
            .querySelector('#buildingCtrlTool')
            .addEventListener(eventType, (evt) => {
                const target = evt.target.closest('.btnBuildingTool');
                const { btnType } = target.dataset;

                if (eventType === 'mousedown' || eventType === 'touchstart') {
                    switch (btnType) {
                        case 'in':
                            Px.Camera.StartZoomIn();
                            break;
                        case 'out':
                            Px.Camera.StartZoomOut();
                            break;
                        case 'up':
                            Px.Camera.StartRotateUp();
                            break;
                        case 'down':
                            Px.Camera.StartRotateDown();
                            break;
                        case 'left':
                            Px.Camera.StartRotateLeft();
                            break;
                        case 'right':
                            Px.Camera.StartRotateRight();
                            break;
                    }
                } else if (eventType === 'pointerup') {
                    switch (btnType) {
                        case 'center':
                            Px.Camera.ExtendView();
                            break;
                        case 'viewLook':
                            if (target.classList.contains('on')) {
                                target.classList.remove('on');
                                Px.Camera.FPS.Off();
                            } else {
                                target.classList.add('on');
                                Px.Camera.FPS.On();
                            }
                            break;
                        case 'lod':
                            if (target.classList.contains('on')) {
                                Px.Lod.SetLodData();
                                target.classList.remove('on');
                            } else {
                                target.classList.add('on');
                                BuildingManager.findById(BUILDING_ID).getDetail().then((building) => {
                                    Px.Lod.SetLodData(building.lod);
                                });

                            }
                            break;
                    }
                } else {
                    switch (btnType) {
                        case 'in':
                            Px.Camera.StopZoomIn();
                            break;
                        case 'out':
                            Px.Camera.StopZoomOut();
                            break;
                        case 'up':
                            Px.Camera.StopRotateUp();
                            break;
                        case 'down':
                            Px.Camera.StopRotateDown();
                            break;
                        case 'left':
                            Px.Camera.StopRotateLeft();
                            break;
                        case 'right':
                            Px.Camera.StopRotateRight();
                            break;
                    }
                }
            });
    }

    document.querySelector('#camPosTool').addEventListener('click', (evt) => {
        const target = evt.target.closest('.camPosTool');
        if(target === null) return;

        const { btnType } = target.dataset;
        const camPos = JSON.stringify(Px.Camera.GetState());

        const param = {
            camera: camPos,
        };

        api.patch(`/buildings/${BUILDING_ID}/${btnType}`, param).then(() => {
            alertSwal('정상 등록 되었습니다.');
            BuildingManager.findById(BUILDING_ID)[btnType] = camPos;
        });



    });

    document.querySelector('#virtualPatrolEditTool').addEventListener('click', (evt) => {
        const target = evt.target.closest('.patrol-control');

        if (target == null) {
            return;
        }

        const { btnType } = target.dataset;

        switch (btnType) {
            case 'addPoints': {
                if (document.querySelector('#floorNo').value === '') {
                    alertSwal('전체 층일경우 POI 수정이 불가능 합니다.');
                    return;
                }
                if (!document.querySelector("#patrolListTable > tbody > tr.active")) {
                    alertSwal('선택된 가상순찰 정보가 없습니다.');
                    return;
                }
                Px.VirtualPatrol.Editor.Off();
                Px.VirtualPatrol.Editor.On();
                break;
            }
            case 'exitEditMode' : {
                Px.VirtualPatrol.Editor.Off();
            }
        }

    });

    //좌측 메뉴 선택시 이벤트 처리
    document
        .querySelector('.viewer-sidebar .nav.nav-tabs')
        .addEventListener('click', async (event) => {
            const linkList = document.querySelectorAll(
                '.viewer-sidebar .nav-tabs .nav-item',
            );
            const contentList = document.querySelectorAll(
                'div.viewer-sidebar .tab-content .tab-pane',
            );

            const editPoiToolBar = document.getElementById('editPoiToolBar');

            const target = event.target.closest('.nav-link');
            if (target === null) return;

            linkList.forEach((link) => link.classList.remove('active'));

            contentList.forEach((content) => {
                content.classList.remove('active', 'show');
                if (target.id === content.getAttribute('name'))
                    content.classList.add('active', 'show');
            });

            Px.Poi.HideAll();


            if (target.id === 'poi-tab') {
                editPoiToolBar.style.display = '';
                getPoiRenderingAndList();
                Px.VirtualPatrol.Clear();
                Px.VirtualPatrol.Editor.Off();
            } else if (target.id === 'patrol-tab') {
                editPoiToolBar.style.display = 'none';
                getPoiRenderingAndList();
                renderPatrolList();
            }
            changeEventFloor(document.getElementById('floorNo').value);
        });
})();

// 층 콤보 박스 변경
function changeEventFloor(floorId) {
    document.getElementById('floorNo').value = floorId;

    if (floorId === '') {
        Px.Model.Visible.ShowAll();
    } else {

        Px.Model.Visible.HideAll();

        const floor = BuildingManager.findById(BUILDING_ID).floors.find(
            (floor) => floor.id === Number(floorId),
        );
        Px.Model.Visible.Show(floor.id);
    }
    const activeId = document.querySelector(
        '#wrapper > div.viewer-sidebar > ul > li > a.active',
    ).id;

    switch (activeId) {
        case 'poi-tab': {
            getPoiRenderingAndList();
            document.querySelector('#virtualPatrolCtrlToolBar').classList.remove('active');
            document.querySelector('#evacRouteBtnToolBar').classList.add('active');


            break;
        }
        case 'patrol-tab': {
            getPoiRenderingAndList();
            clickPatrolTab();
            document.querySelector('#virtualPatrolCtrlToolBar').classList.add('active');
            document.querySelector('#evacRouteBtnToolBar').classList.remove('active');
            const activePatrolId = document.querySelector("#patrolListTable > tbody > tr.collapsed.active");
            if(activePatrolId != null) {
                patrolPointImport(activePatrolId.dataset.id, floorId);
            }
            break;
        }
        default:
            break;
    }
}


// 도면 정보 로딩
function loadBuildingInfo(buildingId, callback) {
    BuildingManager.getBuildingById(buildingId).then((building) => {
        const buildingList = BuildingManager.findAll();
        const index = buildingList.findIndex(building => building.id === Number(buildingId));
        buildingList[index] = building;

        if (callback) callback();
    });
}

// 엔진 도면 정보 로딩
function initBuilding() {
    // WebGL 엔진 초기화

    const container = document.getElementById('webGLContainer');

    Px.Core.Initialize(container, async () => {
        Px.Util.SetBackgroundColor('#1b1c2f'); // 백그라운드 색깔지정
        // BuildingManager.findById(BUILDING_ID).getDetail();
        const { buildingFile, code, camera3d} = BuildingManager.findById(BUILDING_ID);
        const { directory, storedName, extension } = buildingFile;

        const {floors} = BuildingManager.findById(BUILDING_ID);
        const sbmDataArray = floors.map((floor) => {

            const url = `/Building/${directory}/${floor.sbmFloor[0].sbmFileName}`;
            const sbmData = {
                url,
                id: floor.sbmFloor[0].id, // 기존 sbmfloorId
                displayName: floor.sbmFloor[0].sbmFileName,
                baseFloor: floor.sbmFloor[0].sbmFloorBase,
                groupId: floor.sbmFloor[0].sbmFloorGroup,
            };
            return sbmData;
        });

        Px.Loader.LoadSbmUrlArray({
            urlDataList: sbmDataArray,
            center: '',
            onLoad: () => {
                document.querySelector('canvas').style.position = 'static';
                initPoi();
                initPatrol();
                Px.Event.On();
                Px.Camera.EnableScreenPanning()
                if(camera3d)
                    Px.Camera.SetState(JSON.parse(camera3d));
                Px.Event.AddEventListener('dblclick', 'poi', (poiInfo) => {
                    const activeTab = document.querySelector('.viewer-sidebar .nav li a.active').id;
                    if(activeTab === 'poi-tab') {
                        const canvasRect = document.getElementsByTagName('canvas')[0].getBoundingClientRect();
                        const {x, y} = Px.Poi.Get2DPosition(poiInfo.id);

                        const popup = document.createElement('div');
                        popup.classList.add('dropdown-content');

                        const removePoiPopup = (event) => {
                            const {parentElement} = event.currentTarget;
                            parentElement.remove();
                        };

                        const dropdownItemAllocateA = document.createElement('a');
                        dropdownItemAllocateA.classList.add('dropdown-item');
                        dropdownItemAllocateA.textContent = 'POI 배치하기';
                        dropdownItemAllocateA.addEventListener(
                            'pointerup',
                            (event) => {
                                allocatePoi(poiInfo.id);
                                removePoiPopup(event);
                            },
                        );

                        const dropdownItemDeleteA = document.createElement('a');
                        dropdownItemDeleteA.classList.add('dropdown-item');
                        dropdownItemDeleteA.textContent = 'POI 삭제하기';
                        dropdownItemDeleteA.addEventListener(
                            'pointerup',
                            (event) => {
                                deletePoi(poiInfo.id);
                                removePoiPopup(event);
                            },
                        );

                        const dropdownItemUnAllocateA = document.createElement('a');
                        dropdownItemUnAllocateA.classList.add('dropdown-item');
                        dropdownItemUnAllocateA.textContent = 'POI 미배치로 변경';
                        dropdownItemUnAllocateA.addEventListener(
                            'pointerup',
                            (event) => {
                                unAllocatePoi([poiInfo.id]);
                                removePoiPopup(event);
                            },
                        );

                        popup.appendChild(dropdownItemAllocateA);
                        popup.appendChild(dropdownItemDeleteA);
                        popup.appendChild(dropdownItemUnAllocateA);

                        popup.style.position = 'absolute';
                        popup.style.left = `${x + canvasRect.left}px`;
                        popup.style.top = `${y + canvasRect.top}px`;

                        document
                            .querySelector('#webGLContainer')
                            .appendChild(popup);
                    } else {
                        addPatrolPoi(poiInfo);
                    }
                });
                console.log('sbm loading complete');
            },
        });
    });
}

const selectedFloor = (floorId) => (poi) =>
    floorId === '' || poi.property.floorId === Number(floorId);

document.querySelector('.evacRouteBtn').addEventListener('pointerup', (event) => {
    const target = event.currentTarget;
    const evacRouteEditTool = document.getElementById('evacRouteEditToolBar');
    const editPoiTool = document.getElementById('editPoiToolBar');
    const viewerSidebar = document.querySelector('.viewer-sidebar');
    const poiCategorySelect = document.getElementById('poiSelect');
    const virtualPatrolCtrlToolBar = document.getElementById('virtualPatrolCtrlToolBar');

    changeEventFloor('');

    if(target.classList.contains('on')) {
        confirmSwal('대피경로 편집모드를<br>종료하시겠습니까?<br><small>※작업한 내역이 자동저장되지않습니다</small>').then(() => {
            target.classList.remove('on');
            target.innerText = '대피경로 편집';
            evacRouteEditTool.classList.add('d-none');
            editPoiTool.classList.remove('d-none');
            viewerSidebar.classList.remove('d-none');
            poiCategorySelect.classList.remove('d-none');
            virtualPatrolCtrlToolBar.classList.remove('d-none');

            Px.Evac.Clear();
            Px.Core.Resize();
            Px.Camera.ExtendView();

            Px.Model.Collapse({duration: 1000});

            const poiList = PoiManager.findByBuilding(BUILDING_ID)
                .filter(selectedPoiCategory(poiCategorySelect.value))
                .filter(selectedFloor(''));
            renderingPoiList(poiList);
        })
    } else {

        target.classList.add('on');
        target.innerText = '편집 종료';
        evacRouteEditTool.classList.remove('d-none');
        editPoiTool.classList.add('d-none');
        viewerSidebar.classList.add('d-none');
        poiCategorySelect.classList.add('d-none');
        virtualPatrolCtrlToolBar.classList.add('d-none');

        EvacRouteHandler.load((isExist) => {
            Px.Evac.ShowAll();
            const { floors } = BuildingManager.findById(BUILDING_ID);
            Px.Model.Expand({
                name: floors[0].id,
                interval: 200,
                duration: 1000,
                onComplete: () => {
                    Px.Camera.ExtendView();
                }
            });
        });
        Px.Core.Resize();
        Px.Poi.HideAll();
    }

    const {camera3d} = BuildingManager.findById(BUILDING_ID);
    if(camera3d) Px.Camera.SetState(JSON.parse(camera3d));
})

document.querySelector('#evacRouteEditToolBar').addEventListener('pointerup', (event) => {
    const target = event.target.closest('.btnEvacRouteEdit');
    const { btnType } = target.dataset;

    document.querySelector('.btnEvacRouteEdit.on')?.classList.remove('on');
    if (btnType !== 'removeAll' && btnType !== 'save') {
        if (target.classList.contains('on')) {
            EvacRouteHandler.editAllOff();
            return;
        } else {
            target.classList.add('on');
        }
    }

    EvacRouteHandler.edit(btnType);
})

document.addEventListener('keyup', (event) => {
    if(event.key === 'Escape' || event.code === 'Escape') {
        if(document.querySelector('.evacRouteBtn').classList.contains('on')) {
            document.querySelector('.btnEvacRouteEdit.on')?.classList.remove('on');
        }
    }
})