class PoiCategory {

    #id;
    #name;
    #imageFile;

    constructor(id, name, imageFile) {
        this.#id = id;
        this.#name = name;
        this.#imageFile = imageFile;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get imageFile() {
        return this.#imageFile;
    }
}
