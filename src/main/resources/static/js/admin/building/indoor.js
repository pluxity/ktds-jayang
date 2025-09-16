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
        data.isIndoor === 'Y' ? '실내' : '실외',
        data.code,
        gridjs.html(
            `<a data-bs-toggle="modal" data-bs-target="#buildingModifyModal" id="showModifyModalButton" onclick="modifyBuildingModal(${data.id})">${data.name}</a>`,
        ),
        data.buildingFile.originName === null
            ? ''
            : gridjs.html(
                `<a href="/Building/${data.buildingFile.directory}/${data.version}/${data.buildingFile.storedName}.${data.buildingFile.extension}"
                            download="${data.buildingFile.originName}">
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
            width: '8%',
            plugin: {
                component: gridjs.plugins.selection.RowSelection,
                props: {
                    id: (row) => row.cell(2).data,
                },
            },
        },
        {
            id: 'id',
            name: 'id',
            hidden: true,
        },
        {
            name: '구분',
            width: '8%',
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
            width: '15%',
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
    clearBuildingUploadFile();
    let currentBuildingFileId = null;

    Promise.all([
        api.get(`/buildings/${id}`),
        getHistoryList(id)
    ]).then(([buildingRes, historyList]) => {
        const {result: resultData} = buildingRes.data;
        console.log("resultData = ", resultData);
        form.querySelector('#modifyName').value = resultData.name;
        form.querySelector('#modifyCode').value = resultData.code;
        if (resultData.isIndoor === 'Y') {
            form.querySelector('input[name="isIndoor"][value="Y"]').checked = true;
        } else {
            form.querySelector('input[name="isIndoor"][value="N"]').checked = true;
        }
        form.querySelector('#modifyDescription').innerHTML = resultData.description;

        form.querySelector('#modifyFloorInfo').innerHTML = resultData.floors
            .map(floor =>
                floor.sbmFloor
                    .map(sbm => `${floor.name} / ${sbm.sbmFileName}`)
                    .join(', &#10;')).join('&#10;');

        currentBuildingFileId = resultData.buildingFile.id;

        setBuildingVersionSelect(historyList, resultData.version);
    });

}

// select에 버전과 id를 넣는 함수
function setBuildingVersionSelect(historyList, version) {
    const select = document.getElementById('buildingVersionSelect');
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
        historyId: document.getElementById('buildingVersionSelect').value

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
    const version = getVersionString();
    const getHistoryContent = document.getElementById('buildingHistoryContent').value;
    const uploadFile = document.getElementById('buildingUploadFile');
    const getBuildingId = document.getElementById('modifyId').value;
    const currentVersion = document.getElementById('buildingVersionSelect').value;

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
            getHistoryList(getBuildingId).then((historyList) => {
                setBuildingVersionSelect(historyList,currentVersion);
            });
            clearBuildingUploadFile();
        })
    })
}

const clearBuildingUploadFile = () => {
    document.getElementById('buildingUploadFile').value = '';
    document.getElementById('buildingHistoryContent').value = '';
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

function getHistoryList(id) {
    return api.get(`/buildings/history/building/${id}`).then((res) => {
        const {result: historyList} = res.data;
        renderHistoryList(historyList);
        return historyList;
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
            <th>등록자</th>
            <th>등록일</th>
            <th>관리</th>
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

    historyList.forEach(history => {
        console.log("history = ",history);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${history.buildingVersion || '-'}</td>
            <td>${history.fileName || '-'}</td>
            <td>${history.historyContent || '-'}</td>
            <td>${history.regUser || '-'}</td>
            <td>${history.createdAt || '-'}</td>
            <input type="hidden" id="historyId" value="${history.historyId}">
            <td style="text-align: center">
                <button class="btn btn-sm btn-primary" onclick="window.open('/admin/viewer?buildingId=${history.buildingId}&version=${history.buildingVersion}')" >
                    <i class="fas fa-map"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="downloadFile('${history.fileInfo.fileEntityType}', '${history.fileInfo.directory}', '${history.buildingVersion}', '${history.fileInfo.storedName}', '${history.fileInfo.extension}')">
                    <i class="fas fa-download"></i>
                </button>
               <button class="btn btn-sm btn-danger" onclick="deleteHistory('${history.buildingVersion}', ${history.buildingId}, ${history.historyId})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
};

function downloadFile(fileEntityType, directory, version, storedName, extension) {
    const url = `/${fileEntityType}/${directory}/${version}/${storedName}.${extension}`;

    // 다운로드 링크 생성
    const link = document.createElement('a');
    link.href = url;
    link.download = `${storedName}.${extension}`;  // 다운로드될 파일명
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const deleteHistory = async (version, buildingId, historyId) => {
    try {
        const res = await api.get(`/buildings/${buildingId}`);
        const building = res.data.result;

        if (building.version === version) {
            confirmSwal('현재 활성화된 버전은 삭제할 수 없습니다.');
            return;
        }
        await api.delete(`/buildings/history/${historyId}`).then(() => {
            confirmSwal('히스토리가 삭제되었습니다.');
            getHistoryList(buildingId).then((historyList) => {
               setBuildingVersionSelect(historyList, building.version);
            });
        });
    } catch (error) {
        console.error('히스토리 삭제 실패:', error);
        confirmSwal('히스토리 삭제에 실패했습니다.');
    }
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