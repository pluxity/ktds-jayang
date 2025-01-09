'use strict';
(async function () {
    // const USER_ID = document.cookie.match('(^|;) ?USER_ID=([^;]*)(;|$)')[2];
    // api.get(`/users/userid/${USER_ID}`).then((result) => {
    //     const {result: data} = result.data;
    //     document.querySelector("#userBox > div.user-title-wrap > strong").innerHTML = data.nickname;
    //     document.querySelector("#userBox > div.user-title-wrap > span").innerHTML = data.userGroupName;
    //     if (data.role !== 'ADMIN') {
    //         document.querySelector("#userBox > div.user-content-wrap > button.admin-button").style.display = 'none';
    //     }
    // });


    await SystemSettingManager.getSystemSetting().then((systemSetting) => {
        const {disasterFreeDate} = systemSetting;
    });
    await IconSetManager.getIconSetList();
    await BuildingManager.getBuildingList().then((buildingList) => {
        buildingList.forEach(async (building) => {
            const {id} = building;
            await BuildingManager.getBuildingById(id).then((building) => {
                BuildingManager.findById(id).setDetails(building);
            });
        })
    });

    await PoiCategoryManager.getPoiCategoryList();

    await PoiManager.getPoiList();
    await PatrolManager.getPatrolList();

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

    // await Init.initializeOutdoorBuilding();
    setDateTime();
    // Px.Event.AddEventListener('dblclick', 'poi', Init.poiDblclick);

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
    const initializeOutdoorBuilding = async (onComplete) => {
        try {
            document.getElementById('loadingLayer').classList.add('on');
            const buildingName = document.getElementById('buildingName');
            buildingName.style.display = 'none';
            buildingName.style.zIndex = '0';
            buildingName.style.left = '';
            buildingName.style.top = '';

            const minimap = document.getElementById('minimapBox');
            minimap.className = '';



            const container = document.getElementById('container');
            container.innerHTML = '';
            Px.Core.Initialize(container, async () => {
                const outdoorBuilding = BuildingManager.findAll().find(building => building.buildingType === "outdoor");

                BUILDING_ID = outdoorBuilding.id;

                const { buildingFile, floors, camera3d } = outdoorBuilding;
                const { directory, storedName, extension } = buildingFile;

                Px.Loader.LoadFbx({
                    url: `/Building/${directory}/${storedName}.${extension}`,
                    onLoad: async () => {
                        Px.Util.SetBackgroundColor('#333333');
                        Px.Camera.FPS.SetHeightOffset(15);
                        Px.Camera.FPS.SetMoveSpeed(500);
                        PoiManager.renderAllPoiToEngineByBuildingId(BUILDING_ID);

                        Px.Lod.SetLodData(outdoorBuilding.lod);

                        if (floors.length > 1) {
                            Px.Model.Expand({
                                duration: 200,
                                interval: 200,
                                name: floors[0].floorName,
                                onComplete: () => {
                                    if(camera3d) {
                                        Px.Camera.SetState(JSON.parse(camera3d));
                                    }
                                }
                            });
                        } else {
                            if(camera3d) {
                                Px.Camera.SetState(JSON.parse(camera3d));
                            }
                        }

                        Px.Event.On();
                        Px.Event.AddEventListener('dblclick', 'sbm', buildingDblclick);
                        Px.Effect.Outline.HoverEventOn('area_no');
                        Px.Effect.Outline.AddHoverEventCallback(renderingBuildingNameDom);
                        initializeTexture();

                        document.getElementById('loadingLayer').classList.remove('on');
                        if (onComplete) onComplete();
                        renderingPoiList();
                        Init.setBuildingNameAndFloors();


                    },
                });
            });
        } catch (error) {
            console.error('PX Engine Initial', error);
        }
    }
    const initializeIndoorBuilding = async (onComplete) => {
        try {
            document.getElementById('loadingLayer').classList.add('on');
            const buildingName = document.getElementById('buildingName');
            buildingName.style.display = 'none';
            buildingName.style.zIndex = '0';
            buildingName.style.left = '';
            buildingName.style.top = '';
            const container = document.getElementById('container');
            container.innerHTML = '';
            Px.Core.Initialize(container, async () => {
                const {buildingFile, floors, code, camera3d, lod} = BuildingManager.findById(BUILDING_ID);
                const {directory, storedName, extension} = buildingFile;

                const minimap = document.getElementById('minimapBox');
                minimap.className = "B"+code.split('-')[1];

                Px.Loader.LoadFbx({
                    url: `/Building/${directory}/${storedName}.${extension}`,
                    onLoad: async () => {
                        Px.Util.SetBackgroundColor('#333333');
                        Px.Camera.FPS.SetHeightOffset(15);
                        Px.Camera.FPS.SetMoveSpeed(500);
                        PoiManager.renderAllPoiToEngineByBuildingId(BUILDING_ID);
                        Px.Lod.SetLodData(lod);
                        if (floors.length > 1) {
                            Px.Model.Expand({
                                duration: 200,
                                interval: 200,
                                name: floors[0].floorName,
                                onComplete: () => {
                                    if(camera3d) {
                                        Px.Camera.SetState(JSON.parse(camera3d));
                                    }

                                }
                            });
                        } else {
                            if(camera3d) {
                                Px.Camera.SetState(JSON.parse(camera3d));
                            }
                        }

                        resetFloorName();

                        Px.Event.On();
                        Px.Event.RemoveEventListener('dblclick', 'sbm', buildingDblclick);
                        Px.Effect.Outline.HoverEventOff();
                        Px.Effect.Outline.RemoveHoverEventCallback(renderingBuildingNameDom);
                        initializeTexture();

                        document.getElementById('loadingLayer').classList.remove('on');
                        if (onComplete) onComplete();
                        renderingPoiList();
                        Init.setBuildingNameAndFloors();

                        if(camera3d) Px.Camera.SetState(JSON.parse(camera3d));
                    },
                });
            });
        } catch (error) {
            console.error('PX Engine Initial', error);
        }
    }
    const poiDblclick = (poiInfo) => {
        const {id} = poiInfo.property;

        popup.setPoiEvent(id);
    }

    const buildingDblclick = async (buildingInfo) => {
        const {area_no} = buildingInfo.property;
        const building = BuildingManager.findAll().find(building => building.code != null && building.code.split("-")[1] === area_no);

        if (building == null) {
            return;
        }

        Px.Model.Clear();
        Px.Poi.Clear();
        Px.VirtualPatrol.Clear();
        Px.Evac.Clear();

        popup.closeAllPopup();
        BUILDING_ID = building.id;
        await initializeIndoorBuilding();
        setBuildingNameAndFloors();
    }

    const renderingBuildingNameDom = (data) => {
        const {pointerEventData, property} = data;
        const buildingName = document.getElementById('buildingName');

        if (property === null || !BuildingManager.findAll().some(building => building.code != null && building.code.split("-")[1] === property.area_no)) {
            buildingName.style.display = 'none';
            buildingName.style.zIndex = '0';
            buildingName.style.left = '';
            buildingName.style.top = '';
            return;
        } else {
            const building = BuildingManager.findAll().find(building => building.code != null && building.code.split("-")[1] === property.area_no );
            if (building === undefined) {
                buildingName.style.display = 'none';
                buildingName.style.zIndex = '0';
                buildingName.style.display = 'none';
                buildingName.style.left = '';
                buildingName.style.top = '';
                return;
            }
            buildingName.style.zIndex = 45;
            buildingName.style.display = 'flex';
            buildingName.style.position = 'absolute';
            buildingName.style.left = `${pointerEventData.clientX}px`;
            buildingName.style.top = `${pointerEventData.clientY-50}px`;
            buildingName.innerHTML = building.name;
        }
    }

    const renderingPoiList = () => {
        const poiCategoryList = PoiCategoryManager.findAll();
        const poiCategoryBox = document.querySelector('#poiCategoryBox');
        const categorySelect = document.querySelector('.equipment-category-select');
        const categoryList = document.querySelector('.equipment-category-list');

        categorySelect.innerHTML = '';
        categoryList.innerHTML = '';
        poiCategoryBox.innerHTML = '';

        const isDefault = poiCategoryList[0];

        poiCategoryList?.forEach((poiCategory, index) => {
            const {id, name} = poiCategory;

            poiCategoryBox.innerHTML += `
           <div class='poi-category'>
                <input type='checkbox' id='poiCategory${index}' value='${id}' checked>
                <label for='poiCategory${index}'></label>
                <span class='poi-category-name on'>${name.toUpperCase()}</span>
            </div>
        `

            categorySelect.innerHTML = `
            <span class="selected-category">${isDefault.name} <span class="equipment-quantity"></span></span>
            <img src="/static/images/viewer/icons/arrow/down.png" alt="arrow" />
        `;
            categorySelect.dataset.eventCategory = isDefault.id;

            categoryList.innerHTML += `<li class="event-count" data-event-category=${id}>${name} <span class="equipment-quantity"></span></li>`;
        });

        categoryList.style.display = 'none';

        const floorTabContainer = document.querySelector('.equipment-location .floor-tab');
        const floorTab = floorTabContainer.querySelectorAll('.floor');

        floorTabContainer.addEventListener('click', (event) => {
            const clickedFloor = event.target.closest('.floor');
            if (clickedFloor) {
                floorTab.forEach((floor) => {
                    floor.classList.remove('on');
                });

                const floorId = clickedFloor.dataset.floor;
                const categoryId = categorySelect.getAttribute('data-event-category')

                clickedFloor.classList.add('on');

                popup.filterPoi(floorId, categoryId);
            }
        });

        poiCategoryBox
            .querySelectorAll('INPUT[type=checkbox]')
            .forEach((checkbox) => {
                checkbox.addEventListener('change', (event) => {
                    const poiCategoryId = event.target.value;
                    const isChecked = event.target.checked;
                    const poiCategoryName = event.target.parentNode.querySelector('.poi-category-name');

                    if (!isChecked) {
                        Px.Poi.HideByProperty("poiCategoryId", Number(poiCategoryId));
                        poiCategoryName.classList.remove('on');
                        return;
                    }
                    // Px.Poi.ShowByProperty("poiCategoryId", Number(poiCategoryId));
                    poiCategoryName.classList.add('on')
                    const floorName = document.querySelector("body > main > div.left-information > div.floor").dataset.floorName;
                    if(floorName) {
                        BuildingManager.findById(BUILDING_ID).getDetail().then((data) => {
                            const {id: floorId} = data.floors.find(floor => floor.floorName === floorName);
                            Px.Poi.ShowByPropertyArray({"floorId": floorId, "poiCategoryId": Number(poiCategoryId)});
                        });
                    } else {
                        Px.Poi.ShowByPropertyArray({"poiCategoryId": Number(poiCategoryId)});
                    }



                });
            });
        let defaultCategoryId;

        PoiCategoryManager.findAll().forEach((category, index) => {
            const poiData = PoiManager.findByPoiCategory(BUILDING_ID, '', category.id).filter((poi) => poi.position !== null)
            const defaultCount = document.querySelector(`.selected-category .equipment-quantity`)
            const count = document.querySelector(`.event-count[data-event-category="${category.id}"] .equipment-quantity`);
            count.textContent = `(${poiData.length.toString()})`;

            if (index === 0) {
                defaultCategoryId = category.id;
                const defaultData = PoiManager.findByPoiCategory(BUILDING_ID, '', String(defaultCategoryId)).filter((poi) => poi.position !== null)

                defaultCount.textContent = `(${defaultData.length.toString()})`;
            }
            popup.filterPoi('', defaultCategoryId)
        })
    }

    const setBuildingNameAndFloors = () => {
        const {name, floors} = BuildingManager.findById(BUILDING_ID)
        document.querySelector('.left-information .building .txt').innerHTML = name;
        let html = '<li class="on" data-floor-name="">전체층</li>';
        let equipmentFloorHTML = '<li class="floor on" data-floor="" data-floor-name="">전체층</li>';
        floors.forEach((floor) => {
            const {id, floorName} = floor;
            html += `<li data-floor-name=${floorName}>${floorName}</li>`;
            equipmentFloorHTML += `<li class="floor" data-floor=${id}>${floorName}</li>`;
        })
        document.querySelector('.left-information .floor .floor-list').innerHTML = html;

        const floorTabContainer = document.querySelector('.equipment-location .floor-tab');
        floorTabContainer.innerHTML = '';

        if (floors.length < 2) {
            document.querySelector('.left-information .floor').classList.add('hidden');
            document.querySelector('.equipment-location .location').innerText = name;
        } else {
            document.querySelector('.left-information .floor').classList.remove('hidden');

            // 좌측 위 층변경 버튼
            document.querySelectorAll('.left-information .floor .floor-list li').forEach((floor) => {
                floor.addEventListener('click', (event) => {
                    const {floorName} = event.currentTarget.dataset;
                    if(floorName === '') {
                        resetFloorName();
                        changeFloor(floorName);
                        return;
                    }
                    document.querySelector("body > main > div.left-information > div.floor").dataset.floorName = floorName;
                    document.querySelector("body > main > div.left-information > div.floor > div").classList.remove('on');
                    document.querySelector("body > main > div.left-information > div.floor > ul").classList.remove('on');

                    changeFloor(floorName);
                })
                //장비목록 내부 건물명 & 층변경

                floorTabContainer.innerHTML = equipmentFloorHTML;
                document.querySelector('.equipment-location .location').innerText = name;
                floorTabContainer.querySelectorAll('.floor').forEach((floor) => {
                    floor.addEventListener('click', (event) => {
                        floorTabContainer.querySelector('.floor.on').classList.remove('on');
                        const target = event.currentTarget;
                        const {floor: floorId} = target.dataset;
                        target.classList.add('on');

                        // const {eventCategory: categoryId} = document.querySelector('.event-count.on').dataset;
                        popup.filterPoi(floorId, '');
                    })
                })

            });

        }
    }

    const resetFloorName = () => {
        document.querySelector("body > main > div.left-information > div.floor").dataset.floorName = '';
        document.querySelector("body > main > div.left-information > div.floor > .btn-floor-change > .txt").textContent = '전체층';
        document.querySelector("body > main > div.left-information > div.floor > div").classList.remove('on');
        document.querySelector("body > main > div.left-information > div.floor > ul").classList.remove('on')
    }

    const changeFloor = (floorName, onComplete) => {
        const {floors, camera3d} = BuildingManager.findById(BUILDING_ID);
        if (floorName === '') {
            Px.Poi.ShowAll();
            Px.Model.Visible.ShowAll();
            Px.Model.Expand({
                duration: 200,
                interval: 100,
                name: floors[0].floorName,
                onComplete: () => {
                Px.Camera.ExtendView();
            }
            });


        } else {
            Px.Model.Collapse({
                duration: 0,
                onComplete: () => {
                    Px.Model.Visible.HideAll();
                    Px.Model.Visible.Show(floorName);

                    Px.Poi.HideAll();

                    const {id: floorId} = floors.find(floor => floor.floorName === floorName);
                    Px.Poi.ShowByProperty("floorId", floorId);

                    if (onComplete) onComplete();
                }
            });
        }
        if(camera3d) Px.Camera.SetState(JSON.parse(camera3d));

    }

    return {
        initializeIndoorBuilding,
        initializeOutdoorBuilding,
        poiDblclick,
        setBuildingNameAndFloors,
        changeFloor
    }
})();