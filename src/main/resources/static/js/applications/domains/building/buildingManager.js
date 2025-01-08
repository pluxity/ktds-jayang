const BuildingManager = (() => {
    let buildingList = [];

    const getBuildingList = () => {
        const uri = `/buildings`;

        return new Promise((resolve) => {
            api.get(uri).then((result) => {
                const { result: data } = result.data;
                buildingList = data.map((building) => new Building(building));

                resolve(buildingList);
            });
        });
    };

    const getBuildingById = (id) => {
        const uri = `/buildings/${id}`;

        return new Promise((resolve) => {
            api.get(uri).then((result) => {
                const { result: data } = result.data;
                const building = new Building(data);
                building.setDetails(data);
                resolve(building);
            });
        });
    };

    const postBuilding = (buildingInfo) => {
        return new Promise((resolve) => {
            api.post('/buildings', buildingInfo).then((result) => {
                const { data } = result;
                const building = new Building(data);
                buildingList.add(building);
                resolve(data);
            });
        });
    };

    const patchBuilding = (id, params) => {
        return new Promise((resolve, reject) => {
            api.patch(`/buildings/${id}`, params).then((result) => {
                const { data } = result;
                const building = new Building(data);

                const index = buildingList.findIndex(
                    (building) => building.id === id,
                );
                if (index === -1) {
                    console.error('ID 가 없습니다');
                    reject(id);
                }

                buildingList.splice(index, 1, building);

                resolve(building);
            });
        });
    };

    const deleteBuilding = (id) => {
        return new Promise((resolve, reject) => {
            api.delete(`/buildings/${id}`)
                .then(() => {
                    buildingList = buildingList.filter(
                        (building) => building.id !== id,
                    );
                    resolve(id);
                })
                .catch((error) => {
                    console.error(error);
                    reject(id);
                });
        });
    };

    const findAll = () => {
        return buildingList;
    };

    const findById = (id) => {
        return buildingList.find((building) => building.id === Number(id));
    };

    const findByCode = (code) => {
        return buildingList.find((building) => building.code === code);
    };

    return {
        getBuildingList,
        getBuildingById,
        postBuilding,
        patchBuilding,
        deleteBuilding,
        findAll,
        findById,
        findByCode,
    };
})();
