
const getBuildingInfoList = () => {
    api.get('/buildings/outdoor').then((res) => {
        const { data: buildingList } = res.data;
        const registBtn = document.getElementById('btnRegistBuilding');
        if(buildingList.length !== 0) {
            registBtn.classList.add('hidden');
        } else {
            registBtn.classList.remove('hidden');
        }

        const gridData = res.data.data.map((data) => [
            data.id,
            gridjs.html(
                `<a data-bs-toggle="modal" data-bs-target="#buildingModifyModal" id="showModifyModalButton" onclick="modifyBuildingModal(${data.id})">${data.name}</a>`,
            ),
            data.buildingFile.originName === null
                ? ''
                : gridjs.html(
                    `<a href="/building/${data.buildingFile.directory}/${data.buildingFile.storedName}.${data.buildingFile.extension}">
                            ${data.buildingFile.originName}
                      </a>`,
                ),
            data.description,
            gridjs.html(
                `<button class="btn btn-primary space me-1"  onclick="window.open('/admin/viewer?buildingId=${data.id}')" id="showSpaceManagementModalButton" >공간관리</button>
                 <button class="btn btn-warning modify me-1" data-bs-toggle="modal" data-bs-target="#buildingModifyModal" id="showModifyModalButton" onclick="modifyBuildingModal(${data.id})">수정</button>`,
            ),
        ]);
        const columns = [
            {
                id: 'id',
                name: 'id',
                hidden: true,
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
    });
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
    api.get(`/buildings/${id}`).then((res) => {
        const {data: resultData} = res.data;
        form.querySelector('#modifyName').value = resultData.name;
        form.querySelector('#modifyDescription').innerHTML =
            resultData.description;
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

    const formData = new FormData(form);
    formData.set('buildingType', 'outdoor');

    const fileFormData = new FormData();
    fileFormData.set('file', formData.get('multipartFile'));

    const headers = {
        'Content-Type': 'application/json',
    };

    api.post('/buildings/upload/file', fileFormData).then((res) => {
        const {data} = res.data;

        Px.Util.GetFbxHierarchy(`/Building/${data.directory}/${data.storedName}.${data.extension}`,
            (floorList) => {
                const floors = [];
                floorList.forEach((floor) => {
                    floors.push({
                        floorName: floor.name,
                        floorOrder: floor.order,
                        floorNo: floor.floorId
                    });
                })

                const param = {
                    buildingType: 'outdoor',
                    name: formData.get('name'),
                    description: formData.get('description'),
                    fileInfoId: data.id,
                    floors
                }
                api.post('/buildings', param, {headers}).then(() => {
                    alertSwal('등록되었습니다.').then(() => {
                        buildingRegistModal.querySelector('.btn-close').click();
                        document.getElementById('btnRegistBuilding').classList.add('hidden');
                        getBuildingInfoList();
                    }).catch(() => {
                        document.getElementById('btnBuildingRegist').disabled = false;
                        document.getElementById('btnBuildingRegist').innerHTML = '등록';
                    })
                })
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
        buildingType: 'outdoor',
        name: formData.get('name'),
        description: formData.get('description')
    }

    if(document.getElementById('modifyMultipartFile').value === '') {
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
    } else {
        const fileFormData = new FormData();
        fileFormData.set('file', formData.get('multipartFile'));

        api.post('/buildings/upload/file', fileFormData).then((res) => {
            const {data} = res.data;

            Px.Util.GetFbxHierarchy(`/Building/${data.directory}/${data.storedName}.${data.extension}`,
                (floorList) => {
                    const floors = [];
                    floorList.forEach((floor) => {
                        floors.push({
                            floorName: floor.name,
                            floorOrder: floor.order,
                            floorNo: floor.floorId
                        });
                    })

                    buildingParam.fileInfoId = data.id;
                    buildingParam.floors = floors;

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
                })
        })
            .catch(() => {
                document.getElementById('btnBuildingModify').disabled = false;
                document.getElementById('btnBuildingModify').innerHTML = '수정';
            });
    }
};

getBuildingInfoList();