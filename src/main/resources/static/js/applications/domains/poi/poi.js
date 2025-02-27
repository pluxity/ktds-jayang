class Poi {

    #id;

    #name;

    #code;

    #iconSet;

    #poiCategory;

    #floorId;

    #iconUrl;

    #property;

    #buildingId;

    constructor(
        id,
        name,
        code,
        buildingId,
        floorId,
        poiCategoryId,
        iconSetId,
        position,
        rotation,
        scale,
        property,
    ) {
        this.#id = id;
        this.#name = name;
        this.#code = code;
        this.#poiCategory = PoiCategoryManager.findById(poiCategoryId);
        this.#iconSet = IconSetManager.findById(iconSetId);
        this.#iconUrl = this.getIcon2DUrl();
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        property.floorNo = BuildingManager.findById(buildingId).floors.find(floor => floor.id === floorId)?.name
        property.buildingName = BuildingManager.findById(buildingId)?.name
        property.poiCategoryName = PoiCategoryManager.findById(poiCategoryId)?.name
        this.#property = property;
        this.assignYn = property.assignYn;
        this.#buildingId = buildingId;
        this.#floorId = floorId;

    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get code() {
        return this.#code;
    }

    get poiCategory() {
        return this.#poiCategory.id;
    }

    get poiCategoryDetail() {
        return this.#poiCategory;
    }

    get iconUrl() {
        return this.#iconUrl;
    }
    get buildingId() {
        return this.#buildingId;
    }

    get property() {
        return this.#property;
    }
    get floorId() {
        return this.#floorId;
    }
    // Px.Poi.Add 용
    get poiOptions() {
        return {
            id: this.id,
            displayText: this.name,
            group: this.#poiCategory.name,
            lineHeight: SystemSettingManager.find().poiLineLength ?? 10,
            iconUrl: this.iconUrl,
            position: this.position ? this.position : {x:0,y:0,z:0},
            property: this.property,
            rotation: {
                "x": 0,
                "y": 0,
                "z": 0
            },
        };
    }

    removeOn3D(onComplete) {
        Px.Poi.Remove(this.id, onComplete);
    }


    getIconNormalUrl() {
        const { directory, storedName, extension } = this.#iconSet.iconFileNormal2D;
        return `${CONTEXT_PATH}2D/${directory}/${storedName}.${extension}`;
    }

    getIconWarningUrl() {
        const { directory, storedName, extension } = this.#iconSet.iconFileWarning2D;
        return `${CONTEXT_PATH}2D/${directory}/${storedName}.${extension}`;
    }

    getIconDangerUrl() {
        const { directory, storedName, extension } = this.#iconSet.iconFileDanger2D;
        return `${CONTEXT_PATH}2D/${directory}/${storedName}.${extension}`;
    }

    getIconMissingUrl() {
        const { directory, storedName, extension } = this.#iconSet.iconFileMissing2D;
        return `${CONTEXT_PATH}2D/${directory}/${storedName}.${extension}`;
    }

    getIcon2DUrl() {
        const { directory, storedName, extension } = this.#iconSet.iconFile2D;
        return `${CONTEXT_PATH}2D/${directory}/${storedName}.${extension}`;
    }

    getIcon3DUrl() {
        const { directory, storedName, extension } = this.#iconSet.iconFile3D;
        return `${CONTEXT_PATH}3D/${directory}/${storedName}.${extension}`;
    }

}
