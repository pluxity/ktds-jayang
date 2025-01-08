let userGroupDataAll;

const getUserGroupFindAll = (onComplete) => {
    api.get('/user-groups').then((res) => {
        userGroupDataAll = res.data.result;
        if(onComplete) onComplete();
    });
}
getUserGroupFindAll(getUserGroupInfoList);

function getUserGroupInfoList() {
    const from = document.getElementById('searchFrom');
    const type = from.querySelector(`#searchType`).value;
    const name = from.querySelector(`#searchName`).value;

    let filter = userGroupDataAll.filter(userGroupData => userGroupData[type].toLowerCase().includes(name.toLowerCase()));

    const gridData = filter.map((data) => [
        data.id,
        data.id,
        gridjs.html(
            `<a data-bs-toggle="modal" data-bs-target="#userGroupModifyModal" id="showModifyModalButton" onclick="modifyUserGroupModal(${data.id})"> ${data.name}</a>`,
        ),
        gridjs.html(
            `<button class="btn btn-warning modify me-1" data-bs-toggle="modal" data-bs-target="#userGroupModifyModal" id="showModifyModalButton" onclick="modifyUserGroupModal(${data.id})">수정</button>
            <button class="btn btn-danger delete"  onclick="deleteUserGroup(${data.id})" >삭제</button>`,
        ),
    ]);
    const columns = [
        {
            id: 'id',
            name: 'id',
            hidden: true,
        },
        {
            name: '아이디',
            width: '10%',
        },
        {
            name: '이름',
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
        data : gridData,
        isPagination : true,
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
    const  resultData = userGroupDataAll.find(data => data.id === id);

    frm.querySelector('#modifyId').value = resultData.id;
    frm.querySelector('#modifyName').value = resultData.name;
}

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