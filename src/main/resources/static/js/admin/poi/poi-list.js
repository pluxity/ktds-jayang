const data = {};
const RECORD_SIZE = 10;

const dataManufacturer = (rowData) =>
    rowData.map((poi) => {
        const { id, name, code, buildingId, floorId, poiCategoryId, position } = poi;
        return [
            id,
            name,
            code,
            data.building.find(building => building.id === buildingId).name,
            data.building.find(building => building.id === buildingId)
                .floors.find(floor => floor.id === floorId).name,
            data.poiCategory.find(category => category.id === poiCategoryId).name,
            position === null ? 'N' : 'Y',
            gridjs.html(`
                    <button class="btn btn-warning modifyModalButton" data-bs-toggle="modal" data-bs-target="#poiModifyModal" data-id="${id}">수정</button>
                    <button class="btn btn-danger deleteButton"  onclick="deletePoi(${id})" data-id="${id}">삭제</button>`),
        ]
    });

const renderPoi = (rawData = []) => {
    const dom = document.querySelector('#wrapper');
    const columns = [
        {
            id: 'checkbox',
            name: '선택',
            width: '6%',
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
            name: 'POI 이름',
            width: '10%',
        },
        {
            name: 'POI 코드',
            width: '10%',
        },
        {
            name: '도면 이름',
            width: '10%',
        },
        {
            name: '층 이름',
            width: '10%',
        },
        {
            name: 'POI 카테고리 이름',
            width: '10%',
        },
        {
            name: '배치 여부',
            width: '5%',
        },
        {
            name: '관리',
            width: '8%',
        },
    ];
    const data = dataManufacturer(rawData) ?? [];
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

const getBuildingSelectTags = () => [
    document.querySelector('#selectBuildingIdRegister'),
    document.querySelector('#selectBuildingIdBatchRegister'),
    document.querySelector('#selectBuildingIdModify'),
    document.querySelector('.search-select-building'),
];

const getFloorSelectTags = () => [
    document.querySelector('#selectFloorIdRegister'),
    document.querySelector('#selectFloorIdBatchRegister'),
    document.querySelector('#selectFloorIdModify'),
    document.querySelector('.search-select-floor'),
];

const getCategorySelectTags = () => [
    document.querySelector('#selectPoiCategoryIdRegister'),
    document.querySelector('#selectPoiCategoryIdModify'),
    document.querySelector('.search-select-category'),
];

const removeAllChildElements = (selectTags) => {
    selectTags.forEach((select) => {
        while (select.childElementCount > 1) {
            select.removeChild(select.lastChild);
        }
    });
};

const addFloorOptionToSelect = (data, selectTag) => {
    data.forEach((floor) => {
        selectTag.forEach((select) => {
            select.appendChild(new Option(floor.name, floor.id));
        });
    });
};

const addOptionToSelect = (data, selectTag) => {
    data.forEach((d) => {
        selectTag.forEach((select) => {
            select.appendChild(new Option(d.name, d.id));
        });
    });
};

const initializeSelectTag = (data, selectTag) => {
    removeAllChildElements(selectTag);
    if(selectTag[0].id.indexOf('Floor') > -1) {
        addFloorOptionToSelect(data, selectTag);
    } else {
        addOptionToSelect(data, selectTag);
    }
};

const initializeBuildings = async () => {
    await api.get('/buildings').then(async (res) => {
        const {result: buildings} = res.data;
        data.building = [];

        for (const building of buildings) {
            for (const buildingSelectTag of getBuildingSelectTags()) {
                buildingSelectTag.appendChild(new Option(building.name, building.id));
            }
            const {data: fetchBuilding} = await api.get(`/buildings/${building.id}`);
            data.building.push(fetchBuilding.result);
        }
    });

    for (const buildingSelectTag of getBuildingSelectTags()) {
        buildingSelectTag.addEventListener('change', async () => {
            const buildingId = Number(buildingSelectTag.value);
            const building = data.building.find(
                (building) => building.id === buildingId,
            );
            if (!building) {
                removeAllChildElements(getFloorSelectTags());
                return;
            }
            initializeSelectTag(building.floors, getFloorSelectTags());
        });
    }

};

const initPoiCategory = async () => {
    await api.get('/poi-categories').then((result) => {
        data.poiCategory = result.data.result;
        initializeSelectTag(
            data.poiCategory,
            getCategorySelectTags(),
        );
    })
}

const initPoiList = () => {
    api.get('/poi').then((result) => {
        data.poi = result.data.result;
        renderPoi(data.poi);
    });
};

const initializePoiAndBuildingAndPoiCategory = async () => {
    await initializeBuildings();
    await initPoiCategory();
    await initPoiList();
};

const registerModal = document.querySelector('#poiRegisterModal');
registerModal.addEventListener('show.bs.modal', () => {
    registerModal.querySelector('form').reset();
    registerModal.querySelector('.selectCctv').classList.add('hidden');
});

const modifyModal = document.querySelector('#poiModifyModal');
modifyModal.addEventListener('show.bs.modal', async (event) => {
    const modifyPoiData = data.poi.find(
        (poi) => poi.id === Number(event.relatedTarget.dataset.id),
    );

    event.currentTarget.dataset.id = modifyPoiData.id;
    modifyModal.querySelector('#poiNameModify').value = modifyPoiData.name;
    modifyModal.querySelector('#poiCodeModify').value = modifyPoiData.code;

    const building = data.building.find(building => building.id === modifyPoiData.buildingId);
    modifyModal.querySelector('#selectBuildingIdModify').value = building.id;

    initializeSelectTag(building.floors,
        [modifyModal.querySelector('#selectFloorIdModify'),]);
    modifyModal.querySelector('#selectFloorIdModify').value =
        building.floors.find(floor => floor.id === modifyPoiData.floorId).id;

    modifyModal.querySelector('#selectPoiCategoryIdModify').value = modifyPoiData.poiCategoryId;

    const poiCategory = data.poiCategory.find((category) => category.id === modifyPoiData.poiCategoryId);

    const form = document.querySelector('#poiModifyForm');
    form.dataset.id = modifyPoiData.id;

    if(poiCategory.name.includes('센서')) {
        form.querySelector('.selectCctv').classList.remove('hidden');
        removeAllTags('Modify');
        addTags('Modify', modifyPoiData.poiCameras.map(camera => camera.code));
        renderCctvPoi(form);
    }
});

// POST and modify
[
    document.querySelector('#btnPoiRegister'),
    document.querySelector('#btnPoiModify'),
].forEach((button) => {
    button.addEventListener('pointerup', (event) => {
        let type;
        if (event.currentTarget.id === 'btnPoiRegister') {
            type = 'Register';
            const form = document.getElementById('poiRegisterForm');
            if (!validationForm(form)) return;
        } else if (event.currentTarget.id === 'btnPoiModify') {
            type = 'Modify';
            const form = document.getElementById('poiModifyForm');
            if (!validationForm(form)) return;
        }

        const params = {};

        params.buildingId = Number(document.querySelector(`#selectBuildingId${type}`).value);
        params.floorId = Number(document.querySelector(`#selectFloorId${type}`).value);
        params.poiCategoryId = Number(document.querySelector(`#selectPoiCategoryId${type}`).value);
        const poiCategory = data.poiCategory.find((poiCategory) =>
            poiCategory.id === params.poiCategoryId);
        params.iconSetId = poiCategory.iconSets[0].id;

        params.code = document.querySelector(`#poiCode${type}`).value;
        params.name = document.querySelector(`#poiName${type}`).value;

        if(poiCategory.name.includes('센서')) {
            params.poiCameraIds = data.poi.filter((poi) => getAllTagValues(type).indexOf(poi.code) > -1).map(poi => poi.id);
        }

        if (type === 'Register') {
            api.post('/poi', params, {
                headers: {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                },
            }).then(() => {
                alertSwal('등록이 완료 되었습니다.').then(() => {
                    document
                        .querySelector(
                            '#poiRegisterModal > div > div > div.modal-header > button',
                        )
                        .click();
                    initPoiList();
                    removeAllTags('Register');
                });
            });
        } else if (type === 'Modify') {
            const id = Number(
                document.querySelector('#poiModifyForm').dataset.id,
            );
            api.put(`/poi/${id}`, params, {
                headers: {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                },
            }).then(() => {
                alertSwal('수정이 완료 되었습니다.').then(() => {
                    document
                        .querySelector(
                            '#poiModifyModal > div > div > div.modal-header > button',
                        )
                        .click();
                    initPoiList();
                    removeAllTags('Modify');
                });
            });
        }
    });
});

// 삭제 submit
const deletePoi = (poiId) => {
    const id = Number(poiId);
    confirmSwal('정말 삭제 하시겠습니까?').then(() => {
        api.delete(`/poi/${id}`).then(() => {
            alertSwal('삭제가 완료 되었습니다.').then(() => {
                initPoiList();
            });
        });
    });
};

const deleteAllPoi = () => {
    const idList = getSelectedId();
    if (idList.length === 0) {
        alertSwal('체크 된 항목이 존재하지 않습니다.');
        return;
    }
    confirmSwal('체크 하신 항목을 모두 삭제 하시겠습니까?').then(() => {
        api.delete(`/poi/id-list/${idList}`).then(() => {
            alertSwal('삭제가 완료 되었습니다.').then(() => {
                initPoiList();
            });
        });
    });
};

document
    .querySelector('#btnDeletePoi')
    .addEventListener('pointerup', deleteAllPoi);

const unAllocatePoi = () => {
    const idList = getSelectedId();
    if (idList.length === 0) {
        alertSwal('체크 된 항목이 존재하지 않습니다.');
        return;
    }
    confirmSwal('체크 하신 항목을 모두 미배치로 변경 하시겠습니까?').then(
        () => {
            api.patch(`/poi/un-allocation/${idList}`).then(() => {
                alertSwal('미배치로 변경이\n완료 되었습니다.').then(() => {
                    initPoiList();
                });
            });
        },
    );
};
document
    .querySelector('#btnUnAllocatePoi')
    .addEventListener('pointerup', unAllocatePoi);

const searchPoi = () => {
    let poiList = data.poi;
    if (document.querySelector('#searchSelectBuilding').value !== '') {
        poiList = poiList.filter(
            (poi) =>
                poi.buildingId ===
                Number(document.querySelector('#searchSelectBuilding').value),
        );
    }

    if (document.querySelector('#searchSelectFloor').value !== '') {
        poiList = poiList.filter(
            (poi) =>
                poi.floorId ===
                Number(document.querySelector('#searchSelectFloor').value),
        );
    }

    if (document.querySelector('#searchSelectCategory').value !== '') {
        poiList = poiList.filter(
            (poi) =>
                poi.poiCategoryId ===
                Number(
                    document.querySelector('#searchSelectCategory').value,
                ),
        );
    }
    if (
        document.querySelector('#searchSelectKeyword').value === 'name' &&
        document.querySelector('#searchKeyword').value !== ''
    ) {
        poiList = poiList.filter((poi) =>
            poi.name.toLowerCase().includes(document.querySelector('#searchKeyword').value.toLowerCase()),
        );
    }
    if (
        document.querySelector('#searchSelectKeyword').value === 'code' &&
        document.querySelector('#searchKeyword').value !== ''
    ) {
        poiList = poiList.filter((poi) =>
            poi.code.toLowerCase().includes(
                document.querySelector('#searchKeyword').value.toLowerCase(),
            ),
        );
    }

    const filteredData = dataManufacturer(poiList) ?? [];
    const columns = [
        {
            id: 'checkbox',
            name: '체크',
            width: '6%',
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
            name: 'POI 이름',
            width: '10%',
        },
        {
            name: 'POI 코드',
            width: '10%',
        },
        {
            name: '도면 이름',
            width: '10%',
        },
        {
            name: '층 이름',
            width: '10%',
        },
        {
            name: 'POI 카테고리 이름',
            width: '10%',
        },
        {
            name: '배치 여부',
            width: '5%',
        },
        {
            name: '관리',
            width: '8%',
        },
    ];
    resizeGrid({ data: filteredData, columns });
};

// 검색
document.querySelector('#searchKeyword').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        searchPoi();
    }
});

