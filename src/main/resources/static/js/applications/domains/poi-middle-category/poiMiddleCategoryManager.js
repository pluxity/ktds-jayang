const PoiMiddleCategoryManager = (function () {
    let poiMiddleCategoryList = [];

    const getPoiMiddleCategoryList = () => {
        const uri = `/poi-middle-categories`;

        return new Promise((resolve) => {
            api.get(uri).then((result) => {
                const { result: data } = result.data;
                poiMiddleCategoryList = data.map((poiMiddleCategory) =>
                    new PoiMiddleCategory(poiMiddleCategory.id, poiMiddleCategory.name,
                        poiMiddleCategory.poiCategory, poiMiddleCategory.imageFile));

                resolve(poiMiddleCategoryList);
            });
        });
    };

    const findAll = () => {
        return poiMiddleCategoryList;
    };

    const findById = (id) => {
        return poiMiddleCategoryList.find((poiMiddleCategory) => poiMiddleCategory.id === id);
    };

    const findByCategoryId = (categoryId) => {
        return poiMiddleCategoryList.filter((poiMiddleCategory) => poiMiddleCategory.poiCategory.id === categoryId);
    }

    return {
        getPoiMiddleCategoryList,
        findAll,
        findById,
        findByCategoryId,
    };
})();
