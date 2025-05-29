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

            Px.Core.Initialize(container, async () => {

                let sbmDataArray = [];
                if (storeBuilding) {
                    const { buildingFile } = storeBuilding;
                    const version = storeBuilding.getVersion();
                    const { directory } = buildingFile;
                    const kioskSet = new Set(['B2', 'B1', '1F', '2F']);

                    const floors = await BuildingManager.getFloorsByHistoryVersion(version);
                    sbmDataArray = floors
                        .filter(floor => kioskSet.has(floor.name))
                        .map(floor => {
                            const url = `/Building/${directory}/${version}/${floor.sbmFloor[0].sbmFileName}`;
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

    const homeButton = document.querySelector('.kiosk-3d__control .home');
    homeButton.addEventListener('click', async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const kioskCode = urlParams.get('kioskCode');
        if (kioskCode) {
            const kioskPoi = await KioskPoiManager.getKioskPoiByCode(kioskCode);
            Init.moveToKiosk(kioskPoi);
            eventHandler.updateKioskUIState({
                    showFloor: true,
                    floor: kioskPoi.floorNo
            });
        }
    });

    const setFloorList = (storeBuilding, kioskPoi) => {
        const floorTabList = document.getElementById('storeFloorList');
        const kioskInfo    = document.querySelector('.kiosk-info');
        const kioskSet = new Set(['B2', 'B1', '1F', '2F']);
        const nameMap = {
            B2: 'B1',
            B1: 'G1'
        };
        storeBuilding.floors
            .filter(floor => kioskSet.has(floor.name))
            .forEach((floor, index) => {
                const li = document.createElement('li');
                li.setAttribute('role', 'tab');
                li.id = floor.no;

                const button = document.createElement('button');
                button.type = 'button';
                const displayName = nameMap[floor.name] || floor.name;
                button.textContent = displayName;

                if (floor.no === kioskPoi.floorNo) {
                    button.classList.add('active');
                    kioskInfo.textContent = displayName;
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
                const floorNo = li.id;

                const floor = BuildingManager.findFloorsByHistory().find(
                    (floor) => floor.no === Number(floorNo),
                );

                Px.Model.Visible.HideAll();
                Px.Model.Visible.Show(Number(floor.id));
                Px.Camera.MoveToObject(Number(floor.id), 50, 1);
                Px.Poi.HideAll();
                // Px.Poi.ShowByProperty("floorId", Number(floor.id));
                Px.Poi.ShowByProperty("floorNo", Number(floorNo));
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
        const floor = BuildingManager.findFloorsByHistory().find(
            (floor) => floor.no === Number(kioskPoi.floorNo),
        );
        Px.Model.Visible.HideAll();
        Px.Model.Visible.Show(floor.id);
        Px.Poi.HideAll();
        // Px.Poi.ShowByProperty("floorId", floor.id);
        Px.Poi.ShowByProperty("floorNo", kioskPoi.floorNo);
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