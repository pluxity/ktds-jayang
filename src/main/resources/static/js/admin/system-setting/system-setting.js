const renderPoiSettingTable = async () => {
    const response = await api.get('/buildings');
    const buildings = response.data.result;

    const table = document.getElementById('poi-setting-table');
    const theadRow = document.getElementById('poi-head-row');
    const lineRow = document.getElementById('row-line');
    const iconRow = document.getElementById('row-icon');
    const textRow = document.getElementById('row-text');

    while (theadRow.children.length > 2) theadRow.removeChild(theadRow.lastChild);
    [lineRow, iconRow, textRow].forEach(tr => {
        while (tr.children.length > 1) tr.removeChild(tr.lastChild);
    });

    buildings.forEach(b => {
        const buildingId = b.id;
        const buildingName = b.name;

        // <th> 건물명
        const th = document.createElement('th');
        th.innerText = buildingName;
        theadRow.appendChild(th);

        // <td> 각 설정 입력칸
        const createInput = (name) => {
            const td = document.createElement('td');
            td.innerHTML = `<input type="number" class="form-control" name="${name}_${buildingId}" step="0.1">`;
            return td;
        };

        lineRow.appendChild(createInput('poiLineLength'));
        iconRow.appendChild(createInput('poiIconSizeRatio'));
        textRow.appendChild(createInput('poiTextSizeRatio'));
    });
};

renderPoiSettingTable().then(res => {
    const initSetting = () => {
        api.get(`/system-settings`).then((res) => {
            const dataList = res.data.result || [];

            const defaults = {
                poiLineLength: 30,
                poiIconSizeRatio: 210,
                poiTextSizeRatio: 100
            };
            document.querySelectorAll('input[name^="poiLineLength_"]').forEach(input => {
                const buildingId = input.name.split('_')[1];

                const data = dataList.find(d => d.buildingId == buildingId);

                const lineInput = document.querySelector(`input[name="poiLineLength_${buildingId}"]`);
                const iconInput = document.querySelector(`input[name="poiIconSizeRatio_${buildingId}"]`);
                const textInput = document.querySelector(`input[name="poiTextSizeRatio_${buildingId}"]`);

                if (lineInput) lineInput.value = data?.poiLineLength ?? defaults.poiLineLength;
                if (iconInput) iconInput.value = data?.poiIconSizeRatio ?? defaults.poiIconSizeRatio;
                if (textInput) textInput.value = data?.poiTextSizeRatio ?? defaults.poiTextSizeRatio;
            });
        });
    };
    initSetting();
})



const modifySetting = () => {

    const params = [];
    const lineInputs = document.querySelectorAll('input[name^="poiLineLength_"]');

    for (const lineInput of lineInputs) {
        const buildingId = Number(lineInput.name.split('_')[1]);
        const iconInput = document.querySelector(`input[name="poiIconSizeRatio_${buildingId}"]`);
        const textInput = document.querySelector(`input[name="poiTextSizeRatio_${buildingId}"]`);

        const poiLineLength   = Number(lineInput.value);
        const poiIconSizeRatio = Number(iconInput?.value);
        const poiTextSizeRatio = Number(textInput?.value);

        if (!(poiLineLength >= 10.0 && poiLineLength <= 999.0)) {
            alertSwal('POI 라인 길이는 10이상 999이하여야 합니다.').then(() => lineInput.focus());
            return;
        }
        if (!(poiIconSizeRatio >= 100.0 && poiIconSizeRatio <= 999.0)) {
            alertSwal('POI 아이콘 비율은 100이상 999이하여야합니다.').then(() => iconInput?.focus());
            return;
        }
        if (!(poiTextSizeRatio >= 100.0 && poiTextSizeRatio <= 999.0)) {
            alertSwal('POI 텍스트 비율은 100이상 999이하여야합니다.').then(() => textInput?.focus());
            return;
        }

        params.push({
            buildingId,
            poiLineLength,
            poiIconSizeRatio,
            poiTextSizeRatio,
            nodeDefaultColor: '#FF0000'
        });
    }
    api.post('/system-settings', params).then(() => {
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