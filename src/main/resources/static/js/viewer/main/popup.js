'use strict';

const layerPopup = (function () {
    const systemTabs = document.querySelectorAll('.system-tap li');
    const systemPop = document.getElementById("systemPopup");
    // 센서
    const createSensorPopup = (title, state, eventData) => {

        const sensorPopup = document.querySelector('.popup.sensor');
        const popupHeader = document.querySelector('.popup-header');
        const stateName = document.querySelector('.state-name')
        const smokeState = document.querySelector('.smoke-state')
        const temperatureState = document.querySelector('.temperature-state');
        const fireContent = document.querySelector('.popup-table.fire tbody.fire-content');
        const tmsContent = document.querySelector('.popup-table.fire tbody.tms-content');
        fireContent.style.display = '';
        tmsContent.style.display = 'none';


        const displayElements = ['.event-name', '.state-name'];
        displayElements.forEach((element) => { document.querySelector(element).closest('tr').style.display = ''; });
        document.querySelector('.popup-table.event').style.height = ``;


        const styleReturn = (state) => {
            switch (state) {
                case '경고':
                    return{
                        headerStyle : 'bg-warning-light',
                        background : 'bg-warning',
                        font : 'text-warning',
                    };
                    break;
                case '위험':
                    return {
                        headerStyle : 'bg-danger-light',
                        background : 'bg-danger',
                        font : 'text-danger',
                    }
                    break;
                case '정상':
                    return {
                        headerStyle : 'bg-gray-110',
                        background : 'bg-primary-110',
                        font : 'text-primary-80',
                    }
                    break;
                default:
                    return {
                        headerStyle : '',
                        background : '',
                        font : '',
                    }
                    break;
            }
        }

        let stateStyle = styleReturn(state);

        const styleText = (type) => {
            if (type === '') {
                return '';
            } else if (type === '00') {
                return '정상';
            } else {
                return '위험';
            }
        }
        let smokeStyle = styleReturn(styleText(eventData.smoketype));
        let temperatureStyle = styleReturn(styleText(eventData.temptype));

        const checkClassList = (element, classNames) => {
            classNames.forEach(className => {
                if (!element.classList.contains(className)) {
                    if(className !== '') element.classList.add(className);
                }
            });
        };

        popupHeader.classList.remove('bg-warning-light', 'bg-danger-light', 'bg-gray-110');
        stateName.classList.remove('bg-warning', 'bg-danger', 'bg-primary-110', 'text-warning', 'text-danger', 'text-primary-80');
        smokeState.classList.remove('bg-warning', 'bg-danger', 'bg-primary-110', 'text-warning', 'text-danger', 'text-primary-80');
        temperatureState.classList.remove('bg-warning', 'bg-danger', 'bg-primary-110', 'text-warning', 'text-danger', 'text-primary-80');

        sensorPopup.classList.add('open');
        checkClassList(popupHeader, [ stateStyle.headerStyle ]);
        checkClassList(stateName, [ stateStyle.background, stateStyle.font ]);
        checkClassList(smokeState, [ smokeStyle.background, smokeStyle.font ]);
        checkClassList(temperatureState, [ temperatureStyle.background, temperatureStyle.font ]);

        const elements = {
            '.header-title': title,
            '.state-name': eventData.state,
            '.event-name': eventData.code,
            '.location-name': eventData.location,
            '.occurrence-date': eventData.datetime.replace('T',' '),
            '.smoke-state': eventData.smoketype === '' ? '-' : eventData.smoketype === '00' ? '정상' : '위험',
            '.temperature-state': eventData.tempvalue === '' ? '-' : eventData.tempvalue,
        };

        for (const selector in elements) {
            const element = document.querySelector(selector);
            element.textContent = elements[selector];
        }

        const fireTable = document.querySelector('.popup-table.fire');

        if (eventData.smoketype || eventData.tempvalue) {
            fireTable.style.display = 'table';
        } else {
            fireTable.style.display = 'none';
        }

        return sensorPopup;
    };


    const createTmsPopup = (name, location, dataList) => {

        const sensorPopup = document.querySelector('.popup.sensor');
        const popupHeader = document.querySelector('.popup-header');
        const stateName = document.querySelector('.state-name');



        const styleReturn = (state) => {
            switch (state) {
                case 1:
                    return {
                        background : 'bg-danger',
                        font : 'text-danger',
                    }
                    break;
                case 0:
                    return {
                        background : 'bg-primary-110',
                        font : 'text-primary-80',
                    }
                    break;
                default:
                    return {
                        background : 'bg-primary-110',
                        font : 'text-primary-80',
                    }
                    break;
            }
        }

        for (const data of dataList) {
            const tmsCodeLimit = TmsEventHandler.tmsLimit[data.deviceCode];

            const currentValue = data.value;
            const limitValue = tmsCodeLimit[data.itemCode];

            data.limitCode = 0;
            if (limitValue !== null && currentValue !== null) {
                if (currentValue >= limitValue) {
                    data.limitCode = 1;
                }
            } else if(data.itemCode === "SAM00") {
                if(currentValue > 5.0 || currentValue < 3.0) data.limitCode = 1;
            }
            data.limitValue = limitValue;
            data.style = styleReturn(data.limitCode);
            data.name = TmsEventHandler.tmsName[data.itemCode];
        }
        popupHeader.classList.add('bg-gray-110');
        popupHeader.classList.remove('bg-warning-light', 'bg-danger-light');
        stateName.classList.remove('bg-warning', 'bg-danger', 'bg-primary-110', 'text-warning', 'text-danger', 'text-primary-80');
        sensorPopup.classList.add('open');

        const displayElements = ['.event-name', '.state-name'];
        displayElements.forEach((element) => { document.querySelector(element).closest('tr').style.display = 'none'; });
        const height = document.querySelector('.event-name').closest('table').offsetHeight;
        document.querySelector('.popup-table.event').style.height = `${height}px`;


        const filter = dataList.filter(data => data.name !== undefined);
        const elements = {
            '.header-title': name,
            '.state-name': '-',
            '.event-name': '-',
            '.location-name': location,
            '.occurrence-date': filter.length <= 0 ? '' : filter[0].datetime.replace('T',' '),
        };

        for (const selector in elements) {
            const element = document.querySelector(selector);
            element.textContent = elements[selector];
        }

        const fireTable = document.querySelector('.popup-table.fire');

        const fireContent = fireTable.querySelector('tbody.fire-content');
        fireContent.style.display = 'none';

        const tbody = fireTable.querySelector('tbody.tms-content');
        tbody.style.display = '';
        tbody.innerHTML = `<tr>
                                <th>항목</th>
                                <td class="category-name">배출기준</td>
                                <td class="category-name">상태값</td>
                            </tr>`;

        const dataSortList = dataList.filter(data => data.name !== undefined).sort((a, b) => a.itemCode.localeCompare(b.itemCode, 'ko'));

        for (const data of dataSortList) {
            tbody.innerHTML += `<tr>
                                    <th>${data["name"]}</th>
                                    <td class="">${(data["limitValue"] !== undefined && data["limitValue"] !== null) ? data["limitValue"] : '-'}</td>
                                    <td class="${data["style"].background} ${data["style"].font}">${(data["value"] !== undefined && data["value"] !== null) ? data["value"] : '-'}</td>
                                </tr>`;
        }
        return sensorPopup;
    };


    const hidePopup = () => {
        document.querySelector('#sensorLayerPopup .popup').classList.remove('open');
        const motionPictogram = document.querySelector('#sensorLayerPopup .motion-pictogram');
        if(motionPictogram) motionPictogram.remove();

        const evacRouteBtn = document.querySelector('.evaluation-button');
        if (evacRouteBtn.classList.contains('active')) {
            evacRouteBtn.classList.remove('active');
            Px.Evac.Clear();
        }

        document.getElementById('dimSensorLayerPopup').classList.remove('on');
    };
    document.querySelectorAll('.sensor-close-button, .button.confirm').forEach((button) => button.addEventListener('click', () => hidePopup()));

    // 지진정보
    const createEarthquakePopup = (earthquakeData) => {
        const earthquakePopup = document.querySelector('.popup.earthquake');
        const earthquakeTable = document.querySelector('.popup-table.earthquake tbody');
        earthquakeTable.innerHTML = '';

        const earthquakeImgBox = document.querySelector('.earthquake-img-box');
        const earthquakeImg = document.createElement('img');
        earthquakeImg.src = earthquakeData[0].img;
        earthquakeImgBox.innerHTML = '';
        earthquakeImgBox.appendChild(earthquakeImg);

        const prevSelectedRow = earthquakeTable.querySelector('.selected-row');
        if (prevSelectedRow) {
            prevSelectedRow.classList.remove('selected-row');
        }

        earthquakeData.forEach((data) => {
            const earthquakeItem = document.createElement('tr');
            const date = data.tmEqk.toString();
            const [year, month, day, hour, min, sec] = [
                date.slice(0, 4),
                date.slice(4, 6),
                date.slice(6, 8),
                date.slice(8, 10),
                date.slice(10, 12),
                date.slice(12, 14),
            ];

            const formattedDate = `${year}/${month}/${day} ${hour}:${min}:${sec}`;

            earthquakeItem.innerHTML = `
          <td class='occurrence-date'>${formattedDate}</td>
          <td class='scale-state'>${data.mt}</td>
          <td class='location-name'>${data.loc}</td>
        `;

            earthquakeItem.addEventListener('click', () => {
                earthquakeTable.querySelectorAll('tr').forEach((row) => {
                    row.classList.remove('selected-row');
                });
                earthquakeItem.classList.add('selected-row');

                earthquakeImg.src = data.img;
            });

            earthquakeTable.appendChild(earthquakeItem);
        });

        return earthquakePopup;
    };

    const openPlaybackCctv = (deviceId, datetime) => {
        const poi = PoiManager.findByCode(deviceId);
        const { poiCameras } = poi;
        const timeOffset = 9 * 60 * 60 * 1000;
        const date = new Date(datetime);
        date.setSeconds(date.getSeconds() - 10);
        const eventTime = new Date(date.getTime() + timeOffset).toISOString();
        const playbackTime = eventTime.split('.')[0].replace(/-|T|:/g, '');

        let ids = poiCameras?.map(camera => camera.code.split('-')[1]);
        if(deviceId.includes("CCTV-")) {
            ids = [deviceId.split('-')[1]];
        }

        // CctvEventHandler.cctvPlayerClose();
        CctvEventHandler.cctvPlayerOpen('playback', ids, playbackTime)
    }

    // 최근 이벤트
    const createRecentPopup = () => {
        const recentPopup = document.querySelector('.popup.recent');
        const eventList = recentPopup.querySelectorAll('.event-list li');

        eventList.forEach((eventItem) => {
            eventItem.addEventListener('click', (event) => {
                const target = event.currentTarget;
                const { eventLevel } = target.dataset;

                document.querySelector('.popup.recent .event-list li.on').classList.remove('on');
                target.classList.add('on');

                const filteredData = EventDataManager.findEventByEventLevel('latest', eventLevel);
                updateRecentEventList(filteredData);
            });
        });

        eventList[0].classList.add('on');
        updateRecentEventList(EventDataManager.findEventByEventLevel('latest', 'total'));

        return recentPopup;
    };

    const updateRecentEventList = (data) => {
        const recentTable = document.querySelector('.popup-table.recent tbody');
        recentTable.innerHTML = '';

        data.forEach((dataItem) => {
            const { id, deviceName, eventType, eventLevel, location, datetime, video } = dataItem;
            const recentItem = document.createElement('tr');
            const recentEvent = document.createElement('span');
            const recentVideo = document.createElement('span');
            recentVideo.innerHTML = `<svg width='18' height='18' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M21 14L9 22L9 6L21 14Z' fill='#919193'/>
          </svg>영상`;

            if (eventLevel.toLowerCase() === 'danger') {
                recentEvent.classList.add('text-danger');
                recentEvent.innerText = eventType;
            } else if (eventLevel.toLowerCase() === 'warning') {
                recentEvent.classList.add('text-warning');
                recentEvent.innerText = eventType;
            } else {
                recentEvent.classList.add('text-no_received');
                recentEvent.innerText = '고장';
            }


            recentItem.innerHTML = `
            <td class='name'><span>${deviceName ? (deviceName.length > 15 ? `${deviceName.slice(0, 15)}...` : deviceName) : ''}</span></td>
            <td class='event'></td>
            <td class='location'><span>${location ? location : ''}</span></td>
            <td class='date'><span>${datetime}</span></td>
            <td class='video'></td>
          `;

            recentItem.querySelector('.event').appendChild(recentEvent);
            if(video) {
                recentItem.querySelector('.video').appendChild(recentVideo);
            }

            recentTable.appendChild(recentItem);
            recentItem.dataset.eventId = id;
        });
        document.querySelector('.recent-tbody').scrollTop = 0;

        document.querySelectorAll('.popup-table.recent tbody tr').forEach((eventItem) => {
            eventItem.addEventListener('click', (event) => {
                const target = event.currentTarget;
                const { eventId } = target.dataset;

                const eventData = EventDataManager.findEventById('latest', eventId);
                EventListHandler.clickEventList(eventData, 'latest');
            })
        })

        document.querySelectorAll('.popup-table.recent tbody tr td.video span').forEach((btnCctv) => {
            btnCctv.addEventListener('click', (event) => {
                event.stopPropagation();
                const { eventId } = event.currentTarget.closest('tr').dataset;

                const { deviceId, datetime } = EventDataManager.findEventById('latest', eventId);
                openPlaybackCctv(deviceId, datetime);
            })
        })

    };

    const newRecentEvent = (eventData) => {
        const { id, deviceName, eventType, eventLevel, location, datetime, video } = eventData;

        const recentLayerPopup = document.getElementById('recentLayerPopup');
        if(!recentLayerPopup.classList.contains('open')) return;

        const {eventLevel: currentEventLevel} = recentLayerPopup.querySelector('.event-list li.on').dataset;
        if(currentEventLevel !== 'total' && currentEventLevel !== eventLevel.toLowerCase()) return;

        const latestItem = document.querySelector('.popup-table.recent tbody tr:first-of-type');
        const newItem = document.createElement('tr');
        const eventTag = document.createElement('span');
        const btnVideo = document.createElement('span');
        btnVideo.innerHTML = `<svg width='18' height='18' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M21 14L9 22L9 6L21 14Z' fill='#919193'/>
          </svg>영상`;

        if (eventLevel.toLowerCase() === 'danger') {
            eventTag.classList.add('text-danger');
            eventTag.innerText = eventType;
        } else if (eventLevel.toLowerCase() === 'warning') {
            eventTag.classList.add('text-warning');
            eventTag.innerText = eventType;
        } else {
            eventTag.classList.add('text-no_received');
            eventTag.innerText = '-';
        }

        newItem.innerHTML = `
            <td class='name'><span>${deviceName ? (deviceName.length > 15 ? `${deviceName.slice(0, 15)}...` : deviceName) : ''}</span></td>
            <td class='event'></td>
            <td class='location'><span>${location}</span></td>
            <td class='date'><span>${datetime}</span></td>
            <td class='video'></td>
          `;

        newItem.querySelector('.event').appendChild(eventTag);
        if(video) {
            newItem.querySelector('.video').appendChild(btnVideo);
        }

        latestItem.before(newItem);
        newItem.dataset.eventId = id;

        document.querySelector(`.popup-table.recent tbody tr[data-event-id='${id}']`).addEventListener('click', (event) => {
            const target = event.currentTarget;
            const {eventId} = target.dataset;
            const eventData = EventDataManager.findEventById('latest', eventId);
            EventListHandler.clickEventList(eventData, 'latest');
        })

        document.querySelector(`.popup-table.recent tbody tr[data-event-id='${id}'] td.video span`).addEventListener('click', (event) => {
            event.stopPropagation();
            const {eventId} = event.currentTarget.closest('tr').dataset;

            const {deviceId, datetime} = EventDataManager.findEventById('latest', eventId);
            openPlaybackCctv(deviceId, datetime);
        })

    }

    // 기상정보
    const createWeatherPopup = () => {
        const weatherPopup = document.querySelector('.popup.weather');
        const weatherTable = document.querySelector('.popup-table.weather');
        const weatherTableBody = weatherTable.querySelector('tbody');

        const loadingLayer = document.querySelector('.weather-data-loading');

        loadingLayer.classList.remove('hidden');
        weatherTableBody.innerHTML = '';

        const startDate = document.querySelector('.popup-content.weather .calendar [name=weather-start]').value;
        const endDate = document.querySelector('.popup-content.weather .calendar [name=weather-finish]').value;
        const params = {
            'startDate': `${startDate}T00:00:00`,
            'endDate': `${endDate}T23:59:59`
        }

        api.get('/weather-data/getDateTimeBetween', { params }).then((res) => {
            const { result: data } = res.data;
            loadingLayer.classList.add('hidden');



            let html = '';
            let exportStr = '일시,온도(℃),습도(%),풍향(°),풍속(m/s)\n';

            data?.forEach((weather, index) => {
                const { baseDatetime, temperature, humidity, windDegrees, windSpeed } = weather;
                html += `<tr>
                    <td class="no">${data.length - index}</td>
                    <td class="date">${baseDatetime}</td>
                    <td class="temperature">${temperature}</td>
                    <td class="humidity">${humidity}</td>
                    <td class="windDirection">${windDegrees}</td>
                    <td class="windSpeed">${windSpeed}</td>  
                </tr>`;

                exportStr += `${baseDatetime},${temperature},${humidity},${windDegrees},${windSpeed}\n`;
            })
            weatherTableBody.innerHTML = html;
            document.querySelector('.weather-tbody').scrollTop = 0;

            if(data.length === 0) {
                weatherTableBody.innerHTML = '<tr class="error-text">데이터가 없습니다.</td>';
            }

            const weatherDataDownload = document.querySelector('.popup-content.weather .button.download a');
            weatherDataDownload.href = URL.createObjectURL(new Blob(["\ufeff"+exportStr], { type: 'text/csv;charset=utf-8;' }));
            weatherDataDownload.download = `${startDate}~${endDate} 기상정보.csv`;
        })

        return weatherPopup;
    };

    // 탭메뉴
    function tabsToggle(event) {
        let clickedTab = event.currentTarget;

        let tabContainer = clickedTab.closest('.tab-container');

        let previousTabs = tabContainer.querySelectorAll('li.on');
        previousTabs.forEach((tab) => {
            tab.classList.remove('on');
        });

        clickedTab.classList.add('on');
    }

    function filterPoi(floorId='', categoryId) {
        const equipmentTbody = document.querySelector('.equipment-tbody table tbody');
        const equipmentQuantity = document.querySelectorAll('.equipment-quantity');

        const filterPoiList = PoiManager.findByPoiCategory(BUILDING_ID, floorId, categoryId).filter((poi) => poi.position !== null);
        const buildingInfo = BuildingManager.findById(BUILDING_ID)

        equipmentTbody.innerHTML = '';
        equipmentQuantity.innerHTML = '';

        if (filterPoiList.length === 0) {
            equipmentTbody.innerHTML =
                `<tr class="error-text"><td colspan="2">저장된 POI가 없습니다.</td></tr>`;
        }

        filterPoiList.forEach((poi) => {
            const floorInfo = buildingInfo.floors.find((floor) => floor.id === poi.floorId);

            equipmentTbody.innerHTML += `
              <tr class='equipment-tr' data-category=${poi.poiCategory} data-poi-id=${poi.id}>
                  <td>
                    <span class="icon"></span>
                    <span class="equipment-name">${poi.name}</span>
                  </td>
                  <td class="equipment-location">${floorInfo.floorName}</td>
              </tr>
          `;
        });

        document.querySelectorAll('.equipment-tr').forEach((item) => {
            const poiInfo = PoiManager.findById(Number(item.dataset.poiId))
            const { id, name, poiCategory, floorId, buildingId } = poiInfo;

            item.addEventListener('click', () => {
                document.querySelectorAll('.equipment-tr').forEach((equipmentItem) => {
                    equipmentItem.classList.remove('selected-row');
                });

                item.classList.add('selected-row');
                moveToPoi(id, () => setPoiEvent(id));
            });
        });
    }

    const renderEventDatas = (eventList) =>
        eventList.map((event, index) => {
            const {id, deviceType, deviceName, eventType, eventLevel, location, datetime, video, deviceId} = event;
            return [
                id,
                eventList.length - index,
                deviceType.toLowerCase() === 'fire_sensor' ? '화재센서' : deviceType.toUpperCase(),
                deviceName ? (deviceName.length > 15 ? `${deviceName.slice(0, 15)}...` : deviceName) : "",
                eventType,
                eventLevel.toLowerCase() === 'danger'
                    ? gridjs.html(`<span class='event-tag event-tag-danger border-danger text-danger'>위험</span>`)
                    : eventLevel.toLowerCase() === 'warning'
                        ? gridjs.html(`<span class='event-tag event-tag-warning border-warning text-warning'>경고</span>`)
                        : gridjs.html(`<span class='event-tag event-tag-missing border-no_received text-no_received'>미수신</span>`),
                location,
                datetime,
                video ? gridjs.html(`<span class='video' data-device-id="${deviceId}"><svg width='18' height='18' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M21 14L9 22L9 6L21 14Z' fill='#919193'/>
                </svg>영상</span>`) : ''
            ]
        })

    const moveToPoi = async (id, callback, distanceOffset = 0, showEvacRoute = false) => {
        const { buildingId, floorId } = PoiManager.findById(id);

        if(Number(buildingId) !== BUILDING_ID) {
            BUILDING_ID = Number(buildingId);
            const {buildingType} = BuildingManager.findById(buildingId);
            if(buildingType === 'outdoor') {
                await Init.initializeOutdoorBuilding(() => moveToPoi(id, callback, distanceOffset, showEvacRoute));
            } else {
                await Init.initializeIndoorBuilding(() => moveToPoi(id, callback, distanceOffset, showEvacRoute));
            }
            Init.setBuildingNameAndFloors();

        } else {
            const evacRouteBtn = document.querySelector('.evaluation-button');
            if (showEvacRoute && !evacRouteBtn.classList.contains('active')) {

                document.querySelector('.sidebar-wrap.active')?.classList.remove('active');
                evacRouteBtn.classList.add('active');
                EvacRouteHandler.load(() => {
                    document.querySelector('.left-information .floor-list li.on')?.classList.remove('on');

                    const {floorName: poiFloorName} = BuildingManager.findById(BUILDING_ID).floors.find(floor => floor.id === floorId);
                    document.querySelector(`.left-information .floor-list li[data-floor-name='${poiFloorName}']`).classList.add('on');
                    document.querySelector("body > main > div.left-information > div.floor").dataset.floorName = poiFloorName;
                    Init.changeFloor(poiFloorName, () => {
                        Px.Camera.MoveToPoi({
                            id,
                            isAnimation: true,
                            distanceOffset,
                            duration: 500,
                            onComplete: () => {
                                if (callback) callback();
                            },
                        });
                    });

                });
            } else {
                document.querySelector('.left-information .floor-list li.on')?.classList.remove('on');

                const {floorName} = BuildingManager.findById(BUILDING_ID).floors.find(floor => floor.id === floorId);
                document.querySelector(`.left-information .floor-list li[data-floor-name='${floorName}']`).classList.add('on');
                document.querySelector('.left-information .floor .btn-floor-change .txt').innerText = floorName;

                Init.changeFloor(floorName, () => {
                    Px.Camera.MoveToPoi({
                        id,
                        isAnimation: true,
                        distanceOffset,
                        duration: 500,
                        onComplete: () => {
                            if (callback) callback();
                        },
                    });
                });
            }
        }
    }

    const setPoiEvent = (id) => {
        const { code, name, property, floorId, buildingId, } = PoiManager.findById(Number(id));
        const { name: buildingName, floors } = BuildingManager.findById(buildingId);
        const { floorName } = floors.find(floor => floor.id === floorId);
        document.querySelector('#sensorLayerPopup .motion-pictogram')?.remove();

        if(code.toLowerCase().includes('cctv')) {
            CctvEventHandler.cctvPlayerClose();
            CctvEventHandler.cctvPlayerOpen('live', code.split('-')[1]);
        } else if(code.toLowerCase().includes('tms')) {

            const tmsId = code.split('-')[1];

            PoiManager.getTmsCurrentData(tmsId).then((currentData) => {
                const location = `${buildingName} ${floorName}`;
                createTmsPopup(name, location, currentData.data);
            });

        } else {
            const ids = property.poiCameras?.map(camera => {
                return camera.code.split('-')[1]
            })
            if(ids.length > 0) {
                CctvEventHandler.cctvPlayerClose();
                CctvEventHandler.cctvPlayerOpen('live', ids);
            }

            PoiManager.getFireSensorCurrentData(code).then((currentData) => {
                const { datetime, smoketype, temptype, tempvalue } = currentData.data;
                const eventState = smoketype === '' ? '-' : smoketype === '00' ? '정상' : '위험';
                const eventData = {
                    state: eventState,
                    code: eventState !== '위험'? '-': '화재',
                    location: `${buildingName} ${floorName}`,
                    smoketype,
                    datetime,
                    tempvalue: tempvalue !== '' ? tempvalue : '-',
                    temptype,
                };
                createSensorPopup(name, eventState, eventData);
            })
        }
    }

    const categorySelect = document.querySelector('.equipment-category-select');
    const categoryList = document.querySelector('.equipment-category-list');

    let isCategoryListVisible = false;

    function selectCategory(event) {
        categorySelect.innerHTML = `
            <span class="selected-category">${event.currentTarget.textContent}</span>
            <img src="/static/images/viewer/icons/arrow/down.png" alt="arrow" />
        `;
        const categoryId = event.currentTarget.dataset.eventCategory;
        categorySelect.dataset.eventCategory = categoryId;
        categoryList.style.display = 'none';
        categorySelect.classList.remove('on');
        filterPoi('', categoryId);
    }

    // category list click > popup mapping
    function setCategoryData(title, pois, clickedItem = null, refresh = false) {
        const titleElement = document.querySelector('#layerPopup .popup-basic__head .name');
        const popup = document.getElementById('layerPopup');
        const currentTitle = titleElement.textContent;
        const totalElement = document.querySelector('.search-result__contents .title');
        const newTitle = title.toUpperCase();
        const accordionContainer = document.querySelector('.accordion');
        if (accordionContainer) {
            accordionContainer.innerHTML = '';
        }

        const buildingSelectContent = document.querySelector('#buildingSelect .select-box__content');
        const floorSelectContent = document.querySelector('#floorSelect .select-box__content');
        const buildingSet = new Set();
        const floorSet = new Set();

        const categoryCounts = pois.reduce((acc, poi) => {
            const category = poi.poiMiddleCategoryDetail?.name || '기타';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        // accordion data set
        pois.forEach(poi => {
            const buildingInfo = BuildingManager.findById(poi.buildingId);
            if (buildingInfo) {
                buildingSet.add(JSON.stringify({ id: buildingInfo.id, name: buildingInfo.name }));
                const floorInfo = buildingInfo.floors.find(floor => floor.id === poi.floorId);
                if (floorInfo) {
                    floorSet.add(JSON.stringify({ id: floorInfo.id, name: floorInfo.name }));
                }
            }

            const category = poi.poiMiddleCategoryDetail?.name || '기타';
            createAccordion(poi, categoryCounts[category]);
        })

        // select
        if (buildingSelectContent) {
            buildingSelectContent.innerHTML = '<ul></ul>'; // 기존 리스트 초기화
            const buildingList = buildingSelectContent.querySelector('ul');

            const allBuildingsOption = document.createElement('li');
            allBuildingsOption.textContent = '건물 전체';
            allBuildingsOption.setAttribute('data-building-id', '');
            buildingList.appendChild(allBuildingsOption);

            Array.from(buildingSet).map(JSON.parse).forEach(building => {
                const li = document.createElement('li');
                li.textContent = building.name;
                li.setAttribute('data-building-id', building.id);
                buildingList.appendChild(li);
            });
        }

        if (floorSelectContent) {
            floorSelectContent.innerHTML = '<ul></ul>';
            const floorList = floorSelectContent.querySelector('ul');

            const allFloorsOption = document.createElement('li');
            allFloorsOption.textContent = '층 전체';
            allFloorsOption.setAttribute('data-floor-id', '');
            floorList.appendChild(allFloorsOption);

            Array.from(floorSet).map(JSON.parse).forEach(floor => {
                const li = document.createElement('li');
                li.textContent = floor.name;
                li.setAttribute('data-floor-id', floor.id);
                floorList.appendChild(li);
            });
        }

        if ((refresh || currentTitle !== newTitle)) {
            titleElement.textContent = newTitle;
            popup.style.display = 'inline-block';
            const viewerResult = document.getElementById('viewerResult');
        } else {
            popup.style.display = popup.style.display === 'none' ? 'inline-block' : 'none';
        }
        popup.style.position = 'absolute';
        popup.style.transform = 'translate(20%, 5%)';
        // popup.style.zIndex = '50';
        // total count
        totalElement.innerHTML = `총 ${pois.length.toLocaleString()} <button type="button" class="reflesh"><span class="hide">새로고침</span></button>`;
    }

    function createAccordion2(poi, categoryCount) {
        const accordionElement = document.getElementById('mainAccordion');
        const categoryName = poi.poiMiddleCategoryDetail?.name || '기타';

        let existingBtn = accordionElement.querySelector(`.accordion__btn[data-category="${categoryName}"]`);
        let accordionDetail;

        if (!existingBtn) {
            const accordionBtn = document.createElement('div');
            accordionBtn.classList.add('accordion__btn');
            accordionBtn.dataset.category = categoryName;
            accordionBtn.textContent =  `${categoryName} (${categoryCount})`;

            accordionBtn.addEventListener('click', () => {
                const allBtns = accordionElement.querySelectorAll('.accordion__btn');
                if (accordionBtn.classList.contains('accordion__btn--active')) {
                    accordionBtn.classList.remove('accordion__btn--active');
                } else {
                    allBtns.forEach(btn => btn.classList.remove('accordion__btn--active'));
                    accordionBtn.classList.add('accordion__btn--active');
                }
            });

            // 상세 영역 생성
            accordionDetail = document.createElement('div');
            accordionDetail.classList.add('accordion__detail');

            // 테이블 생성
            const table = document.createElement('table');
            const caption = document.createElement('caption');
            caption.classList.add('hide');
            caption.textContent = categoryName;
            table.appendChild(caption);

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            ['건물', '층', '장비명'].forEach(text => {
                const th = document.createElement('th');
                th.setAttribute('scope', 'col');
                th.textContent = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            table.appendChild(tbody);
            accordionDetail.appendChild(table);

            accordionElement.appendChild(accordionBtn);
            accordionElement.appendChild(accordionDetail);
        } else {
            accordionDetail = existingBtn.nextElementSibling;
            existingBtn.textContent = `${categoryName} (${categoryCount})`;
        }

        const tbody = accordionDetail.querySelector('tbody');
        const tr = document.createElement('tr');

        const buildingInfo = BuildingManager.findById(poi.buildingId);
        const floorInfo = buildingInfo.floors.find(floor => floor.id === poi.floorId);

        const tdBuilding = document.createElement('td');
        tdBuilding.textContent = buildingInfo.name;

        const tdFloor = document.createElement('td');
        tdFloor.textContent = floorInfo.name;

        const tdEquipment = document.createElement('td');
        tdEquipment.classList.add('align-left');
        tdEquipment.innerHTML = `${poi.name} <em class="text-accent">${poi.code}</em>`;

        tr.appendChild(tdBuilding);
        tr.appendChild(tdFloor);
        tr.appendChild(tdEquipment);

        tbody.appendChild(tr);
    }

    // accordion data set
    function createAccordion(poi, categoryCount) {
        const accordionElement = document.getElementById('mainAccordion');
        const categoryName = poi.poiMiddleCategoryDetail?.name || '기타';

        let accordionBtn = accordionElement.querySelector(`.accordion__btn[data-category="${categoryName}"]`);
        let accordionDetail;

        if (!accordionBtn) {
            accordionBtn = document.createElement('div');
            accordionBtn.classList.add('accordion__btn');
            accordionBtn.dataset.category = categoryName;
            accordionBtn.textContent = `${categoryName} (${categoryCount})`;

            accordionBtn.addEventListener('click', () => {
                const allBtns = accordionElement.querySelectorAll('.accordion__btn');
                if (accordionBtn.classList.contains('accordion__btn--active')) {
                    accordionBtn.classList.remove('accordion__btn--active');
                } else {
                    allBtns.forEach(btn => btn.classList.remove('accordion__btn--active'));
                    accordionBtn.classList.add('accordion__btn--active');
                }
            });

            accordionDetail = document.createElement('div');
            accordionDetail.classList.add('accordion__detail');

            const table = document.createElement('table');
            const caption = document.createElement('caption');
            caption.classList.add('hide');
            caption.textContent = categoryName;
            table.appendChild(caption);

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            ['건물', '층', '장비명'].forEach(text => {
                const th = document.createElement('th');
                th.setAttribute('scope', 'col');
                th.textContent = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            table.appendChild(tbody);
            accordionDetail.appendChild(table);

            accordionElement.appendChild(accordionBtn);
            accordionElement.appendChild(accordionDetail);
        } else {
            accordionDetail = accordionBtn.nextElementSibling;
            accordionBtn.textContent = `${categoryName} (${categoryCount})`;
        }

        const tbody = accordionDetail.querySelector('tbody');
        const tr = document.createElement('tr');

        const buildingInfo = BuildingManager.findById(poi.buildingId);
        const floorInfo = buildingInfo.floors.find(floor => floor.id === poi.floorId);

        const tdBuilding = document.createElement('td');
        tdBuilding.textContent = buildingInfo.name;

        const tdFloor = document.createElement('td');
        tdFloor.textContent = floorInfo.name;

        const tdEquipment = document.createElement('td');
        tdEquipment.classList.add('align-left');
        tdEquipment.setAttribute('data-poi-id', poi.id);
        tdEquipment.innerHTML = `<em class="text-accent">${poi.name}</em>`;
        // tdEquipment.innerHTML = `${poi.name} <em class="text-accent">${poi.code}</em>`;
        tdEquipment.addEventListener('dblclick', function() {
            // popup close추가
            closePopup();
            movePoi(poi.id);
        });
        tr.appendChild(tdBuilding);
        tr.appendChild(tdFloor);
        tr.appendChild(tdEquipment);
        tbody.appendChild(tr);
    }



    // 검색폼
    const buildingSelectBtn = document.querySelector('#buildingSelect .select-box__btn');
    const floorSelectBtn = document.querySelector('#floorSelect .select-box__btn');
    const buildingSelectContent = document.querySelector('#buildingSelect .select-box__content');
    const floorSelectContent = document.querySelector('#floorSelect .select-box__content');
    buildingSelectBtn.addEventListener('click', function (event) {
        if (this.classList.contains('select-box__btn--disabled')) return;
        if (buildingSelectBtn.classList.contains('select-box__btn--active')) {
            buildingSelectBtn.classList.remove('select-box__btn--active');
        } else {
            buildingSelectBtn.classList.add('select-box__btn--active');
        }
    });

    buildingSelectContent.addEventListener('click', function (event) {
        if (event.target.tagName === 'LI') {
            const buildingId = event.target.getAttribute('data-building-id');
            buildingSelectBtn.textContent = event.target.textContent;

            updateFloorSelect(buildingId);

            buildingSelectBtn.classList.remove('select-box__btn--active');
        }
    });

    floorSelectBtn.addEventListener('click', function (event) {
        if (floorSelectBtn.classList.contains('select-box__btn--disabled')) return;

        if (floorSelectBtn.classList.contains('select-box__btn--active')) {
            floorSelectBtn.classList.remove('select-box__btn--active');
        } else {
            floorSelectBtn.classList.add('select-box__btn--active');
        }
    });

    floorSelectContent.addEventListener('click', function (event) {
        event.preventDefault();
        if (event.target.tagName === 'LI') {
            const floorId = event.target.getAttribute('data-floor-id');
            floorSelectBtn.textContent = event.target.textContent;

            floorSelectBtn.classList.remove('select-box__btn--active');
        }
    });

    // 검색
    document.getElementById('searchBtn').addEventListener('click', function () {
        const buildingSelect = document.querySelector('#buildingSelect .select-box__btn').textContent.trim();
        const floorSelect = document.querySelector('#floorSelect .select-box__btn').textContent.trim();
        const equipmentName = document.querySelector('input[type="text"]').value.trim();

        const allAccordionBtns = document.querySelectorAll('.accordion__btn');

        allAccordionBtns.forEach(btn => btn.classList.remove('accordion__btn--active'));

        const allAccordionDetails = document.querySelectorAll('#viewerResult .accordion__detail');
        allAccordionDetails.forEach((detail, index) => {
            const tr = detail.querySelector('tbody > tr');
            if (!tr)  {
                return;
            }
            const tdBuilding = tr.querySelector('td:nth-child(1)').textContent.trim();
            const tdFloor = tr.querySelector('td:nth-child(2)').textContent.trim();
            const tdEquipment = tr.querySelector('td:nth-child(3)').textContent.trim();

            const matchBuilding = (buildingSelect === '건물 전체' || tdBuilding === buildingSelect);
            const matchFloor = (floorSelect === '층 전체' || tdFloor === floorSelect);
            const matchEquipment = (!equipmentName || tdEquipment.includes(equipmentName));
            const accordionDetail = allAccordionBtns[index].nextElementSibling;

            // 검색
            if (accordionDetail && accordionDetail.classList.contains('accordion__detail')) {
                if (matchBuilding && matchFloor && matchEquipment) {
                    allAccordionBtns[index].classList.add('accordion__btn--active');
                    handleAccordionDetail(accordionDetail, true);
                } else {
                    allAccordionBtns[index].classList.add('accordion__btn--active');
                    handleAccordionDetail(accordionDetail, false);
                }
            }
        });
    });

    const handleAccordionDetail = (accordionDetail, showTable) => {
        const table = accordionDetail.querySelector('table');
        const emptyMessage = accordionDetail.querySelector('.empty');

        if (showTable) {
            if (table) {
                table.style.display = 'table';
            }
            if (emptyMessage) {
                emptyMessage.remove();
            }
        } else {
            if (table) {
                table.style.display = 'none';
            }
            if (!emptyMessage) {
                const newMessage = document.createElement('p');
                newMessage.classList.add('empty');
                newMessage.textContent = '검색 결과가 없습니다.';
                accordionDetail.appendChild(newMessage);
            }
        }
    };

    // 검색폼
    function updateFloorSelect(buildingId) {
        const floorSelectContent = document.querySelector('#floorSelect .select-box__content');

        if (!floorSelectContent) return;

        floorSelectContent.innerHTML = '<ul></ul>';
        const floorList = floorSelectContent.querySelector('ul');

        const allFloorsOption = document.createElement('li');
        allFloorsOption.textContent = '층 전체';
        allFloorsOption.setAttribute('data-floor-id', '');
        floorList.appendChild(allFloorsOption);

        if (buildingId) {
            const buildingInfo = BuildingManager.findById(buildingId);

            if (buildingInfo && Array.isArray(buildingInfo.floors)) {
                buildingInfo.floors.forEach(floor => {
                    const li = document.createElement('li');
                    li.textContent = floor.name;
                    li.setAttribute('data-floor-id', floor.id);
                    floorList.appendChild(li);
                });
            }
        }
    }

    const closeAllPopups = () => {
        ['equipmentPop', 'elevatorPop'].forEach(id => {
            const popup = document.getElementById(id);
            if (popup) {
                popup.style.display = 'none';
            }
        });
        systemPop.style.display = 'none';
        systemTabs.forEach(tab => {
            tab.classList.remove('active')
        });
        layerPopup.closePlayers();
    };

    document.querySelector('#viewerResult').addEventListener('click', event => {
        if (event.target.closest('.reflesh')) {
            const viewerResult = event.target.closest('#viewerResult');
            const id = viewerResult.getAttribute('data-category-id')
            const title = document.querySelector('#layerPopup .popup-basic__head .name').textContent;
            PoiManager.getPoiByCategoryId(id).then(pois => {
                layerPopup.setCategoryData(title, pois, null, true);
            });
        }
    })

    const elevatorPopup = document.getElementById('elevatorPop');
    const setElevatorTab = () => {
        const popupUl = elevatorPopup.querySelector('.section--contents ul')
        // popupUl.innerHTML = '';
        popupUl.replaceChildren()

        // 전체 탭
        const allTabLi = document.createElement('li');
        allTabLi.setAttribute('role', 'tab');
        allTabLi.setAttribute('aria-controls', 'tabpanelAll');
        allTabLi.setAttribute('id', 'elevTabAll');
        allTabLi.setAttribute('aria-selected', 'false');
        allTabLi.setAttribute('tabindex', '0');
        allTabLi.classList.add("active");

        const allTabA = document.createElement('a');
        allTabA.setAttribute('href', 'javascript:void(0);');
        allTabA.textContent = '전체';

        allTabLi.appendChild(allTabA);
        // all tab은 default로 맨앞에
        popupUl.prepend(allTabLi);

        const handleTabClick = (event) => {
            const clickedTab = event.currentTarget;
            const parentUl = clickedTab.closest('ul');
            if (parentUl) {
                parentUl.querySelectorAll('li').forEach(tab => {
                    tab.classList.remove("active");
                });
                clickedTab.classList.add("active");
            }
        }

        allTabLi.addEventListener('click', (event) => {
            handleTabClick(event);
            const poiList = PoiManager.findAll();
            PoiManager.getPoiList().then(poiList => {
                console.log("poiList : ", poiList);
                const filteredPoiList = poiList.filter(poi => poi.property.poiCategoryName.toLowerCase() === 'cctv');
                addElevators(filteredPoiList);
            })
        });

        // 건물 탭
        BuildingManager.getBuildingList().then(buildings => {
            buildings.forEach(building => {
                const popupLi = document.createElement('li')
                popupLi.setAttribute('role', 'tab');
                popupLi.setAttribute('aria-controls', `tabpanel${building.id}`);
                popupLi.setAttribute('id', `elevTab${building.id}`);
                popupLi.setAttribute('building-id', `${building.id}`);
                popupLi.setAttribute('aria-selected', 'false');
                popupLi.setAttribute('tabindex', '0');
                const popupAtag = document.createElement('a')
                popupAtag.setAttribute('href', 'javascript:void(0);');
                popupAtag.textContent = building.name;
                popupLi.appendChild(popupAtag);
                popupUl.appendChild(popupLi);
                popupLi.addEventListener('click', (event) => {
                    handleTabClick(event);
                    PoiManager.getPoisByBuildingId(building.id).then(poiList => {
                        const filteredPoiList = poiList.filter(poi => poi.property.poiCategoryName.toLowerCase() === 'cctv');
                        addElevators(filteredPoiList);
                    })
                });
            })
        });
        allTabLi.click();
    }

    const livePlayers = [];
    const addElevators = (filteredPoiList) => {
        const facilityList = document.querySelector('.facility-area__list');
        facilityList.innerHTML = '';

        filteredPoiList.forEach((poi) => {
            const li = document.createElement('li');

            const canvasId = `canvas_poi_${poi.id}`;
            const buttonId = `playBtn_${poi.id}`;
            li.innerHTML = `
                <div class="head">
                    <div class="head__title">
                        <span>${poi.property.buildingName}</span>
                        <span>${poi.name}</span>
                    </div>
                    <div class="head__state">
                        <span class="label label--standby">대기</span>
                        <button id="${buttonId}" type="button" class="button-move">도면 이동</button>
                    </div>
                </div>
                <div class="detail">
                    <div class="elevator-info">
                        <div class="elevator-info__view">
                            <canvas id="${canvasId}" width="auto" height="auto"></canvas>  
                        </div>
                        <div class="elevator-info__detail">
                            <div class="info info--floor">
                                <dl>
                                    <dt class="info__title">운행층수</dt>
                                    <dd>
                                        <strong class="info__floor">B4F ~ 31F</strong>
                                        <br>
                                        <span class="info__text">전층운행</span>
                                    </dd>
                                </dl>
                            </div>
                            <div class="info info--location">
                                <dl>
                                    <dt class="info__title">현재 위치</dt>
                                    <dd class="info__floor">25F</dd>
                                </dl>
                                <span class="text text--spare"><i class="text__icon"></i>여유(5/25)</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            facilityList.appendChild(li);
            document.getElementById(buttonId).addEventListener('click', function() {
                if (poi.position !== null) {
                    closeAllPopups();
                    movePoi(poi.id);
                } else {
                    alertSwal('POI를 배치해주세요');
                }
            });

            const canvasElement = document.getElementById(canvasId);
            let livePlayer = new PluxPlayer({
                relayServerUrl: "ws://127.0.0.1:4001",
                destinationIp: "192.168.4.45", //릴레이 서버 기준 LG ipsolute ip
                destinationPort: "555", //릴레이 서버 기준 LG ipsolute 녹화서버 포트
                canvasDom: canvasElement, //캔버스 dom
            })

            // cctv id를 어떻게....
            livePlayer.livePlay("c06dedd40ac202") // live play

            livePlayers.push({ id: poi.id, player: livePlayer });
        });
    }

    // 설비 popup
    const equipmentPopup = document.getElementById('equipmentPop');
    const setEquipmentTab = () => {
        const popupUl = equipmentPopup.querySelector('.section--select ul')
        popupUl.replaceChildren()
        const eqAccordion = document.getElementById("eqAccordion");
        eqAccordion.replaceChildren();

        // 전체 탭
        const allTabLi = document.createElement('li');
        allTabLi.setAttribute('role', 'tab');
        allTabLi.setAttribute('aria-controls', 'tabpanelAll');
        allTabLi.setAttribute('id', 'eqTabAll');
        allTabLi.setAttribute('tabindex', '0');
        allTabLi.classList.add("active");
        allTabLi.setAttribute("aria-selected", "true");

        const allTabA = document.createElement('a');
        allTabA.setAttribute('href', 'javascript:void(0);');
        allTabA.textContent = '전체';
        allTabA.addEventListener("click", () => {
            updateActiveTab(allTabLi);
            setEquipmentData("");
        });

        allTabLi.appendChild(allTabA);
        // all tab은 default로 맨앞에
        popupUl.prepend(allTabLi);

        // 건물 탭
        BuildingManager.getBuildingList().then((buildings) => {
            buildings.forEach((building) => {
                const popupLi = document.createElement("li");
                popupLi.setAttribute("role", "tab");
                popupLi.setAttribute("aria-controls", `tabpanel${building.id}`);
                popupLi.setAttribute("id", `eqTab${building.id}`);
                popupLi.setAttribute("aria-selected", "false");
                popupLi.setAttribute("tabindex", "0");

                const popupAtag = document.createElement("a");
                popupAtag.setAttribute("href", "javascript:void(0);");
                popupAtag.textContent = building.name;

                popupAtag.addEventListener("click", () => {
                    updateActiveTab(popupLi);
                    setEquipmentData(building.id);
                });

                popupLi.appendChild(popupAtag);
                popupUl.appendChild(popupLi);
            });
            updateActiveTab(allTabLi);
            setEquipmentData("");
        });
    }

    const setEquipmentData = (buildingId) => {
        const eqAccordion = document.getElementById("eqAccordion");
        eqAccordion.replaceChildren();

        const poiCategories = PoiCategoryManager.findAll();

        let firstAccordionBtn = null;
        let firstPoi = null;

        poiCategories.forEach((category, categoryIndex) => {
            const pois = PoiManager.findByPoiCategory(buildingId, "", category.id);
            const poiCount = pois.length;

            const btn = document.createElement("button");
            btn.classList.add("accordion__btn");
            btn.textContent = `${category.name} (${poiCount})`;

            if (categoryIndex === 0) {
                firstAccordionBtn = btn;
            }

            const detailDiv = document.createElement("div");
            detailDiv.classList.add("accordion__detail");
            detailDiv.style.display = "none";

            if (pois.length > 0) {
                const table = document.createElement("table");
                const tbody = document.createElement("tbody");

                pois.forEach((poi, poiIndex) => {
                    const tr = document.createElement("tr");
                    const td = document.createElement("td");
                    td.classList.add("align-left");
                    td.textContent = poi.name;
                    td.setAttribute("td-poi-id", poi.id);

                    if (categoryIndex === 0 && poiIndex === 0) {
                        firstPoi = poi;
                    }

                    td.addEventListener("click", () => {
                        updatePoiDetail(poi);
                    });

                    tr.appendChild(td);
                    tbody.appendChild(tr);
                });

                table.appendChild(tbody);
                detailDiv.appendChild(table);
            } else {
                const emptyMessage = document.createElement("p");
                emptyMessage.classList.add("empty");
                emptyMessage.textContent = "검색 결과가 없습니다.";
                detailDiv.appendChild(emptyMessage);
            }

            btn.addEventListener("click", function () {
                const isActive = btn.classList.contains("accordion__btn--active");

                document.querySelectorAll(".accordion__btn").forEach(b => b.classList.remove("accordion__btn--active"));
                document.querySelectorAll(".accordion__detail").forEach(d => d.style.display = "none");

                if (!isActive) {
                    btn.classList.add("accordion__btn--active");
                    detailDiv.style.display = "block";
                }
            });

            eqAccordion.appendChild(btn);
            eqAccordion.appendChild(detailDiv);
        });

        if (firstAccordionBtn) {
            firstAccordionBtn.classList.add("accordion__btn--active");
            firstAccordionBtn.nextElementSibling.style.display = "block";
        }

        if (firstPoi) {
            updatePoiDetail(firstPoi);
        }
    };

    const updateActiveTab = (selectedTab) => {
        document.querySelectorAll(".section--select ul li").forEach(tab => {
            tab.classList.remove("active");
            tab.setAttribute("aria-selected", "false");
        });

        selectedTab.classList.add("active");
        selectedTab.setAttribute("aria-selected", "true");
    };

    const updatePoiDetail = (poi) => {
        const sectionHead = equipmentPopup.querySelector(".section__head");
        const title = equipmentPopup.querySelector(".section__head .title");
        const sectionDetail = equipmentPopup.querySelector(".section__detail");

        title.textContent = `${poi.name} | ${poi.property.buildingName} | ${poi.property.floorNo}`;

        const moveBtn = sectionHead.querySelector(".button-move");
        moveBtn.setAttribute("btn-poi-id", poi.id);

        moveBtn.addEventListener("click", (event) => {
            elevatorPopup.style.display = "none";
            systemPop.style.display = "none";
            movePoi(poi.id);
        });
    }

    const movePoi = (id) => {
        let poiId;
        if (id.constructor.name === 'PointerEvent') {
            poiId = id.currentTarget.getAttribute('poiid');
        } else {
            poiId = id;
        }
        const poiData = Px.Poi.GetData(poiId);

        if (poiData) {
            Px.Model.Visible.HideAll();
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

    const closePlayers = () => {
        console.log("livePlayers : ", livePlayers);
        livePlayers.forEach(({player}) => {
            player.cctvClose();
        })
        livePlayers.length = 0;
    }

    // date picker default setting
    const setDatePicker = () => {
        const startDateInput = document.getElementById("start-date");
        const endDateInput = document.getElementById("end-date");

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const formatToDateInput = (date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        startDateInput.value = formatToDateInput(firstDayOfMonth);
        endDateInput.value = formatToDateInput(now);

        console.log("start :", getTimestamp(startDateInput.value));
        console.log("end :", getTimestamp(endDateInput.value));
    }

    const updateBuildingSelectBox = (buildingList) => {
        const buildingSelect = document.getElementById("eventBuildingSelect");
        const buildingBtn = buildingSelect.querySelector(".select-box__btn");
        const buildingContent = buildingSelect.querySelector(".select-box__content ul");
        const currentBuildingId = new URLSearchParams(window.location.search).get("buildingId");
        buildingContent.innerHTML = '';

        const allFloors = buildingList.reduce((acc, building) => {
            return acc.concat(building.floors);
        }, []);
        console.log("allFloors : ", allFloors);
        const liAll = document.createElement('li');
        liAll.textContent = '전체';
        liAll.onclick = () => {
            buildingBtn.textContent = '전체';
            buildingBtn.classList.remove("select-box__btn--active");
            buildingSelect.querySelector(".select-box__content").classList.remove("active");
            updateFloorSelectBox(allFloors);
        };
        buildingContent.appendChild(liAll);

        buildingList.forEach((building) => {
            const li = document.createElement('li');
            li.textContent = building.name;

            if (currentBuildingId == building.id) {
                buildingBtn.textContent = building.name;
                updateFloorSelectBox(building.floors);
            }
            li.onclick = () => {
                buildingBtn.textContent = building.name;
                buildingBtn.classList.remove("select-box__btn--active");
                buildingSelect.querySelector(".select-box__content").classList.remove("active");
                updateFloorSelectBox(building.floors, building.id);
            }

            buildingContent.appendChild(li);
        });
        // if (buildingList.length > 0) {
        //     buildingBtn.textContent = buildingList[0].name;
        //     updateFloorSelectBox(buildingList[0].floors, buildingList[0].id);
        // }
        buildingBtn.textContent = '전체';
        updateFloorSelectBox(allFloors);
        buildingBtn.onclick = (event) => {
            toggleSelectBox(buildingSelect);
        };
    }

    const updateFloorSelectBox = (floorList, buildingId) => {
        const floorSelect = document.getElementById("eventFloorSelect");
        const floorBtn = floorSelect.querySelector(".select-box__btn");
        const floorContent = floorSelect.querySelector(".select-box__content ul");
        floorContent.innerHTML = '';

        const liAll = document.createElement('li');
        liAll.textContent = "전체";
        liAll.onclick = () => {
            floorBtn.textContent = "전체";
            floorBtn.classList.remove("select-box__btn--active");
            floorSelect.querySelector(".select-box__content").classList.remove("active");
            if (buildingId) {
                PoiManager.getPoisByBuildingId(buildingId).then((pois) => {
                    updatePoiSelectBox(pois);
                });
            } else {
                PoiManager.getPoiList().then((pois) => {
                    updatePoiSelectBox(pois);
                })
            }
        };
        floorContent.appendChild(liAll);

        floorList.forEach(floor => {
            const li = document.createElement('li');
            li.textContent = floor.name;

            li.onclick = () => {
                floorBtn.textContent = floor.name;
                floorBtn.classList.remove("select-box__btn--active");
                floorSelect.querySelector(".select-box__content").classList.remove("active");

                PoiManager.getPoisByFloorId(floor.id).then((pois) => {
                    updatePoiSelectBox(pois);
                });
            }

            floorContent.appendChild(li);
        });
        if (floorList.length > 0) {
            // floorBtn.textContent = floorList[0].name;
            floorBtn.textContent = "전체";
            PoiManager.getPoiList().then((pois) => {
                updatePoiSelectBox(pois);
            })
            // PoiManager.getPoisByFloorId(floorList[0].id).then((pois) => {
            //     updatePoiSelectBox(pois);
            // });
        }
        floorBtn.onclick = () => {
            toggleSelectBox(floorSelect);
        }
    }

    const updatePoiSelectBox = (poiList) => {
        const poiSelect = document.getElementById("eventPoiSelect");
        const poiBtn = poiSelect.querySelector(".select-box__btn");
        const poiContent = poiSelect.querySelector(".select-box__content ul");
        poiContent.innerHTML = '';

        if (poiList.length == 0) {
            poiBtn.textContent = "없음";
            poiBtn.classList.add("select__btn--disabled");
        } else {
            poiBtn.classList.remove("select__btn--disabled");

            const poiCategories = Array.from(
                new Map(poiList.map(poi => [poi.poiCategoryDetail.id, poi.poiCategoryDetail])).values()
            );

            const liAll = document.createElement('li');
            liAll.textContent = "전체";
            liAll.onclick = () => {
                poiBtn.textContent = "전체";
                poiBtn.classList.remove("select-box__btn--active");
                poiSelect.querySelector(".select-box__content").classList.remove("active");
            };
            poiContent.appendChild(liAll);

            poiCategories.forEach(category => {
                const li = document.createElement('li');
                li.textContent = category.name;
                li.dataset.id = category.id;
                li.onclick = () => {
                    poiBtn.textContent = category.name;
                    poiBtn.classList.remove("select-box__btn--active");
                    poiSelect.querySelector(".select-box__content").classList.remove("active");
                };
                poiContent.appendChild(li);
            });
            poiBtn.textContent = "전체";
        }

        poiBtn.onclick = () => {
            if (poiBtn.classList.contains("select__btn--disabled")) return;
            toggleSelectBox(poiSelect);
        };
    }

    const toggleSelectBox = (selectBoxElement) => {
        const btn = selectBoxElement.querySelector('.select-box__btn');
        const content = selectBoxElement.querySelector('.select-box__content');
        btn.classList.toggle("select-box__btn--active");
        content.classList.toggle("active");
    };

    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    const getTimestamp = (dateString) => Math.floor(new Date(dateString).getTime() / 1000);
    startDateInput.addEventListener("change", event => {
        console.log("start : ", getTimestamp(event.target.value));
        if (startDateInput.value) {
            endDateInput.min = startDateInput.value;
        }
    });

    endDateInput.addEventListener("change", event => {
        console.log("start : ", getTimestamp(event.target.value));
    });

    let globalAlarmList = [];
    let poiList = [];

    const deviceMap = new Map();
    const createEventPopup = async () => {
        // BuildingManager.getBuildingList().then((buildingList) => {
        //     updateBuildingSelectBox(buildingList);
        // });
        const buildingList = await BuildingManager.getBuildingList();
        updateBuildingSelectBox(buildingList);

        const buildingBtn = document.querySelector('#eventBuildingSelect .select-box__btn');
        const floorBtn = document.querySelector('#eventFloorSelect .select-box__btn');
        const poiBtn = document.querySelector('#eventPoiSelect .select-box__btn');
        const selectedBuilding = buildingBtn.textContent.trim();
        const selectedFloor = floorBtn.textContent.trim();
        const selectedDeviceType = poiBtn.textContent.trim();
        const alarmTypeInput = document.getElementById('eventSearchInput').value.trim();

        poiList = await PoiManager.getPoiList();
        const tableBody = document.querySelector('.event-info table tbody');
        const alarmCountEl = document.getElementById('alarmCount');
        tableBody.innerHTML = "";
        setDatePicker();

        const startDateString = document.getElementById("start-date").value;
        const endDateString = document.getElementById("end-date").value;

        const params = new URLSearchParams();
        params.append('startDateString', startDateString);
        params.append('endDateString', endDateString);

        console.log("selectedBuilding : ", selectedBuilding);
        console.log("selectedFloor : ", selectedFloor);
        console.log("selectedDeviceType : ", selectedDeviceType);
        if (selectedBuilding !== '전체') {
            params.append('buildingNm', selectedBuilding);
        }
        if (selectedFloor !== '전체') {
            params.append('floorNm', selectedFloor);
        }
        if (selectedDeviceType !== '전체' && selectedDeviceType !== '' && selectedDeviceType !== '없음') {
            params.append('deviceType', selectedDeviceType);
        }
        if (alarmTypeInput !== '') {
            params.append('alarmType', alarmTypeInput);
        }

        api.get(`/alarms?${params.toString()}`).then((res) => {
            const { result: data } = res.data;
            globalAlarmList = data;
            const eventPopup = document.querySelector('#eventLayerPopup');
            eventPopup.style.position = 'absolute';
            eventPopup.style.top = '50%';
            eventPopup.style.left = '50%';
            eventPopup.style.transform = 'translate(-50%, -50%)';
            eventPopup.style.display = 'inline-block';
            alarmCountEl.textContent = data.length.toLocaleString();
            // 페이지당 10개씩
            const itemsPerPage = 10;
            let currentPage = 1;
            const totalPages = Math.ceil(data.length / itemsPerPage);
            const paginationContainer = document.querySelector(".search-result__paging .number");

            const renderTable = (page) => {
                tableBody.innerHTML = "";
                const startIndex = (page - 1) * itemsPerPage;
                const pageAlarms = data.slice(startIndex, startIndex + itemsPerPage);
                pageAlarms.forEach((data) => {
                    const eventRow = document.createElement('tr');
                    const [formattedOccurrenceDate, formattedConfirmTime] =
                        [data.occurrenceDate, data.confirmTime].map(formatDateTime);

                    let deviceType = data.deviceNm.split("-")[0];

                    const device = poiList.find(poi => poi.tagNames.some(tag => tag === data.tagName));
                    if (device) {
                        deviceMap.set(device.id, device);
                    }
                    eventRow.innerHTML = `
                        <td>${data.buildingNm || '-'}</td>
                        <td>${data.floorNm || '-'}</td>
                        <td>${data.alarmType || '-'}</td>
                        <td>${deviceType || '-'}</td>
                        <td>${data.deviceNm || '-'}</td>
                        <td>${formattedOccurrenceDate || '-'}</td>
                        <td>${formattedConfirmTime || '-'}</td>
                        <td>
                            <a href="javascript:void(0);" class="icon-move" id="moveToMap" data-poi-id="${device ? device.id : ''}">
                                <span class="hide">도면 이동</span>
                            </a>
                        </td>
                    `;
                    tableBody.appendChild(eventRow);
                });
            };

            const renderPagination = () => {
                paginationContainer.innerHTML = "";
                for (let i = 1; i <= totalPages; i++) {
                    const span = document.createElement('span');
                    span.textContent = i;
                    if (i === currentPage) {
                        span.classList.add("active");
                    }
                    span.addEventListener('click', () => {
                        currentPage = i;
                        renderTable(currentPage);
                        renderPagination();
                    });
                    paginationContainer.appendChild(span);
                }
            };

            document.querySelector(".search-result__paging .left").onclick = () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderTable(currentPage);
                    renderPagination();
                }
            };
            document.querySelector(".search-result__paging .right").onclick = () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTable(currentPage);
                    renderPagination();
                }
            };

            renderTable(currentPage);
            renderPagination();
        });
    }
    document.getElementById('eventSearchBtn').addEventListener('click', createEventPopup);

    const formatDateTime = (isoString) => {
        if (!isoString) return '-';

        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '-';
        const pad = (num) => num.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const eventLayerPopup = document.getElementById('eventLayerPopup');
    const refreshBtn = eventLayerPopup.querySelector('.reflesh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            await createEventPopup();
        });
    }
    document.querySelector('.event-info').addEventListener('click', event => {
        const moveLink = event.target.closest('#moveToMap');
        if (moveLink) {
            event.preventDefault();
            const poiId = moveLink.getAttribute('data-poi-id');
            const poi = deviceMap.get(Number(poiId));
            if (poi && poi.position !== null) {
                if (eventLayerPopup) {
                    eventLayerPopup.style.display = 'none';
                }
                movePoi(poi.id);
            } else {
                alertSwal('POI를 배치해주세요');
            }
        }
    })

    function closePopup2(target) {
        if (!target) return;
        target.style.display = 'none';
        console.log("target : ", target);
        const popupParent = target.closest('#layerPopup.popup-basic, #mapLayerPopup.popup-basic');
        if (popupParent) {
            const container = popupParent.parentElement;
            if (container) {
                const poiMenu = container.querySelector('.poi-menu');
                if (poiMenu) {
                    const menuDiv = poiMenu.querySelector('#poiMenuList, #poiMenuListMap');
                    if (menuDiv) {
                        menuDiv.querySelectorAll('ul li.active').forEach(li => {
                            li.classList.remove('active');
                        });
                    }
                }
            }
        }
    }

    function closePopup(target) {
        if (!target) return;
        target.style.display = 'none';
        if (target.id === 'mapLayerPopup') {
            document.querySelectorAll('#poiMenuListMap ul li').forEach(li => li.classList.remove('active'));
        } else if (target.id === 'layerPopup') {
            document.querySelectorAll('#poiMenuList ul li').forEach(li => li.classList.remove('active'));
        } else if (target.id === 'systemPopup') {
            document.querySelectorAll('.system-tab ul li').forEach(li => console.log("li : ", li));
            closeAllPopups();
        }
    }


    function addClosePopup() {
        document.querySelectorAll('.popup-basic .close').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const target = event.target.closest('.popup-basic');
                closePopup(target);
            });
        });
    }

    function markNoticeAsRead(noticeId) {
        const readNotices = JSON.parse(localStorage.getItem('readNotices')) || [];
        if (!readNotices.includes(noticeId)) {
            readNotices.push(noticeId);
            localStorage.setItem('readNotices', JSON.stringify(readNotices));
        }
    }

    function isNoticeRead(noticeId) {
        const readNotices = JSON.parse(localStorage.getItem('readNotices')) || [];
        return readNotices.includes(noticeId);
    }

    let unreadNoticeIds = [];

    function pagingNotice(noticeList, itemsPerPage = 1) {
        let currentPage = 1; // 초기 페이지
        const totalPages = Math.ceil(noticeList.length / itemsPerPage);

        const updatePaging = (page) => {
            const startIndex = (page - 1) * itemsPerPage;
            const currentNotice = noticeList[startIndex];

            // if (currentNotice && !isNoticeRead(currentNotice.id)) {
            //     markNoticeAsRead(currentNotice.id);
            // }

            const noticeTitle = document.querySelector('.notice-info__title p');
            const urgentLabel = document.querySelector('.notice-info__title .label');
            const noticeDate = document.querySelector('.notice-info__date');
            const pagingNumber = document.querySelector('.popup-event__paging .number');
            const noticeContent = document.querySelector('.notice-info__contents p');

            if (currentNotice) {
                const badgeText = (isNoticeRead(currentNotice.id) || currentNotice.isRead) ? '' : '<span class="badge">N</span>';
                noticeTitle.innerHTML = `${currentNotice.title} ${badgeText}`;
                urgentLabel.style.display = currentNotice.isUrgent ? 'inline' : 'none';
                noticeDate.textContent = formatDate(currentNotice.createdAt);
                noticeContent.textContent = currentNotice.content;

                if (!isNoticeRead(currentNotice.id) && !unreadNoticeIds.includes(currentNotice.id)) {
                    unreadNoticeIds.push(currentNotice.id);
                    markNoticeAsRead(currentNotice.id);
                }
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
            saveReadNoticesBatch();
            const popup = document.getElementById('noticePopup');
            popup.style.display = 'none';
        });
    }

    function saveReadNoticesBatch() {
        const readIds = JSON.parse(localStorage.getItem('readNotices')) || [];

        localStorage.setItem('readNotices', JSON.stringify(readIds));

        api.put(`/notices/id-list/${readIds}`, {
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
        }).then(res => {
            localStorage.removeItem("readNotices");
        })
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
    addClosePopup();

    return {
        closePlayers,
        setElevatorTab,
        setEquipmentTab,
        createRecentPopup,
        createEarthquakePopup,
        createSensorPopup,
        createTmsPopup,
        createWeatherPopup,
        updateRecentEventList,
        newRecentEvent,
        setCategoryData,
        moveToPoi,
        setPoiEvent,
        createEventPopup,
        pagingNotice,
        addClosePopup
    }
})();

