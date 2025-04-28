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
                    const { buildingFile, floors } = storeBuilding;
                    const { directory } = buildingFile;
                    sbmDataArray = floors.map((floor) => {
                        const url = `/Building/${directory}/${floor.sbmFloor[0].sbmFileName}`;
                        const sbmData = {
                            url,
                            id: floor.sbmFloor[0].id,
                            displayName: floor.sbmFloor[0].sbmFileName,
                            baseFloor: floor.sbmFloor[0].sbmFloorBase,
                            groupId: floor.sbmFloor[0].sbmFloorGroup,
                        };
                        return sbmData;
                    });
                }

                let lastTab = 0;
                const DOUBLE_TAB_DELAY = 300;

                Px.Loader.LoadSbmUrlArray({
                    urlDataList: sbmDataArray,
                    center: "",
                    onLoad: async function() {
                        await initPoi();
                        moveToKiosk(kioskPoi);
                        Px.Event.On();
                        Px.Event.AddEventListener('pointerup', 'poi', (poiInfo) => {

                            const currentTime = new Date().getTime();
                            const tabLength = currentTime - lastTab;

                            if(tabLength < DOUBLE_TAB_DELAY && tabLength > 0) {
                                popup.showPoiPopup(poiInfo);
                                Px.Camera.MoveToPoi({
                                    id: poiInfo.id,
                                    isAnimation: true,
                                    duration: 500,
                                });
                                lastTab = 0;
                            }else{
                                lastTab = currentTime;
                            }

                        });
                        Px.Effect.Outline.HoverEventOn('area_no');
                        if (onComplete) onComplete();
                        if(storeBuilding?.camera3d)
                            Px.Camera.SetState(JSON.parse(storeBuilding.camera3d));
                    }
                });
            });
            // 층
            setFloorList(storeBuilding, kioskPoi);

            const footerButtons = document.querySelectorAll('.kiosk-footer__buttons button[role="tab"]');
            const footerPanels  = document.querySelectorAll('.kiosk-footer__contents[role="tabpanel"]');

            footerButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    footerButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    footerPanels.forEach(panel => {
                        const labelled = panel.getAttribute('aria-labelledby');
                        panel.style.display = (labelled === btn.id) ? '' : 'none';
                    });
                });
            });
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

    const moveToKiosk =  (kioskPoi) => {
        Px.Model.Visible.HideAll();
        Px.Model.Visible.Show(kioskPoi.floorId);
        Px.Poi.HideAll();
        Px.Poi.ShowByProperty("floorId", kioskPoi.floorId);
        Px.Camera.MoveToPoi({
            id: kioskPoi.id,
            isAnimation: true,
            duration: 500,
            distanceOffset: 1000
        });
    }

    const homeButton = document.querySelector('.kiosk-3d__control .home');
    homeButton.addEventListener('click', async () => {
        const floorList = document.querySelector('#storeFloorList');
        const kioskInfo = document.querySelector('.kiosk-info');
        const urlParams = new URLSearchParams(window.location.search);
        const kioskCode = urlParams.get('kioskCode');
        if (kioskCode) {
            const kioskPoi = await KioskPoiManager.getKioskPoiByCode(kioskCode);
            moveToKiosk(kioskPoi);
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

        storeBuilding.floors.forEach((floor, index) => {
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
                floorTabList.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                kioskInfo.textContent = btn.textContent;
                //btn의 상위 노드 li의 id값
                const li = btn.closest('li');
                const floorId = li.id;
                Px.Model.Visible.HideAll();
                Px.Model.Visible.Show(Number(floorId));
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

    }
})();