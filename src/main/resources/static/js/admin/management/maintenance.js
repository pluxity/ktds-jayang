const data = {};

const dataManufacturer = (rowData) =>
    rowData
        .map((maintenance, index) => {

            const { id, no, managementCategory, maintenanceName, mainManagerDivision, mainManagerName, mainManagerContact, subManagerDivision, subManagerName, subManagerContact, modifier } = maintenance;

            const divisionHtml = gridjs.html(`
              <div>(정)${mainManagerDivision}</div>
              <div>(부)${subManagerDivision}</div>
            `);

            const nameHtml = gridjs.html(`
              <div>(정)${mainManagerName}</div>
              <div>(부)${subManagerName}</div>
            `);

            const contactHtml = gridjs.html(`
              <div>(정)${mainManagerContact}</div>
              <div>(부)${subManagerContact}</div>
            `);


            return [
                id,
                rowData.length - index,
                managementCategory,
                maintenanceName,
                divisionHtml,
                nameHtml,
                contactHtml,
                modifier,
                gridjs.html(`
                    <button class="btn btn-warning modifyModalButton" data-bs-toggle="modal" data-bs-target="#maintenanceModifyModal" data-id="${id}">수정</button>
                    <button class="btn btn-danger deleteButton"  onclick="deleteMaintenance(${id})" data-id="${id}">삭제</button>`),
            ]
        });

const renderMaintenance = (rawData = []) => {
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
            name: '번호',
            width: '6%',
        },
        {
            name: '카테고리명',
            width: '10%',
        },
        {
            name: '유지보수명',
            width: '10%',
        },
        {
            name: '담당자 소속',
            width: '10%',
        },
        {
            name: '담당자',
            width: '12%',
        },
        {
            name: '담당자 연락처',
            width: '12%',
        },
        {
            name: '수정자',
            width: '10%',
        },
        {
            name: '관리',
            width: '10%',
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

const maintenanceRegistModal = document.getElementById('maintenanceRegisterModal');
maintenanceRegistModal.addEventListener('shown.bs.modal', () => {
    document.getElementById('btnMaintenanceRegister').disabled = false;
    document.getElementById('btnMaintenanceRegister').innerHTML = '등록';
    document.getElementById('maintenanceRegisterForm').reset();
    const categoryList = ['category1', 'category2', 'category3', 'category4']
    const select = document.getElementById('selectCategoryRegister');
    select.innerHTML = '<option class="selected" value="">카테고리 선택</option>';
    categoryList.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
});

const initMaintenanceList = () => {
    api.get('/maintenance').then((result) => {
        data.maintenance = result.data.result;
        renderMaintenance(data.maintenance);
    });
};

function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
}

// POST
document
    .querySelector('#btnMaintenanceRegister')
    .addEventListener('pointerup', () => {
        const form = document.querySelector('#maintenanceRegisterForm');
        const params = {};

        params.managementCategory = form.querySelector('#selectCategoryRegister').value;
        params.maintenanceName = document.querySelector('#registerMaintenanceName')?.value
        params.mainManagerDivision = document.querySelector('#registerMainManagerDivision')?.value
        params.mainManagerName = document.querySelector('#registerMainManagerName')?.value
        params.mainManagerContact = document.querySelector('#registerMainManagerContact')?.value
        params.subManagerDivision = document.querySelector('#registerSubManagerDivision')?.value
        params.subManagerName = document.querySelector('#registerSubManagerName')?.value
        params.subManagerContact = document.querySelector('#registerSubManagerContact')?.value
        params.modifier = getCookie('USER_ID');

        console.log("form : ", params);
        api.post('/maintenance', params).then((res) => {
            alertSwal('등록되었습니다.').then(() => {
                window.location.reload();
            });
        });
    });


