class KioskPoi {
    #id;
    #isKiosk;
    #name;
    #buildingId;
    #floorId;
    #description;
    #property;
    #store;
    #kiosk;

    constructor(
        id,
        name,
        buildingId,
        floorId,
        isKiosk,
        property,
        position,
        rotation,
        scale,
        store,
        kiosk,
    ) {
        this.#id = id;
        this.#name = name;
        this.#buildingId = buildingId;
        this.#floorId = floorId;
        this.#isKiosk = isKiosk;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.#property = property;
        this.#store = store;
        this.#kiosk = kiosk;
    }

    get id() {
        return this.#id;
    }
    get name() {
        return this.#name;
    }
    get buildingId() {
        return this.#buildingId;
    }
    get floorId() {
        return this.#floorId;
    }
    get property() {
        return this.#property;
    }
    get description() {
        return this.#description;
    }
    get isKiosk() {
        return this.#isKiosk;
    }

    get store() {
        return this.#store;
    }

    get kiosk() {
        return this.#kiosk;
    }
}