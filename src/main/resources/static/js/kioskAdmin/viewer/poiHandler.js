const registerBtn = document.querySelector('#poiRegisterBtn');
const batchRegisterBtn = document.querySelector("#poiBatchRegisterBtn")
const radioButtons = document.querySelectorAll('input[name="type"]');
const registerStoreForm = document.getElementById('registerStoreForm');
const registerKioskForm = document.getElementById('registerKioskForm');
const poiRegisterModal = new bootstrap.Modal(document.getElementById('poiRegisterModal'));
const poiBatchRegisterModal = new bootstrap.Modal(document.getElementById('poiBatchRegisterModal'));
const poiModifyModal = new bootstrap.Modal(document.getElementById('poiModifyModal'));
const poiRegisterForm = document.getElementById("poiRegisterForm");
const poiBatchRegisterForm = document.getElementById("poiBatchRegisterForm");
const modalEl = document.getElementById('poiRegisterModal');
const popup = document.getElementById('poiRegisterPopup');
registerBtn.addEventListener('click', () => {
    handlePoiRegisterBtnClick();
});

batchRegisterBtn.addEventListener('click', () => {
    handlePoiBatchRegisterBtnClick();
})

function handlePoiRegisterBtnClick() {
    poiRegisterForm.reset();

    const floors = BuildingManager.findStore().floors;
    const registerStoreFloorSelect = document.getElementById('registerStoreFloor');
    const registerKioskFloorSelect = document.getElementById('registerKioskFloor');

    poiRegisterForm.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.checked = radio.value === ("store");
    });

    appendFloorOptionsToSelect(floors, registerStoreFloorSelect);
    appendFloorOptionsToSelect(floors, registerKioskFloorSelect);
    registerStoreForm.style.display = 'block';
    registerKioskForm.style.display = 'none';
    poiRegisterModal.show();
}

function handlePoiBatchRegisterBtnClick() {
    poiBatchRegisterForm.reset();

    const floors = BuildingManager.findStore().floors;
    const batchRegisterFloorSelect = document.getElementById('registerBatchFloor');

    poiBatchRegisterForm.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.checked = radio.value === ("store");
    });

    appendFloorOptionsToSelect(floors, batchRegisterFloorSelect);
    poiBatchRegisterModal.show();
}

// 일괄 등록 버튼
document.getElementById('kioskPoiBatchRegisterBtn')
    .addEventListener('pointerup', () => {

        if(!validationForm(poiBatchRegisterForm)) return;
        const formData = new FormData();
        formData.set('floorNo', document.getElementById('registerBatchFloor').value);
        formData.set('file', document.querySelector('#kioskBatchRegisterFile').files[0]);

        api.post('/kiosk/batch-register', formData).then((res) => {
            alertSwal('일괄등록이 완료 되었습니다.').then(() => {
                document
                    .querySelector(
                        '#poiBatchRegisterModal > div > div > div.modal-header > button',
                    ).click();
                KioskPoiManager.getKioskPoiList().then(() => {
                    getKioskPoiListRendering();
                });
            });
        }).catch(() => {
            document.querySelector('#batchRegisterFile').value = ''
        })
    })

document.getElementById('kioskSampleFileBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = '/static/sample/kiosk_batchRegister_sample.xlsx';
    link.download = 'kiosk_batchRegister_sample.xlsx';
    link.click();
});

function appendFloorOptionsToSelect(floors, selectElement) {
    if (selectElement.id.startsWith("register")) {
        selectElement.innerHTML = "<option>층 선택</option>";
    } else {
        selectElement.innerHTML = "";
    }

    const kioskSet = new Set(['B2', 'B1', '1F', '2F']);
    const nameMap = {
        B2: 'B1F',
        B1: 'GF'
    };
    floors
        .filter(floor => kioskSet.has(floor.name))
        .forEach((floor) => {
        const option = document.createElement('option');
        option.value = floor.no;
        option.textContent = nameMap[floor.name] || floor.name;
        selectElement.appendChild(option);
    });
}

// 모달 닫힐때 초기화
document.querySelector('#poiRegisterModal').addEventListener('hide.bs.modal', function () {
    resetAndClosePopup();
});


