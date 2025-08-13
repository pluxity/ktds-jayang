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
                document.getElementById('registeredPoiSelect').style.display = 'none';
                editPoiToolBar.style.display = '';
                getPoiRenderingAndList();
                Px.VirtualPatrol.Clear();
                Px.VirtualPatrol.Editor.Off();
            } else if (target.id === 'patrol-tab') {
                document.getElementById('registeredPoiSelect').style.display = 'none';
                editPoiToolBar.style.display = 'none';
                getPoiRenderingAndList();
                renderPatrolList();
            } else if (target.id === 'cctv-tab') {
                document.getElementById('registeredPoiSelect').style.display = 'flex';
                getPoiRenderingAndList();
                Px.VirtualPatrol.Clear();
                Px.VirtualPatrol.Editor.Off();
                await getCctvList();
            }
            changeEventFloor(document.getElementById('floorNo').value);
        });
})();

// 층 콤보 박스 변경
function changeEventFloor(floorNo) {
    document.getElementById('floorNo').value = floorNo;

    if (floorNo === '') {
        Px.Model.Visible.ShowAll();
        Px.Camera.ExtendView();
    } else {

        Px.Model.Visible.HideAll();
        Px.Poi.HideAll();

        const floor = BuildingManager.findFloorsByHistory().find(
            (floor) => floor.no === Number(floorNo),
        );
        Px.Model.Visible.Show(floor.id);
        Px.Poi.ShowByProperty("floorNo", Number(floorNo));
        Px.Camera.ExtendView();
    }
    const activeId = document.querySelector(
        '#wrapper > div.viewer-sidebar > ul > li > a.active',
    ).id;

    switch (activeId) {
        case 'poi-tab': {

            document.querySelector('#virtualPatrolCtrlToolBar').classList.remove('active');
            document.querySelector('#evacRouteBtnToolBar').classList.add('active');

            break;
        }
        case 'patrol-tab': {
            clickPatrolTab();
            document.querySelector('#virtualPatrolCtrlToolBar').classList.add('active');
            document.querySelector('#evacRouteBtnToolBar').classList.remove('active');
            const activePatrolId = document.querySelector("#patrolListTable > tbody > tr.collapsed.active");
            if(activePatrolId != null) {
                patrolPointImport(activePatrolId.dataset.id, floorId);
            }
            break;
        }
        case 'cctv-tab': {
            document.querySelector('#virtualPatrolCtrlToolBar').classList.remove('active');
            document.querySelector('#evacRouteBtnToolBar').classList.add('active');
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
        Px.Util.SetBackgroundColor('#1b1c2f');
        const { buildingFile, code, camera3d} = BuildingManager.findById(BUILDING_ID);
        const building = BuildingManager.findById(BUILDING_ID);
        const { directory, storedName, extension } = buildingFile;
        const params = new URLSearchParams(window.location.search);
        const version = params.get('version') || building.getVersion();


        const floors =  await BuildingManager.getFloorsByHistoryVersion(version);
        console.log(floors);

        // histotry에 맞는 floor를 가져오면?
        // 층 + history를 갖는 엔티티

        const sbmDataArray = floors.flatMap(floor =>
            floor.sbmFloor.map(sbm => ({
                url: `/Building/${directory}/${version}/${sbm.sbmFileName}`,
                id: floor.id,
                displayName: sbm.sbmFileName,
                baseFloor: sbm.sbmFloorBase,
                groupId: sbm.sbmFloorGroup,
            }))
        );
        console.log("sbmDataArray : ", sbmDataArray);

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

                // POI 등록 모달 초기화 (floors 정보가 로드된 후)
                initializeViewerPoiData();

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
                        dropdownItemAllocateA.textContent = 'POI 이동';
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

                // CCTV POI 선택 이벤트
                Px.Event.AddEventListener('pointerup', 'poi', (selectedPoi) => {
                    const currentTab = document.querySelector('.viewer-sidebar .nav li a.active').id;
                    if(currentTab === 'cctv-tab') {
                        const poiCategoryName = selectedPoi.property.poiCategoryName;
                        const poiDisplayName = selectedPoi.displayText;
                        const poiId = Number(selectedPoi.id);

                        const cctvTableBody = document.querySelector('#cctvListTable > tbody');
                        if(poiCategoryName.toLowerCase().includes('cctv')) {
                            if (!cctvEquipmentMap.has(poiId)) {
                                cctvEquipmentMap.set(poiId, []);
                            }else {
                                clearActiveCctvRows();
                                const row = cctvTableBody.querySelector(`tbody > tr[data-poi-id="${poiId}"]`)
                                row.classList.add('active');
                                row.querySelectorAll('div').forEach(div => {
                                    const poiId = Number(div.dataset.poiId);
                                    Px.Poi.SetColor(poiId, '#f80606');
                                });
                                return;
                            }

                            const newCctvRow = document.createElement('tr');
                            newCctvRow.innerHTML = `
                                <th scope="row"><i class="fa-solid fa-circle-minus" style="color:#FF0000; cursor: pointer;" onclick="removeCctvRow(${poiId})"></i>${poiDisplayName}</th>
                                <td style="text-align: center; vertical-align: bottom; height: 100px;"></td>
                            `;
                            newCctvRow.dataset.poiId = poiId;

                            cctvTableBody.appendChild(newCctvRow);
                            clearActiveCctvRows();
                            newCctvRow.classList.add('active');

                        } else {
                            // 일반 POI인 경우
                            const activeCctvRow = cctvTableBody.querySelector('tr.active');

                            if(activeCctvRow && activeCctvRow.dataset.poiId) {
                                const cctvId = Number(activeCctvRow.dataset.poiId);
                                const equipmentCell = activeCctvRow.querySelector('td');

                                if(equipmentCell) {
                                    const existingEquipment = equipmentCell.querySelector(`div[data-poi-id="${poiId}"]`);

                                    if(existingEquipment) {
                                        // 이미 선택된 POI라면 제거
                                        existingEquipment.remove();
                                        Px.Poi.RestoreColor(poiId);

                                        // Map과 Set에서도 제거
                                        const cctvEquipments = cctvEquipmentMap.get(cctvId);
                                        if (cctvEquipments) {
                                            cctvEquipmentMap.set(cctvId, cctvEquipments.filter(id => id !== poiId));
                                        }
                                        selectedPoiSet.delete(poiId);

                                    } else {
                                        // 새로운 POI인지 확인
                                        if (selectedPoiSet.has(poiId)) {
                                            // 이미 다른 CCTV에서 선택된 POI
                                            alertSwal('이미 다른 CCTV에서 선택된 장비입니다.');
                                            return;
                                        }

                                        // 새로운 POI라면 추가
                                        Px.Poi.SetColor(poiId, '#f80606');
                                        const equipmentItem = document.createElement('div');
                                        equipmentItem.textContent = poiDisplayName;
                                        equipmentItem.style.marginBottom = '5px';
                                        equipmentItem.dataset.poiId = poiId;
                                        equipmentCell.appendChild(equipmentItem);

                                        // Map과 Set에 추가
                                        if (!cctvEquipmentMap.has(cctvId)) {
                                            cctvEquipmentMap.set(cctvId, new Set());
                                        }
                                        cctvEquipmentMap.get(cctvId).push(poiId);
                                        selectedPoiSet.add(poiId);
                                    }
                                }
                            } else {
                                alertSwal('먼저 CCTV를 선택해주세요.');
                            }
                        }
                    }
                });

                console.log('sbm loading complete');
            },
        });

        // 층 콤보 박스 생성
        let floorListOpt = "<option value=''>전체</option>";

        floors.forEach((floor) => {
            floorListOpt += `<option value='${floor.no}'>${floor.name}</option>`;
        });
        const floorNo = document.querySelector('#floorNo');
        floorNo.innerHTML = floorListOpt;

        floorNo.addEventListener('change', function () {
            changeEventFloor(this.value);
        });
    });
}