const modifyModal = document.querySelector('#maintenanceModifyModal');
modifyModal.addEventListener('show.bs.modal', (event) => {
    const modifyForm = document.querySelector('#maintenanceModifyForm');
    modifyModal.querySelector('#maintenanceModifyForm').reset();

    const modifyMaintenanceData = data.maintenance.find(
        (maintenance) => maintenance.id === Number(event.relatedTarget.dataset.id),
    );

    const categoryList = ['category1', 'category2', 'category3', 'category4'];
    const select = document.getElementById('selectCategoryModify');
    select.innerHTML = '<option class="selected" value="">카테고리 선택</option>';
    categoryList.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === modifyMaintenanceData.managementCategory) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    modifyForm.dataset.id = modifyMaintenanceData.id;
    event.currentTarget.dataset.id = modifyMaintenanceData.id;
    modifyModal.querySelector('#selectCategoryModify').value = modifyMaintenanceData.managementCategory;
    modifyModal.querySelector('#modifyMaintenanceName').value = modifyMaintenanceData.maintenanceName;
    modifyModal.querySelector('#modifyMainManagerDivision').value = modifyMaintenanceData.mainManagerDivision;
    modifyModal.querySelector('#modifyMainManagerName').value = modifyMaintenanceData.mainManagerName;
    modifyModal.querySelector('#modifyMainManagerContact').value = modifyMaintenanceData.mainManagerContact;
    modifyModal.querySelector('#modifySubManagerDivision').value = modifyMaintenanceData.subManagerDivision;
    modifyModal.querySelector('#modifySubManagerName').value = modifyMaintenanceData.subManagerName;
    modifyModal.querySelector('#modifySubManagerContact').value = modifyMaintenanceData.subManagerContact;
});

const searchMaintenanceInfoList = () => {
    const searchType = document.getElementById('searchType').value;
    const searchName = document.getElementById('searchName').value.toLowerCase();

    const filteredList = data.maintenance.filter((maintenance) => maintenance[searchType].toLowerCase().indexOf(searchName) > -1)

    renderMaintenance(filteredList);
}

// PUT
document
    .querySelector('#btnMaintenanceModify')
    .addEventListener('pointerup', () => {
        const form = document.querySelector('#maintenanceModifyForm');
        const params = {};
        const id = Number(
            document.querySelector('#maintenanceModifyForm').dataset.id,
        );

        params.managementCategory = document.querySelector('#selectCategoryModify')?.value
        params.maintenanceName = document.querySelector('#modifyMaintenanceName')?.value
        params.mainManagerDivision = document.querySelector('#modifyMainManagerDivision')?.value
        params.mainManagerName = document.querySelector('#modifyMainManagerName')?.value
        params.mainManagerContact = document.querySelector('#modifyMainManagerContact')?.value
        params.subManagerDivision = document.querySelector('#modifySubManagerDivision')?.value
        params.subManagerName = document.querySelector('#modifySubManagerName')?.value
        params.subManagerContact = document.querySelector('#modifySubManagerContact')?.value
        params.modifier = getCookie('USER_ID');
        api.put(`/maintenance/${id}`, params, {
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
        }).then(() => {
            alertSwal('수정이 완료 되었습니다.').then(() => {
                window.location.reload();
            });
        });
    });


const deleteMaintenance = (maintenanceId) => {
    const id = Number(maintenanceId);
    confirmSwal('정말 삭제 하시겠습니까?').then(() => {
        api.delete(`/maintenance/${id}`).then(() => {
            alertSwal('삭제가 완료 되었습니다.').then(() => {
                initMaintenanceList();
            });
        });
    });
};

const deleteAllMaintenance = () => {
    const idList = getSelectedId();
    if (idList.length === 0) {
        alertSwal('체크 된 항목이 존재하지 않습니다.');
        return;
    }
    confirmSwal('체크 하신 항목을 모두 삭제 하시겠습니까?').then(() => {
        api.delete(`/maintenance/id-list/${idList}`).then(() => {
            alertSwal('삭제가 완료 되었습니다.').then(() => {
                initMaintenanceList();
            });
        });
    });
};

document
    .querySelector('#btnDeleteMaintenance')
    .addEventListener('pointerup', deleteAllMaintenance);


document.getElementById('searchButton').onclick = () => searchMaintenanceInfoList();
document.addEventListener(
    'keydown',
    function (event) {
        if (event.keyCode === 13) {
            searchMaintenanceInfoList();
        }
    },
    true,
);

initMaintenanceList();