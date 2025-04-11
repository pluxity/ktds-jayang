document.addEventListener('DOMContentLoaded', function() {
    const registerBtn = document.querySelector('#poi-Register-btn');
    const popup = document.querySelector('#poi-register-popup');
    const radioButtons = document.querySelectorAll('input[name="type"]');
    const storeForm = document.getElementById('store-form');
    const kioskForm = document.getElementById('kiosk-form');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const poiRegisterModal = new bootstrap.Modal(document.getElementById('poiRegisterModal'));

    registerBtn.addEventListener('click', () => {
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
                storeForm.style.display = 'block';
                kioskForm.style.display = 'none';
            } else {
                storeForm.style.display = 'none';
                kioskForm.style.display = 'block';
            }
        });
    });

    // 로고 파일 선택 시 파일명 표시
    document.getElementById('logo-file').addEventListener('change', function() {
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
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const tbody = document.getElementById('banner-tbody');
            
            if (this.classList.contains('up-btn') && row.previousElementSibling) {
                // 위로 이동
                tbody.insertBefore(row, row.previousElementSibling);
            } else if (this.classList.contains('down-btn') && row.nextElementSibling) {
                // 아래로 이동
                tbody.insertBefore(row.nextElementSibling, row);
            }
        });
    });

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

    // document.querySelector('.submit-btn').addEventListener('click', async function() {
    //     const isStore = document.querySelector('input[name="type"][value="store"]').checked;
    //     const buildingId = document.getElementById('buildingId').value;
    //
    //     try {
    //         let fileInfoId = null;
    //         let banners = [];
    //
    //         // 상가인 경우 로고 파일과 배너 파일들 업로드
    //         if (isStore) {
    //             // 로고 파일 업로드
    //             const logoFile = document.getElementById('logo-file').files[0];
    //             if (logoFile) {
    //                 const formData = new FormData();
    //                 formData.append('file', logoFile);
    //
    //                 const fileResponse = await fetch('/kiosk/upload/file', {
    //                     method: 'POST',
    //                     body: formData
    //                 });
    //
    //                 if (!fileResponse.ok) {
    //                     throw new Error('로고 파일 업로드 실패');
    //                 }
    //
    //                 const fileResult = await fileResponse.json();
    //                 fileInfoId = fileResult.data.id;
    //             }
    //
    //             // 배너 파일들 업로드
    //             const bannerInputs = document.querySelectorAll('.banner-file');
    //             for (let i = 0; i < bannerInputs.length; i++) {
    //                 const bannerFile = bannerInputs[i].files[0];
    //                 if (bannerFile) {
    //                     const formData = new FormData();
    //                     formData.append('file', bannerFile);
    //
    //                     const bannerResponse = await fetch('/kiosk/upload/file', {
    //                         method: 'POST',
    //                         body: formData
    //                     });
    //
    //                     if (!bannerResponse.ok) {
    //                         throw new Error('배너 파일 업로드 실패');
    //                     }
    //
    //                     const bannerResult = await bannerResponse.json();
    //
    //                     // 배너 정보 수집
    //                     const row = bannerInputs[i].closest('tr');
    //                     const startDateInput = row.querySelector('input[name="startDate"]');
    //                     const endDateInput = row.querySelector('input[name="endDate"]');
    //                     const alwaysCheckbox = row.querySelector('input[type="checkbox"]');
    //
    //                     banners.push({
    //                         fileId: bannerResult.data.id,
    //                         priority: i + 1,
    //                         startDate: startDateInput.value ? startDateInput.value : null,
    //                         endDate: endDateInput.value ? endDateInput.value : null
    //                     });
    //                 }
    //             }
    //         }
    //
    //         if (isStore) {
    //             // 상가 POI 등록
    //             const storeData = {
    //                 isKiosk: false,
    //                 name: document.getElementById('store-name').value,
    //                 category: document.getElementById('business').value,
    //                 buildingId: Number(buildingId),
    //                 floorId: Number(document.getElementById('store-floor').value),
    //                 phoneNumber: document.getElementById('phone').value,
    //                 fileInfoId: fileInfoId,
    //                 banners: banners
    //             };
    //
    //             const response = await fetch('/kiosk/store', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify(storeData)
    //             });
    //
    //             if (!response.ok) {
    //                 throw new Error('서버 요청 실패');
    //             }
    //
    //             alert('POI가 성공적으로 등록되었습니다.');
    //             // 팝업 닫기 및 목록 새로고침 로직 추가 필요
    //
    //         } else {
    //             // 키오스크 POI 등록
    //             const kioskData = {
    //                 isKiosk: true,
    //                 name: document.getElementById('kiosk-name').value,
    //                 kioskCode: document.getElementById('equipment-code').value,
    //                 buildingId: Number(buildingId),
    //                 floorId: Number(document.getElementById('kiosk-floor').value),
    //                 description: document.getElementById('remarks').value
    //             };
    //
    //             const response = await fetch('/kiosk/kiosk', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify(kioskData)
    //             });
    //
    //             if (!response.ok) {
    //                 throw new Error('서버 요청 실패');
    //             }
    //
    //             alert('POI가 성공적으로 등록되었습니다.');
    //             // 팝업 닫기 및 목록 새로고침 로직 추가 필요
    //         }
    //
    //         // 등록 성공 시 모달 닫기
    //         const modalElement = document.getElementById('poiRegisterModal');
    //         const modalInstance = bootstrap.Modal.getInstance(modalElement);
    //         modalInstance.hide();
    //     } catch (error) {
    //         console.error('Error:', error);
    //         alert('POI 등록 중 오류가 발생했습니다.');
    //     }
    // });
});