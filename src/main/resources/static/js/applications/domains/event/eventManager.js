const EventManager = (()=>{

    // 이벤트 사이드바 토글
    const eventState =() => {
        const eventStateCtrl = document.querySelector('.event-state__ctrl');
        const eventStateLayer = document.querySelector('.event-state');
        const floorInfo = document.querySelector('.floor-info');
        const toolBox = document.querySelector('.tool-box');

        if(eventStateLayer){
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

    // SSE 연결
    const connectToSSE = () => {
        const url = 'http://localhost:8085/events/subscribe';

        const eventSource = new EventSource(url);

        // 이벤트 발생 시
        eventSource.addEventListener('newAlarm', async (event) => {
            const alarm = JSON.parse(event.data);

            Toast(alarm);
            warningPopup(alarm);
        });

        // 이벤트 해제 시
        eventSource.addEventListener('disableAlarm', async (event) => {
            const disableAlarmId = JSON.parse(event.data);
            removeAlarmElements(disableAlarmId);
        });

        eventSource.onerror = () => {
            console.error("SSE 연결 끊김. 0.5초 후 재연결 시도...");
            eventSource.close();
            setTimeout(connectToSSE, 500); // 0.5초 후 재연결
        };
    };

    // 토스트 알림
    function Toast(alarm){

        const toast = document.querySelector('.toast');
        
        // 새로운 토스트 박스 생성
        const newToastBox = document.createElement('div');
        newToastBox.className = 'toast__box';
        newToastBox.innerHTML = `
            <button type="button" class="toast__close"><span class="hide">close</span></button>
            <input type="hidden" class="alarm-id" value="${alarm.id}">
            <div class="toast__texts">
                <strong>[SMS] ${alarmFormatTime(alarm.occurrenceDate)} </strong>
                <p>[${alarm.alarmType}] ${alarm.buildingNm} ${alarm.floorNm} </p>
            </div>
        `;

        toast.classList.add('toast--active');
        toast.insertBefore(newToastBox, toast.firstChild);

        const closeBtn = newToastBox.querySelector('.toast__close');
        closeBtn.addEventListener('click', () => {
            newToastBox.remove();
        });

        // setTimeout(() => {
        //     if(newToastBox && newToastBox.parentElement){
        //         newToastBox.remove();
        //     }
        // }, 10000);

    }

    function alarmFormatTime(dateString) {
        const date = new Date(dateString);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    }

    // 경고 팝업
    function warningPopup(alarm){
        // 새로운 팝업 요소 생성
        const popupTemplate = document.createElement('div');
        popupTemplate.className = 'popup-warning';
        popupTemplate.innerHTML = `
            <h2 class="popup-warning__head">[${alarm.alarmType}] ${alarm.deviceNm}</h2>
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

        // 팝업 위치 계산 (기존 팝업들의 개수에 따라 위치 조정)
        const existingPopups = document.querySelectorAll('.popup-warning');
        const offset = existingPopups.length * 30;

        // 팝업 스타일 설정
        popupTemplate.style.display = 'block';
        popupTemplate.style.position = 'fixed';
        popupTemplate.style.top = `calc(50% + ${offset}px)`;
        popupTemplate.style.left = `calc(50% + ${offset}px)`;
        popupTemplate.style.transform = 'translate(-50%, -50%)';
        popupTemplate.style.zIndex = '9999';


        const buttons = popupTemplate.querySelector('.buttons');

        // 이벤트 해제
        buttons.querySelector('.button--ghost-middle').onclick = async () => {

            const alarmId = popupTemplate.querySelector('.alarm-id').value;

            try {
                const confirmResponse = await fetch(`http://localhost:8085/events/disable/${alarmId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!confirmResponse.ok) throw new Error("confirm-time 업데이트 실패!");

                const responseData = await confirmResponse.json();
                if (responseData.result) {
                    removeAlarmElements(responseData.result);
                }

                } catch (error) {
                    console.error("에러 발생:", error);
                }


            };

        buttons.querySelector('.button--solid-middle').onclick = () => {
            // 3D Map 이동 로직 구현
            popupTemplate.remove();
        };

        // 문서에 팝업 추가
        document.body.appendChild(popupTemplate);
    }

    let currentPage = 1;
    let allEvents = [];

    // 24시간 이벤트 목록 초기화
    const initializeLatest24HoursList = async (itemsPerPage) => {
        try {
            const response = await fetch('http://localhost:8085/events/latest-24-hours');
            allEvents = await response.json();
            
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
                <td>${event.floorNm +'F' || '-'}</td>
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
        try{
            // 프로세스 차트
            const processResponse = await fetch('http://localhost:8085/events/process-counts')
            const processData = await processResponse.json();

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
                                generateLabels: function(chart) {
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
            // 1. 데이터 가져오기
            const response = await fetch('http://localhost:8085/events/date-counts');
            const dateData = await response.json();

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

    const removeAlarmElements = (alarmId) => {
        // 팝업 제거
        document.querySelectorAll('.popup-warning').forEach((popup) => {
            const popupAlarmId = popup.querySelector('.alarm-id').value;
            if (Number(popupAlarmId) === Number(alarmId)) {
                popup.remove();
            }
        });

        // 토스트 제거
        document.querySelectorAll('.toast__box').forEach((box) => {
            const toastAlarmId = box.querySelector('.alarm-id')?.value;
            if (Number(toastAlarmId) === Number(alarmId)) {
                box.remove();
            }
        });
    };


    return {
        eventState,
        connectToSSE,
        initializeLatest24HoursList,
        initializeProcessChart,
        initializeDateChart
    }
})();