// 팝업 닫기 및 폼 초기화 함수
function resetAndClosePopup() {
    const form = document.getElementById('poiRegisterForm');
    if (form) {
        form.reset();
    }
    poiRegisterForm.querySelector(".file-name").textContent = "";
    poiRegisterForm.querySelector(".file-remove").textContent = "";

    const bannerRows = poiRegisterForm.querySelectorAll("#registerBannerTbody tr");
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

// 등록폼 로고 파일 선택
document.getElementById('registerLogoFile').addEventListener('change', function() {
    const file = this.files[0];
    const fileNameElement = this.closest('.file-upload').querySelector('.file-name');
    const removeButton = this.closest('.file-upload').querySelector('.file-remove');

    validateFileSize(file, this, fileNameElement, removeButton);
});

// 등록폼 배너 파일들 선택
document.querySelectorAll('.banner-file').forEach(input => {
    input.addEventListener('change', function() {
        const file = this.files[0];
        const fileNameElement = this.closest('td').querySelector('.selected-file');
        const removeButton = this.closest('td').querySelector('.file-remove');

        validateFileSize(file, this, fileNameElement, removeButton);
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
        const tbody = row.closest('tbody');

        if (this.classList.contains('up-btn') && row.previousElementSibling) {
            // 위로 이동
            tbody.insertBefore(row, row.previousElementSibling);
        } else if (this.classList.contains('down-btn') && row.nextElementSibling) {
            // 아래로 이동
            tbody.insertBefore(row.nextElementSibling, row);
        }

        // priority 값 업데이트
        updateBannerPriorities(tbody);
    });
});

// 배너 priority 값 업데이트 함수
function updateBannerPriorities(tbody) {
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        const priorityInput = row.querySelector('input[name="priority"]');
        if (priorityInput) {
            priorityInput.value = index + 1;
        }
    });
}

// 초기 priority 값 설정
updateBannerPriorities(document.getElementById('registerBannerTbody'));
updateBannerPriorities(document.getElementById('modifyBannerTbody'));

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

