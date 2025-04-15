const KioskPoiManager = (() => {

    let kioskPoiList = [];

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

    const getList = () => {
        return kioskPoiList;
    }

    return {
        getKioskPoiList,
        getList
    }

})();