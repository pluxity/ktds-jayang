'use strict';

const layerPopup = (function () {
    const systemPop = document.getElementById("systemPopup");
    // 센서
    let cctvConfig = {};
    api.get('/cctv/config').then((result) => {
        cctvConfig = result.data.result;
    });
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
            const floorInfo = buildingInfo.floors.find((floor) => floor.no === poi.floorNo);

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
        document.body.style.overflow = 'hidden';
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

        const lightGroupCount = new Set(
            pois
                .filter(poi => poi.poiMiddleCategoryDetail?.name === '전등')
                .map(poi => poi.property.lightGroup)
        ).size;

        const categoryCounts = pois.reduce((acc, poi) => {
            const category = poi.poiMiddleCategoryDetail?.name || '기타';
            if (category !== '전등') {
                acc[category] = (acc[category] || 0) + 1;
            }
            return acc;
        }, {});

        const allBuildings = BuildingManager.findAll();
        allBuildings.forEach(building => {
            buildingSet.add(JSON.stringify({ id: building.id, name: building.name }));

            if (building.floors && Array.isArray(building.floors)) {
                building.floors.forEach(floor => {
                    floorSet.add(JSON.stringify({ id: floor.id, name: floor.name }));
                });
            }
        });

        const seenLightGroups = new Set();
        // accordion data set
        pois.forEach(poi => {
            const category = poi.poiMiddleCategoryDetail?.name || '기타';
            if (category === '전등') {
                const groupKey = poi.property.lightGroup;
                if (!seenLightGroups.has(groupKey)) {
                    seenLightGroups.add(groupKey);

                    createAccordion(poi, lightGroupCount);
                }
            } else {
                createAccordion(poi, categoryCounts[category]);
            }
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
        popup.style.top = '50%';
        popup.style.transform = 'translate(25%, -50%)';
        // popup.style.zIndex = '50';
        // total count
        // totalElement.innerHTML = `총 ${pois.length.toLocaleString()} <button id="resultRefreshBtn" type="button" class="reflesh"><span class="hide">새로고침</span></button>`;
        if (newTitle == '조명') {
            document.getElementById("totalEqCount").textContent =
                new Set(pois.map(poi => poi.property.lightGroup)).size.toLocaleString();
        } else {
            document.getElementById("totalEqCount").textContent = pois.length.toLocaleString();
        }
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
        const floorInfo = buildingInfo.floors.find(floor => Number(floor.no) === Number(poi.floorNo));
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

                if (accordionBtn.classList.contains('accordion__btn--active')) {
                    accordionBtn.classList.remove('accordion__btn--active');
                } else {
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
        const floorInfo = buildingInfo.floors.find(floor => floor.no === poi.floorNo);

        const tdBuilding = document.createElement('td');
        tdBuilding.textContent = buildingInfo.name;

        const tdFloor = document.createElement('td');

        tdFloor.textContent = floorInfo?.name;

        const tdEquipment = document.createElement('td');
        // tdEquipment.classList.add('align-left');
        tdEquipment.setAttribute('data-poi-id', poi.id);
        tdEquipment.style.cursor = 'pointer';

        if (poi.property.poiCategoryName == '조명') {
            tdEquipment.innerHTML = `${poi.property.lightGroup}`;
        } else {
            tdEquipment.innerHTML = `${poi.name}`;
        }
        // tdEquipment.innerHTML = `${poi.poiMiddleCategoryDetail.name} ${poi.name}`;
        tr.appendChild(tdBuilding);
        tr.appendChild(tdFloor);
        tr.appendChild(tdEquipment);
        tbody.appendChild(tr);
        tdEquipment.addEventListener('click', function() {
            // popup close추가

            if (!poi.position) {
                alertSwal('POI를 배치해주세요');
                return;
            }

            closePopup();
            movePoi(poi.id);
        });

        const allBtns = accordionElement.querySelectorAll('.accordion__btn');
        allBtns.forEach((btn, idx) => {
            btn.style.borderTop = '';
            btn.style.borderBottom = '';

            if (idx === 0) {
                btn.style.borderTop = '1px solid var(--color-grayscale02)';
                btn.style.borderBottom = '1px solid #3c3d43';
            } else {
                btn.style.borderTop = 'none';
                btn.style.borderBottom = '1px solid #3c3d43';
            }
        });
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
            floorSelectBtn.classList.remove('select-box__btn--active');
        }
    });

    buildingSelectContent.addEventListener('click', function (event) {
        if (event.target.tagName === 'LI') {
            const buildingId = event.target.getAttribute('data-building-id');
            buildingSelectBtn.textContent = event.target.textContent;
            buildingSelectBtn.classList.add('select-box__btn--selected')

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
            buildingSelectBtn.classList.remove('select-box__btn--active');
        }
    });

    floorSelectContent.addEventListener('click', function (event) {
        event.preventDefault();
        if (event.target.tagName === 'LI') {
            const floorId = event.target.getAttribute('data-floor-id');
            floorSelectBtn.textContent = event.target.textContent;
            floorSelectBtn.classList.add('select-box__btn--selected')

            floorSelectBtn.classList.remove('select-box__btn--active');
        }
    });

    document.querySelectorAll('#searchBtn, #resultRefreshBtn')
        .forEach(element => element.addEventListener('click', function () {
            const buildingSelect = document.querySelector('#buildingSelect .select-box__btn').textContent.trim();
            const floorSelect = document.querySelector('#floorSelect .select-box__btn').textContent.trim();
            const equipmentName = document.querySelector('input[type="text"]').value.trim();

            const allAccordionBtns = document.querySelectorAll('.accordion__btn');

            allAccordionBtns.forEach(btn => btn.classList.remove('accordion__btn--active'));

            const allAccordionDetails = document.querySelectorAll('#viewerResult .accordion__detail');
            allAccordionDetails.forEach((detail, index) => {
                const rows = detail.querySelectorAll('tbody > tr');
                let hasMatch = false;

                if (!rows)  {
                    return;
                }

                rows.forEach(row => {
                    const tdBuilding = row.querySelector('td:nth-child(1)')?.textContent.trim() || "";
                    const tdFloor = row.querySelector('td:nth-child(2)')?.textContent.trim() || "";
                    const tdEquipment = row.querySelector('td:nth-child(3)')?.textContent.trim() || "";
                    const matchBuilding = (buildingSelect === '건물 전체' || tdBuilding === buildingSelect);
                    const matchFloor = (floorSelect === '층 전체' || tdFloor === floorSelect);
                    const matchEquipment = (!equipmentName || tdEquipment.includes(equipmentName));
                    if (matchBuilding && matchFloor && matchEquipment) {
                        row.style.display = "";
                        hasMatch = true;
                    } else {
                        row.style.display = "none";
                    }
                })
                const accordionBtn = detail.previousElementSibling;

                // 검색
                if (accordionBtn && accordionBtn.classList.contains('accordion__btn')) {
                    if (hasMatch) {
                        accordionBtn.classList.add('accordion__btn--active');
                        handleAccordionDetail(detail, true);
                    } else {
                        accordionBtn.classList.remove('accordion__btn--active');
                        handleAccordionDetail(detail, false);
                    }
                }
            });

            let totalCount = 0;
            allAccordionDetails.forEach(detail => {
                const rows = detail.querySelectorAll('tbody > tr');
                rows.forEach(row => {
                    if (window.getComputedStyle(row).display !== "none") {
                        totalCount++;
                    }
                });
            });
            document.getElementById("totalEqCount").textContent = totalCount.toLocaleString();

            allAccordionDetails.forEach(detail => {
                const accordionBtn = detail.previousElementSibling;
                if (accordionBtn && accordionBtn.classList.contains('accordion__btn')) {
                    let count = 0;
                    const rows = Array.from(detail.querySelectorAll('tbody > tr'));
                    rows.forEach(row => {
                        if (window.getComputedStyle(row).display !== "none") {
                            count++;
                        }
                    });
                    let baseText = accordionBtn.textContent;
                    const idx = baseText.indexOf('(');
                    if (idx !== -1) {
                        baseText = baseText.substring(0, idx).trim();
                    }
                    accordionBtn.textContent = `${baseText} (${count})`;
                }
            });
        }))

    // 검색

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
        ['equipmentPop', 'elevatorPop', 'lightPop', 'energyPop', 'airPop', 'parkingPop', 'electricPop'].forEach(id => {
            const popup = document.getElementById(id);
            if (popup) {
                if (popup.id === 'lightPop') {
                    popup.querySelector('.section__detail').innerHTML = '';
                }
                popup.style.display = 'none';
            }
        });
        systemPop.style.display = 'none';
        layerPopup.closePlayers();
    };

    // document.querySelector('#resultRefreshBtn').addEventListener('click', event => {
    //     if (event.target.closest('.reflesh')) {
    //         const buildingSelectBtn = document.querySelector('#buildingSelect .select-box__btn');
    //         const floorSelectBtn = document.querySelector('#floorSelect .select-box__btn');
    //         const searchInput = document.querySelector('#floorSelect').parentElement.querySelector('input[name="searchText"]');
    //
    //         if (buildingSelectBtn) {
    //             buildingSelectBtn.textContent = '건물 전체';
    //         }
    //         if (floorSelectBtn) {
    //             floorSelectBtn.textContent = '층 전체';
    //         }
    //         if (searchInput) {
    //             searchInput.value = '';
    //         }
    //
    //         const viewerResult = event.target.closest('#viewerResult');
    //         const id = viewerResult.getAttribute('data-category-id')
    //         const title = document.querySelector('#layerPopup .popup-basic__head .name').textContent;
    //
    //         const poiList = PoiManager.findAll();
    //         const filteringPoiList = poiList.filter(poi => poi.poiCategory === Number(id));
    //         // const filteringPoiList = poiList.filter(poi =>
    //         //     poi.poiCategory === Number(id) && poi.position
    //         // );
    //         layerPopup.setCategoryData(title, filteringPoiList, null, true);
    //     }
    // })

    let escalatorFilterDirection = '방향 전체';
    let escalatorFilterState = '상태 전체';

    // set building, floor tab
    const setTab = (type, { onBuildingChange = () => {} } = {}) => {
        const buildingBox = document.getElementById(`${type}Building`);
        const buildingBtn = buildingBox?.querySelector('.select-box__btn');
        const statusBox   = document.getElementById(`${type}Status`);
        const statusBtn   = statusBox?.querySelector('.select-box__btn');
        let buildingList = BuildingManager.findAll();
        const buildingUl = document.getElementById(`${type}BuildingUl`);

        let currentBuilding = null;
        let currentStatus = '상태 전체';

        const elevatorSearchBtn = document.getElementById('elevatorSearchBtn');
        const escalatorSearchBtn = document.getElementById('escalatorSearchBtn');
        if (elevatorSearchBtn) {
            elevatorSearchBtn.onclick = () => {
                const buildingName = buildingBtn?.textContent.trim();
                const statusName = statusBtn?.textContent.trim();

                if (buildingName) {
                    const selectedBuilding = BuildingManager.findAll()
                        .find(b => b.name === buildingName);
                    if (selectedBuilding) {
                        currentBuilding = selectedBuilding;
                        onBuildingChange(currentBuilding);
                    }
                }
                if (statusName) {
                    filterElevatorByStatus(statusName);
                }
            }
        }

        if (escalatorSearchBtn) {
            escalatorSearchBtn.onclick = () => {
                const statusName   = statusBtn?.textContent.trim();
                const driveBox = document.getElementById('escalatorDrive');
                const driveBtn = driveBox?.querySelector('.select-box__btn');
                const driveName = driveBtn?.textContent.trim();
                console.log("driveName : ", driveName);
                console.log("statusName : ", statusName);
                filterEscalator(driveName || '방향 전체', statusName || '상태 전체');
            };
        }

        const toggleBtnActive = (btn, ...others) => {
            if (!btn.classList.contains('select-box__disabled')) {
                btn.classList.toggle('select-box__btn--active');
                others.forEach(o => o?.classList.remove('select-box__btn--active'));
            }
        };

        const updateStatusList = (buildingName) => {
            if (!statusBox) return;
            const statusBtn = statusBox.querySelector('.select-box__btn');
            const statusContent = statusBox.querySelector('.select-box__content');
            const oldUl = statusContent.querySelector('ul');
            if (oldUl) statusContent.removeChild(oldUl);

            const newUl = document.createElement('ul');

            const allLi = document.createElement('li');
            allLi.dataset.id = '상태 전체';
            allLi.textContent = '상태 전체';
            allLi.onclick = () => {
                statusBtn.textContent = '상태 전체';
                statusBtn.classList.remove('select-box__btn--active');
                // filterElevatorByStatus('상태 전체');
            };
            newUl.appendChild(allLi);

            const statusItems = ['A동', 'B동'].includes(buildingName)
                ? ['정상운전', '운전휴지', '독립운전', '전용운전', '보수운전', '정전운전', '화재운전', '지진운전', '고장']
                : ['자동운전', '고장', '점검중', '파킹', '독립운전', '중량초과', '1차소방운전', '2차소방운전', '화재관제운전', '화재관제운전귀착'];

            statusBtn.textContent = '상태 전체';
            // filterElevatorByStatus('상태 전체');

            statusItems.forEach(text => {
                const li = document.createElement('li');
                li.dataset.id = text;
                li.textContent = text;
                li.onclick = () => {
                    statusBtn.textContent = text;
                    statusBtn.classList.add('select-box__btn--selected')
                    statusBtn.classList.remove('select-box__btn--active');
                    // filterElevatorByStatus(text);
                };
                newUl.appendChild(li);
            });

            statusContent.appendChild(newUl);
        }

        if (buildingBtn) {
            buildingBtn.onclick = () => toggleBtnActive(buildingBtn);
        }

        if (type === 'elevator') {
            const statusBtn = statusBox.querySelector('.select-box__btn');
            const statusContent = statusBox.querySelector('.select-box__content');
            buildingBtn.onclick = () => toggleBtnActive(buildingBtn, statusBtn);
            statusBtn.onclick = () => toggleBtnActive(statusBtn, buildingBtn);
        }

        if (type === 'escalator') {
            const statusBtn = statusBox.querySelector('.select-box__btn');
            const statusContent = statusBox.querySelector('.select-box__content');
            const driveBox = document.getElementById('escalatorDrive');
            const driveBtn = driveBox.querySelector('.select-box__btn');
            const driveContent = driveBox.querySelector('.select-box__content');
            // 상태
            if (!statusContent.querySelector('ul')) {
                const statusUl = document.createElement('ul');
                const allLi = document.createElement('li');
                allLi.dataset.id = '상태 전체';
                allLi.textContent = '상태 전체';
                allLi.onclick = () => {
                    statusBtn.textContent = '상태 전체';
                    statusBtn.classList.add('select-box__btn--selected');
                    statusBtn.classList.remove('select-box__btn--active');
                    escalatorFilterState = '상태 전체';
                    // filterEscalator(escalatorFilterDirection, escalatorFilterState);
                };
                statusUl.appendChild(allLi);

                ['정지', '자동', '고장'].forEach(text => {
                    const li = document.createElement('li');
                    li.dataset.id  = text;
                    li.textContent = text;
                    li.onclick = () => {
                        statusBtn.textContent = text;
                        statusBtn.classList.add('select-box__btn--selected');
                        statusBtn.classList.remove('select-box__btn--active');
                        escalatorFilterState = text;
                        // filterEscalator(escalatorFilterDirection, escalatorFilterState);
                    };
                    statusUl.appendChild(li);
                });
                statusContent.appendChild(statusUl);
            }

            if (!driveContent.querySelector('ul')) {
                const driveUl = document.createElement('ul');
                const allLi = document.createElement('li');
                allLi.dataset.id = '방향 전체';
                allLi.textContent = '방향 전체';
                allLi.onclick = () => {
                    driveBtn.textContent = '방향 전체';
                    driveBtn.classList.add('select-box__btn--selected');
                    driveBtn.classList.remove('select-box__btn--active');
                    escalatorFilterDirection = '방향 전체';
                    // filterEscalator(escalatorFilterDirection, escalatorFilterState);
                };
                driveUl.appendChild(allLi);
                ['상행', '하행'].forEach(text => {
                    const li = document.createElement('li');
                    li.dataset.id  = text;
                    li.textContent = text;
                    li.onclick = () => {
                        driveBtn.textContent = text;
                        driveBtn.classList.add('select-box__btn--selected');
                        driveBtn.classList.remove('select-box__btn--active');
                        escalatorFilterDirection = text;
                        // filterEscalator(escalatorFilterDirection, escalatorFilterState);
                    }
                    driveUl.appendChild(li);
                });
                driveContent.appendChild(driveUl);
            }

            // statusBtn.onclick = () => toggleBtnActive(statusBtn, buildingBtn, floorBtn);
            statusBtn.onclick = () => toggleBtnActive(statusBtn, driveBtn);
            driveBtn.onclick = () => toggleBtnActive(driveBtn, statusBtn);
        }

        if (type === 'elevator') {
            const defaultBuilding = buildingList.find(b => b.code === 'A');
            if (defaultBuilding) {
                currentBuilding = defaultBuilding;
                if (buildingBtn) {
                    buildingBtn.textContent = defaultBuilding.name;
                }
                onBuildingChange(currentBuilding);
                updateStatusList(defaultBuilding.name);
            }

            if (buildingUl) {
                buildingUl.innerHTML = '';
                buildingList.forEach(building => {
                    const li = document.createElement('li');
                    li.dataset.id = building.id;
                    li.textContent = building.name;
                    li.onclick = () => {
                        currentBuilding = building;
                        if (buildingBtn) {
                            buildingBtn.textContent = building.name;
                            buildingBtn.classList.remove('select-box__btn--active');
                            buildingBtn.classList.add('select-box__btn--selected');
                        }
                        // onBuildingChange(building);
                        updateStatusList(building.name);
                    };
                    buildingUl.appendChild(li);
                });
            }
        }
    }

    function getLightData(building, floor) {
        return [
            { zoneName: '1', data: ['A1','A2','A3'] },
            { zoneName: '2', data: ['B1','B2'] },
            { zoneName: '3', data: ['C1','C2','C3','C4'] },
            { zoneName: '4', data: ['D1'] }
        ];
    }

    // 일단 building, floor select box 추가
    const setLight = () => {
        const lightAccordionBtn    = document.querySelectorAll('#lightAccordion .accordion__btn');
        const lightAccordionDetail = document.querySelectorAll('#lightAccordion .accordion__detail');

        setTab('light', {
            onBuildingChange: (building, floor) => {
                getBuildingPop(building, floor);

                const lightData = getLightData(building, floor);
                lightAccordionBtn.forEach((btn, i) => {
                    btn.textContent = `${floor.name} - ${i + 1}`;
                });
                lightAccordionDetail.forEach((detail, i) => {
                    const rows = lightData[i].data
                        .map(d => `<tr><td class="align-left">${d}</td></tr>`)
                        .join('');
                    detail.innerHTML = `
                    <table>
                      <caption class="hide"></caption>
                      <tbody>
                        ${rows}
                      </tbody>
                    </table>`;
                });
            },
            onFloorChange: (building, floor) => {

                const floorPois = PoiManager.findByFloor(floor.id);
                const win = lightIframe.contentWindow;
                win.Px.Model.Visible.HideAll();
                win.Px.Model.Visible.Show(Number(floor.id));
                win.Px.Poi.HideAll();
                win.Px.Poi.ShowByProperty("floorId", Number(floor.id));
                floorPois.forEach(poi => {
                    win.Px.Poi.SetIconSize(poi.id, 50);
                })

                const lightData = getLightData(building, floor);
                lightAccordionBtn.forEach((btn, i) => {
                    btn.textContent = `${floor.name} - ${i + 1}`;
                });
                lightAccordionDetail.forEach((detail, i) => {
                    const rows = lightData[i].data
                        .map(d => `<tr><td class="align-left">${d}</td></tr>`)
                        .join('');
                    detail.innerHTML = `
                    <table>
                      <caption class="hide"></caption>
                      <tbody>
                        ${rows}
                      </tbody>
                    </table>`;
                });
            }
        });
    };

    let lightIframe = null;

    const getBuildingPop = (building, floor) => {
        const container = document.querySelector('#lightPop .section--contents .section__detail')
        container.innerHTML = '';

        lightIframe = document.createElement('iframe');
        lightIframe.style.cssText = 'width:100%;height:100%;border:none';
        lightIframe.src = '/lightPopFrame';
        container.appendChild(lightIframe);

        const buildingData = {
            id: building.id,
            name: building.name,
            buildingFile: building.buildingFile,
            floors: building.floors
        };

        lightIframe.addEventListener('load', () => {
            lightIframe.contentWindow.postMessage(
                { buildingData, floor },
                window.location.origin
            );
        }, { once: true });
    }

    const initializeTexture = () => {
        Px.VirtualPatrol.LoadArrowTexture('/static/images/virtualPatrol/arrow.png', function () {
            console.log('화살표 로딩완료');
        });

        Px.VirtualPatrol.LoadCharacterModel('/static/assets/modeling/virtualPatrol/guardman.glb', function () {
            console.log('가상순찰 캐릭터 로딩 완료');
        });
    }

    // 페이징
    const pageSize = 20;
    const paged = {
        elevator: { entries: [], currentPage: 1, mode: 'AB' },
        escalator: { entries: [], currentPage: 1 }
    }

    function initPagedList(type, dataById, mode = null) {
        const p = paged[type];
        p.entries = Object.entries(dataById);
        p.currentPage = 1;
        p.mode = mode;
        renderPagedPage(type);
        // renderPagedPagination(type);
    }

    function renderPagedPage(type) {
        const { entries, currentPage, mode } = paged[type];

        // Poi 존재하는 것만
        const validEntries = entries.filter(([idStr]) =>
            PoiManager.findById(Number(idStr))
        );

        // 타입별 필터링
        let filteredEntries = validEntries;
        if (type === 'elevator') {
            if (currentFilterStatus !== '상태 전체') {
                filteredEntries = validEntries.filter(([idStr, dto]) => {
                    const tags = dto.TAGs;
                    const tagMap = tags.reduce((map, t) => {
                        const key = t.tagName.substring(t.tagName.lastIndexOf('-') + 1);
                        map[key] = t.currentValue;
                        return map;
                    }, {});
                    return tagMap['DrivingState'] === currentFilterStatus;
                });
            }
        } else if (type === 'escalator') {
            filteredEntries = validEntries.filter(([idStr, dto]) => {
                const tagMap = dto.TAGs.reduce((map, t) => {
                    const key = t.tagName.substring(t.tagName.lastIndexOf('-') + 1);
                    map[key] = { value: t.currentValue };
                    return map;
                }, {});

                const isUp = tagMap['UpDir']?.value !== 'OFF';
                const directionText = isUp ? '상행' : '하행';

                const activeKey = ['Stop','Run','Fault'].find(key => tagMap[key]?.value !== 'OFF');
                let stateText = '';
                switch (activeKey) {
                    case 'Stop':  stateText = '정지'; break;
                    case 'Run':   stateText = '자동'; break;
                    case 'Fault': stateText = '고장'; break;
                }

                if (escalatorFilterDirection !== '방향 전체' && directionText !== escalatorFilterDirection) return false;
                if (escalatorFilterState !== '상태 전체' && stateText !== escalatorFilterState) return false;
                return true;
            });
        }

        const totalCount = filteredEntries.length;

        const slice = filteredEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize);
        const pageData = Object.fromEntries(slice);

        if (type === 'elevator') {
            renderElevatorList(pageData, mode);
            document.getElementById('totalElevatorCnt').textContent = `총 ${totalCount}대`;
            renderPagedPagination('elevator', totalCount);
        } else {
            renderEscalatorList(pageData);
            document.getElementById('totalEscalatorCnt').textContent = `총 ${totalCount}대`;
            renderPagedPagination('escalator', totalCount);
        }
    }

    function renderPagedPagination(type, totalCount) {
        const p = paged[type];
        const entries = p.entries;
        let currentPage = p.currentPage;

        const validEntries = entries.filter(([idStr]) =>
            PoiManager.findById(Number(idStr))
        );
        const totalPages = Math.ceil(totalCount / pageSize);

        if (paged[type].currentPage > totalPages) {
            paged[type].currentPage = totalPages || 1;
        }

        currentPage = p.currentPage;

        const content = document.getElementById(`${type}Content`);
        const paging = content.querySelector('.search-result__paging');
        const numberDiv = paging.querySelector('.number');
        const prevBtn = paging.querySelector('button.left');
        const nextBtn = paging.querySelector('button.right');

        numberDiv.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            if (i === currentPage) span.classList.add('active');
            span.onclick = () => {
                paged[type].currentPage = i;
                renderPagedPage(type);
                renderPagedPagination(type, totalCount);
            };
            numberDiv.appendChild(span);
        }

        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        prevBtn.onclick = () => {
            if (paged[type].currentPage > 1) {
                paged[type].currentPage--;
                renderPagedPage(type);
                renderPagedPagination(type, totalCount);
            }
        };
        nextBtn.onclick = () => {
            if (paged[type].currentPage < totalPages) {
                paged[type].currentPage++;
                renderPagedPage(type);
                renderPagedPagination(type, totalCount);
            }
        };
    }

    const renderElevatorList = (dataById, mode = null) => {
        const elevatorUl = document.getElementById('elevatorList');
        elevatorUl.innerHTML = '';

        let renderCount = 0;

        // const totalCount = Object.keys(dataById).length;
        // document.getElementById('totalElevatorCnt').textContent = `총 ${totalCount}대`;
        Object.entries(dataById).forEach(([idStr, dto]) => {
            const poiInfo = PoiManager.findById(Number(idStr));
            if (!poiInfo) return;
            const tags = dto.TAGs;
            let effectiveMode = mode;

            if (!effectiveMode) {
                const firstTag = tags[0].tagName;
                const letter = firstTag.charAt(0);
                effectiveMode = (letter === 'A' || letter === 'B') ? 'AB' : 'C';
            }
            const tagMap = tags.reduce((map, t) => {
                const key = t.tagName.substring(t.tagName.lastIndexOf('-') + 1);
                map[key] = t.currentValue;
                return map;
            }, {});

            const currentFloor = tagMap['CurrentFloor'];

            // 공통 floor 처리
            let floorHtml = '';
            if (/^[PB]\d+$/i.test(currentFloor)) {
                floorHtml = currentFloor[0] + '<strong>' + currentFloor.slice(1) + '</strong>';
            } else if (/^0?G$/i.test(currentFloor)) {
                floorHtml = 'G';
            } else if (/^\d+[A-Z]+$/i.test(currentFloor)) {
                const idx = currentFloor.search(/[A-Z]/i);
                floorHtml = '<strong>' + currentFloor.slice(0, idx) + '</strong>' + currentFloor.slice(idx);
            } else {
                floorHtml = currentFloor;
            }

            // 문 상태 처리
            const doorRaw = tagMap[mode === 'AB' ? 'Door' : 'Door opened'];
            const doorState = doorRaw.toUpperCase() === '문닫힘' || doorRaw.toUpperCase() === 'OFF' ? '문닫힘' : '문열림';
            const doorClass = doorState === '문닫힘' ? 'detail__text detail__text--off' : 'detail__text';
            // 방향 처리
            let directionText = '';
            let directionState = '';
            if (mode === 'AB') {
                switch ((tagMap['Direction'] || '').toUpperCase()) {
                    case '상행':
                        directionText = '상행';
                        directionState = 'state--up';
                        break;
                    case '하행':
                        directionText = '하행';
                        directionState = 'state--down';
                        break;
                    case '멈춤':
                        directionText = '멈춤';
                        directionState = 'state--hold';
                        break;
                }
            } else {
                const directionKeys = ['UpDir', 'DownDir'];
                const directionLabels = { UpDir: '상향', DownDir: '하향' };
                const directionStateMap = {
                    '상향': 'state--up',
                    '하향': 'state--down',
                    '멈춤': 'state--hold'
                };
                const dirKey = directionKeys.find(k => tagMap[k] && tagMap[k] !== 'OFF');
                if (dirKey) {
                    directionText = directionLabels[dirKey];
                    directionState = directionStateMap[directionText];
                } else if (tagMap['Driving'] === 'OFF') {
                    directionText = '멈춤';
                    directionState = directionStateMap[directionText];
                }
            }

            // 상태 텍스트 및 라벨 처리
            let stateText = '';
            let labelClass = '';

            if (mode === 'AB') {
                const status = tagMap['DrivingState'];
                stateText = status;
                if (["보수운전", "정전운전", "화재운전", "지진운전"].includes(status)) {
                    labelClass = 'label--parking';
                } else if (status === '고장') {
                    labelClass = 'label--breakdown';
                }
            } else {
                // 'EMCB', 'EMCF'는 일단 제외
                const extraStates = [
                    'AUTO', 'Fault', 'Checking',
                    'Parking', 'Independent driving', 'Overweight',
                    '1st fire driving', 'Second fire driving',
                    'Fire control driving', 'Fire control driving results'
                ];
                const fireGroup1 = ['1st fire driving', 'Fire control driving results'];
                const fireGroup2 = ['Second fire driving', 'Fire control driving'];

                let activeStatesArr = [];
                let addedFireGroup1 = false;
                let addedFireGroup2 = false;

                for (const key of extraStates) {
                    const value = tagMap[key];
                    if (!value || value === 'OFF') continue;

                    if (fireGroup1.includes(key)) {
                        if (!addedFireGroup1) {
                            activeStatesArr.push(value);
                            addedFireGroup1 = true;
                        }
                    } else if (fireGroup2.includes(key)) {
                        if (!addedFireGroup2) {
                            activeStatesArr.push(value);
                            addedFireGroup2 = true;
                        }
                    } else {
                        activeStatesArr.push(value);
                    }

                    if (activeStatesArr.length > 0) break;
                }
                stateText = activeStatesArr.join(', ');

                if (activeStatesArr.includes('파킹')) {
                    labelClass = 'label--parking';
                } else if (activeStatesArr.length === 1 && activeStatesArr[0] === '고장') {
                    labelClass = 'label--breakdown';
                }
            }

            // DOM 렌더링
            const elevatorLi = document.createElement('li');
            const buildingLabel = `[${poiInfo.property.buildingName}]`;

            const formattedStateText = stateText.match(/.{1,4}/g).join('<br>');

            elevatorLi.innerHTML = `
                    <div class="head">
                        <div class="head__title">${buildingLabel} [${poiInfo.property.floorName}] ${poiInfo.name}</div>
                        <a class="head__button" href="javascript:void(0);"><span class="hide">도면 이동</span></a>
                        <input type="hidden" name="poiId" value="${poiInfo.id}">
                    </div>
                    <div class="detail">
                        <div class="detail__state">
                            <span style="text-align: center; " class="label ${labelClass}">${formattedStateText}</span>
                            <div class="floor">${floorHtml}</div>
                            <span class="state ${directionState}"><span class="hide state__text">${directionText}</span></span>
                        </div>
                        <p class="${doorClass}">${doorState}</p>
                    </div>
                `;
            elevatorUl.appendChild(elevatorLi);
            renderCount++;

            const moveBtn = elevatorLi.querySelector('.head__button');
            if (moveBtn) {
                moveBtn.onclick = () => {
                    const popup = document.querySelector('#elevatorPop');
                    if (popup) {
                        closePopup(popup);
                    }
                    movePoi(poiInfo.id);
                };
            }
        });
        document.getElementById('totalElevatorCnt').textContent = `총 ${renderCount}대`;
    };

    let elevatorData = {};
    let currentFilterStatus = '상태 전체';

    const addABElevatorList = (building) => {
        api.get(`/api/tags/elevator`, {
            params: {
                type: 'ELEV',
                buildingId: building.id,
                buildingName: building.name,
            }
        }).then(res => {
            elevatorData = res.data
            initPagedList('elevator', elevatorData, 'AB');
        });
    };

    const addCElevatorList = (building) => {
        api.get(`/api/tags/elevator`, {
            params: {
                type: 'ELEV',
                buildingId: building.id,
                buildingName: building.name,
            }
        }).then(res => {
            elevatorData = res.data
            initPagedList('elevator', elevatorData, 'C');
        });
    };

    const filterElevatorByStatus = (status) => {
        currentFilterStatus = status;
        renderPagedPage('elevator');
    };
    const filterEscalator = (direction, state) => {
        escalatorFilterDirection = direction;
        escalatorFilterState = state;
        renderPagedPage('escalator');
    };

    const addAllElevatorList = () => {
        api.get(`/api/tags/elevator`, {
            params: {
                type: 'ELEV',
            }
        }).then(res => {
            initPagedList('elevator', res.data);
        });
    };
    let elevatorIntervalId = null;
    let escalatorIntervalId = null;

    function clearElevatorInterval() {
        if (elevatorIntervalId !== null) {
            clearInterval(elevatorIntervalId);
            elevatorIntervalId = null;
        }
    }

    function clearEscalatorInterval() {
        if (escalatorIntervalId !== null) {
            clearInterval(escalatorIntervalId);
            escalatorIntervalId = null;
        }
    }

    function clearAllIntervals() {
        clearElevatorInterval();
        clearEscalatorInterval();
    }

    const setElevator = () => {
        currentFilterStatus = '상태 전체';
        paged.elevator.currentPage = 1;
        setTab('elevator', {
            onBuildingChange: (building) => {
                const fetchElevatorData = () => {
                    if (['A', 'B'].includes(building.code)) {
                        addABElevatorList(building);
                    } else {
                        addCElevatorList(building);
                    }
                };

                fetchElevatorData();
            }
        });
    }

    const addEscalatorList = () => {
        api.get(`/api/tags/escalator`, {
            params: {
                type: 'ESCL',
            }
        }).then(res => {
            initPagedList('escalator', res.data);
        });
    };

    const renderEscalatorList = (dataById) => {
        const escalatorUl = document.getElementById('escalatorList');
        escalatorUl.innerHTML = '';
        let renderCount = 0;
        // const totalCount = Object.keys(dataById).length;
        // document.getElementById('totalEscalatorCnt').textContent = `총 ${totalCount}대`;

        Object.entries(dataById).forEach(([idStr, dto]) => {
            const poiInfo = PoiManager.findById(Number(idStr));
            if (!poiInfo) return;
            const tagMap = dto.TAGs.reduce((map, t) => {
                const key = t.tagName.substring(t.tagName.lastIndexOf('-') + 1);
                map[key] = {
                    value: t.currentValue
                }
                return map;
            }, {});

            const rawTag = dto.TAGs[0].tagName;
            const eqCode = rawTag.substring(
                rawTag.indexOf('ESCL'),
                rawTag.lastIndexOf('-')
            );
            // DOM 렌더링
            const escalatorLi = document.createElement('li');
            const buildingLabel = `[${poiInfo.property.buildingName}]`;

            // direction
            const isUp = tagMap['UpDir'].value !== 'OFF';
            const directionClass = isUp ? 'state--up' : 'state--down';
            const directionText  = isUp ? '상행' : '하행';
            // state
            const activeKey = ['Stop','Run','Fault'].find(key => tagMap[key].value !== 'OFF')
            let stateLabel = '';
            let stateText  = '';
            let detailState = '';
            switch (activeKey) {
                case 'Stop':
                    stateText = '정지';
                    stateLabel = 'label--block';
                    detailState = 'detail__state--off';
                    break;
                case 'Run':
                    stateText = '자동';
                    break;
                case 'Fault':
                    stateText = '고장';
                    stateLabel = 'label--breakdown';
                    break;
                default:
                    stateText = '';
                    stateLabel = '';
            }

            escalatorLi.innerHTML = `
                    <div class="head">
                        <div class="head__title">${buildingLabel} [${poiInfo.property.floorName}] ${poiInfo.name}</div>
                        <a class="head__button" href="javascript:void(0);"><span class="hide">도면 이동</span></a>
                        <input type="hidden" name="poiId" value="${poiInfo.id}">
                    </div>
                    <div class="detail">  
                        <div class="detail__state ${detailState}">
                            <span class="image"><span class="hide">에스컬레이터</span></span>
                            <!-- UP -->
                            <span class="state ${directionClass}"><span class="state__text">${directionText}</span></span>
                            <!-- 자동 -->
                            <span class="label ${stateLabel}">${stateText}</span>
                        </div>
                    </div>
                `;
            escalatorUl.appendChild(escalatorLi);
            renderCount++;

            const moveBtn = escalatorLi.querySelector('.head__button');
            if (moveBtn) {
                moveBtn.onclick = () => {
                    const popup = document.querySelector('#elevatorPop');
                    if (popup) {
                        closePopup(popup);
                    }
                    movePoi(poiInfo.id);
                };
            }
        });
        document.getElementById('totalEscalatorCnt').textContent = `총 ${renderCount}대`;
    };

    const setEscalator = () => {
        escalatorFilterDirection = '방향 전체';
        escalatorFilterState = '상태 전체';
        paged.escalator.currentPage = 1;
        const statusBtn = document.querySelector('#escalatorStatus .select-box__btn');
        const driveBtn  = document.querySelector('#escalatorDrive .select-box__btn');

        if (statusBtn) {
            statusBtn.textContent = '상태 전체';
            statusBtn.classList.remove('select-box__btn--active', 'select-box__btn--selected');
        }
        if (driveBtn) {
            driveBtn.textContent = '방향 전체';
            driveBtn.classList.remove('select-box__btn--active', 'select-box__btn--selected');
        }

        setTab('escalator');

        const fetchEscalatorData = () => {
            addEscalatorList();
        }
        fetchEscalatorData();
    }

    const elevatorPopup = document.getElementById('elevatorPop');

    // 주차 popup start
    let parkingResult = [];
    let parkCurrentPage = 1;
    const PARK_PAGE_SIZE = 15;

    function renderParkingTable() {
        const tbody = document.querySelector('#parkingContentList tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const start = (parkCurrentPage - 1) * PARK_PAGE_SIZE;
        const slice = parkingResult.slice(start, start + PARK_PAGE_SIZE);

        const formatDateTime = (dt) => {
            if (!dt) return '';
            return new Date(dt).toLocaleString('ko-KR', { hour12: false });
        };

        slice.forEach((item, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${start + idx + 1}</td>
              <td>${item.deviceId || ''}</td>
              <td>${item.deviceName || ''}</td>
              <td>${item.inoutType === 0 ? '입구' : '출구'}</td>
              <td>${item.gateDatetime}</td>
              <td>${item.carNo || ''}</td>
              <td>${item.inoutCarId || ''}</td>
              <td>${item.parkingFee ?? 0}</td>
              <td>${item.regularType === 'R' ? '정기권' : '일반권'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderParkingPaging() {
        const pagingWrap = document.querySelector('#parkingPaging');
        if (!pagingWrap) return;

        const numEl = pagingWrap.querySelector('.number');
        const leftBtn = pagingWrap.querySelector('button.left');
        const rightBtn= pagingWrap.querySelector('button.right');
        if (!numEl) return;

        const totalPages = Math.ceil(parkingResult.length / PARK_PAGE_SIZE);
        numEl.innerHTML = '';

        if (totalPages <= 1) {
            leftBtn  && (leftBtn.disabled  = true);
            rightBtn && (rightBtn.disabled = true);
            return;
        }

        const maxWindow = 5;
        let start = Math.max(1, parkCurrentPage - Math.floor(maxWindow / 2));
        let end   = Math.min(totalPages, start + maxWindow - 1);
        if (end - start + 1 < maxWindow) {
            start = Math.max(1, end - (maxWindow - 1));
        }

        const createPage = (page, text = page) => {
            const span = document.createElement('span');
            span.textContent = text;
            if (page === parkCurrentPage) span.classList.add('active');
            numEl.appendChild(span);
        };

        if (start > 1) {
            createPage(1);
            if (start > 2) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.classList.add('dots');
                numEl.appendChild(dots);
            }
        }

        for (let p = start; p <= end; p++) {
            createPage(p);
        }

        if (end < totalPages) {
            if (end < totalPages - 1) {
                const dots = document.createElement('span');
                dots.textContent = '...';
                dots.classList.add('dots');
                numEl.appendChild(dots);
            }
            createPage(totalPages);
        }

        leftBtn  && (leftBtn.disabled  = parkCurrentPage === 1);
        rightBtn && (rightBtn.disabled = parkCurrentPage === totalPages);
    }

    let pagingBound = false;
    function bindPagingEvents() {
        if (pagingBound) return;
        pagingBound = true;

        const pagingWrap = document.querySelector('#parkingPaging');
        if (!pagingWrap) return;

        pagingWrap.addEventListener('click', (e) => {
            const left = e.target.closest('button.left');
            const right = e.target.closest('button.right');
            const num = e.target.closest('.number > span');

            const totalPages = Math.ceil(parkingResult.length / PARK_PAGE_SIZE);

            if (left && parkCurrentPage > 1) {
                parkCurrentPage--;
            } else if (right && parkCurrentPage < totalPages) {
                parkCurrentPage++;
            } else if (num) {
                const p = Number(num.textContent);
                if (!isNaN(p)) parkCurrentPage = p;
            } else {
                return;
            }

            renderParkingTable();
            renderParkingPaging();
        });
    }

    const uniq = arr => [...new Set(arr.filter(v => v != null && v !== ''))];

    function populateUl(ul, list) {

        if (!ul) return;
        ul.innerHTML = '';
        // "전체"
        const isInParkSearchSelect = ul.closest('#parkSearchSelect') !== null;
        if (!isInParkSearchSelect) {
            const liAll = document.createElement('li');
            liAll.textContent = '전체';
            liAll.dataset.value = '';
            ul.appendChild(liAll);
        }

        list.forEach(v => {
            const li = document.createElement('li');
            li.textContent = v.label;
            li.dataset.value = v.value;
            ul.appendChild(li);
        });
    }

    function fillSelectOptions(data) {
        const deviceIdUl = document.querySelector('#deviceIdSelect .select-box__content ul');
        const inoutTypeUl = document.querySelector('#inoutTypeSelect .select-box__content ul');
        const inoutCarIdUl = document.querySelector('#inoutCarIdSelect .select-box__content ul');
        const regularTypeUl= document.querySelector('#regularTypeSelect .select-box__content ul');
        const searchSelectUl = document.querySelector('#parkSearchSelect .select-box__content ul');

        const carIds = uniq(data.map(v => v.inoutCarId));

        populateUl(deviceIdUl, [
            { label: 'IN01', value: 'IN01' },
            { label: 'IN02', value: 'IN02' },
            { label: 'IN04', value: 'IN04' },
            { label: 'IN05', value: 'IN05' },
            { label: 'IN06', value: 'IN06' },
            { label: 'IN07', value: 'IN07' },
            { label: 'OT01', value: 'OT01' },
            { label: 'OT02', value: 'OT02' },
            { label: 'OT03', value: 'OT03' },
            { label: 'OT05', value: 'OT05' },
            { label: 'OT06', value: 'OT06' },
            { label: 'OT07', value: 'OT07' },
            { label: 'OT08', value: 'OT08' }
        ]);
        populateUl(inoutTypeUl, [
            { label: '입구', value: '0' },
            { label: '출구', value: '1' }
        ]);
        populateUl(inoutCarIdUl, carIds.map(v => ({ label: v, value: v })));
        populateUl(regularTypeUl, [
            { label: '정기권', value: 'R' },
            { label: '일반권', value: 'T' }
        ]);
        populateUl(searchSelectUl, [
            { label: '차량번호', value: 'carNo' },
            { label: '입차장비명', value: 'deviceNm' }
        ]);
        // populateUl(carNoUl, carNos.map(v => ({ label: v, value: v })));
    }

    let optionsFilled = false;
    const ymd = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    function resetParkingFilterUI() {

        const startInput = document.getElementById('parkStartDate');
        const endInput   = document.getElementById('parkEndDate');

        // if(startInput) startInput.value = '';
        // if(endInput) endInput.value = '';
        if (startInput && !startInput.value) {
            const now = new Date();
            const first = new Date(now.getFullYear(), now.getMonth(), 1);
            startInput.value = ymd(first);
        }
        if (endInput && !endInput.value) {
            endInput.value = ymd(new Date());
        }

        ['#deviceIdSelect','#inoutTypeSelect','#inoutCarIdSelect','#regularTypeSelect','#parkSearchSelect']
            .forEach(id => {
                const btn = document.querySelector(`${id} .select-box__btn`);
                if (btn) {
                    if (id === '#parkSearchSelect') {
                        btn.textContent = '차량번호';
                        btn.dataset.value = 'carNo';
                    } else {
                        btn.textContent = '전체';
                        btn.dataset.value = '';
                    }
                }
            });

        const parkSearchInput = document.getElementById('parkSearchInput');
        if (parkSearchInput) parkSearchInput.value = '';
    }


    const getParkingTags = (register = false) => {
        return api.get('/api/tags/parking', { params: { register } }).then(res => res.data?.TAGs ?? []);
    }
    const getParkingSearch = (params = {}) => {
        return api.get('/parking/search', { params }).then(res => Array.isArray(res.data) ? res.data : []);
    }

    function renderTagSummaryAndList(parkingTagValue) {
        const grouped = parkingTagValue.reduce((acc, { tagName, ...rest }) => {
            const parts = tagName.split('-');
            const key = parts[1];
            if (!acc[key]) acc[key] = [];
            acc[key].push({ tagName, ...rest });
            return acc;
        }, {});

        const listEl = document.querySelector('#parkingInfo .parking-area__list');
        listEl.innerHTML = '';
        let summaryEl = null;

        Object.entries(grouped).forEach(([key, items]) => {
            const totalObj = items.find(i => i.tagName.endsWith('Total'));
            const parkingObj = items.find(i => i.tagName.endsWith('Parking'));
            const total = totalObj   ? Number(totalObj.currentValue)   : 0;
            const parking = parkingObj ? Number(parkingObj.currentValue) : 0;
            const label = key === 'null' ? 'Total' : `${key}`;

            const div = document.createElement('div');
            if (label === 'Total') {
                div.className = 'parking-area__summary';
                div.innerHTML = `
                    <div class="title"><strong>${parking}</strong>/${total}</div>
                    <button id="parkSummaryRefresh" type="button" class="refresh"><span class="hide">새로고침</span></button>
                  `;
                summaryEl = div;
            } else {
                div.className = 'item';
                div.innerHTML = `
                    <span class="item__level">${label}</span>
                    <div class="item__count"><strong>${parking}</strong>/${total}</div>
                    <button id="parkSummaryDetail_${label}" type="button" class="item__link" data-label="${label}"><span class="hide">자세히보기</span></button>
                  `;
                listEl.appendChild(div);
            }
        });

        if (summaryEl) {
            listEl.prepend(summaryEl);
        }
        bindParkSummaryRefresh();
        bindParkSummaryDetail();
    }

    function renderResultHeader(result) {
        const totalCnt = result.length.toLocaleString();
        const titleEl = document.getElementById('parkingTotalCnt');
        if (!titleEl) return;

        const btn = titleEl.querySelector('button');
        titleEl.innerHTML = `총 ${totalCnt}`;
        if (btn) titleEl.appendChild(btn);
    }

    function renderResultTableAndPaging(result) {
        parkingResult = result;
        parkCurrentPage = 1;

        const tbody = document.querySelector('#parkingContentList tbody');
        if (tbody) tbody.innerHTML = '';

        bindPagingEvents();
        renderParkingPaging();
        renderParkingTable();
    }

    const setParking = async (searchParams = {}) => {

        const startInput = document.getElementById('parkStartDate');
        const endInput = document.getElementById('parkEndDate');
        const now = new Date();
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const startDate = ymd(first)
        const endDate = ymd(now)
        // if (startInput && !startInput.value) startInput.value = startDate;
        // if (endInput && !endInput.value) endInput.value = endDate;
        const startTime = `${startDate} 00:00:00.000`;
        const endTime = `${endDate} 23:59:59.999`;
        const params = { ...searchParams, startTime, endTime };

        try {
            try {
                const parkingTagValue = await getParkingTags(true);
                renderTagSummaryAndList(parkingTagValue);
            } catch (tagErr) {
                console.warn('getParkingTags error :', tagErr);
            }

            const result = await getParkingSearch(params);

            if (!optionsFilled) {
                fillSelectOptions(result);
                optionsFilled = true;
            }

            renderResultHeader(result);
            renderResultTableAndPaging(result);
        } catch (err) {
            console.error('setParking 전체 에러:', err);
        }
    }

    function buildParams() {
        const param = {};
        const start = document.getElementById('parkStartDate')?.value || '';
        const end   = document.getElementById('parkEndDate')?.value || '';

        if (start && end && new Date(start) > new Date(end)) {
            alertSwal('종료일이 시작일보다 빠릅니다.')
            return null;
        }

        if (start) {
            param.startTime = `${start} 00:00:00.000`;
        }
        if (end){
            param.endTime = `${end} 23:59:59.999`;
        }

        const getVal = sel => document.querySelector(`${sel} .select-box__btn`)?.dataset.value ?? '';

        const deviceId = getVal('#deviceIdSelect');
        const inoutType = getVal('#inoutTypeSelect');
        const exitId = getVal('#inoutCarIdSelect');
        const regularType = getVal('#regularTypeSelect');
        const searchType = getVal('#parkSearchSelect');

        const parkSearchInput  = document.getElementById('parkSearchInput')?.value.trim() ?? '';

        const setIf = (k, v) => { if (v !== '' && v != null) param[k] = v; };

        setIf('deviceId', deviceId);
        setIf('inoutType', inoutType);
        setIf('exitId', exitId);
        setIf('regularType', regularType);
        setIf('searchType', searchType);
        setIf('parkSearchInput', parkSearchInput);

        return param;
    }

    const parkSearchBtn = document.getElementById('parkSearchBtn');
    if (parkSearchBtn) {
        parkSearchBtn.addEventListener('click', async () => {
            const params = buildParams();
            try {
                const result = await getParkingSearch(params);
                renderResultHeader(result);
                renderResultTableAndPaging(result);
            } catch (e) {
                console.error('parkSearchBtn click error:', e);
            }
        });
    }

    ['#deviceIdSelect','#inoutTypeSelect','#inoutCarIdSelect','#regularTypeSelect','#parkSearchSelect']
        .forEach(id => {
            const box = document.querySelector(id);
            if (box && !box.dataset.bound) {
                initSelectBox(box);
                box.dataset.bound = '1';
            }
        });

    const parkRefreshBtn = document.getElementById('parkRefresh');
    if (parkRefreshBtn) {
        parkRefreshBtn.addEventListener('click', async (event) => {
            try {
                resetParkingFilterUI();
                const params = buildParams() || {};
                const result = await getParkingSearch(params);
                renderResultHeader(result);
                renderResultTableAndPaging(result);
            } catch (err) {
                console.error('parkRefresh error:', err);
            }
        })
    }

    // const parkSummaryRefreshBtn = document.getElementById('parkSummaryRefresh');
    // if (parkSummaryRefreshBtn) {
    //     parkSummaryRefreshBtn.addEventListener('click', async (e) => {
    //         try {
    //             const parkingTagValue = await getParkingTags();
    //             renderTagSummaryAndList(parkingTagValue);
    //         } catch (err) {
    //             console.error('tags refresh error:', err);
    //         }
    //     })
    // }

    function bindParkSummaryRefresh() {
        const btn = document.getElementById('parkSummaryRefresh');
        if (!btn) return;
        btn.onclick = null;
        btn.addEventListener('click', async () => {
            try {
                const parkingTagValue = await getParkingTags(false);
                renderTagSummaryAndList(parkingTagValue);
            } catch (err) {
                console.error('tags refresh error:', err);
            }
        });
    }

    function bindParkSummaryDetail() {

        const buildingList = BuildingManager.findAll();
        const parkingMap = (buildingList || []).find(building => building?.name?.includes('주차장'));
        const currentId = new URLSearchParams(location.search).get('buildingId');
        document.querySelectorAll('.item__link').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('systemPopup').style.display = 'none';
                document.getElementById('parkingPop').style.display = 'none';
                document.getElementById('parkingTab').classList.remove = 'active'

                const label = item.dataset.label;
                if (String(currentId) !== String(parkingMap.id)) {
                    sessionStorage.setItem('parkingFloor', label);
                    window.location.href = `/map?buildingId=${parkingMap.id}`;
                }
                const floor = (parkingMap?.floors || []).find(f => f?.name === label);
                Px.Model.Visible.HideAll();
                Px.Model.Visible.Show(floor.id);
            })
        })
    }

    function initSelectBox(box) {
        const btn = box.querySelector('.select-box__btn');
        const content = box.querySelector('.select-box__content');
        if (!btn || !content) return;

        btn.addEventListener('click', () => {
            btn.classList.toggle('select-box__btn--active');
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });

        content.addEventListener('click', e => {
            const li = e.target.closest('li');
            if (!li) return;

            btn.textContent   = li.textContent;
            btn.dataset.value = li.dataset.value ?? '';
            btn.classList.remove('select-box__btn--active');
            btn.classList.add('select-box__btn--selected');
            content.style.display = 'none';
        });
    }

    function downloadParkingExcel() {
        if (!Array.isArray(parkingResult) || parkingResult.length === 0) return;

        const header = [
            'No', '입차장비 ID', '입차 장비명', '입출구',
            '입출차 시각', '차량 번호', '출차 ID', '주차 요금', '구분'
        ];

        const rows = parkingResult.map((item, idx) => ([
            idx + 1,
            item.deviceId || '',
            item.deviceName || '',
            (item.inoutType === 0 || item.inoutType === '0') ? '입구' : '출구',
            item.gateDatetime || '',
            item.carNo || '',
            item.inoutCarId || '',
            item.parkingFee ?? 0,
            item.regularType === 'R' ? '정기권' : '일반권'
        ]));

        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'parking');
        const startVal = document.getElementById('parkStartDate')?.value || 'all';
        const endVal   = document.getElementById('parkEndDate')?.value   || 'all';
        const rangeStr = (startVal === 'all' && endVal === 'all') ? 'all' : `${startVal}_${endVal}`;
        XLSX.writeFile(wb, `parking_${rangeStr}.xlsx`);

        // 임시 추가
        const rawHeader = [
            'No', 'deviceId', 'deviceName', 'inoutType',
            'gateDatetime', 'carNo', 'inoutCarId', 'parkingFee', 'regularType'
        ];

        const rowsRaw = parkingResult.map((item, idx) => ([
            idx + 1,
            item.deviceId || '',
            item.deviceName || '',
            item.inoutType ?? '',
            item.gateDatetime || '',
            item.carNo || '',
            item.inoutCarId || '',
            item.parkingFee ?? 0,
            item.regularType ?? ''
        ]));
        const wb2 = XLSX.utils.book_new();
        const ws2 = XLSX.utils.aoa_to_sheet([rawHeader, ...rowsRaw]);
        XLSX.utils.book_append_sheet(wb2, ws2, 'parking_raw');
        XLSX.writeFile(wb2, `parking_${rangeStr}_raw.xlsx`);
    }

    const btn = document.querySelector('#parkingFooter .download');
    if (btn && !btn.dataset.bound) {
        btn.dataset.bound = '1';
        btn.addEventListener('click', downloadParkingExcel);
    }
    // 주차 popup end

    const eventExcelBtn = document.querySelector('#eventDownload');
    eventExcelBtn.addEventListener('click', downloadEventExcel);

    const eventPdfBtn = document.querySelector('#eventPdfDownload');
    eventPdfBtn?.addEventListener('click', () => {
        const txt = sel => (document.querySelector(sel)?.textContent || '').trim();

        const building = txt('#eventBuildingSelect .select-box__btn');
        const device = txt('#eventPoiSelect .select-box__btn');

        const allEventChecked = document.getElementById('allEventCheck')?.checked === true;
        const checked = document.querySelectorAll('#eventCheckBoxList input[type="checkbox"]:not(#allEventCheck):checked');
        const labelFromCb = cb => (cb.dataset.label?.trim()) || (cb.nextElementSibling?.textContent?.trim() || '');
        const eventLabel = (allEventChecked || checked.length === 0)
            ? '전체'
            : Array.from(new Set(Array.from(checked, labelFromCb))).filter(Boolean).join(', ');

        let mode = 'all', B = null, D = null;
        if (device && device !== '전체') { mode = 'device';   D = device; }
        else if (building && building !== '전체') { mode = 'building'; B = building; }

        downloadEventReportPdf({ mode, building: B, device: D, event: eventLabel });

    });

    async function downloadEventReportPdf({ mode = 'all', building = null, device = null, event = null } = {}) {
        // 데이터 소스
        const list = (window._eventExport?.list && Array.isArray(window._eventExport.list))
            ? window._eventExport.list
            : (typeof matchedAlarms !== 'undefined' && Array.isArray(matchedAlarms) ? matchedAlarms : []);
        const pois = (window._eventExport?.poiList && Array.isArray(window._eventExport.poiList))
            ? window._eventExport.poiList
            : (Array.isArray(poiList) ? poiList : []);

        const norm = v => String(v ?? '').trim().toLowerCase();
        const checked = document.querySelectorAll('#eventCheckBoxList input[type="checkbox"]:not(#allEventCheck):checked');
        const selectedEvents = Array.from(checked).map(cb =>
            cb.dataset.type ? norm(cb.dataset.type) : norm(cb.nextElementSibling?.textContent)
        );
        const filteredList = selectedEvents.length
            ? list.filter(a => selectedEvents.includes(norm(a.event)))
            : list;

        // 피벗 생성
        const pivot = buildEventPivot(filteredList, pois, { mode, building, device, event });

        // 오프스크린 DOM 생성
        const el = document.createElement('div');
        el.id = 'event-report-pdf';
        el.style.padding = '24px';
        el.style.fontFamily = 'Malgun Gothic, Apple SD Gothic Neo, NanumGothic, sans-serif';
        el.innerHTML = `
          <style>
            .title { font-size:20px; font-weight:700; text-align:center; margin-bottom:14px; }
            .meta { width:100%; border-collapse:collapse; font-size:12px; margin-bottom:10px; }
            .meta th, .meta td { border:1px solid #aaa; padding:6px 8px; text-align:center; }
            .data { width:100%; border-collapse:collapse; font-size:12px; }
            .data th, .data td { border:1px solid #aaa; padding:6px 6px; text-align:center; }
            .data thead th { background:#efefef; font-weight:700; }
            .data tfoot td { background:#f4f4f4; font-weight:700; }
            .left { text-align:left; }
          </style>
        
          <div class="title">이벤트 통계 리포트</div>
        
          <table class="meta">
            <tr>
              <th style="width:10%;background:#f4f4f4;">건물</th><td style="width:40%">${pivot.meta.buildingLabel}</td>
              <th style="width:10%;background:#f4f4f4;">이벤트</th><td style="width:40%">${pivot.meta.eventLabel}</td>
            </tr>
            <tr>
              <th style="background:#f4f4f4;">장비</th><td>${pivot.meta.deviceLabel}</td>
              <th style="background:#f4f4f4;">기간</th><td>${pivot.meta.periodLabel}</td>
            </tr>
          </table>
        
          <div class="section-title" style="margin:8px 0 12px">■ 이벤트 발생 횟수</div>
          
          <table class="data">
            <thead>
              <tr>
                <th class="left">장비</th>
                ${pivot.headers.map(h => `<th>${h}</th>`).join('')}
                <th>소계</th>
              </tr>
            </thead>
            <tbody>
              ${pivot.rows.map(r => `
                <tr>
                  <td class="left">${r.name}</td>
                  ${r.counts.map(c => `<td>${c === '' ? '' : (c ?? 0)}</td>`).join('')}
                  <td>${r.subtotal}</td>
                </tr>`).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td>합계</td>
                ${pivot.colTotals.map(t => `<td>${t}</td>`).join('')}
                <td>${pivot.grandTotal}</td>
              </tr>
            </tfoot>
          </table>
          `;

        document.body.appendChild(el);

        // PDF 저장
        const s = document.getElementById('start-date')?.value || 'all';
        const e = document.getElementById('end-date')?.value || 'all';
        const rangeStr = (s === 'all' && e === 'all') ? 'all' : `${s}_${e}`;
        const namePart =
            mode === 'building' ? `building_${pivot.meta.buildingLabel}` :
                mode === 'device' ? `device_${pivot.meta.deviceLabel}` : 'all';

        await html2pdf().set({
            margin: [10, 10, 14, 10],
            filename: `event_report_${namePart}_${rangeStr}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(el).save();

        el.remove();
    }

    // 피벗 생성기
    function buildEventPivot(list, pois, { mode, building, device, event }) {

        // tagName → poi
        const findPoiByTag = (tag) => (pois || []).find(p =>
            Array.isArray(p.tagNames) &&
            p.tagNames.some(t => String(t).toLowerCase() === String(tag || '').toLowerCase())
        );

        // 이벤트 레코드 확장
        const rows = list.map(it => {
            const poi = findPoiByTag(it.tagName);
            return {
                building: poi?.property?.buildingName ?? '',
                deviceCat: poi?.property?.poiMiddleCategoryName ?? '기타',
                eventName: it.event ?? ''
            };
        });

        // 1) 컬럼 헤더 = poiList의 "모든 건물"
        let headers = Array.from(new Set(
            (pois || []).map(p => p?.property?.buildingName).filter(Boolean)
        )).sort((a, b) => a.localeCompare(b, 'ko'));
        if (headers.length === 0) headers = ['전체'];

        // 2) 행 헤더 = poiList의 "모든 장비 분류" ∪ 이벤트에 등장한 분류
        const deviceFromPois   = (pois || []).map(p => p?.property?.poiMiddleCategoryName).filter(Boolean);
        const deviceFromEvents = rows.map(r => r.deviceCat).filter(Boolean);
        let deviceRows = Array.from(new Set([...deviceFromPois, ...deviceFromEvents]))
            .sort((a, b) => a.localeCompare(b, 'ko'));
        if (device && mode === 'device') deviceRows = [device];

        // 3) 카운팅
        const counts = {};
        rows.forEach(r => {
            if (mode === 'building' && building && r.building !== building) return;
            if (mode === 'device' && device && r.deviceCat !== device)   return;
            counts[r.deviceCat] ??= {};
            counts[r.deviceCat][r.building] = (counts[r.deviceCat][r.building] || 0) + 1;
        });

        // 4) 표 본문: 모든 건물 컬럼을 항상 생성
        const body = deviceRows.map(name => {
            const perCols = headers.map(h => {
                const v = counts[name]?.[h] || 0;
                return (mode === 'building' && building && h !== building) ? '' : v;
            });
            const subtotal = perCols.reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0);
            return { name, counts: perCols, subtotal };
        });

        // 5) 합계
        const colTotals = headers.map((h, i) =>
            body.reduce((s, r) => s + (typeof r.counts[i] === 'number' ? r.counts[i] : 0), 0)
        );
        const grandTotal = body.reduce((s, r) => s + r.subtotal, 0);

        // 6) 메타
        const s = document.getElementById('start-date')?.value || '전체';
        const e = document.getElementById('end-date')?.value   || '전체';

        return {
            headers,
            rows: body,
            colTotals,
            grandTotal,
            meta: {
                buildingLabel: building ? building : '전체',
                deviceLabel: device ? device : '전체',
                eventLabel: event ? event : '전체',
                periodLabel: (s === '전체' && e === '전체') ? '전체' : `${s}~${e}`
            }
        };
    }

    const setAirTab = () => {
        const buildingBtn = document.querySelector('#airBuildingSelector .select-box__btn');
        const onOffBtn = document.querySelector('#airOnOffSelector .select-box__btn');
        const modeBtn = document.querySelector('#airModeSelector .select-box__btn')
        const volumeBtn = document.querySelector('#airVolumeSelector .select-box__btn');


        const handleSelectItem = (event, buttonElement) => {
            buttonElement.textContent = event.target.textContent;
            buttonElement.classList.remove('select-box__btn--active');
        };

        buildingBtn.onclick = () => buildingBtn.classList.toggle('select-box__btn--active');
        onOffBtn.onclick = () => onOffBtn.classList.toggle('select-box__btn--active');
        modeBtn.onclick = () => modeBtn.classList.toggle('select-box__btn--active');
        volumeBtn.onclick = () => volumeBtn.classList.toggle('select-box__btn--active');

        const buildingUl = document.getElementById('airBuildingUl');
        buildingUl.onclick = (eve) => handleSelectItem(eve, buildingBtn);

        const onOffUl = document.querySelector('#airOnOffSelector ul');
        onOffUl.onclick = (eve) => handleSelectItem(eve, onOffBtn);

        const modeUl = document.querySelector('#airModeSelector ul');
        modeUl.onclick = (eve) => handleSelectItem(eve, modeBtn);

        const volumeUl = document.querySelector('#airVolumeSelector ul');
        volumeUl.onclick = (eve) => handleSelectItem(eve, volumeBtn);
    }

    async function loadAircons() {
        const res = await fetch('/api/tags/airConditioner', {headers: {'Accept': 'application/json'}});
        if (!res.ok) return;
        const data = await res.json(); // groupedTagMap

        const container = document.querySelector('#ac-list');
        if (!container) return;
        const paging = document.querySelector('#airPaging');
        const leftBtn = paging ? paging.querySelector('.left') : null;
        const rightBtn = paging ? paging.querySelector('.right') : null;
        const numberBox = paging ? paging.querySelector('.number') : null;

        const opModeText = v => {
            const n = Number(v);
            if (Number.isNaN(n)) return '-';
            return ({0: '대기', 1: '냉방', 2: '난방', 3: '제습', 4: '송풍'}[n]) ?? `N/A`;
        };
        const fanText = v => {
            const n = Number(v);
            if (Number.isNaN(n)) return '-';
            return ({0: '자동', 1: '약풍', 2: '중풍', 3: '강풍'}[n]) ?? `N/A`;
        };
        const bySuffix = (tags, suffix) => {
            const key = Object.keys(tags).find(k => k.endsWith(suffix));
            return key ? tags[key] : null;
        };
        const fmtTemp = v => {
            if (v == null || isNaN(v)) return '-';
            const num = Number(v);
            return num < 100 ? `${num.toFixed(1)}℃` : `${Math.round(num)}℃`;
        };

        const groupWing = {};
        Object.entries(data).forEach(([groupName, tags]) => {
            const anyKey = Object.keys(tags)[0];
            if (!anyKey) return;
            const m = anyKey.match(/^([A-Za-z]+)-null-EHP-EHP-/);
            groupWing[groupName] = m ? m[1] : '';
        });

        // 필터 UI 참조(미리 고정된 항목 사용)
        const buildingUl = document.getElementById('airBuildingUl');
        const buildingBtn = document.querySelector('#airBuildingSelector .select-box__btn');
        const onoffUl = document.querySelector('#airOnOffSelector .select-box__content ul');
        const onoffBtn = document.querySelector('#airOnOffSelector .select-box__btn');
        const modeUl = document.querySelector('#airModeSelector .select-box__content ul');
        const modeBtn = document.querySelector('#airModeSelector .select-box__btn');
        const volumeUl = document.querySelector('#airVolumeSelector .select-box__content ul');
        const volumeBtn = document.querySelector('#airVolumeSelector .select-box__btn');

        // A/B/C ↔ 한글 라벨 매핑
        const WING_LABEL = { A: 'A동', B: 'B동', C: '판매시설/주차장' };
        const LABEL_TO_WING = Object.fromEntries(Object.entries(WING_LABEL).map(([k, v]) => [v, k]));

        const totalCntEl = document.getElementById('totalAirCnt');

        // 필터 상태
        const filter = { wing: null, power: null, mode: null, fan: null };

        // 라벨 매핑/정규화
        const MODE_LABEL_BY_CODE = {0: '자동', 1: '냉방', 2: '난방', 3: '송풍', 4: '제습'};

        // 페이지 상태
        const keys = Object.keys(data);
        const state = {
            data,
            keys,
            page: 1,
            size: 20,
            get totalPages() { return Math.ceil(this.keys.length / this.size) || 1; }
        };

        const renderList = (entries) => {
            container.innerHTML = '';
            
            // 검색 결과가 없을 때 메시지 표시
            if (entries.length === 0) {
                container.innerHTML = `
                    <div class="detail__empty">검색 결과가 없습니다.</div>
                `;
                return;
            }
            
            entries.forEach(([groupName, tags]) => {
                const power = bySuffix(tags, '-power');
                const on = Number(power) === 1;

                if (!on) {
                    container.insertAdjacentHTML('beforeend', `
                    <li class="off">
                        <div class="head">
                            <div class="head__title"><span class="head__state">OFF</span> <div class="head__detail"><span>${WING_LABEL[groupWing[groupName]]} | ${groupName}</span></div></div>
                        </div>
                        <div class="detail">
                            <div class="detail__empty">대기상태 입니다</div>
                        </div>
                    </li>
                    `);
                    return;
                }

                const setTemp = bySuffix(tags, '-setTemp');
                const roomTemp = bySuffix(tags, '-roomTemp');
                const opMode = bySuffix(tags, '-opMode');
                const fanSpeed = bySuffix(tags, '-fanSpeed');

                container.insertAdjacentHTML('beforeend', `
                    <li>
                        <div class="head">
                            <div class="head__title"><span class="head__state">ON</span> <div class="head__detail"><span>${WING_LABEL[groupWing[groupName]]} | ${groupName}</span></div></div>
                        </div>
                        <div class="detail">
                            <div class="detail__state">
                                <div class="detail__info">
                                    <div class="temp temp--current">
                                        <span class="temp__image"><span class="hide">에어컨</span></span>
                                        <span class="temp__state">
                                            <span class="temp__text">현재</span>
                                            <span class="temp__value">${fmtTemp(roomTemp)}</span>
                                        </span>
                                    </div>
                                    <div class="temp temp--set">
                                        <span class="temp__state">
                                            <span class="temp__text">설정온도</span>
                                            <span class="temp__value">${fmtTemp(setTemp)}</span>
                                        </span>
                                    </div>
                                </div>
                                <div class="detail__mode">
                                    <div class="item item">
                                        <span class="item__image"><span class="hide">모드</span></span>
                                        <span class="item__label">${opModeText(opMode)}</span>
                                    </div>
                                    <div class="item item">
                                        <span class="item__image item__image--fan"><span class="hide">팬속도</span></span>
                                        <span class="item__label">${fanText(fanSpeed)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                `);
            });
        };

        const renderPagination = () => {
            if (!paging || !numberBox) return;
            numberBox.innerHTML = '';
            
            // 현재 페이지 그룹 계산 (10페이지 단위)
            const currentGroup = Math.ceil(state.page / 10);
            const startPage = (currentGroup - 1) * 10 + 1;
            const endPage = Math.min(startPage + 9, state.totalPages);
            
            // 페이지 번호 생성 (최대 10개)
            for (let i = startPage; i <= endPage; i++) {
                const span = document.createElement('span');
                span.textContent = String(i);
                if (i === state.page) span.classList.add('active');
                span.addEventListener('click', () => renderPage(i));
                numberBox.appendChild(span);
            }
            
            // Left 버튼: 이전 10페이지 그룹으로 이동
            if (leftBtn) {
                if (currentGroup > 1) {
                    leftBtn.style.display = '';
                    leftBtn.onclick = () => {
                        const prevGroupLastPage = (currentGroup - 2) * 10 + 10;
                        renderPage(prevGroupLastPage);
                    };
                } else {
                    leftBtn.style.display = 'none';
                }
            }
            
            // Right 버튼: 다음 10페이지 그룹으로 이동
            if (rightBtn) {
                const maxGroup = Math.ceil(state.totalPages / 10);
                if (currentGroup < maxGroup) {
                    rightBtn.style.display = '';
                    rightBtn.onclick = () => {
                        const nextGroupFirstPage = currentGroup * 10 + 1;
                        renderPage(nextGroupFirstPage);
                    };
                } else {
                    rightBtn.style.display = 'none';
                }
            }
        };

        const renderPage = (p) => {
            state.page = Math.min(Math.max(1, p), state.totalPages);
            const start = (state.page - 1) * state.size;
            const end = start + state.size;
            const sliceKeys = state.keys.slice(start, end);
            const entries = sliceKeys.map(k => [k, state.data[k]]);
            // 6개 이상인 것들만 로그 출력
            // entries.forEach(([key, data]) => {
            //     const count = Array.isArray(data) ? data.length : (data ? Object.keys(data).length : 0);
            //     if (count >= 6) {
            //         console.log(`Key: ${key}, 개수: ${count}`, data);
            //     }
            // });
            renderList(entries);
            renderPagination();
        };

        // 필터 적용 로직
        const applyFilter = () => {
            const bySuffixVal = (tags, suffix) => {
                const key = Object.keys(tags).find(k => k.endsWith(suffix));
                return key ? tags[key] : null;
            };

            const filtered = Object.entries(data).filter(([groupName, tags]) => {
                // wing 필터
                if (filter.wing && groupWing[groupName] !== filter.wing) return false;

                // ON/OFF 필터
                if (filter.power) {
                    const p = Number(bySuffixVal(tags, '-power')) === 1 ? 'ON' : 'OFF';
                    if (p !== filter.power) return false;
                }

                // 모드 필터
                if (filter.mode) {
                    const m = Number(bySuffixVal(tags, '-opMode'));
                    const label = MODE_LABEL_BY_CODE[m] ?? `${m}`;
                    if (label !== filter.mode) return false;
                }

                // 풍량 필터
                if (filter.fan) {
                    const f = Number(bySuffixVal(tags, '-fanSpeed'));
                    const label = fanText(f);
                    if (label !== filter.fan) return false;
                }

                return true;
            });

            state.keys = filtered.map(([k]) => k);
            if (totalCntEl) totalCntEl.textContent = String(state.keys.length);
            renderPage(1);
        };

        // 필터 이벤트 바인딩
        if (buildingUl) {
            buildingUl.addEventListener('click', (e) => {
                const li = e.target.closest('li');
                if (!li) return;
                const text = li.textContent.trim();
                filter.wing = (text === '건물 전체') ? null : (LABEL_TO_WING[text] || null);
                if (buildingBtn) buildingBtn.textContent = text;
            });
        }
        if (onoffUl) {
            onoffUl.addEventListener('click', (e) => {
                const li = e.target.closest('li');
                if (!li) return;
                const text = li.textContent.trim();
                filter.power = (text === 'ON/OFF 전체') ? null : text;
                if (onoffBtn) onoffBtn.textContent = text;
            });
        }
        if (modeUl) {
            modeUl.addEventListener('click', (e) => {
                const li = e.target.closest('li');
                if (!li) return;
                const text = li.textContent.trim();
                filter.mode = (text === '모드 전체') ? null : text;
                if (modeBtn) modeBtn.textContent = text;
            });
        }
        if (volumeUl) {
            volumeUl.addEventListener('click', (e) => {
                const li = e.target.closest('li');
                if (!li) return;
                const text = li.textContent.trim();
                filter.fan = (text === '풍량 전체') ? null : text;
                if (volumeBtn) volumeBtn.textContent = text;
            });
        }

        // 검색 버튼 클릭 시에만 필터 적용
        const searchBtn = document.querySelector('#airPop .search-result__filter .button--solid-middle');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                applyFilter();
            });
        }

        if (totalCntEl) totalCntEl.textContent = String(state.keys.length);
        renderPage(1);
    }

    // 설비 popup
    const equipmentPopup = document.getElementById('equipmentPop');
    const setEquipmentTab = () => {
        const popupUl = equipmentPopup.querySelector('.section--info ul')
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
        allTabLi.textContent = '전체';

        allTabLi.addEventListener("click", () => {
            updateActiveTab(allTabLi);
            setEquipmentData("");
        });

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

                popupLi.textContent = building.name;
                popupLi.addEventListener("click", () => {
                    updateActiveTab(popupLi);
                    setEquipmentData(building.id);
                });

                popupUl.appendChild(popupLi);
            });
            updateActiveTab(allTabLi);
            setEquipmentData("");
        });
    }

    const setEquipmentData = (buildingId) => {
        const eqAccordion = document.getElementById("eqAccordion");
        eqAccordion.replaceChildren();

        const allCategories = PoiCategoryManager.findAll();
        const equipmentCategory = allCategories.find(category => category.name.toLowerCase() === "설비");
        if (!equipmentCategory) return;

        const pois = PoiManager.findByPoiCategory(buildingId, "", equipmentCategory.id);

        const middleMap = new Map();
        pois.forEach(poi => {
            const middleName = (poi.poiMiddleCategoryDetail?.name || "기타").trim();
            if (middleMap.has(middleName)) {
                middleMap.get(middleName).push(poi);
            } else {
                middleMap.set(middleName, [poi]);
            }
        });

        let firstAccordionBtn = null;
        let firstPoi = null;
        let groupIndex = 0;

        middleMap.forEach((poiList, middleName) => {
            const poiCount = poiList.length;
            const btn = document.createElement("button");
            btn.classList.add("accordion__btn");
            btn.textContent = `${middleName} (${poiCount})`;

            if (groupIndex === 0) {
                firstAccordionBtn = btn;
            }

            const detailDiv = document.createElement("div");
            detailDiv.classList.add("accordion__detail");
            detailDiv.style.display = "none";

            if (poiList.length > 0) {
                const table = document.createElement("table");
                const tbody = document.createElement("tbody");

                poiList.forEach((poi, poiIndex) => {
                    const tr = document.createElement("tr");
                    const td = document.createElement("td");
                    td.classList.add("align-left");
                    td.style.paddingLeft = "10%";
                    td.textContent = poi.name;
                    td.setAttribute("td-poi-id", poi.id);

                    if (groupIndex === 0 && poiIndex === 0) {
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

            groupIndex++;
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
        document.querySelectorAll(".section--info ul li").forEach(tab => {
            tab.classList.remove("active");
            tab.setAttribute("aria-selected", "false");
        });

        selectedTab.classList.add("active");
        selectedTab.setAttribute("aria-selected", "true");
    };

    if (equipmentPopup) {
        const moveBtn = equipmentPopup.querySelector(".section__head .button-move");
        moveBtn.addEventListener("click", () => {
            const poiId = moveBtn.getAttribute("btn-poi-id");
            elevatorPopup.style.display = "none";
            systemPop.style.display = "none";
            movePoi(poiId);
        });
    }

    const updatePoiDetail = (poi) => {
        const sectionHead = equipmentPopup.querySelector(".section__head");
        const title = equipmentPopup.querySelector(".section__head .title");
        const sectionDetail = equipmentPopup.querySelector(".section__detail");

        title.textContent = `${poi.name} | ${poi.property.buildingName} | ${poi.property.floorNo}`;

        const moveBtn = sectionHead.querySelector(".button-move");
        moveBtn.setAttribute("btn-poi-id", poi.id);
    }

    let selectedLightGroup = null;
    let selectedLightId = null;
    const movePoi = async (id) => {
        let poiId;
        if (id.constructor.name === 'PointerEvent') {
            poiId = id.currentTarget.getAttribute('poiid');
        } else {
            poiId = id;
        }
        // 현재 building의 POI 확인
        let poiData = Px.Poi.GetData(poiId);
    
        // 현재 building에서 POI를 찾을 수 없는 경우
        if (!poiData) {
            // POI 정보를 서버에서 가져오기
            const poi = await PoiManager.findById(Number(poiId));
            if (!poi) {
                alertSwal('POI 정보를 찾을 수 없습니다.');
                return;
            }
            // 다른 building으로 이동
            sessionStorage.setItem('selectedPoiId', poi.id);

            window.location.href = `/map?buildingId=${poi.buildingId}`;
            return;
        }
        const floor = BuildingManager.findFloorsByHistory().find(
            (floor) => Number(floor.no) === Number(poiData.property.floorNo),
        );
    
        // 같은 building 내에서의 이동
        Px.Model.Visible.HideAll();
        const building = BuildingManager.findById(poiData.property.buildingId);
        if (building.isIndoor === 'N') {
            Px.Model.Visible.ShowAll();
            Px.Poi.HideAll();
        } else {
            Px.Model.Visible.Show(Number(floor.id));
            Px.Poi.HideAll();
            Px.Poi.ShowByProperty("floorNo", Number(poiData.property.floorNo));
        }

        const floorNo = poiData.property.floorNo;
        Init.moveToFloorPage(floorNo);
        const floorElement = document.querySelector(`li[floor-id="${floorNo}"]`);
        if (floorElement) {
            floorElement.click(); // 클릭 이벤트 실행
        }

        Px.Camera.MoveToPoi({
            id: poiId,
            isAnimation: true,
            duration: 500,
            heightOffset:200
        });

        if (poiData.property.lightGroup) {
            if (selectedLightGroup === poiData.property.lightGroup) {
                if (selectedLightId === poiData.id) {
                    Px.Poi.RestoreColorAll();
                    selectedLightGroup = null;
                    selectedLightId = null;
                } else {
                    selectedLightId = poiData.id;
                }
            } else {
                Px.Poi.RestoreColorAll();
                Px.Poi.SetColorByProperty('lightGroup', poiData.property.lightGroup, '#f80606');
                selectedLightGroup = poiData.property.lightGroup;
                selectedLightId = poiData.id;
            }
        }
    };

    const closePlayers = () => {

        Object.values(window.livePlayers).forEach(player => {

            if (!player) return;

            player.stopPlayback();

            // 공통 처리
            player.cancelDraw && player.cancelDraw();

            if (player.type === 'hls') {
                try {
                    player.hls.destroy();
                } catch (e) {
                    console.error("HLS destroy error", e);
                }
            }

            if (player.videoEl) {
                player.videoEl.pause();
                player.videoEl.src = '';
                if (document.body.contains(player.videoEl)) {
                    document.body.removeChild(player.videoEl);
                }
                player.videoEl = null;
            }


            if (player.type === 'hls' && player.httpRelayUrl && player.cameraIp) {
                const stopPort = 4012;
                fetch(`${player.httpRelayUrl}:${stopPort}/stop_stream`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cameraIp: player.cameraIp })
                }).catch(console.error);
            }

            window.livePlayers = {};
        });
    };

    const closePlayer = (canvasId) => {
        const player = window.livePlayers[canvasId];

        if (!player) {
            console.warn(`Player for canvasId ${canvasId} not found!`);
            return;
        }

        // playback 중인지 live 중인지 확인
        if(player.isLive){
            console.log("Stopping live player for canvasId:", canvasId);
            player.cancelDraw && player.cancelDraw();
        }else{
            console.log("Stopping playback player for canvasId:", canvasId);
            player.stopPlayback();
        }
        delete window.livePlayers[canvasId];
        console.log(`Player for canvasId ${canvasId} closed.`);
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
        const liAll = document.createElement('li');
        liAll.textContent = '건물 전체';
        liAll.onclick = () => {
            buildingBtn.textContent = '건물 전체';
            buildingBtn.classList.remove("select-box__btn--active");
            buildingBtn.classList.add("select-box__btn--selected");
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
                buildingBtn.classList.add("select-box__btn--selected");
                buildingSelect.querySelector(".select-box__content").classList.remove("active");
                updateFloorSelectBox(building.floors, building.id);
            }

            buildingContent.appendChild(li);
        });
        // if (buildingList.length > 0) {
        //     buildingBtn.textContent = buildingList[0].name;
        //     updateFloorSelectBox(buildingList[0].floors, buildingList[0].id);
        // }
        buildingBtn.textContent = '건물 전체';
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
        const allPois = PoiManager.findAll();
        const liAll = document.createElement('li');
        liAll.textContent = "층 전체";
        liAll.onclick = () => {
            floorBtn.textContent = "층 전체";
            floorBtn.classList.remove("select-box__btn--active");
            floorBtn.classList.add("select-box__btn--selected");
            floorSelect.querySelector(".select-box__content").classList.remove("active");
            const allPois = PoiManager.findAll();
            if (buildingId) {
                // const allPois = PoiManager.findAll();
                const filteredPois = allPois.filter(poi => poi.buildingId === Number(buildingId));
                updatePoiSelectBox(filteredPois);
            } else {
                updatePoiSelectBox(allPois);
                // PoiManager.getFilteredPoiList().then((pois) => {
                //     updatePoiSelectBox(pois);
                // })
            }
        };
        floorContent.appendChild(liAll);

        floorList.forEach(floor => {
            const li = document.createElement('li');
            li.textContent = floor.name;

            li.onclick = () => {
                floorBtn.textContent = floor.name;
                floorBtn.classList.remove("select-box__btn--active");
                floorBtn.classList.add("select-box__btn--selected");
                floorSelect.querySelector(".select-box__content").classList.remove("active");

                // const allPois = PoiManager.findAll();
                const filteredPois = allPois.filter(poi => poi.floorNo === Number(floor.no));
                updatePoiSelectBox(filteredPois);
            }

            floorContent.appendChild(li);
        });
        if (floorList.length > 0) {
            // floorBtn.textContent = floorList[0].name;
            floorBtn.textContent = "층 전체";
            updatePoiSelectBox(allPois);
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

            // const poiCategories = Array.from(
            //     new Map(poiList.map(poi => [poi.poiCategoryDetail.id, poi.poiCategoryDetail])).values()
            // );
            const poiCategories = Array.from(
                new Map(poiList.map(poi => [poi.poiMiddleCategoryDetail.id, poi.poiMiddleCategoryDetail])).values()
            );

            const liAll = document.createElement('li');
            liAll.textContent = "장비 전체";
            liAll.onclick = () => {
                poiBtn.textContent = "장비 전체";
                poiBtn.classList.remove("select-box__btn--active");
                poiBtn.classList.add("select-box__btn--selected");
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
                    poiBtn.classList.add("select-box__btn--selected");
                    poiSelect.querySelector(".select-box__content").classList.remove("active");
                };
                poiContent.appendChild(li);
            });
            poiBtn.textContent = "장비 전체";
        }

        poiBtn.onclick = () => {
            if (poiBtn.classList.contains("select__btn--disabled")) return;
            toggleSelectBox(poiSelect);
        };
    }

    const toggleSelectBox = (selectBoxElement) => {
        document.querySelectorAll('#eventPoiSelect, #eventFloorSelect, #eventBuildingSelect').forEach(el => {
            if (el !== selectBoxElement) {
                const btn = el.querySelector('.select-box__btn');
                const content = el.querySelector('.select-box__content');
                btn.classList.remove('select-box__btn--active');
                content.classList.remove('active');
            }
        });
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

    function formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return "-";
        const date = new Date(dateTimeStr);
        const pad = (num) => String(num).padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    function createEventCheck(alarmTypes, listElementId) {
        const listEl = document.getElementById(listElementId);
        if (!listEl) {
            console.warn(`Element with id "${listElementId}" not found.`);
            return;
        }
        listEl.innerHTML = "";

        const defaultLi = document.createElement("li");
        defaultLi.innerHTML = `
            <span class="checkbox-wrap">
              <input type="checkbox" id="allEventCheck" checked>
              <label for="allEventCheck">이벤트 전체</label>
            </span>
          `;
        listEl.appendChild(defaultLi);

        const allCheckbox = document.getElementById("allEventCheck");
        allCheckbox.addEventListener("change", function() {
            const checked = this.checked;
            const checkboxes = listEl.querySelectorAll("input[type='checkbox']");
            checkboxes.forEach(checkbox => {
                if (checkbox.id !== "allEventCheck") {
                    checkbox.checked = checked;
                }
            });
            listEl.dispatchEvent(new Event("filterchange"));
        });

        alarmTypes.forEach((alarm, index) => {
            const checkId = "check" + (index + 1).toString().padStart(2, "0");
            const li = document.createElement("li");
            li.innerHTML = `
              <span class="checkbox-wrap">
                <input type="checkbox" id="${checkId}" checked data-type="${alarm.label.toLowerCase()}">
                <label for="${checkId}">${alarm.label}</label>
              </span>
            `;
            listEl.appendChild(li);
        });

        const individualCheckboxes = listEl.querySelectorAll("input[type='checkbox']:not(#allEventCheck)");
        individualCheckboxes.forEach(checkbox => {
            checkbox.addEventListener("change", function() {
                if (!this.checked) {
                    allCheckbox.checked = false;
                } else {
                    const allChecked = Array.from(individualCheckboxes).every(cb => cb.checked);
                    allCheckbox.checked = allChecked;
                }
                listEl.dispatchEvent(new Event("filterchange"));
            });
        });
        listEl.dispatchEvent(new Event("filterchange"));
    }

    document.getElementById("eventOpenBtn").addEventListener("click", function() {
        const container = this.closest(".search-result__checkbox");
        if (container) {
            container.classList.toggle("search-result__checkbox--active");
        }
    });

    let globalAlarmList = [];
    let poiList = [];
    let matchedAlarms = [];
    const taggedPoiMap = new Map();
    const createEventPopup = async (reinitializeSelectBoxes = false) => {
        if (reinitializeSelectBoxes) {
            document.querySelectorAll('.select-box__btn').forEach(btn => {
                if (btn.classList.contains('select-box__btn--selected')) {
                    btn.classList.remove('select-box__btn--selected');
                }
            })
            const buildingList = await BuildingManager.getBuildingList();
            updateBuildingSelectBox(buildingList);
            const poiListData = PoiManager.findAll();
            updatePoiSelectBox(poiListData);
            setDatePicker();
            const alarmTypes = [
                { value: 0,  label: "경보" },
                { value: 1,  label: "Alarm" },
                { value: 2,  label: "강제문열림" },
                { value: 3,  label: "장시간 문열림" },
                { value: 4,  label: "1차폐쇄" },
                { value: 5,  label: "2차폐쇄" },
                { value: 6,  label: "고장" },
                { value: 7,  label: "점검중" },
                { value: 8,  label: "파킹" },
                { value: 9,  label: "독립운전" },
                { value: 10,  label: "중량초과" },
                { value: 11,  label: "화재관제운전" },
                { value: 12,  label: "화재관제운전 귀착" },
                { value: 13,  label: "1차소방운전" },
                { value: 14,  label: "2차소방운전" },
                { value: 15,  label: "전용운전" },
                { value: 16,  label: "보수운전" },
                { value: 17,  label: "정전운전" },
                { value: 18,  label: "화재운전" },
                { value: 19,  label: "지진운전" },
                { value: 20,  label: "배회이벤트" }
            ];
            createEventCheck(alarmTypes, "eventCheckBoxList");
        }

        const buildingBtn = document.querySelector('#eventBuildingSelect .select-box__btn');
        const floorBtn = document.querySelector('#eventFloorSelect .select-box__btn');
        const poiBtn = document.querySelector('#eventPoiSelect .select-box__btn');

        const selectedBuilding = buildingBtn.textContent.trim();
        const selectedFloor = floorBtn.textContent.trim();
        const selectedDeviceType = poiBtn.textContent.trim();
        const alarmTypeInput = document.getElementById('eventSearchInput').value.trim();
        // poiList = await PoiManager.getFilteredPoiList();
        poiList = PoiManager.findAll();
        const eventLayerPopup = document.getElementById('eventLayerPopup');
        const tableBody  = eventLayerPopup.querySelector('.event-info table tbody');
        const alarmCountEl = document.getElementById('alarmCount');
        tableBody.innerHTML = "";

        const startDateString = document.getElementById("start-date").value;
        const endDateString = document.getElementById("end-date").value;

        const params = new URLSearchParams();
        params.append('startDateString', startDateString);
        params.append('endDateString', endDateString);

        if (selectedDeviceType && selectedDeviceType !== '전체') {
            params.append('deviceType', selectedDeviceType);
        }
        if (alarmTypeInput) {
            params.append('searchValue', alarmTypeInput);
        }

        api.get(`/events/alarms?${params.toString()}`).then((res) => {
            const { result: data } = res.data;
            globalAlarmList = data;

            console.log("globalAlarmList : ", globalAlarmList.length);
            const filteredAlarms = data.filter(alarm =>
                poiList.some(poi =>
                    poi.tagNames.some(tag => tag?.toLowerCase() === alarm.tagName.toLowerCase())
                )
            );

            console.log('EHP/PARK in data:', data.filter(a =>
                /^(EHP|PARK)$/i.test(String(a?.equipment ?? a?.process ?? ''))
            ).length);

            const isEHP = a => String(a?.equipment ?? '').trim().toUpperCase() === 'EHP';

            // let searchedAlarms = filteredAlarms.slice();
            let searchedAlarms = data.slice();

            if (selectedBuilding !== '건물 전체' && selectedBuilding !== '') {
                searchedAlarms = searchedAlarms.filter((alarm) => {
                    if (isEHP(alarm)) return true;
                    const taggedPoi = poiList.find(poi =>
                        poi.tagNames.some(tag => tag.toLowerCase() === alarm.tagName.toLowerCase())
                    );

                    return taggedPoi && taggedPoi.property.buildingName === selectedBuilding;
                });
            }

            if (selectedFloor !== '층 전체' && selectedFloor !== '') {
                searchedAlarms = searchedAlarms.filter((alarm) => {
                    const taggedPoi = poiList.find(poi =>
                        poi.tagNames.some(tag => tag.toLowerCase() === alarm.tagName.toLowerCase())
                    );
                    return taggedPoi && String(taggedPoi.property.floorNo) === selectedFloor;
                });
            }

            if (selectedDeviceType !== '장비 전체' && selectedDeviceType !== '') {
                searchedAlarms = searchedAlarms.filter((alarm) => {
                    if (isEHP(alarm)) return true;
                    const taggedPoi = poiList.find(poi =>
                        poi.tagNames.some(tag => tag.toLowerCase() === alarm.tagName.toLowerCase())
                    );
                    return taggedPoi && taggedPoi.property.poiMiddleCategoryName === selectedDeviceType;
                });
            }

            const deviceNmInput = document.getElementById('eventSearchInput').value.trim();
            if (deviceNmInput !== '') {
                const searchTerm = deviceNmInput.toLowerCase();
                searchedAlarms = searchedAlarms.filter((alarm) => {
                    if (isEHP(alarm)) return true;
                    const taggedPoi = poiList.find(poi =>
                        poi.tagNames.some(tag => tag.toLowerCase() === alarm.tagName.toLowerCase())
                    );
                    return taggedPoi && taggedPoi.name && taggedPoi.name.toLowerCase().includes(searchTerm);
                });
            }

            const checkedBoxes = document.querySelectorAll("#eventCheckBoxList input[type='checkbox']:not(#allEventCheck):checked");
            if (checkedBoxes.length > 0) {
                const norm = s => String(s || "").trim().toLowerCase();
                const checkedEvents = Array.from(checkedBoxes).map(box =>
                    box.dataset.type ? norm(box.dataset.type) : norm(box.nextElementSibling?.textContent)
                );
                searchedAlarms = searchedAlarms.filter((alarm) => {
                    if (isEHP(alarm)) return true;
                    const ev = norm(alarm.event);
                    return ev && checkedEvents.includes(ev);
                });
            }

            eventLayerPopup.style.position = 'absolute';
            eventLayerPopup.style.top = '50%';
            eventLayerPopup.style.left = '50%';
            eventLayerPopup.style.transform = 'translate(-50%, -50%)';
            eventLayerPopup.style.display = 'inline-block';

            console.log("searchedAlarms : ", searchedAlarms);
            matchedAlarms = searchedAlarms.filter(data =>
                isEHP(data) ||
                poiList.some(poi =>
                    poi.tagNames.some(tag =>
                        tag?.toLowerCase() === data.tagName.toLowerCase()
                    )
                )
            );

            const baseAlarms = matchedAlarms.slice();

            window._eventExport = { list: matchedAlarms, poiList: Array.isArray(poiList) ? poiList.slice() : [] };

            alarmCountEl.textContent = matchedAlarms.length.toLocaleString();
            // 페이지당 10개씩
            const itemsPerPage = 10;
            let currentPage = 1;
            let totalPages = Math.ceil(matchedAlarms.length / itemsPerPage);
            const paginationContainer = eventLayerPopup.querySelector(".search-result__paging .number");

            const renderTable = (page) => {
                // tableBody.innerHTML = "";
                const startIndex = (page - 1) * itemsPerPage;
                const pageAlarms = matchedAlarms.slice(startIndex, startIndex + itemsPerPage);

                const frag = document.createDocumentFragment();
                taggedPoiMap.clear();

                pageAlarms.forEach((data) => {

                    const eventRow = document.createElement('tr');
                    const [formattedOccurrenceDate, formattedConfirmTime] =
                        [data.occurrenceDate, data.confirmTime].map(formatDateTime);

                    const taggedPoi = poiList.find(poi =>
                        poi.tagNames?.some(tag => tag && data.tagName && tag.toLowerCase() === data.tagName.toLowerCase())
                    );

                    let buildingName = taggedPoi?.property?.buildingName ?? '-';
                    let floorName = taggedPoi?.property?.floorName ?? '-';
                    let middleCat = taggedPoi?.property?.poiMiddleCategoryName ?? '-';
                    let poiName = taggedPoi?.name ?? '-';
                    let moveCls = taggedPoi ? '' : 'disabled';
                    let poiId = taggedPoi?.id ?? '';
                    const isEhpRow = String(data?.equipment ?? '').trim().toUpperCase() === 'EHP';
                    if (isEhpRow && !taggedPoi) {
                        const tag = String(data.tagName || '');
                        const parts = tag.split('-');
                        if (parts.length >= 2) {
                            buildingName = parts[0] || '-';
                            floorName = parts[1] || '-';
                        }
                        middleCat = '에어컨';
                        const m = tag.match(/EHP-(\d+)/i);
                        poiName = m ? `EHP-${m[1]}` : 'EHP';
                        moveCls = 'disabled';
                        poiId = '';
                    }
                    eventRow.innerHTML = `
                            <td>${buildingName}</td>
                            <td>${floorName}</td>
                            <td>${data.event ?? '-'}</td>
                            <td>${middleCat}</td>
                            <td>${poiName}</td>
                            <td>${formatDateTime(data.occurrenceDate) || '-'}</td>
                            <td>${formatDateTime(data.confirmDate) || '-'}</td>
                            <td>
                              <a href="javascript:void(0);" class="icon-move moveToMap ${moveCls}" data-poi-id="${poiId}">
                                <span class="hide">도면 이동</span>
                              </a>
                            </td>
                        `;
                    // tableBody.appendChild(eventRow);
                    frag.appendChild(eventRow);

                    if (taggedPoi) taggedPoiMap.set(taggedPoi.id, taggedPoi);
                });
                tableBody.textContent = '';
                tableBody.appendChild(frag);
            };

            const renderPagination = () => {
                paginationContainer.innerHTML = "";
                if (totalPages <= 1) return;

                const maxWindow = 5;
                let start = Math.max(1, currentPage - Math.floor(maxWindow / 2));
                let end = Math.min(totalPages, start + maxWindow - 1);
                if (end - start + 1 < maxWindow) {
                    start = Math.max(1, end - (maxWindow - 1));
                }

                const createPage = (page, text = page) => {
                    const span = document.createElement('span');
                    span.textContent = text;
                    if (page === currentPage) {
                        span.classList.add("active");
                    }
                    span.addEventListener('click', () => {
                        if (page === currentPage) return;
                        currentPage = page;
                        renderTable(currentPage);
                        renderPagination();
                    });
                    paginationContainer.appendChild(span);
                };

                if (start > 1) {
                    createPage(1);
                    if (start > 2) {
                        const dots = document.createElement('span');
                        dots.textContent = "...";
                        dots.classList.add("dots");
                        paginationContainer.appendChild(dots);
                    }
                }

                for (let i = start; i <= end; i++) {
                    createPage(i);
                }

                if (end < totalPages) {
                    if (end < totalPages - 1) {
                        const dots = document.createElement('span');
                        dots.textContent = "...";
                        dots.classList.add("dots");
                        paginationContainer.appendChild(dots);
                    }
                    createPage(totalPages);
                }
            };

            eventLayerPopup.querySelector(".search-result__paging .left").onclick = () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderTable(currentPage);
                    renderPagination();
                }
            };
            eventLayerPopup.querySelector(".search-result__paging .right").onclick = () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTable(currentPage);
                    renderPagination();
                }
            };

            // 필터 테스트
            function onEventFilterChange() {
                const toKey = v => String(v ?? "").trim().toLowerCase();
                const eventCheckboxListEl = document.getElementById("eventCheckBoxList");

                const selectedEventKeys = Array.from(
                    eventCheckboxListEl.querySelectorAll("input[type='checkbox']:not(#allEventCheck):checked")
                ).map(cb => cb.dataset.type ? toKey(cb.dataset.type) : toKey(cb.nextElementSibling?.textContent));

                const keySet = new Set(selectedEventKeys);

                const filteredAlarmList = selectedEventKeys.length === 0
                    ? baseAlarms.slice()
                    : baseAlarms.filter(a => {
                        if (isEHP(a)) return true;
                        const evKey = toKey(a.event);
                        return evKey && keySet.has(evKey);
                    });

                matchedAlarms = filteredAlarmList;

                window._eventExport = {
                    list: matchedAlarms.slice(),
                    poiList: Array.isArray(poiList) ? poiList : []
                };

                alarmCountEl.textContent = matchedAlarms.length.toLocaleString();
                totalPages = Math.max(1, Math.ceil(matchedAlarms.length / itemsPerPage));
                currentPage = 1;
                renderTable(currentPage);
                renderPagination();
            }

            const eventCheckboxListEl = document.getElementById("eventCheckBoxList");
            if (eventCheckboxListEl) {
                if (eventCheckboxListEl._onEventFilterChange) {
                    eventCheckboxListEl.removeEventListener("filterchange", eventCheckboxListEl._onEventFilterChange);
                }
                eventCheckboxListEl._onEventFilterChange = onEventFilterChange;
                eventCheckboxListEl.addEventListener("filterchange", onEventFilterChange);
                eventCheckboxListEl.dispatchEvent(new Event("filterchange"));
            } else {
                renderTable(currentPage);
                renderPagination();
            }
        });
    }
    // event excel download
    function downloadEventExcel() {
        const safe = (v) => (v == null ? '' : v);
        const fmt = (d) => (typeof formatDateTime === 'function' ? safe(formatDateTime(d)) : safe(d));

        const listCandidate =
            (window._eventExport && Array.isArray(window._eventExport.list) && window._eventExport.list) ||
            (typeof matchedAlarms !== 'undefined' && Array.isArray(matchedAlarms) && matchedAlarms) ||
            (Array.isArray(globalAlarmList) && globalAlarmList) || [];

        const poisSource =
            (window._eventExport && Array.isArray(window._eventExport.poiList) && window._eventExport.poiList) ||
            (Array.isArray(poiList) && poiList) || [];

        if (listCandidate.length === 0) return;

        const header = [
            'No','건물','층','이벤트명','장비분류','장비명','발생일시','해제일시'
        ];

        const rows = listCandidate.map((item, idx) => {
            const taggedPoi = poisSource.find(p =>
                Array.isArray(p.tagNames) &&
                p.tagNames.some(t => String(t).toLowerCase() === String(item.tagName || '').toLowerCase())
            );

            const building = taggedPoi?.property?.buildingName || '-';
            const floor = taggedPoi?.property?.floorName || '-';
            const category = taggedPoi?.property?.poiMiddleCategoryName || '-';
            const deviceNm = taggedPoi?.name || '-';

            return [
                idx + 1,
                building,
                floor,
                safe(item.event),
                category,
                deviceNm,
                fmt(item.occurrenceDate),
                fmt(item.confirmDate),
            ];
        });

        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'events');

        const startVal = document.getElementById('start-date')?.value || 'all';
        const endVal   = document.getElementById('end-date')?.value || 'all';
        const rangeStr = (startVal === 'all' && endVal === 'all') ? 'all' : `${startVal}_${endVal}`;

        XLSX.writeFile(wb, `events_${rangeStr}.xlsx`);
    }

    document.getElementById('eventSearchBtn').addEventListener('click', async () => {
        await createEventPopup(false);
    });

    const eventLayerPopup = document.getElementById('eventLayerPopup');
    const refreshBtn = eventLayerPopup.querySelector('.reflesh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            await createEventPopup(false);
        });
    }
    eventLayerPopup.querySelector('.event-info').addEventListener('click', event => {
        const moveLink = event.target.closest('.moveToMap');
        if (moveLink) {
            event.preventDefault();
            const poiId = moveLink.getAttribute('data-poi-id');
            const poi = taggedPoiMap.get(Number(poiId));
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

    function closePopup(target) {
        if (!target) return;
        target.style.display = 'none';
        Px.VirtualPatrol.Clear();
        // Px.Model.Visible.ShowAll();

        const cctvContainer = document.querySelector('.cctv-container');
        if(cctvContainer){
            cctvContainer.remove();
            layerPopup.closePlayers();
        }


        if (target.id === 'mapLayerPopup') {
            document.querySelectorAll('#poiMenuListMap ul li').forEach(li => li.classList.remove('active'));
            const sopMiddlePopup = document.querySelector('#sopLayerPopup');
            if(sopMiddlePopup.style.display === 'inline-block'){
                sopMiddlePopup.style.display = 'none';
            }
        } else if (target.id === 'layerPopup') {
            document.querySelectorAll('#poiMenuList ul li').forEach(li => li.classList.remove('active'));
            document.body.style.overflow = '';
        } else if (target.closest('#systemPopup')) {
            document.querySelectorAll('#poiMenuList ul li').forEach(li => li.classList.remove('active'));
            document.body.style.overflow = '';
            closeAllPopups();

            if (target.id === 'airPop') {
                // 에어컨 팝업 닫을 때 모든 select 박스 초기화
                const buildingBtn = document.querySelector('#airBuildingSelector .select-box__btn');
                const onoffBtn = document.querySelector('#airOnOffSelector .select-box__btn');
                const modeBtn = document.querySelector('#airModeSelector .select-box__btn');
                const volumeBtn = document.querySelector('#airVolumeSelector .select-box__btn');

                if (buildingBtn) buildingBtn.textContent = '건물 전체';
                if (onoffBtn) onoffBtn.textContent = 'ON/OFF 전체';
                if (modeBtn) modeBtn.textContent = '모드 전체';
                if (volumeBtn) volumeBtn.textContent = '풍량 전체';
            }
        }
    }


    function addClosePopup() {
        document.querySelectorAll('.popup-basic .close, .popup-basic .arrow').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const target = event.target.closest('.popup-basic');
                closePopup(target);
                // clearAllIntervals();
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
        closeBtn.removeEventListener('click', handleNoticeClosePopup);
        closeBtn.addEventListener('click', handleNoticeClosePopup);
    }

    function handleNoticeClosePopup() {
        saveReadNoticesBatch();
        const popup = document.getElementById('noticePopup');
        popup.style.display = 'none';
    }

    function saveReadNoticesBatch() {
        const readIds = JSON.parse(localStorage.getItem('readNotices')) || [];

        if(readIds.length > 0){
            api.put(`/notices/id-list/${readIds}`, {
                headers: {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                },
            }).then(res => {
                localStorage.removeItem("readNotices");
                const profileBadge = document.querySelector(".profile__btn .badge")
                const badge = document.querySelector('#notice .badge');
                profileBadge.style.display = 'none';
                badge.style.display = 'none';
            })
        }
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
        closePlayer,
        setElevator,
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
        addClosePopup,
        setTab,
        setLight,
        setAirTab,
        setEscalator,
        clearAllIntervals,
        setParking,
        resetParkingFilterUI,
        loadAircons
    }
})();

