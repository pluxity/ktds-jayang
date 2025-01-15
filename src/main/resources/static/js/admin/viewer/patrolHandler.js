const initPatrol = () => {

    Px.VirtualPatrol.LoadArrowTexture('/static/images/virtualPatrol/arrow.png', function () {
        console.log('화살표 로딩완료');
    });

    Px.VirtualPatrol.LoadCharacterModel('/static/assets/modeling/virtualPatrol/guardman.glb', function () {
        console.log('가상순찰 캐릭터 로딩 완료');
    });

    Px.VirtualPatrol.Editor.SetPointCreateCallback(savePoint);	//가상순찰 점찍을때 콜백

}

//가상순찰 점찍을때 콜백
const savePoint = (pointData) => {

    const id = document.querySelector("#patrolListTable > tbody > tr.active").dataset.id;
    const floorNo = document.querySelector("#floorNo").value;

    let param = {
        floorId : floorNo
        // ,pointLocation : JSON.stringify(pointData.position)
        ,pointLocation : pointData.position
    };

    api.patch(`/patrols/${id}/points`,param).then(() => {
        patrolPointOnComplete(() => {
            Px.VirtualPatrol.Editor.On();
        });

    });
}

//재생 일시중지 중지 버튼 이벤트 처리
document.querySelectorAll("#patrolPlayer > button.patrol-control").forEach((ele) => {
    ele.onclick = () => {

        const id = document.querySelector("#patrolListTable > tbody > tr.active")?.dataset.id;

        if (id === undefined) {
            alertSwal('선택된 가상순찰이 없습니다.');
            return;
        }
        switch (ele.dataset.btnType) {
            case 'play' :
                adminPatrolButtonEvent.play(id);
                break;
            case 'pause' :
                adminPatrolButtonEvent.pause();
                break;
            case 'stop' :
                adminPatrolButtonEvent.stop();
                break;
        }

    }
});



//가상순찰 등록폼 열기
document.getElementById('registPatrol').onclick = () => {
    document.getElementById('patrolRegisterForm').reset();
    document.getElementById('registerBuildingId').value = BUILDING_ID;
}
//가상순찰 등록
document.getElementById('btnPatrolRegister').onclick = () => {
    const param = formToJSON(document.getElementById('patrolRegisterForm'));
    api.post('/patrols', param).then(() => {
        alertSwal('정상 등록되었습니다.');
        document.querySelector("#patrolRegisterModal > div > div > div.modal-footer > button.btn.btn-secondary").click();
        PatrolManager.getPatrolList().then(() => {
            renderPatrolList();
        });
    });
}

//가상순찰 수정
const modifyPatrol = (id) => {
    const patrol = PatrolManager.findById(id);
    const form = document.getElementById('patrolModifyForm');
    form.querySelector('#modifyId').value = patrol.id;
    form.querySelector('#modifyBuildingId').value = patrol.buildingId;
    form.querySelector('#modifyName').value = patrol.name;
}

document.getElementById('btnPatrolModify').onclick = () => {
    const param = formToJSON(document.getElementById('patrolModifyForm'));
    api.put(`/patrols/${param.id}`, param).then(() => {
        alertSwal('정상 수정되었습니다.');
        document.querySelector("#patrolModifyModal > div > div > div.modal-footer > button.btn.btn-secondary").click();
        PatrolManager.getPatrolList().then(() => {
            renderPatrolList();
        });
    });
}

//가상순찰 삭제
const deletePatrol = (id) => {
    confirmSwal('삭제하시겠습니까?').then(() => {
        api.delete(`/patrols/${id}`).then(() => {
            alertSwal('삭제되었습니다.');
            PatrolManager.getPatrolList().then(() => {
                renderPatrolList();
            });

        });
    });
}

const clickPatrolTab = () => {

    Px.VirtualPatrol.Editor.Off();
    Px.VirtualPatrol.RemoveAll();

    patrolPointOnComplete();
}

