const data = {};

const dataManufacturer = (rowData) => {
    if (!rowData || rowData.length === 0) {
        return [
            [
                '',
                '',
                '',
                '',
                '',
                '',
                gridjs.html(`
                    <button type="button" class="btn btn-primary btn-md" id="btnRegisterSop" data-bs-toggle="modal" data-bs-target="#sopRegisterModal">
                        등록
                    </button>
                `)
            ]
        ];
    }

    return rowData.map((sop) => {
        const {
            id,
            sopName,
            mainManagerDivision,
            mainManagerName,
            mainManagerContact,
            subManagerDivision,
            subManagerName,
            subManagerContact,
            sopFile
        } = sop;

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

        const imageHtml = sopFile
            ? gridjs.html(`
                <a href="/2D/${sopFile.directory}/${sopFile.storedName}.${sopFile.extension}">
                    <img src="/2D/${sopFile.directory}/${sopFile.storedName}.${sopFile.extension}" style="width: 32px; height: 32px"/>
                </a>
            `)
            : gridjs.html('');

        return [
            id,
            sopName,
            divisionHtml,
            nameHtml,
            contactHtml,
            imageHtml,
            gridjs.html(`
                <button class="btn btn-warning modifyModalButton" data-bs-toggle="modal" data-bs-target="#sopModifyModal" data-id="${id}">수정</button>
                <button class="btn btn-danger deleteButton" onclick="deleteSop(${id})" data-id="${id}">삭제</button>
            `)
        ];
    });
};

const renderSop = (rawData = []) => {
    const dom = document.querySelector('#wrapper');

    const columns = [
        {
            id: 'id',
            name: 'id',
            hidden: true
        },
        {
            name: 'SOP명',
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
            name: '연락처',
            width: '12%',
        },
        {
            name: 'SOP 이미지',
            width: '10%',
        },
        {
            name: '관리',
            width: '10%',
        },
    ];

    const data = dataManufacturer(rawData);

    const option = {
        dom,
        columns,
        data,
        isPagination: true,
        withNumbering: false,
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
    .addEventListener('pointerup', async () => {
        const form = document.querySelector('#sopRegisterForm');
        const params = {};

        params.sopName = document.querySelector('#registerSopName')?.value
        params.mainManagerDivision = document.querySelector('#registerMainManagerDivision')?.value
        params.mainManagerName = document.querySelector('#registerMainManagerName')?.value
        params.mainManagerContact = document.querySelector('#registerMainManagerContact')?.value
        params.subManagerDivision = document.querySelector('#registerSubManagerDivision')?.value
        params.subManagerName = document.querySelector('#registerSubManagerName')?.value
        params.subManagerContact = document.querySelector('#registerSubManagerContact')?.value

        const fileInput = document.querySelector('#registerSopFile');

        const file = fileInput?.files[0];

        try {
            if (file) {
                const fileFormData = new FormData();
                fileFormData.append('file', file);

                const fileUploadResponse = await api.post('/sop/upload/file', fileFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const sopFileId = fileUploadResponse.data.result.id;
                params.sopFileId = sopFileId;
            }

            api.post('/sop', params).then((res) => {
                alertSwal('등록되었습니다.').then(() => {
                    window.location.reload();
                });
            });
        } catch (err) {
            console.error(err);
            alertSwal('등록 오류');
        }
    });


const modifyModal = document.querySelector('#sopModifyModal');
modifyModal.addEventListener('show.bs.modal', (event) => {
    const modifyForm = document.querySelector('#sopModifyForm');
    modifyModal.querySelector('#sopModifyForm').reset();

    const modifySopData = data.sop.find(
        (sop) => sop.id === Number(event.relatedTarget.dataset.id),
    );

    modifyForm.dataset.id = modifySopData.id;
    event.currentTarget.dataset.id = modifySopData.id;
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
    .addEventListener('pointerup', async () => {
        const form = document.querySelector('#sopModifyForm');
        const params = {};
        const id = Number(
            document.querySelector('#sopModifyForm').dataset.id,
        );

        params.sopName = document.querySelector('#modifySopName')?.value
        params.mainManagerDivision = document.querySelector('#modifyMainManagerDivision')?.value
        params.mainManagerName = document.querySelector('#modifyMainManagerName')?.value
        params.mainManagerContact = document.querySelector('#modifyMainManagerContact')?.value
        params.subManagerDivision = document.querySelector('#modifySubManagerDivision')?.value
        params.subManagerName = document.querySelector('#modifySubManagerName')?.value
        params.subManagerContact = document.querySelector('#modifySubManagerContact')?.value

        const fileInput = document.querySelector('#modifySopFile');
        const file = fileInput?.files?.[0];
        try {
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await api.post('/sop/upload/file', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                params.sopFileId = uploadRes.data.result.id;
            }

            await api.put(`/sop/${id}`, params, {
                headers: {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                },
            });
            alertSwal('수정이 완료 되었습니다.').then(() => window.location.reload());
        } catch (error) {
            console.error(error);
            alertSwal('수정 중 오류가 발생했습니다.');
        }

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

// document
//     .querySelector('#btnDeleteSop')
//     .addEventListener('pointerup', deleteAllSop);
//
//
// document.getElementById('searchButton').onclick = () => searchSopInfoList();
// document.addEventListener(
//     'keydown',
//     function (event) {
//         if (event.keyCode === 13) {
//             searchSopInfoList();
//         }
//     },
//     true,
// );

initSopList();