const selectedFloor = (floorId) => (poi) =>
    floorId === '' || poi.property.floorNo === Number(floorId);

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

// POI 등록 모달 관련 기능들 추가
const viewerPoiData = {};

// URL에서 buildingId 가져오기
const getUrlBuildingId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return Number(urlParams.get('buildingId')) || BUILDING_ID;
};


const getViewerFloorSelectTags = () => [
    document.querySelector('#selectFloorIdRegister'),
    document.querySelector('#selectFloorIdBatchRegister'),
];

const getViewerCategorySelectTags = () => [
    document.querySelector('#selectPoiCategoryIdRegister'),
];

const getViewerMiddleCategorySelectTags = () => [
    document.querySelector('#selectPoiMiddleCategoryIdRegister'),
];

const initializeViewerFloorSelect = (floors, selectTag) => {
    selectTag.forEach((select) => {
        // 기존 옵션 제거 (첫 번째 옵션은 유지)
        while (select.childElementCount > 1) {
            select.removeChild(select.lastChild);
        }

        // 새로운 층 옵션 추가
        floors.forEach((floor) => {
            select.appendChild(new Option(floor.name, floor.no));
        });
    });
};

const initializeViewerCategorySelect = (categories, selectTag) => {
    selectTag.forEach((select) => {
        // 기존 옵션 제거 (첫 번째 옵션은 유지)
        while (select.childElementCount > 1) {
            select.removeChild(select.lastChild);
        }

        // 새로운 카테고리 옵션 추가
        categories.forEach((category) => {
            select.appendChild(new Option(category.name, category.id));
        });
    });
};