//가상순찰 테이블 만들기 --  left List
const renderPatrolList = (onComplete) => {

    Px.VirtualPatrol.Clear();

    const patrolListHtml = document.getElementById('patrolList');
    patrolListHtml.innerHTML = '';

    let patrolHtml = '';

    PatrolManager.findByBuildingId(BUILDING_ID).forEach(patrol => {

        let patrolPointHtml = '';
        if (patrol.patrolPoints.length === 0) {
            patrolHtml += `<tr data-id="${patrol.id}">`;
        } else {
            patrol.patrolPoints.forEach(point => {

                let poiHtml = '';
                point.pois.forEach(poi => {
                    const poiData = PoiManager.findById(poi);
                    poiHtml += `<li data-poi-id="${poiData.id}"> ${poiData.name} </li>`;

                });

                patrolPointHtml += `<tr class="collapse accordion-collapse" id="point${patrol.id}" data-bs-parent=".table" data-point-id="${point.id}">
                <td colspan="2" class="text-center">
                <div class="flex-container">
                    <div class="flex-item">
                        <i class="fa-solid fa-pen-to-square" style="cursor: pointer;" onclick="modifyPatrolPointName(${point.id})" data-bs-toggle="modal" data-bs-target="#patrolPointModifyModal"></i>
                        <i class="fa-solid fa-circle-minus" style="color:#FF0000; cursor: pointer;" onclick="deletePatrolPoint(${point.id})"></i>
                        ${point.name}
                    </div>
                    <div class="flex-item">
                        <i class="fa-solid fa-circle-plus" style="cursor: pointer;" onclick="modifyPatrolPointPoiModal(${point.id})" data-bs-toggle="modal" data-bs-target="#patrolPointPoiModal" ></i>
                    <ul class="poi-list list-unstyled" style="margin-bottom: 0;">
                        ${poiHtml}
                    </ul>
                    </div>
                </div>               
                </td>      
            </tr>`;
            });
            patrolHtml += `<tr data-bs-toggle="collapse" data-bs-target="#point${patrol.id}" data-id="${patrol.id}">`;
        }


        patrolHtml += `<th scope="row" onclick="activeRowByPatrolList(this)">${patrol.name}</th>
          <td style="text-align: center;">
            <button class="btn btn-dark btn-sm patrol-control" type="button" title="수정" onclick="modifyPatrol(${patrol.id})" data-bs-toggle="modal" data-bs-target="#patrolModifyModal">
                <i class="fas fa-pen-to-square"></i>
            </button>
            <button class="btn btn-dark btn-sm patrol-control" type="button" title="삭제" onclick="deletePatrol(${patrol.id})">
                <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
        ${patrolPointHtml}`;
    });

    patrolListHtml.innerHTML = `<table id="patrolListTable" class="table"> 
        <thead> 
            <tr> 
                <th style="width: 50%" scope="col">순찰명</th> 
                <th style="width: 50%" scope="col">제어</th> 
            </tr> 
        </thead> 
        <tbody> 
            ${patrolHtml} 
        </tbody> 
    </table>`;


    document.querySelectorAll('#patrolListTable > tbody > tr').forEach(tr => {
        tr.onclick = () => {
            if(!tr.dataset.id) return;
            Px.Poi.RestoreColorAll();
            if (tr.classList.contains('active')) {
                tr.classList.remove('active');
            } else {
                document.querySelectorAll('#patrolListTable > tbody > tr').forEach(ele => {
                    ele.classList.remove('active');
                })
                tr.classList.add('active');
            }
        }
    });

    document.querySelectorAll('#patrolListTable > tbody > tr.accordion-collapse').forEach(ele => {
        ele.addEventListener('click', (event) => {
            const target = event.currentTarget;
            if(target.classList.contains('active')) {
                target.classList.remove('active');
                Px.Poi.RestoreColorAll();
            } else {
                document.querySelector('#patrolListTable >tbody > tr.accordion-collapse.active')?.classList.remove('active');
                target.classList.add('active');
                Px.Poi.RestoreColorAll();
                [...document.querySelectorAll('#patrolList tr.accordion-collapse.active .poi-list li')].forEach(ele => {
                    Px.Poi.SetColor(ele.dataset.poiId, 'red');
                });

            }
        });
    });

    if(onComplete) onComplete();
}

const activeRowByPatrolList = (evt) => {
    const selectorAll = document.querySelectorAll("#patrolListTable > tbody > tr");
    const closest = evt.closest('tr');

    selectorAll.forEach(function(ele) {
        if(closest.id !== ele.id) new bootstrap.Collapse(ele, { toggle: false }).hide()
    });

    Px.VirtualPatrol.RemoveAll();
    //경로 모두 제거
    Px.VirtualPatrol.Editor.Off();

    Px.VirtualPatrol.Import(PatrolManager.findByIdByImport(closest.dataset.id));
}

const modifyPatrolPointName = (id) => {
    const modal  = document.getElementById('patrolPointModifyModal');
    modal.querySelector('#modifyPointName').value = PatrolManager.findByPointId(id).name;
    modal.querySelector('#modifyPointId').value = id;
}
document.getElementById('btnPatrolPointNameModify').onclick = () => {
    const form = document.getElementById('patrolPointModifyForm');

    if (!validationForm(form)) return;

    const param = formToJSON(form);

    confirmSwal('수정하시겠습니까?').then(() => {
        api.patch(`/patrols/points/${param.id}/name`,param).then(() => {
            alertSwal('수정되었습니다.');
            patrolPointOnComplete();
        });
    });
}


const deletePatrolPoint = (pointId) => {
    confirmSwal('삭제하시겠습니까?').then(() => {
        api.delete(`/patrols/points/${pointId}`).then(() => {
            alertSwal('삭제되었습니다.');
            patrolPointOnComplete();

        });
    });
}



