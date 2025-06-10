const SystemSettingManager = (function () {
    let systemSetting = {};

    const getSystemSetting = () => {
        const uri = `/system-settings`;

        return new Promise((resolve) => {
            api.get(uri).then((result) => {
                const { result: data } = result.data;
                systemSetting = new SystemSetting(data.id, data.poiLineLength, data.poiIconSizeRatio, data.poiTextSizeRatio, data.nodeDefaultColor);
                resolve(systemSetting);
            });
        });
    };

    const find = () => {
        return systemSetting;
    };

    return {
        getSystemSetting,
        find,
    };
})();
