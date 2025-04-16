document.addEventListener('DOMContentLoaded', function() {
    const registerBtn = document.querySelector('#poiRegisterBtn');
    const radioButtons = document.querySelectorAll('input[name="type"]');
    const registerStoreForm = document.getElementById('registerStoreForm');
    const registerKioskForm = document.getElementById('registerKioskForm');
    const poiRegisterModal = new bootstrap.Modal(document.getElementById('poiRegisterModal'));
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
            
            fileInput.value = ''; // 파일 입력 초기화
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
                        const always = row.querySelector('.banner-checkbox').checked;
                        const priority = Number(row.querySelector('input[name="priority"]').value);

                        banners.push({
                            priority: priority,
                            startDate: startDate ? startDate : null,
                            endDate: endDate ? endDate : null,
                            always: always
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
});

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
            filteredList = filteredList.filter((poi) => poi.position === null && poi.floorId === selectedFloorId);
        }

        poiPaging(filteredList);
}

// 층 선택 시 POI 리스트 렌더링
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
    getKioskPoiListRendering();
});

// POI 미배치(전체) 선택 시 POI 리스트 렌더링
document.querySelector('#poiUnAllocate').addEventListener('pointerup', (event) => {
    const {currentTarget} = event;
    currentTarget.classList.add('active');
    document.querySelector('#poiAllocate').classList.remove('active');
    document.querySelector('#poiUnAllocateByFloor').classList.remove('active');
    getKioskPoiListRendering();
});

// POI 미배치(층별) 선택 시 POI 리스트 렌더링
document.querySelector('#poiUnAllocateByFloor').addEventListener('pointerup', (event) => {
    const {currentTarget} = event;
    currentTarget.classList.add('active');
    document.querySelector('#poiAllocate').classList.remove('active');
    document.querySelector('#poiUnAllocate').classList.remove('active');
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