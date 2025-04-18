const registerBtn = document.querySelector('#poiRegisterBtn');
const radioButtons = document.querySelectorAll('input[name="type"]');
const registerStoreForm = document.getElementById('registerStoreForm');
const registerKioskForm = document.getElementById('registerKioskForm');
const poiRegisterModal = new bootstrap.Modal(document.getElementById('poiRegisterModal'));
const poiModifyModal = new bootstrap.Modal(document.getElementById('poiModifyModal'));
const poiRegisterForm = document.getElementById("poiRegisterForm");
const modalEl = document.getElementById('poiRegisterModal');
const popup = document.getElementById('poiRegisterPopup');
const closeBtn = modalEl.querySelector('.btn-close');
const cancelBtn = modalEl.querySelector('.btn-cancel');
registerBtn.addEventListener('click', () => {
    handlePoiRegisterBtnClick();
});

function handlePoiRegisterBtnClick() {
    const buildingId = document.getElementById("buildingId").value;
    poiRegisterForm.reset();

    const floors = BuildingManager.findById(buildingId).floors;
    const registerStoreFloorSelect = document.getElementById('registerStoreFloor');
    const registerKioskFloorSelect = document.getElementById('registerKioskFloor');

    appendFloorOptionsToSelect(floors, registerStoreFloorSelect);
    appendFloorOptionsToSelect(floors, registerKioskFloorSelect);
    registerStoreForm.style.display = 'block';
    registerKioskForm.style.display = 'none';
    poiRegisterModal.show();
}

function appendFloorOptionsToSelect(floors, selectElement) {
    floors.forEach((floor) => {
        const option = document.createElement('option');
        option.value = floor.id;
        option.textContent = floor.name;
        selectElement.appendChild(option);
    });
}

// 팝업 닫기 및 폼 초기화 함수
function resetAndClosePopup() {
    const form = document.getElementById('poiRegisterForm');
    if (form) {
        form.reset();
    }
    poiRegisterForm.querySelector(".file-name").textContent = "";
    poiRegisterForm.querySelector(".file-remove").textContent = "";

    const bannerRows = poiRegisterForm.querySelectorAll("#register-banner-tbody tr");
    bannerRows.forEach(row => {
        const fileName = row.querySelector(".selected-file");
        const removeBtn = row.querySelector(".file-remove");
        const fileInput = row.querySelector(".banner-file");
        const startDate = row.querySelector(".start-date");
        const endDate = row.querySelector(".end-date");

        fileName && (fileName.textContent = "");
        removeBtn && (removeBtn.style.display = "none");
        fileInput && (fileInput.value = "");
        startDate && (startDate.disabled = false);
        endDate && (endDate.disabled = false);
    });
    registerStoreForm.style.display = 'block';
    registerKioskForm.style.display = 'none';
    document.getElementById('poiRegisterPopup').style.display = 'none';
}

// 팝업 닫기
if (closeBtn && popup) {
    closeBtn.addEventListener('click', resetAndClosePopup);
    cancelBtn.addEventListener('click', resetAndClosePopup);
}

// 팝업 변경
radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'store') {
            registerStoreForm.style.display = 'block';
            registerKioskForm.style.display = 'none';
        } else {
            registerStoreForm.style.display = 'none';
            registerKioskForm.style.display = 'block';
        }
    });
});

// 로고 파일 선택 시 파일명 표시
document.getElementById('registerLogoFile').addEventListener('change', function() {
    const fileName = this.files[0] ? this.files[0].name : '';
    const fileNameElement = this.closest('.file-upload').querySelector('.file-name');
    const removeButton = this.closest('.file-upload').querySelector('.file-remove');

    fileNameElement.textContent = fileName;

    if (this.files[0]) {
        removeButton.style.display = 'inline';
    } else {
        removeButton.style.display = 'none';
    }
});

// 배너 파일들 선택 시 파일명 표시
document.querySelectorAll('.banner-file').forEach(input => {
    input.addEventListener('change', function() {
        const fileName = this.files[0] ? this.files[0].name : '';
        const fileNameElement = this.closest('td').querySelector('.selected-file');
        const removeButton = this.closest('td').querySelector('.file-remove');

        fileNameElement.textContent = fileName;
        if (this.files[0]) {
            removeButton.style.display = 'inline';
        } else {
            removeButton.style.display = 'none';
        }
    });
});

