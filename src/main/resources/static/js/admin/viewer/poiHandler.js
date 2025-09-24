const initPoi = async () => {
    await PoiManager.getPoiList();
    await getPoiRenderingAndList();
    PoiManager.renderAllPoiToEngineByBuildingId(BUILDING_ID);

    document.querySelector('#webGLContainer').addEventListener('pointerup', () => {
        const popupList = document.querySelectorAll(
            '#webGLContainer .dropdown-content',
        );
        popupList.forEach((popup) => {
            popup.remove();
        });
    });

};

const leftPoiListInit = async () => {
    const initPoiCategory = async () => {
        PoiCategoryManager.findAll().forEach((poiCategory) => {
            document
                .querySelector('#largePoiCategorySelectSearchForm')
                .appendChild(
                    new Option(poiCategory.name, poiCategory.id),
                );
        });

        document
            .querySelector('#largePoiCategorySelectSearchForm')
            .addEventListener('change', (event) => {
                const selectedCategoryId = event.target.value;
                const middleSelect = document.querySelector('#middlePoiCategorySelectSearchForm');
                middleSelect.innerHTML = '<option value="">중분류 전체</option>';

                const middleCategories = PoiMiddleCategoryManager.findAll();

                middleCategories
                    .filter(middleCate => middleCate.poiCategory && middleCate.poiCategory.id == selectedCategoryId)
                    .forEach(middleCate => {
                        middleSelect.appendChild(new Option(middleCate.name, middleCate.id));
                    });

                getPoiRenderingAndList();
            });

        document
            .querySelector('#middlePoiCategorySelectSearchForm')
            .addEventListener('change', () => {
                getPoiRenderingAndList();
            });
    };
    const initDropUpMenu = () => {
        const category = PoiCategoryManager.findAll()
            .map((poiCategory) => ({
                label: String(poiCategory.name),
                value: String(poiCategory.id),
            }));
        const registeredOptions = [
            { label: '등록 장비', value: '0' },
            { label: '미등록 장비', value: '1' }
        ];

        VirtualSelect.init({
            ele: '#poiSelect',
            options: category,
            selectedValue: category.map((category) => category.value),
            multiple: true,
            silentInitialValueSet: true,
            search: false,
            name: 'poiSelect',
            placeholder: 'POI 카테고리',
            selectAllText: '전체 선택',
            allOptionsSelectedText: '모두 선택됨',
        });

        VirtualSelect.init({
            ele: '#registeredPoiSelect',
            options: registeredOptions,
            selectedValue: registeredOptions.map(opt => opt.value),
            multiple: true,
            silentInitialValueSet: true,
            search: false,
            name: 'registeredPoiSelect',
            placeholder: '장비 목록',
            selectAllText: '전체 선택',
            allOptionsSelectedText: '모두 선택됨',
        });

        document
            .querySelector('#poiSelect')
            .addEventListener('change', (event) => {
                const poiCategoryIds = event.target.value;
                const floorId = document.querySelector('#floorNo').value;
                const poiList = PoiManager.findByBuilding(BUILDING_ID)
                    .filter(selectedPoiCategory(poiCategoryIds))
                    .filter(selectedFloor(floorId));
                renderingPoiList(poiList);
            });

        document
            .querySelector('#registeredPoiSelect')
            .addEventListener('change', (event) => {
                const registeredValues = event.target.value;
                const floorId = document.querySelector('#floorNo').value;
                const poiList = PoiManager.findByBuilding(BUILDING_ID)
                    .filter(selectedCCTVStatus(registeredValues))
                    .filter(selectedFloor(floorId));
                renderingPoiList(poiList);
            });
    };

    const initEditPoiTool = () => {
        document
            .querySelector('#editPoiTool')
            .addEventListener('pointerup', (event) => {
                const target = event.target.closest('.btnPoiTool');
                const targetType =
                    event.target.closest('.btnPoiTool')?.dataset.btnType;
                if (!target) {
                    return;
                }
                if (document.querySelector('#floorNo').value === '') {
                    alertSwal('층을 선택해주세요');
                    return;
                }
                switch (targetType) {
                    case 'edit':
                        if (target.classList.contains('on')) {
                            Px.Edit.Off();
                            document.querySelectorAll('.btnPoiTool.on').forEach(btn => btn.classList.remove('on'));
                        } else {
                            Px.Edit.On();
                            target.classList.add('on');
                            document.querySelector('.btnPoiTool[data-btn-type=translate]').classList.add('on');
                            Px.Edit.SetMode('translate');
                            Px.Edit.SetMouseUpCallback((poiInfo) => {
                                const { id } = Px.Poi.GetData(poiInfo.id);
                                const {btnType: editType} = document.querySelector('.btnPoiTool.on:not([data-btn-type=edit])').dataset;
                                const param = {};
                                if(editType === 'translate') {
                                    param.x = poiInfo.position.x;
                                    param.y = poiInfo.position.y;
                                    param.z = poiInfo.position.z;
                                    PoiManager.patchPoiPosition(id, param);
                                } else if (editType === 'rotate') {
                                    param.x = poiInfo.rotation.x;
                                    param.y = poiInfo.rotation.y;
                                    param.z = poiInfo.rotation.z;
                                    PoiManager.patchPoiRotation(id, param);
                                } else if(editType === 'scale') {
                                    param.x = poiInfo.scale.x;
                                    param.y= poiInfo.scale.y;
                                    param.z = poiInfo.scale.z;
                                    PoiManager.patchPoiScale(id, param);
                                }
                            });

                        }
                        break;
                    case 'translate':
                    case 'rotate':
                    case 'scale': {
                        document.querySelectorAll('.btnPoiTool.on:not([data-btn-type=edit])').forEach(btn => btn.classList.remove('on'));
                        target.classList.add('on');
                        Px.Edit.SetMode(targetType);
                        editType = targetType;
                        break;
                    }
                    default:
                        console.log('case에 없는 dataset입니다.');
                }
            });
    };
    await initPoiCategory();
    initDropUpMenu();
    initEditPoiTool();
};

