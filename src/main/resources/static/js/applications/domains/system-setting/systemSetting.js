class SystemSetting {

    #id;
    #poiLineLength;
    #poiIconSizeRatio;
    #poiTextSizeRatio;
    #nodeDefaultColor;

    constructor(id, poiLineLength, poiIconSizeRatio, poiTextSizeRatio, nodeDefaultColor) {
        this.#id = id;
        this.#poiLineLength = poiLineLength;
        this.#poiIconSizeRatio = poiIconSizeRatio;
        this.#poiTextSizeRatio = poiTextSizeRatio;
        this.#nodeDefaultColor = nodeDefaultColor;
    }

    get id() {
        return this.#id;
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
