class Poi {
    #id;
    #name;
    #code;
    #buildingId;
    #floorId;
    #poiCategory;
    #poiMiddleCategory;
    #iconSet;
    #iconUrl;
    #property;
    #tagNames;

    constructor(
        id,
        name,
        code,
        buildingId,
        floorId,
        poiCategoryId,
        poiMiddleCategoryId,
        iconSetId,
        position,
        rotation,
        scale,
        property,
        tagNames,
    ) {
        this.#id = id;
        this.#name = name;
        this.#code = code;
        this.#poiCategory = PoiCategoryManager.findById(poiCategoryId);
        // this.#poiMiddleCategory = PoiMiddleCategoryManager.findById(poiMiddleCategoryId);
        this.#poiMiddleCategory = poiMiddleCategoryId ? PoiMiddleCategoryManager.findById(poiMiddleCategoryId) : null;
        this.#iconSet = IconSetManager.findById(iconSetId);
        this.#iconUrl = this.getIcon2DUrl();
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        property.floorNo = BuildingManager.findById(buildingId).floors.find(floor => floor.id === floorId)?.name
        property.buildingName = BuildingManager.findById(buildingId)?.name
        property.poiCategoryName = PoiCategoryManager.findById(poiCategoryId)?.name
        property.poiMiddleCategoryName = PoiMiddleCategoryManager.findById(poiMiddleCategoryId)?.name
        this.#property = property;
        this.assignYn = property.assignYn;
        this.#buildingId = buildingId;
        this.#floorId = floorId;
        this.#tagNames = tagNames;

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

    get poiMiddleCategory() {
        return this.#poiMiddleCategory ? this.#poiMiddleCategory.id : null;
    }

    get poiCategoryDetail() {
        return this.#poiCategory;
    }

    get poiMiddleCategoryDetail() {
        return this.#poiMiddleCategory;
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
    get tagNames() {
        return this.#tagNames;
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
