const data = {};
const RECORD_SIZE = 10;
let buildingList = [];

const getBuildingList = () => {
    api.get('/buildings').then((res) => {
        data.Buildings = res.data.result;
        buildingList = data.Buildings;
        const container = document.getElementById("tree-container-register");
        container.innerHTML = "";

        container.appendChild(
            createBuildingCheckboxes(buildingList, [], "register")
        );
    })
}

// select box로 변경
function createBuildingCheckboxes(buildingList, selectedValues = [], type) {
    const ul = document.createElement("ul");
    ul.style.listStyle = "none";
    ul.style.margin = "0";
    ul.style.padding = "0";

    const allLi = document.createElement("li");
    const allDiv = document.createElement("div");
    allDiv.classList.add("form-check");

    const allCheckbox = document.createElement("input");
    allCheckbox.type = "checkbox";
    allCheckbox.classList.add("form-check-input");
    allCheckbox.id = `${type}-building-all`;
    allCheckbox.value = "ALL";

    const allLabel = document.createElement("label");
    allLabel.classList.add("form-check-label");
    allLabel.setAttribute("for", `${type}-building-all`);
    allLabel.textContent = "전체";

    allDiv.appendChild(allCheckbox);
    allDiv.appendChild(allLabel);
    allLi.appendChild(allDiv);
    ul.appendChild(allLi);

    buildingList.forEach(building => {
        const li = document.createElement("li");
        const div = document.createElement("div");
        div.classList.add("form-check");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("form-check-input", `${type}-building-checkbox`);
        checkbox.id = `${type}-building-${building.id}`;
        checkbox.value = building.id;

        if (selectedValues.includes(String(building.id))) {
            checkbox.checked = true;
        }

        const label = document.createElement("label");
        label.classList.add("form-check-label");
        label.setAttribute("for", `${type}-building-${building.id}`);
        label.textContent = building.name;

        div.appendChild(checkbox);
        div.appendChild(label);
        li.appendChild(div);
        ul.appendChild(li);
    });

    const syncSelectedValues = () => {
        const buildingCheckboxes = ul.querySelectorAll(`.${type}-building-checkbox`);
        const selected = Array.from(buildingCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const inputId = type === "modify" ? "modifySelectedMap" : "registerSelectedMap";
        const selectedMapInput = document.getElementById(inputId);
        if (selectedMapInput) {
            selectedMapInput.value = selected.join(",");
        }
    };

    const buildingCheckboxes = ul.querySelectorAll(`.${type}-building-checkbox`);
    allCheckbox.addEventListener("change", () => {
        buildingCheckboxes.forEach(cb => cb.checked = allCheckbox.checked);
        syncSelectedValues();
    });
    buildingCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {
            const allChecked = Array.from(buildingCheckboxes).every(c => c.checked);
            allCheckbox.checked = allChecked;
            syncSelectedValues();
        });
    });

    syncSelectedValues();
    return ul;
}

const dataManufacturer = (rowData) =>
    rowData
        .map((notice, index) => {
        const { id, title, createdAt, expiredAt, isUrgent, isActive } = notice;
        const formatDate = (dateString) => {
            if (!dateString) return ''; // 값이 없을 경우 빈 문자열 반환
            const date = new Date(dateString);
            return date.toISOString().split('T')[0]; // "YYYY-MM-DD" 형식으로 변환
        };

        return [
            id,
            title,
            `${formatDate(createdAt)} ~ ${formatDate(expiredAt)}`,
            isUrgent ? 'Y' : 'N',
            gridjs.html(`
                    <div class="form-check form-switch" style="display: inline-block">
                        <input type="checkbox"
                           class="form-check-input isActiveToggle"
                           data-id="${id}"
                           ${isActive ? 'checked' : ''} />
                    </div>
                    `),
            gridjs.html(`
                    <button class="btn btn-warning modifyModalButton" data-bs-toggle="modal" data-bs-target="#noticeModifyModal" data-id="${id}">수정</button>
                    <button class="btn btn-danger deleteButton"  onclick="deleteNotice(${id})" data-id="${id}">삭제</button>`),
        ]
    });