document.querySelector('#searchButton').addEventListener('pointerup', () => {
    searchPoi();
});

document
    .querySelector('#btnBatchRegister')
    .addEventListener('pointerup', () => {
        document.getElementById('poiBatchRegisterForm').reset()
    });

document.getElementById('btnPoiBatchRegister')
    .addEventListener('pointerup', () => {
        const form = document.getElementById('poiBatchRegisterForm');
        if(!validationForm(form)) return;

        const formData = new FormData();
        formData.set('buildingId', document.getElementById('selectBuildingIdBatchRegister').value);
        formData.set('floorId', document.getElementById('selectFloorIdBatchRegister').value);
        formData.set('file', document.querySelector('#batchRegisterFile').files[0]);


        api.post('/poi/batch-register', formData).then((res) => {
            alertSwal('일괄등록이 완료 되었습니다.').then(() => {
                document
                    .querySelector(
                        '#poiBatchRegisterModal > div > div > div.modal-header > button',
                    )
                    .click();
                initPoiList();
            });
        }).catch(() => {
            document.querySelector('#batchRegisterFile').value = ''
        })
    })

const renderCctvPoi = (form, searchData = null) => {
    const {id: cctvCategoryId} = data.poiCategory.filter((category) =>category.name.toLowerCase().includes('CCTV'.toLowerCase()))[0];
    const buildingId = Number(form.querySelector('[name=buildingId]').value);
    const floorId = Number(form.querySelector('[name=floorId]').value);
    const tbody = form.querySelector('.searchCctvList table tbody');
    const tagName = form.id.includes('Register')? 'Register': 'Modify';
    if(buildingId === 0 || floorId === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="alert">도면, 층을 선택해주세요</td></tr>`;
    } else {
        let cctvPois;

        if(searchData) {
            cctvPois = searchData.filter((poi) =>
                poi.poiCategoryId === cctvCategoryId &&
                poi.buildingId === buildingId &&
                poi.floorId === floorId);
        } else {
            cctvPois = data.poi.filter((poi) =>
                poi.poiCategoryId === cctvCategoryId &&
                poi.buildingId === buildingId &&
                poi.floorId === floorId);
        }

        tbody.innerHTML = '';

        if(cctvPois.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="alert">데이터가 존재하지 않습니다.</td></tr>`;
            return;
        }

        cctvPois?.forEach((poi) => {
            tbody.innerHTML += `<tr>
                        <td style="text-align: center;">
                            <input type="checkbox" class="selectedCctv" name="selectedCctv" ${getAllTagValues(tagName).indexOf(poi.code)>-1? 'checked': ''} value="${poi.id}" data-poi-nm="${poi.name}" data-poi-code="${poi.code}"/>
                        </td>
                        <td>${poi.name}</td>
                        <td>${poi.code}</td>
                    </tr>`;
        })

        tbody.querySelectorAll('INPUT[type=checkbox]').forEach((checkbox) => {
            checkbox.addEventListener('click', (event) => {
                if(event.target.checked) {
                    if (tbody.querySelectorAll('INPUT[type=checkbox]:checked').length > 4) {
                        alert('CCTV는 최대 4개까지 선택가능합니다.');
                        event.target.checked = false;
                        return;
                    }
                    addTags(tagName, event.target.dataset.poiCode);
                } else {
                    removeTags(tagName, event.target.dataset.poiCode);
                }
            })
        })
    }
}
document.querySelectorAll('form select[name=poiCategoryId]').forEach((categorySelect) => {
    categorySelect.addEventListener('change', (event) => {
        const form = event.target.closest('form');
        const selectCctvArea = form.querySelector('.selectCctv');

        if(event.target.selectedOptions[0].innerText.includes('센서')) {
            selectCctvArea.classList.remove('hidden');
            if(form.id.includes('Register')) {
                removeAllTags('Register');
            }
            renderCctvPoi(form);

        } else {
            selectCctvArea.classList.add('hidden');
            form.querySelector('.searchCctvList tbody').innerHTML = '';
            if(form.id.includes('Register')) {
                removeAllTags('Register');
            }
        }
    })
})

