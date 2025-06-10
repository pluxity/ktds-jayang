class PatrolPoint {

    #id;

    #name;

    #floorNo;

    #sortOrder;

    #pointLocation;

    #pois;

    constructor(id, name, floorNo, sortOrder, pointLocation, pois) {
        this.#id = id;
        this.#name = name;
        this.#floorNo = floorNo;
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

    get floorNo() {
        return this.#floorNo;
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
