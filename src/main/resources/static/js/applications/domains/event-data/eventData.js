class EventData {
    #id;

    #datetime;

    #deviceId;

    #deviceType;

    #eventLevel;

    #eventType;

    #deviceName;

    #location;

    #video;

    constructor(eventDataDto) {
        const { id, datetime, deviceId, deviceType, eventLevel, eventType } = eventDataDto;

        this.#id = id;
        this.#datetime = datetime;
        this.#deviceId = deviceId;
        this.#deviceType = deviceType;
        this.#eventLevel = eventLevel;
        this.#eventType = eventType;
        this.#video = false;
    }

    get id() {
        return this.#id;
    }

    get eventLevel() {
        return this.#eventLevel;
    }

    get deviceId() {
        return this.#deviceId;
    }

    get datetime() {
        return this.#datetime;
    }

    get deviceType() {
        return this.#deviceType;
    }

    get deviceName() {
        return this.#deviceName;
    }

    get eventType() {
        return this.#eventType;
    }

    get location() {
        return this.#location;
    }

    get video() {
        return this.#video;
    }

    set deviceName (deviceName) {
        this.#deviceName = deviceName;
    }

    set location (location) {
        this.#location = location;
    }

    set video (video) {
        this.#video = video;
    }

    setDetails(event) {
        const { deviceId, datetime } = event;

        const poi = PoiManager.findByCode(deviceId);

        if(datetime.indexOf('T') > -1) {
            const datetimeArray = datetime.split('T')
            this.#datetime = `${datetimeArray[0]} ${datetimeArray[1].split('.')[0]}`;
        }

        if (poi) {
            const { name, buildingId, floorId, position } = poi.property;
            this.#deviceName = position === null ? "배치 안됨" : name;

            const { name: buildingName, floors } = BuildingManager.findById(buildingId);
            const { floorName } = floors.find(floor => floor.id === floorId);
            this.#location = `${buildingName} ${floorName}`;

            let beforeOneMonth = new Date();
            const lastDayOfMonth = new Date(beforeOneMonth.getFullYear(), beforeOneMonth.getMonth() + 1, 0).getDate();
            if(beforeOneMonth.getDate() > lastDayOfMonth) {
                beforeOneMonth.setDate(lastDayOfMonth);
            }
            beforeOneMonth = new Date(beforeOneMonth.setMonth(beforeOneMonth.getMonth() - 1));

            if(new Date(this.#datetime) > beforeOneMonth) {
                if(poi.code.includes('CCTV-')) {
                    this.#video = true;
                } else if(poi.property.poiCameras.length > 0){
                    this.#video = true;
                }
            }

        }





    }
}
