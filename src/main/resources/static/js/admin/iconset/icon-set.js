const dataWarehouse = {};

// Get
const dataManufacturer = (rowData) =>
    rowData.map((data) => {
        const { id, name: iconsetName, iconFile2D: iconFile2D, iconFile3D: iconFile3D} = data;
        return [
            id,
            iconsetName,
            iconFile2D === null ?
                gridjs.html('') :
                gridjs.html(
                    `<a href="/2D/${iconFile2D.directory}/${iconFile2D.storedName}.${iconFile2D.extension}">
                        <img src="/2D/${iconFile2D.directory}/${iconFile2D.storedName}.${iconFile2D.extension}" style="width: 32px; height: 32px"/>
                    </a>`,
                ),
            iconFile3D === null ?
                gridjs.html('') :
                gridjs.html(
                    `<a href="/3D/${iconFile3D.directory}/${iconFile3D.storedName}.${iconFile3D.extension}">
                        <img src="/3D/${iconFile3D.directory}/${iconFile3D.storedName}.${iconFile3D.extension}" style="width: 32px; height: 32px"/>
                    </a>`,
                ),
            gridjs.html(`
                    <button class="btn btn-warning modifyModalButton" data-bs-toggle="modal" data-bs-target="#iconSetModifyModal" data-id="${data.id}">수정</button>
                    <button class="btn btn-danger deleteButton"  onclick="deleteIconSet(${data.id})" data-id="${data.id}">삭제</button>`)
        ]
    });


const renderIconSet = (rawData = [], limit = 20) => {
    const dom = document.querySelector('#wrapper');

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
            name: '아이콘셋 이름',
            width: '25%',
        },
        {
            name: '2D 아이콘',
            width: '25%',
        },
        {
            name: '3D 아이콘',
            width: '25%',
        },
        {
            name: '관리',
            width: '25%',
        },
    ];
    const data = dataManufacturer(rawData);
    const option = {
        dom,
        columns,
        data,
        isPagination: true,
    };
    if (document.querySelector('#wrapper').innerHTML === '') {
        createGrid(option);
    } else {
        resizeGrid(option);
    }
};

const searchEvent = () => {
    const searchInput = document.querySelector('#searchIconSet');

    const search = () => {
        if (searchInput.value === '') {
            renderIconSet(dataWarehouse.data);
        }
        const searchedData = dataWarehouse.data.filter(
            (iconset) => iconset.name.toLowerCase().indexOf(searchInput.value.toLowerCase()) > -1,
        );
        renderIconSet(searchedData);
    };

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            search();
        }
    });
    document
        .querySelector('#schFrm .input-group-append button')
        .addEventListener('pointerup', () => {
            search();
        });
};
const initIconSet = () => {
    api.get('/icon-sets').then((result) => {
        dataWarehouse.data = result.data.result;
        renderIconSet(dataWarehouse.data);
        searchEvent();
    });
};

initIconSet();

const modifyModal = document.querySelector('#iconSetModifyModal');
modifyModal.addEventListener('show.bs.modal', (event) => {
    modifyModal.querySelector('#iconSetModifyForm').reset();
    const modifyIconSetData = dataWarehouse.data.find(
        (iconSet) => iconSet.id === Number(event.relatedTarget.dataset.id),
    );

    event.currentTarget.dataset.id = modifyIconSetData.id;
    document.querySelector('#modifyName').value = modifyIconSetData.name;

});

const registerModal = document.querySelector('#iconSetRegisterModal');
registerModal.addEventListener('show.bs.modal', () => {
    registerModal.querySelector('form').reset();
});

function uploadFiles(formData) {
    const promises = [];

    const fileHeaders = {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    };

    if (!formData.has("iconFile2D") && !formData.has("iconFile3D")) {
        return Promise.resolve();
    }

    if (formData.has("iconFile2D")) {
        const formData2D = new FormData();
        formData2D.append("file", formData.get("iconFile2D"));
        promises.push(
            api.post('/icon-sets/upload/image', formData2D, fileHeaders).then(res => {
                formData.append("iconFile2DId", res.data.result.id);
            })
        );
    }
    if (formData.has("iconFile3D")) {
        const formData3D = new FormData();
        formData3D.append("file", formData.get("iconFile3D"));
        promises.push(
            api.post('/icon-sets/upload/zip', formData3D, fileHeaders).then(res => {
                formData.append("iconFile3DId", res.data.result.id);
            })
        )
    }
    return Promise.all(promises);
}

