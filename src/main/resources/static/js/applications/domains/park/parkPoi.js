class ParkPoi {
    #id;
    #name;
    #buildingId;
    #floorNo;
    #floorNm;
    #type;
    #property;
    #latitude;
    #longitude;

    constructor(
        id,
        name,
        buildingId,
        floorNo,
        floorNm,
        type,
        property,
        position,
        rotation,
        scale,
        latitude,
        longitude
    ) {
        this.#id = id;
        this.#name = name;
        this.#buildingId = buildingId;
        this.#floorNo = floorNo;
        this.#floorNm = floorNm;
        this.#type = type;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.#latitude = latitude;
        this.#longitude = longitude;
        this.#property = property;
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
    get floorNm() {
        return this.#floorNm;
    }
    get type() {
        return this.#type;
    }
    get property() {
        return this.#property;
    }
    get latitude() {
        return this.#latitude;
    }
    get longitude() {
        return this.#longitude;
    }
    // Px.Poi.Add 용
    get poiOptions() {
        return {
            id: this.id,
            displayText: this.name,
            lineHeight: SystemSettingManager.find().poiLineLength ?? 40,
            position: this.position ? this.position : {x:0,y:0,z:0},
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

    setName(name) {
        this.#name = name;
    }
}