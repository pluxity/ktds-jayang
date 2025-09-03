const SystemSettingManager = (function () {
    let systemSettings = [];
    let systemSetting = {};

    const getSystemSetting = () => {
        const uri = `/system-settings`;

        return new Promise((resolve) => {
            api.get(uri).then((result) => {
                const dataList = result.data.result;

                systemSettings = dataList.map(data =>
                    new SystemSetting(
                        data.id,
                        data.buildingId,
                        data.poiLineLength,
                        data.poiIconSizeRatio,
                        data.poiTextSizeRatio,
                        data.nodeDefaultColor
                    )
                );
                resolve(systemSettings);
            });
        });
    };

    const getSystemSettingByBuildingId = (buildingId) => {
        return new Promise((resolve) => {
            api.get(`/system-settings/${buildingId}`).then((result) => {
                const { result: data } = result.data;

                systemSetting = new SystemSetting(data.id, data.buildingId, data.poiLineLength, data.poiIconSizeRatio, data.poiTextSizeRatio, data.nodeDefaultColor);
                resolve(systemSetting);
            });
        });
    }

    const findAll = () => {
        return systemSettings;
    };

    const find = () => {
        return systemSetting;
    };

    const findByBuildingId = (buildingId) => {
        return systemSettings.filter((setting) => setting.buildingId === Number(buildingId));
    }

    return {
        getSystemSetting,
        find,
        findByBuildingId,
        getSystemSettingByBuildingId
    };
})();
