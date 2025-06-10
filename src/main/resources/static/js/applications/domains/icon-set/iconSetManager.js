const IconSetManager = (function () {
    let iconSetList = [];

    const getIconSetList = () => {
        const uri = `/icon-sets`;

        return new Promise((resolve) => {
            api.get(uri).then((result) => {
                const { result: data } = result.data;
                // iconSetList = data.map((iconSet) => new IconSet(iconSet.id, iconSet.name, iconSet.iconFileNormal2D, iconSet.iconFileWarning2D, iconSet.iconFileDanger2D, iconSet.iconFileMissing2D));
                iconSetList = data.map((iconSet) => new IconSet(iconSet.id, iconSet.name, iconSet.iconFile2D, iconSet.iconFile3D));

                resolve(iconSetList);
            });
        });
    };

    const findAll = () => {
        return iconSetList;
    };

    const findById = (id) => {
        return iconSetList.find((iconSet) => iconSet.id === id);
    };

    return {
        getIconSetList,
        findAll,
        findById,
    };
})();
