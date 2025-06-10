class Notice {

    #id;
    #title;
    #content;
    #isUrgent;
    #isActive;
    #isRead;
    #expiredAt;
    #createdAt;
    #buildingIds

    constructor(id, title, content, isUrgent, isActive, isRead, expiredAt, createdAt, buildingIds) {
        this.#id = id;
        this.#title = title;
        this.#content = content;
        this.#isUrgent = isUrgent;
        this.#isActive = isActive;
        this.#isRead = isRead;
        this.#expiredAt = expiredAt;
        this.#createdAt = createdAt;
        this.#buildingIds = buildingIds;
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

    get isActive() {
        return this.#isActive;
    }

    get isRead() {
        return this.#isRead;
    }

    get expiredAt() {
        return this.#expiredAt;
    }

    get createdAt() {
        return this.#createdAt;
    }

    get buildingIds() {
        return this.#buildingIds;
    }
}
