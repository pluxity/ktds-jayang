const data = {};

const dataManufacturer = (rowData) =>
    rowData
        .map((vendor, index) => {
            const { id, vendorName, representativeName, businessNumber, contactNumber, modifier } = vendor;

            return [
                id,
                vendorName,
                representativeName,
                businessNumber,
                contactNumber,
                modifier,
                gridjs.html(`
                    <button class="btn btn-warning modifyModalButton" data-bs-toggle="modal" data-bs-target="#vendorModifyModal" data-id="${id}">수정</button>
                    <button class="btn btn-danger deleteButton"  onclick="deleteVendor(${id})" data-id="${id}">삭제</button>`),
            ]
        });

const renderVendor = (rawData = []) => {
    const dom = document.querySelector('#wrapper');
    const columns = [
        {
            id: 'checkbox',
            name: '선택',
            width: '6%',
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
            name: '거래처명',
            width: '10%',
        },
        {
            name: '대표자명',
            width: '10%',
        },
        {
            name: '사업자번호',
            width: '12%',
        },
        {
            name: '연락처',
            width: '12%',
        },
        {
            name: '수정자',
            width: '10%',
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

const vendorRegistModal = document.getElementById('vendorRegisterModal');
vendorRegistModal.addEventListener('shown.bs.modal', () => {
    document.getElementById('btnVendorRegister').disabled = false;
    document.getElementById('btnVendorRegister').innerHTML = '등록';
    document.getElementById('vendorRegisterForm').reset();
});

const initVendorList = () => {
    api.get('/vendor').then((result) => {
        data.vendor = result.data.result;
        renderVendor(data.vendor);
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
    .querySelector('#btnVendorRegister')
    .addEventListener('pointerup', () => {
        const form = document.querySelector('#vendorRegisterForm');
        const params = {};

        params.vendorName = document.querySelector('#registerVendorName')?.value || null;
        params.representativeName = document.querySelector('#registerRepresentativeName')?.value || null;
        params.businessNumber = document.querySelector('#registerBusinessNumber')?.value || null;
        params.contactNumber = document.querySelector('#registerContactNumber')?.value || null;
        params.description = document.querySelector('#registerDescription')?.value || null;
        params.modifier = getCookie('USER_ID');

        console.log("form : ", params);
        api.post('/vendor', params).then((res) => {
            alertSwal('등록되었습니다.').then(() => {
                window.location.reload();
            });
        });
    });

// PUT
document
    .querySelector('#btnVendorModify')
    .addEventListener('pointerup', () => {
        const form = document.querySelector('#vendorModifyForm');
        const params = {};
        const id = Number(
            document.querySelector('#vendorModifyForm').dataset.id,
        );

        params.vendorName = document.querySelector('#modifyVendorName')?.value || null;
        params.representativeName = document.querySelector('#modifyRepresentativeName')?.value || null;
        params.businessNumber = document.querySelector('#modifyBusinessNumber')?.value || null;
        params.contactNumber = document.querySelector('#modifyContactNumber')?.value || null;
        params.description = document.querySelector('#modifyDescription')?.value || null;
        params.modifier = getCookie('USER_ID');
        api.put(`/vendor/${id}`, params, {
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

const deleteVendor = (vendorId) => {
    const id = Number(vendorId);
    confirmSwal('정말 삭제 하시겠습니까?').then(() => {
        api.delete(`/vendor/${id}`).then(() => {
            alertSwal('삭제가 완료 되었습니다.').then(() => {
                initVendorList();
            });
        });
    });
};

const deleteAllVendor = () => {
    const idList = getSelectedId();
    if (idList.length === 0) {
        alertSwal('체크 된 항목이 존재하지 않습니다.');
        return;
    }
    confirmSwal('체크 하신 항목을 모두 삭제 하시겠습니까?').then(() => {
        api.delete(`/vendor/id-list/${idList}`).then(() => {
            alertSwal('삭제가 완료 되었습니다.').then(() => {
                initVendorList();
            });
        });
    });
};

document
    .querySelector('#btnDeleteVendor')
    .addEventListener('pointerup', deleteAllVendor);

const modifyModal = document.querySelector('#vendorModifyModal');
modifyModal.addEventListener('show.bs.modal', (event) => {
    const modifyForm = document.querySelector('#vendorModifyForm');
    modifyModal.querySelector('#vendorModifyForm').reset();
    modifyForm.reset();
    const modifyVendorData = data.vendor.find(
        (vendor) => vendor.id === Number(event.relatedTarget.dataset.id),
    );

    modifyForm.dataset.id = modifyVendorData.id;
    event.currentTarget.dataset.id = modifyVendorData.id;
    modifyModal.querySelector('#modifyVendorName').value = modifyVendorData.vendorName;
    modifyModal.querySelector('#modifyRepresentativeName').value = modifyVendorData.representativeName;
    modifyModal.querySelector('#modifyBusinessNumber').value = modifyVendorData.businessNumber;
    modifyModal.querySelector('#modifyContactNumber').value = modifyVendorData.contactNumber;
    modifyModal.querySelector('#modifyDescription').value = modifyVendorData.description;
});

const searchVendorInfoList = () => {
    const searchType = document.getElementById('searchType').value;
    const searchName = document.getElementById('searchName').value.toLowerCase();

    const filteredList = data.vendor.filter((vendor) => vendor[searchType].toLowerCase().indexOf(searchName) > -1)

    renderVendor(filteredList);
}
document.getElementById('searchButton').onclick = () => searchVendorInfoList();
document.addEventListener(
    'keydown',
    function (event) {
        if (event.keyCode === 13) {
            searchVendorInfoList();
        }
    },
    true,
);

document
    .querySelector('#btnDeleteVendor')
    .addEventListener('pointerup', deleteAllVendor);
initVendorList();