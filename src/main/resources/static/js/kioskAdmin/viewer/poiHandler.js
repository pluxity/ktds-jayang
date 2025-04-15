document.addEventListener('DOMContentLoaded', function() {
    const registerBtn = document.querySelector('#poi-Register-btn');
    const popup = document.querySelector('#poi-register-popup');
    const radioButtons = document.querySelectorAll('input[name="type"]');
    const registerStoreForm = document.getElementById('register-store-form');
    const registerKioskForm = document.getElementById('register-kiosk-form');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const poiRegisterModal = new bootstrap.Modal(document.getElementById('poiRegisterModal'));
    const poiRegisterForm = document.getElementById("poiRegisterForm");
    registerBtn.addEventListener('click', () => {
        const buildingId = document.getElementById("buildingId").value;
        poiRegisterForm.reset();
        poiRegisterForm.querySelector(".file-name").textContent = "";
        poiRegisterForm.querySelector(".file-remove").textContent = "";

        const bannerRows = poiRegisterForm.querySelectorAll("#registerbanner-tbody tr");
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
        BuildingManager.findById(buildingId).floors.forEach((item) => {
            const registerStoreFloorSelect = document.getElementById('register-store-floor');
            const registerKioskFloorSelect = document.getElementById('register-kiosk-floor');
            const storeOption = document.createElement('option');
            storeOption.value = item.id;
            storeOption.textContent = item.name;
            registerStoreFloorSelect.appendChild(storeOption);

            const kioskOption = document.createElement('option');
            kioskOption.value = item.id;
            kioskOption.textContent = item.name;
            registerKioskFloorSelect.appendChild(kioskOption);
        });
        poiRegisterModal.show();
    });

    // 팝업 닫기 및 폼 초기화 함수
    function resetAndClosePopup() {
        const form = document.getElementById('poiRegisterForm');
        if (form) {
            form.reset();
        }
        document.getElementById('poi-register-popup').style.display = 'none';
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
    document.getElementById('register-logo-file').addEventListener('change', function() {
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
            const tbody = document.getElementById('register-banner-tbody');
            
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
        const rows = document.querySelectorAll('#register-banner-tbody tr');
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
                const logoFile = document.getElementById('register-logo-file').files[0];
                if (logoFile) {
                    formData.append('logo', logoFile);
                }
                let storeData = {};

                // 2. 배너 파일들 업로드
                const bannerRows = document.querySelectorAll('#register-banner-tbody tr');

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
                    name: document.getElementById('register-store-name').value,
                    category: document.getElementById('register-business').value,
                    buildingId: Number(buildingId),
                    floorId: Number(document.getElementById('register-store-floor').value),
                    phoneNumber: document.getElementById('register-phone').value,
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
                    name: document.getElementById('register-kiosk-name').value,
                    kioskCode: document.getElementById('register-equipment-code').value,
                    buildingId: Number(buildingId),
                    floorId: Number(document.getElementById('register-kiosk-floor').value),
                    description: document.getElementById('register-remarks').value
                };

                await api.post('/kiosk/kiosk', kioskData);
            }

            await alertSwal('등록되었습니다.');
            poiRegisterModal.hide();
            await getKioskPoiListRendering();

        } catch (error) {
            console.error('Error:', error);
        }
    });
});

const getKioskPoiListRendering = async () => {
    await KioskPoiManager.getKioskPoiList().then(() => {
        let list = KioskPoiManager.getList();
        poiPaging(list);
    });
}