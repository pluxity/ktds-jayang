class IconSet {

    #id;
    #name;
    #iconFileNormal2D;
    #iconFileWarning2D;
    #iconFileDanger2D;
    #iconFileMissing2D;
    #iconFile2D;
    #iconFile3D;

    // constructor(id, name, iconFileNormal2D, iconFileWarning2D, iconFileDanger2D, iconFileMissing2D) {
    //     this.#id = id;
    //     this.#name = name;
    //     this.#iconFileNormal2D = iconFileNormal2D;
    //     this.#iconFileWarning2D = iconFileWarning2D;
    //     this.#iconFileDanger2D = iconFileDanger2D;
    //     this.#iconFileMissing2D = iconFileMissing2D;
    // }

    constructor(id, name, iconFile2D, iconFile3D) {
        this.#id = id;
        this.#name = name;
        this.#iconFile2D = iconFile2D;
        this.#iconFile3D = iconFile3D;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get iconFileNormal2D() {
        return this.#iconFileNormal2D;
    }

    get iconFileWarning2D() {
        return this.#iconFileWarning2D;
    }

    get iconFileDanger2D() {
        return this.#iconFileDanger2D;
    }

    get iconFileMissing2D() {
        return this.#iconFileMissing2D;
    }

    get iconFile2D() {
        return this.#iconFile2D;
    }

    get iconFile3D() {
        return this.#iconFile3D;
    }

}
