const EventManager = (() => {

    // 전역 변수로 연결 상태 관리
    let eventSource = null;
    let reconnectAttempts = 0;
    let reconnectTimeout = null;
    const MAX_RECONNECT_ATTEMPTS = 10;

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
            connectToVmsEventSSE();

        } catch (error) {
            console.error('미해제 알람 조회 실패:', error);
        }
    }

    let lastManifestObjectUrl = null;
    function proxiedStreamUrl(raw) {
        if (!raw) return raw;
        if (raw.toLowerCase().startsWith('https://')) {
            return raw;
        }
        return `/vms-proxy?url=${encodeURIComponent(raw)}`;
    }

    async function getRewrittenManifestUrl(originalM3u8) {
        try {
            if (originalM3u8.toLowerCase().startsWith('https://')) {
                const checkResp = await fetch(originalM3u8);
                if (checkResp.ok) {
                    const text = await checkResp.text();
                    const hasHttpSegment = text
                        .split(/\r?\n/)
                        .some(line => line && !line.startsWith('#') && line.toLowerCase().startsWith('http://'));
                    if (!hasHttpSegment) {
                        return originalM3u8;
                    }
                } else {
                    throw new Error(`failed to fetch original https manifest: ${checkResp.status}`);
                }
            }

            const proxiedPlaylistUrl = proxiedStreamUrl(originalM3u8);
            const resp = await fetch(proxiedPlaylistUrl);
            if (!resp.ok) throw new Error(`manifest fetch failed: ${resp.status}`);
            const text = await resp.text();
            const base = new URL(originalM3u8);
            const lines = text.split(/\r?\n/);

            const rewrittenLines = lines.map(line => {
                if (!line || line.startsWith('#')) return line;
                if (line.toLowerCase().startsWith('https://')) return line;

                let absolute;
                try {
                    absolute = line.startsWith('http') ? line : new URL(line, base).toString();
                } catch {
                    return line;
                }
                return proxiedStreamUrl(absolute);
            });

            const blob = new Blob([rewrittenLines.join('\n')], { type: 'application/vnd.apple.mpegurl' });
            const objectUrl = URL.createObjectURL(blob);
            if (lastManifestObjectUrl && lastManifestObjectUrl !== objectUrl) {
                URL.revokeObjectURL(lastManifestObjectUrl);
            }
            lastManifestObjectUrl = objectUrl;
            return objectUrl;
        } catch (e) {
            console.warn('manifest rewrite failed, fallback to proxied original .m3u8', e);
            return proxiedStreamUrl(originalM3u8);
        }
    }

    const connectToVmsEventSSE = () => {
        console.log('try connectToVmsEventSSE');
        const eventSource = new EventSource('/vms-event/subscribe');

        eventSource.onopen = () => {
            console.log("onopen");
        }

        eventSource.addEventListener('vmsEvent', async (event) => {
            const dto = JSON.parse(event.data);
            console.log('vmsEvent :', dto);

            // 최신 roi_event_list.stream_url 선택 (fallback은 dto.stream_url)
            let streamUrl = dto.stream_url;
            if (Array.isArray(dto.roi_event_list) && dto.roi_event_list.length > 0) {
                const latest = dto.roi_event_list.reduce((prev, curr) =>
                    prev.event_time >= curr.event_time ? prev : curr
                );
                if (latest && latest.stream_url) {
                    streamUrl = latest.stream_url;
                }
            }

            // mixed-content / dynamic upstream 처리
            let usedUrl;
            if (streamUrl.toLowerCase().includes('.m3u8')) {
                usedUrl = await getRewrittenManifestUrl(streamUrl);
            } else {
                usedUrl = proxiedStreamUrl(streamUrl);
            }

            let video = document.getElementById('vmsLatestStream');

            // 중앙 컨테이너
            let container = document.getElementById('vms-video-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'vms-video-container';
                Object.assign(container.style, {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '640px',
                    maxWidth: '100%',
                    aspectRatio: '16/9',
                    zIndex: '9999',
                    background: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '0',
                    margin: '0',
                    borderRadius: '6px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                });
                document.body.appendChild(container);
            } else {
                Object.assign(container.style, {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: '9999',
                });
            }

            // video + close 버튼 생성 보장
            const ensureVideo = () => {
                if (!video) {
                    video = document.createElement('video');
                    video.id = 'vmsLatestStream';
                    video.setAttribute('playsinline', '');
                    video.setAttribute('controls', '');
                    video.autoplay = true;
                    video.muted = true;
                    video.playsInline = true;
                    Object.assign(video.style, {
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        background: 'black',
                    });
                    container.appendChild(video);

                    const closeBtn = document.createElement('button');
                    closeBtn.innerHTML = '&times;';
                    closeBtn.setAttribute('aria-label', 'Close video');
                    Object.assign(closeBtn.style, {
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        color: '#fff',
                        fontSize: '20px',
                        lineHeight: '1',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        zIndex: '10000',
                    });
                    closeBtn.addEventListener('click', () => {
                        if (video) {
                            video.pause();
                            if (video._hls) {
                                video._hls.destroy();
                            }
                        }
                        container.remove();
                    });
                    container.appendChild(closeBtn);
                }
            };
            ensureVideo();

            // 재생 처리
            if (usedUrl.toLowerCase().includes('.m3u8') && window.Hls && Hls.isSupported()) {
                if (video._hls) {
                    video._hls.destroy();
                }
                const hls = new Hls();
                video._hls = hls;
                hls.loadSource(usedUrl);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(() => {});
                });
            } else {
                if (video.src !== usedUrl) {
                    video.src = usedUrl;
                    video.load();
                    video.play().catch(() => {});
                }
            }
        });

        eventSource.onmessage  = e => {
            console.log("e : ", e);
        }

        eventSource.onerror  = err => {
            console.log("err : ", err);
        }
    };

    // SSE 연결
    const connectToSSE = () => {
        // 이미 연결 중이면 중복 실행 방지
        if (eventSource && (eventSource.readyState === EventSource.CONNECTING || eventSource.readyState === EventSource.OPEN)) {
            console.log('이미 SSE 연결 중입니다.');
            return;
        }

        // 최대 재연결 시도 횟수 초과시 중단
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.error('최대 재연결 시도 횟수 초과. 수동으로 새로고침해주세요.');
            return;
        }

        try {
            eventSource = new EventSource(`/events/subscribe`);

            // 이벤트 발생 시
            eventSource.addEventListener('newAlarm', async (event) => {
                try {
                    const alarm = JSON.parse(event.data);
                    console.log("alarm : ", alarm);

                    removeWarningElements();
                    Px.VirtualPatrol.Clear();
                    // Px.Poi.ShowAll();
                    warningPopup(alarm);
                } catch (error) {
                    console.error('알람 데이터 파싱 오류:', error);
                }
            });

            // 이벤트 해제 메시지 수신
            eventSource.addEventListener('disableAlarm', async (event) => {
                try {
                    const disableAlarmId = JSON.parse(event.data);
                    console.log("disableAlarmId : ", disableAlarmId);
                    removeAllAlarmElements(disableAlarmId); // 토스트 포함 모두 제거
                } catch (error) {
                    console.error('알람 해제 데이터 파싱 오류:', error);
                }
            });

            // 연결 성공시
            eventSource.onopen = () => {
                console.log('SSE 연결 성공');
                reconnectAttempts = 0;
                clearTimeout(reconnectTimeout);
            };

            // 에러 발생시
            eventSource.onerror = (error) => {
                console.error("SSE 연결 에러:", error);

                if (eventSource) {
                    eventSource.close();
                    eventSource = null;
                }

                // 재연결 시도
                reconnectAttempts++;
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000); // 최대 30초

                console.log(`${reconnectAttempts}번째 재연결 시도 (${delay}ms 후)...`);

                reconnectTimeout = setTimeout(() => {
                    connectToSSE();
                }, delay);
            };

        } catch (error) {
            console.error('SSE 연결 생성 실패:', error);
            // 에러 발생시에도 재연결 시도
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000);
            reconnectTimeout = setTimeout(() => {
                connectToSSE();
            }, delay);
        }
    };

    // 페이지 이동/닫힘 시 리소스 정리
    const cleanupOnPageUnload = () => {
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }

        if (eventSource) {
            eventSource.close();
            eventSource = null;
        }

        reconnectAttempts = 0;
        console.log('페이지 언로드 시 리소스 정리 완료');
    };

    // 이벤트 리스너 등록
    const initializeEventListeners = () => {
        // 페이지 언로드 시 정리
        window.addEventListener('beforeunload', cleanupOnPageUnload);
        window.addEventListener('unload', cleanupOnPageUnload);
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
    function toast(alarm, poiData) {

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
                <p>[${poiData.property.poiCategoryName}] ${poiData.property.buildingName} ${poiData.property.floorName} </p>
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
            const response = await api.get(`/poi/tagNames/${alarm.tagName}`);
            const alarmedPoi = response.data.result;
            const cctvList = alarmedPoi.cctvList;
            console.log("alarmedPoi : ",alarmedPoi);
            console.log("alarm", alarm);
            const poiData = PoiManager.findById(alarmedPoi.id);

            // toast
            toast(alarm, poiData); // 새 토스트 추가


            // 경고 팝업 생성
            const warningTemplate = createWarningPopup(alarm, poiData);
            document.body.appendChild(warningTemplate);
            const warningRect = warningTemplate.getBoundingClientRect();


            // cctv가 있을 경우에만 cctv 팝업 생성
            if (cctvList && cctvList.length > 0) {
                const mainCctv = cctvList.find(cctv => cctv.isMain === 'Y');
                const subCctvs = cctvList.filter(cctv => cctv.isMain === 'N');

                if (mainCctv) {
                    const mainCCTVTemplate = await createMainCCTVPopup(mainCctv);
                    mainCCTVTemplate.style.top = `${warningRect.bottom + 10}px`;
                    mainCCTVTemplate.style.left = `${warningRect.left}px`;
                }

                if (subCctvs.length > 0) {
                    const subCCTVTemplate = await createSubCCTVPopup(subCctvs);
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
            buttons.querySelector('.button--solid-middle').onclick = () => handle3DMapMove(alarmedPoi);
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
    async function handle3DMapMove(alarmPoi) {
        try {
            removeWarningElements()
            const cctvList = alarmPoi.cctvList;
            const mainCctv = cctvList?.find(cctv => cctv.isMain === 'Y');

            const poiData = Px.Poi.GetData(alarmPoi.id);
            const isViewerPage = window.location.pathname.includes('/viewer');

            if (!poiData || isViewerPage) {
                sessionStorage.setItem('fromEvent', 'Y');
                sessionStorage.setItem('selectedPoiId', alarmPoi.id);
                sessionStorage.setItem('mainCctv', JSON.stringify(mainCctv));
                window.location.href = `/map?buildingId=${alarmPoi.buildingId}`;
            } else {
                Px.Model.Visible.HideAll();

                const floorNo = poiData.property.floorNo;
                Init.moveToFloorPage(floorNo);
                const floorElement = document.querySelector(`li[floor-id="${floorNo}"]`);
                if (floorElement) {
                    floorElement.click();
                }

                Px.Poi.HideAll();
                Px.Poi.ShowByProperty("floorNo", Number(poiData.property.floorNo));
                Px.Camera.MoveToPoi({
                    id: alarmPoi.id,
                    isAnimation: true,
                    duration: 500,
                    heightOffset: 70,
                    onComplete: async () => {
                        Init.renderPoiInfo(poiData);
                        if (mainCctv) {
                            const mainCCTVTemplate = await createMainCCTVPopup(mainCctv);
                            mainCCTVTemplate.style.top = '50%';
                            mainCCTVTemplate.style.transform = 'translateY(-50%)';
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
    function createWarningPopup(alarm, poiData) {
        const warningTemplate = document.createElement('div');
        warningTemplate.className = 'popup-warning';
        warningTemplate.innerHTML = `
            <h2 class="popup-warning__head">[${poiData.property.poiCategoryName}] ${alarm.event}</h2>
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
                            <td>${poiData.property.buildingName} ${poiData.property.floorName}</td>
                        </tr>
                        <tr>
                            <th scope="row">장비명</th>
                            <td>${poiData.property.name}</td>
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
    // window.livePlayers = window.livePlayers || [];
    if (!window.livePlayers) window.livePlayers = {};

    // CCTV 설정을 가져오는 함수
    async function getCCTVConfig() {
        try {
            const res = await api.get("/cctv/config");
            return res.data.result;
        } catch (error) {
            console.error("CCTV 설정을 가져오는 데 실패했습니다:", error);
            return null;
        }
    }

    function createPlayer(config, canvasDom) {
        const player = new PluxPlayer({
            wsRelayUrl: config.wsRelayUrl,
            wsRelayPort: config.wsRelayPort,
            httpRelayUrl: config.httpRelayUrl,
            httpRelayPort: config.httpRelayPort,

            LG_server_ip: config.lgServerIp,
            LG_server_port: config.lgServerPort,

            LG_live_port: config.lgLivePort,
            LG_playback_port: config.lgPlaybackPort,
            canvasDom: canvasDom
        });
        window.livePlayers[canvasDom.id] = player;
        console.log("Player created for canvas:", canvasDom.id);
        return player;
    }

    async function playLiveStream(canvasId, cameraIp) {
        const config = await getCCTVConfig();
        const canvasElement = document.getElementById(canvasId);
        const player = getOrCreatePlayer(canvasId, config, canvasElement);

        try {
            const hlsUrl = await player.getLiveStreamUri(cameraIp, config.username, config.password);
            playLiveJsmpegInCanvas(hlsUrl, canvasElement, player);
            player.cameraIp = cameraIp;
            player.httpRelayUrl = config.httpRelayUrl;
            player.httpRelayPort = config.httpRelayPort;
            player.isLive = true;
        } catch (error) {
            console.error("재생 에러:", error);
            showCctvError(canvasId);
        }
    }


    async function playPlaybackStream(canvasId, cameraIp, startDate, endTime) {
        const config = await getCCTVConfig();
        const canvasElement = document.getElementById(canvasId);
        const player = getOrCreatePlayer(canvasId, config, canvasElement);

        try {
            await player.getDeviceInfo((cameraList) => {
                player.cameraIp = cameraIp;
                player.isLive = false;
                let foundCamera = null;

                if (Array.isArray(cameraList)) {
                    // 배열인 경우
                    foundCamera = cameraList.find(c => c && c["ns1:strIPAddress"] === cameraIp);
                } else if (cameraList && typeof cameraList === 'object') {
                    // 객체인 경우
                    if (cameraList["ns1:strIPAddress"] === cameraIp) {
                        // 단일 카메라 객체인 경우
                        foundCamera = cameraList;
                    } else {
                        // 키-값 형태의 객체인 경우, 값들을 순회
                        foundCamera = Object.values(cameraList).find(c =>
                            c && typeof c === 'object' && c["ns1:strIPAddress"] === cameraIp
                        );
                    }
                }

                const deviceId = foundCamera["ns1:strCameraID"];
                player.playBack(deviceId, startDate, endTime);
            });
        }catch (error) {
            console.error("재생 에러:", error);
            showCctvError(canvasId);

        }
    }

    function showCctvError(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // 캔버스 배경을 어둡게
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 에러 메시지 스타일 설정
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 메인 메시지
        ctx.fillText('영상 불러오기 실패', canvas.width / 2, canvas.height / 2 - 20);
    }

    async function livePlayMove(canvasId, x, y) {
        const config = await getCCTVConfig();
        const canvasElement = document.getElementById(canvasId);
        const player = getOrCreatePlayer(canvasId, config, canvasElement);

        x = (parseInt(-x) / 100).toFixed(6);
        y = (parseInt(y) / 100).toFixed(6);

        await player.ptzControl(player.cameraIp, x, y, config.username, config.password)
    }

    // PTZ 컨트롤 공통 함수
    async function executePTZAction(canvasId, method, value) {
        const config = await getCCTVConfig();
        const canvasElement = document.getElementById(canvasId);
        const player = getOrCreatePlayer(canvasId, config, canvasElement);

        await player[method](player.cameraIp, config.username, config.password, value);
    }

    // Zoom 컨트롤
    async function continuousZoom(canvasId, zoom) {
        await executePTZAction(canvasId, 'continuousZoom', zoom);
    }

    async function stopZoom(canvasId) {
        await executePTZAction(canvasId, 'continuousZoom', 0);
    }

    // Focus 컨트롤
    async function continuousFocus(canvasId, speed) {
        await executePTZAction(canvasId, 'continuousFocus', speed);
    }

    async function stopFocus(canvasId) {
        await executePTZAction(canvasId, 'continuousFocus', 0);
    }

    // Iris 컨트롤
    async function continuousIris(canvasId, speed) {
        await executePTZAction(canvasId, 'continuousIris', speed);
    }

    async function stopIris(canvasId) {
        await executePTZAction(canvasId, 'continuousIris', 0);
    }

    // Camera Reset
    async function resetCamera(canvasId) {
        await executePTZAction(canvasId, 'resetCamera', 0);
    }


    function getOrCreatePlayer(canvasId, config, canvasElement) {
        if (!window.livePlayers[canvasId]) {
            window.livePlayers[canvasId] = createPlayer(config, canvasElement);
        }
        return window.livePlayers[canvasId];
    }

    // video 말고 canvas 에 재생할때
    function playVideoInCanvas(url, canvas, player) {
        const video = document.createElement('video');
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';
        video.style.display = 'none';
        document.body.appendChild(video);
        const ctx = canvas.getContext('2d');
        let rafId;
        player.cancelled = false;
        let hls;
        player.type = 'hls';

        if (Hls.isSupported()) {
            hls = new Hls({
                liveSyncDuration: 0.1,
                liveMaxLatencyDuration: 0.3,
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferLength: 0.5
            });
            hls.loadSource(url);
            hls.attachMedia(video);

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
            });

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => console.error('Play failed:', e));
                rafId = requestAnimationFrame(drawFrame);
            });
        }

        function drawFrame() {
            if (player.cancelled || video.paused || video.ended) return;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            rafId = requestAnimationFrame(drawFrame);
        }

        player.videoEl = video;
        player.rafId = () => rafId;
        player.hls = hls;

        player.cancelDraw = () => {
            player.cancelled = true;
            cancelAnimationFrame(rafId);
            if (hls) {
                hls.stopLoad();
                hls.detachMedia();
                hls.destroy();
            }
            video.pause();
            video.src = '';
            document.body.removeChild(video);
        };
    }

    function playLiveJsmpegInCanvas(wsUrl, canvas, player) {
        if (player.livePlayer) {
            player.cancelDraw();
            player.livePlayer = null;
        }
        const playerInstance = new JSMpeg.Player(wsUrl, {
            canvas: canvas,
            autoplay: true,
            audio: false,
            loop: false,
            videoBufferSize: 1024 * 1024,
            preserveDrawingBuffer: false,
            disableGl: true
        });

        player.cancelDraw = () => {
            try {
                if (player.livePlayer === playerInstance) {
                    if (playerInstance.source && playerInstance.source.socket) {
                        console.log('Closing WebSocket connection');
                        playerInstance.source.socket.close();
                    }
                    playerInstance.destroy();
                    player.livePlayer = null;
                }
            } catch (e) {
                console.warn("destroy error", e);
            }
        };

        player.livePlayer = playerInstance;
        player.type = 'ws';
    }



    // video
    // video 태그로 직접 재생 할때
    function playVideoInVideo(url, videoEl, player) {
        videoEl.controls = true;
        let hls;
        player.cancelled = false;

        if (Hls.isSupported()) {
            hls = new Hls({
                liveSyncDuration: 1.5,
                liveMaxLatencyDuration: 3,
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(videoEl);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (!player.cancelled) {
                    videoEl.play().catch(e => console.error(e));
                }
            });
        }

        player.videoEl = videoEl;
        player.hls = hls || null;
        player.cancelPlay = () => {
            player.cancelled = true;
            if (hls) hls.destroy();
            videoEl.pause();
        };
    }

    function createCctvItem(cctv, index = 0, isMain = false) {
        const canvasId = `cctv-${cctv.id}`;
        // false일 때만 width, height 지정
        const canvasStyle = isMain ? '' : 'width: 340px; height: 180px;';

        return `
        <div class="${isMain ? 'main-cctv-item' : 'cctv-item'}" data-cctv-id="${cctv.id}">
            <div class="cctv-header">
                <span class="cctv-title">${isMain ? '메인 CCTV' : `CCTV ${index + 1}`}  |  ${cctv.name}</span>
                <button type="button" class="cctv-close">×</button>
            </div>
            <div class="cctv-content">
                <canvas id="${canvasId}" style="${canvasStyle}"></canvas>
            </div>
        </div>
    `;
    }


    // MainCCTV 팝업 생성
    async function createMainCCTVPopup(mainCctv) {
        const mainCctvTemplate = document.createElement('div');
        mainCctvTemplate.className = 'main-cctv-container';
        mainCctvTemplate.innerHTML = createCctvItem(mainCctv, 0, true);

        document.body.appendChild(mainCctvTemplate);

        const canvasId = `cctv-${mainCctv.id}`;
        const cameraIp = mainCctv.cameraIp;
        await playLiveStream(canvasId, cameraIp);

        mainCctvTemplate.querySelector('.cctv-close').addEventListener('click', (event) => {
            closeEventPopup(event);
        });
        return mainCctvTemplate;
    }

    // SubCCTV 팝업 생성
    async function createSubCCTVPopup(subCctvs, startDate, endTime) {
        const subCctvTemplate = document.createElement('div');
        subCctvTemplate.className = 'cctv-container';

        const cctvItems = subCctvs.map((cctv, idx) => createCctvItem(cctv, idx, false)).join('');
        subCctvTemplate.innerHTML = `<div class="cctv-grid">${cctvItems}</div>`;

        // 1. 먼저 팝업을 화면에 표시
        document.body.appendChild(subCctvTemplate);

        // 2. 닫기 버튼 이벤트 추가
        const closeButtons = subCctvTemplate.querySelectorAll('.cctv-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                closeEventPopup(event);
            });
        });

        // 3. 각 CCTV 영상을 비동기로 로딩 (대기하지 않음)
        if(startDate && endTime){
            subCctvs.forEach(async (cctv) => {
                const canvasId = `cctv-${cctv.id}`;
                const cameraIp = cctv.cameraIp;
                try {
                    await playPlaybackStream(canvasId, cameraIp, startDate, endTime);
                } catch (error) {
                    console.error(`CCTV ${cctv.id} 로딩 실패:`, error);
                }
            });
        } else {
            subCctvs.forEach(async (cctv) => {
                const canvasId = `cctv-${cctv.id}`;
                const cameraIp = cctv.cameraIp;
                try {
                    await playLiveStream(canvasId, cameraIp);
                } catch (error) {
                    console.error(`CCTV ${cctv.id} 로딩 실패:`, error);
                }
            });
        }

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
        let canvasId;

        if (sopPopup) {
            sopPopup.remove();
        }
        if (mainPopup) {
            mainPopup.remove();
            canvasId = mainPopup.querySelector('canvas');
        }
        if (subPopup) {
            subPopup.remove();
            canvasId = subPopup.querySelector('canvas');
        }
        layerPopup.closePlayer(canvasId ? canvasId.id : null);
    }


    let allEvents = [];

    // 24시간 이벤트 목록 초기화
    const initializeLatest24HoursList = async (maxHeight) => {
        try {
            const response = await api.get('/events/latest-24-hours');
            allEvents = response.data;

            // 기존 페이징 UI 제거
            document.querySelector('.event-state__pagination')?.remove();

            // 컨테이너에 스크롤 적용 (높이는 CSS에서 제어 권장)
            const tableContainer = document.querySelector('.event-state .table').parentElement;
            if (tableContainer) {
                tableContainer.classList.add('table-container');
                tableContainer.style.overflowY = 'auto';
                tableContainer.style.maxHeight = `${maxHeight}rem`; // 필요에 따라 조정
            }

            // 전체 렌더
            renderPage();

        } catch (error) {
            console.error('24시간 이벤트 목록 로딩 실패:', error);
        }
    };

    // 페이지 렌더링 함수
    const renderPage = () => {
        const tableBody = document.querySelector('.event-state .table tbody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        const items = (allEvents && allEvents.result) ? allEvents.result : [];
        items.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.buildingNm || '-'}</td>
                <td>${event.floorNm  || '-'}</td>
                <td class="ellipsis">${event.event || '-'}</td>
                <td class="ellipsis">${event.poiName || '-'}</td>
                <td>${formatTime(event.occurrenceDate)}</td>
            `;
            tableBody.appendChild(row);
        });
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
            const processData = processResponse.data.result;

            const refinedData = processData
                .filter(item => item.count > 0)
                .map(item => ({
                    process: item.process?.trim() || '기타',
                    count: item.count
                }));

            const total = refinedData.reduce((sum, item) => sum + item.count, 0);
            const labels = refinedData.map(item => item.process);
            const data = refinedData.map(item => item.count);

            const colorPalette = [
                '#00BD5B',
                '#2581C4',
                '#06C2C2',
                '#8E44AD',
                '#F39C12',
                '#E74C3C',
                '#36BF64',
                '#3498DB'
            ];
            const processColorMap = {};
            let colorIndex = 0;

            refinedData.forEach(item => {
                const key = item.process;
                if (!processColorMap[key]) {
                    processColorMap[key] = colorPalette[colorIndex % colorPalette.length];
                    colorIndex++;
                }
            });

            const backgroundColor = refinedData.map(item => processColorMap[item.process]);

            const getLast7DaysText = () => {
                const today = new Date();
                const end = new Date(today);
                const start = new Date(today);
                start.setDate(start.getDate() - 6);
                const format = (date) =>
                    date.toLocaleDateString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit'
                    }).replace(/\./g, '').replace(/\s/g, '/');
                return `${format(start)}\n~\n${format(end)}`;
            };

            // 프로세스 차트
            const chartDoughnut = document.getElementById('chart_doughnut').getContext('2d');
            new Chart(chartDoughnut, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{
                        data,
                        backgroundColor,
                        borderWidth: 0
                    }]
                },
                options: {
                    layout: { padding: 0 },
                    cutout: '40%',
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: '#000',
                            callbacks: {
                                label: function (ctx) {
                                    const count = ctx.raw;
                                    const percent = ((count / total) * 100).toFixed(0);
                                    return `${ctx.label} ${count}개 (${percent}%)`;
                                }
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                },
                plugins: [{
                    id: 'centerText',
                    beforeDraw(chart) {
                        const ctx = chart.ctx;
                        ctx.save();

                        const fontSize = 14;
                        ctx.font = `500 ${fontSize}px 'Noto Sans KR', 'Malgun Gothic', sans-serif`;
                        ctx.fillStyle = '#999';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        const text = getLast7DaysText();
                        const lines = text.split('\n');

                        const centerX = chart.chartArea.left + chart.chartArea.width / 2;
                        const centerY = chart.chartArea.top + chart.chartArea.height / 2;

                        lines.forEach((line, i) => {
                            ctx.fillText(line, centerX, centerY + (i - 1) * fontSize);
                        });

                        ctx.restore();
                    }
                }]
            });

            renderCustomLegend(refinedData, processColorMap, total);

        } catch (error) {
            console.error('차트 초기화 오류:', error);
        }
    };

    const relLum = (c) => {
        const v = c/255;
        return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
    };

    const hex2rgb = (hex) => {
        const h = hex.replace('#','');
        return {
            r: parseInt(h.slice(0,2),16),
            g: parseInt(h.slice(2,4),16),
            b: parseInt(h.slice(4,6),16)
        };
    };

    const getReadableTextColor = (hexBg) => {
        const {r,g,b} = hex2rgb(hexBg);
        const Lbg = 0.2126*relLum(r) + 0.7152*relLum(g) + 0.0722*relLum(b);
        const Lwhite = 1, Lblack = 0;
        const contrastWhite = (Math.max(Lwhite, Lbg)+0.05)/(Math.min(Lwhite, Lbg)+0.05);
        const contrastBlack = (Math.max(Lbg, Lblack)+0.05)/(Math.min(Lbg, Lblack)+0.05);
        return contrastWhite >= contrastBlack ? '#fff' : '#000';
    };

    const renderCustomLegend = (refinedData, processColorMap, total) => {
        const container = document.getElementById('custom-legend');
        container.innerHTML = '';

        refinedData.forEach(item => {
            const base = processColorMap[item.process];
            const textColor = getReadableTextColor(base);
            const percent = ((item.count / total) * 100).toFixed(0);

            const row = document.createElement('div');
            row.className = 'legend-row';
            row.innerHTML = `
              <span class="legend-badge" style="background-color:${base}; color:${textColor};">
                ${item.process}
              </span>
              <span class="legend-text">총 ${item.count}개 (${percent}%)</span>
            `;
            container.appendChild(row);
        });
    };

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
            const ctx = chartBar.getContext('2d');

            const gradient = ctx.createLinearGradient(0, 0, 0, chartBar.height);
            gradient.addColorStop(0, '#00F5A0'); // 민트
            gradient.addColorStop(1, '#007CF0');

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: last7Days,
                    datasets: [{
                        data: counts,
                        borderWidth: 0,
                        backgroundColor: gradient,
                        // borderSkipped: false
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: '#000',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            padding: 8,
                            displayColors: false,
                            callbacks: {
                                title: () => '',
                                label: (tooltipItem) => {
                                    return `${tooltipItem.label}, ${tooltipItem.raw}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            offset: true,
                            grid: {
                                color: 'rgba(255,255,255,0.1)'
                            },
                            ticks: {
                                color: '#C8CED6'
                            },
                            categoryPercentage: 0.3,
                            barPercentage: 0.3
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 20,
                                color: '#C8CED6'
                            },
                            grid: {
                                color: 'rgba(255,255,255,0.12)',
                                drawBorder: false
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
        createSubCCTVPopup,
        initializeAlarms,
        initializeLatest24HoursList,
        initializeProcessChart,
        initializeDateChart,
        playLiveStream,
        playPlaybackStream,
        livePlayMove,
        continuousZoom,
        continuousFocus,
        continuousIris,
        resetCamera,
        stopZoom,
        stopFocus,
        stopIris
    }
})();

