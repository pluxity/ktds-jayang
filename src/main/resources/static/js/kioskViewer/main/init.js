'use strict';
(async function () {

    await PoiManager.getPoiList();
    const updateCurrentTime = () => {
        const dateElement = document.querySelector('.kiosk-footer .kiosk-footer__date');

        const now = new Date();

        const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
        const date = String(now.getDate()).padStart(2, '0');
        const day = days[now.getDay()];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const formattedTime = `${year}년 ${month}월 ${date}일(${day} ${hours}:${minutes}:${seconds})`;

        dateElement.textContent = formattedTime;
    }

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

                Px.Loader.LoadSbmUrlArray({
                    urlDataList: sbmDataArray,
                    center: "",
                    onLoad: function() {
                        Px.Model.Visible.ShowAll();
                        Px.Util.SetBackgroundColor('#333333');
                        Px.Camera.FPS.SetHeightOffset(15);
                        Px.Camera.FPS.SetMoveSpeed(500);
                        Px.Event.On();
                        Px.Event.AddEventListener('dblclick', 'poi', (poiInfo) => {
                            showPoiMenu(poiInfo);
                        });
                        Px.Effect.Outline.HoverEventOn('area_no');
                        if (onComplete) onComplete();
                        if(storeBuilding?.camera3d)
                            Px.Camera.SetState(JSON.parse(storeBuilding.camera3d));
                    }
                });
            });
            // 층
            setFloorList(storeBuilding);

            const footerButtons = document.querySelectorAll('.kiosk-footer__buttons button[role="tab"]');
            footerButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    footerButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });

            // initLeftSelect(buildingId);
            // initDropUpMenu();

        } catch (error) {
            console.error('PX Engine Initial', error);
        }
    };

    const setFloorList = (storeBuilding) => {
        const floorTabList = document.getElementById('storeFloorList');
        const kioskInfo    = document.querySelector('.kiosk-info');

        storeBuilding.floors.forEach((floor, index) => {
            const li = document.createElement('li');
            li.setAttribute('role', 'tab');
            li.id = `floor-${floor.id}`;

            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = floor.name;
            if (index === 0) {
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
            });
        });
    };
    const setControlBtn = () => {
        const zoomInButton = document.querySelector('.kiosk-3d__control.plus');
        const zoomOutButton = document.querySelector('.kiosk-3d__control.minus');
        const homeButton = document.querySelector('.kiosk-3d__control.home');
    }

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

    const initPoi = async (buildingId) => {
        PoiManager.renderAllPoiToEngineByBuildingId(buildingId);

        document.querySelector('#webGLContainer').addEventListener('pointerup', () => {
            const popupList = document.querySelectorAll(
                '#webGLContainer .dropdown-content',
            );
            popupList.forEach((popup) => {
                popup.remove();
            });
        });

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