// 파일 제거 버튼 클릭 이벤트
document.querySelectorAll('.file-remove').forEach(button => {
    button.addEventListener('click', function() {
        const container = this.closest('.file-upload, td');
        const fileInput = container.querySelector('input[type="file"]');
        const fileNameElement = container.querySelector('.file-name, .selected-file');

        fileInput.value = '';
        fileInput.removeAttribute("data-file-id");
        fileNameElement.textContent = '';
        this.style.display = 'none';
    });
});

// 배너 순서 변경 기능
document.querySelectorAll('.order-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const row = this.closest('tr');
        const tbody = document.getElementById('registerBannerTbody');

        if (this.classList.contains('up-btn') && row.previousElementSibling) {
            // 위로 이동
            tbody.insertBefore(row, row.previousElementSibling);
        } else if (this.classList.contains('down-btn') && row.nextElementSibling) {
            // 아래로 이동
            tbody.insertBefore(row.nextElementSibling, row);
        }

        // priority 값 업데이트
        updateBannerPriorities();
    });
});

// 배너 priority 값 업데이트 함수
function updateBannerPriorities() {
    const rows = document.querySelectorAll('#registerBannerTbody tr');
    rows.forEach((row, index) => {
        const priorityInput = row.querySelector('input[name="priority"]');
        if (priorityInput) {
            priorityInput.value = index + 1;
        }
    });
}

// 초기 priority 값 설정
updateBannerPriorities();

// 상시 체크박스 이벤트 처리
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const dateInputs = this.closest('td').querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            input.disabled = this.checked;
            if (this.checked) {
                input.value = '';
            }
        });
    });
});

// 파일 선택 버튼 클릭 이벤트
document.querySelectorAll('.file-select-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault(); // form submit 방지
        this.previousElementSibling.click();
    });
});

document.querySelector('#btnPoiRegister').addEventListener('click', async function(e) {
    e.preventDefault();

    const type = document.querySelector('input[name="type"]:checked').value;
    const buildingId = document.getElementById('buildingId').value;
    let logoFileId = null; // 로고 파일 ID 추적
    const bannerFileIds = []; // 배너 파일 ID들 추적

    try {
        if (type === 'store') {
            const buildingId = document.getElementById('buildingId').value;

            try{
                // 로고 업로드
                const logoInput = document.getElementById('registerLogoFile');
                const logoFile = logoInput.files[0];
                const hasFileId = logoInput.hasAttribute('data-file-id');

                let logoFileId = null;

                if (logoFile) {
                    const formData = new FormData();
                    formData.append("file", logoFile);
                    formData.append("type", "logo");

                    const res = await api.post("/kiosk/upload/file", formData);
                    logoFileId = res.data.result.id;
                    logoInput.setAttribute("data-file-id", logoFileId);
                } else if (hasFileId) {
                    logoFileId = Number(logoInput.getAttribute("data-file-id"));
                } else {
                    logoFileId = null;
                }

                // 배너들 파일 업로드 후 bannerDTO 생성
                const bannerRows = document.querySelectorAll('#registerBannerTbody tr');
                const banners = [];

                for (let row of bannerRows) {
                    const bannerFile = row.querySelector('.banner-file').files[0];

                    if(bannerFile) {
                        const bannerFormData = new FormData();
                        bannerFormData.set('file', bannerFile);
                        bannerFormData.set('type', 'banner');

                        const bannerUploadRes = await api.post('/kiosk/upload/file', bannerFormData);
                        const bannerFileId = bannerUploadRes.data.result.id;
                        bannerFileIds.push(bannerFileId); // 업로드된 배너 파일 ID 저장

                        banners.push({
                            fileId: bannerFileId,
                            isPermanent: row.querySelector('.banner-checkbox')?.checked ?? false,
                            startDate: row.querySelector('.start-date').value,
                            endDate: row.querySelector('.end-date').value,
                            priority: Number(row.querySelector('input[name="priority"]').value),
                        });
                    }
                }

                const poiDto = {
                    isKiosk: false,
                    name: document.getElementById('registerStoreName').value,
                    category: document.getElementById('registerBusiness').value,
                    buildingId: buildingId,
                    floorId: Number(document.getElementById('registerStoreFloor').value),
                    phoneNumber: document.getElementById('registerPhone').value,
                    fileInfoId: logoFileId,
                    banners: banners
                };

                await api.post('/kiosk/store', poiDto);

            } catch (error) {
                console.error('등록 중 오류 발생:', error);
                try{
                    if(logoFileId){
                        await api.delete(`/kiosk/file/${logoFileId}`);
                    }
                    for(const bannerFileId of bannerFileIds){
                        await api.delete(`/kiosk/file/${bannerFileId}`);
                    }
                } catch (error) {
                    console.error('파일 삭제 중 오류 발생:', error);
                }
                alertSwal('등록에 실패했습니다.');
            }

        } else {
            // 키오스크 POI 등록
            const kioskData = {
                isKiosk: true,
                name: document.getElementById('registerKioskName').value,
                kioskCode: document.getElementById('registerEquipmentCode').value,
                buildingId: Number(buildingId),
                floorId: Number(document.getElementById('registerKioskFloor').value),
                description: document.getElementById('registerRemarks').value
            };

            await api.post('/kiosk/kiosk', kioskData);
        }

        await alertSwal('등록되었습니다.');
        poiRegisterModal.hide();

        KioskPoiManager.getKioskPoiList().then(() => {
            getKioskPoiListRendering();
        });

    } catch (error) {
        console.error('Error:', error);
    }
});

