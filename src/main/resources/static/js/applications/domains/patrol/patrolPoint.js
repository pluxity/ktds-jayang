class PatrolPoint {

    #id;

    #name;

    #floorId;

    #sortOrder;

    #pointLocation;

    #pois;

    constructor(id, name, floorId, sortOrder, pointLocation, pois) {
        this.#id = id;
        this.#name = name;
        this.#floorId = floorId;
        this.#sortOrder = sortOrder;
        this.#pointLocation = pointLocation;
        this.#pois = pois;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get floorId() {
        return this.#floorId;
    }

    get sortOrder() {
        return this.#sortOrder;
    }

    get pointLocation() {
        return this.#pointLocation;
    }

    get pois() {
        return this.#pois;
    }

}
