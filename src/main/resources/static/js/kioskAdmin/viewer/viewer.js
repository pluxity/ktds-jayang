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
            let buildingId = storeBuilding ? storeBuilding.id : null;
            // initFloors(buildingId);
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
            // handleZoomIn();
            // handleZoomOut();
            // handleExtendView();
            // handleFirstView(buildingId);
            // handle2D(buildingId);
        } catch (error) {
            console.error('PX Engine Initial', error);
        }
    };

    await initializeStoreBuilding();
})();


