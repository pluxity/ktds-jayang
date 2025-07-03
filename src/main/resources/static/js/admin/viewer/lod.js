// lod 설정폼
document.getElementById('btnLodSetForm').onclick = () => {

    ['#lodTab1 > table > tbody', '#lodTab2 > table > tbody'].forEach((selector, i) => {
        const tbody = document.querySelector(selector);
        tbody.querySelectorAll(i === 0 ? '.poiSize' : '.lodType').forEach(e => e.remove());

        PoiCategoryManager.findAll().forEach((category) => {
            const middleCategories = PoiMiddleCategoryManager.findByCategoryId(category.id); // 예시
        
            middleCategories.forEach((middle, idx) => {
                const tr = document.createElement('tr');
                tr.classList.add(i === 0 ? 'poiSize' : 'lodType');

                if (idx === 0) {
                    const tdCategory = document.createElement('td');
                    tdCategory.classList.add('category1No');
                    tdCategory.innerHTML = category.name;
                    tdCategory.rowSpan = middleCategories.length;
                    tr.appendChild(tdCategory);
                }
                // 중분류
                const tdMiddle = document.createElement('td');
                tdMiddle.classList.add('middleCategory');
                tdMiddle.innerHTML = middle.name;
                tr.appendChild(tdMiddle);
        
                // 나머지 lodFormTable1Add(tr) 등 옵션 칸 추가
                i === 0 ? lodFormTable1Add(tr) : lodFormTable2Add(tr);
        
                tbody.appendChild(tr);
            });
        });
    });

    const lodSetFrm = document.getElementById('lodSetFrm');
    const { lod } = BuildingManager.findById(BUILDING_ID);

    lodSetFrm.querySelectorAll('.nav-link')[0].click();
    lodSetFrm.querySelector('[name="buildingId"]').value = BUILDING_ID;

    if (!lod) {
        lodSetFrm.reset();
        const levelCnt = lodSetFrm.querySelector('#levelCnt');
        levelCnt.value = 3;
        levelCnt.dispatchEvent(new Event('change'));
    } else {
        const { maxDistance, usedLodCount, data } = lod;
        lodSetFrm.querySelector('#maxDist').value = maxDistance === undefined? '': maxDistance;
        const levelCnt = lodSetFrm.querySelector('#levelCnt');
        levelCnt.value = usedLodCount === undefined? 3: usedLodCount;
        levelCnt.dispatchEvent(new Event('change'));

        lodSetFrm.querySelectorAll('tr.poiSize, tr.lodType').forEach((tr) => {
            const div = tr.querySelector('.category1No div');
            if (!div) return;
            const category1No = div.id;
            const relevantLodData = data.filter(row => row.category1No === category1No)[0];

            for (const id in relevantLodData) {
                if ((id.includes('lodType') || id.includes('iconSize')) && tr.querySelector(`#${id}`)) {
                    tr.querySelector(`#${id}`).value = relevantLodData[id];
                }
            }
        });
    }

    const myModal = new bootstrap.Modal(document.getElementById('lodSetModal'), {keyboard: false});
    myModal.show();

    lodSetFrm.querySelectorAll('fieldset > ul > li').forEach((li) => {
        li.onclick = (event) => {
            const activeLink = lodSetFrm.querySelector('fieldset > ul > li > a.active');
            if (event.target.name === activeLink.name) return false;

            document.querySelector(`#${activeLink.name}`).classList.remove('show', 'active');
            activeLink.classList.remove('active');

            event.target.classList.add('active');
            document.querySelector(`#${event.target.name}`).classList.add('show', 'active');
        };
    });
};