const uploadFileAndSetId = async (inputElement, dataAttr, type) => {
    const file = inputElement.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
        const response = await api.post("/kiosk/upload/file", formData);
        const fileInfo = response.data.result;
        inputElement.setAttribute(dataAttr, fileInfo.id);
        return fileInfo.id;
    } catch (err) {
        alertSwal(err.message);
        throw new Error(err.message)
    }
};

const updateKioskPoi = async () => {

    const formId = document.getElementById("poiModifyForm").dataset.id;
    const kioskData = {
        name: document.getElementById("modifyKioskName").value,
        kioskCode: document.getElementById("modifyEquipmentCode").value,
        buildingId: Number(buildingId),
        floorId: Number(document.getElementById("modifyKioskFloor").value),
        description: document.getElementById("modifyRemarks").value
    }

    api.put(`/kiosk/kiosk/${formId}`, kioskData).then(() => {
        alertSwal("수정이 완료되었습니다.");
        poiModifyModal.hide();

        KioskPoiManager.getKioskPoiList().then(() => {
            getKioskPoiListRendering();
        });
    })
}

const updateStorePoi = async () => {
    try {
        const logoInput = document.getElementById("modifyLogoFile");
        if (logoInput.files[0]) {
            const logoFileId = await uploadFileAndSetId(logoInput, "data-file-id", "logo");
            logoInput.setAttribute("data-file-id", logoFileId);
        }

        const bannerRows = document.querySelectorAll("#modifyBannerTbody tr");
        for (const row of bannerRows) {
            const bannerInput = row.querySelector(".banner-file");
            if (bannerInput.files[0]) {
                const newFileId = await uploadFileAndSetId(bannerInput, "data-file-id", "banner");
                bannerInput.setAttribute("data-file-id", newFileId);
            }
        }

        const dto = {
            id: Number(document.getElementById("poiModifyForm").dataset.id),
            name: document.getElementById("modifyStoreName").value,
            category: document.getElementById("modifyBusiness").value,
            buildingId: Number(document.getElementById("buildingId").value),
            floorId: Number(document.getElementById("modifyStoreFloor").value),
            phoneNumber: document.getElementById("modifyPhone").value,
            fileInfoId: Number(logoInput.getAttribute("data-file-id")) || null,
            banners: Array.from(bannerRows).map(row => {
                const fileId = row.querySelector(".banner-file").getAttribute("data-file-id");
                const bannerId = row.dataset.bannerId || null;
                const isPermanent = row.querySelector("input[name='always']").checked;

                return {
                    id: bannerId ? Number(bannerId) : null,
                    fileId: fileId ? Number(fileId) : null,
                    priority: parseInt(row.querySelector("input[name='priority']").value, 10) || 0,
                    startDate: isPermanent ? null : row.querySelector("input[name='startDate']").value || null,
                    endDate: isPermanent ? null : row.querySelector("input[name='endDate']").value || null,
                    isPermanent
                };
            })
        };

        api.put(`/kiosk/store/${dto.id}`, dto).then(res => {
            alertSwal("수정이 완료되었습니다.");
            poiModifyModal.hide();

            KioskPoiManager.getKioskPoiList().then(() => {
                getKioskPoiListRendering();
            });
        })
    } catch(err) {
        alertSwal(err.message);
        throw err.message;
    }
};

