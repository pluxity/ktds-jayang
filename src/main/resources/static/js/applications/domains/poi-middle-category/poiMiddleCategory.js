class PoiMiddleCategory {

    #id;
    #name;
    #poiCategory;
    #imageFile;

    constructor(id, name, poiCategory, imageFile) {
        this.#id = id;
        this.#name = name;
        this.#poiCategory = poiCategory;
        this.#imageFile = imageFile;
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

    get imageFile() {
        return this.#imageFile;
    }
}