document.querySelectorAll(
    '#selectBuildingIdRegister' +
    ',#selectBuildingIdModify' +
    ',#selectFloorIdRegister' +
    ',#selectFloorIdModify').forEach((select) => {
        select.addEventListener('change', (event) => {
            const form = event.target.closest('form');
            if(form.querySelector('[name=poiCategoryId]').selectedOptions[0].innerText.includes('센서')) {
                renderCctvPoi(form);
            }
        })
})

document.querySelectorAll('.searchText').forEach((searchInput) => {
    searchInput.addEventListener('keyup', (event) => {
        if(event.keyCode === 13 || event.key === 'Enter') {
            const form = event.target.closest('form');
            const searchType = event.target.previousElementSibling.value;
            const filteredPoi = data.poi.filter((poi) => poi[searchType].toLowerCase().includes(event.target.value.toLowerCase()));

            renderCctvPoi(form, filteredPoi);
        }
    })
})

const initializePoiCameraTags = () => {
    const option = {
        userInput: false,
        maxItems: 4,
    }

    createTagInput('Register', document.querySelector('#poiRegisterForm .cctvTag'), option, (e) => {
        const targetCode = e.detail.data.value;
        const form = document.querySelector('#poiRegisterForm');
        form.querySelector(`INPUT[type=checkbox][data-poi-code='${targetCode}']`).checked = false;
    });

    createTagInput('Modify', document.querySelector('#poiModifyForm .cctvTag'), option, (e) => {
        const targetCode = e.detail.data.value;
        const form = document.querySelector('#poiModifyForm');
        form.querySelector(`INPUT[type=checkbox][data-poi-code='${targetCode}']`).checked = false;
    });


    document.querySelectorAll('tags').forEach(tag => tag.style.width = '100%');
}

window.addEventListener('load', () => {
    initializePoiAndBuildingAndPoiCategory();
    initializePoiCameraTags();
});

document.getElementById('btnDownloadSampleFile').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = '/static/sample/poi-sample.xlsx';
    link.download = 'poi-sample.xlsx';
    link.click();
});