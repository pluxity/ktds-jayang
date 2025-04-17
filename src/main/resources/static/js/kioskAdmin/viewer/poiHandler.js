const registerBtn = document.querySelector('#poiRegisterBtn');
const radioButtons = document.querySelectorAll('input[name="type"]');
const registerStoreForm = document.getElementById('registerStoreForm');
const registerKioskForm = document.getElementById('registerKioskForm');
const poiRegisterModal = new bootstrap.Modal(document.getElementById('poiRegisterModal'));
const poiModifyModal = document.querySelector('#poiModifyModal');
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

    try {
        if (type === 'store') {
            // 상가 POI 등록
            let logoFileInfoId = null;
            let banners = [];
            const formData = new FormData();
            // 1. 로고 파일 업로드
            const logoFile = document.getElementById('registerLogoFile').files[0];
            if (logoFile) {
                formData.append('logo', logoFile);
            }
            let storeData = {};

            // 2. 배너 파일들 업로드
            const bannerRows = document.querySelectorAll('#registerBannerTbody tr');

            for (let i = 0; i < bannerRows.length; i++) {
                const row = bannerRows[i];
                const bannerFile = row.querySelector('.banner-file').files[0];

                if (bannerFile) {
                    formData.append('bannerFiles', bannerFile);

                    const startDate = row.querySelector('.start-date').value;
                    const endDate = row.querySelector('.end-date').value;
                    const isPermanent = row.querySelector('.banner-checkbox')?.checked ?? false;
                    const priority = Number(row.querySelector('input[name="priority"]').value);

                    banners.push({
                        priority: priority,
                        startDate: startDate ? startDate : null,
                        endDate: endDate ? endDate : null,
                        isPermanent: isPermanent
                    });
                }
            }
            // 3. 상가 POI 엔티티 저장
            storeData = {
                isKiosk: false,
                name: document.getElementById('registerStoreName').value,
                category: document.getElementById('registerBusiness').value,
                buildingId: Number(buildingId),
                floorId: Number(document.getElementById('registerStoreFloor').value),
                phoneNumber: document.getElementById('registerPhone').value,
                banners: banners
            };
            formData.append("store", new Blob([JSON.stringify(storeData)], { type: "application/json" }));

            await api.post('/kiosk/store', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
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

document.querySelector('#btnPoiModify').addEventListener("click", function (event) {
    event.preventDefault();
    const type = document.querySelector('input[name="type"]:checked').value;
    const buildingId = document.getElementById("buildingId").value;
    const formId = document.getElementById("poiModifyForm").dataset.id;
    if (type === 'store') {
        const formData = new FormData();
        let banners = [];

        const logoFile = document.getElementById("modifyLogoFile").files[0];
        if (logoFile) {
            formData.append("logo", logoFile);
        } else {
            const logoId = document.getElementById("modifyLogoFile").dataset.fileId;
            if (logoId) {
                formData.append("logoId", logoId);
            }
        }

        // 여기서부터가..
        const bannerRows = document.querySelectorAll("#modifyBannerTbody tr");
        for (let i = 0; i < bannerRows.length; i++) {
            const row = bannerRows[i];
            const bannerFileInput = row.querySelector(".banner-file");
            const bannerFile = bannerFileInput.files[0];
            const bannerId = bannerFileInput.dataset.bannerId;  // 기존 배너 id
            const priority = Number(row.querySelector('input[name="priority"]').value);
            const startDate = row.querySelector(".start-date").value;
            const endDate = row.querySelector(".end-date").value;
            const isPermanent = row.querySelector(".banner-checkbox").checked;

            if (bannerFile) {
                let banner = {
                    priority: priority,
                    startDate: startDate || null,
                    endDate: endDate || null,
                    isPermanent: isPermanent
                };
                if (bannerId) {
                    banner.id = Number(bannerId);
                }
                formData.append("bannerFiles", bannerFile);
                banners.push(banner);
            } else {
                if (bannerId) {
                    banners.push({
                        id: Number(bannerId),
                        delete: true
                    });
                }
            }
        }

        const storeData = {
            name: document.getElementById("modifyStoreName").value,
            category: document.getElementById("modifyBusiness").value,
            buildingId: Number(buildingId),
            floorId: Number(document.getElementById("modifyStoreFloor").value),
            phoneNumber: document.getElementById("modifyPhone").value,
            banners: banners
        };

        formData.append("store", new Blob([JSON.stringify(storeData)], { type: "application/json" }));

        api.put(`/kiosk/store/${formId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

    } else {
        const kioskData = {
            name: document.getElementById("modifyKioskName").value,
            kioskCode: document.getElementById("modifyEquipmentCode").value,
            buildingId: Number(buildingId),
            floorId: Number(document.getElementById("modifyKioskFloor").value),
            description: document.getElementById("modifyRemarks").value
        };

        api.put(`/kiosk/kiosk/${formId}`, kioskData);
    }

    alertSwal("수정되었습니다.");
    const modal = bootstrap.Modal.getInstance(poiModifyModal);
    modal.hide();

    KioskPoiManager.getKioskPoiList().then(() => {
        getKioskPoiListRendering();
    });
})

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

function handlePoiModifyBtnClick(kioskPoi) {
    const buildingId = document.getElementById("buildingId").value;

    const floors = BuildingManager.findById(buildingId).floors;
    const modifyStoreFloorSelect = document.getElementById('modifyStoreFloor');
    const modifyKioskFloorSelect = document.getElementById('modifyKioskFloor');

    appendFloorOptionsToSelect(floors, modifyStoreFloorSelect);
    appendFloorOptionsToSelect(floors, modifyKioskFloorSelect);
    const detail = KioskPoiManager.findPoiDetailById(kioskPoi.id)

    document.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.disabled = true;
    });
    document.getElementById('poiModifyForm').dataset.id = kioskPoi.id;
    if (kioskPoi.isKiosk) {
        document.querySelector('input[name="type"][value="kiosk"]').checked = true;
        document.getElementById('modifyKioskForm').style.display = 'block';
        document.getElementById('modifyStoreForm').style.display = 'none';

        document.getElementById("modifyKioskName").value = detail.detail.name || '';
        document.getElementById("modifyEquipmentCode").value = detail.detail.equipmentCode || '';
        document.getElementById("modifyKioskFloor").value = detail.detail.floorId || '';
        document.getElementById("modifyRemarks").value = detail.detail.remarks || '';
    } else {
        document.querySelector('input[name="type"][value="store"]').checked = true;
        document.getElementById('modifyStoreForm').style.display = 'block';
        document.getElementById('modifyKioskForm').style.display = 'none';

        document.getElementById("modifyStoreName").value = detail.detail.name || '';
        document.getElementById("modifyBusiness").value = detail.detail.category || '';
        document.getElementById("modifyStoreFloor").value = detail.detail.floorId || '';
        document.getElementById("modifyPhone").value = detail.detail.phoneNumber || '';

        // 로고 표시
        const logoId = detail.detail.logo;

        if (logoId) {
            document.getElementById("modifyLogoFile").setAttribute("data-file-id", logoId);
            const logoNameLink = document.querySelector("#modifyStoreForm .file-name")
            logoNameLink.innerHTML = `
            <a href="/Logo/${detail.detail?.logoFile.directory}/${detail.detail?.logoFile.storedName}.${detail.detail?.logoFile.extension}" download>
                ${detail.detail?.logoFile.originName}
            </a>`;

            document.querySelector("#modifyStoreForm .file-remove").style.display = "inline";
        }

        // 배너 표시
        detail.detail.banners?.forEach((banner, i) => {
            const row = document.querySelectorAll("#modifyBannerTbody tr")[i];
            if (!row) return;
            row.dataset.bannerId = banner.id;
            row.querySelector("input[name='startDate']").value = banner.startDate ?? '';
            row.querySelector("input[name='endDate']").value = banner.endDate ?? '';
            row.querySelector("input[name='priority']").value = banner.priority ?? '';

            // row.querySelector(".selected-file").textContent = `배너 파일 ID: ${banner.image}`;
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

        const modalInstance = bootstrap.Modal.getOrCreateInstance(poiModifyModal);
        modalInstance.show();
    }
}