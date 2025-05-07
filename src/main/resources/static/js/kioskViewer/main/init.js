'use strict';
(async function () {
    const updateCurrentTime = () => {
        const dateElement = document.querySelector('.kiosk-footer .kiosk-footer__date');
        const now = new Date();

        const year  = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day   = String(now.getDate()).padStart(2, '0');

        const hours24 = now.getHours();
        const ampm    = hours24 < 12 ? '오전' : '오후';
        const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
        const hours   = String(hours12).padStart(2, '0');

        const minutes = String(now.getMinutes()).padStart(2, '0');

        dateElement.innerHTML =
            `${year}년 ${month}월 ${day}일<br>` +
            `${ampm} ${hours}:${minutes}`;
    };

    const setDateTime = () => {
        const renderDateTime = () => {
            const dateTimeFormat = new Intl.DateTimeFormat('ko', {
                dateStyle: 'short',
                timeStyle: 'short',
            });
            const dateTimeString = dateTimeFormat.format(new Date());
        };

        renderDateTime();

        Cron.addCronjob('* * * * * *', renderDateTime);
    };

    // test

    function Vec2(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    Vec2.prototype.set = function(x, y) { this.x = x; this.y = y; return this; };
    Vec2.prototype.subVectors = function(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this;
    };
    Vec2.prototype.multiplyScalar = function(s) {
        this.x *= s;
        this.y *= s;
        return this;
    };
    Vec2.prototype.copy = function(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    };

    const initializeStoreBuilding = async (onComplete) => {
        try {
            const container = document.getElementById('webGLContainer');
            container.innerHTML = '';
            const storeBuilding = await BuildingManager.getStoreBuilding();
            let buildingId = storeBuilding ? storeBuilding.id : null;
            const urlParams = new URLSearchParams(window.location.search);
            const kioskCode = urlParams.get('kioskCode');
            if (!kioskCode) {
                console.error('키오스크 코드가 없습니다.');
                return;
            }
            const kioskPoi = await KioskPoiManager.getKioskPoiByCode(kioskCode);

            const origAdd = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, listener, options) {

                if (this instanceof HTMLCanvasElement &&
                    ['touchstart','touchmove','touchend'].includes(type)) {
                    return;
                }
                return origAdd.call(this, type, listener, options);
            };

            Px.Core.Initialize(container, async () => {

                let sbmDataArray = [];
                if (storeBuilding) {
                    const { buildingFile, floors } = storeBuilding;
                    const { directory } = buildingFile;
                    const kioskSet = new Set(['B2', 'B1', '1F', '2F']);

                    sbmDataArray = floors
                        .filter(floor => kioskSet.has(floor.name))
                        .map(floor => {
                            const url = `/Building/${directory}/${floor.sbmFloor[0].sbmFileName}`;
                            return {
                                url,
                                id: floor.sbmFloor[0].id,
                                displayName: floor.sbmFloor[0].sbmFileName,
                                baseFloor: floor.sbmFloor[0].sbmFloorBase,
                                groupId: floor.sbmFloor[0].sbmFloorGroup,
                            };
                        });
                }

                let lastTap = 0;
                const DOUBLE_TAP_DELAY = 300;

                Px.Loader.LoadSbmUrlArray({
                    urlDataList: sbmDataArray,
                    center: "",
                    onLoad: async function() {
                        await initPoi();
                        Init.moveToKiosk(kioskPoi);
                        Px.Event.On();
                        Px.Event.AddEventListener('pointerup', 'poi', (poiInfo) => {

                            const currentTime = new Date().getTime();
                            const tapLength = currentTime - lastTap;

                            if(tapLength < DOUBLE_TAP_DELAY && tapLength > 0) {
                                popup.showPoiPopup(poiInfo);
                                lastTap = 0;
                            }else{
                                lastTap = currentTime;
                            }

                        });
                        Px.Camera.EnableScreenPanning();
                        EventTarget.prototype.addEventListener = origAdd;
                        const canvas = container.querySelector('canvas');
                        const panStart = new Vec2();
                        const panEnd   = new Vec2();
                        const panDelta = new Vec2();
                        const panSpeed = 1;

                        canvas.style.touchAction = 'none';

                        function pan(dx, dy) {
                            const state = Px.Camera.GetState();
                            state.position.x -= dx;
                            state.position.y += dy;

                            state.target.x -= dx;
                            state.target.y += dy;
                            Px.Camera.SetState(state);
                        }

                        function handleTouchStartPan(e) {
                            if (e.touches.length === 1) {
                                panStart.set(e.touches[0].pageX, e.touches[0].pageY);
                            } else {
                                const x = 0.5 * (e.touches[0].pageX + e.touches[1].pageX);
                                const y = 0.5 * (e.touches[0].pageY + e.touches[1].pageY);
                                panStart.set(x, y);
                            }
                            canvas.addEventListener('touchmove', handleTouchMovePan, { passive: false });
                            canvas.addEventListener('touchend',  handleTouchEndPan);
                        }

                        function handleTouchMovePan(e) {
                            if (e.touches.length === 1) {
                                panEnd.set(e.touches[0].pageX, e.touches[0].pageY);
                            } else {
                                const x = 0.5 * (e.touches[0].pageX + e.touches[1].pageX);
                                const y = 0.5 * (e.touches[0].pageY + e.touches[1].pageY);
                                panEnd.set(x, y);
                            }

                            panDelta.subVectors(panEnd, panStart).multiplyScalar(panSpeed);

                            pan(panDelta.x, panDelta.y);

                            panStart.copy(panEnd);
                        }

                        function handleTouchEndPan() {
                            canvas.removeEventListener('touchmove', handleTouchMovePan);
                            canvas.removeEventListener('touchend',  handleTouchEndPan);
                        }

                        canvas.addEventListener('touchstart', handleTouchStartPan, { passive: false });

                        Px.Effect.Outline.HoverEventOn('area_no');
                        if (onComplete) onComplete();
                        if(storeBuilding?.camera3d)
                            Px.Camera.SetState(JSON.parse(storeBuilding.camera3d));
                    }
                });
            });
            // 층
            setFloorList(storeBuilding, kioskPoi);
            // initLeftSelect(buildingId);
            // initDropUpMenu();

        } catch (error) {
            console.error('PX Engine Initial', error);
        }
    };

    const initPoi = async () => {
        await KioskPoiManager.getKioskPoiList();
        await KioskPoiManager.renderAllPoiToEngine();

    };

    // const moveToKiosk =  (kioskPoi, poiId = '') => {
    //     Px.Model.Visible.HideAll();
    //     Px.Model.Visible.Show(kioskPoi.floorId);
    //     Px.Poi.HideAll();
    //     Px.Poi.ShowByProperty("floorId", kioskPoi.floorId);
    //     Px.Camera.MoveToPoi({
    //         id: kioskPoi.id,
    //         isAnimation: true,
    //         duration: 500,
    //         distanceOffset: 300
    //     });
    // }

    const homeButton = document.querySelector('.kiosk-3d__control .home');
    homeButton.addEventListener('click', async () => {
        const floorList = document.querySelector('#storeFloorList');
        const kioskInfo = document.querySelector('.kiosk-info');
        const urlParams = new URLSearchParams(window.location.search);
        const kioskCode = urlParams.get('kioskCode');
        if (kioskCode) {
            const kioskPoi = await KioskPoiManager.getKioskPoiByCode(kioskCode);
            Init.moveToKiosk(kioskPoi);
            floorList.querySelectorAll('li').forEach((floor) => {
                const btn = floor.querySelector('button');
                if(btn.classList.contains('active')){
                    btn.classList.remove('active');
                }
                if (Number(floor.id) === Number(kioskPoi.floorId)) {
                    btn.classList.add('active');
                    kioskInfo.textContent = floor.innerText;
                }
            })
        }
    });

    const setFloorList = (storeBuilding, kioskPoi) => {
        const floorTabList = document.getElementById('storeFloorList');
        const kioskInfo    = document.querySelector('.kiosk-info');
        const kioskSet = new Set(['B2', 'B1', '1F', '2F']);

        storeBuilding.floors
            .filter(floor => kioskSet.has(floor.name))
            .forEach((floor, index) => {
                const li = document.createElement('li');
                li.setAttribute('role', 'tab');
                li.id = floor.id;

                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = floor.name;

                if (floor.id === kioskPoi.floorId) {
                    button.classList.add('active');
                    kioskInfo.textContent = floor.name;
                }
                li.appendChild(button);
                floorTabList.appendChild(li);
            });

        floorTabList.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const existPoiPopup = document.querySelector('.kiosk-layer__inner.floorInfo__inner')
                if (existPoiPopup) {
                    existPoiPopup.remove();
                }
                floorTabList.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                kioskInfo.textContent = btn.textContent;
                //btn의 상위 노드 li의 id값
                const li = btn.closest('li');
                const floorId = li.id;
                Px.Model.Visible.HideAll();
                Px.Model.Visible.Show(Number(floorId));
                Px.Camera.MoveToObject(Number(floorId), 50, 1);
                Px.Poi.HideAll();
                Px.Poi.ShowByProperty("floorId", Number(floorId));
            });
        });
    };


    setDateTime();
    setInterval(updateCurrentTime, 1000);
    await initializeStoreBuilding();
})();

