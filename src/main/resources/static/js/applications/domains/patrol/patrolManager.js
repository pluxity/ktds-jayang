const PatrolManager = (function () {

    let patrolList = [];

    const getPatrolList = () => {

        const uri = `/patrols`;

        return new Promise((resolve) => {
            api.get(uri).then((result) => {
                const { result: data } = result.data;

                patrolList = data.map((patrols) => {
                    let order = 0;
                    patrols.patrolPoints.sort(function (prev, next) {
                        if(prev.sortOrder < next.sortOrder) return -1;
                        if(prev.sortOrder > next.sortOrder) return 1;
                        if(prev.sortOrder === next.sortOrder) return 0;
                    });
                    const patrolPoints = patrols.patrolPoints.map((patrolPointData) => new PatrolPoint(patrolPointData.id, patrolPointData.name, patrolPointData.floorNo, order++, patrolPointData.pointLocation, patrolPointData.pois));
                    return new Patrol(patrols.id, patrols.name, patrols.buildingId, patrolPoints, patrols.createdAt);
                });
                resolve(patrolList);
            });
        });
    };

    const findAll = () => {
        return patrolList;
    };

    const findById = (id) => {
        return patrolList.find((patrol) => patrol.id === Number(id));
    };

    const findByBuildingId = (buildingId) => {
        return patrolList.filter((patrol) => patrol.buildingId === Number(buildingId));
    }

    const findByPointId = (pointId) => {
        let foundItem = null;
        patrolList.some(patrol => {
            const patrolPoint = patrol.patrolPoints.find(patrol => patrol.id === Number(pointId));
            if(patrolPoint) {
                foundItem = patrolPoint;
                return false;
            }
        });
        return foundItem;
    }

    const findByIdByImport = (id, floorNo) => {
        const find = patrolList.find((patrol) => patrol.id === Number(id));
        const filter = find.patrolPoints.filter(patrolPoint => floorNo ? patrolPoint.floorNo === Number(floorNo) : true);
        let points = [];
        if(filter.length !== 0) {
            points = filter.map((patrolPoint) =>  JSON.parse(patrolPoint.pointLocation))
        }

        return JSON.stringify([{
            "id" : 0,
            "points" : points
        }]);
    }

    const getCurrentPatrolNumber = () => {
        return currentPatrolNumber;
    }

    return {
        getPatrolList,
        findAll,
        findById,
        findByPointId,
        findByIdByImport,
        findByBuildingId,
        getCurrentPatrolNumber
    };
})();