// POST
document
    .querySelector('#btnIconSetRegister')
    .addEventListener('pointerup', () => {
        const form = document.querySelector('#iconSetRegisterForm');
        if (!validationForm(form)) return;
        const params = {};
        const files = new Map();
        let header = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const formData = new FormData();
        formData.append('name', document.querySelector('#registerName').value);

        if (document.querySelector('#register2dIconSetFile').files[0]) {
            files.set(
                'iconFile2D',
                document.querySelector('#register2dIconSetFile').files[0],
            );
            formData.append('iconFile2D', document.querySelector(
                '#register2dIconSetFile',
            ).files[0]);
        }

        if (document.querySelector('#register3dIconSetFile').files[0]) {
            files.set(
                'iconFile3D',
                document.querySelector('#register3dIconSetFile').files[0],
            );
            formData.append('iconFile3D', document.querySelector(
                '#register3dIconSetFile',
            ).files[0]);
        }

        uploadFiles(formData).then(() => {
            api.post('/icon-sets', formData, header).then((res) => {
                alertSwal('등록이 완료 되었습니다.').then(() => {
                    document
                        .querySelector(
                            '#iconSetRegisterModal > div > div > div.modal-header > button',
                        )
                        .click();
                    initIconSet();
                });
            });
        })
    });

const setId = (id) => {
    document.querySelector('#iconSetModifyModal').setAttribute('contentId', id);
};

// Put
document
    .querySelector('#btnIconSetModify')
    .addEventListener('pointerup', () => {
        const form = document.querySelector('#iconSetModifyForm');
        if (!validationForm(form)) return;
        const params = {};
        const files = new Map();
        let header;
        let fileHeader;

        const formData = new FormData();
        formData.append('name', document.querySelector('#modifyName').value);

        if (document.querySelector('#modify2dIconSetFile').files[0]) {
            files.set(
                'iconFile2D',
                document.querySelector('#modify2dIconSetFile').files[0],
            );
            formData.append('iconFile2D', document.querySelector(
                '#modify2dIconSetFile',
            ).files[0]);
        }

        if (document.querySelector('#modify3dIconSetFile').files[0]) {
            files.set(
                'iconFile3D',
                document.querySelector('#modify3dIconSetFile').files[0],
            );
            formData.append('iconFile3D', document.querySelector(
                '#modify3dIconSetFile',
            ).files[0]);
        }

        header = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const id = Number(
            document.querySelector('#iconSetModifyModal').dataset.id,
        );
        if (id < 0) {
            alertSwal('유효하지 않은 id 값입니다.');
        }

        uploadFiles(formData).then(() => {
            api.put(`/icon-sets/${id}`, formData, header).then(() => {
                alertSwal('수정이 완료 되었습니다.').then(() => {
                    document
                        .querySelector(
                            '#iconSetModifyModal > div > div > div.modal-header > button',
                        )
                        .click();
                    initIconSet();
                });
            });
        })
    });

// delete
const deleteIconSet = (id) => {
    confirmSwal('정말 삭제 하시겠습니까?').then(() => {
        api.delete(`/icon-sets/${id}`).then((res) => {
            const { status } = res;
            if(status === 204) {
                alertSwal('삭제되었습니다.').then(() => {
                    initIconSet();
                });
            } else if(status === 400) {
                alertSwal('삭제 실패하였습니다.').then(() => {
                    initIconSet();
                })
            }
        });
    });
};

const deleteAllIconSet = () => {
    const idList = getSelectedId();
    if (idList.length === 0) {
        alertSwal('체크 된 항목이 존재하지 않습니다.');
        return;
    }
    confirmSwal('체크 하신 항목을 모두 삭제 하시겠습니까?').then(() => {
        api.delete(`/icon-sets/id-list/${idList}`).then(() => {
            alertSwal('삭제가 완료 되었습니다.').then(() => {
                initIconSet();
            });

        });
    });
};
document
    .querySelector('#btnDeleteIconSet')
    .addEventListener('pointerup', deleteAllIconSet);
