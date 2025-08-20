(async function() {

    await BuildingManager.getStoreBuilding();
    initRegisterBuildingBtn();
    function initRegisterBuildingBtn() {
        const registerBtn = document.getElementById('registerKioskBuilding');
        const modifyBtn = document.getElementById('modifyKioskBuilding');
        BuildingManager.getStoreBuilding().then(building => {
            if (building) {
                registerBtn.style.display = 'none';
                modifyBtn.style.display = 'block';
            } else {
                registerBtn.style.display = 'block';
                modifyBtn.style.display = 'none';
            }
        })
    }

    const initializeStoreBuilding = async (onComplete) => {
        try {
            const container = document.getElementById('webGLContainer');
            container.innerHTML = '';
            const storeBuilding = await BuildingManager.findStore();
            let buildingId = storeBuilding ? storeBuilding.id : null;
            const kioskSet = new Set(['B2', 'B1', '1F', '2F']);
            document.getElementById('buildingId').value = buildingId;

            const nameMap = {
                B2: 'B1F',
                B1: 'GF'
            };
            Px.Core.Initialize(container, async () => {
                let sbmDataArray = [];
                if (storeBuilding) {
                    const { buildingFile } = storeBuilding;
                    const version = storeBuilding.getVersion();
                    const { directory } = buildingFile;

                    const floors = await BuildingManager.getFloorsByHistoryVersion(version);

                    sbmDataArray = floors
                        .filter(floor => kioskSet.has(floor.name))
                        .flatMap(floor =>
                            floor.sbmFloor.map(sbm => ({
                                url: `/Building/${directory}/${version}/${sbm.sbmFileName}`,
                                id: floor.id,
                                displayName: sbm.sbmFileName,
                                baseFloor: sbm.sbmFloorBase,
                                groupId: sbm.sbmFloorGroup,
                            }))
                        );
                } 
    
                Px.Loader.LoadSbmUrlArray({
                    urlDataList: sbmDataArray,
                    center: "",
                    onLoad: function() {
                        document.querySelector('canvas').style.position = 'static';
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

            // 층 콤보 박스 생성
            let floorListOpt = "<option value=''>전체</option>";
            BuildingManager.findStore().floors
                .filter(floor => kioskSet.has(floor.name))
                .forEach((item) => {
                    const displayName = nameMap[item.name] || item.name;
                    floorListOpt += `<option value='${item.no}'>${displayName}</option>`;
                });

            const floorNo = document.querySelector('#floorNo');
            floorNo.innerHTML = floorListOpt;

            floorNo.addEventListener('change', function () {
                changeEventFloor(this.value, buildingId);
            });

            initLeftSelect(buildingId, kioskSet);
            initDropUpMenu();

        } catch (error) {
            console.error('PX Engine Initial', error);
        }
    };

    document.querySelector('#camPosTool').addEventListener('click', (evt) => {
        const target = evt.target.closest('.camPosTool');
        const storeBuilding = BuildingManager.findStore();
        if(target === null) return;

        const { btnType } = target.dataset;
        const camPos = JSON.stringify(Px.Camera.GetState());

        const param = {
            camera: camPos,
        };

        api.patch(`/buildings/${storeBuilding.id}/${btnType}`, param).then(() => {
            alertSwal('정상 등록 되었습니다.');
            BuildingManager.findStore()[btnType] = camPos;
        });
    });


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
                                Px.Edit.Off();
                                target.classList.remove('on');
                            } else {
                                if (document.querySelector('#floorNo').value === '') {
                                    alertSwal('전체 층일경우 POI 수정이 불가능 합니다.');
                                    return;
                                }
                                Px.Edit.On();
                                target.classList.add('on');
                                const mode = 'translate';
                                Px.Edit.SetMode(mode);
                                Px.Edit.SetMouseUpCallback((poiInfo) => {
                                    KioskPoiManager.patchKioskPoiPosition(poiInfo.id, poiInfo.position);
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

    function changeEventFloor(floorNo, buildingId) {
        if (floorNo === '') {
            Px.Model.Visible.ShowAll();
        } else {

            Px.Model.Visible.HideAll();

            const floor = BuildingManager.findFloorsByHistory().find(
                (floor) => floor.no === Number(floorNo),
            );
            Px.Model.Visible.Show(floor.id);
        }
    }

    const categoryList = [
        { label: "상가", value: "store" },
        { label: "키오스크", value: "kiosk" }
    ];
    const initLeftSelect = (buildingId, kioskSet) => {
        const selectEl = document.getElementById("leftFloorSelect");
        selectEl.innerHTML = "";
        const initLeftFloorSelect = () => {
            let floors = BuildingManager.findStore().floors;
            const nameMap = {
                B2: 'B1F',
                B1: 'GF'
            };
            floors
                .filter(floor => kioskSet.has(floor.name))
                .forEach(floor => {
                    const displayName = nameMap[floor.name] || floor.name;
                    selectEl.appendChild(
                        new Option(displayName, floor.no)
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
            ele: '#kioskPoiSelect',
            options: categoryList,
            selectedValue: categoryList.map((category) => category.value),
            multiple: true,
            silentInitialValueSet: true,
            search: false,
            name: 'kioskPoiSelect',
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

    const kioskBuildingRegistModal = document.getElementById('kioskBuildingRegistModal');
    kioskBuildingRegistModal.addEventListener('shown.bs.modal', () => {
        document.getElementById('btnKioskBuildingRegist').disabled = false;
        document.getElementById('btnKioskBuildingRegist').innerHTML = '등록';
        document.getElementById('kioskBuildingRegistForm').reset();
    });

    // kioskBuilding
    const btnKioskBuildingRegist = document.getElementById('btnKioskBuildingRegist');
    btnKioskBuildingRegist.onclick = () => {
        const form = document.getElementById('kioskBuildingRegistForm');
        if (!validationForm(form)) return;

        document.getElementById('btnKioskBuildingRegist').disabled = true;
        document.getElementById('btnKioskBuildingRegist').innerHTML =
            '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Loading...';

        const isIndoor = form.querySelector('input[name="isIndoor"]:checked').value;
        const buildingType = (isIndoor === 'Y') ? 'indoor' : 'outdoor';
        const version = getVersionString();

        const formData = new FormData(form);
        formData.set('buildingType', buildingType);

        const fileFormData = new FormData();
        fileFormData.set('file', formData.get('multipartFile'));
        fileFormData.set('version', version);

        const headers = {
            'Content-Type': 'application/json',
        };

        // 빌딩 파일 업로드
        api.post('/buildings/files', fileFormData).then((res) => {
            const {result: data} = res.data;
            const param = {
                buildingType: buildingType,
                name: formData.get('name'),
                code: formData.get('code'),
                description: formData.get('description'),
                fileInfoId: data.id,
                isIndoor: isIndoor,
                version: version
                // floors
            }
            api.post('/buildings', param, {headers}).then(() => {
                alertSwal('등록되었습니다.').then(() => {
                    kioskBuildingRegistModal.querySelector('.btn-close').click();
                    window.location.reload();
                });
            }).catch(() => {
                document.getElementById('btnKioskBuildingRegist').disabled = false;
                document.getElementById('btnKioskBuildingRegist').innerHTML = '등록';
            })
        }).catch(() => {
            document.getElementById('btnKioskBuildingRegist').disabled = false;
            document.getElementById('btnKioskBuildingRegist').innerHTML = '등록';
        });
    }

    const getVersionString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    const modifyModal = document.getElementById('kioskBuildingModifyModal');
    modifyModal.addEventListener('show.bs.modal', event => {
        const id = document.getElementById('buildingId').value;
        const form = document.getElementById('kioskBuildingModifyForm');
        document.getElementById('btnKioskBuildingModify').disabled = false;
        document.getElementById('btnKioskBuildingModify').innerHTML = '수정';
        form.querySelector('#modifyId').value = id;
        form.reset();
        let currentBuildingFileId = null;

        if (id) {
            Promise.all([
                api.get(`/buildings/${id}`),
                getHistoryList(id)
            ]).then(([buildingRes, historyList]) => {
                const {result: resultData} = buildingRes.data;
                form.querySelector('#modifyName').value = resultData.name;
                form.querySelector('#modifyCode').value = resultData.code;
                if (resultData.isIndoor === 'Y') {
                    form.querySelector('input[name="isIndoor"][value="Y"]').checked = true;
                } else {
                    form.querySelector('input[name="isIndoor"][value="N"]').checked = true;
                }
                form.querySelector('#modifyDescription').innerHTML = resultData.description;
                currentBuildingFileId = resultData.buildingFile.id;

                setBuildingVersionSelect(historyList, resultData.version);
            });
        }
    });

    // 수정폼 수정 처리
    const btnKioskBuildingModify = document.getElementById('btnKioskBuildingModify');
    btnKioskBuildingModify.onclick = () => {
        const form = document.getElementById('kioskBuildingModifyForm');
        if (!validationForm(form)) return;

        document.getElementById('btnKioskBuildingModify').disabled = true;
        document.getElementById('btnKioskBuildingModify').innerHTML =
            '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Loading...';

        const formData = new FormData(form);

        const headers = {
            'Content-Type': 'application/json',
        };

        const buildingParam = {
            buildingType: 'indoor',
            code: document.getElementById('modifyCode').value,
            name: formData.get('name'),
            isIndoor: formData.get('isIndoor'),
            description: formData.get('description'),
            historyId: document.getElementById('kioskBuildingVersionSelect').value

        }

        api.put(`/buildings/${formData.get('id')}`, buildingParam, { headers })
            .then(() => {
                alertSwal('수정되었습니다.').then(()=> {
                    document.querySelector('#kioskBuildingModifyModal .btn-close').click();
                    window.location.reload();
                });

            })
            .catch(() => {
                document.getElementById('btnKioskBuildingModify').disabled = false;
                document.getElementById('btnKioskBuildingModify').innerHTML = '수정';
            });
    };

    function getHistoryList(id) {
        return api.get(`/buildings/history/building/${id}`).then((res) => {
            const {result: historyList} = res.data;
            renderHistoryList(historyList);
            return historyList;
        });
    }

    function setBuildingVersionSelect(historyList, version) {
        const select = document.getElementById('kioskBuildingVersionSelect');
        select.innerHTML = ''; // 기존 옵션들 제거

        historyList.forEach(history => {
            const option = document.createElement('option');
            option.value = history.historyId;
            option.textContent = history.buildingVersion;
            if(history.buildingVersion === version) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    const renderHistoryList = (historyList) => {

        const tbody = document.getElementById('historyListBody');
        tbody.innerHTML = ''; // 기존 내용 초기화
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>도면 버전</th>
            <th>도면 파일명</th>
            <th>수정 내용</th>
        `;
        tbody.appendChild(headerRow);
        if (historyList.length === 0) {
            tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">등록된 이력이 없습니다.</td>
            </tr>
        `;
            return;
        }
        const select = document.getElementById('kioskBuildingVersionSelect');
        historyList.forEach(history => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${history.buildingVersion || '-'}</td>
            <td>${history.fileName || '-'}</td>
            <td>${history.historyContent || '-'}</td>
            <input type="hidden" id="historyId" value="${history.historyId}">
        `;
            tbody.appendChild(row);

            if (!select.querySelector(`option[value="${history.historyId}"]`)) {
                const option = document.createElement('option');
                option.value = history.historyId;
                option.textContent = history.buildingVersion || '-';
                select.appendChild(option);
            }
        });
    };

    const buildingUploadBtn = document.getElementById('kioskBuildingUploadBtn');

    buildingUploadBtn.onclick = () => {
        const version = getVersionString();
        const getHistoryContent = document.getElementById('kioskBuildingHistoryContent').value;
        const uploadFile = document.getElementById('kioskBuildingUploadFile');
        const getBuildingId = document.getElementById('modifyId').value;

        const fileFormData = new FormData();
        fileFormData.set('file', uploadFile.files[0]);
        fileFormData.set('version', version);

        const headers = {
            'Content-Type': 'application/json',
        };

        // history 파일 등록
        api.post(`/buildings/${getBuildingId}/history/files`, fileFormData).then((res) => {
            const {result: data} = res.data;
            const param = {
                buildingId: getBuildingId,
                historyContent: getHistoryContent,
                fileInfoId: data.id,
                version: version
            }
            api.post('/buildings/history', param, {headers}).then(() => {
                alertSwal('등록되었습니다.');
                // history load
                getHistoryList(getBuildingId);
            })
        })
    }

    await initializeStoreBuilding();
})();


