class Notice {

    #id;
    #title;
    #content;
    #isUrgent;
    #expiredAt;
    #createdAt;

    constructor(id, title, content, isUrgent, expiredAt, createdAt) {
        this.#id = id;
        this.#title = title;
        this.#content = content;
        this.#isUrgent = isUrgent;
        this.#expiredAt = expiredAt;
        this.#createdAt = createdAt;
    }

    get id() {
        return this.#id;
    }

    get title() {
        return this.#title;
    }

    get content() {
        return this.#content;
    }

    get isUrgent() {
        return this.#isUrgent;
    }

    get expiredAt() {
        return this.#expiredAt;
    }

    get createdAt() {
        return this.#createdAt;
    }
}
