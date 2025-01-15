const EvacRouteHandler = (() => {

    const save = (param) => {
        const uri = `/buildings/${BUILDING_ID}/evacuationRoute`

        return new Promise((resolve) => {
            api.patch(uri, param).then((result) => {
                BuildingManager.getBuildingList().then(() => {
                    BuildingManager.findById(BUILDING_ID).getDetail().then((res) => {
                        Px.Model.Expand({
                            name: res.floors[0].id,
                            interval: 200,
                            duration: 1000,
                            onComplete: () => {
                                Px.Camera.ExtendView();
                            }
                        });
                    });
                });

                alertSwal('저장되었습니다.');
            })
        })
    }

    const load = (onComplete) => {
        Px.Evac.LoadArrowTexture('/static/images/evacRoute/arrow.png', () => {
            BuildingManager.findById(BUILDING_ID).getDetail().then((data) => {
                const {evacuationRoute, floors} = data;
                if (evacuationRoute) {
                    Px.Model.Visible.ShowAll();
                    Px.Model.Collapse({
                        duration: 0,
                        onComplete: () => {
                            Px.Evac.Import(evacuationRoute);
                            if(onComplete) onComplete(true);
                        }
                    });

                } else {
                    if(onComplete) onComplete(false);
                }
            })
        })
    }

    const editAllOff = () => {
        Px.Evac.DrawEditorOff();
        Px.Evac.LinkDeleterOff();
        Px.Evac.PointDeleterOff();
    }

    const edit = (btnType) => {
        switch(btnType) {
            case 'drawLine': {
                Px.Evac.DrawEditorOn();
                break;
            }
            case 'removePoint': {
                Px.Evac.PointDeleterOn();
                break;
            }
            case 'removeLine': {
                Px.Evac.LinkDeleterOn();
                break;
            }
            case 'removeAll': {
                Px.Evac.Clear();
                break;
            }
            case 'save': {
                const floorId = document.getElementById('floorNo').value;
                Px.Model.Visible.ShowAll();
                Px.Model.Collapse({
                    duration: 0, onComplete: async () => {
                        EvacRouteHandler.editAllOff();
                        const evacData = Px.Evac.Export();

                        if(evacData.points.length === 0 && evacData.links.length === 0) {
                            await EvacRouteHandler.save({ evacuationRoute: null });
                        } else {
                            await EvacRouteHandler.save({ evacuationRoute: JSON.stringify(evacData) });
                        }

                        const {floors} = BuildingManager.findById(BUILDING_ID);

                        if(floorId === '') {
                            Px.Model.Expand({
                                duration: 200,
                                interval: 100,
                                name: floors[0].id,
                                onComplete: () => {
                                    Px.Camera.ExtendView();
                                }
                            });
                        } else {
                            Px.Model.Visible.HideAll();
                            const {floorName} = floors.find((floor) => floor.floorId === Number(floorId));
                            Px.Model.Visible.Show(floorName);
                        }
                        Px.Camera.ExtendView();
                    }
                });
                break;
            }
        }
    }

    return {
        save,
        load,
        edit,
        editAllOff,
    };
})();
