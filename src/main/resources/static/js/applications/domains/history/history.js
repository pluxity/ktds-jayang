class History{
    #historyId;
    #buildingId;
    #fileId;
    #buildingVersion;
    #historyContent
    #regUser;
    #createdAt;

    constructor(historyDto) {
        const { historyId, buildingId, fileId, buildingVersion, historyContent, regUser, createdAt } = historyDto;

        this.#historyId = historyId;
        this.#buildingId = buildingId;
        this.#fileId = fileId;
        this.#buildingVersion = buildingVersion;
        this.#historyContent = historyContent;
        this.#regUser = regUser;
        this.#createdAt = createdAt;
    }
}