document.getElementById("btnPoiModify").addEventListener("click", async () =>{

    const isKiosk = document.querySelector('input[name="type"]:checked').value === "kiosk";
    if (isKiosk) {
        await updateKioskPoi();
    } else {
        await updateStorePoi();
    }
});

const allocatePoi = (id) => {
    if (document.querySelector('#floorNo').value === '') {
        alertSwal('전체 층일경우 POI 수정이 불가능 합니다.');
        return;
    }

    const selectedFloorNo = document.querySelector('#floorNo').value;
    const poi = KioskPoiManager.findById(id);
    if (poi.floorId !== Number(selectedFloorNo)) {
        alertSwal('POI의 층과 선택한 층이 다릅니다.');
        return;
    }

    KioskPoiManager.renderKioskPoiByIdAddByMouse(id);

};

const deletePoi = (id) => {
    confirmSwal('POI를 삭제하시겠습니까?').then(() =>{
        const poi = KioskPoiManager.findById(id);
        KioskPoiManager.deleteKioskPoi(id).then(() => {
            poi.removeOn3D();
            KioskPoiManager.getKioskPoiList().then(() => {
                getKioskPoiListRendering();
            });

        });
    });
};

const unAllocatePoi = (id) => {
    confirmSwal('POI를 미배치로 변경하시겠습니까?').then(() => {
        return api.patch(`/kiosk/un-allocation/${id}`)
            .then(async () => {
                KioskPoiManager.findById(id).removeOn3D();
                await KioskPoiManager.getKioskPoiList().then(() => {
                    getKioskPoiListRendering();
                });
            });
    });
};

// POI 리스트 렌더링
const getKioskPoiListRendering = async () => {

        let filteredList = KioskPoiManager.findAll();

        const selectedFloorId = Number(document.querySelector('#leftFloorSelect').value);
        if (selectedFloorId) {
            filteredList = filteredList.filter(
                (poi) => poi.floorId === selectedFloorId);
        }

        const selectedPoiType = document.querySelector('#leftPoiCategorySelect').value;
        if (selectedPoiType === 'store') {
            filteredList = filteredList.filter((poi) => poi.isKiosk === false);
        } else if (selectedPoiType === 'kiosk') {
            filteredList = filteredList.filter((poi) => poi.isKiosk === true);
        }

        const searchKeyword = document.querySelector('#searchKeyword');
        if (searchKeyword.value) {
            filteredList = filteredList.filter((poi) =>
                poi.name.toLowerCase().includes(searchKeyword.value.toLowerCase()),
            );
        }

        if (document.querySelector('#poiAllocate').classList.contains('active')) { //배치
            filteredList = filteredList.filter((poi) => poi.position !== null);
        } else if (document.querySelector('#poiUnAllocate').classList.contains('active')) { // 미배치(전체)
            filteredList = filteredList.filter((poi) => poi.position === null);
        } else if (document.querySelector('#poiUnAllocateByFloor').classList.contains('active')) { // 미배치(층별)
            filteredList = filteredList.filter((poi) => {
                    if(selectedFloorId){
                        return poi.position === null && poi.floorId === selectedFloorId
                    }else{
                        return poi.position === null;
                    }
            });
        }

        poiPaging(filteredList);
}