const Init = (function () {

    const initializeTexture = () => {
        Px.VirtualPatrol.LoadArrowTexture('/static/images/virtualPatrol/arrow.png', function () {
            console.log('화살표 로딩완료');
        });

        Px.VirtualPatrol.LoadCharacterModel('/static/assets/modeling/virtualPatrol/guardman.glb', function () {
            console.log('가상순찰 캐릭터 로딩 완료');
        });
    }

    const moveToKiosk =  (kioskPoi) => {
        Px.Model.Visible.HideAll();
        Px.Model.Visible.Show(kioskPoi.floorId);
        Px.Poi.HideAll();
        Px.Poi.ShowByProperty("floorId", kioskPoi.floorId);
        Px.Camera.MoveToPoi({
            id: kioskPoi.id,
            isAnimation: true,
            duration: 500,
            distanceOffset: 300
        });
    }

    function throttle(callback, interval) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if ((now - lastCall) >= interval) {
                lastCall = now;
                callback(...args);
            }
        }
    }
    function setButtonIconColor(button, color) {
        const buttonIcons = button.querySelectorAll('svg path');
        buttonIcons.forEach((buttonIcon) => {
            buttonIcon.setAttribute('stroke', color);
        });
    }

    function addButtonPointerEvent(button, onAction, offAction) {
        button.addEventListener('pointerup', () => {
            const isOn = button.classList.contains('active');

            setButtonIconColor(button, '#fff');
            if (isOn) {
                setButtonIconColor(button, '#919193');
                button.classList.remove('active');
                button.classList.remove(...activeStyle);
                button.classList.add(...defaultStyle);
                offAction();
            } else {
                button.classList.add('active');
                button.classList.remove(...defaultStyle);
                button.classList.add(...activeStyle);
                onAction();
            }
        });
    }

    function addButtonEvent(button, action, stopAction) {
        button.addEventListener('mousedown', () => {
            if (Px.Camera.FPS.IsOn()) {
                Px.Camera.FPS.Off();
            } else {
                Px.Util.PointPicker.Off();
                setButtonIconColor(firstViewButton, '#919193');
                firstViewButton.classList.remove(...activeStyle);
                firstViewButton.classList.add(...defaultStyle);
                firstViewButton.classList.remove('active');
            }

            setButtonIconColor(button, '#fff');
            button.classList.remove(...defaultStyle);
            button.classList.add(...activeStyle);
            action();
        });

        button.addEventListener('mouseup', () => {
            setButtonIconColor(button, '#919193');
            button.classList.remove(...activeStyle);
            button.classList.add(...defaultStyle);
            if (stopAction) {
                stopAction();
            }
        });

        button.addEventListener('mouseleave', () => {
            setButtonIconColor(button, '#919193');
            button.classList.remove(...activeStyle);
            button.classList.add(...defaultStyle);
            if (stopAction) {
                stopAction();
            }
        });
    }

    const moveToPoi = (id) => {
        let poiId;
        if (id.constructor.name === 'PointerEvent') {
            poiId = id.currentTarget.getAttribute('poiid');
        } else {
            poiId = id;
        }
        const poiData = Px.Poi.GetData(poiId);

        if (poiData) {
            // Px.Model.Visible.HideAll();
            Px.Model.Visible.Show(Number(poiData.property.floorId));
            Px.Camera.MoveToPoi({
                id: poiId,
                isAnimation: true,
                duration: 500,
            });
        } else {
            alertSwal('POI를 배치해주세요');
        }
    };


    const initPatrol = () => {

        Px.VirtualPatrol.LoadArrowTexture('/static/images/virtualPatrol/arrow.png', function () {
            console.log('화살표 로딩완료');
        });

        Px.VirtualPatrol.LoadCharacterModel('/static/assets/modeling/virtualPatrol/guardman.glb', function () {
            console.log('가상순찰 캐릭터 로딩 완료');
        });

        Px.VirtualPatrol.Editor.SetPointCreateCallback(savePoint);	//가상순찰 점찍을때 콜백

    }

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

    return {
        moveToKiosk
    }
})();