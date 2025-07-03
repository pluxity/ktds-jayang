class Poi {
    #id;
    #name;
    #code;
    #buildingId;
    #floorNo;
    #poiCategory;
    #poiMiddleCategory;
    #iconSet;
    #icon2DUrl;
    #icon3DUrl;
    #property;
    #tagNames;
    #cctvList;
    #isLight;
    #lightGroup;
    #cameraIp;
    #cameraId;

    constructor(
        id,
        name,
        code,
        buildingId,
        floorNo,
        poiCategoryId,
        poiMiddleCategoryId,
        iconSetId,
        position,
        rotation,
        scale,
        property,
        tagNames,
        cctvList,
        isLight,
        lightGroup,
        cameraIp,
        cameraId
    ) {
        this.#id = id;
        this.#name = name;
        this.#code = code;
        this.#poiCategory = PoiCategoryManager.findById(poiCategoryId);
        // this.#poiMiddleCategory = PoiMiddleCategoryManager.findById(poiMiddleCategoryId);
        this.#poiMiddleCategory = poiMiddleCategoryId ? PoiMiddleCategoryManager.findById(poiMiddleCategoryId) : null;
        this.#iconSet = IconSetManager.findById(iconSetId);
        this.#icon2DUrl = this.#iconSet.iconFile2D !== null ? this.getIcon2DUrl() : '/static/img/icon_2d_default.svg';
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.#icon3DUrl = this.#iconSet.iconFile3D !== null ? this.getIcon3DUrl() : '';
        property.floorNo = floorNo;
        property.floorName = BuildingManager.findById(buildingId).floors.find(floor => floor.no === floorNo)?.name;
        property.buildingName = BuildingManager.findById(buildingId)?.name
        property.poiCategoryName = PoiCategoryManager.findById(poiCategoryId)?.name
        property.poiMiddleCategoryName = PoiMiddleCategoryManager.findById(poiMiddleCategoryId)?.name
        this.#property = property;
        this.assignYn = property.assignYn;
        this.#buildingId = buildingId;
        this.#floorNo= floorNo;
        this.#tagNames = tagNames;
        this.#cctvList = cctvList;
        this.#isLight = isLight;
        this.#lightGroup = lightGroup;
        this.#cameraIp = cameraIp;
        this.#cameraId = cameraId;
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
        return this.#icon2DUrl;
    }
    get buildingId() {
        return this.#buildingId;
    }

    get property() {
        return this.#property;
    }
    get floorNo() {
        return this.#floorNo;
    }
    get tagNames() {
        return this.#tagNames;
    }
    get cctvList() {
        return this.#cctvList;
    }
    get isLight() {
        return this.#isLight;
    }
    get lightGroup() {
        return this.#lightGroup;
    }
    get cameraIp() {
        return this.#cameraIp;
    }
    get cameraId() {
        return this.#cameraId;
    }
    // Px.Poi.Add 용
    get poiOptions() {
        return {
            type: this.#icon3DUrl ? 'gltf': '',  // type 없을 경우 기본 모델(빨간점) 로드
            url: this.#icon3DUrl,
            id: this.id,
            displayText: this.name,
            group: this.#poiCategory.name,
            lineHeight: SystemSettingManager.find().poiLineLength ?? 10,
            iconUrl: this.iconUrl,
            position: this.position ? this.position : {x:0,y:0,z:0},
            rotation: this.rotation ? this.rotation : {x:0,y:0,z:0},
            scale: this.scale ? this.scale : {x:100,y:100,z:100},
            property: this.property,
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
        const { directory, storedName } = this.#iconSet.iconFile3D;
        return `${CONTEXT_PATH}3D/${directory}/${storedName}.glb`;
    }

}