const allocatePoi = (id) => {
    if (document.querySelector('#floorNo').value === '') {
        alertSwal('전체 층일경우 POI 수정이 불가능 합니다.');
        return;
    }
    PoiManager.renderPoiByIdAddByMouse(id);
};

const deletePoi = (id) => {
    confirmSwal('POI를 삭제하시겠습니까?').then(() =>{
        const poi = PoiManager.findById(id);
        PoiManager.deletePoi(id).then(() => {
            poi.removeOn3D();
            getPoiRenderingAndList();
        });
    });
};

const unAllocatePoi = (ids) => {
    confirmSwal('POI를 미배치로 변경하시겠습니까?').then(() => {
        return api.patch(`/poi/un-allocation/${ids}`)
            .then(() => {
                ids.forEach((id) => PoiManager.findById(id).removeOn3D());
                getPoiRenderingAndList(true);
            });

    });
};

const pagination = (list, page, recordSize) => {
    const start = (page - 1) * recordSize;
    const end = start + recordSize;
    return list.slice(start, end);
};

// filteredList = 사이드 poi 리스트
// displayPoiList = viewer 에 표출되는 poi 리스트
const getPoiRenderingAndList = async (type) => {

    if (type === true) {
        await PoiManager.getPoisByBuildingId(BUILDING_ID);
    }

    let filteredList = PoiManager.findByBuilding(BUILDING_ID)
    let displayPoiList = filteredList;

    if (filteredList === undefined || filteredList.length < 1) {
        console.warn('POI 가 한 개도 없습니다.');
        return;
    }

    // 대분류
    const largePoiCategoryId = Number(
        document.querySelector('#largePoiCategorySelectSearchForm').value,
    );
    if (largePoiCategoryId) {
        filteredList = filteredList.filter(
            (poi) => poi.poiCategory === largePoiCategoryId,
        );
    }

    // 중분류
    const middlePoiCategoryId = Number(
        document.querySelector('#middlePoiCategorySelectSearchForm').value,
    );

    if (middlePoiCategoryId) {
        filteredList = filteredList.filter(
            (poi) => poi.poiMiddleCategory === middlePoiCategoryId,
        );
    }

    const poiCategoryCheckbox = [
        ...document.querySelectorAll(
            '#dropdownMenuButtonList > li .form-check-input:checked',
        ),
    ];
    poiCategoryCheckbox.forEach((poiCategory) => {
        filteredList = filteredList.filter(
            (poi) => poi.poiCategory === Number(poiCategory.value),
        );
    });

    const searchKeyword = document.querySelector('#searchKeyword');
    displayPoiList = filteredList;

    if (searchKeyword.value) {
        filteredList = filteredList.filter((poi) =>
            poi.name.toLowerCase().includes(searchKeyword.value.toLowerCase()),
        );

    }

    if (document.querySelector('#poiAllocate').classList.contains('active')) {  //배치
        filteredList = filteredList.filter((poi) => poi.position !== null);
        displayPoiList = displayPoiList.filter(selectedPoiCategory(document.querySelector('#poiSelect').value));

        // 배치일때 filteredList, displayPoiList 모두 현재 선택된 층으로 필터링
        const floorSelectBoxId = Number(
            document.querySelector('#floorNo').value);
        if (floorSelectBoxId !== 0) {
            filteredList = filteredList.filter(
                (poi) => poi.property.floorNo === floorSelectBoxId
            );
            displayPoiList = displayPoiList.filter(
                (poi) => poi.property.floorNo === floorSelectBoxId
            );
        }
    } else if (document.querySelector('#poiUnAllocate').classList.contains('active')) { // 미배치
        displayPoiList = displayPoiList.filter(selectedPoiCategory(document.querySelector('#poiSelect').value));


        // 미배치일때 displayPoiList만 현재 선택된 층으로 필터링
        const floorSelectBoxId = Number(document.querySelector('#floorNo').value);
        if (floorSelectBoxId !== 0) {
            displayPoiList = displayPoiList.filter(
                (poi) => poi.property.floorNo === floorSelectBoxId
            );
        }

        filteredList = filteredList.filter((poi) => poi.position === null);
    }

    poiPaging(filteredList);

    if (
        document.querySelector('#poi-tab').classList.contains('active') ||
        document.querySelector('#patrol-tab').classList.contains('active') ||
        document.querySelector('#cctv-tab').classList.contains('active')
    ) {
        renderingPoiList(displayPoiList);
    }

};