//가상순찰 POI 등록 화면
const modifyPatrolPointPoiModal = (pointId) => {
    const modal = document.getElementById('patrolPointPoiModal');
    modal.querySelector('#patrolPointId').value = pointId;

    modal.querySelector('input.checkall').checked = false;


    let foundItem = null;
    PatrolManager.findAll().some(patrol => {
        const patrolPoint = patrol.patrolPoints.find(patrol => patrol.id === Number(pointId));
        if(patrolPoint) {
            foundItem = patrolPoint;
            return false;
        }
    });

    const poiTbody = document.getElementById('patrolPointPoiInfoList');

    let html = '';

    const poiList = PoiManager.findByBuilding(BUILDING_ID).filter(poi => foundItem != null ? poi.property.floorId === foundItem.floorId : true).filter(poi => poi.poiCategoryDetail.name.toLowerCase().includes("CCTV".toLowerCase()));

    poiList.forEach(poi => {

        const checked = foundItem != null && foundItem.pois.includes(poi.id) ? 'checked' : '';

        html += `
            <tr>
                <th scope="row" class="text-center">
                    <input type="checkbox" class="poiId" name="poiId" value="${poi.id}" ${checked}>
                </th>
                <td class="text-center">${poi.name}</td>
                <td class="text-center">${poi.code}</td>
                <td class="text-center">${poi.position == null ? "N" : "Y"}</td>
            </tr>
        `;
    });

    poiTbody.innerHTML = html;
}

const patchPatrolPois = (id, pois) => {
    api.patch(`/patrols/points/${id}/pois`, {pois}).then(() => {
        patrolPointOnComplete(() => document.querySelector(`#patrolList tr.accordion-collapse[data-point-id='${id}']`).classList.add('active'));
        alertSwal('수정되었습니다.');
        document.querySelector("#patrolPointPoiModal > div > div > div.modal-footer > button.btn.btn-secondary").click();
        Px.Poi.RestoreColorAll();
        pois.forEach(poiId => Px.Poi.SetColor(poiId, 'red'));
    });
}

//가상순찰 POI 등록 버튼 클릭
const updatePatrolPointPoi = () => {
    const modal = document.getElementById('patrolPointPoiModal');

    let rowCheckAll = modal.querySelectorAll('#patrolPointPoiInfoList input[type="checkbox"]:checked.poiId');
    const list = Array.from(rowCheckAll).map(check =>
        Number(check.value),
    );

    if (list.length > 4) {
        alertSwal('POI 선택은 4개 까지 가능합니다.');
        return;
    }

    const id = modal.querySelector('#patrolPointId').value;
    patchPatrolPois(id, list);
}

document.querySelector("#patrolPointPoiModal input.checkall").onchange = (evt) => {
    document.querySelectorAll("#patrolPointPoiInfoList  input.poiId").forEach(ele => {
        ele.checked = evt.currentTarget.checked;
    });
};

const patrolPointOnComplete = (onComplete) => {

    const id = document.querySelector("#patrolListTable > tbody > tr.active")?.dataset.id;
    const floorNo = document.querySelector("#floorNo").value;

    PatrolManager.getPatrolList().then(async () => {
        renderPatrolList(() => {

            if(!id) return false;

            document.querySelector(`[data-bs-target="#point${id}"]`)?.classList.add('active');

            let collapses = document.querySelectorAll(`#point${id}`)
            collapses.forEach(function(collapse) {
                new bootstrap.Collapse(collapse, { toggle: false }).show()
            });

            Px.VirtualPatrol.RemoveAll();
            //경로 모두 제거
            Px.VirtualPatrol.Editor.Off();

            Px.VirtualPatrol.Import(PatrolManager.findByIdByImport(id, floorNo));

            if(onComplete) onComplete();
        });
    });
};

const addPatrolPoi = (poiInfo) => {
    const activePoint = document.querySelector('#patrolList tr.accordion-collapse.active');
    if(!activePoint) return;

    if(!poiInfo.property.code.toLowerCase().includes('cctv')) {
        alertSwal('CCTV만 선택가능합니다.');
        return;
    }

    const { pointId } = activePoint.dataset;

    const selectedPoiIdList = [...document.querySelectorAll('#patrolList tr.accordion-collapse.active .poi-list li')].map(ele => ele.dataset.poiId);

    if(PatrolManager.findByPointId(activePoint.dataset.pointId).floorId !== poiInfo.property.floorId) {
        alertSwal('선택된 지점과 동일한 층에\n배치된 POI만 선택 가능합니다.');
        return;
    }

    if(selectedPoiIdList.includes(poiInfo.id.toString())) {
        const index = selectedPoiIdList.findIndex(poiId => Number(poiId) === poiInfo.id);
        selectedPoiIdList.splice(index, 1);
    } else {
        if(selectedPoiIdList.length >= 4) {
            alertSwal('POI 선택은 4개 까지 가능합니다.');
            return;
        }

        selectedPoiIdList.push(poiInfo.id.toString());
    }

    patchPatrolPois(pointId, selectedPoiIdList);
}



