class PoiMiddleCategory {

    #id;
    #name;
    #poiCategory

    constructor(id, name, poiCategory) {
        this.#id = id;
        this.#name = name;
        this.#poiCategory = poiCategory;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get poiCategory() {
        return this.#poiCategory;
    }
}
