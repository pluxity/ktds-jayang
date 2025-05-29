const data = {};

const dataManufacturer = (rowData) =>
    rowData
        .map((sop, index) => {

            const { id, no, managementCategory, sopName, mainManagerDivision, mainManagerName, mainManagerContact, subManagerDivision, subManagerName, subManagerContact, modifier } = sop;

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
                sopName,
                divisionHtml,
                nameHtml,
                contactHtml,
                modifier,
                gridjs.html(`
                    <button class="btn btn-warning modifyModalButton" data-bs-toggle="modal" data-bs-target="#sopModifyModal" data-id="${id}">수정</button>
                    <button class="btn btn-danger deleteButton"  onclick="deleteSop(${id})" data-id="${id}">삭제</button>`),
            ]
        });

const renderSop = (rawData = []) => {
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

const sopRegistModal = document.getElementById('sopRegisterModal');
sopRegistModal.addEventListener('shown.bs.modal', () => {
    document.getElementById('btnSopRegister').disabled = false;
    document.getElementById('btnSopRegister').innerHTML = '등록';
    document.getElementById('sopRegisterForm').reset();
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

const initSopList = () => {
    api.get('/sop').then((result) => {
        data.sop = result.data.result;
        renderSop(data.sop);
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
    .querySelector('#btnSopRegister')
    .addEventListener('pointerup', () => {
        const form = document.querySelector('#sopRegisterForm');
        const params = {};

        params.managementCategory = form.querySelector('#selectCategoryRegister').value;
        params.sopName = document.querySelector('#registerSopName')?.value
        params.mainManagerDivision = document.querySelector('#registerMainManagerDivision')?.value
        params.mainManagerName = document.querySelector('#registerMainManagerName')?.value
        params.mainManagerContact = document.querySelector('#registerMainManagerContact')?.value
        params.subManagerDivision = document.querySelector('#registerSubManagerDivision')?.value
        params.subManagerName = document.querySelector('#registerSubManagerName')?.value
        params.subManagerContact = document.querySelector('#registerSubManagerContact')?.value
        params.modifier = getCookie('USER_ID');

        console.log("form : ", params);
        api.post('/sop', params).then((res) => {
            alertSwal('등록되었습니다.').then(() => {
                window.location.reload();
            });
        });
    });


const modifyModal = document.querySelector('#sopModifyModal');
modifyModal.addEventListener('show.bs.modal', (event) => {
    const modifyForm = document.querySelector('#sopModifyForm');
    modifyModal.querySelector('#sopModifyForm').reset();

    const modifySopData = data.sop.find(
        (sop) => sop.id === Number(event.relatedTarget.dataset.id),
    );

    const categoryList = ['category1', 'category2', 'category3', 'category4'];
    const select = document.getElementById('selectCategoryModify');
    select.innerHTML = '<option class="selected" value="">카테고리 선택</option>';
    categoryList.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === modifySopData.managementCategory) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    modifyForm.dataset.id = modifySopData.id;
    event.currentTarget.dataset.id = modifySopData.id;
    modifyModal.querySelector('#selectCategoryModify').value = modifySopData.managementCategory;
    modifyModal.querySelector('#modifySopName').value = modifySopData.sopName;
    modifyModal.querySelector('#modifyMainManagerDivision').value = modifySopData.mainManagerDivision;
    modifyModal.querySelector('#modifyMainManagerName').value = modifySopData.mainManagerName;
    modifyModal.querySelector('#modifyMainManagerContact').value = modifySopData.mainManagerContact;
    modifyModal.querySelector('#modifySubManagerDivision').value = modifySopData.subManagerDivision;
    modifyModal.querySelector('#modifySubManagerName').value = modifySopData.subManagerName;
    modifyModal.querySelector('#modifySubManagerContact').value = modifySopData.subManagerContact;
});

const searchSopInfoList = () => {
    const searchType = document.getElementById('searchType').value;
    const searchName = document.getElementById('searchName').value.toLowerCase();

    const filteredList = data.sop.filter((sop) => sop[searchType].toLowerCase().indexOf(searchName) > -1)

    renderSop(filteredList);
}

// PUT
document
    .querySelector('#btnSopModify')
    .addEventListener('pointerup', () => {
        const form = document.querySelector('#sopModifyForm');
        const params = {};
        const id = Number(
            document.querySelector('#sopModifyForm').dataset.id,
        );

        params.managementCategory = document.querySelector('#selectCategoryModify')?.value
        params.sopName = document.querySelector('#modifySopName')?.value
        params.mainManagerDivision = document.querySelector('#modifyMainManagerDivision')?.value
        params.mainManagerName = document.querySelector('#modifyMainManagerName')?.value
        params.mainManagerContact = document.querySelector('#modifyMainManagerContact')?.value
        params.subManagerDivision = document.querySelector('#modifySubManagerDivision')?.value
        params.subManagerName = document.querySelector('#modifySubManagerName')?.value
        params.subManagerContact = document.querySelector('#modifySubManagerContact')?.value
        params.modifier = getCookie('USER_ID');
        api.put(`/sop/${id}`, params, {
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


const deleteSop = (sopId) => {
    const id = Number(sopId);
    confirmSwal('정말 삭제 하시겠습니까?').then(() => {
        api.delete(`/sop/${id}`).then(() => {
            alertSwal('삭제가 완료 되었습니다.').then(() => {
                initSopList();
            });
        });
    });
};

const deleteAllSop = () => {
    const idList = getSelectedId();
    if (idList.length === 0) {
        alertSwal('체크 된 항목이 존재하지 않습니다.');
        return;
    }
    confirmSwal('체크 하신 항목을 모두 삭제 하시겠습니까?').then(() => {
        api.delete(`/sop/id-list/${idList}`).then(() => {
            alertSwal('삭제가 완료 되었습니다.').then(() => {
                initSopList();
            });
        });
    });
};

document
    .querySelector('#btnDeleteSop')
    .addEventListener('pointerup', deleteAllSop);


document.getElementById('searchButton').onclick = () => searchSopInfoList();
document.addEventListener(
    'keydown',
    function (event) {
        if (event.keyCode === 13) {
            searchSopInfoList();
        }
    },
    true,
);

initSopList();