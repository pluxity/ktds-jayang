const KioskPoiManager = (() => {

    let kioskPoiList = [];
    let kioskPoiDetailList = [];

    const dtoToModel = (kioskPoiDto) => {
        const { id, name, buildingId, floorId, isKiosk, property, position, rotation, scale } = kioskPoiDto;
        return new KioskPoi(
            id,
            name,
            buildingId,
            floorId,
            isKiosk,
            property,
            position,
            rotation,
            scale
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
                const { data } = result;
                const kioskPoi = dtoToModel(data);
                resolve(kioskPoi);
            });
        });
    };

    const findAll = () => {
        return kioskPoiList;
    }

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
        getKioskPoiDetailList,
        findDetailAll,
        getKioskPoi,
        findPoiDetailById
    }

})();