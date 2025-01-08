'use strict';
// TODO 버튼 상호 작용 등 을 넣으시오

(function () {
    // 미니맵
    const zoomInButton = document.querySelector('.control-button.zoom-in');
    const zoomOutButton = document.querySelector('.control-button.zoom-out');
    const homeButton = document.querySelector('.control-button.home');
    const firstViewButton = document.querySelector('.control-button.first-view');
    const topViewButton = document.querySelector('.control-button.top-view');

    const defaultStyle = ['bg-gray-100', 'border-gray-70'];
    const activeStyle = ['bg-primary-80', 'border-primary-60'];

    function setButtonIconColor(button, color) {
        const buttonIcons = button.querySelectorAll('svg path');
        buttonIcons.forEach((buttonIcon) => {
            buttonIcon.setAttribute('stroke', color);
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
                firstViewButton.classList.remove('on');
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

    function addButtonPointerEvent(button, onAction, offAction) {
        button.addEventListener('pointerup', () => {
            const isOn = button.classList.contains('on');

            setButtonIconColor(button, '#fff');
            if (isOn) {
                setButtonIconColor(button, '#919193');
                button.classList.remove('on');
                button.classList.remove(...activeStyle);
                button.classList.add(...defaultStyle);
                offAction();
            } else {
                button.classList.add('on');
                button.classList.remove(...defaultStyle);
                button.classList.add(...activeStyle);
                onAction();
            }
        });
    }

    function handleZoomIn() {
        addButtonEvent(
            zoomInButton,
            () => {
                Px.Camera.StartZoomIn();
            },
            () => {
                Px.Camera.StopZoomIn();
            },
        );
    }

    function handleZoomOut() {
        addButtonEvent(
            zoomOutButton,
            () => {
                Px.Camera.StartZoomOut();
            },
            () => {
                Px.Camera.StopZoomOut();
            },
        );
    }

    function handleExtendView() {
        addButtonEvent(homeButton, () => {
            Px.Camera.ExtendView();
        });
    }

    function handleFirstView() {
        addButtonPointerEvent(
            firstViewButton,
            () => {
                Px.Camera.FPS.On();
            },
            () => {
                if (Px.Camera.FPS.IsOn()) {
                    Px.Camera.FPS.Off();
                } else {
                    Px.Util.PointPicker.Off();
                    Px.Camera.ExtendView();
                    const {camera3d} = BuildingManager.findById(BUILDING_ID);
                    if(camera3d) {
                        Px.Camera.SetState(JSON.parse(camera3d));
                    } else {
                        Px.Camera.ExtendView();
                    }
                }
            },
        );
    }

    function handle2D() {
        addButtonPointerEvent(
            topViewButton,
            () => {
                // TODO: top-view 위치
                const building = BuildingManager.findById(BUILDING_ID);
                const option = JSON.parse(building.camera2d);
                if (option === null) {
                    console.error('2D 카메라 정보가 없습니다.');
                    return;
                }
                option.onComplete = () => {
                    Px.Camera.SetOrthographic();
                };
                Px.Camera.SetState(option);
            },
            () => {
                const building = BuildingManager.findById(BUILDING_ID);
                const option = JSON.parse(building.camera3d);
                if (option === null) {
                    console.error('3D 카메라 정보가 없습니다.');
                    return;
                }
                option.onComplete = () => {
                    Px.Camera.SetPerspective();
                };
                Px.Camera.SetState(option);

            },
        );
    }

    const deviceSearchInput = document.querySelector(
        '.device-search-area .input-wrap input[type=search]',
    );
    const deviceSearchList = document.querySelector(
        '.device-search-area .search-list',
    );
    const deviceSearchListUL = deviceSearchList.querySelector('ul');
    deviceSearchInput.addEventListener('keyup', (event) => {
        const {value} = event.target;
        deviceSearchListUL.innerHTML = '';
        if (value === '') return;

        const poiList = PoiManager.findAll();
        poiList
            .filter((poi) => poi.position !== null && poi.name.toLowerCase().includes(value.toLowerCase()))
            .forEach((poi) => {
                const {id, name} = poi;
                deviceSearchListUL.innerHTML += `<li data-poi-id='${id}'><span>${name}</span></li>`;

                deviceSearchListUL.querySelectorAll('li').forEach((element) => {
                    element.addEventListener('mousedown', (event) => {
                        const {poiId} = event.currentTarget.dataset;
                        popup.closeAllPopup();
                        popup.moveToPoi(Number(poiId), () => popup.setPoiEvent(poiId));
                    });
                });
                deviceSearchList.classList.add('on');
            });

        if (deviceSearchListUL.innerHTML === '') {
            deviceSearchList.classList.remove('on');
        }
    });
    deviceSearchInput.addEventListener('focus', (event) => {
        const {value} = event.target;
        deviceSearchListUL.innerHTML = '';

        if (value === '') return;
        deviceSearchList.classList.add('on');
        const poiList = PoiManager.findAll();
        poiList
            .filter((poi) => poi.position !== null && poi.name.toLowerCase().includes(value.toLowerCase()))
            .forEach((poi) => {
                const {id, name} = poi;
                deviceSearchListUL.innerHTML += `<li data-poi-id='${id}'><span>${name}</span></li>`;
                deviceSearchList.classList.add('on');
            });
    });
    deviceSearchInput.addEventListener('blur', () => {
        deviceSearchListUL.innerHTML = '';
        deviceSearchInput.value = '';
        deviceSearchList.classList.remove('on');
    });

    document
        .querySelector('.left-information .floor .btn-floor-change')
        .addEventListener('pointerup', () => {
            document
                .querySelector('.left-information .floor .btn-floor-change')
                .classList.toggle('on');
            document
                .querySelector(".left-information .floor .floor-list")
                .classList.toggle("on");
        });

    document.querySelectorAll("input[type=date], input[type=datetime-local]").forEach((dateInput) => {
        dateInput.addEventListener("change", (event) => {
            event.target.setAttribute("value", event.target.value);
        });
    });

  document.querySelector('.popup-content.weather .button.inquire').addEventListener('click', () => {
      popup.createWeatherPopup()
  })

    // 사이드바
    const sideBar = document.getElementById('sidebarLayerPopup');
    const headerTitle = document.querySelector('.popup.sidebar .header-title');
    const contents = document.querySelectorAll('.content');
    const sidebarList = document.querySelectorAll('.sidebar-wrap');

    function renderPatrol() {
        const patrolList = PatrolManager.findByBuildingId(BUILDING_ID);
        const patrolContentList = document.querySelector('.patrol-list');
        const buildingInfo = BuildingManager.findById(BUILDING_ID)

        patrolContentList.innerHTML = '';

        const patrolControl = `
           <li class="player-controls">
               <button class="patrol-control-button play-button" data-btn-type="play">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 14L9 22L9 6L21 14Z" fill="#919193" />
                    </svg>
                </button>
               <button class="patrol-control-button pause-button" data-btn-type="pause">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect opacity="0.9" x="9" y="7" width="2" height="14" fill="#919193" />
                        <rect opacity="0.9" x="17" y="7" width="2" height="14" fill="#919193" />
                    </svg>
                </button>
               <button class="patrol-control-button stop-button" data-btn-type="stop">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="state=default, type=reset">
                        <rect id="Rectangle 243" x="7" y="7" width="14" height="14" fill="#919193" />
                    </g>
                </svg>
            </button>
           </li>
        `;

        if (patrolList.length === 0) {
            return patrolContentList.innerHTML += `<div class="error-text">저장된 가상순찰 목록이 없습니다.</div>`
        }

        patrolList.forEach((patrol) => {
            const {id, name, patrolPoints} = patrol;
            const filterPatrol = patrolPoints;

            const patrolPointsHTML = filterPatrol.map((point) => {
                const floorName = buildingInfo.floors.find(floor => floor.id === point.floorId).floorName;

                return `
                         <li class="patrol-path" data-sort-order=${point.sortOrder}>
                            <span>${(point.sortOrder + 1).toString().padStart(2, '0')}</span>
                            <span>
                              <img src="/static/images/viewer/icons/location.svg" alt="location" />
                            </span>
                            <span>${point.sortOrder + 1}_${buildingInfo.name} ${floorName}</span>
                         </li>
                    `;
            })
                .join('');

            patrolContentList.innerHTML += `
                <div class="accordion">
                    <hi class="title" data-id=${id}>${name}
                        <span class="accordion-button">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" >
                            <path d="M2 5H14L8 12L2 5Z" fill="#919193" />
                        </span>
                    </hi>
                    <ul class="content">
                      ${filterPatrol.length === 0
                        ? '<li class="error-text">저장된 가상순찰 목록이 없습니다.</li>'
                        : (patrolControl + patrolPointsHTML)}
                    </ul>
                </div>
            `
        })

        accordionTab();
        controlPatrolPlay();
    }

    function accordionTab() {
        const patrolTitle = document.querySelectorAll('.accordion .title');

        patrolTitle.forEach((title) => {
            title.addEventListener('click', (event) => {
                const target = event.currentTarget;
                const content = target.nextElementSibling;
                const isShowing = target.classList.contains('show');

                patrolTitle.forEach((otherTitle) => {
                    if (otherTitle !== target) {
                        const otherContent = otherTitle.nextElementSibling;
                        otherTitle.classList.remove('show');
                        otherContent.classList.remove('show');
                    }
                });

                target.classList.toggle('show');
                content.classList.toggle('show');




                if (!isShowing && target.classList.contains('show')) {
                    const patrolPoints = document.querySelectorAll('.patrol-path');
                    patrolPoints.forEach((point) => {
                        point.classList.remove('active');
                    });

                    renderPatrolPath();
                    stop();
                    return;
                }

                content.querySelectorAll('.patrol-control-button').forEach((button) => {
                   button.classList.remove('on');
                });

                Px.VirtualPatrol.Clear();
            });
        });
    }

    let currentPatrolIndex = 0;
    let isPaused = false;
    let index = 0;
	let timeoutId;

    const loopPatrolPoints = async (id) => {
        const patrol = PatrolManager.findById(id);
        Px.Model.Collapse({duration: 0});
        for (let i = currentPatrolIndex; i < patrol.patrolPoints.length; i++) {
            currentPatrolIndex = i;
            if (isPaused) {
                break;
            }
            await moveVirtualPatrol(id, patrol);
        }
    }

    const moveVirtualPatrol = async (id, patrol) => {
        CctvEventHandler.cctvPlayerClose();
        return new Promise(function (resolve, reject) {
            const point = patrol.patrolPoints[currentPatrolIndex];

            if (isPaused) {
                return resolve();
            }



            const floor = BuildingManager.findById(patrol.buildingId).floors.find(floor => floor.id === point.floorId);

            const currentFloorName = document.querySelector("body > main > div.left-information > div.floor").dataset.floorName;

            if(currentFloorName !== floor.floorName) {
                Px.VirtualPatrol.RemoveAll();
                Px.VirtualPatrol.Editor.Off();
                Px.VirtualPatrol.Import(PatrolManager.findByIdByImport(id, point.floorId));
                index = 0;

                document.querySelector("body > main > div.left-information > div.floor").dataset.floorName = floor.floorName;
                Px.Model.Visible.HideAll();
                Px.Model.Visible.Show(floor.floorName);
                Px.Poi.HideAll();
                Px.Poi.ShowByProperty("floorId",floor.id);
            }


            const pointLocation = JSON.parse(point.pointLocation);
            // Px.Camera.MoveToPosition(0, 200, pointLocation.x, pointLocation.y, pointLocation.z);

            Px.VirtualPatrol.MoveTo(0, index, 200, 5000, async () => {

                const patrolPointsEle = document.querySelectorAll('.patrol-path');

                patrolPointsEle.forEach((ele) => {
                    const pointSortOrder = Number(ele.getAttribute('data-sort-order'));
                    if (pointSortOrder === point.sortOrder) {
                        ele.classList.add('active');
                        return;
                    }
                    ele.classList.remove('active');
                });


                index++;
                let cctvId = [];
                if (point.pois.length > 0) {
                    const getCctvIdFromPoi = poi => Number(PoiManager.findById(Number(poi)).code.split('-')[1]);
                    cctvId.push(...point.pois.map(getCctvIdFromPoi));
                    CctvEventHandler.cctvPlayerOpen("play", cctvId);
                }
                await sleep();

                return resolve();
            });
        })
    }

    const play = (id) => {
        isPaused = false;
        loopPatrolPoints(id);
    }

    const pause = () => {
        isPaused = true;
    }

    const stop = () => {
        currentPatrolIndex = 0;
        index = 0;
        isPaused = true;

    }

    const sleep = (ms= 6000) => {
        return new Promise(function (resolve, reject) {
            timeoutId = setTimeout(resolve, ms);
        });

    }

    function controlPatrolPlay() {
        const controlButtons = document.querySelectorAll(".player-controls button");

        controlButtons.forEach((item) => {
            item.addEventListener('click', (event) => {
                const id = document.querySelector(".accordion .title.show")?.dataset.id;
                const target = event.currentTarget;

                controlButtons.forEach((button) => {
                    button.classList.remove('on');
                });
                target.classList.add('on');

                switch (item.dataset.btnType) {
                    case 'play':
                        play(id);
                        break;
                    case 'pause':
                        pause();
                        break;
                    case 'stop':
                        stop();
                        break;
                }
            });
        });
    }


    function renderPatrolPath() {
        const id = document.querySelector(".accordion .title.show")?.dataset.id;

        const floorName = document.querySelector("body > main > div.left-information > div.floor").dataset.floorName;

        if(floorName === '') return;

        const floorId = BuildingManager.findById(BUILDING_ID).floors.find(floor => floor.floorName === floorName).id;

        Px.VirtualPatrol.Import(PatrolManager.findByIdByImport(id, floorId));

    }

    const initEventSearchPopup = () => {
        document.querySelector('.event-container .category-tab li.on').classList.remove('on');
        document.querySelector('.event-container .category-tab li.all-category').classList.add('on');

        document.querySelector('.event-container .event-list li.on').classList.remove('on');
        document.querySelector('.event-container .event-list li.all-event').classList.add('on');

        const timezoneOffset = new Date().getTimezoneOffset() * 60000;
        const nowDate = new Date(Date.now() - timezoneOffset).toISOString();

        const start = `${nowDate.split('T')[0]}T00:00`;
        const end = `${nowDate.split('.')[0]}`;

        const eventStart = document.getElementById('eventStart');
        eventStart.setAttribute('value', start);
        eventStart.value = start;

        const eventFinish = document.getElementById('eventFinish');
        eventFinish.setAttribute('value', end);
        eventFinish.value = end;


        document.getElementById('eventStart').value = start;

        popup.createEventList();
    }

    const menuActions = {
        equipment: () => {
            popup.resetFloor();
            updateSidebar('equipment', '장비목록');
        },
        event: () => {
            updateSidebar('event', '이벤트 현황');
            initEventSearchPopup();
        },
        patrol: () => {
            renderPatrol();
            updateSidebar('patrol', '가상순찰');
        },
        evaluation: () => {
            handleEvaluationMenu(true);
        },
        'e-sop': () => {
            window.open(E_SOP_URL, '_blank', 'width=420px,height=880px,scrollbars=yes,top=70,left=1400');
        },
    };

    const menuCloseAction = {
        equipment: () => {
        },
        event: () => {
        },
        patrol: () => {
            isPaused = true;
            Px.VirtualPatrol.Clear();
        },
        evaluation: () => {
            handleEvaluationMenu(false);
        },
        'e-sop': () => {
        },
    }

    function handleEvaluationMenu(on) {
        if(on) {
            EvacRouteHandler.load((isExist) => {
                if (isExist) {
                    const currentFloor = document.querySelector('.left-information .floor .floor-list li.on');
                    const { floorName } = currentFloor.dataset;
                    if (floorName !== '') {
                        Px.Model.Visible.ShowAll();
                        currentFloor.classList.remove('on');
                        document.querySelector(`.left-information .floor .floor-list li[data-floor-name='']`).classList.add('on');

                    }
                    const {floors} = BuildingManager.findById(BUILDING_ID);
                    Px.Model.Expand({
                        name: floors[0].floorName,
                        interval: 200,
                        duration: 1000
                    });
                }
            });
        } else {
            Px.Evac.Clear();
        }
    }

    function updateSidebar(menu, title) {
        sideBar.dataset.menu = menu;
        headerTitle.textContent = title;

        contents.forEach((content) => {
            if (content.classList.contains(`${menu}-container`)) {
                content.style.display = 'grid';
            } else {
                content.style.display = 'none';
            }
        });
    }

    sidebarList.forEach((sidebar) => {
        sidebar.addEventListener('click', (event) => {
            const target = event.currentTarget;
            const isActive = target.classList.contains('active');
            const isEsop = target.classList.contains('e-sop-button');
            const isEvacuation = target.classList.contains('evaluation-button');
            const dataset = target.dataset.menu;

            sidebarList.forEach((sidebarItem) => {
                sidebarItem.classList.remove('active');
            });
            if (!isActive && menuActions.hasOwnProperty(dataset)) {
                if(!isEsop) {
                    if(!isEvacuation) {
                        Px.Evac.Clear();
                        popup.closeAllPopup();
                    }
                    target.classList.add('active');
                }

                menuActions[dataset]();
            } else if(isActive && menuActions.hasOwnProperty(dataset)) {
                menuCloseAction[dataset]();
            }

        });
    });

    handleZoomIn();
    handleZoomOut();
    handleExtendView();
    handleFirstView();
    handle2D();
})();
