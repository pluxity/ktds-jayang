let userDataAll;
let userGroupDataAll;

const getUserFindAll = (onComplete) => {
    api.get('/users').then((res) => {
        userDataAll = res.data.result;
        if(onComplete) onComplete();
    });
}

const getUserGroupFindAll = (onComplete) => {
    api.get('/user-groups').then((res) => {
        userGroupDataAll = res.data.result;
        if(onComplete) onComplete();
    });
}
getUserGroupFindAll(createSearchUserGroup);
getUserFindAll(getUserInfoList);

function getUserInfoList() {
    const from = document.getElementById('searchFrom');

    const type = from.querySelector(`#searchType`).value;
    const value = from.querySelector(`#searchName`).value;
    const groupId = from.querySelector(`#searchGroupId`).value;




    const filter = userDataAll.filter(user => user[type].toLowerCase().includes(value.toLowerCase()) && (groupId === '' ? true :  user.userGroupId === Number(groupId)));

    const gridData = filter.map((data) => [
        data.id,
        gridjs.html(
            `<a data-bs-toggle="modal" data-bs-target="#userModifyModal" id="showModifyModalButton" onclick="modifyUserModal(${data.id})">${data.username}</a>`,
        ),
        data.name,
        data.authorities[0].name,
        gridjs.html(
            `<button class="btn btn-warning modify me-1" data-bs-toggle="modal" data-bs-target="#userModifyModal" id="showModifyModalButton" onclick="modifyUserModal(${data.id})">수정</button>
            <button class="btn btn-danger delete"  onclick="deleteUser(${data.id})" >삭제</button>`,
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
            name: '권한',
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
    }

    if (document.getElementById('wrapper').innerHTML === '') {
        createGrid(option);
    } else {
        resizeGrid(option);
    }
}

const userRegistModal = document.getElementById('userRegistModal');
userRegistModal.addEventListener('shown.bs.modal', () => {
    document.getElementById('userRegistFrm').reset();

    let html = `<option value=''>선택</option>`;
    userGroupDataAll.forEach((resultData) => {
        html += `<option value='${resultData.id}'>${resultData.name}</option>`;
    });
    document.getElementById('registGroupId').innerHTML = html;

});

const btnUserRegist = document.getElementById('btnUserRegist');

btnUserRegist.onclick = () => {
    const form = document.getElementById('userRegistFrm');
    if (!validationForm(form)) return;

    if (form.querySelector('#registPassword').value) {
        const regex = /^.*(?=^.{8,16}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;
        if (form.querySelector('#registPassword').value.match(regex) == null) {
            alertSwal('비밀번호는 특수문자 / 문자 / 숫자 포함 형태의 8~16자리 이내로 입력해주세요.');
            form.querySelector('#registPassword').focus();
            return;
        }
    }

    if (
        form.querySelector('#registPassword').value !==
        form.querySelector('#registPasswordCheck').value
    ) {
        alertSwal('비밀번호가 일치하지 않습니다.');
        form.querySelector('#registPassword').focus();
        return;

    }

    const params = formToJSON(form);
    if (!form.querySelector('#resgistRole').checked) {
        params.role = 'USER';
    } else {
        params.role = 'ADMIN';
    }

    api.post('/users', params).then(() => {
        alertSwal('등록되었습니다.');
        userRegistModal.querySelector('.btn-close').click();
        getUserFindAll(getUserInfoList);

    });
};

function modifyUserModal(id) {
    const frm = document.getElementById('userModifyFrm');
    frm.reset();

    let userData = userDataAll.find(user => user.id === id);
    frm.querySelector('#modifyId').value = userData.id;
    frm.querySelector('#modifyNickname').value = userData.name;
    frm.querySelector('#modifyUsername').value = userData.username;
    frm.querySelector('#modifyPassword').value = '';
    if (userData.role === 'ADMIN') {
        frm.querySelector('#modifyRole').checked = true;
    }

    let html = `<option value=''>선택</option>`;

    userGroupDataAll.forEach((resultData) => {
        html += `<option value='${resultData.id}'>${resultData.name}</option>`;
    });
    frm.querySelector('#modifyGroupId').innerHTML = html;
    frm.querySelector('#modifyGroupId').value = userData.userGroupId;
}

const btnUserModify = document.getElementById('btnUserModify');
btnUserModify.onclick = () => {
    const form = document.getElementById('userModifyFrm');
    if (!validationForm(form)) return;

    if (form.querySelector('#modifyPassword').value) {
        const regex = /^.*(?=^.{8,16}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;
        if (form.querySelector('#modifyPassword').value.match(regex) == null) {
            alertSwal('비밀번호는 특수문자 / 문자 / 숫자 포함 형태의 8~16자리 이내로 입력해주세요.');
            form.querySelector('#modifyPassword').focus();
            return;
        }
    }

    if (
        form.querySelector('#modifyPassword').value !==
        form.querySelector('#modifyPasswordCheck').value
    ) {
        alertSwal('비밀번호가 일치하지 않습니다.');
        form.querySelector('#modifyPassword').focus();
        return;

    }

    const params = formToJSON(form);
    if (!form.querySelector('#modifyRole').checked) {
        params.role = 'USER';
    } else {
        params.role = 'ADMIN';
    }
    api.patch(
        `/users/${form.querySelector('#modifyId').value}`,
        params
    ).then(() => {
        alertSwal('수정되었습니다.');
        document.querySelector('#userModifyModal .btn-close').click();
        getUserFindAll(getUserInfoList);

    });
};

function deleteUser(id) {
    confirmSwal('정말로 삭제 하시겠습니까').then(() => {
        api.delete(`/users/${id}`).then(() => {
            alertSwal('삭제되었습니다.');
            getUserFindAll(getUserInfoList);
        });
    });

}

function createSearchUserGroup() {
    let html = `<option value=''>전체</option>`;
    userGroupDataAll.forEach((resultData) => {
        html += `<option value='${resultData.id}'>${resultData.name}</option>`;
    });
    document.getElementById('searchGroupId').innerHTML = html;
}

const searchButton = document.getElementById('searchButton');
searchButton.onclick = () => {
    getUserInfoList();
};


document.addEventListener(
    'keydown',
    function (event) {
        if (event.code === 'Enter') {
            getUserInfoList();
        }
    },
    true,
);
