const ParkPoiManager = (() => {
    let parkPoiList = [];

    const dtoToModel = (parkPoiDto) => {
        const { id, name, buildingId, floorNo, floorNm, type, position, rotation, scale, latitude, longitude } = parkPoiDto;
        return new ParkPoi(
            id,
            name,
            buildingId,
            floorNo,
            floorNm,
            type,
            parkPoiDto,
            position,
            rotation,
            scale,
            latitude,
            longitude
        );
    }

    const getParkPoiList = () => {
        return new Promise((resolve) => {
            api.get('/park').then((result) => {
                const { result : data } = result.data;
                parkPoiList = data.map(dtoToModel);
                resolve(parkPoiList);
            });
        });
    };

    const findAll = () => {
        return parkPoiList;
    }

    const renderAllPoiToEngine = () => {
        const poiData = [];
        parkPoiList.forEach((parkPoi) => {
            if (parkPoi.position === null) {
                return;
            }
            poiData.push(parkPoi.poiOptions);
        });

        Px.Poi.AddFromDataArraySync(poiData);
    };

    return {
        getParkPoiList,
        findAll,
        renderAllPoiToEngine
    }

})();