// 뷰어용 POI 카테고리 초기화
const initViewerPoiCategory = () => {
    const poiCategories = PoiCategoryManager.findAll();
    viewerPoiData.poiCategory = poiCategories;

    initializeViewerCategorySelect(poiCategories, getViewerCategorySelectTags());
};

// 뷰어용 POI 중분류 초기화
const initViewerPoiMiddleCategory = () => {
    const poiMiddleCategories = PoiMiddleCategoryManager.findAll();
    viewerPoiData.poiMiddleCategory = poiMiddleCategories;
};

// 뷰어용 건물 초기화 (이미 로드된 데이터 사용)
const initializeViewerBuildings = () => {
    const buildings = BuildingManager.findAll();
    viewerPoiData.building = buildings;

    // initBuilding()에서 이미 floors 정보를 로드했으므로 그것을 사용
    const floors = BuildingManager.findFloorsByHistory();
    if (floors && floors.length > 0) {
        initializeViewerFloorSelect(floors, getViewerFloorSelectTags());
    }
};

// POI 등록 모달 초기화 함수
function initializeViewerPoiModal() {
    // POI 카테고리 변경 이벤트
    const categorySelect = document.getElementById('selectPoiCategoryIdRegister');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const selectedCategoryId = this.value;
            const filteredMiddleCategories = viewerPoiData.poiMiddleCategory.filter(middle =>
                middle.poiCategory && middle.poiCategory.id == selectedCategoryId
            );
            initializeViewerCategorySelect(filteredMiddleCategories, getViewerMiddleCategorySelectTags());
        });
    }

    // 조명 여부 체크박스 처리
    const isLightCheck = document.getElementById('isLightPoiRegister');
    const lightGroup = document.getElementById('lightGroupRegister');
    if (isLightCheck && lightGroup) {
        lightGroup.disabled = !isLightCheck.checked;
        isLightCheck.addEventListener('change', (e) => {
            lightGroup.disabled = !isLightCheck.checked;
        });
    }

    // POI 등록 모달 show 이벤트
    const registerModal = document.querySelector('#poiRegisterModal');
    if (registerModal) {
        registerModal.addEventListener('show.bs.modal', () => {
            registerModal.querySelector('form').reset();
            document.querySelectorAll('.selectCctv').forEach(row => {
                row.classList.add('hidden');
                row.querySelectorAll('input, select, textarea').forEach(field => {
                    field.disabled = true;
                });
            });

            const form = document.querySelector('#poiRegisterForm');
            const poiCategorySelect = form.querySelector('#selectPoiCategoryIdRegister');

            poiCategorySelect.addEventListener('change', function(event) {
                const selectedText = poiCategorySelect.options[poiCategorySelect.selectedIndex].text.trim().toLowerCase();
                const selectedValue = poiCategorySelect.options[poiCategorySelect.selectedIndex].value;
                if (!selectedValue) {
                    return;
                }
                toggleViewerCctvSectionByCategory(selectedText, "Register");
            });
        });
    }

    // POI 등록 버튼 이벤트
    const btnPoiRegister = document.querySelector('#btnPoiRegister');
    if (btnPoiRegister) {
        btnPoiRegister.addEventListener('pointerup', (event) => {
            const form = document.getElementById('poiRegisterForm');
            if (!validationForm(form)) return;

            const params = {};

            params.buildingId = getUrlBuildingId();
            const floorValue = document.querySelector('#selectFloorIdRegister').value;
            params.floorNo = floorValue === '' ? null : Number(floorValue);
            params.poiCategoryId = Number(document.querySelector('#selectPoiCategoryIdRegister').value);

            const poiCategory = viewerPoiData.poiCategory.find((poiCategory) =>
                poiCategory.id === params.poiCategoryId);

            params.poiMiddleCategoryId = Number(document.querySelector('#selectPoiMiddleCategoryIdRegister').value);
            const poiMiddleCategory = viewerPoiData.poiMiddleCategory.find((poiMiddleCategory) =>
                poiMiddleCategory.id === params.poiMiddleCategoryId);
            params.iconSetId = poiMiddleCategory.imageFile.id;

            params.code = document.querySelector('#poiCodeRegister').value;
            params.name = document.querySelector('#poiNameRegister').value;
            params.tagNames = getViewerTagNames('Register');
            params.isLight = document.getElementById('isLightPoiRegister').checked;
            params.lightGroup = document.getElementById('lightGroupRegister').value;

            if (!poiCategory.name.toLowerCase().includes('cctv')) {
                params.cctvList = [];
                const mainCctvValue = document.querySelector('#mainCctvRegister').value;
                if (mainCctvValue.trim() !== "") {
                    params.cctvList.push({
                        code: mainCctvValue,
                        isMain: "Y"
                    });
                }
                const subCctvFields = document.querySelectorAll('.sub-cctv');
                subCctvFields.forEach(field => {
                    const val = field.value;
                    if (val.trim() !== "") {
                        params.cctvList.push({
                            code: val,
                            isMain: "N"
                        });
                    }
                });
            } else {
                params.cameraIp = document.querySelector('#cameraIpRegister').value;
            }

            api.post('/poi', params, {
                headers: {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                },
            }).then(() => {
                alertSwal('등록이 완료 되었습니다.').then(() => {
                    document.querySelector('#poiRegisterModal > div > div > div.modal-header > button').click();
                    // POI 리스트 새로고침 (기존 viewer 함수 활용)
                        getPoiRenderingAndList(true);
                });
            });
        });
    }

    // POI 일괄등록 모달 초기화 이벤트
    const btnBatchRegister = document.querySelector('#btnBatchRegister');
    if (btnBatchRegister) {
        btnBatchRegister.addEventListener('pointerup', () => {
            const batchForm = document.getElementById('poiBatchRegisterForm');
            if (batchForm) {
                batchForm.reset();
                // 현재 선택된 층으로 초기화
                const currentFloorNo = document.querySelector('#floorNo')?.value;
                if (currentFloorNo && currentFloorNo !== '') {
                    const floorSelect = document.querySelector('#selectFloorIdBatchRegister');
                    if (floorSelect) {
                        floorSelect.value = currentFloorNo;
                    }
                }
            }
        });
    }

    // POI 일괄등록 실행 버튼 이벤트
    const btnPoiBatchRegister = document.querySelector('#btnPoiBatchRegister');
    if (btnPoiBatchRegister) {
        btnPoiBatchRegister.addEventListener('pointerup', () => {
            const form = document.getElementById('poiBatchRegisterForm');
            if (!validationForm(form)) return;

            const formData = new FormData();
            formData.set('buildingId', getUrlBuildingId()); // URL에서 buildingId 가져오기

            // 층이 선택된 경우에만 floorNo 파라미터 추가
            const floorValue = document.getElementById('selectFloorIdBatchRegister').value;
            if (floorValue && floorValue !== '') {
                formData.set('floorNo', Number(floorValue));
            }

            formData.set('file', document.querySelector('#batchRegisterFile').files[0]);

            api.post('/poi/batch-register', formData).then((res) => {
                alertSwal('일괄등록이 완료 되었습니다.').then(() => {
                    document.querySelector('#poiBatchRegisterModal > div > div > div.modal-header > button').click();
                    // POI 리스트 새로고침
                        getPoiRenderingAndList(true);
                });
            }).catch(() => {
                document.querySelector('#batchRegisterFile').value = '';
            });
        });
    }

    // 샘플파일 다운로드 버튼 이벤트
    const btnDownloadSampleFile = document.querySelector('#btnDownloadSampleFile');
    if (btnDownloadSampleFile) {
        btnDownloadSampleFile.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = '/static/sample/poi-sample.xlsx';
            link.download = 'poi-sample.xlsx';
            link.click();
        });
    }
}

