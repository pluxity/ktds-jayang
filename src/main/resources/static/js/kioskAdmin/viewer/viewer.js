(async function() {
    await BuildingManager.getBuildingList().then((buildingList) => {
        buildingList.forEach(async (building) => {
            const {id} = building;
            await BuildingManager.getBuildingById(id).then((building) => {
                BuildingManager.findById(id).setDetails(building);
            });
        })
    });

    const initializeStoreBuilding = async (onComplete) => {
        try {
            const container = document.getElementById('webGLContainer');
            container.innerHTML = '';
            // const contents = document.querySelector('.contents');
            const storeBuilding = await BuildingManager.findByCode('store');
            document.getElementById('buildingId').value = storeBuilding.id;
            let buildingId = storeBuilding ? storeBuilding.id : null;
            //initFloors(buildingId);
            // document.getElementById("buildingName").setAttribute("building-id", buildingId);
            // document.getElementById("buildingName").setAttribute("building-name", storeBuilding.name);

            // setActiveEquipment(buildingId);
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
                        getKioskPoiListRendering();
                        Px.Model.Visible.ShowAll();
                        Px.Util.SetBackgroundColor('#333333');
                        Px.Camera.FPS.SetHeightOffset(15);
                        Px.Camera.FPS.SetMoveSpeed(500);
                        Px.Event.On();
                        Px.Event.AddEventListener('dblclick', 'poi', (poiInfo) => {
                            moveToPoi(poiInfo.id)
                        });
                        Px.Effect.Outline.HoverEventOn('area_no');
                        // Px.Effect.Outline.AddHoverEventCallback(
                        //     throttle(async (event) => {
                        //         if (storeBuilding.floors && storeBuilding.floors.length > 0) {
                        //             const firstFloorId = storeBuilding.floors[0].id;
                        //             Px.Effect.Outline.Add(firstFloorId);
                        //         }
                        //     }, 10)
                        // );
                        // contents.style.position = 'static';
                        if (onComplete) onComplete();
                    }
                });
            });
            // 층 콤보 박스 생성
            let floorListOpt = "<option value=''>전체</option>";
            BuildingManager.findById(buildingId).floors.forEach((item) => {
                floorListOpt += `<option value='${item.id}'>${item.name}</option>`;
            });

            const floorNo = document.querySelector('#floorNo');
            floorNo.innerHTML = floorListOpt;

            floorNo.addEventListener('change', function () {
                changeEventFloor(this.value, buildingId);
            });

            document
                .querySelector('#poiSelect')
                .addEventListener('change', (event) => {
                    const poiCategoryIds = event.target.value;
                    const floorId = document.querySelector('#floorNo').value;
                    const poiList = PoiManager.findByBuilding(BUILDING_ID)
                        .filter(selectedPoiCategory(poiCategoryIds))
                        .filter(selectedFloor(floorId));
                    renderingPoiList(poiList);
                });
            initLeftSelect(buildingId);
            initDropUpMenu();

            // handleZoomIn();
            // handleZoomOut();
            // handleExtendView();
            // handleFirstView(buildingId);
            // handle2D(buildingId);
        } catch (error) {
            console.error('PX Engine Initial', error);
        }
    };

    function changeEventFloor(floorId, buildingId) {
        if (floorId === '') {
            Px.Model.Visible.ShowAll();
        } else {

            Px.Model.Visible.HideAll();

            const floor = BuildingManager.findById(buildingId).floors.find(
                (floor) => floor.id === Number(floorId),
            );
            Px.Model.Visible.Show(floor.id);
        }
    }

    const categoryList = [
        { label: "상가", value: "store" },
        { label: "키오스크", value: "kiosk" }
    ];
    const initLeftSelect = (buildingId) => {
        const initLeftFloorSelect = () => {
            let floors = BuildingManager.findById(buildingId).floors;
            floors.forEach(floor => {
                document.getElementById("leftFloorSelect")
                    .appendChild(
                        new Option(floor.name, floor.id),
                    );
            })
        }
        const initLeftPoiCategorySelect = () => {
            categoryList.forEach(category => {
                document.getElementById("leftPoiCategorySelect")
                    .appendChild(
                        new Option(category.label, category.value),
                    );
            })
        }
        initLeftFloorSelect();
        initLeftPoiCategorySelect();
    }

    const initDropUpMenu = () => {

        VirtualSelect.init({
            ele: '#poiSelect',
            options: categoryList,
            selectedValue: categoryList.map((category) => category.value),
            multiple: true,
            silentInitialValueSet: true,
            search: false,
            name: 'poiSelect',
            placeholder: 'POI 카테고리',
            selectAllText: '전체 선택',
            allOptionsSelectedText: '모두 선택됨',
        });

        document
            .querySelector('#poiSelect')
            .addEventListener('change', (event) => {
                const poiCategoryIds = event.target.value;
                const floorId = document.querySelector('#floorNo').value;
                const poiList = PoiManager.findByBuilding(BUILDING_ID)
                    .filter(selectedPoiCategory(poiCategoryIds))
                    .filter(selectedFloor(floorId));
                renderingPoiList(poiList);
            });
    };

    await initializeStoreBuilding();
})();


