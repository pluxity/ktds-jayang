class KioskPoi {
    #id;
    #isKiosk;
    #name;
    #buildingId;
    #floorNo;
    #description;
    #property;
    #store;
    #kiosk;

    constructor(
        id,
        name,
        buildingId,
        floorNo,
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
        this.#floorNo = floorNo;
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
    get floorNo() {
        return this.#floorNo;
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
    get storeIconUrl() {
        return `${CONTEXT_PATH}2D/kiosk/store.svg`;
    }
    get kioskIconUrl() {
        return `${CONTEXT_PATH}2D/kiosk/kiosk.svg`;
    }
    // Px.Poi.Add 용
    get poiOptions() {
        return {
            id: this.id,
            displayText: this.name,
            group: this.isKiosk ? 'Kiosk' : 'Store',
            lineHeight: SystemSettingManager.find().poiLineLength ?? 10,
            position: this.position ? this.position : {x:0,y:0,z:0},
            iconUrl: this.isKiosk ? this.kioskIconUrl : this.storeIconUrl,
            property: this.property,
            rotation: {
                "x": 0,
                "y": 0,
                "z": 0
            },
        };
    }

    removeOn3D(onComplete) {
        Px.Poi.Remove(this.id, onComplete);
    }


    get store() {
        return this.#store;
    }

    get kiosk() {
        return this.#kiosk;
    }
}