// poi viewer 렌더링
const getKioskPoiDisplayRendering = async () => {
    let displayList = KioskPoiManager.findAll();
    let filteredList = displayList;

    const selectedFloorNo = document.querySelector('#floorNo').value;
    const selectedType = document.querySelector('#poiSelect').value;
    const leftFloorSelect = document.querySelector('#leftFloorSelect');
    const leftPoiCategorySelect = document.querySelector('#leftPoiCategorySelect')

    if(selectedFloorNo) {
        leftFloorSelect.value = selectedFloorNo;
        displayList = displayList.filter(
            (poi) => poi.floorId === Number(selectedFloorNo));
    }else{
        leftFloorSelect.selectedIndex = 0;
    }

    if(selectedType.includes('store') && selectedType.includes('kiosk')) {
        leftPoiCategorySelect.selectedIndex = 0;
    } else {
        displayList = displayList.filter((poi) => {
            if (selectedType.includes('store')) {
                leftPoiCategorySelect.selectedIndex = 1;
                return poi.isKiosk === false;
            }
            if (selectedType.includes('kiosk')) {
                leftPoiCategorySelect.selectedIndex = 2;
                return poi.isKiosk === true;
            }
            return false;
        });
    }

    filteredList = displayList;

    if (document.querySelector('#poiAllocate').classList.contains('active')) { //배치
        filteredList = filteredList.filter((poi) => poi.position !== null);
    } else if (document.querySelector('#poiUnAllocate').classList.contains('active')) { // 미배치(전체)
        filteredList = filteredList.filter((poi) => poi.position === null);
    } else if (document.querySelector('#poiUnAllocateByFloor').classList.contains('active')) { // 미배치(층별)
        filteredList = filteredList.filter((poi) => {
            if(selectedFloorNo){
                return poi.position === null && poi.floorId === Number(selectedFloorNo)
            }else{
                return poi.position === null;
            }
        });
    }

    renderingPoiList(displayList);
    poiPaging(filteredList);
}

// side 층 선택 시 POI 리스트 렌더링
document.querySelector('#leftFloorSelect').addEventListener('change', () => {
    getKioskPoiListRendering();
});

// POI 카테고리 선택 시 POI 리스트 렌더링
document.querySelector('#leftPoiCategorySelect').addEventListener('change', () => {
    getKioskPoiListRendering();
});

// POI 배치 선택 시 POI 리스트 렌더링
document.querySelector('#poiAllocate').addEventListener('pointerup', (event) => {
    const {currentTarget} = event;
    currentTarget.classList.add('active');
    document.querySelector('#poiUnAllocate').classList.remove('active');
    document.querySelector('#poiUnAllocateByFloor').classList.remove('active');
    document.querySelector('#leftFloorSelect').selectedIndex = 0;
    getKioskPoiListRendering();
});

// POI 미배치(전체) 선택 시 POI 리스트 렌더링
document.querySelector('#poiUnAllocate').addEventListener('pointerup', (event) => {
    const {currentTarget} = event;
    currentTarget.classList.add('active');
    document.querySelector('#poiAllocate').classList.remove('active');
    document.querySelector('#poiUnAllocateByFloor').classList.remove('active');
    document.querySelector('#leftFloorSelect').selectedIndex = 0;
    getKioskPoiListRendering();
});

// POI 미배치(층별) 선택 시 POI 리스트 렌더링
document.querySelector('#poiUnAllocateByFloor').addEventListener('pointerup', (event) => {
    const {currentTarget} = event;
    currentTarget.classList.add('active');
    document.querySelector('#poiAllocate').classList.remove('active');
    document.querySelector('#poiUnAllocate').classList.remove('active');
    document.querySelector('#leftFloorSelect').selectedIndex = 0;
    getKioskPoiListRendering();
});

// 검색어 입력 시 POI 리스트 렌더링
document.querySelector('#searchKeyword').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        getKioskPoiListRendering();
    }
});

// 검색 버튼 클릭 시 POI 리스트 렌더링
document.querySelector('#searchBtn').addEventListener('click', () => {
    getKioskPoiListRendering();
});


// 층 선택 시 POI 리스트 렌더링
document.querySelector('#floorNo').addEventListener('change', () => {
    getKioskPoiDisplayRendering();
});

document.querySelector('#poiSelect').addEventListener('change', () => {
    getKioskPoiDisplayRendering();
});



const renderingPoiList = (filteredList) => {
    Px.Poi.HideAll();
    filteredList.forEach((poiInfo) => {
        Px.Poi.Show(poiInfo.id);
    });
};

