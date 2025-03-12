const data = {};
const RECORD_SIZE = 10;
let buildingList = [];

const getBuildingList = () => {
    api.get('/buildings').then((res) => {
        data.Buildings = res.data.result;
        buildingList = data.Buildings;
        const treeData = createBuildingTreeData(buildingList, "register");
        const treeContainer = document.getElementById("tree-container-register");
        treeContainer.innerHTML = "";
        treeContainer.appendChild(createTree(treeData, [], "register"));
    })
}

function createTree(data, selectedValue = [], type, selectedBuildings = []) {
    const ul = document.createElement("ul");
    ul.style.listStyle = "none";
    data.forEach(node => {
        const li = document.createElement("li");

        const toggleButton = document.createElement("span");
        if (node.id === `dt-${type}` || node.id === `ktds-${type}` || node.id === `indoor-${type}`) {

            toggleButton.textContent = "-"; // 기본은 펼쳐진 상태
            toggleButton.style.cursor = "pointer";
            toggleButton.style.marginRight = "5px";
            toggleButton.addEventListener("click", function () {
                const childUl = li.querySelector("ul");
                if (childUl) {
                    const isHidden = childUl.style.display === "none";
                    childUl.style.display = isHidden ? "block" : "none";
                    toggleButton.textContent = isHidden ? "-" : "+";
                }
            });
        } else {
            toggleButton.style.visibility = "hidden";
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = node.id;
        checkbox.classList.add("form-check-input");

        if (selectedValue.includes(String(node.id))) {
            checkbox.checked = true;
            selectedBuildings.push(node.id);
        }

        checkbox.addEventListener("change", function () {
            updateChildrenCheckboxes(li, checkbox.checked); // 하위 항목 체크 상태 변경
            updateParentCheckboxes(li); // 상위 항목 체크 상태 업데이트
            updateSelectedValues(type); // 선택된 값 반영
        });

        const label = document.createElement("label");
        label.textContent = node.text;

        li.appendChild(toggleButton);
        li.appendChild(checkbox);
        li.appendChild(label);

        if (node.children && node.children.length > 0) {
            const childUl = createTree(node.children, selectedValue, type, selectedBuildings);
            li.appendChild(childUl);
        }

        ul.appendChild(li);
    });

    if (type === "modify") {
        const selectedMapInput = document.getElementById("modifySelectedMap");
        if (selectedMapInput) {
            selectedMapInput.value = selectedBuildings.join(",");
        }
    }

    return ul;
}

function updateChildrenCheckboxes(parentLi, isChecked) {
    const checkboxes = parentLi.querySelectorAll("ul input[type='checkbox']");
    checkboxes.forEach(cb => cb.checked = isChecked);
}

function updateParentCheckboxes(childLi) {
    let parentLi = childLi.closest("ul").parentNode;
    while (parentLi && parentLi.tagName === "LI") {
        const parentCheckbox = parentLi.querySelector("input[type='checkbox']");
        if (parentCheckbox) {
            const siblingCheckboxes = parentLi.querySelectorAll("ul > li > input[type='checkbox']");
            const allChecked = Array.from(siblingCheckboxes).every(cb => cb.checked);
            const someChecked = Array.from(siblingCheckboxes).some(cb => cb.checked);

            if (allChecked) {
                parentCheckbox.checked = true;
                parentCheckbox.indeterminate = false; // 상위가 완전히 체크됨
            } else if (someChecked) {
                parentCheckbox.checked = false;
                parentCheckbox.indeterminate = true; // 일부만 체크됨
            } else {
                parentCheckbox.checked = false;
                parentCheckbox.indeterminate = false; // 아무것도 체크 안됨
            }
        }
        parentLi = parentLi.closest("ul").parentNode;
    }
}

function updateSelectedValues(type) {
    const selected = [];
    document.querySelectorAll(`#tree-container-${type} input[type='checkbox']:checked`)
        .forEach(checkbox => selected.push(checkbox.value));

    const selectedMapInput = document.getElementById(`${type}SelectedMap`);
    if (selectedMapInput) {
        const excludedParentIds = ["dt", "ktds", "indoor"];

        const filteredSelected = selected.filter(value => !excludedParentIds.includes(value) && !isNaN(value));
        selectedMapInput.value = filteredSelected.join(",");
    }
}

const createBuildingTreeData = (buildingList, type) => {
    return [
        {
            id: `dt-${type}`,
            text: "DT",
            children: [
                {
                    id: `ktds-${type}`,
                    text: "KT DS",
                    children: [
                        {
                            id: `indoor-${type}`,
                            text: "실내",
                            children: buildingList
                                .filter(building => building.isIndoor === "Y")
                                .map(building => ({
                                    id: `${building.id}`,
                                    text: building.name
                            }))
                        }
                    ]
                }
            ]
        }
    ];
};


const dataManufacturer = (rowData) =>
    rowData
        .map((notice, index) => {
        const { id, no, title, createdAt, expiredAt, isUrgent, isActive } = notice;
        const formatDate = (dateString) => {
            if (!dateString) return ''; // 값이 없을 경우 빈 문자열 반환
            const date = new Date(dateString);
            return date.toISOString().split('T')[0]; // "YYYY-MM-DD" 형식으로 변환
        };

        return [
            id,
            rowData.length - index,
            title,
            `${formatDate(createdAt)} ~ ${formatDate(expiredAt)}`,
            isUrgent === null ? 'N' : 'Y',
            gridjs.html(`
                    <input type="checkbox" name="isActive" id="isActiveCheck" class="form-check-input" title="활성화" required data-rules="required" data-tagname="활성화"
                    ${isActive === 'Y' ? 'checked' : ''} />`),
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
                // window.location.reload();
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
                // window.location.reload();
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

const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toISOString().split("T")[0];
};

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

    const buildingList = data.Buildings;
    const treeData = createBuildingTreeData(buildingList, "modify");
    const treeContainer = document.getElementById("tree-container-modify");
    treeContainer.innerHTML = ""; // 기존 트리 삭제 후 다시 생성
    treeContainer.appendChild(createTree(treeData, selectedMapValues, "modify"));
    const selectedMapInput = document.getElementById("modifySelectedMap");
    if (selectedMapInput) {
        selectedMapInput.value = modifyNoticeData.buildingIds.join(",");
    }

});

initNoticeList();
getBuildingList();