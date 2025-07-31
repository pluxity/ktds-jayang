const KioskPoiManager = (() => {

    let kioskPoiList = [];
    let kioskPoiDetailList = [];
    let currentKioskPoi = null;

    const dtoToModel = (kioskPoiDto) => {
        const { id, name, buildingId, floorNo, isKiosk, position, rotation, scale, store, kiosk } = kioskPoiDto;
        return new KioskPoi(
            id,
            name,
            buildingId,
            floorNo,
            isKiosk,
            kioskPoiDto,
            position,
            rotation,
            scale,
            isKiosk ? null : store,
            isKiosk ? kiosk : null
        );
    }

    const getKioskPoiList = () => {
        return new Promise((resolve) => {
            api.get('/kiosk').then((result) => {
                const { result : data } = result.data;
                kioskPoiList = data.map(dtoToModel);
                resolve(kioskPoiList);
            });
        });
    };

    const getStoreDetailList = () => {
        return new Promise((resolve) => {
            api.get('/kiosk/storeDetailList').then((result) => {
                const { result : data } = result.data;
                kioskPoiList = data.map(dtoToModel);
                resolve(kioskPoiList);
            });
        });
    };

    const getKioskPoiByCode = (code) => {
        return new Promise((resolve) => {
            api.get(`/kiosk/code/${code}`).then((result) => {
                const { result : data } = result.data;
                currentKioskPoi = data;
                resolve(currentKioskPoi);
            })
        })
    }

    const getKioskPoiDetailList = () => {
        return new Promise((resolve) => {
            api.get('/kiosk/detailList').then((result) => {
                const { result : data } = result.data;
                kioskPoiDetailList = data
                resolve(kioskPoiDetailList);
            });
        });
    };

    const getKioskPoi = (id) => {
        return new Promise((resolve) => {
            api.get(`/kiosk/${id}`).then((result) => {
                const { result : data } = result.data;
                const kioskPoi = dtoToModel(data);
                resolve(kioskPoi);
            });
        });
    };

    const findAll = () => {
        return kioskPoiList;
    }

    const findById = (id) => {
        return kioskPoiList.find((kioskPoi) => Number(kioskPoi.id) === Number(id));
    };

    const patchKioskPoiPosition = (id, params) => {
        return new Promise((resolve, reject) => {
            api.patch(`/kiosk/${id}/position`, params)
                .then(() => {
                    getKioskPoiList().then(() => {
                        getKioskPoiListRendering();
                    });
                })
                .catch((error) => {
                    console.error(error);
                    getKioskPoiList().then(() => {
                        getKioskPoiListRendering();
                    });
                });
        });
    };

    const deleteKioskPoi = (id) => {
        return new Promise((resolve, reject) => {
            api.delete(`/kiosk/${id}`)
                .then(() => {
                    kioskPoiList = kioskPoiList.filter((kioskPoi) => kioskPoi.id !== id);
                    resolve(id);
                })
                .catch((error) => {
                    console.error(error);
                    reject(id);
                });
        });
    };

    const renderAllPoiToEngine = () => {
        const poiData = [];
        kioskPoiList.forEach((kioskPoi) => {
        if (kioskPoi.position === null) {
            return;
        }
        if(currentKioskPoi && kioskPoi.id === currentKioskPoi.id){
            kioskPoi.setName('현위치');
        }
        poiData.push(kioskPoi.poiOptions);
        });

        Px.Poi.AddFromDataArray(poiData);
    };

    const renderKioskPoiByIdAddByMouse = (id) => {
        const kioskPoiDataEngine = KioskPoiManager.findById(id).poiOptions;
        kioskPoiDataEngine.onComplete = (kioskPoiId) => {
            const kioskPoiData = Px.Poi.GetData(kioskPoiId);
            KioskPoiManager.patchKioskPoiPosition(kioskPoiId, kioskPoiData.position);
        };

        Px.Poi.AddByMouse(kioskPoiDataEngine);
    };

    const findDetailAll = () => {
        return kioskPoiDetailList;
    }

    const findPoiDetailById = (id) => {
        return kioskPoiDetailList.find(poi => poi.common?.id === id);
    }

    const findPoiByIsKiosk = (isKiosk) => {
        return kioskPoiList.filter(poi => poi.isKiosk === isKiosk);
    }

    return {
        getKioskPoiList,
        findAll,
        findById,
        patchKioskPoiPosition,
        renderKioskPoiByIdAddByMouse,
        deleteKioskPoi,
        renderAllPoiToEngine,
        getKioskPoiDetailList,
        findDetailAll,
        getKioskPoi,
        findPoiDetailById,
        getStoreDetailList,
        getKioskPoiByCode
    }

})();