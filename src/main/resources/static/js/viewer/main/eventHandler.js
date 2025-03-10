'use strict';
// TODO 버튼 상호 작용 등 을 넣으시오

(function () {
    // 미니맵
    const zoomInButton = document.querySelector('.tool-box__list .plus');
    const zoomOutButton = document.querySelector('.tool-box__list .minus');
    const homeButton = document.querySelector('.tool-box__list .home');
    const firstViewButton = document.querySelector('.tool-box__list .pov');
    const camera2D = document.querySelector('.tool-box__list .twd');

    let categoryList = [];

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

    function handleFirstView(buildingId) {
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
                }
            },
        );
    }

    function handle2D(buildingId) {
        addButtonPointerEvent(
            camera2D,
            () => {
                // TODO: top-view 위치
                const building = BuildingManager.findById(buildingId);
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
                const building = BuildingManager.findById(buildingId);
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

    document.querySelectorAll("input[type=date], input[type=datetime-local]").forEach((dateInput) => {
        dateInput.addEventListener("change", (event) => {
            event.target.setAttribute("value", event.target.value);
        });
    });

    // 사이드바
    const sideBar = document.getElementById('sidebarLayerPopup');
    const headerTitle = document.querySelector('.popup.sidebar .header-title');
    const contents = document.querySelectorAll('.content');
    const sidebarList = document.querySelectorAll('.sidebar-wrap');
    const poiMenu = document.querySelector('.poi-menu__all .all > a');

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
                        name: floors[0].id,
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
    const equipmentList = document.querySelector('#toggle-menu')
    equipmentList.addEventListener('click', (event) => {
        event.preventDefault();
        const equipmentListPop = document.getElementById('equipmentListPop');
        const equipGroupLinks = document.querySelectorAll('#equipmentListPop .equip-group a');

        if (equipmentListPop.style.display === 'none') {
            equipmentListPop.style.display = 'inline-block';
            categoryList = PoiCategoryManager.findAll();

            equipGroupLinks.forEach(link => {
                const linkClass = link.className.toLowerCase();
                const matchedCategory = categoryList.find(category =>
                    category.name.toLowerCase() === linkClass);

                if (matchedCategory) {
                    link.setAttribute('data-category-id', matchedCategory.id);
                }
            });
        } else {
            equipmentListPop.style.display = 'none';
        }
    });

    // 장비보기 클릭 > popup
    const equipmentGroup = document.querySelectorAll('.equip-group a');
    equipmentGroup.forEach(equipment => {
        equipment.addEventListener('click', function (event) {
            event.preventDefault();
            let categoryId = event.target.getAttribute('data-category-id');
            if (event.target.classList.contains('active')) {
                event.target.classList.remove('active');
                Px.Poi.HideByProperty("poiCategoryId", Number(categoryId));
            } else {
                event.target.classList.add('active');
                Px.Poi.ShowByProperty("poiCategoryId", Number(categoryId));
            }
        });
    });
    // menu list click
    const poiMenuList = document.querySelectorAll('.poi-menu__list li');
    const selectBtn = document.querySelectorAll('.select-box__btn');
    const searchText = document.querySelector('input[name="searchText"]');
    poiMenuList.forEach(item => {
        item.addEventListener('click', function (event) {
            event.preventDefault();
            if (searchText && searchText.value.trim() !== '') {
                searchText.value = '';
            }
            poiMenuList.forEach(li => {
                li.classList.remove('active');
            });
            selectBtn.forEach(btn => {
                if (btn.classList.contains('select-box__btn--active')) {
                    btn.classList.remove('select-box__btn--active');
                }
            })

            const clickedItem = event.target.closest('li');
            let name = clickedItem.className;

            let title = clickedItem.querySelector('span').textContent;
            let id = clickedItem.getAttribute('data-category-id');
            PoiManager.getPoiByCategoryId(id).then(pois => {
                layerPopup.setCategoryData(title, pois);
            })
            if (clickedItem.classList.contains('active')) {
                clickedItem.classList.remove('active');
            } else {
                clickedItem.classList.add('active');
            }
        });
    });

    const closeButton = document.querySelector('#layerPopup .close');
    const popup = document.getElementById('layerPopup');
    closeButton.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // profile btn
    const profileBtn = document.querySelector('.header__info .profile .profile__btn');
    profileBtn.addEventListener('click', () => {
        if (profileBtn.classList.contains('profile__btn--active')) {
            profileBtn.classList.remove('profile__btn--active')
        } else {
            profileBtn.classList.add('profile__btn--active');
        }
    })

    const noticePopup = document.querySelector('.header__info .profile #notice');
    const noticeAlert = document.getElementById('noticeAlert');
    noticePopup.addEventListener('click', async function () {
        const noticeList = await NoticeManager.getNotices();
        if (noticeList.length === 0) {
            noticeAlert.style.display = 'flex'
            noticeAlert.style.position = 'absolute';
            noticeAlert.style.top = '50%';
            noticeAlert.style.left = '50%';
            noticeAlert.style.transform = 'translate(-50%, -50%)';
            noticeAlert.style.zIndex = '30';
            const closeButton = noticeAlert.querySelector('button');
            closeButton.removeAttribute('disabled');
            closeButton.addEventListener('click', function () {
                noticeAlert.style.display = 'none';
            });
        } else {
            const popup = document.getElementById('noticePopup');
            popup.style.display = 'inline-block';
            popup.style.position = 'absolute';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.zIndex = '30';

            pagingNotice(noticeList, 1);
        }
    });

    function pagingNotice(noticeList, itemsPerPage = 1) {
        let currentPage = 1; // 초기 페이지
        const totalPages = Math.ceil(noticeList.length / itemsPerPage);

        const updatePaging = (page) => {
            const startIndex = (page - 1) * itemsPerPage;
            const currentNotice = noticeList[startIndex];

            const noticeTitle = document.querySelector('.notice-info__title p');
            const urgentLabel = document.querySelector('.notice-info__title .label');
            const noticeDate = document.querySelector('.notice-info__date');
            const pagingNumber = document.querySelector('.popup-event__paging .number');
            const noticeContent = document.querySelector('.notice-info__contents p');

            if (currentNotice) {
                noticeTitle.innerHTML = `${currentNotice.title} <span class="badge">N</span>`;
                urgentLabel.style.display = currentNotice.isUrgent ? 'inline' : 'none';
                noticeDate.textContent = formatDate(currentNotice.createdAt);
                noticeContent.textContent = currentNotice.content;
            }

            pagingNumber.innerHTML = `<span class="active">${page}</span>/<span>${totalPages}</span>`;
        };

        updatePaging(currentPage);

        document.querySelector('.popup-event__paging .left').addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                updatePaging(currentPage);
            }
        });

        document.querySelector('.popup-event__paging .right').addEventListener('click', function () {
            if (currentPage < totalPages) {
                currentPage++;
                updatePaging(currentPage);
            }
        });

        const closeBtn = document.querySelector('#noticePopup .close');
        closeBtn.addEventListener('click', function () {
            const popup = document.getElementById('noticePopup');
            popup.style.display = 'none'; // 팝업 숨기기
        });
    }

    // date format
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();

        return `${year}년 ${month.toString().padStart(2, '0')}월 ${day.toString().padStart(2, '0')}일 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    const allCheck = document.getElementById('check');
    allCheck.addEventListener('change', () => {
        if (allCheck.checked) {
            equipmentGroup.forEach(equipment => equipment.classList.add('active'));
            Px.Poi.ShowAll();
        } else {
            equipmentGroup.forEach(equipment => equipment.classList.remove('active'));
            Px.Poi.HideAll();
        }
    })

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

    const ITEMS_PER_PAGE = 8;
    let currentPage = 1;
    let allEvents = [];

    const initializeLatest24HoursList = async () => {
        try {
            const response = await fetch('http://localhost:8085/events/latest-24-hours');
            allEvents = await response.json();
            
            // 페이징 UI 추가
            const paginationHTML = `
                <div class="event-state__pagination">
                    <button class="prev-btn" ${currentPage === 1 ? 'disabled' : ''}>이전</button>
                    <span class="current-page">${currentPage}</span>
                    <button class="next-btn" ${currentPage >= Math.ceil(allEvents.result.length / ITEMS_PER_PAGE) ? 'disabled' : ''}>다음</button>
                </div>
            `;
            
            const tableContainer = document.querySelector('.event-state .table').parentElement;
            tableContainer.insertAdjacentHTML('beforeend', paginationHTML);

            // 페이징 버튼 이벤트 리스너
            document.querySelector('.prev-btn').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderPage();
                }
            });

            document.querySelector('.next-btn').addEventListener('click', () => {
                if (currentPage < Math.ceil(allEvents.result.length / ITEMS_PER_PAGE)) {
                    currentPage++;
                    renderPage();
                }
            });

            renderPage();

        } catch (error) {
            console.error('24시간 이벤트 목록 로딩 실패:', error);
        }
    };

    const renderPage = () => {
        const tableBody = document.querySelector('.event-state .table tbody');
        tableBody.innerHTML = '';

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
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
        const emptyRowsNeeded = ITEMS_PER_PAGE - pageItems.length;
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
        nextBtn.disabled = currentPage >= Math.ceil(allEvents.result.length / ITEMS_PER_PAGE);
        currentPageSpan.textContent = currentPage;
    };

    // 시간 포맷팅 함수
    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    };

    /* Event State */
    function EventState(){
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
    EventState();

    function alarmFormatTime(dateString) {
        const date = new Date(dateString);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    }

    /* Toast */
    function Toast(alarm){

        const toast = document.querySelector('.toast');
        
        // 새로운 토스트 박스 생성
        const newToastBox = document.createElement('div');
        newToastBox.className = 'toast__box';
        newToastBox.innerHTML = `
            <button type="button" class="toast__close"><span class="hide">close</span></button>
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


    (async () => {
        await initializeProcessChart();
        await initializeDateChart();
        await initializeLatest24HoursList();

        const eventSource = new EventSource('http://localhost:8085/events/subscribe');

        eventSource.addEventListener('newAlarm', async (event) => {
            console.log('새로운 알람 도착:', event.data);
            const alarm = JSON.parse(event.data);
            Toast(alarm);

             // 차트와 리스트 업데이트
            await Promise.all([
                initializeProcessChart(),      // 프로세스별 통계 업데이트
                initializeDateChart(),         // 날짜별 통계 업데이트
                // initializeLatest24HoursList()  // 24시간 목록 업데이트
            ]);
        });

        eventSource.onerror = (event) => {
            eventSource.close();
        }
    })();
})();
