const EventManager = (() => {

    // 이벤트 사이드바 토글
    const eventState = () => {
        const eventStateCtrl = document.querySelector('.event-state__ctrl');
        const eventStateLayer = document.querySelector('.event-state');
        const floorInfo = document.querySelector('.floor-info');
        const toolBox = document.querySelector('.tool-box');

        if (eventStateLayer) {
            eventStateCtrl.addEventListener('click', function () {
                eventStateLayer.classList.toggle('event-state--active');

                if (eventStateLayer.classList.contains('event-state--active')) {
                    toolBox.classList.add('tool-box--active');
                    floorInfo.classList.add('floor-info--active');
                } else {
                    toolBox.classList.remove('tool-box--active');
                    floorInfo.classList.remove('floor-info--active');
                }
            });

        }
    }

    // 알람 초기화
    async function initializeAlarms() {
        try {
            // SSE 연결 시작
            connectToSSE();

        } catch (error) {
            console.error('미해제 알람 조회 실패:', error);
        }
    }

    // SSE 연결
    const connectToSSE = () => {
        const eventSource = new EventSource(`${api.defaults.baseURL}/events/subscribe`);

        // 이벤트 발생 시
        eventSource.addEventListener('newAlarm', async (event) => {
            const alarm = JSON.parse(event.data);
            console.log("alarm : ",alarm);

            removeWarningElements();
            Px.VirtualPatrol.Clear();
            Px.Poi.ShowAll();
            toast(alarm); // 새 토스트 추가
            warningPopup(alarm);
        });

        // 이벤트 해제 메시지 수신
        eventSource.addEventListener('disableAlarm', async (event) => {
            const disableAlarmId = JSON.parse(event.data);
            removeAllAlarmElements(disableAlarmId); // 토스트 포함 모두 제거
        });

        eventSource.onerror = () => {
            console.error("SSE 연결 끊김. 0.5초 후 재연결 시도...");
            eventSource.close();
            setTimeout(connectToSSE, 500);
        };
    };

    // 이벤트 발생 시 모든 팝업 제거용
    function closeAllPopup() {

        const popups = document.querySelectorAll(".popup-basic");
        const elementById = document.getElementById("equipmentListPop");
        const poiMenuList = document.getElementById("poiMenuList");
        const poiMenuListMap = document.getElementById("poiMenuListMap");

        elementById.style.display = 'none';

        popups.forEach(popup => {
            if (popup.style.display === 'inline-block') {
                popup.style.display = 'none';
            }
        });

        poiMenuList.querySelectorAll('.active').forEach(element => {
            element.classList.remove('active');
        });

        if (poiMenuListMap) {
            poiMenuListMap.querySelectorAll('.active').forEach(element => {
                element.classList.remove('active');
            });
        }
    }

    // 토스트 알림
    function toast(alarm) {

        const toast = document.querySelector('.toast');

        closeAllPopup();

        // 새로운 토스트 박스 생성
        const newToastBox = document.createElement('div');
        newToastBox.className = 'toast__box';
        newToastBox.innerHTML = `
            <button type="button" class="toast__close"><span class="hide">close</span></button>
            <input type="hidden" class="alarm-id" value="${alarm.id}">
            <div class="toast__texts">
                <strong>[SMS] ${alarmFormatTime(alarm.occurrenceDate)} </strong>
                <p>[${alarm.alarmType}] ${alarm.buildingNm} ${alarm.floorNm} F </p>
            </div>
        `;

        toast.classList.add('toast--active');
        toast.insertBefore(newToastBox, toast.firstChild);

        // 토스트 삭제
        const closeBtn = newToastBox.querySelector('.toast__close');
        closeBtn.addEventListener('click', () => {
            newToastBox.remove();
        });
    }

    function alarmFormatTime(dateString) {
        const date = new Date(dateString);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    }

    // 경고 팝업
    async function warningPopup(alarm) {
        try {
            const response = await api.get(`/cctv/tag/${alarm.tagName}`);
            const cctvData = response.data;
            const cctvList = cctvData.result;


            // 경고 팝업 생성
            const warningTemplate = createWarningPopup(alarm);
            document.body.appendChild(warningTemplate);
            const warningRect = warningTemplate.getBoundingClientRect();


            // cctv가 있을 경우에만 cctv 팝업 생성
            if (cctvList && cctvList.length > 0) {
                const mainCctv = cctvList.find(cctv => cctv.isMain === 'Y');
                const subCctvs = cctvList.filter(cctv => cctv.isMain === 'N');

                if (mainCctv) {
                    const mainCCTVTemplate = createMainCCTVPopup(mainCctv);
                    mainCCTVTemplate.style.top = `${warningRect.bottom + 10}px`;
                    mainCCTVTemplate.style.left = `${warningRect.left}px`;
                }

                if (subCctvs.length > 0) {
                    const subCCTVTemplate = createSubCCTVPopup(subCctvs);
                    subCCTVTemplate.style.bottom = `${warningRect.top}px`;
                    subCCTVTemplate.style.left = `${warningRect.right + 10}px`;
                }
            }

            // sop 팝업 생성
            const sopTemplate = createSopPopup();
            sopTemplate.style.position = 'fixed';
            sopTemplate.style.left = `${warningRect.left - 10 - sopTemplate.offsetWidth}px`;
            sopTemplate.style.top = `${warningRect.top + (warningRect.height - sopTemplate.offsetHeight) / 2}px`;

            // 이벤트 해제, 3d맵 이동 이벤트
            const buttons = warningTemplate.querySelector('.buttons');
            buttons.querySelector('.button--ghost-middle').onclick = () => handleAlarmConfirm(alarm.id);
            buttons.querySelector('.button--solid-middle').onclick = () => handle3DMapMove(alarm);
        } catch (error) {
            console.log('팝업 생성 실패', error);
        }
    }

    // 이벤트 해제
    async function handleAlarmConfirm(alarmId) {
        try {
            const confirmResponse = await api.patch(`/events/disable/${alarmId}`);
            if (confirmResponse.data.result) {
                removeAllAlarmElements(alarmId);
            }
        } catch (error) {
            console.error("에러 발생:", error);
        }
    }

    // 3d 맵 이동
    async function handle3DMapMove(alarm) {
        try {
            removeWarningElements()

            const response = await api.get(`/poi/tagNames/${alarm.tagName}`);
            const data = response.data;
            const poi = data.result;

            // CCTV 정보 조회
            const cctvResponse = await api.get(`/cctv/tag/${alarm.tagName}`);
            const cctvData = cctvResponse.data;
            const cctvList = cctvData.result;
            const mainCctv = cctvList?.find(cctv => cctv.isMain === 'Y');

            const poiData = Px.Poi.GetData(poi.id);
            const isViewerPage = window.location.pathname.includes('/viewer');

            if (!poiData || isViewerPage) {
                sessionStorage.setItem('selectedPoiId', poi.id);
                sessionStorage.setItem('mainCctv', JSON.stringify(mainCctv));
                window.location.href = `/map?buildingId=${poi.building.id}`; // 파라미터 추가
            } else {
                Px.Model.Visible.Show(String(poiData.property.floorId));
                Px.Poi.Show(poi.id);
                Px.Camera.MoveToPoi({
                    id: poi.id,
                    isAnimation: true,
                    duration: 500,
                    onComplete: () => {
                        Init.renderPoiInfo(poiData);
                        if (mainCctv) {
                            const mainCCTVTemplate = createMainCCTVPopup(mainCctv);
                            mainCCTVTemplate.style.position = 'fixed';
                            // 화면 중앙 높이
                            mainCCTVTemplate.style.top = '50%';
                            mainCCTVTemplate.style.transform = 'translateY(-50%)';

                            // 화면 중앙을 기준으로 CCTV 팝업의 오른쪽 면이 중앙에 오도록
                            mainCCTVTemplate.style.left = `${(window.innerWidth / 2) - mainCCTVTemplate.offsetWidth}px`;
                        }
                    }
                });
            }
        } catch (error) {
            console.error('카메라 이동 실패:', error);
        }
    }


    // 알람 팝업 생성
    function createWarningPopup(alarm) {
        const warningTemplate = document.createElement('div');
        warningTemplate.className = 'popup-warning';
        warningTemplate.innerHTML = `
            <h2 class="popup-warning__head">[${alarm.process}] ${alarm.alarmType}</h2>
            <div class="popup-warning__content">
                <input type="hidden" class="alarm-id" value="${alarm.id}">
                <table>
                    <caption class="hide">경고 알림</caption>
                    <colgroup>
                        <col style="width:40%">
                        <col style="width:100%">
                    </colgroup>
                    <tbody>
                        <tr>
                            <th scope="row">발생 위치</th>
                            <td>${alarm.buildingNm} ${alarm.floorNm}F</td>
                        </tr>
                        <tr>
                            <th scope="row">장비명</th>
                            <td>${alarm.deviceNm}</td>
                        </tr>
                        <tr>
                            <th scope="row">발생 일시</th>
                            <td>${new Date(alarm.occurrenceDate).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <th scope="row">SMS</th>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
                <div class="buttons">
                    <button type="button" class="button button--ghost-middle">이벤트 해제</button>
                    <button type="button" class="button button--solid-middle">3D Map 이동</button>
                </div>
            </div>
        `;
        document.body.appendChild(warningTemplate);
        return warningTemplate;
    }

    // CCTV 스트리밍 초기화 함수
    function initializeCCTVStream(canvasId, cctvCode, cameraIp) {
        const canvasElement = document.getElementById(canvasId);
        if (!canvasElement) return;

        api.get("/cctv/config").then(res => {
            const cctvConfig = res.data.result;
            const livePlayer = new PluxPlayer({
                wsRelayUrl: cctvConfig.wsRelayUrl,
                wsRelayPort: cctvConfig.wsRelayPort,
                httpRelayUrl: cctvConfig.httpRelayUrl,
                httpRelayPort: cctvConfig.httpRelayPort,

                LG_server_ip: cctvConfig.lgServerIp,
                LG_server_port: cctvConfig.lgServerPort,

                LG_live_port: cctvConfig.lgLivePort,
                LG_playback_port: cctvConfig.lgPlaybackPort,
                canvasDom: canvasElement
            });

            livePlayer.getDeviceInfo((cameraList) => {

                const matchedCamera = cameraList.find(camera =>
                    camera["ns1:strIPAddress"] === cameraIp
                );

                const deviceId = matchedCamera["ns1:strCameraID"];
                livePlayer.livePlay(deviceId);
            })

            return livePlayer;

        })
    }

    // MainCCTV 팝업 생성
    function createMainCCTVPopup(mainCctv) {
        const mainCctvTemplate = document.createElement('div');
        mainCctvTemplate.className = 'main-cctv-container';
        const canvasId = `cctv${mainCctv.id}`;
        mainCctvTemplate.innerHTML = `
            <div class="main-cctv-item" data-cctv-id="${mainCctv.id}">
                <div class="cctv-header">
                    <span class="cctv-title">${mainCctv.cctvName || '메인 CCTV'}</span>
                    <button type="button" class="cctv-close">×</button>
                </div>
                <div class="cctv-content">
                    <canvas id="cctv${mainCctv.id}" width="800" height="450"></canvas>
                    <div class="cctv-controls">
                        <button type="button" class="btn-play">▶</button>
                        <button type="button" class="btn-rotate">↻</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(mainCctvTemplate);

        // CCTV 스트리밍 시작
        initializeCCTVStream(canvasId, mainCctv.code);

        mainCctvTemplate.querySelector('.cctv-close').addEventListener('click', (event) => {
            closeEventPopup(event);
        });
        return mainCctvTemplate;
    }

    // SubCCTV 팝업 생성
    function createSubCCTVPopup(subCctvs) {
        const subCctvTemplate = document.createElement('div');
        subCctvTemplate.className = 'cctv-container';

        // CCTV 아이템들을 동적으로 생성
        const cctvItems = subCctvs.map((cctv, index) => {
            const canvasId = `cctv${cctv.id}`;
            return `
            <div class="cctv-item" data-cctv-id="${cctv.id}">
                <div class="cctv-header">
                    <span class="cctv-title">${cctv.cctvName || `CCTV ${index + 1}`}</span>
                    <button type="button" class="cctv-close">×</button>
                </div>
                <div class="cctv-content">
                    <canvas id="cctv${cctv.id}" width="320" height="180"></canvas>
                    <div class="cctv-controls">
                        <button type="button" class="btn-play">▶</button>
                        <button type="button" class="btn-rotate">↻</button>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        subCctvTemplate.innerHTML = `
        <div class="cctv-grid">
            ${cctvItems}
        </div>
    `;

        document.body.appendChild(subCctvTemplate);

        // 각 CCTV 스트리밍 시작
        const players = new Map(); // CCTV ID와 player 인스턴스 매핑
        subCctvs.forEach(cctv => {
            const player = initializeCCTVStream(`cctv${cctv.id}`, cctv.code);
            if (player) players.set(cctv.id, player);
        });


        const closeButtons = subCctvTemplate.querySelectorAll('.cctv-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                closeEventPopup(event);
            });
        });
        return subCctvTemplate;
    }

    // Sop 팝업 생성
    function createSopPopup() {
        const sopTemplate = document.createElement('div');
        sopTemplate.className = 'sop-container';
        sopTemplate.innerHTML =
            `<div class="popup-event popup-event--middle">
                <div class="popup-event__head">
                    <h2 class="name">SOP</h2>
                    <button type="button" class="close"><span class="hide">close</span></button>
                </div>
                <!-- SOP 영역 -->
                <div class="sop-info">
                    <h3 class="sop-info__title">에스컬레이터 끼임 사고</h3>
                    <div class="sop-info__contents">
                        <div class="image">
                            <img src="/static/img/img_sop.png" alt="에스컬레이터 끼임 사고" width="330">
                            <p class="image__text">(정) 홍길동 | 가나다라마팀 | 010-123-456</p>
                            <p class="image__text">(부) 홍길동 | 가나다라마팀 | 010-123-456</p>
                        </div>
                        <div class="manual">
                            <div class="manual__title">매뉴얼</div>
                            <div class="sop-accord">
                                <!-- [D] 아코디언 클릭 시 sop-accord__btn--active 추가 -->
                                <button type="button" class="sop-accord__btn sop-accord__btn--active">
                                    <span class="label">1단계</span>
                                    사고 위치 파악
                                </button>
                                <div class="sop-accord__detail">
                                    <div class="message">
                                        <strong class="message__title">방송 송출</strong>
                                        <p>
                                            안내 방송 송출 문구 표출 <br>
                                            문구 없는 경우 영역 미노출
                                        </p>
                                    </div>
                                    <ul>
                                        <li>1. 사고 위치 파악합니다.</li>
                                        <li>2. 담당 직원을 현장 파견합니다.</li>
                                        <li>3. 사고 범위 및 피해 상황을 보고합니다.</li>
                                    </ul>
                                </div>
                                <!-- [D] 아코디언 클릭 시 sop-accord__btn--active 추가 -->
                                <button type="button" class="sop-accord__btn">
                                    <span class="label">2단계</span>
                                    안내 방송 송출
                                </button>     
                                <div class="sop-accord__detail">
                                    <ul>
                                        <li>1. 사고 위치 파악합니다.</li>
                                        <li>2. 담당 직원을 현장 파견합니다.</li>
                                        <li>3. 사고 범위 및 피해 상황을 보고합니다.</li>
                                    </ul>
                                </div>
                                <!-- [D] 아코디언 클릭 시 sop-accord__btn--active 추가 -->
                                <button type="button" class="sop-accord__btn">
                                    <span class="label">3단계</span>
                                    초동 조치
                                </button>  
                                <div class="sop-accord__detail">
                                    <ul>
                                        <li>1. 사고 위치 파악합니다.</li>
                                        <li>2. 담당 직원을 현장 파견합니다.</li>
                                        <li>3. 사고 범위 및 피해 상황을 보고합니다.</li>
                                    </ul>
                                </div>
                                <!-- [D] 아코디언 클릭 시 sop-accord__btn--active 추가 -->
                                <button type="button" class="sop-accord__btn">
                                    <span class="label">4단계</span>
                                    사고 상황 전파
                                </button>     
                                <div class="sop-accord__detail">
                                    <ul>
                                        <li>1. 사고 위치 파악합니다.</li>
                                        <li>2. 담당 직원을 현장 파견합니다.</li>
                                        <li>3. 사고 범위 및 피해 상황을 보고합니다.</li>
                                    </ul>
                                </div> 
                                <!-- [D] 아코디언 클릭 시 sop-accord__btn--active 추가 -->
                                <button type="button" class="sop-accord__btn">
                                    <span class="label">5단계</span>
                                    상황종료
                                </button>
                                <div class="sop-accord__detail">
                                    <ul>
                                        <li>1. 사고 위치 파악합니다.</li>
                                        <li>2. 담당 직원을 현장 파견합니다.</li>
                                        <li>3. 사고 범위 및 피해 상황을 보고합니다.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
           </div>`

        document.body.appendChild(sopTemplate);

        const closeButton = sopTemplate.querySelector('.close');

        closeButton.addEventListener('click', (event) => {
            closeEventPopup(event);
        });

        return sopTemplate;
    }

    // cctv, sop 팝업 제거
    function closeEventPopup(event) {
        const target = event.target;
        const mainPopup = target.closest('.main-cctv-container');
        const subPopup = target.closest('.cctv-item');
        const sopPopup = target.closest('.sop-container');

        if (sopPopup) {
            sopPopup.remove();
        }
        if (mainPopup) {
            mainPopup.remove();
        }
        if (subPopup) {
            subPopup.remove();
        }
    }


    let currentPage = 1;
    let allEvents = [];

    // 24시간 이벤트 목록 초기화
    const initializeLatest24HoursList = async (itemsPerPage) => {
        try {
            const response = await api.get('/events/latest-24-hours');
            allEvents = response.data;

            // 페이징 UI 추가
            const paginationHTML = `
                <div class="event-state__pagination">
                    <button class="prev-btn" ${currentPage === 1 ? 'disabled' : ''}>이전</button>
                    <span class="current-page">${currentPage}</span>
                    <button class="next-btn" ${currentPage >= Math.ceil(allEvents.result.length / itemsPerPage) ? 'disabled' : ''}>다음</button>
                </div>
            `;

            const tableContainer = document.querySelector('.event-state .table').parentElement;
            tableContainer.insertAdjacentHTML('beforeend', paginationHTML);

            // 페이징 버튼 이벤트 리스너
            document.querySelector('.prev-btn').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderPage(itemsPerPage);
                }
            });

            document.querySelector('.next-btn').addEventListener('click', () => {
                if (currentPage < Math.ceil(allEvents.result.length / itemsPerPage)) {
                    currentPage++;
                    renderPage(itemsPerPage);
                }
            });

            renderPage(itemsPerPage);

        } catch (error) {
            console.error('24시간 이벤트 목록 로딩 실패:', error);
        }
    };

    // 페이지 렌더링 함수
    const renderPage = (itemsPerPage) => {
        const tableBody = document.querySelector('.event-state .table tbody');
        tableBody.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageItems = allEvents.result.slice(startIndex, endIndex);

        pageItems.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.buildingNm || '-'}</td>
                <td>${event.floorNm + 'F' || '-'}</td>
                <td class="ellipsis">${event.alarmType || '-'}</td>
                <td class="ellipsis">${event.deviceNm || '-'}</td>
                <td>${formatTime(event.occurrenceDate)}</td>
            `;
            tableBody.appendChild(row);
        });

        // 빈 행 추가하여 높이 유지
        const emptyRowsNeeded = itemsPerPage - pageItems.length;
        for (let i = 0; i < emptyRowsNeeded; i++) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
            `;
            tableBody.appendChild(emptyRow);
        }

        // 페이징 UI 업데이트
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const currentPageSpan = document.querySelector('.current-page');

        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= Math.ceil(allEvents.result.length / itemsPerPage);
        currentPageSpan.textContent = currentPage;
    };

    // 시간 포맷팅 함수
    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    };

    // 차트 초기화
    const initializeProcessChart = async () => {
        try {
            // 프로세스 차트
            const processResponse = await api.get('/events/process-counts');
            const processData = processResponse.data;

            // 프로세스 차트
            const chartDoughunt = document.getElementById('chart_doughnut');
            new Chart(chartDoughunt, {
                type: 'doughnut',
                data: {
                    labels: processData.result.map(item => item.process),
                    datasets: [{
                        data: processData.result.map(item => item.count)
                    }]
                },
                options: {
                    layout: {
                        padding: {
                            left: 20,
                            right: 20
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'left',
                            align: 'center',
                            labels: {
                                padding: 20,
                                boxWidth: 40,
                                generateLabels: function (chart) {
                                    const data = chart.data;
                                    return data.labels.map((label, i) => ({
                                        text: `${label}: ${data.datasets[0].data[i]}`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        index: i
                                    }));
                                }
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        } catch (error) {
            console.error('차트 초기화 오류:', error);
        }
    }

    // 날짜별 이벤트 통계 차트 초기화
    const initializeDateChart = async () => {
        try {
            const response = await api.get('/events/date-counts');
            const dateData = response.data;

            // 2. 최근 7일 날짜 배열 생성
            const last7Days = Array.from({length: 7}, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
            });

            // 3. 데이터 매핑 (없는 날짜는 0으로)
            const countMap = new Map(
                dateData.result.map(item => {
                    const date = new Date(item.occurrenceDate);
                    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
                    return [formattedDate, item.count];
                })
            );

            // 4. 최종 데이터 준비
            const counts = last7Days.map(date => {
                const count = countMap.get(date) || 0;
                return count;
            });

            // 5. 차트 그리기
            const chartBar = document.getElementById('chart_bar');
            new Chart(chartBar, {
                type: 'bar',
                data: {
                    labels: last7Days,
                    datasets: [{
                        data: counts,
                        borderWidth: 1
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                precision: 0
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        } catch (error) {
            console.error('차트 초기화 오류:', error);
        }
    };

    // 경고 팝업만 제거 (토스트 유지)
    const removeWarningElements = () => {
        // 현재 표시된 경고 팝업 제거
        document.querySelector('.popup-warning')?.remove();
        // 관련된 CCTV, SOP 팝업 제거
        document.querySelector('.main-cctv-container')?.remove();
        document.querySelector('.cctv-container')?.remove();
        document.querySelector('.sop-container')?.remove();
    };

    // 토스트 포함 모든 알람 요소 제거
    const removeAllAlarmElements = (alarmId) => {
        removeWarningElements();

        // 특정 알람 ID의 토스트 제거
        const toastBox = document.querySelector(`.toast__box .alarm-id[value="${alarmId}"]`)?.closest('.toast__box');
        if (toastBox) {
            toastBox.remove();
        }
    };




    return {
        eventState,
        createMainCCTVPopup,
        initializeAlarms,
        initializeLatest24HoursList,
        initializeProcessChart,
        initializeDateChart,
        initializeCCTVStream
    }
})();