// 등록 버튼 클릭 이벤트
document.querySelector('#btnPoiRegister').addEventListener('click', async function(e) {
    e.preventDefault();

    const type = document.querySelector('input[name="type"]:checked').value;
    let logoFileId = null; // 로고 파일 ID 추적
    const bannerFileIds = []; // 배너 파일 ID들 추적

    try {
        if (type === 'store') {
            const buildingId = document.getElementById('buildingId').value;
            const storeName = document.getElementById('registerStoreName').value;
            const category = document.getElementById('registerBusiness').value;
            const floorNo=  Number(document.getElementById('registerStoreFloor').value);
            const phoneNumber =  document.getElementById('registerPhone').value;

            // 입력값 검증
            if(!storeName){
                alertSwal('상가명을 입력해주세요.');
                return;
            }
            if(!category){
                alertSwal('업종을 입력해주세요.');
                return;
            }
            if(!floorNo){
                alertSwal('층을 선택해주세요.');
                return;
            }

            // 배너 파일 검증
            const bannerRows = document.querySelectorAll('#registerBannerTbody tr');
            for (let row of bannerRows) {
                const bannerFile = row.querySelector('.banner-file').files[0];
                const startDate = row.querySelector('.start-date').value;
                const endDate = row.querySelector('.end-date').value;
                const isPermanent = row.querySelector('.banner-checkbox').checked;

                if (bannerFile) {
                    // isPermanent 체크박스가 체크되어 있지 않으면
                    if(!isPermanent){
                        // 배너 파일이 있으면 날짜 필수
                        if (!startDate || !endDate) {
                            await alertSwal('배너의 기간을 지정해주세요.');
                            return;
                        }
                        // 날짜 검증
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        if (start > end) {
                            await alertSwal('시작일이 종료일보다 늦을 수 없습니다.');
                            return;
                        }
                    }
                }else{
                    if(isPermanent){
                        await alertSwal('배너 파일을 선택해주세요.');
                        return;
                    }else{
                        if (startDate || endDate) {
                            await alertSwal('배너 파일을 선택해주세요.');
                            return;
                        }
                    }
                }
            }
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
                    name: storeName,
                    category: category,
                    buildingId: buildingId,
                    floorNo: floorNo,
                    phoneNumber: phoneNumber,
                    fileInfoId: logoFileId,
                    banners: banners
                };

                await api.post('/kiosk/store', poiDto);
                await alertSwal('등록되었습니다.');
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

            const name =  document.getElementById('registerKioskName').value;
            const kioskCode = document.getElementById('registerEquipmentCode').value;
            const buildingId = Number(document.getElementById('buildingId').value);
            const floorNo = Number(document.getElementById('registerKioskFloor').value);
            const description = document.getElementById('registerRemarks').value;

            // 입력값 검증
            if(!name){
                alertSwal('키오스크 명을 입력해주세요.');
                return;
            }
            if(!kioskCode){
                alertSwal('키오스크 코드를 입력해주세요.');
                return;
            }
            if(!floorNo){
                alertSwal('층을 선택해주세요.');
                return;
            }

            // 키오스크 POI 등록
            const kioskData = {
                isKiosk: true,
                name: name,
                kioskCode: kioskCode,
                buildingId: buildingId,
                floorNo: floorNo,
                description: description
            };

            await api.post('/kiosk/kiosk', kioskData);
            await alertSwal('등록되었습니다.');
        }

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
        floorNo: Number(document.getElementById("modifyKioskFloor").value),
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
        const name = document.getElementById("modifyStoreName").value.trim();
        const category = document.getElementById("modifyBusiness").value;
        const floorNo = document.getElementById("modifyStoreFloor").value;
        const bannerRows = document.querySelectorAll("#modifyBannerTbody tr");
        
        if (!name) {
            alertSwal("POI명을 입력하세요.");
            return;
        }
        if (!category) {
            alertSwal("업종을 선택하세요.");
            return;
        }
        if (!floorNo) {
            alertSwal("층을 선택하세요.");
            return;
        }

        const logoInput = document.getElementById("modifyLogoFile");
        if (logoInput.files[0]) {
            const logoFileId = await uploadFileAndSetId(logoInput, "data-file-id", "logo");
            logoInput.setAttribute("data-file-id", logoFileId);
        }

        for (const row of bannerRows) {
            const bannerInput = row.querySelector(".banner-file");
            if (bannerInput.files[0]) {
                const isPermanent = row.querySelector("input[name='always']").checked;
                const startDate = row.querySelector("input[name='startDate']").value;
                const endDate = row.querySelector("input[name='endDate']").value;

                if (!isPermanent && (!startDate || !endDate)) {
                    alertSwal("기간을 확인하세요.");
                    return;
                }
                const newFileId = await uploadFileAndSetId(bannerInput, "data-file-id", "banner");
                bannerInput.setAttribute("data-file-id", newFileId);
            }
        }

        const dto = {
            id: Number(document.getElementById("poiModifyForm").dataset.id),
            name: document.getElementById("modifyStoreName").value,
            category: document.getElementById("modifyBusiness").value,
            buildingId: Number(document.getElementById("buildingId").value),
            floorNo: Number(document.getElementById("modifyStoreFloor").value),
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
    if (poi.floorNo !== Number(selectedFloorNo)) {
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

        const selectedFloorNo = Number(document.querySelector('#leftFloorSelect').value);
        if (selectedFloorNo) {
            filteredList = filteredList.filter(
                (poi) => poi.floorNo === selectedFloorNo);
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
                    if(selectedFloorNo){
                        return poi.position === null && poi.floorNo === selectedFloorNo
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
    const selectedType = document.querySelector('#kioskPoiSelect').value;
    const leftFloorSelect = document.querySelector('#leftFloorSelect');
    const leftPoiCategorySelect = document.querySelector('#leftPoiCategorySelect')

    if(selectedFloorNo) {
        leftFloorSelect.value = selectedFloorNo;
        displayList = displayList.filter(
            (poi) => poi.floorNo === Number(selectedFloorNo));
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
                return poi.position === null && poi.floorNo === Number(selectedFloorNo)
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

document.querySelector('#kioskPoiSelect').addEventListener('change', () => {
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

const moveToPoi = (id) => {
    let poiId;
    if (id.constructor.name === 'PointerEvent') {
        poiId = id.currentTarget.getAttribute('poiid');
    } else {
        poiId = id;
    }
    const poiData = Px.Poi.GetData(poiId);

    if (poiData) {
        Px.Model.Visible.Show(String(poiData.property.floorNo));
        Px.Camera.MoveToPoi({
            id: poiId,
            isAnimation: true,
            duration: 500,
        });
    } else {
        alertSwal('POI를 배치해주세요');
    }
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const logoInput = document.getElementById('modifyLogoFile');
const fileNameElement = logoInput.closest('.file-upload').querySelector('.file-name');
const removeButton = logoInput.closest('.file-upload').querySelector('.file-remove');
logoInput.addEventListener('change', function () {
    const file = this.files[0];
    validateFileSize(file, this, fileNameElement, removeButton);
});

// 파일 크기 검증 함수
function validateFileSize(file, inputElement, fileNameElement, removeButton) {
    if (!file) {
        inputElement.value = '';
        fileNameElement.textContent = '';
        removeButton.style.display = 'none';
        return;
    }

    if (file && file.size > MAX_FILE_SIZE) {
        alertSwal("10MB 이하의 파일만 업로드할 수 있습니다.");
        inputElement.value = '';
        removeButton.style.display = 'none';
        fileNameElement.textContent = '';

    } else {
        fileNameElement.textContent = file.name;
        removeButton.style.display = 'inline';
    }
}

function resetModifyStoreForm() {
    const form = document.getElementById("poiModifyForm");

    form.reset();

    form.querySelectorAll("input[type='file']").forEach(fileInput => {
        fileInput.value = '';
        fileInput.removeAttribute('data-file-id');
    });

    form.querySelectorAll("input[type='date']").forEach(dateInput => {
        dateInput.value = '';
        dateInput.disabled = false;
    });

    form.querySelectorAll(".file-name, .selected-file").forEach(el => {
        el.innerHTML = '';
    });
    form.querySelectorAll(".file-remove").forEach(btn => {
        btn.style.display = 'none';
    });

    form.querySelectorAll("#modifyBannerTbody tr").forEach(row => {
        delete row.dataset.bannerId;
    });


}

const handlePoiModifyBtnClick = async (kioskPoi) => {
    resetModifyStoreForm();
    const floors = BuildingManager.findStore().floors;
    const modifyStoreFloorSelect = document.getElementById('modifyStoreFloor');
    const modifyKioskFloorSelect = document.getElementById('modifyKioskFloor');

    appendFloorOptionsToSelect(floors, modifyStoreFloorSelect);
    appendFloorOptionsToSelect(floors, modifyKioskFloorSelect);
    const poiDetail = await KioskPoiManager.getKioskPoi(kioskPoi.id);

    const poiModifyForm = document.getElementById("poiModifyForm");
    poiModifyForm.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.disabled = true;
        if (kioskPoi.isKiosk || kioskPoi.property.isKiosk) {
            radio.checked = radio.value === "kiosk";
        }else{
            radio.checked = radio.value === "store";
        }
    });

    if (kioskPoi.position) {
        document.getElementById('modifyStoreFloor').disabled = true;
        document.getElementById('modifyKioskFloor').disabled = true;
    }
    document.getElementById('poiModifyForm').dataset.id = kioskPoi.id;
    if (kioskPoi.isKiosk || kioskPoi.property.isKiosk) {
        document.getElementById('modifyKioskForm').style.display = 'block';
        document.getElementById('modifyStoreForm').style.display = 'none';
        document.getElementById("modifyEquipmentCode").disabled = true;
        document.getElementById("modifyKioskName").value = poiDetail.name || '';
        document.getElementById("modifyEquipmentCode").value = poiDetail.kiosk.kioskCode || '';
        document.getElementById("modifyKioskFloor").value = poiDetail.kiosk.floorNo || '';
        document.getElementById("modifyRemarks").value = poiDetail.kiosk.description || '';
        poiModifyModal.show();
    } else {
        document.getElementById('modifyStoreForm').style.display = 'block';
        document.getElementById('modifyKioskForm').style.display = 'none';

        document.getElementById("modifyStoreName").value = poiDetail.name || '';
        document.getElementById("modifyBusiness").value = poiDetail.store.category || '';
        document.getElementById("modifyStoreFloor").value = poiDetail.store.floorNo || '';
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