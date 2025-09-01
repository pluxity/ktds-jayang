class SystemSetting {

    #id;
    #buildingId;
    #poiLineLength;
    #poiIconSizeRatio;
    #poiTextSizeRatio;
    #nodeDefaultColor;

    constructor(id, buildingId, poiLineLength, poiIconSizeRatio, poiTextSizeRatio, nodeDefaultColor) {
        this.#id = id;
        this.#buildingId = buildingId;
        this.#poiLineLength = poiLineLength;
        this.#poiIconSizeRatio = poiIconSizeRatio;
        this.#poiTextSizeRatio = poiTextSizeRatio;
        this.#nodeDefaultColor = nodeDefaultColor;
    }

    get id() {
        return this.#id;
    }

    get buildingId() {
        return this.#buildingId;
    }

    get poiLineLength() {
        return this.#poiLineLength;
    }

    get poiIconSizeRatio() {
        return this.#poiIconSizeRatio;
    }

    get poiTextSizeRatio() {
        return this.#poiTextSizeRatio;
    }

    get nodeDefaultColor() {
        return this.#nodeDefaultColor;
    }

}