const initPoi = async () => {
    KioskPoiManager.getKioskPoiList().then(() => {
        getKioskPoiListRendering();
        KioskPoiManager.renderAllPoiToEngine();
    });
}

const handlePoiModifyBtnClick = async (kioskPoi) => {
    const buildingId = document.getElementById("buildingId").value;

    const floors = BuildingManager.findById(buildingId).floors;
    const modifyStoreFloorSelect = document.getElementById('modifyStoreFloor');
    const modifyKioskFloorSelect = document.getElementById('modifyKioskFloor');

    appendFloorOptionsToSelect(floors, modifyStoreFloorSelect);
    appendFloorOptionsToSelect(floors, modifyKioskFloorSelect);
    const poiDetail = await KioskPoiManager.getKioskPoi(kioskPoi.id);

    const poiModifyForm = document.getElementById("poiModifyForm");
    poiModifyForm.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.disabled = true;
        radio.checked = radio.value === (kioskPoi.isKiosk ? "kiosk" : "store");
    });
    document.getElementById('poiModifyForm').dataset.id = kioskPoi.id;
    if (kioskPoi.isKiosk) {
        document.getElementById('modifyKioskForm').style.display = 'block';
        document.getElementById('modifyStoreForm').style.display = 'none';

        document.getElementById("modifyKioskName").value = poiDetail.name || '';
        document.getElementById("modifyEquipmentCode").value = poiDetail.kiosk.kioskCode || '';
        document.getElementById("modifyKioskFloor").value = poiDetail.kiosk.floorId || '';
        document.getElementById("modifyRemarks").value = poiDetail.kiosk.description || '';
        poiModifyModal.show();
    } else {
        document.getElementById('modifyStoreForm').style.display = 'block';
        document.getElementById('modifyKioskForm').style.display = 'none';

        document.getElementById("modifyStoreName").value = poiDetail.name || '';
        document.getElementById("modifyBusiness").value = poiDetail.store.category || '';
        document.getElementById("modifyStoreFloor").value = poiDetail.store.floorId || '';
        document.getElementById("modifyPhone").value = poiDetail.store.phoneNumber || '';

        // 로고 표시
        const logoId = poiDetail.store.logo;

        if (logoId) {
            document.getElementById("modifyLogoFile").setAttribute("data-file-id", logoId);
            const logoNameLink = document.querySelector("#modifyStoreForm .file-name")
            logoNameLink.innerHTML = `
            <a href="/Logo/${poiDetail?.store.logoFile.directory}/${poiDetail?.store.logoFile.storedName}.${poiDetail?.store.logoFile.extension}" download>
                ${poiDetail?.store.logoFile.originName}
            </a>`;

            document.querySelector("#modifyStoreForm .file-remove").style.display = "inline";
        }

        // 배너 표시
        poiDetail.store.banners?.forEach((banner, i) => {
            const row = document.querySelectorAll("#modifyBannerTbody tr")[i];
            if (!row) return;
            row.dataset.bannerId = banner.id;
            row.querySelector("input[name='startDate']").value = banner.startDate ?? '';
            row.querySelector("input[name='endDate']").value = banner.endDate ?? '';
            row.querySelector("input[name='priority']").value = banner.priority ?? '';

            row.querySelector(".file-remove").style.display = "inline";
            row.querySelector(".banner-file").setAttribute("data-file-id", banner.image);

            const bannerFileLink = row.querySelector(".selected-file");
            bannerFileLink.innerHTML = `
            <a href="/Banner/${banner?.bannerFile.directory}/${banner?.bannerFile.storedName}.${banner?.bannerFile.extension}" download>
                ${banner.bannerFile.originName}
            </a>`;
            const checkbox = row.querySelector("input[name='always']");
            const startDateInput = row.querySelector("input[name='startDate']");
            const endDateInput = row.querySelector("input[name='endDate']");
            if (banner.isPermanent == true) {
                checkbox.checked = true;
                startDateInput.disabled = true;
                endDateInput.disabled = true;
            } else {
                checkbox.checked = false;
                startDateInput.disabled = false;
                endDateInput.disabled = false;
            }
        });

        poiModifyModal.show();
    }
}