const data = {};

document.getElementById('searchButton').onclick = () => searchBuildingInfoList();

const getBuildingInfoList = () => {
    api.get('/buildings').then((res) => {
        data.Buildings = res.data.result;
        renderBuildingList(data.Buildings);
    })
}
const renderBuildingList = (buildingList) => {
    const gridData = buildingList.map((data) => [
        data.id,
        data.code,
        gridjs.html(
            `<a data-bs-toggle="modal" data-bs-target="#buildingModifyModal" id="showModifyModalButton" onclick="modifyBuildingModal(${data.id})">${data.name}</a>`,
        ),
        data.buildingFile.originName === null
            ? ''
            : gridjs.html(
                `<a href="/Building/${data.buildingFile.directory}/${data.buildingFile.storedName}.${data.buildingFile.extension}">
                            ${data.buildingFile.originName}
                      </a>`,
            ),
        data.description,
        gridjs.html(
            `<button class="btn btn-primary space me-1"  onclick="window.open('/admin/viewer?buildingId=${data.id}')" id="showSpaceManagementModalButton" >공간관리</button>
                 <button class="btn btn-warning modify me-1" data-bs-toggle="modal" data-bs-target="#buildingModifyModal" id="showModifyModalButton" onclick="modifyBuildingModal(${data.id})">수정</button>
                 <button class="btn btn-danger delete"  onclick="deleteBuilding(${data.id})" >삭제</button>`,
        ),
    ]);
    const columns = [
        {
            id: 'checkbox',
            name: '선택',
            width: '10%',
            plugin: {
                component: gridjs.plugins.selection.RowSelection,
                props: {
                    id: (row) => row.cell(1).data,
                },
            },
        },
        {
            id: 'id',
            name: 'id',
            hidden: true,
        },
        {
            name: '도면코드',
            width: '10%',
        },
        {
            name: '도면이름',
            width: '15%',
        },
        {
            name: '도면파일명',
            width: '15%',
        },
        {
            name: '상세설명',
            width: '30%',
        },
        {
            name: '관리',
            width: '20%',
        },
    ];
    const dom = document.querySelector('#wrapper');
    const option = {
        dom,
        columns,
        data: gridData,
        isPagination: true,
    };
    if (document.getElementById('wrapper').innerHTML === '') {
        createGrid(option);
    } else {
        resizeGrid(option);
    }

}

// 등록 버튼 클릭처리
const buildingRegistModal = document.getElementById('buildingRegistModal');
buildingRegistModal.addEventListener('shown.bs.modal', () => {
    document.getElementById('btnBuildingRegist').disabled = false;
    document.getElementById('btnBuildingRegist').innerHTML = '등록';
    document.getElementById('buildingRegistForm').reset();
});


// 수정 버튼 처리
function modifyBuildingModal(id) {
    const form = document.getElementById('buildingModifyForm');
    document.getElementById('btnBuildingModify').disabled = false;
    document.getElementById('btnBuildingModify').innerHTML = '수정';
    form.querySelector('#modifyId').value = id;
    form.reset();
    let currentBuildingFileId = null;

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

        setBuildingVersionSelect(historyList, currentBuildingFileId);
    });

}

// select에 버전과 id를 넣는 함수
function setBuildingVersionSelect(historyList, currentBuildingFileId) {
    console.log("currentBuildingFileId =",currentBuildingFileId);
    const select = document.getElementById('buildingVersionSelect');
    select.innerHTML = ''; // 기존 옵션들 제거
    
    historyList.forEach(history => {
        const option = document.createElement('option');
        option.value = history.fileId;
        option.textContent = history.buildingVersion;
        console.log("fileId = ",history.fileId);
        if(history.fileId === currentBuildingFileId){
            option.selected = true;
        }
        select.appendChild(option);
    });
}

// 등록 폼 입력 처리
const btnBuildingRegist = document.getElementById('btnBuildingRegist');
btnBuildingRegist.onclick = () => {
    const form = document.getElementById('buildingRegistForm');
    if (!validationForm(form)) return;

    document.getElementById('btnBuildingRegist').disabled = true;
    document.getElementById('btnBuildingRegist').innerHTML =
        '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Loading...';

    const isIndoor = form.querySelector('input[name="isIndoor"]:checked').value;
    const buildingType = (isIndoor === 'Y') ? 'indoor' : 'outdoor';

    const formData = new FormData(form);
    formData.set('buildingType', buildingType);

    const fileFormData = new FormData();
    fileFormData.set('file', formData.get('multipartFile'));

    const headers = {
        'Content-Type': 'application/json',
    };

    api.post('/buildings/upload/file', fileFormData).then((res) => {
        const {result: data} = res.data;
        const param = {
            buildingType: buildingType,
            name: formData.get('name'),
            code: formData.get('code'),
            description: formData.get('description'),
            fileInfoId: data.id,
            isIndoor: isIndoor
            // floors
        }
        api.post('/buildings', param, {headers}).then(() => {
            alertSwal('등록되었습니다.').then(() => {
                buildingRegistModal.querySelector('.btn-close').click();
                getBuildingInfoList();
            });
        }).catch(() => {
            document.getElementById('btnBuildingRegist').disabled = false;
            document.getElementById('btnBuildingRegist').innerHTML = '등록';
        })
    }).catch(() => {
            document.getElementById('btnBuildingRegist').disabled = false;
            document.getElementById('btnBuildingRegist').innerHTML = '등록';
    });
}

