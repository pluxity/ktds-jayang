const data = {};

async function initializeIconSetInSelect() {
    await api.get('/icon-sets').then((result) => {
        data.iconSet = result.data.result;
        const iconSetSelectTagInRegister =
            document.querySelector('#registerIconSetId');
        const iconSetSelectTagInModify =
            document.querySelector('#modifyIconSetId');
        data.iconSet.forEach((iconset) => {
            iconSetSelectTagInRegister.appendChild(
                new Option(iconset.name, iconset.id),
            );
            iconSetSelectTagInModify.appendChild(
                new Option(iconset.name, iconset.id),
            );
        });
    });
}

document.getElementById('poiMiddleCategoryRegisterModal')
    .addEventListener('shown.bs.modal', function () {
        document.getElementById('poiMiddleCategoryRegisterForm').reset();
        const categorySelect = document.getElementById('category1');
        const selectedOption = categorySelect.options[categorySelect.selectedIndex];
        if (selectedOption) {
            document.getElementById('middleRegisterMajorId').value = selectedOption.value;
        }
    });

const getPoiCategoryInfoList = async () => {
    await api.get('/poi-categories').then((res) => {
        const {result: resData} = res.data;
        data.poiCategory = resData;

        // 대분류 select추가
        const categorySelectTagInRegister =
            document.querySelector('#middleRegisterMajorId');
        const categorySelectTagInModify =
            document.querySelector('#middleModifyMajorId');
        data.poiCategory.forEach(category => {
            categorySelectTagInRegister.appendChild(
                new Option(category.name, category.id),
            );
            categorySelectTagInModify.appendChild(
                new Option(category.name, category.id),
            );
        })

        let html = '';

        let optionHtml = '';

        resData.forEach((poiCategory, index) => {
            let selected = '';
            if (index === 0) selected = 'selected';
            optionHtml += `<option value="${poiCategory.id}" ${selected}>${poiCategory.name}</option>`;
        });

        if (resData.length === 0)
            optionHtml =
                '<option disabled>조회된 내용이 없습니다.</option>';

        html += `<div id="categoryFlex" class="d-flex">
                 
                    <div class="col-md-4 bg-light">
                        <h2>대분류</h2>
                        <div class="form-group mb-1">
                            <select class="form-select category" id="category1" size="15" name="category1">
                                ${optionHtml}
                            </select>
                        </div>
                        <div class="float-left">
                        </div>
                        <div class="float-right">
                            <i class="cursor-pointer fa-lg fa-regular fa-square-plus" data-bs-toggle="modal" data-bs-target="#poiCategoryRegisterModal"></i>
                            <i class="cursor-pointer fa-lg fa-regular fa-square-minus" onclick="minusCategory();"></i>
                            <i class="cursor-pointer fa-lg fa-regular fa-square-check" onclick="modifyCategory(this);"></i>
                        </div>
                    </div>
<!--                    <div id="middleCategoryContainer"></div>-->
                </div>
                `;

        document.getElementById('category').innerHTML = html;
        // feather.replace();
    });

    await initializeIconSetInSelect();
    // 중분류에 전체 리스트 다나오게
    await getPoiMiddleCategoryInfoList();
};

// add middleCategory
const getPoiMiddleCategoryInfoList = async () => {
    await api.get('/poi-middle-categories').then((res) => {
        const {result: resData} = res.data;
        data.poiMiddleCategory = resData;

        let optionHtml = '';

        resData.forEach((poiMiddleCategory, index) => {
            let selected = '';
            if (index === 0) selected = 'selected';
            optionHtml += `<option value="${poiMiddleCategory.id}" ${selected}>${poiMiddleCategory.name}</option>`;
        });

        if (resData.length === 0)
            optionHtml =
                '<option disabled>조회된 내용이 없습니다.</option>';

        let middleCategoryHtml = `<div class="col-md-4 bg-light" id="middleCategoryContainer">
                        <h2>중분류</h2>
                        <div class="form-group mb-1">
                            <select class="form-select category" id="category2" size="15" name="category1">
                                ${optionHtml}
                            </select>
                        </div>
                        <div class="float-left">
                        </div>
                        <div class="float-right">
                            <i class="cursor-pointer fa-lg fa-regular fa-square-plus" data-bs-toggle="modal" data-bs-target="#poiMiddleCategoryRegisterModal"></i>
                            <i class="cursor-pointer fa-lg fa-regular fa-square-minus" onclick="minusMiddleCategory();"></i>
                            <i class="cursor-pointer fa-lg fa-regular fa-square-check" onclick="modifyMiddleCategory(this);"></i>
                        </div>
                    </div>
                `;

        document.getElementById('categoryFlex').innerHTML += middleCategoryHtml;

        const updateMiddleCategoryOptions = () => {
            const selectedMajorId = document.getElementById('category1').value;

            const filteredMiddleCategories = data.poiMiddleCategory.filter(
                middle => middle.poiCategory.id == selectedMajorId
            );

            let optionHtml = '';
            if (filteredMiddleCategories.length > 0) {
                filteredMiddleCategories.forEach((item, index) => {
                    const selected = index === 0 ? 'selected' : '';
                    optionHtml += `<option value="${item.id}" ${selected}>${item.name}</option>`;
                });
            } else {
                optionHtml = '<option disabled>조회된 내용이 없습니다.</option>';
            }
            document.getElementById('category2').innerHTML = optionHtml;
        };

        updateMiddleCategoryOptions();

        document.getElementById('category1').addEventListener('change', updateMiddleCategoryOptions);
    });

    // await initializeIconSetInSelect();
};

