class Building {
    #id;

    #code;

    #name;

    #floors;

    #description;

    #evacuationRoute;

    #lod;

    #buildingFile;

    #buildingType;

    #camera2d;

    #camera3d;

    #topology;

    #isIndoor;

    #version;

    constructor(buildingListDto) {
        const { id, code, name, description, floors, buildingFile, buildingType, camera2d, camera3d, topology, isIndoor ,version, lodSettings} =
            buildingListDto;

        this.#id = id;
        this.#code = code;
        this.#name = name;
        this.#floors = floors;
        this.#description = description;
        this.#buildingFile = buildingFile;
        this.#buildingType = buildingType;
        this.#camera2d = camera2d;
        this.#camera3d = camera3d;
        this.#topology = topology;
        this.#isIndoor = isIndoor;
        this.#version = version;
        this.#lod = lodSettings;

    }

    get id() {
        return this.#id;
    }

    get code() {
        return this.#code;
    }

    get name() {
        return this.#name;
    }

    get description() {
        return this.#description;
    }

    get floors() {
        if(!this.#floors) return [];
        return this.#floors?.map((floor) => {
            const floorInfo = {};
            const { id, name, sbmFloor, no } = floor;

            floorInfo.id = id;
            floorInfo.name = name;
            floorInfo.sbmFloor = sbmFloor;
            floorInfo.no = no;

            return floorInfo;
        });
    }

    get lod() {
        if(this.#lod !== undefined && this.#lod !== null && this.#lod !== '') {
            const { lodMaxDistance, lodCount, lodData }  = this.#lod;
            return {
                maxDistance: lodMaxDistance,
                usedLodCount: lodCount,
                data : JSON.parse(lodData)
            };
        } else {
            return null;
        }
    }

    set lod(lod) {
        this.#lod = lod;
    }

    get evacuationRoute() {
        return this.#evacuationRoute;
    }

    set evacuationRoute(evacuationRoute) {
        this.#evacuationRoute = evacuationRoute;
    }

    get buildingFile() {
        return this.#buildingFile;
    }

    get buildingType() {
        return this.#buildingType;
    }

    get camera2d() {
        return this.#camera2d;
    }

    set camera2d(camera2d) {
        this.#camera2d = camera2d;
    }

    get camera3d() {
        return this.#camera3d;
    }

    set camera3d(camera3d) {
        this.#camera3d = camera3d;
    }

    get topology() {
        return this.#topology;
    }

    set topology(topology) {
        this.#topology = topology;
    }
    get isIndoor() {
        return this.#isIndoor;
    }

    set isIndoor(isIndoor) {
        this.#isIndoor = isIndoor;
    }
    getDetail() {
        return new Promise((resolve) => {
            api.get(`/buildings/${this.id}`).then((result) => {
                const { result: data } = result.data;

                const { floors, evacuationRoute, lod, buildingFile, isIndoor } = data;
                this.#floors = floors;
                this.#evacuationRoute = evacuationRoute ?? '';
                this.#lod = JSON.stringify(lod) ?? '';
                this.#buildingFile = buildingFile;
                this.#isIndoor = isIndoor;
                resolve(data);
            });
        });
    }

    setDetails(building) {
        const { floors, evacuationRoute, lodSettings } = building;

        if(floors) {
            this.#floors = floors.sort((a, b) => {
                        if (a.floorOrder > b.floorOrder) {
                            return 1;
                        }
                        if (a.floorOrder < b.floorOrder) {
                            return -1;
                        }
            });
        }

        if(evacuationRoute) {
            this.#evacuationRoute = evacuationRoute;
        } else {
            this.#evacuationRoute = null;
        }

        if(lodSettings) {
            this.#lod = lodSettings;
        }
    }

    getFloorsDetails(floorId) {
        return this.#floors.reduce((acc, curr) => {
            const { id, floorDetails } = curr;
            if(id === floorId) {
                return [...acc, ...floorDetails];
            } else {
                return acc;
            }
        }, []);
    }

    getVersion() {
        return this.#version;
    }
}
