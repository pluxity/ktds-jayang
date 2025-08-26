
const initSetting = () => {
    api.get(`/system-settings`).then((res) => {
        const data = res.data.result;
        document.getElementById(`id`).value = data.id;
        document.querySelector('input[name="poiLineLength"]').value = data.poiLineLength;
        document.querySelector('input[name="poiIconSizeRatio"]').value = data.poiIconSizeRatio;
        document.querySelector('input[name="poiTextSizeRatio"]').value = data.poiTextSizeRatio;
        // document.querySelector('input[name="nodeDefaultColor"]').jscolor.fromString(data.nodeDefaultColor ?? '#FFFFFF');
    })
}
initSetting();

const modifySetting = () => {

    const poiLineLength = document.querySelector('input[name="poiLineLength"]').value;
    if(Number(poiLineLength) > 100.0 || Number(poiLineLength) <= 0.0) {
        alertSwal('POI 라인 길이는 0초과 100미만여야 합니다.').then(() => {
            document.querySelector('input[name="poiLineLength"]').focus();
        });
        return;


    }
    const poiIconSizeRatio = document.querySelector('input[name="poiIconSizeRatio"]').value;
    if(Number(poiIconSizeRatio) > 300.0 || Number(poiIconSizeRatio) <= 0.0) {
        alertSwal('POI 아이콘 비율은 0초과 300미만여야합니다.').then(() => {
            document.querySelector('input[name="poiIconSizeRatio"]').focus();
        });
        return false;
    }

    const poiTextSizeRatio = document.querySelector('input[name="poiTextSizeRatio"]').value;
    if(Number(poiTextSizeRatio) > 100.0 || Number(poiTextSizeRatio) <= 0.0) {
        alertSwal('POI 텍스트 비율은 0초과 100미만여야합니다.').then(() => {
            document.querySelector('input[name="poiTextSizeRatio"]').focus();
        });
        return false;
    }

    const param = {
        id : document.getElementById('id').value,
        poiLineLength: document.querySelector('input[name="poiLineLength"]').value,
        poiIconSizeRatio: document.querySelector('input[name="poiIconSizeRatio"]').value,
        poiTextSizeRatio: document.querySelector('input[name="poiTextSizeRatio"]').value,
        nodeDefaultColor: "#FF0000",
    }
    api.post('/system-settings', param).then(() => {
        alertSwal('등록되었습니다.').then(() => {
            window.location.reload();
        });
    });
};

const calculatingDateDifference = (startDate, endDate) => {
    let btMs = endDate.getTime() - startDate.getTime() ;
    return Math.floor(btMs / (1000*60*60*24));
}

document.querySelector('#updateSystemSetting').onclick = () => modifySetting();