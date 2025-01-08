const PoiCategoryManager = (function () {
    let poiCategoryList = [];

    const getPoiCategoryList = () => {
        const uri = `/poi-categories`;

        return new Promise((resolve) => {
            api.get(uri).then((result) => {
                const { result: data } = result.data;
                poiCategoryList = data.map((poiCategory) => new PoiCategory(poiCategory.id,poiCategory.name));

                resolve(poiCategoryList);
            });
        });
    };

    const findAll = () => {
        return poiCategoryList;
    };

    const findById = (id) => {
        return poiCategoryList.find((poiCategory) => poiCategory.id === id);
    };

    return {
        getPoiCategoryList,
        findAll,
        findById,
    };
})();