// lod 정보 등록
document.querySelector('#btnPoiLodRegist').onclick = () => {
    const frm = document.querySelector('#lodSetFrm');

    if (!validationForm(frm)) return false;

    const allLodInfo = {
        lodCount: Number(document.querySelector('#levelCnt').value),
        lodMaxDistance: Number(document.querySelector('#maxDist').value)
    };

    const lodInfoList = [...document.querySelectorAll('#lodTab1 > table > tbody > tr.poiSize')].map(tr => {
        const categoryNo = tr.querySelector('td.category1No div').id;

        let lodInfo = {
            buildingId: BUILDING_ID,
            category1No: categoryNo,
            category2No: categoryNo
        };

        for (let j = 1; j <= 10; j++) {
            lodInfo[`iconSize${j}`] = document.querySelector(`#iconSize${j}`).value;
            lodInfo[`lodType${j}`] = document.querySelector(`#lodType${j}`).value;
        }

        return lodInfo;
    });

    allLodInfo.lodData = JSON.stringify(lodInfoList);

    api.patch(`/buildings/${BUILDING_ID}/lod`, allLodInfo).then((res) => {
        alertSwal('정상등록 되었습니다.').then(() => {
            const { status } = res;
            if(status === 202) {
                BuildingManager.findById(BUILDING_ID).lod = allLodInfo;
            }

            document.querySelector('#lodSetModal .btn-close').click();
        });

    });
};

// 현재화면 기준 카메라 거리값
document.querySelector('#btnLodMaxDist').onclick = () => {
    document.querySelector('#maxDist').value = Px.Lod.GetMaxDistance();
};

// 일괄적용버튼이벤트
[
    ...document.querySelector('.lodTypeAll'),
    ...document.querySelector('.iconSizeAll'),
].forEach((dim) => {
    dim.onclick = () => {
        const id = dim.id.replace('All', '');
        document.querySelectorAll(`#${id}`).forEach((detail) => {
            detail.value = dim.value;
        });
    };
});

// LOD 아이콘 사이즈 form
function lodFormTable1Add(dom) {
    const levelCnt = document.getElementById('levelCnt').value;
    for (let i = 1; i <= 10; i++) {
        let display = '';
        if (i > parseInt(levelCnt)) {
            display = "style.display = 'none'";
        } else {
            display = '';
        }
        const td = document.createElement('td');
        td.classList.add(`lod_${i}`);
        td.innerHTML = `<select
                    class = "form-select input-sm"
                    id = "iconSize${i}"
                    name="iconSize"
                    data-rules="required"
                    ${display}
                    title = "아이콘 사이즈" > 
                    <option value="100" selected>100%</option>
                    <option value="80">80%</option>
                    <option value="60">60%</option>
                    <option value="40">40%</option>
                    <option value="20">20%</option>
                    </select>`;
        dom.appendChild(td);
    }
}

// LOD TYPE form
function lodFormTable2Add(dom) {
    const levelCnt = document.getElementById('levelCnt').value;
    for (let i = 1; i <= 10; i++) {
        let display = '';
        if (i >= parseInt(levelCnt)) {
            display = "style.display = 'none'";
        } else {
            display = '';
        }
        const td = document.createElement('td');
        td.classList.add(`lod_${i}`);
        td.innerHTML = `<select
                    class = "form-select input-sm"
                    id = "lodType${i}"
                    name="lodType"
                    data-rules="required"
                    ${display}
                    title = "LOD TYPE" > 
                    <option value="0" selected>아이콘+텍스트</option>
                    <option value="1">아이콘</option>
                    <option value="2">숨김</option>
                    </select>`;
        dom.appendChild(td);
    }
}

// poi lod 레벨수 테이블 처리
document.querySelector('#levelCnt').onchange = (event) => {
    const thisVal = event.target.value;
    for (let i = 3; i <= 10; i++) {
        if (i > parseInt(thisVal)) {
            document.querySelectorAll(`.lod_${i}`).forEach((e) => {
                e.style.display = 'none';
            });
        } else {
            document.querySelectorAll(`.lod_${i}`).forEach((e) => {
                e.style.display = '';
            });
        }
    }
};

// poi lod 카테고리별 일괄 적용
document
    .querySelectorAll('.iconSizeAll, .lodTypeAll')
    .forEach((element) => {
        element.onchange = (event) => {
            const objnm = event.target.id.replace('All', '');
            const thisval = event.target.value;
            document
                .querySelector('#lodSetModal')
                .querySelectorAll(`#${objnm}`)
                .forEach((ele) => {
                    ele.value = thisval;
                });
        };
    });

