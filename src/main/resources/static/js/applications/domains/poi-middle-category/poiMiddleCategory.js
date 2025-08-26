class PoiMiddleCategory {

    #id;
    #name;
    #poiCategory;
    #imageFile;
    #iconSets;

    constructor(id, name, poiCategory, imageFile, iconSets) {
        this.#id = id;
        this.#name = name;
        this.#poiCategory = poiCategory;
        this.#imageFile = imageFile;
        this.#iconSets = iconSets;
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

    get iconSets() {
        return this.#iconSets;
    }
}
