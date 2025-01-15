'use strict';

// 20240114 임시 remark 처리
const popup = (function () {
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



    let tabs = document.querySelectorAll('.floor-tab, .equipment-tab, .event-container .event-list');
    tabs.forEach((tab) => {
        let li = tab.querySelectorAll('li');
        li.forEach((lis) => {
            lis.addEventListener('pointerdown', tabsToggle);
        });
    });

    document.querySelectorAll('.category-tab li').forEach((tab) => {
        tab.addEventListener('pointerdown', (event) => {
            tabsToggle(event);

            const missingLevelTab = document.querySelector('.event-container .event-list li[data-event-level=missing]');
            const warningLevelTab = document.querySelector('.event-container .event-list li[data-event-level=warning]');
            const dangerLevelTab = document.querySelector('.event-container .event-list li[data-event-level=danger]');
            const { deviceType } = event.currentTarget.dataset;
            if(deviceType === 'cctv') {
                missingLevelTab.classList.add('hidden');
                warningLevelTab.classList.remove('hidden');

                missingLevelTab.classList.remove('on');
                dangerLevelTab.classList.remove('on');
                document.querySelector('.event-container .event-list li[data-event-level=""]').classList.add('on');

            } else if(deviceType === 'fire_sensor') {
                warningLevelTab.classList.add('hidden');
                missingLevelTab.classList.remove('hidden');

                warningLevelTab.classList.remove('on');
                dangerLevelTab.classList.remove('on');
                document.querySelector('.event-container .event-list li[data-event-level=""]').classList.add('on');

            } else {
                missingLevelTab.classList.remove('hidden');
                warningLevelTab.classList.remove('hidden');

                missingLevelTab.classList.remove('on');
                warningLevelTab.classList.remove('on');
                dangerLevelTab.classList.remove('on');
                document.querySelector('.event-container .event-list li[data-event-level=""]').classList.add('on');

            }
        })
    })


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


    const createEventList = () => {
        const startDate = new Date(document.getElementById('eventStart').value).toLocaleString();
        const endDate = new Date(document.getElementById('eventFinish').value).toLocaleString();

        const { deviceType } = document.querySelector('.event-container .category-container .category-tab li.on').dataset;
        const { eventLevel } = document.querySelector('.event-container .event-box .event-list li.on').dataset;
        const searchValue = document.getElementById('search').value;

        EventDataManager.getEventListByDate('search', startDate, endDate).then((eventList) => {
            const params = {
                deviceType, eventLevel, searchValue
            };
            const filteringEventList = EventDataManager.filteringEventList('search', params);

            const dom = document.querySelector('.event-list-container');

            const columns = [
                {
                    id: 'id',
                    name: 'id',
                    hidden: true,
                },
                {
                    name: '번호',
                    width: '7.5%',
                },
                {
                    name: '구분',
                    width: '7.5%',
                },
                {
                    name: '장비명',
                    width: '15%',
                },
                {
                    name: '이벤트명',
                    width: '15%',
                },
                {
                    name: '이벤트 등급',
                    width: '10%',
                },
                {
                    name: '위치',
                    width: '20%',
                },
                {
                    name: '발생일시',
                    width: '15%',
                },
                {
                    name: '녹화영상',
                    width: '10%',
                },
            ];

            const data = renderEventDatas(filteringEventList) ?? [];
            const option = {
                dom,
                columns,
                data,
                limit: 13,
                buttonsCount: 10,
                isPagination: true,
                previous: '<',
                next: '>',
                noRecordsFound: '검색된 내용이 없습니다.'
            };
            if (dom.innerHTML === '') {
                createGrid(option);
                grid.on('rowClick', (...args) => {
                    if(args[0].target.closest('span.video')) return;

                    const eventId = args[1].cells[0].data;

                    document.querySelector('.sidebar-wrap[data-menu=event]').classList.remove('active');
                    const eventData = EventDataManager.findEventById('search', eventId);
                    EventListHandler.clickEventList(eventData, 'search');
                })
            } else {
                resizeGrid(option);
            }

            document.querySelector('.event-container .total-count span').innerText = filteringEventList.length;
            if(filteringEventList.length === 0) {
                document.querySelector('.event-list-container .gridjs-footer').classList.add('hidden');
            } else {
                document.querySelector('.event-list-container .gridjs-footer').classList.remove('hidden');
            }
        })
    }

    // 검색
    document.querySelector('.search-button').addEventListener('click', createEventList);

    document.querySelector('.event-container .event-list-container').addEventListener('click', (event) => {
        const target = event.target;
        const video = target.closest('span');

        if(!video || !video.classList.contains('video')) return;

        const { deviceId } = video.dataset;
        const eventTime = target.closest('tr').querySelector('td[data-column-id=발생일시]').innerText;
        openPlaybackCctv(deviceId, eventTime);
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
    function showCategoryList() {
        if (isCategoryListVisible) {
            categoryList.style.display = 'none';
            categorySelect.classList.remove('on');
        } else {
            categoryList.style.display = 'block';
            categorySelect.classList.add('on');

            categoryList.querySelectorAll('li').forEach((category) => {
                category.removeEventListener('click', selectCategory);
                category.addEventListener('click', selectCategory);
            });
        }

        isCategoryListVisible = !isCategoryListVisible;
    }

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
        resetFloor();
    }

    function resetFloor() {
        const floorTab = document.querySelectorAll('.equipment-location .floor-tab .floor');

        floorTab.forEach((floor) => {
            floor.classList.remove('on')
        })
        const allFloor = [...floorTab].find((floor) => floor.dataset.floor === '');

        if (allFloor) {
            allFloor.classList.add('on');
        }
    }

    categorySelect.addEventListener('click', showCategoryList);

    const closeAllPopup = (closeRecentEvent = true) => {
        Px.VirtualPatrol.RemoveAll();
        document.querySelectorAll(
            '.layer-popup.open:not([data-deactivate-target=recentWrap]), .user-layer-box.open')?.forEach((popup) => popup.classList.remove('open'));

        document.querySelectorAll(
            '.nav-right button.active, ' +
            '.nav-center div#weatherWrap.active, ' +
            '.sidebar-menu-button.active')?.forEach((button) => button.classList.remove('active'));

        if(closeRecentEvent) {
            document.querySelector('.layer-popup[data-deactivate-target=recentWrap].open')?.classList.remove('open');
            document.querySelector('#recentWrap.active')?.classList.remove('active');
        }

    }

    return {
        createRecentPopup,
        createEarthquakePopup,
        createSensorPopup,
        createTmsPopup,
        createWeatherPopup,
        updateRecentEventList,
        newRecentEvent,
        filterPoi,
        createEventList,
        moveToPoi,
        setPoiEvent,
        closeAllPopup,
        resetFloor
    }
})();

