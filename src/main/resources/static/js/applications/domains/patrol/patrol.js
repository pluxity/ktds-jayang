class Patrol {

    #id;

    #name;

    #buildingId;

    #patrolPoints


    constructor(id, name, buildingId, patrolPoints) {
        this.#id = id;
        this.#name = name;
        this.#buildingId = buildingId;
        this.#patrolPoints = patrolPoints;

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

}
