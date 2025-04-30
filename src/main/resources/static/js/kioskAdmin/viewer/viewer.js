(async function() {
    await BuildingManager.getBuildingList().then((buildingList) => {
        buildingList.forEach(async (building) => {
            const {id} = building;
            await BuildingManager.getBuildingById(id).then((building) => {
                BuildingManager.findById(id).setDetails(building);
            });
        })
    });


    await KioskPoiManager.getKioskPoiDetailList();

    const initializeStoreBuilding = async (onComplete) => {
        try {
            const container = document.getElementById('webGLContainer');
            container.innerHTML = '';
            const storeBuilding = await BuildingManager.findByCode('store');
            let buildingId = storeBuilding ? storeBuilding.id : null;
            const kioskSet = new Set(['B2', 'B1', '1F', '2F']);
            document.getElementById('buildingId').value = buildingId;

            Px.Core.Initialize(container, async () => {
                let sbmDataArray = [];
                if (storeBuilding) {
                    const { buildingFile, floors } = storeBuilding;
                    const { directory } = buildingFile;

                    sbmDataArray = floors
                        .filter(floor => kioskSet.has(floor.name))
                        .map(floor => {
                            const url = `/Building/${directory}/${floor.sbmFloor[0].sbmFileName}`;
                            return {
                                url,
                                id: floor.sbmFloor[0].id,
                                displayName: floor.sbmFloor[0].sbmFileName,
                                baseFloor: floor.sbmFloor[0].sbmFloorBase,
                                groupId: floor.sbmFloor[0].sbmFloorGroup,
                            };
                        });
                } 
    
                Px.Loader.LoadSbmUrlArray({
                    urlDataList: sbmDataArray,
                    center: "",
                    onLoad: function() {
                        initPoi();
                        Px.Model.Visible.ShowAll();
                        Px.Util.SetBackgroundColor('#333333');
                        Px.Camera.FPS.SetHeightOffset(15);
                        Px.Camera.FPS.SetMoveSpeed(500);
                        Px.Event.On();
                        Px.Event.AddEventListener('dblclick', 'poi', (poiInfo) => {
                            showPoiMenu(poiInfo);
                        });
                        Px.Effect.Outline.HoverEventOn('area_no');
                        if (onComplete) onComplete();
                        if(storeBuilding.camera3d)
                            Px.Camera.SetState(JSON.parse(storeBuilding.camera3d));
                    }
                });
            });

            api.get("/kiosk/detailList").then(res => {
                console.log("res : ", res);
            })

            // 층 콤보 박스 생성
            let floorListOpt = "<option value=''>전체</option>";
            BuildingManager.findById(buildingId).floors
                .filter(floor => kioskSet.has(floor.name))
                .forEach((item) => {
                    floorListOpt += `<option value='${item.id}'>${item.name}</option>`;
                });

            const floorNo = document.querySelector('#floorNo');
            floorNo.innerHTML = floorListOpt;

            floorNo.addEventListener('change', function () {
                changeEventFloor(this.value, buildingId);
            });

            initLeftSelect(buildingId);
            initDropUpMenu();

        } catch (error) {
            console.error('PX Engine Initial', error);
        }
    };

    document.querySelector('#camPosTool').addEventListener('click', (evt) => {
        const target = evt.target.closest('.camPosTool');
        const storeBuilding = BuildingManager.findByCode('store');
        if(target === null) return;

        const { btnType } = target.dataset;
        const camPos = JSON.stringify(Px.Camera.GetState());

        const param = {
            camera: camPos,
        };

        api.patch(`/buildings/${storeBuilding.id}/${btnType}`, param).then(() => {
            alertSwal('정상 등록 되었습니다.');
            BuildingManager.findById(storeBuilding.id)[btnType] = camPos;
        });
    });

    const movePoiHandler = (poiInfo) => { moveToPoi(poiInfo.id) };

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
                        case 'move' :
                            if (target.classList.contains('on')) {
                                target.classList.remove('on');
                                Px.Event.RemoveEventListener('pointerup', 'poi', movePoiHandler);
                            } else {
                                target.classList.add('on');
                                Px.Event.AddEventListener('pointerup', 'poi', movePoiHandler);
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

    const activePopups = new Map();

    const showPoiMenu = async (poiInfo) => {

        const dropdownContentDiv = document.createElement('div');
        dropdownContentDiv.classList.add('dropdown-content');
        dropdownContentDiv.classList.add('poi-on-map');
        dropdownContentDiv.dataset.poiId = poiInfo.id;

        const dropdownItemInfo = document.createElement('a');
        dropdownItemInfo.classList.add('dropdown-item');
        dropdownItemInfo.textContent = 'POI 속성';
        dropdownItemInfo.addEventListener('click', () => {
            handlePoiModifyBtnClick(poiInfo);
        });

        const dropdownItemDeleteA = document.createElement('a');
        dropdownItemDeleteA.classList.add('dropdown-item');
        dropdownItemDeleteA.textContent = 'POI 삭제하기';
        dropdownItemDeleteA.addEventListener('click', () => {
            deletePoi(poiInfo.id);
        });

        const dropdownItemUnAllocateA = document.createElement('a');
        dropdownItemUnAllocateA.classList.add('dropdown-item');
        dropdownItemUnAllocateA.textContent = 'POI 미배치로 변경';
        dropdownItemUnAllocateA.addEventListener('click', () => {
            unAllocatePoi(poiInfo.id);
        });

        dropdownContentDiv.appendChild(dropdownItemInfo);
        dropdownContentDiv.appendChild(dropdownItemUnAllocateA);
        dropdownContentDiv.appendChild(dropdownItemDeleteA);

        const {x, y} = Px.Poi.Get2DPosition(poiInfo.id);

        const sidebar = document.querySelector('.viewer-sidebar');
        const navbar = document.querySelector('.navbar.navbar-bg');
        const sidebarWidth = sidebar?.offsetWidth || 0;
        const navbarHeight = navbar?.offsetHeight || 0;
        dropdownContentDiv.style.position = 'fixed';
        dropdownContentDiv.style.zIndex = '9999';
        dropdownContentDiv.style.left = `${x + sidebarWidth}px`;
        dropdownContentDiv.style.top = `${y + navbarHeight}px`;

        document.querySelector('#content-wrapper').appendChild(dropdownContentDiv);

        const updatePosition = () => {
            const { x, y } = Px.Poi.Get2DPosition(poiInfo.id);
            dropdownContentDiv.style.left = `${x + sidebarWidth}px`;
            dropdownContentDiv.style.top = `${y + navbarHeight}px`;

            if (!activePopups.has(poiInfo.id)) return;
            requestAnimationFrame(updatePosition);
        };

        activePopups.set(poiInfo.id, { dom: dropdownContentDiv });
        updatePosition();
    }

    function changeEventFloor(floorId, buildingId) {
        if (floorId === '') {
            Px.Model.Visible.ShowAll();
        } else {

            Px.Model.Visible.HideAll();

            const floor = BuildingManager.findById(buildingId).floors.find(
                (floor) => floor.id === Number(floorId),
            );
            Px.Model.Visible.Show(floor.id);
        }
    }

    const categoryList = [
        { label: "상가", value: "store" },
        { label: "키오스크", value: "kiosk" }
    ];
    const initLeftSelect = (buildingId) => {
        const initLeftFloorSelect = () => {
            let floors = BuildingManager.findById(buildingId).floors;
            floors.forEach(floor => {
                document.getElementById("leftFloorSelect")
                    .appendChild(
                        new Option(floor.name, floor.id),
                    );
            })
        }
        const initLeftPoiCategorySelect = () => {
            categoryList.forEach(category => {
                document.getElementById("leftPoiCategorySelect")
                    .appendChild(
                        new Option(category.label, category.value),
                    );
            })
        }
        initLeftFloorSelect();
        initLeftPoiCategorySelect();
    }

    const initDropUpMenu = () => {

        VirtualSelect.init({
            ele: '#poiSelect',
            options: categoryList,
            selectedValue: categoryList.map((category) => category.value),
            multiple: true,
            silentInitialValueSet: true,
            search: false,
            name: 'poiSelect',
            placeholder: 'POI 카테고리',
            selectAllText: '전체 선택',
            allOptionsSelectedText: '모두 선택됨',
        });
    };

    const submitPwChange =() => {
        const currentPw = document.getElementById("currentPw").value.trim();
        const newPw = document.getElementById("newPw").value.trim();
        const confirmPw = document.getElementById("confirmPw").value.trim();
        const userId = document.getElementById("userId").value;

        // 유효성 검사
        if (!currentPw || !newPw || !confirmPw) {
            alertSwal("모든 항목을 입력해주세요.");
            return;
        }

        if (newPw !== confirmPw) {
            alertSwal("변경 비밀번호와 재입력이 일치하지 않습니다.");
            return;
        }
        api.patch(`/kiosk-user/${userId}/change-password`, {
            password: currentPw,
            newPassword: newPw
        }).then(res => {
            alertSwal("비밀번호가 성공적으로 변경되었습니다.");
            document.getElementById("pwChangeForm").reset();
            bootstrap.Modal.getInstance(document.getElementById('pwChangeModal')).hide();
        }).catch(err => {
            console.error("비밀번호 변경 실패", err);
            alertSwal(err.message);
        });
    }


    document.getElementById("btnChangePw").addEventListener("click", submitPwChange);

    document.querySelector('#pwChangeModal').addEventListener('hide.bs.modal', function () {
        const form = document.getElementById("pwChangeForm");
        if(form){
            form.reset();
        }
    });

    await initializeStoreBuilding();
})();