const renderNotice = (rawData = []) => {
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
            name: '제목',
            width: '20%',
        },
        {
            name: '공지 적용 기간',
            width: '12%',
        },
        {
            name: '긴급',
            width: '6%',
        },
        {
            name: '활성화',
            width: '6%',
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
const initNoticeList = () => {
    api.get('/notices').then((result) => {
        data.notice = result.data.result;
        renderNotice(data.notice);
    });
};

const formatToLocalDateTime = (dateString) => {
    return dateString ? `${dateString}T00:00:00` : null;
};



// POST
document
    .querySelector('#btnNoticeRegister')
    .addEventListener('pointerup', () => {
        const form = document.querySelector('#noticeRegisterForm');
        const params = {};

        params.title = document.querySelector('#registerTitle')?.value || null;
        params.content = document.querySelector('#registerContent')?.value || null;
        params.createdAt = formatToLocalDateTime(document.querySelector('#registerStartDate')?.value);
        params.expiredAt = formatToLocalDateTime(document.querySelector('#registerEndDate')?.value);
        params.isUrgent = document.querySelector('#registerIsUrgent')?.checked || false;
        params.isActive = document.querySelector('#registerIsActive')?.checked || false;
        const selectedBuildings = document.querySelector('#registerSelectedMap')?.value || "";
        params.buildingIds = selectedBuildings ? selectedBuildings.split(",").map(Number) : [];

        api.post('/notices', params, {
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
        }).then(() => {
            alertSwal('등록되었습니다.').then(() => {
                window.location.reload();
            });
        });
    });

// PUT
document
    .querySelector('#btnNoticeModify')
    .addEventListener('pointerup', () => {
        const form = document.querySelector('#noticeModifyForm');
        const params = {};
        const id = Number(
            document.querySelector('#noticeModifyForm').dataset.id,
        );

        params.title = document.querySelector('#modifyTitle')?.value || null;
        params.content = document.querySelector('#modifyContent')?.value || null;
        params.createdAt = formatToLocalDateTime(document.querySelector('#modifyStartDate')?.value);
        params.expiredAt = formatToLocalDateTime(document.querySelector('#modifyEndDate')?.value);
        params.isUrgent = document.querySelector('#modifyIsUrgent')?.checked || false;
        params.isActive = document.querySelector('#modifyIsActive')?.checked || false;
        const selectedBuildings = document.querySelector('#modifySelectedMap')?.value || "";
        params.buildingIds = selectedBuildings ? selectedBuildings.split(",").map(Number) : [];
        api.put(`/notices/${id}`, params, {
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

const deleteNotice = (noticeId) => {
    const id = Number(noticeId);
    confirmSwal('정말 삭제 하시겠습니까?').then(() => {
        api.delete(`/notices/${id}`).then(() => {
            alertSwal('삭제가 완료 되었습니다.').then(() => {
                initNoticeList();
            });
        });
    });
};

const deleteAllNotice = () => {
    const idList = getSelectedId();
    if (idList.length === 0) {
        alertSwal('체크 된 항목이 존재하지 않습니다.');
        return;
    }
    confirmSwal('체크 하신 항목을 모두 삭제 하시겠습니까?').then(() => {
        api.delete(`/notices/id-list/${idList}`).then(() => {
            alertSwal('삭제가 완료 되었습니다.').then(() => {
                initNoticeList();
            });
        });
    });
};

document
    .querySelector('#btnDeleteNotice')
    .addEventListener('pointerup', deleteAllNotice);

const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toISOString().split("T")[0];
};

// register notice
const registerModal = document.querySelector('#noticeRegisterModal');
registerModal.addEventListener('show.bs.modal', () => {
    const registerForm = document.querySelector('#noticeRegisterForm');
    registerForm.reset();
});

const modifyModal = document.querySelector('#noticeModifyModal');
modifyModal.addEventListener('show.bs.modal', (event) => {
    const modifyForm = document.querySelector('#noticeModifyForm');
    modifyModal.querySelector('#noticeModifyForm').reset();
    modifyForm.reset();
    const modifyNoticeData = data.notice.find(
        (notice) => notice.id === Number(event.relatedTarget.dataset.id),
    );
    const selectedBuildings = [];
    modifyForm.dataset.id = modifyNoticeData.id;
    event.currentTarget.dataset.id = modifyNoticeData.id;
    modifyModal.querySelector('#modifyTitle').value = modifyNoticeData.title;
    modifyModal.querySelector('#modifyContent').value = modifyNoticeData.content;
    modifyModal.querySelector('#modifyStartDate').value = formatDateTime(modifyNoticeData.createdAt);
    modifyModal.querySelector('#modifyEndDate').value = formatDateTime(modifyNoticeData.expiredAt);
    modifyModal.querySelector('#modifyIsUrgent').checked = modifyNoticeData.isUrgent;
    modifyModal.querySelector('#modifyIsActive').checked = modifyNoticeData.isActive;

    const selectedMapValues = modifyNoticeData.buildingIds.map(String);

    const container = document.getElementById("tree-container-modify");
    container.innerHTML = "";

    container.appendChild(
        createBuildingCheckboxes(data.Buildings, selectedMapValues, "modify")
    );

    const selectedMapInput = document.getElementById("modifySelectedMap");
    if (selectedMapInput) {
        selectedMapInput.value = modifyNoticeData.buildingIds.join(",");
    }

});

const searchNoticeInfoList = () => {
    const searchName = document.getElementById('searchNoticeName').value.toLowerCase();

    const filteredList = data.notice.filter((notice) => {
        return typeof notice.title === 'string' && notice.title.toLowerCase().includes(searchName);
    })

    renderNotice(filteredList)
}

document.addEventListener('change', (event) => {
    if (event.target.classList.contains('isActiveToggle')) {
        const checkbox = event.target;
        const isActive = checkbox.checked;
        const noticeId = checkbox.dataset.id;

        api.patch(`/notices/${noticeId}/active?isActive=${isActive}`).then(() => {
            initNoticeList();
        }).catch(() => {
            checkbox.checked = !isActive;
        });
    }
})

document.getElementById('noticeSearchBtn').onclick = () => searchNoticeInfoList();
document.addEventListener(
    'keydown',
    function (event) {
        if (event.keyCode === 13) {
            searchNoticeInfoList();
        }
    },
    true,
);

initNoticeList();
getBuildingList();