const minusCategory = () => {
    const selectedCategory = document.querySelector('#category1 option:checked');

    if (selectedCategory === null || selectedCategory.value === '' || selectedCategory.value === undefined) {
        alertSwal('선택된 내용이 없습니다.');
        return;
    }


    api.delete(`/poi-categories/${selectedCategory.value}`).then((res) => {
        const { code } = res.data;
        alertSwal('삭제되었습니다.').then((res) => {
            window.location.reload();
        });
    });
};

const modifyCategory = () => {
    const selectedCategory = document.querySelector('#category1 option:checked');

    if (selectedCategory === null || selectedCategory.value === '' || selectedCategory.value === undefined) {
        alertSwal('선택된 내용이 없습니다.');
        return;
    }

    const poiCategory = data.poiCategory.find(
        (category) => category.id === Number(selectedCategory.value),
    );

    const modal = document.getElementById('poiCategoryModifyModal');

    modal.querySelector('#modifyId').value = poiCategory.id;
    modal.querySelector('#modifyName').value = poiCategory.name;
    modal.querySelector('#modifyIconSetId').value =
        poiCategory.iconSets[0].id ?? '';

    let myModal = new bootstrap.Modal(document.getElementById('poiCategoryModifyModal'), {
        keyboard: false
    });
    myModal.show();
};

const minusMiddleCategory = () => {
    const selectedMiddleCategory = document.querySelector('#category2 option:checked');

    if (selectedMiddleCategory === null || selectedMiddleCategory.value === '' || selectedMiddleCategory.value === undefined) {
        alertSwal('선택된 내용이 없습니다.');
        return;
    }


    api.delete(`/poi-middle-categories/${selectedMiddleCategory.value}`).then((res) => {
        const { code } = res.data;
        alertSwal('삭제되었습니다.').then((res) => {
            window.location.reload();
        });
    });
};


const modifyMiddleCategory = () => {
    const selectedCategory = document.querySelector('#category2 option:checked');

    if (selectedCategory === null || selectedCategory.value === '' || selectedCategory.value === undefined) {
        alertSwal('선택된 내용이 없습니다.');
        return;
    }

    const poiMiddleCategory = data.poiMiddleCategory.find(
        (category) => category.id === Number(selectedCategory.value),
    );

    const modal = document.getElementById('poiMiddleCategoryModifyModal');

    modal.querySelector('#middleModifyId').value = poiMiddleCategory.id;
    modal.querySelector('#middleModifyName').value = poiMiddleCategory.name;
    modal.querySelector('#middleModifyMajorId').value =
        poiMiddleCategory.poiCategory.id ?? '';

    let myModal = new bootstrap.Modal(document.getElementById('poiMiddleCategoryModifyModal'), {
        keyboard: false
    });
    myModal.show();
};

getPoiCategoryInfoList();
const btnPoiCategoryRegister = document.getElementById(
    'btnPoiCategoryRegister',
);
btnPoiCategoryRegister.onclick = () => {
    const form = document.getElementById('poiCategoryRegisterForm');
    const formData = new FormData(form);

    if (!validationForm(form)) return;

    formData.set('iconSetIds[]', [document.getElementById('registerIconSetId').value]);
    formData.delete('iconSetId');

    api.post('/poi-categories', formData, {
        headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
        },
    }).then(() => {
        alertSwal('등록되었습니다.').then(() => {
            window.location.reload();
        });
    });
};
const btnPoiCategoryModify = document.getElementById('btnPoiCategoryModify');
btnPoiCategoryModify.onclick = () => {
    const form = document.getElementById('poiCategoryModifyForm');
    const formData = new FormData(form);

    if (!validationForm(form)) return;

    const id = Number(
        document
            .getElementById('poiCategoryModifyForm')
            .querySelector('#modifyId').value,
    );

    formData.set('iconSetIds[]', [document.getElementById('modifyIconSetId').value]);
    formData.delete('iconSetId');

    api.put(`/poi-categories/${id}`, formData, {
        headers: {
            'Content-Type': 'application/json',
                accept: 'application/json',
        },
    }).then(() => {
        alertSwal('수정이 완료 되었습니다.').then(() => {
            window.location.reload();
        });
    });
};

const modifyModal = document.getElementById('poiCategoryModifyModal');
modifyModal.addEventListener('shown.bs.modal', () => {});

const registerModal = document.getElementById('poiCategoryRegisterModal');
registerModal.addEventListener('shown.bs.modal', () => {
    registerModal.querySelector('form').reset();
});

// 추가
const btnPoiMiddleCategoryRegister = document.getElementById(
    'btnPoiMiddleCategoryRegister',
);
btnPoiMiddleCategoryRegister.onclick = () => {
    const form = document.getElementById('poiMiddleCategoryRegisterForm');
    const formData = new FormData(form);

    if (!validationForm(form)) return;

    formData.set('poiCategoryIds[]', [document.getElementById('middleRegisterMajorId').value]);
    formData.delete('poiCategoryId');

    api.post('/poi-middle-categories', formData, {
        headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
        },
    }).then(() => {
        alertSwal('등록되었습니다.').then(() => {
            window.location.reload();
        });
    });
};