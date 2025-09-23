let userGroupDataAll;
let buildingList = [];
let poiCategoryList = [];

const getUserGroupFindAll = (onComplete) => {
    api.get('/user-groups').then((res) => {
        userGroupDataAll = res.data.result;
        if(onComplete) onComplete();
    });
}

const getBuildingInfoList = () => {
    api.get('/buildings/all').then((res) => {
        buildingList = res.data.result;
    })
}
const getPoiCategoryList = () => {
    api.get('/poi-categories').then((res) => {
        poiCategoryList = res.data.result;
    })
}

getUserGroupFindAll(getUserGroupInfoList);
getBuildingInfoList();
getPoiCategoryList();

function getUserGroupInfoList() {
    const from = document.getElementById('searchFrom');
    const type = from.querySelector(`#searchType`).value;
    const name = from.querySelector(`#searchName`).value;

    let filter = userGroupDataAll.filter(userGroupData => userGroupData[type].toLowerCase().includes(name.toLowerCase()));

    const gridData = filter.map((data) => [
        data.id,
        gridjs.html(
            `<a data-bs-toggle="modal" data-bs-target="#userGroupModifyModal" id="showModifyModalButton" onclick="modifyUserGroupModal(${data.id})"> ${data.name}</a>`,
        ),
        data.groupType === 'NORMAL_ADMIN' ? '일반관리자' : '최종관리자',
        gridjs.html(
            `<button class="btn btn-primary modify me-1" data-bs-toggle="modal" data-bs-target="#userGroupRoleModifyModal" id="showModifyRoleModalButton" onclick="modifyUserRoleModal(${data.id})">권한</button>
            <button class="btn btn-warning modify me-1" data-bs-toggle="modal" data-bs-target="#userGroupModifyModal" id="showModifyModalButton" onclick="modifyUserGroupModal(${data.id})">수정</button>
            <button class="btn btn-danger delete"  onclick="deleteUserGroup(${data.id})" >삭제</button>`,
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
            hidden: true
        },
        {
            id: 'id',
            name: 'id',
            hidden: true,
        },
        {
            name: '이름',
            width: '15%',
        },
        {
            name: '그룹타입',
            width: '20%',
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
        data : gridData,
        isPagination : true,
        withNumbering: true
    }

    if (document.getElementById('wrapper').innerHTML === '') {
        createGrid(option);
    } else {
        resizeGrid(option);
    }
}

const userGroupRegistModal = document.getElementById('userGroupRegistModal');
userGroupRegistModal.addEventListener('shown.bs.modal', () => {
    document.getElementById('userGroupRegistFrm').reset();
});

const btnUserGroupRegist = document.getElementById('btnUserGroupRegist');
btnUserGroupRegist.onclick = () => {
    const form = document.getElementById('userGroupRegistFrm');
    if (!validationForm(form)) return;
    api.post('/user-groups', formToJSON(form)).then((res) => {
        alertSwal("등록되었습니다.");
        userGroupRegistModal.querySelector('.btn-close').click();
        getUserGroupFindAll(getUserGroupInfoList);
    });
};

function modifyUserGroupModal(id) {
    const frm = document.getElementById('userGroupModifyFrm');
    frm.reset();
    const resultData = userGroupDataAll.find(data => data.id === id);

    console.log("resultData : ", resultData);
    frm.querySelector('#modifyId').value = resultData.id;
    frm.querySelector('#modifyName').value = resultData.name;
    frm.querySelector('#modifyGroupType').value = resultData.groupType;
    frm.querySelector('#modifyDescription').value = resultData.description || '';
}

const tbody = document.getElementById("poiCategoryPermissionList");

document.getElementById("poiCategoryReadAll").addEventListener("change", e => {
    tbody.querySelectorAll('input[name="poiCategoriesRead"]').forEach(cb => cb.checked = e.target.checked);
});
document.getElementById("poiCategoryWriteAll").addEventListener("change", e => {
    tbody.querySelectorAll('input[name="poiCategoriesWrite"]').forEach(cb => cb.checked = e.target.checked);
});

function modifyUserRoleModal(id) {
    const frm = document.getElementById('userGroupRoleModifyFrm');
    frm.reset();
    const  resultData = userGroupDataAll.find(data => data.id === id);
    frm.querySelector('#roleModifyId').value = resultData.id;

    console.log("resultData : ", resultData);
    const buildingContainer = document.getElementById('buildingPermissionList');
    buildingContainer.innerHTML = '';
    buildingList.forEach(b => {
        const checked = resultData.buildingPermissions?.some(p => p.buildingId === b.id) ? 'checked' : '';
        const div = document.createElement('div');
        div.classList.add('form-check');
        div.innerHTML = `
            <input type="checkbox" class="form-check-input" id="building_${b.id}" 
                   name="buildings" value="${b.id}" ${checked}>
            <label class="form-check-label" for="building_${b.id}">${b.name}</label>
        `;
        buildingContainer.appendChild(div);
    });

    // 장비 권한 체크박스
    const poiContainer = document.getElementById('poiCategoryPermissionList');
    poiContainer.innerHTML = '';
    poiCategoryList.forEach(c => {
        const perm = resultData.categoryPermissions?.find(p => p.poiCategoryId === c.id);
        const readChecked = perm?.canRead ? 'checked' : '';
        const writeChecked = perm?.canWrite ? 'checked' : '';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${c.name}</td>
            <td class="text-center"><input type="checkbox" name="poiCategoriesRead" value="${c.id}" ${readChecked}></td>
            <td class="text-center"><input type="checkbox" name="poiCategoriesWrite" value="${c.id}" ${writeChecked}></td>
        `;
        poiContainer.appendChild(row);
    });

    ["Read","Write"].forEach(type => {
        const all = document.getElementById("poiCategory"+type+"All");
        if (!all) return;

        const selector = `#poiCategoryPermissionList input[name="poiCategories${type}"]`;

        all.onchange = e => {
            document.querySelectorAll(selector)
                .forEach(cb => cb.checked = e.target.checked);
        };

        document.querySelectorAll(selector).forEach(cb => {
            cb.onchange = () => {
                const total = document.querySelectorAll(selector).length;
                const checkedCount = document.querySelectorAll(selector + ":checked").length;
                all.checked = (total > 0 && total === checkedCount);
            };
        });

        const total = document.querySelectorAll(selector).length;
        const checkedCount = document.querySelectorAll(selector + ":checked").length;
        all.checked = (total > 0 && total === checkedCount);
    });

    // 메뉴 권한
    const menuContainer = document.getElementById('menuPermissionList');
    menuContainer.innerHTML = '';

    const menuPermissionList = [
        { key: 'building', label: '도면 관리' },
        { key: 'poi', label: '장비 관리' },
        { key: 'sop', label: 'SOP 관리' },
        { key: 'management', label: '업체 관리' },
        { key: 'notice', label: '공지사항 관리' },
        { key: 'user', label: '사용자 관리' }
    ];

    // const menuPermissionList = ['building', 'poi', 'sop', 'management', 'notice', 'user'];

    menuPermissionList.forEach(p => {
        const menuChecked = resultData.menuPermissions?.includes(p.key.toUpperCase()) ? 'checked' : '';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.label}</td>
            <td><input type="checkbox" name="menuPermissions" value="${p.key.toUpperCase()}" ${menuChecked}></td>
        `;
        menuContainer.appendChild(row);
    });

    const allMenu = document.getElementById("menuAll");
    if (allMenu) {
        const selector = `#menuPermissionList input[name="menuPermissions"]`;
        allMenu.onchange = e => {
            document.querySelectorAll(selector)
                .forEach(cb => cb.checked = e.target.checked);
        };

        document.querySelectorAll(selector).forEach(cb => {
            cb.onchange = () => {
                const total = document.querySelectorAll(selector).length;
                const checkedCount = document.querySelectorAll(selector + ":checked").length;
                allMenu.checked = (total > 0 && total === checkedCount);
            };
        });

        const total = document.querySelectorAll(selector).length;
        const checkedCount = document.querySelectorAll(selector + ":checked").length;
        allMenu.checked = (total > 0 && total === checkedCount);
    }
}

const btnRoleGroupModify = document.getElementById('btnUserGroupRoleModify');
btnRoleGroupModify.onclick = () => {
    const form = document.getElementById('userGroupRoleModifyFrm');
    if (!validationForm(form)) return;

    const groupId = form.querySelector('#roleModifyId').value;
    const buildingPermissions = Array.from(form.querySelectorAll('input[name="buildings"]:checked'))
        .map(cb => ({ buildingId: Number(cb.value) }));

    const categoryPermissions = poiCategoryList.map(c => {
        const canRead = form.querySelector(`input[name="poiCategoriesRead"][value="${c.id}"]`)?.checked || false;
        const canWrite = form.querySelector(`input[name="poiCategoriesWrite"][value="${c.id}"]`)?.checked || false;
        return {
            poiCategoryId: c.id,
            canRead: canRead,
            canWrite: canWrite,
            registeredBy: null
        };
    });

    // menu 권한
    const menuPermissions = Array.from(form.querySelectorAll('input[name="menuPermissions"]:checked'))
        .map(cb => cb.value.toUpperCase());

    const payload = {
        buildingPermissions: buildingPermissions,
        categoryPermissions: categoryPermissions,
        menuPermissions: menuPermissions
    };

    api.patch(`/user-groups/${groupId}/permissions`, payload).then((res) => {
        getUserGroupFindAll(getUserGroupInfoList);
        document.querySelector('#userGroupRoleModifyModal .btn-close').click();
        alertSwal("수정되었습니다.");
    });
};


const btnUserGroupModify = document.getElementById('btnUserGroupModify');
btnUserGroupModify.onclick = () => {
    const form = document.getElementById('userGroupModifyFrm');
    if (!validationForm(form)) return;
    api.patch(`/user-groups/${form.querySelector('#modifyId').value}`, formToJSON(form)).then((res) => {
        getUserGroupFindAll(getUserGroupInfoList);
        document.querySelector('#userGroupModifyModal .btn-close').click();
        alertSwal("수정되었습니다.");

    });
};

function deleteUserGroup(id) {
    confirmSwal('정말로 삭제 하시겠습니까').then(() => {
        api.delete(`/user-groups/${id}`).then(() => {
            getUserGroupFindAll(getUserGroupInfoList);
            alertSwal("삭제되었습니다.");
        });
    });
}

const searchButton = document.getElementById('searchButton');
searchButton.onclick = () => {
    getUserGroupInfoList();
};

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        getUserGroupInfoList();
    };
}, true);