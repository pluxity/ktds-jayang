const TagManager = (() => {

    const addTags = async (poiId) => {
        const uri = `/poi/add-tags`;
        console.log('=== 외부 서버 태그 추가 시작 ===');
        console.log('요청 URI:', uri);
        console.log('POI ID:', poiId);
        console.log('요청 시간:', new Date().toISOString());

        try {
            console.log('외부 서버로 태그 추가 요청 전송 중...');
            const result = await api.post(uri, poiId, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('외부 서버 응답 성공:', result);
            console.log('응답 상태:', result.status);
            console.log('응답 헤더:', result.headers);
            console.log('응답 데이터:', result.data);

            const { result: data } = result.data;
            if(!data){
                console.error("외부 서버로부터 태그 추가 실패 - 데이터 없음");
                return { success: false, error: '태그 추가 실패' };
            }

            console.log('외부 서버 태그 추가 성공 - 응답 데이터:', data);
            console.log('=== 외부 서버 태그 추가 완료 ===');
            return { success: true, data: data };

        } catch (error) {
            console.error('=== 외부 서버 태그 추가 실패 ===');
            console.error('에러 타입:', error.constructor.name);
            console.error('에러 메시지:', error.message);
            console.error('에러 스택:', error.stack);

            if (error.response) {
                // 서버 응답이 있는 경우
                console.error('서버 응답 상태:', error.response.status);
                console.error('서버 응답 헤더:', error.response.headers);
                console.error('서버 응답 데이터:', error.response.data);
                console.error('서버 에러 메시지:', error.response.data?.message || '알 수 없는 서버 에러');
            } else if (error.request) {
                // 요청은 보냈지만 응답이 없는 경우
                console.error('요청은 전송됨, 응답 없음');
                console.error('요청 정보:', error.request);
            } else {
                // 요청 설정 중 에러
                console.error('요청 설정 에러:', error.message);
            }

            console.error('=== 외부 서버 태그 추가 실패 종료 ===');
            return { success: false, error: error.message };
        }
    };

    const readTags = async (tagNames) => {
        console.log('=== 외부 서버 태그 상태 조회 시작 ===');
        console.log('조회할 태그 목록:', tagNames);
        console.log('요청 시간:', new Date().toISOString());

        try {
            console.log('외부 서버로 태그 상태 조회 요청 전송 중...');
            const response = await api.post('/poi/test-status', tagNames, {
                headers: {
                    'X-Skip-Error-Alert': 'true'
                }
            });

            console.log('외부 서버 태그 상태 조회 성공:', response);
            console.log('응답 상태:', response.status);
            console.log('응답 헤더:', response.headers);
            console.log('응답 데이터:', response.data);

            if (response.data?.result) {
                console.log('태그 개수:', response.data.result.TAGCNT);
                console.log('태그 상세 정보:', response.data.result.TAGs);

                // 각 태그별 상세 로깅
                if (response.data.result.TAGs) {
                    response.data.result.TAGs.forEach((tag, index) => {
                        console.log(`태그 ${index + 1}:`, {
                            tagName: tag.tagName,
                            currentValue: tag.currentValue,
                            timestamp: tag.timestamp || 'N/A'
                        });
                    });
                }
            }

            console.log('=== 외부 서버 태그 상태 조회 완료 ===');
            return { success: true, data: response.data };

        } catch (error) {
            console.error('=== 외부 서버 태그 상태 조회 실패 ===');
            console.error('에러 타입:', error.constructor.name);
            console.error('에러 메시지:', error.message);
            console.error('에러 스택:', error.stack);

            if (error.response) {
                console.error('서버 응답 상태:', error.response.status);
                console.error('서버 응답 헤더:', error.response.headers);
                console.error('서버 응답 데이터:', error.response.data);
                console.error('서버 에러 메시지:', error.response.data?.message || '알 수 없는 서버 에러');
            } else if (error.request) {
                console.error('요청은 전송됨, 응답 없음');
                console.error('요청 정보:', error.request);
            } else {
                console.error('요청 설정 에러:', error.message);
            }

            console.error('=== 외부 서버 태그 상태 조회 실패 종료 ===');
            return { success: false, error: error.message };
        }
    };

    const clearTags = () => {
        const uri = `/poi/clear-tags`;
        console.log('=== 외부 서버 태그 동기화 해제 시작 ===');
        console.log('요청 URI:', uri);
        console.log('요청 시간:', new Date().toISOString());

        return new Promise((resolve) => {
            console.log('외부 서버로 태그 동기화 해제 요청 전송 중...');
            api.delete(uri, {
                headers: {
                    'X-Skip-Error-Alert': 'true'
                }
            }).then((result) => {
                console.log('외부 서버 태그 동기화 해제 성공:', result);
                console.log('응답 상태:', result.status);
                console.log('응답 데이터:', result.data);

                const { result: data } = result.data;
                console.log('서버로부터 태그 동기화 해제 완료');
                console.log('=== 외부 서버 태그 동기화 해제 완료 ===');
                resolve(data);
            }).catch((error) => {
                console.error('=== 외부 서버 태그 동기화 해제 실패 ===');
                console.error('에러 타입:', error.constructor.name);
                console.error('에러 메시지:', error.message);

                if (error.response) {
                    console.error('서버 응답 상태:', error.response.status);
                    console.error('서버 응답 데이터:', error.response.data);
                }

                console.error('=== 외부 서버 태그 동기화 해제 실패 종료 ===');
                resolve([]); // 에러 시에도 resolve
            });
        });
    };
    const mapTagDataToPopup = async (poiProperty, popupInfo, statusCell) => {
        try {

            const response = await readTags(poiProperty.tagNames);

            const data = response.data;
            const tbody = popupInfo.querySelector('tbody');
            if (data.TAGCNT > 0) {
                if (poiProperty.poiMiddleCategoryName == '에스컬레이터') {
                    const esclNumMatch = data.TAGs[0].tagName.match(/ESCL-(\d+)/);
                    const esclNum = esclNumMatch ? parseInt(esclNumMatch[1], 10) : null;
                    const esclBaseMap = {
                        1: 'B2F-B1F',
                        3: 'B1F-1F',
                        5: '1F-2F',
                        7: 'B4F-B3F',
                        9: 'B3F-B2F',
                        11: 'B7F-B6F',
                        13: 'B6F-B5F',
                        15: 'B5F-B4F',
                        17: 'B4F-B3F',
                        19: 'B3F-B2F',
                        21: 'B2F-B1F',
                        23: 'B1F-1F',
                        25: '1F-2F',
                        27: 'B4F-B3F',
                        29: 'B3F-B2F',
                        31: 'B2F-B1F',
                        33: 'B1F-1F',
                        35: '1F-2F',
                        37: '2F-3F',
                        39: '3F-4F',
                        41: 'B1F-1F',
                        43: 'B1F-1F',
                    };

                    let section = '-';
                    if (esclNum && esclBaseMap[esclNum % 2 === 0 ? esclNum - 1 : esclNum]) {
                        const base = esclBaseMap[esclNum % 2 === 0 ? esclNum - 1 : esclNum];
                        section = (esclNum % 2 === 0) ? `${base.split('-')[0]}->${base.split('-')[1]}`
                            : `${base.split('-')[1]}<-${base.split('-')[0]}`;
                    }

                    const tagMap = Object.fromEntries(data.TAGs.map(t => [t.tagName.split('-').pop(), t.currentValue]));
                    const direction = (tagMap['UpDir'] === 'OFF') ? '하향'
                        : (tagMap['UpDir'] ? '상향' : '-');

                    let runState = '-';
                    if (tagMap['Run'] && tagMap['Run'] !== '0' && tagMap['Run'] !== 'OFF') {
                        runState = '운행';
                    } else if (tagMap['Stop'] && tagMap['Stop'] !== '0' && tagMap['Stop'] !== 'OFF') {
                        runState = '정지';
                    } else if (tagMap['Fault'] && tagMap['Fault'] !== '0' && tagMap['Fault'] !== 'OFF') {
                        runState = tagMap['Fault'];
                    }

                    tbody.innerHTML = `
                          <tr>
                            <td>운행 구간</td>
                            <td>${section}</td>
                          </tr>
                          <tr>
                            <td>운행 상태</td>
                            <td>${runState}</td>
                          </tr>
                          <tr>
                            <td>운행 방향</td>
                            <td>${direction}</td>
                          </tr>
                        `;
                    return {success: true};
                } else if (poiProperty.poiMiddleCategoryName === '승강기') {
                    let addedGroup1 = false;
                    let addedGroup2 = false;
                    tbody.innerHTML = data.TAGs
                        .map(tag => {
                            const prefix = tag.tagName.charAt(0);
                            const suffix = tag.tagName.substring(tag.tagName.lastIndexOf('-') + 1);
                            let label = '';
                            let displayValue = tag.currentValue;
                            if (prefix === 'A' || prefix === 'B') {
                                // A, B 건물
                                switch (suffix) {
                                    case 'CurrentFloor':
                                        if (tag.currentValue == '0G') {
                                            displayValue = 'G';
                                        }
                                        label = '현재 층';
                                        break;
                                    case 'DrivingState':
                                        label = '운행 상태';
                                        break;
                                    case 'Door':
                                        label = '도어';
                                        break;
                                    case 'Direction':
                                        label = '운행 방향';
                                        break;
                                    default:
                                        label = suffix;
                                        break;
                                }
                            } else {

                                if (suffix === 'UpDir') {
                                    label = '운행 방향';
                                    displayValue = (tag.currentValue === '상향') ? '상향' : '하향';
                                } else if (suffix === 'Door opened') {
                                    label = '도어';
                                    displayValue = (tag.currentValue === 'OFF') ? '문닫힘' : '문열림';
                                } else if (suffix === 'CurrentFloor') {
                                    label = '현재 층';
                                } else if ([
                                    'AUTO', 'Fault', 'Checking', 'Parking', 'Independent driving',
                                    'Overweight', '1st fire driving', 'Second fire driving',
                                    'Fire control driving', 'Fire control driving results'
                                ].includes(suffix)) {
                                    if (tag.currentValue === 'OFF' || tag.currentValue === '0') {
                                        return '';
                                    }

                                    if (['1st fire driving', 'Fire control driving results'].includes(suffix)) {
                                        if (addedGroup1) {
                                            return '';
                                        } else {
                                            addedGroup1 = true;
                                            label = '운행 상태';
                                        }
                                    } else if (['Second fire driving', 'Fire control driving'].includes(suffix)) {
                                        if (addedGroup2) {
                                            return '';
                                        } else {
                                            addedGroup2 = true;
                                            label = '운행 상태';
                                        }
                                    } else {
                                        label = '운행 상태';
                                    }
                                } else {
                                    return '';
                                }
                            }

                            return `
                                <tr>
                                    <td>${label}</td>
                                    <td>${displayValue}</td>
<!--                                    ${statusCell}-->
                                </tr>
                            `;
                        })
                        .filter(row => row.trim() !== '')
                        .join('');
                } else if (['소방', '출입통제', '누수', '비상벨'].includes(poiProperty.poiCategoryName)) {
                    tbody.innerHTML = data.TAGs.map(tag => {
                        const statusText = {0: '정상', 1: '경보'}[tag.currentValue];
                        return `
                            <tr>
                                <td>상태</td>
                                <td>${statusText}</td>
                            </tr>
                        `;
                    }).join('');
                } else if (['비상발전기', '저압 배전반', '특고압 배전반', '특고압 변압기', '발전기'].includes(poiProperty.poiMiddleCategoryName)) {

                    console.log("poiProperty.poiMiddleCategoryName : ", poiProperty.poiMiddleCategoryName);

                    // GEN일 때도 따로 처리해야됨.
                    // 충전기 전압, 배터리 전압, 주파수, 역률 등등 추가 정보
                    if (poiProperty.poiMiddleCategoryName === '특고압 변압기' ||
                        (
                            poiProperty.poiMiddleCategoryName === '저압 배전반' &&
                            data.TAGs.some(tag =>
                                ['ELD', 'ATS', 'NVR'].some(keyword => tag.tagName.includes(keyword))
                            )
                        )) {
                        tbody.innerHTML = data.TAGs.map(tag => {
                            const statusText = {0: '정상', 1: '경보'}[tag.currentValue];
                            return `
                            <tr>
                                <td>상태</td>
                                <td>${statusText}</td>
                            </tr>
                        `;
                        }).join('');
                        return;
                    }
                    const TAG_LABEL_MAP = {
                        "충전기_전압": "충전기 전압",
                        "배터리_전압": "배터리 전압",
                        "주파수": "주파수",
                        "역률": "역률",
                        "R상_전압": "R상 전압",
                        "S상_전압": "S상 전압",
                        "T상_전압": "T상 전압",
                        "R_S_선간전압": "R-S 선간전압",
                        "S_T_선간전압": "S-T 선간전압",
                        "T_R_선간전압": "T-R 선간전압",
                        "R상_전류": "R상 전류",
                        "S상_전류": "S상 전류",
                        "T상_전류": "T상 전류",
                        "3상_유효전력": "유효전력",
                        "3상_무효전력": "무효전력",
                        "유효전력량": "유효 전력량",
                        "무효전력량": "무효 전력량",
                        "R상_전압_30": "R상 전압 30"
                    };

                    const unmatchedTags = [];
                    const unmatchedGroups = {
                        OCR: [],
                        OCGR: [],
                        UVR: [],
                        CB_ON: [],
                        ATS: [],
                        NVR: [],
                        ELD: [],
                        ETC: []
                    };

                    const rowList = data.TAGs.map(tag => {
                        const tagNamePart = tag.tagName.split('-').pop();
                        const parts = tagNamePart.split('_');

                        if (!isNaN(parts[parts.length - 1])) {
                            parts.pop();
                        }

                        let key = '';
                        if (parts.length >= 3 && ['R', 'S', 'T', '3상'].includes(parts[parts.length - 3])) {
                            key = parts.slice(-3).join('_');
                        } else if (parts.length >= 2 && TAG_LABEL_MAP[parts.slice(-2).join('_')]) {
                            key = parts.slice(-2).join('_');
                        } else if (TAG_LABEL_MAP[parts.slice(-1)[0]]) {
                            key = parts.slice(-1)[0];
                        } else {
                            key = '';
                        }

                        if (TAG_LABEL_MAP[key]) {
                            let unit = '';
                            switch (true) {
                                case key.includes('무효전력량'):
                                    unit = 'kVarh';
                                    break;
                                case key.includes('무효전력'):
                                    unit = 'kVar';
                                    break;
                                case key.includes('전력량'):
                                    unit = 'kWH';
                                    break;
                                case key.includes('전류'):
                                    unit = 'A';
                                    break;
                                case key.includes('전압'):
                                    unit = 'KV';
                                    break;
                                case key.includes('전력'):
                                    unit = 'kW';
                                    break;
                                case key.includes('주파수'):
                                    unit = 'Hz';
                                    break;
                                default:
                                    unit = '';
                            }

                            return {
                                label: TAG_LABEL_MAP[key],
                                value: `${tag.currentValue}${unit}`
                            };
                        } else {
                            unmatchedTags.push({
                                tagName: tag.tagName,
                                currentValue: tag.currentValue
                            });
                            if (tag.tagName.includes('OCR_OCGR')) {
                                unmatchedGroups.OCR.push({
                                    tagName: tag.tagName,
                                    currentValue: tag.currentValue
                                });
                                unmatchedGroups.OCGR.push({
                                    tagName: tag.tagName,
                                    currentValue: tag.currentValue
                                });
                            } else if (tag.tagName.includes('OCGR')) {
                                unmatchedGroups.OCGR.push({
                                    tagName: tag.tagName,
                                    currentValue: tag.currentValue
                                });
                            } else if (tag.tagName.includes('OCR')) {
                                unmatchedGroups.OCR.push({
                                    tagName: tag.tagName,
                                    currentValue: tag.currentValue
                                });
                            } else if (tag.tagName.includes('UVR')) {
                                unmatchedGroups.UVR.push({
                                    tagName: tag.tagName,
                                    currentValue: tag.currentValue
                                });
                            }
                                // else if (tag.tagName.includes('ATS')) {
                                //     unmatchedGroups.ATS.push({
                                //         tagName: tag.tagName,
                                //         currentValue: tag.currentValue
                                //     });
                                // } else if (tag.tagName.includes('NVR')) {
                                //     unmatchedGroups.NVR.push({
                                //         tagName: tag.tagName,
                                //         currentValue: tag.currentValue
                                //     });
                                // } else if (tag.tagName.includes('ELD')) {
                                //     unmatchedGroups.ELD.push({
                                //         tagName: tag.tagName,
                                //         currentValue: tag.currentValue
                                //     });
                            // }
                            else if (tag.tagName.includes('ACB_ON') || tag.tagName.includes('VCB_ON') || tag.tagName.includes('POINT')) {
                                unmatchedGroups.CB_ON.push({
                                    tagName: tag.tagName,
                                    currentValue: tag.currentValue
                                });
                            } else {
                                unmatchedGroups.ETC.push({
                                    tagName: tag.tagName,
                                    currentValue: tag.currentValue
                                });
                            }

                            return null;
                        }
                    }).filter(Boolean);

                    console.log("unmatchedGroups : ", unmatchedGroups);
                    if (rowList.length <= 10) {
                        tbody.innerHTML = rowList.map(row => `
                            <tr>
                                <td>${row.label}</td>
                                <td>${row.value}</td>
                            </tr>
                        `).join('');
                    } else {
                        const thead = popupInfo.querySelector('table thead');
                        thead.innerHTML = `
                            <tr>
                                <th>수집정보</th>
                                <th>측정값</th>
                                <th style="border-left: 1px solid;">수집정보</th>
                                <th>측정값</th>
                            </tr>
                        `;

                        let html = '';
                        for (let i = 0; i < 10; i++) {
                            const left = rowList[i]
                                ? `<td>${rowList[i].label}</td><td>${rowList[i].value}</td>`
                                : `<td>-</td><td>-</td>`;
                            const right = rowList[i + 10]
                                ? `<td style="border-left: 1px solid;">${rowList[i + 10].label}</td><td>${rowList[i + 10].value}</td>`
                                : `<td style="border-left: 1px solid;">-</td><td>-</td>`;

                            html += `<tr>${left}${right}</tr>`;
                        }

                        tbody.innerHTML = html;

                    }

                    const content = popupInfo.querySelector('.popup-info__content');
                    const oldButtons = content.querySelector('.alert-buttons');
                    if (oldButtons) oldButtons.remove();

                    const buttonWrapper = document.createElement('div');
                    buttonWrapper.className = 'alert-buttons';
                    buttonWrapper.style.marginTop = '12px';
                    buttonWrapper.style.display = 'flex';
                    buttonWrapper.style.flexDirection = 'column';
                    buttonWrapper.style.alignItems = 'center';

                    const row1 = document.createElement('div');
                    row1.style.display = 'flex';
                    row1.style.gap = '8px';
                    row1.style.marginBottom = '8px';

                    const row2 = document.createElement('div');
                    row2.style.display = 'flex';
                    row2.style.gap = '8px';

                    // const alertGroups = ['CB_ON', 'OCR', 'OCGR', 'UVR', 'NVR', 'ELD', 'ATS'];
                    const alertGroups = ['CB_ON', 'OCR', 'OCGR', 'UVR'];
                    alertGroups.forEach((group, i) => {
                        // tag에 있는거만 버튼만듬
                        const groupData = unmatchedGroups[group];
                        const filtered = groupData.filter(tag => {
                            if (group === 'CB_ON') {
                                return tag.tagName.includes('CB_ON') || tag.tagName.includes('POINT');
                            }
                            return tag.tagName.includes(group);
                        });
                        if (filtered.length === 0) return;
                        const isActive = unmatchedGroups[group]?.some(tag => tag.currentValue === '1');

                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.textContent = group;
                        btn.style.width = '5rem';
                        btn.style.height = '1.8rem';
                        btn.className = 'button button--solid-middle';
                        if (isActive) {
                            btn.style.backgroundColor = 'red';
                            btn.style.color = 'white';
                        }

                        if (i < 4) {
                            row1.appendChild(btn);
                        } else {
                            row2.appendChild(btn);
                        }
                    });

                    buttonWrapper.appendChild(row1);
                    buttonWrapper.appendChild(row2);
                    content.appendChild(buttonWrapper);

                    // label 색깔 처리 테스트중
                    // ['OCR', 'OCGR', 'UVR', 'CB_ON', 'ATS', 'NVR', 'ELD'].forEach(group => {
                    //     const found = unmatchedGroups[group].find(tag => tag.currentValue == '1');
                    //     if (found) {
                    //         console.log(`${group} group has active tag:`, found);
                    //     }
                    // });

                } else if (poiProperty.poiMiddleCategoryName === '무정전전원장치') {

                    const {
                        lineVoltageData,
                        phaseVoltageData,
                        currentData,
                        batteryData,
                        statusBtns
                    } = processUPSData(data.TAGs);
                    const tableHTML = generateUPSTables(lineVoltageData, phaseVoltageData, currentData, batteryData, statusBtns);

                    // 기존 테이블과 버튼들을 제거하고 새로운 테이블들을 추가 (이벤트 리스너 보존)
                    const contentDiv = popupInfo.querySelector('.popup-info__content');
                    const existingTables = contentDiv.querySelectorAll('table');
                    const existingButtons = contentDiv.querySelectorAll('.alert-buttons');
                    existingTables.forEach(table => table.remove());
                    existingButtons.forEach(buttons => buttons.remove());

                    // 새로운 테이블들을 contentDiv에 직접 추가
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = tableHTML;
                    while (tempDiv.firstChild) {
                        contentDiv.appendChild(tempDiv.firstChild);
                    }

                } else if (poiProperty.poiMiddleCategoryName === 'FPU') {
                    tbody.innerHTML = data.TAGs.map(tag => {
                        // "A-4-VAV-FPU-104105-4F_FPU_104105_PRI_ACTUAL_FLOW" -> "PRI_ACTUAL_FLOW"
                        const parts = tag.tagName.split('_');
                        const suffix = parts.slice(3).join('_'); // 처음 3개 부분 제거 후 나머지 조인
                        let label = '';
                        let unit = '';
                        switch (suffix) {
                            case 'SPACE_TEMP':
                                label = '현재온도';
                                unit = '℃';
                                break;
                            case 'PRI_FLOW_STPT':
                                label = '요구풍량';
                                unit = 'm²/s';
                                break;
                            case 'PRI_ACTUAL_FLOW':
                                label = '현재풍량';
                                unit = 'm²/s';
                                break;
                            case 'ACT_ROOM_STPT':
                                label = '설정온도';
                                unit = '℃';
                                break;
                            case 'MIN_VOLUME':
                                label = '최소풍량';
                                unit = 'm²/s';
                                break;
                            case 'MAX_VOLUME':
                                label = '최대풍량';
                                unit = 'm²/s';
                                break;
                            case 'POSITION':
                                label = '댐퍼개도';
                                unit = '%';
                                break;
                            case 'COOL_HEAT':
                                label = '냉/난방';
                                break;
                            case 'MANUAL_DMP_OPEN':
                                label = '운전모드';
                                break;
                            case 'FAN':
                                label = '팬운전';
                                break;
                            case 'VLV_24V_ON_OFF':
                                label = '밸브운전';
                                break;
                            default:
                                label = suffix;
                                break;
                        }

                        return `
                               <tr>
                                   <td>${label}</td>
                                   <td>${tag.currentValue || '-'}${unit}</td>
                               </tr>
                           `;
                    }).join('');
                } else if (poiProperty.poiMiddleCategoryName === 'VAV') {
                    tbody.innerHTML = data.TAGs.map(tag => {
                        // "A-8-VAV-VAV-108121-8F_VAV_108121_SPACE_TEMP" -> "SPACE_TEMP"
                        const parts = tag.tagName.split('_');
                        const suffix = parts.slice(3).join('_'); // 처음 3개 부분 제거 후 나머지 조인
                        let label = '';
                        let unit = '';

                        switch (suffix) {
                            case 'SPACE_TEMP':
                                label = '현재온도';
                                unit = '℃';
                                break;
                            case 'PRI_FLOW_STPT':
                                label = '요구풍량';
                                unit = 'm²/s';
                                break;
                            case 'PRI_ACTUAL_FLOW':
                                label = '현재풍량';
                                unit = 'm²/s';
                                break;
                            case 'ACT_ROOM_STPT':
                                label = '설정온도';
                                unit = '℃';
                                break;
                            case 'MIN_VOLUME':
                                label = '최소풍량';
                                unit = 'm²/s';
                                break;
                            case 'MAX_VOLUME':
                                label = '최대풍량';
                                unit = 'm²/s';
                                break;
                            case 'POSITION':
                                label = '댐퍼개도';
                                unit = '%';
                                break;
                            case 'COOL_HEAT':
                                label = '냉/난방';
                                break;
                            case 'MANUAL_DMP_OPEN':
                                label = '운전모드';
                                break;
                            default:
                                label = suffix;
                                break;
                        }

                        return `
                                  <tr>
                                      <td>${label}</td>
                                      <td>${tag.currentValue || '-'}${unit}</td>
                                  </tr>
                              `;
                    }).join('');
                } else if (poiProperty.poiMiddleCategoryName === 'PV') {
                    tbody.innerHTML = data.TAGs.map(tag => {
                        // "C-RF-SU-PV-null-현재발전량" -> "현재발전량"
                        const label = tag.tagName.substring(tag.tagName.lastIndexOf('-') + 1);

                        return `
                                  <tr>
                                      <td>${label || '-'}</td>
                                      <td>${tag.currentValue || '-'}</td>
                                  </tr>
                              `;
                    }).join('');
                } else if (poiProperty.poiMiddleCategoryName === 'BIPV') {
                    // 태그를 두 그룹으로 분리
                    const regularTags = data.TAGs.filter(tag => !tag.tagName.includes('-G-'));
                    const comprehensiveTags = data.TAGs.filter(tag => tag.tagName.includes('-G-'));

                    const tableHTML = generateBIPVTable(regularTags);
                    const comprehensiveTableHTML = generateBIPVTable(comprehensiveTags);

                    const contentDiv = popupInfo.querySelector('.popup-info__content');
                    const existingTables = contentDiv.querySelectorAll('table');
                    existingTables.forEach(table => table.remove());

                    // 새로운 테이블들을 contentDiv에 직접 추가
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = tableHTML;
                    tempDiv.innerHTML += comprehensiveTableHTML;
                    contentDiv.appendChild(tempDiv.firstChild);
                    contentDiv.appendChild(tempDiv.firstChild);
                } else if (poiProperty.poiMiddleCategoryName == "연료전지") {
                    tbody.innerHTML = data.TAGs.map(tag => {
                        const parts = tag.tagName.split('-');
                        const suffix = parts[parts.length - 1];
                        let label = '';
                        let unit = '';

                        switch (suffix) {
                            case 'LNGConsum':
                                label = 'LNG소비량';
                                unit = 'Nm³';
                                break;
                            case 'GenKwh':
                                label = '발전량';
                                unit = 'kWh';
                                break;
                            case 'GenKCal':
                                label = '생산열량';
                                unit = 'Kcal';
                                break;
                            default:
                                label = suffix;
                                break;
                        }

                        return `
                                  <tr>
                                      <td>${label}</td>
                                      <td>${tag.currentValue || '-'}${unit}</td>
                                  </tr>
                              `;
                    }).join('');
                } else if (poiProperty.poiCategoryName == "공기질") {
                    let locationRow = '';

                    const renderOrder = [
                        'Temperature',
                        'Humidity',
                        'Noise',
                        'VOC',
                        'PM10',
                        'PM25',
                        'CICI',
                        'COCI'
                    ];

                    const tagsBySuffix = Object.fromEntries(
                        data.TAGs.map(tag => {
                            const suffix = tag.tagName.split('_').pop();
                            return [suffix, tag];
                        })
                    );

                    const renderedRows = renderOrder.map(suffix => {
                        const tag = tagsBySuffix[suffix];
                        if (!tag) return '';

                        let label = '';
                        let unit = '';
                        let grade = '-';

                        switch (suffix) {
                            case 'Temperature':
                                label = '온도';
                                unit = '˚C';
                                break;
                            case 'Humidity':
                                label = '습도';
                                unit = '%';
                                break;
                            case 'Noise':
                                label = '소음';
                                unit = 'dB';
                                break;
                            case 'VOC':
                                label = '휘발성유기화합물';
                                unit = 'ppm';
                                break;
                            case 'PM10':
                                label = '미세먼지';
                                unit = '㎍/㎥';
                                if (tag.currentValue != null && !isNaN(tag.currentValue)) {
                                    const value = parseFloat(tag.currentValue);
                                    if (value <= 30)
                                        grade = '좋음';
                                    else if (value <= 80)
                                        grade = '보통';
                                    else if (value <= 150)
                                        grade = '나쁨';
                                    else
                                        grade = '매우나쁨';
                                }
                                break;
                            case 'PM25':
                                label = '초미세먼지';
                                unit = '㎍/㎥';
                                if (tag.currentValue != null && !isNaN(tag.currentValue)) {
                                    const value = parseFloat(tag.currentValue);
                                    if (value <= 15)
                                        grade = '좋음';
                                    else if (value <= 35)
                                        grade = '보통';
                                    else if (value <= 75)
                                        grade = '나쁨';
                                    else
                                        grade = '매우나쁨';
                                }
                                break;
                            case 'CICI':
                                label = '실내 쾌적지수';
                                unit = '';
                                if (!locationRow) {
                                    locationRow = `
                                        <tr>
                                            <td>설치위치</td>
                                            <td>실내</td>
                                            <td>-</td>
                                        </tr>
                                    `;
                                }
                                break;
                            case 'COCI':
                                label = '실외 쾌적지수';
                                unit = '';
                                if (!locationRow) {
                                    locationRow = `
                                        <tr>
                                            <td>설치위치</td>
                                            <td>실외</td>
                                            <td>-</td>
                                        </tr>
                                    `;
                                }
                                break;
                        }
                        return `
                            <tr>
                                <td>${label}</td>
                                <td>${tag.currentValue || '-'}${unit}</td>
                                <td>${(suffix === 'PM10' || suffix === 'PM25') ? grade : '-'}</td>
                            </tr>
                        `;
                    }).filter(row => row !== '').join('');

                    tbody.innerHTML = (locationRow || '') + renderedRows;
                } else if (poiProperty.poiMiddleCategoryName == "시스템에어컨") {
                    tbody.innerHTML = data.TAGs.map(tag => {
                        const parts = tag.tagName.split('-');
                        const suffix = parts[parts.length - 1];
                        let label = '';
                        let unit = '';

                        switch (suffix) {
                            case 'power':
                                label = '전원';
                                break;
                            case 'opMode':
                                label = '모드';
                                break;
                            case 'roomTemp':
                                label = '현재온도';
                                unit = '˚C';
                                break;
                            case 'setTemp':
                                label = '설정온도';
                                unit = '˚C';
                                break;
                            case 'fanSpeed':
                                label = '팬속도';
                                break;
                            default:
                                label = suffix;
                                break;
                        }

                        let displayValue = '-';
                        if (tag.currentValue !== undefined && tag.currentValue !== null && tag.currentValue !== '') {
                            const v = String(tag.currentValue);
                            if (suffix === 'power') {
                                displayValue = v === '0' ? 'OFF' : v === '1' ? 'ON' : tag.currentValue;
                            } else if (suffix === 'opMode') {
                                displayValue = v === '0' ? '냉방' : v === '1' ? '난방' : tag.currentValue;
                            } else {
                                displayValue = tag.currentValue;
                            }
                        }

                        const valueWithUnit = displayValue === '-' ? '-' : `${displayValue}${unit}`;

                        return `
                          <tr>
                              <td>${label}</td>
                              <td>${valueWithUnit}</td>
                          </tr>
                        `;
                    }).join('');
                } else if (['조명', '항공장애'].includes(poiProperty.poiCategoryName)) {

                    tbody.innerHTML = data.TAGs.map(tag => {
                        console.log("tag : ", tag);
                        const tagName = tag.tagName || '';
                        const lowerTag = tagName.toLowerCase();
                        const statusText = {0: 'ON', 1: 'OFF'}[tag.currentValue];
                        let finalText = statusText;
                        let displayName = '상태';

                        if (lowerTag.includes('dimmer')) {
                            const parts = tagName.split('.');
                            if (parts.length >= 3) {
                                displayName = `${parts[1]}.${parts[2]}`.toUpperCase();
                            }

                            if (lowerTag.includes('dimmer.l')) {
                                if (tag.currentValue == 0) finalText = '소등';
                                else if (tag.currentValue == 1) finalText = '점등';
                                else if (tag.currentValue == 2) finalText = '고장(LED램프)';
                                else if (tag.currentValue == 3) finalText = '소등(센서)';
                            }
                            else if (lowerTag.includes('dimmer.d')) {
                                if (tag.currentValue == 1) finalText = '고장(디머)';
                            }
                        }

                        return `
                            <tr>
                                <td>${displayName}</td>
                                <td>${finalText}</td>
                            </tr>
                        `;
                    }).join('');
                } else if (['지열'].includes(poiProperty.poiCategoryName)) {
                    tbody.innerHTML = data.TAGs.map(tag => {
                        const name = tag.tagName || '';
                        const value = tag.currentValue;
                        let label = '';
                        let statusText = '';
                        let unit = '';

                        if (/경보/.test(name)) {
                            label = '경보';
                            statusText = { 0: 'Normal', 1: 'Alarm' }[value] ?? 'Unknown';
                        } else if (/자동수동/.test(name)) {
                            label = '자동/수동';
                            statusText = { 0: '수동', 1: '자동' }[value] ?? 'Unknown';
                        } else if (/냉방난방/.test(name)) {
                            label = '냉방/난방';
                            statusText = { 0: '냉방', 1: '난방' }[value] ?? 'Unknown';
                        } else if (/상태|운전정지/.test(name)) {
                            label = '상태';
                            statusText = { 0: 'OFF', 1: 'ON' }[value] ?? 'Unknown';
                        } else {
                            const parts = name.split('_');
                            const lastPart = parts[parts.length - 1] || name;
                            label = lastPart;

                            if (/온도/.test(lastPart)) unit = '℃';
                            else if (/유량/.test(lastPart)) unit = 'm³/h';
                            else if (/전력/.test(lastPart)) unit = 'kW';
                            else if (/열량/.test(lastPart)) unit = 'kcal';
                            else if (/시간/.test(lastPart)) unit = 'h';
                            else if (/COP/.test(lastPart)) unit = '';
                            else unit = '';

                            statusText = `${value}${unit}`;
                        }

                        return `
                            <tr>
                                <td>${label}</td>
                                <td>${statusText}</td>
                            </tr>
                        `;
                    }).join('');
                } else if (poiProperty.poiCategoryName === '설비' &&
                    poiProperty.poiMiddleCategoryName !== '공기조화기' &&
                    poiProperty.poiMiddleCategoryName !== '외조기') {

                    // 설비 태그 메타 정보 함수
                    function _equipmentMeta(tagName) {
                        if (!tagName) return { type: 'ANALOG', label: '' };
                        
                        const digitalMapping = {
                            'ST': '상태',
                            'AL': '경보',
                            'SS': '기동',
                            'RUN': '자동운전',
                            'REL': '등급해제',
                            'HIAL':'고수위경보',
                            'LOAL':'저수위경보'
                        };
                        
                        const analogMapping = {
                            'PT': '온도',
                            'INV': '인버터출력',
                            'SPT': '공급온도',
                            'RPT': '환수온도',
                            'SP': '전압',
                            'LI': '수위'
                        };
                        
                        // suffix 기반으로 매핑 찾기 (includes 사용)
                        const parts = tagName.split('_');
                        const suffix = parts[parts.length - 1];
                        
                        // Digital 매핑 체크 (긴 키부터 먼저 체크)
                        const digitalKeys = Object.keys(digitalMapping).sort((a, b) => b.length - a.length);
                        for (const key of digitalKeys) {
                            if (suffix.includes(key)) {
                                return { type: 'DIGITAL', label: digitalMapping[key] };
                            }
                        }
                        
                        // Analog 매핑 체크 (긴 키부터 먼저 체크)
                        const analogKeys = Object.keys(analogMapping).sort((a, b) => b.length - a.length);
                        for (const key of analogKeys) {
                            if (suffix.includes(key)) {
                                return { type: 'ANALOG', label: analogMapping[key] };
                            }
                        }
                        
                        return { type: 'ANALOG', label: tagName };
                    }

                    const tbody = popupInfo.querySelector('table tbody');
                    tbody.innerHTML = data.TAGs.map(tag => {
                        const name = tag.tagName || tag.name || '';
                        const meta = _equipmentMeta(name);
                        const label = meta.label || name;
                        const value = (meta.type === 'DIGITAL') ? _toOnOff(tag.currentValue) : tag.currentValue;
                        
                        return `
                            <tr>
                                <td>${label}</td>
                                <td>${value}</td>
                            </tr>
                        `;
                    }).join('');
                } else if (poiProperty.poiMiddleCategoryName === '공기조화기' || poiProperty.poiMiddleCategoryName === '외조기') {

                    const thead = popupInfo.querySelector('table thead');
                    thead.innerHTML = `
                        <tr style="position: sticky; top: 0; background: #d9dde3; z-index: 2;">
                            <th>수집정보</th>
                            <th>측정값</th>
                            <th style="border-left: 1px solid;">수집정보</th>
                            <th>측정값</th>
                        </tr>
                    `;

                    const rows = [];
                    for (let i = 0; i < data.TAGs.length; i += 2) {
                        const tag1 = data.TAGs[i];
                        const tag2 = data.TAGs[i + 1];

                        const name1 = tag1 ? (tag1.tagName || tag1.name || '') : '';
                        const meta1 = tag1 ? _ahuMeta(name1) : {};
                        const label1 = meta1.label || name1;
                        const value1 = tag1 ? ((meta1.type === 'DIGITAL') ? _toOnOff(tag1.currentValue) : tag1.currentValue) : '';

                        const name2 = tag2 ? (tag2.tagName || tag2.name || '') : '';
                        const meta2 = tag2 ? _ahuMeta(name2) : {};
                        const label2 = meta2.label || name2;
                        const value2 = tag2 ? ((meta2.type === 'DIGITAL') ? _toOnOff(tag2.currentValue) : tag2.currentValue) : '';

                        rows.push(`
                            <tr>
                                <td>${label1}</td>
                                <td>${value1}</td>
                                <td style="border-left: 1px solid;">${label2}</td>
                                <td>${value2}</td>
                            </tr>
                        `);
                    }

                    const tbody = popupInfo.querySelector('table tbody');
                    tbody.innerHTML = rows.join('');
                    const parent = tbody.parentElement;
                    parent.style.display = 'block';
                    parent.style.maxHeight = '400px';
                    parent.style.overflowY = 'auto';
                    parent.style.overflowX = 'hidden';
                    parent.style.borderTop = '1px solid #ccc';

                } else {
                    tbody.innerHTML = data.TAGs.map(tag => {
                        const statusCell = poiProperty.poiCategoryName === '공기질'
                            ? `<td>${getStatusText(tag.S)}</td>`
                            : '';
                        return `
                            <tr>
                                <td>${tag.label}</td>
                                <td>${tag.desc}</td>
                                ${statusCell}
                            </tr>
                        `;
                    }).join('');

                }
            } else {
                tbody.innerHTML = `
                        <tr>
                            <td colspan="3">태그 데이터가 없습니다.</td>
                        </tr>
                    `;
            }

            // 업데이트 시간 갱신
            popupInfo.querySelector('.date .timestamp').textContent =
                `업데이트 일시 : ${new Date().toLocaleString()}`;
        } catch (error) {
            console.error('태그 데이터 조회 실패:', error);
            const tbody = popupInfo.querySelector('tbody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="3">데이터 조회에 실패했습니다.</td>
                </tr>
            `;
            return {success: false, error: error.message}
        }
    };

    function generateBIPVTable(data) {
        const tbody = data.map(tag => {
            const tagName = tag.tagName.substring(tag.tagName.lastIndexOf('-') + 1);
            let label = '';

            switch (tagName) {
                case 'KW':
                    label = '현재 발전량';
                    break;
                case 'Today_GEN':
                    label = '금일 발전량';
                    break;
                case 'Total_GEN':
                    label = '누적 발전량';
                    break;
                case '현재발전량':
                    label = '종합 현재발전량';
                    break;
                case '금일발전량':
                    label = '종합 금일발전량';
                    break;
                case '급일발전량':
                    label = '종합 급일발전량';
                    break;
                case '누적발전량':
                    label = '종합 누적발전량';
                    break;
                default:
                    label = tagName;
                    break;
            }

            return `
                <tr>
                    <td>${label}</td>
                    <td>${tag.currentValue || '-'}</td>
                </tr>
            `;
        }).join('');

        return `<table style="width: 100%;">
                    <thead>
                        <tr>
                            <th>수집정보</th>
                            <th>측정값</th>
                        </tr>
                    </thead>
                <tbody>
                    ${tbody}
                </tbody>
        </table>`;
    }

    function processUPSData(apiData) {
        const lineVoltageData = { input: {}, output: {} };  // 선간전압
        const phaseVoltageData = { input: {}, output: {} }; // 상간전압
        const currentData = { input: {}, output: {} };      // 전류
        const batteryData = {}; // 축전지 및 기타 단일 데이터
        const statusBtns = {};


        apiData.forEach(item => {
            const { tagName, currentValue } = item;
            const type = tagName.includes('입력') ? 'input' : 'output';

            if (tagName.includes('선간전압')) {
                // 선간전압: L1_L2, L2_L3, L3_L1
                const phase = tagName.split('_').slice(-2).join('_');
                lineVoltageData[type][phase] = currentValue;
            } else if (tagName.includes('상간전압')) {
                // 상간전압: L1_N, L2_N, L3_N
                const phase = tagName.split('_').slice(-2).join('_');
                phaseVoltageData[type][phase] = currentValue;
            } else if (tagName.includes('전류') && (tagName.includes('입력전류') || tagName.includes('출력전류'))) {
                // 전류: L1, L2, L3
                const phase = tagName.split('_').pop();
                currentData[type][phase] = currentValue;
            } else if (tagName.includes('축전지전압')) {
                batteryData.voltage = currentValue;
            } else if (tagName.includes('축전지전류')) {
                batteryData.current = currentValue;
            } else if (tagName.includes('출력주파수')) {
                batteryData.frequency = currentValue;
            } else if(tagName.includes('BYPASSMODE_OFF')) {
                statusBtns.BYPASSMODE_OFF = currentValue;
            } else if(tagName.includes('배터리방전')) {
                statusBtns.배터리방전 = currentValue;
            } else if(tagName.includes('정류부불량')) {
                statusBtns.정류부불량 = currentValue;
            } else if(tagName.includes('인버터이상')) {
                statusBtns.인버터이상 = currentValue;
            } else if(tagName.includes('온도이상')) {
                statusBtns.온도이상 = currentValue;
            }
        });

        return { lineVoltageData, phaseVoltageData, currentData, batteryData, statusBtns };
    }

    function generateUPSTables(lineVoltageData, phaseVoltageData, currentData, batteryData, statusBtns) {
        // 표1: 선간전압
        const lineVoltageTable = `
            
                <table style="width: 100%; margin-bottom: 1rem;">
                    <thead>
                        <tr>
                            <th>PHASE</th>
                            <th>입력선간전압</th>
                            <th>출력선간전압</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${['L1_L2', 'L2_L3', 'L3_L1'].map(phase => `
                            <tr>
                                <td>V ${phase}</td>
                                <td>${lineVoltageData.input[phase] || '-'}V</td>
                                <td>${lineVoltageData.output[phase] || '-'}V</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
          
        `;

        // 표2: 상간전압
        const phaseVoltageTable = `
           
                <table style="width: 100%; margin-bottom: 1rem;">
                    <thead>
                        <tr>
                            <th>PHASE</th>
                            <th>입력상간전압</th>
                            <th>출력상간전압</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${['L1_N', 'L2_N', 'L3_N'].map(phase => `
                            <tr>
                                <td>V ${phase}</td>
                                <td>${phaseVoltageData.input[phase] || '-'}V</td>
                                <td>${phaseVoltageData.output[phase] || '-'}V</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
           
        `;

        // 표3: 전류
        const currentTable = `
           
                <table style="width: 100%;margin-bottom: 1rem;">
                    <thead>
                        <tr>
                            <th>PHASE</th>
                            <th>입력전류</th>
                            <th>출력전류</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${['L1', 'L2', 'L3'].map(phase => `
                            <tr>
                                <td>A ${phase}</td>
                                <td>${currentData.input[phase] || '-'}A</td> 
                                <td>${currentData.output[phase] || '-'}A</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            
        `;

        // 표4: 축전지 및 주파수
        const batteryTable = `
           
                <table style="width: 100%; margin-bottom: 1rem;">
                    <thead>
                        <tr>
                            <th>축전지전압</th>
                            <th>축전지전류</th>
                            <th>출력주파수</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${batteryData.voltage || '-'}V</td>
                            <td>${batteryData.current || '-'}A</td>
                            <td>${batteryData.frequency || '-'}Hz</td>
                        </tr>
                    </tbody>
                </table>
          
        `;

        // UPS 상태 버튼들
        const statusButtons = `
            <div class="alert-buttons" style="margin-top: 12px; display: flex; flex-direction: column; align-items: center;">
                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    ${statusBtns.BYPASSMODE_OFF !== undefined ? `
                        <button type="button" class="button button--solid-middle" style="width: 5rem; height: 1.8rem; ${statusBtns.BYPASSMODE_OFF === '1' ? 'background-color: red; color: white;' : ''}">
                            인버터
                        </button>
                    ` : ''}
                    ${statusBtns.배터리방전 !== undefined ? `
                        <button type="button" class="button button--solid-middle" style="width: 5rem; height: 1.8rem; ${statusBtns.배터리방전 === '1' ? 'background-color: red; color: white;' : ''}">
                            배터리방전
                        </button>
                    ` : ''}
                    ${statusBtns.정류부불량 !== undefined ? `
                        <button type="button" class="button button--solid-middle" style="width: 5rem; height: 1.8rem; ${statusBtns.정류부불량 === '1' ? 'background-color: red; color: white;' : ''}">
                            정류부불량
                        </button>
                    ` : ''}
                </div>
                <div style="display: flex; gap: 8px;">
                    ${statusBtns.인버터이상 !== undefined ? `
                        <button type="button" class="button button--solid-middle" style="width: 5rem; height: 1.8rem; ${statusBtns.인버터이상 === '1' ? 'background-color: red; color: white;' : ''}">
                            인버터이상
                        </button>
                    ` : ''}
                    ${statusBtns.온도이상 !== undefined ? `
                        <button type="button" class="button button--solid-middle" style="width: 5rem; height: 1.8rem; ${statusBtns.온도이상 === '1' ? 'background-color: red; color: white;' : ''}">
                            온도이상
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        return lineVoltageTable + phaseVoltageTable + currentTable + batteryTable + statusButtons;
    }

    const getStatusText = (code) => {
        const STATUS = {
            0: 'Normal',
            1: 'Failed',
            2: 'OutOfService',
            4: 'SystemAlarm',
            128: 'Unload'
        };
        return STATUS[code];
    }

    const addTagsAndShowTagData = async (poiProperty, popupInfo, statusCell) => {
        try {
            // 1. 태그 추가
            const addTagResponse = await addTags(poiProperty.id);
            if(!addTagResponse.success) {
                return {success: false, error: addTagResponse.error || '태그 추가 실패'};
            }

            // 2. 태그 추가 후 SI 서버 처리를 위한 대기 (0.5)
            await new Promise(resolve => setTimeout(resolve, 500));

            // 3. 태그 데이터 조회 및 팝업 렌더링
            await mapTagDataToPopup(poiProperty, popupInfo, statusCell);

            return { success: true };
        } catch (error) {
            console.error('태그 처리 실패:', error);
            return { success: false, error: error.message };
        }
    };

    // 공기조화기/외조기
    function _toOnOff(v) {
        var n = typeof v === 'string' ? Number(v) : v;
        return ({0: 'ON', 1: 'OFF'})[n] || String(v);
    }

    // --- 유틸: 태그 → {type, label} 규칙 매핑 ---
    function _ahuMeta(tagName) {
        if (!tagName) return { type: 'ANALOG', label: '' };

        var m = tagName.match(/(?:^|_)(|SF|RF|EB|DB|SD|EHM|EH|ER|DR|EM|DM|EF|DH|DA|COIL|COIL1|COIL2)_(ST|AL|SS|DM|AL2|ST2)$/);
        if (m) {
            var pre = { SF:'급기휀', RF:'배기휀',
                EB:'전기히터', DB:'필터', SD:'연감지기',
                EHM:'가습기', EH: '전기히터', ER: '전기히터',
                DR: '필터_차압', EM: '전기히터', DM: '필터_차압',
                EF: '배기휀', COIL: '코일', COIL1:'코일1',COIL2:'코일2', DH:'필터_차압', DA:'필터_차압' }[m[1]];
            var suf = { ST:'상태', AL:'경보', SS:'기동', DM: '댐퍼',AL2:'경보2', ST2:'상태2' }[m[2]];
            return { type: 'DIGITAL', label: pre + '_' + suf };
        }

        m = tagName.match(/(?:^|_)(RUN|REL|HC|ENT|MODE)$/);
        if (m) {
            return { type: 'DIGITAL', label: { RUN:'자동운전', REL:'등급해제', HC:'냉난방', ENT:'엔탈피', MODE:'예열운전' }[m[1]] };
        }

        m = tagName.match(/(?:^|_)(SF|RF)_INV$/);
        if (m) {
            return { type: 'ANALOG', label: (m[1] === 'SF' ? '급기휀' : '배기휀') + '_인버터' };
        }

        m = tagName.match(/(?:^|_)COIL_DM_(AL|ST)(\d+)$/);
        if (m) {
            const sufBase = m[1] === 'AL' ? '경보' : '상태';
            return { type: 'DIGITAL', label: `코일댐퍼_${sufBase}${m[2]}` };
        }

        m = tagName.match(/(?:^|_)(C|H)_FLOW(?:_(H|L))?$/);
        if (m) {
            const modeStr = m[1] === 'C' ? '냉방' : '난방';
            return { type: 'ANALOG', label: m[2] ? (modeStr + '_유량' + m[2]) : (modeStr + '_유량') };
        }

        m = tagName.match(/(?:^|_)(FLOW(?:_(H|L))?)$/);
        if (m) {
            return { type: 'ANALOG', label: m[2] ? ('유량' + m[2]) : '유량' };
        }

        m = tagName.match(/(?:^|_)(C|H)_TEMP(\d+)$/);
        if (m) {
            const modeStr = m[1] === 'C' ? '냉방' : '난방';
            return { type: 'ANALOG', label: modeStr + '_밸브온도' + m[2] };
        }

        m = tagName.match(/(?:^|_)TEMP(\d+)$/);
        if (m) {
            return { type: 'ANALOG', label: '밸브온도' + m[1] };
        }

        m = tagName.match(/(?:^|_)(C|H)_BV_P$/);
        if (m) {
            const modeStr = m[1] === 'C' ? '냉방' : '난방';
            return { type: 'ANALOG', label: modeStr + '_밸브개도' };
        }

        if (tagName.toUpperCase().endsWith('_BV_P')) {
            return { type: 'ANALOG', label: '밸브개도' };
        }

        m = tagName.match(/(?:^|_)(C|H)_BV_SET$/);
        if (m) {
            const modeStr = m[1] === 'C' ? '냉방' : '난방';
            return { type: 'ANALOG', label: modeStr + '_밸브설정' };
        }

        if (tagName.toUpperCase().endsWith('_BV_SET')) {
            return { type: 'ANALOG', label: '밸브설정' };
        }




        var FIX = {
            MDT:'혼합온도', SDT:'급기온도', RDT:'환기온도',
            SDH:'급기습도', RDH:'환기습도',
            SA:'급기정압', CO2:'CO2농도',
            SFM:'급기풍량', RFM:'배기풍량',
            ODM:'외기댐퍼', MDM:'혼합댐퍼', EDM:'배기댐퍼', CDM:'동파코일댐퍼',
            DONGPA:'동파방지설정', DONGPA_BV:'동파방지밸브', COIL_TEMP: '코일온도',
            COIL_DM: '코일댐퍼', COIL1_TEMP: '코일1_온도', COIL_DM2: '코일_댐퍼2',
            COIL_DM1: '코일_댐퍼1', COIL2_TEMP: '코일2_온도',
            SET:'설정온도', SEH:'설정습도', SEC:'설정CO', SEP:'설정정압', SEF:'설정풍량',
            MIN:'댐퍼최소', OAENT:'외기엔탈피', RAENT:'환기엔탈피',
            SHZ:'급기HZ', RHZ:'환기HZ', RT: '실내온도', RH: '실내습도', RCO2: '실내CO2농도',
            RA: '환기정압', ODT: '외기온도'
        };
        for (var key in FIX) {
            if (tagName.toUpperCase().endsWith('_' + key)) {
                return { type: 'ANALOG', label: FIX[key] };
            }
        }

        return { type: 'ANALOG', label:  tagName };
    }

    return{
        addTags,
        clearTags,
        mapTagDataToPopup,
        readTags,
        addTagsAndShowTagData
    }

})();