// CCTV 섹션 토글 함수
function toggleViewerCctvSectionByCategory(categoryName, type) {
    const isCctv = categoryName.toLowerCase() === 'cctv';
    const form = document.querySelector(`#poi${type}Form`);
    const cctvRows = form.querySelectorAll('.selectCctv');
    const cameraIpRow = form.querySelector('.cameraIp');

    cctvRows.forEach(row => {
        row.classList.toggle('hidden', isCctv);
        row.querySelectorAll('input, select, textarea').forEach(field => {
            field.disabled = isCctv;
        });
    });

    if (cameraIpRow) {
        cameraIpRow.classList.toggle('hidden', !isCctv);
        cameraIpRow.querySelectorAll('input, select, textarea').forEach(field => {
            field.disabled = !isCctv;
        });
    }
}

// 태그 이름 가져오기 함수
function getViewerTagNames(type) {
    const tagInput = document.querySelector(`#tag${type}`);
    if (!tagInput) return [];
    return tagInput.value
        .split(/[\n,]/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
}




const renderCctvList = (data) => {
    console.log(data);
    const cctvListHtml = document.querySelector('.cctv-list');
    cctvListHtml.innerHTML = '';

    let rowsHtml = '';
    data.forEach((value, key) => {
        const cctvPoiData = Px.Poi.GetData(Number(key));
        console.log("cctvPoiData:", cctvPoiData);

        const poiCells = value.map(poiId => {
            const poiData = Px.Poi.GetData(Number(poiId));
            console.log("poiData:", poiData);
            return `<div data-poi-id="${poiId}">${poiData.property.name}</div>`;
        }).join('');

        rowsHtml += `
            <tr data-poi-id="${key}">
                <th scope="row">${cctvPoiData.property.name}</th>
                <td style="text-align: center; vertical-align: bottom; height: 100px;">
                    ${poiCells}
                </td>
            </tr>`;
    });

    cctvListHtml.innerHTML = `<table id="cctvListTable" class="table"> 
        <thead> 
            <tr> 
                <th style="width: 50%" scope="col">CCTV</th> 
                <th style="width: 50%" scope="col">장비</th> 
            </tr> 
        </thead> 
        <tbody> 
            ${rowsHtml}
        </tbody> 
    </table>`;
    const cctvTableBody = document.querySelector('#cctvListTable > tbody');
    if (cctvTableBody) {
        cctvTableBody.addEventListener('click', (event) => {
            const clickedRow = event.target.closest('tr');
            if (clickedRow && clickedRow.dataset.poiId) {
                clearActiveCctvRows();
                clickedRow.classList.add('active');
                clickedRow.querySelectorAll('div').forEach(div => {
                    const poiId = Number(div.dataset.poiId);
                    Px.Poi.SetColor(poiId, '#f80606');
                });
            }
        });
    }
}


let cctvEquipmentMap = new Map(); // CCTV별 선택된 POI들 (db 저장용)
let selectedPoiSet = new Set();   // 전체 선택된 POI들 (중복 방지용)

const removeCctvRow = (poiId) => {
    const rowToDelete = document.querySelector('#cctvListTable > tbody > tr[data-poi-id="' + poiId + '"]');
    const equipmentToRemove = rowToDelete.querySelectorAll('td > div');

    if(equipmentToRemove.length > 0) {
        equipmentToRemove.forEach(div => {
            const equipmentPoiId = Number(div.dataset.poiId);
            Px.Poi.RestoreColor(equipmentPoiId);
            div.remove();

            // 전체 선택된 POI Set에서도 제거
            selectedPoiSet.delete(equipmentPoiId);
        });
    }

    // Map에서도 해당 CCTV 제거
    cctvEquipmentMap.delete(poiId);

    rowToDelete.remove();
};

const clearActiveCctvRows = () => {
    document.querySelectorAll('#cctvListTable > tbody > tr').forEach(row => {
        if(row.classList.contains('active')) {
            row.classList.remove('active');

            // 선택된 POI의 색상 복원
            row.querySelectorAll('div').forEach(div => {
                const poiId = Number(div.dataset.poiId);
                Px.Poi.RestoreColor(poiId);
            });
        }
    });
}

const saveCctvEquipment = async () => {
    const data = convertMapToBackendData();

    try {
        const response = await fetch('/poi/cctv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alertSwal('저장되었습니다.');
            clearCctvList();
        } else {
            alertSwal('저장에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alertSwal('저장 중 오류가 발생했습니다.');
    }
};

const getCctvList = async () => {

    clearCctvList();

    try{
        const response = await fetch('/poi/cctvs/poi-ids', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const { result: data } = result;

        cctvEquipmentMap = new Map(
            Object.entries(data).map(([key, value]) => [
                Number(key),
                value
            ])
        );
        selectedPoiSet = new Set(Object.values(data).flat());

        renderCctvList(cctvEquipmentMap);

    }catch (error) {
        console.error('Error fetching CCTV list:', error);
        alertSwal('CCTV 목록을 불러오는 중 오류가 발생했습니다.');
    }
}

const convertMapToBackendData = () => {
    const backendData = [];
    
    cctvEquipmentMap.forEach((equipmentSet, cctvId) => {
        // CCTV ID와 선택된 POI ID 목록으로 DTO 생성
        const dto = {
            cctvPoiId: parseInt(cctvId),  // CCTV인 POI의 ID
            targetPoiIds: Array.from(equipmentSet).map(poiId => parseInt(poiId)) // CCTV를 추가할 주변 POI들의 ID 목록
        };
        
        backendData.push(dto);
    });
    
    return backendData;
};

const clearCctvList = () => {

    clearActiveCctvRows();
};

document.getElementById('cctvSave').addEventListener('click', saveCctvEquipment);
document.getElementById('cctvReset').addEventListener('click', clearCctvList);





// 뷰어용 POI 데이터 초기화 함수
function initializeViewerPoiData() {
    initializeViewerBuildings();
    initViewerPoiCategory();
    initViewerPoiMiddleCategory();
    initializeViewerPoiModal();

}