// 수정폼 수정 처리
const btnBuildingModify = document.getElementById('btnBuildingModify');
btnBuildingModify.onclick = () => {
    const form = document.getElementById('buildingModifyForm');
    if (!validationForm(form)) return;

    document.getElementById('btnBuildingModify').disabled = true;
    document.getElementById('btnBuildingModify').innerHTML =
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
        fileInfoId: document.getElementById('buildingVersionSelect').value  // 선택된 fileId 추가
    }

    api.put(`/buildings/${formData.get('id')}`, buildingParam, { headers })
        .then(() => {
            alertSwal('수정되었습니다.').then(()=> {
                document.querySelector('#buildingModifyModal .btn-close').click();
                getBuildingInfoList();
            });

        })
        .catch(() => {
            document.getElementById('btnBuildingModify').disabled = false;
            document.getElementById('btnBuildingModify').innerHTML = '수정';
        });
};

// file 업로드 처리
const buildingUploadBtn = document.getElementById('buildingUploadBtn');

buildingUploadBtn.onclick = () => {
    const getHistoryContent = document.getElementById('buildingHistoryContent').value;
    const uploadFile = document.getElementById('buildingUploadFile');
    const getBuildingId = document.getElementById('modifyId').value;

    const fileFormData = new FormData();
    fileFormData.set('file', uploadFile.files[0]);

    const headers = {
        'Content-Type': 'application/json',
    };

    api.post('/buildings/upload/file', fileFormData).then((res) => {
        const {result: data} = res.data;
        const param = {
            buildingId: getBuildingId,
            historyContent: getHistoryContent,
            fileInfoId: data.id
        }
        api.post('/buildings/history', param, {headers}).then(() => {
            alertSwal('등록되었습니다.');
            // history load
            getHistoryList(getBuildingId);
        })
    })
}

function getHistoryList(id) {
    return api.get(`/buildings/history/${id}`).then((res) => {
        const {result: historyList} = res.data;
        renderHistoryList(historyList);
        return historyList;
    });
}

const renderHistoryList = (historyList) => {

    const tbody = document.getElementById('historyListBody');
    tbody.innerHTML = ''; // 기존 내용 초기화

    if (historyList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">등록된 이력이 없습니다.</td>
            </tr>
        `;
        return;
    }

    historyList.forEach(history => {
        console.log("history = ",history);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${history.buildingVersion || '-'}</td>
            <td>${history.fileName || '-'}</td>
            <td>${history.historyContent || '-'}</td>
            <td>${history.regUser || '-'}</td>
            <td>${history.createdAt || '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary">
                    <i class="fas fa-download"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
};





function deleteBuilding(id) {
    confirmSwal('정말로 삭제 하시겠습니까?<br>' +
        '<small>※ 등록된 POI가 있을경우<br>모두 삭제됩니다.</small>').then(() => {
        api.delete(`/buildings/${id}`).then(() => {
            alertSwal('삭제가 완료 되었습니다.').then(() => {
                getBuildingInfoList();
            });
        });
    });
}

const btnDeleteBuilding = document.getElementById('btnDeleteBuilding');
btnDeleteBuilding.onclick = () => {
    const selectedId = getSelectedId();
    if (selectedId.length === 0) {
        alertSwal('선택된 값이 없습니다.');
        return;
    }
    confirmSwal('정말 삭제 하시겠습니까?').then(() => {
        api.delete(`/buildings/ids/${selectedId}`).then(() => {
            alertSwal('정상적으로 삭제되었습니다.').then(() => {
                getBuildingInfoList();
            });

        });
    });
};

const searchBuildingInfoList = () => {
    const searchType = document.getElementById('searchType').value;
    const searchName = document.getElementById('searchName').value.toLowerCase();

    const filteredList = data.Buildings.filter((building) => building[searchType].toLowerCase().indexOf(searchName) > -1)

    renderBuildingList(filteredList);
}

document.addEventListener(
    'keydown',
    function (event) {
        if (event.keyCode === 13) {
            searchBuildingInfoList();
        }
    },
    true,
);

getBuildingInfoList();