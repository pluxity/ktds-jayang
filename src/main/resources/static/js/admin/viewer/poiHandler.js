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

const removeAllChildElements = (selectTags) => {
    selectTags.forEach((select) => {
        while (select.childElementCount > 1) {
            select.removeChild(select.lastChild);
        }
    });
};

const addFloorOptionToSelect = (data, selectTag) => {
    data.forEach((floor) => {
        selectTag.forEach((select) => {
            select.appendChild(new Option(floor.name, floor.no));
        });
    });
};

const addOptionToSelect = (data, selectTag) => {
    data.forEach((d) => {
        selectTag.forEach((select) => {
            select.appendChild(new Option(d.name, d.id));
        });
    });
};

const initializeSelectTag = (data, selectTag) => {
    removeAllChildElements(selectTag);
    if(selectTag[0].id.indexOf('Floor') > -1) {
        addFloorOptionToSelect(data, selectTag);
    } else {
        addOptionToSelect(data, selectTag);
    }
};

const toggleCctvSectionByCategory = (categoryName, type) => {
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
};

const getTagNames = (type) => {
    const tagInput = document.querySelector(`#tag${type}`);
    if (!tagInput) return [];
    return tagInput.value
        .split(/[\n,]/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
};


const editPoi = async (id) => {
    try {
        // 필요한 데이터 가져오기
        const data = {
            poi: PoiManager.findAll(),
            building: BuildingManager.findAll(),
            poiCategory: PoiCategoryManager.findAll(),
            poiMiddleCategory: PoiMiddleCategoryManager.findAll()
        };

        // POI 데이터 찾기
        const modifyPoiData = data.poi.find(poi => poi.id === Number(id));
        if (!modifyPoiData) {
            console.error('POI를 찾을 수 없습니다:', id);
            return;
        }

        // 모달 요소 가져오기
        const modifyModal = document.querySelector('#poiModifyModal');
        if (!modifyModal) {
            console.error('POI 수정 모달을 찾을 수 없습니다');
            return;
        }

        // 모달 데이터 설정
        modifyModal.dataset.id = modifyPoiData.id;
        modifyModal.querySelector('#poiNameModify').value = modifyPoiData.name;
        modifyModal.querySelector('#poiCodeModify').value = modifyPoiData.code;

        // 건물 정보 설정
        const building = data.building.find(building => building.id === modifyPoiData.buildingId);
        if (building) {
            // 건물 select 옵션 채우기
            const buildingSelect = modifyModal.querySelector('#selectBuildingIdModify');
            if (buildingSelect.options.length <= 1) {
                data.building.forEach(b => buildingSelect.appendChild(new Option(b.name, b.id)));
            }
            buildingSelect.value = building.id;
            
            // 층수 정보 설정
            initializeSelectTag(building.floors, [modifyModal.querySelector('#selectFloorIdModify')]);
            
            if (modifyPoiData.floorNo) {
                modifyModal.querySelector('#selectFloorIdModify').value = 
                    building.floors.find(floor => floor.no === modifyPoiData.floorNo)?.no ?? '';
            } else {
                modifyModal.querySelector('#selectFloorIdModify').value = '';
            }
        }

        // 카테고리 정보 설정
        const categorySelect = modifyModal.querySelector('#selectPoiCategoryIdModify');
        if (categorySelect.options.length <= 1) {
            data.poiCategory.forEach(c => categorySelect.appendChild(new Option(c.name, c.id)));
        }
        categorySelect.value = modifyPoiData.property.poiCategoryId;
        
        const poiCategory = data.poiCategory.find(category => category.id === modifyPoiData.property.poiCategoryId);
        const filteredMiddleCategories = data.poiMiddleCategory.filter(middle => middle.poiCategory.id == modifyPoiData.property.poiCategoryId);
        
        // 중분류 select 옵션 채우기
        const middleSelect = modifyModal.querySelector('#selectPoiMiddleCategoryIdModify');
        removeAllChildElements([middleSelect]);
        filteredMiddleCategories.forEach(m => middleSelect.appendChild(new Option(m.name, m.id)));
        middleSelect.value = modifyPoiData.property.poiMiddleCategoryId;
        modifyModal.querySelector('#tagModify').value = modifyPoiData.tagNames || '';

        const form = document.querySelector('#poiModifyForm');
        form.dataset.id = modifyPoiData.id;

        // 조명 관련 설정
        const isLightCheck = modifyModal.querySelector('#isLightPoiModify');
        const lightGroup = modifyModal.querySelector('#lightGroupModify');
        
        if (modifyPoiData.property.isLight) {
            isLightCheck.checked = true;
            lightGroup.disabled = false;
            lightGroup.value = modifyPoiData.property.lightGroup || '';
        } else {
            isLightCheck.checked = false;
            lightGroup.disabled = true;
            lightGroup.value = '';
        }

        // 조명 체크박스 변경 이벤트 리스너 추가
        const lightChangeHandler = (e) => {
            lightGroup.disabled = !isLightCheck.checked;
        };
        isLightCheck.addEventListener('change', lightChangeHandler);

        // CCTV 관련 설정
        const cctvRows = form.querySelectorAll('.selectCctv');
        const cameraIpRow = modifyModal.querySelector('.cameraIp');
        
        if (poiCategory && poiCategory.name.toLowerCase() !== 'cctv') {
            // CCTV가 아닌 경우
            if (!cameraIpRow.classList.contains('hidden')) {
                cameraIpRow.classList.add('hidden');
            }

            cctvRows.forEach(row => {
                row.classList.remove('hidden');
                row.querySelectorAll('input, select, textarea').forEach(field => {
                    field.disabled = false;
                });
            });

            const cctvList = modifyPoiData.cctvList || [];
            const mainCctv = cctvList.find(c => c.isMain === "Y");
            modifyModal.querySelector("#mainCctvModify").value = mainCctv ? mainCctv.cctvName : "";

            const subCctvs = cctvList.filter(c => c.isMain !== "Y");
            const subCctvInputs = modifyModal.querySelectorAll('.sub-cctv');
            subCctvInputs.forEach((input, index) => {
                input.value = subCctvs[index] ? subCctvs[index].cctvName : "";
            });
        } else {
            // CCTV인 경우
            if (cameraIpRow.classList.contains('hidden')) {
                cameraIpRow.classList.remove('hidden');
            }
            cctvRows.forEach(row => {
                if (row !== cameraIpRow) {
                    row.classList.add('hidden');
                    row.querySelectorAll('input, select, textarea').forEach(field => {
                        field.disabled = true;
                        field.value = "";
                    });
                }
            });
            modifyModal.querySelector('#cameraIpModify').value = modifyPoiData.property.cameraIp || '';
        }

        // 카테고리 변경 이벤트 리스너 추가
        const poiCategorySelect = modifyModal.querySelector('#selectPoiCategoryIdModify');
        const categoryChangeHandler = (e) => {
            const selectedValue = poiCategorySelect.options[poiCategorySelect.selectedIndex].value;
            const selectedText = poiCategorySelect.options[poiCategorySelect.selectedIndex].text.trim().toLowerCase();
            if (!selectedValue) {
                return;
            }
            
            // 중분류 옵션 업데이트
            const middleSelect = modifyModal.querySelector('#selectPoiMiddleCategoryIdModify');
            removeAllChildElements([middleSelect]);
            const filteredMiddleCategories = data.poiMiddleCategory.filter(middle => middle.poiCategory.id == selectedValue);
            filteredMiddleCategories.forEach(m => middleSelect.appendChild(new Option(m.name, m.id)));
            
            toggleCctvSectionByCategory(selectedText, "Modify");
        };
        poiCategorySelect.addEventListener('change', categoryChangeHandler);

        // 모달이 닫힐 때 이벤트 리스너 정리
        modifyModal.addEventListener('hidden.bs.modal', () => {
            poiCategorySelect.removeEventListener('change', categoryChangeHandler);
        });

        // 수정 버튼 이벤트 리스너 추가
        const modifyButton = modifyModal.querySelector('#btnPoiModify');
        const modifyHandler = async (event) => {
            const form = document.getElementById('poiModifyForm');
            if (typeof validationForm === 'function' && !validationForm(form)) return;

            const params = {};
            params.buildingId = Number(document.querySelector('#selectBuildingIdModify').value);
            const floorValue = document.querySelector('#selectFloorIdModify').value;
            params.floorNo = floorValue ? Number(floorValue) : null;
            params.poiCategoryId = Number(document.querySelector('#selectPoiCategoryIdModify').value);
            params.poiMiddleCategoryId = Number(document.querySelector('#selectPoiMiddleCategoryIdModify').value);
            params.name = document.querySelector('#poiNameModify').value;
            params.code = document.querySelector('#poiCodeModify').value;
            params.isLight = document.querySelector('#isLightPoiModify').checked;
            params.lightGroup = document.querySelector('#lightGroupModify').value;
            params.tagNames = getTagNames('Modify');

            // CCTV 관련 처리
            const poiCategory = data.poiCategory.find(category => category.id === params.poiCategoryId);
            if (poiCategory && poiCategory.name.toLowerCase() === 'cctv') {
                params.cameraIp = document.querySelector('#cameraIpModify').value;
            } else {
                const cctvList = [];
                const mainCctv = document.querySelector('#mainCctvModify').value;
                if (mainCctv) {
                    cctvList.push({ cctvName: mainCctv, isMain: "Y" });
                }
                const subCctvs = document.querySelectorAll('.sub-cctv');
                subCctvs.forEach(input => {
                    if (input.value) {
                        cctvList.push({ cctvName: input.value, isMain: "N" });
                    }
                });
                params.cctvList = cctvList;
            }

            try {
                const id = Number(form.dataset.id);
                await api.put(`/poi/${id}`, params, {
                    headers: {
                        'Content-Type': 'application/json',
                        accept: 'application/json',
                    },
                });
                
                alertSwal('수정이 완료 되었습니다.').then(() => {
                    modal.hide();
                    // POI 목록 새로고침
                    getPoiRenderingAndList(true);
                });
            } catch (error) {
                console.error('POI 수정 중 오류 발생:', error);
                alertSwal('수정 중 오류가 발생했습니다.');
            }
        };
        
        modifyButton.addEventListener('click', modifyHandler);

        // 모달이 닫힐 때 이벤트 리스너 정리
        modifyModal.addEventListener('hidden.bs.modal', () => {
            poiCategorySelect.removeEventListener('change', categoryChangeHandler);
            modifyButton.removeEventListener('click', modifyHandler);
            isLightCheck.removeEventListener('change', lightChangeHandler);
            modifyModal.setAttribute('aria-hidden', 'true');
        });

        modifyModal.addEventListener('shown.bs.modal', () => {
            modifyModal.removeAttribute('aria-hidden');
        });

        // 모달 띄우기
        const modal = new bootstrap.Modal(modifyModal);
        modal.show();

    } catch (error) {
        console.error('POI 수정 모달 설정 중 오류 발생:', error);
    }
}

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