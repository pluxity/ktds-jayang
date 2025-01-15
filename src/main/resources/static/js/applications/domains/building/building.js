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

    constructor(buildingListDto) {
        const { id, code, name, description, floors, buildingFile, buildingType, camera2d, camera3d, topology } =
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
            const { id, name, sbmFloor } = floor;

            floorInfo.id = id;
            floorInfo.name = name;
            floorInfo.sbmFloor = sbmFloor;

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

    getDetail() {
        return new Promise((resolve) => {
            api.get(`/buildings/${this.id}`).then((result) => {
                const { result: data } = result.data;

                const { floors, evacuationRoute, lod, buildingFile } = data;
                this.#floors = floors;
                this.#evacuationRoute = evacuationRoute ?? '';
                this.#lod = JSON.stringify(lod) ?? '';
                this.#buildingFile = buildingFile;
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
}
