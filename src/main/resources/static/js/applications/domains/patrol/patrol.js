class Patrol {

    #id;

    #name;

    #buildingId;

    #patrolPoints

    #createdAt

    constructor(id, name, buildingId, patrolPoints, createdAt) {
        this.#id = id;
        this.#name = name;
        this.#buildingId = buildingId;
        this.#patrolPoints = patrolPoints;
        this.#createdAt = createdAt;

    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get buildingId() {
        return this.#buildingId;
    }

    get patrolPoints() {
        return this.#patrolPoints;
    }

    get createdAt() {
        return this.#createdAt;
    }

}