document
    .querySelector('#poiAllocate')
    .addEventListener('pointerup', (event) => {
        const { currentTarget } = event;
        currentTarget.classList.add('active');
        document.querySelector('#poiUnAllocate').classList.remove('active');
        getPoiRenderingAndList(1);
    });

document
    .querySelector('#poiUnAllocate')
    .addEventListener('pointerup', (event) => {
        const { currentTarget } = event;
        currentTarget.classList.add('active');
        document.querySelector('#poiAllocate').classList.remove('active');
        getPoiRenderingAndList(1);
    });

document
    .querySelector('#btnPoiSearch')
    .addEventListener('pointerup', () => {
        getPoiRenderingAndList(1);
    });

document.querySelector('#searchKeyword').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        getPoiRenderingAndList(1);
    }
});
const showPoi = () => {
    let filteredList = PoiManager.findByBuilding(BUILDING_ID);

    if (filteredList === undefined || filteredList.length < 1) {
        console.warn('POI 가 한 개도 없습니다.');
        return;
    }


    const floorSelectBoxId = Number(document.querySelector('#floorNo').value);
    if (floorSelectBoxId !== 0) {
        filteredList = filteredList.filter(
            (poi) => poi.floor.id === floorSelectBoxId,
        );
    }

    //도면 표출 POI 하단 POI 카테고리 조건 추가
    filteredList = filteredList.filter(selectedPoiCategory(document.querySelector('#poiSelect').value));

    if (
        document.querySelector('#poi-tab').classList.contains('active') ||
        document.querySelector('#patrol-tab').classList.contains('active')
    ) {
        renderingPoiList(filteredList);
    }

};

const moveToPoi = (id) => {
    let poiId;
    if (id.constructor.name === 'PointerEvent') {
        poiId = id.currentTarget.getAttribute('poiid');
    } else {
        poiId = id;
    }
    const poiData = Px.Poi.GetData(poiId);

    if (poiData) {
        Px.Model.Visible.Show(String(poiData.property.floorId));
        Px.Camera.MoveToPoi({
            id: poiId,
            isAnimation: true,
            duration: 500,
        });
    } else {
        alertSwal('POI를 배치해주세요');
    }
};

const renderingPoiList = (filteredList) => {
    Px.Poi.HideAll();
    if(!document.querySelector('.evacRouteBtn').classList.contains('on')){
        filteredList.forEach((poiInfo) => {
            Px.Poi.Show(poiInfo.id);
        });
    }
};

const selectedPoiCategory = (poiCategoryIdList) => (poi) =>
    poiCategoryIdList.includes(String(poi.poiCategory));

const selectedCCTVStatus = (values) => {
    const arr = Array.isArray(values) ? values : [values];
    return (poi) => {
        const has = Array.isArray(poi.cctvList) && poi.cctvList.length > 0;
        return arr.some(v => (v === '0' && has) || (v === '1' && !has));
    };
};