const PoiManager = (() => {
    let poiList = [];

    const dtoToModel = (poiDto) => {
        const { id, name, code, poiCategoryId, iconSetId, buildingId, floorId, position, rotation, scale } = poiDto;
        return new Poi(
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
            poiDto,
        );
    };

    const getPoiList = () => {
        return new Promise((resolve) => {
            api.get(`/poi`).then((result) => {
                const { result: data } = result.data;

                poiList = data.map(dtoToModel);
                resolve(poiList);
            });
        });
    };

    const getPoi = (id) => {
        return new Promise((resolve) => {
            api.get(`/poi/${id}`).then((result) => {
                const { data } = result;
                const poi = dtoToModel(data);
                resolve(poi);
            });
        });
    };

    const getFireSensorCurrentData = (code) => {
        return new Promise((resolve) => {
            api.get(`/fire-sensor-current-data/${code}`).then((result) => {
                const { data } = result;
                resolve(data);
            })
        })
    }

    const getTmsCurrentData = (code) => {
        return new Promise((resolve) => {
            api.get(`/tms-current-data/${code}`).then((result) => {
                const { data } = result;
                resolve(data);
            })
        })
    }

    const postPoi = (poiInfo) => {
        return new Promise((resolve) => {
            api.post('/poi', poiInfo).then((result) => {
                const { data } = result;
                const poi = dtoToModel(data);
                poiList.add(poi);

                resolve(poi);
            });
        });
    };

    const patchPoiPosition = (id, params) => {
        return new Promise((resolve, reject) => {
            api.patch(`/poi/${id}/position`, params)
                .then(() => {
                    getPoiRenderingAndList();
                })
                .catch((error) => {
                    console.error(error);
                    getPoiRenderingAndList();
                });
        });
    };

    const patchPoiRotation = (id, params) => {
        return new Promise((resolve, reject) => {
            api.patch(`/poi/${id}/rotation`, params)
                .then(() => {
                    getPoiRenderingAndList();
                })
                .catch((error) => {
                    console.error(error);
                    getPoiRenderingAndList();
                });
        });
    };

    const patchPoiScale = (id, params) => {
        return new Promise((resolve, reject) => {
            api.patch(`/poi/${id}/scale`, params)
                .then(() => {
                    getPoiRenderingAndList();
                })
                .catch((error) => {
                    console.error(error);
                    getPoiRenderingAndList();
                });
        });
    };


    const deletePoi = (id) => {
        return new Promise((resolve, reject) => {
            api.delete(`/poi/${id}`)
                .then(() => {
                    poiList = poiList.filter((poi) => poi.id !== id);
                    resolve(id);
                })
                .catch((error) => {
                    console.error(error);
                    reject(id);
                });
        });
    };

    const findAll = () => {
        return poiList;
    };

    const findByBuilding = (buildingId) => {
        return poiList.filter((poi) => {
            return poi.property.buildingId === Number(buildingId);
        });
    };

    const findByFloor = (floorId) => {
        return poiList.filter((poi) => poi.property.floorId === floorId);
    };

    const findById = (id) => {
        return poiList.find((poi) => poi.id === id);
    };

    const findByCode = (code) => {
        return poiList.find((poi) => poi.code.toLowerCase() === code.toLowerCase());
    };

    const findByPoiCategory = (buildingId = '', floorId = '', poiCategoryId) => {
        let filteringPoiList = poiList;

        if (buildingId !== '') {
            filteringPoiList = filteringPoiList.filter((poi) => poi.buildingId === Number(buildingId));
        }

        if (floorId !== '') {
            filteringPoiList = filteringPoiList.filter((poi) => poi.floorId === Number(floorId));
        }

        if (poiCategoryId !== '') {
            filteringPoiList = filteringPoiList.filter((poi) => poi.poiCategory === Number(poiCategoryId));
        }

        return filteringPoiList;
    }

    const renderAllPoiToEngineByBuildingId = (buildingId) => {
        const poiData = [];
        poiList.filter((poi) => {
            return poi.property.buildingId === Number(buildingId);
        }).forEach((poi) => {
            if (poi.position === null) {
                return;
            }
            poiData.push(poi.poiOptions);
        });

        Px.Poi.AddFromDataArraySync(poiData, () => {
            Px.Poi.GetDataAll().forEach((poi) => {
                Px.Poi.SetIconSize(poi.id, SystemSettingManager.find().poiIconSizeRatio);
                Px.Poi.SetTextSize(poi.id, SystemSettingManager.find().poiTextSizeRatio);
                if (poi.property.code.toLowerCase().includes("tms")) {
                    TmsEventHandler.renderSetColor(poi.property.code);
                }
            });
        });
    };

    const renderPoiByIdAddByMouse = (id) => {
        const poiDataEngine = PoiManager.findById(id).poiOptions;
        poiDataEngine.onComplete = (poiId) => {
            const poiData = Px.Poi.GetData(poiId);

            PoiManager.patchPoiPosition(poiId, poiData.position);
        };

        Px.Poi.AddByMouseSync(poiDataEngine);
    };

    return {
        getPoiList,
        getPoi,
        getFireSensorCurrentData,
        getTmsCurrentData,
        postPoi,
        patchPoiPosition,
        patchPoiRotation,
        patchPoiScale,
        deletePoi,
        findAll,
        findById,
        findByBuilding,
        findByFloor,
        findByCode,
        findByPoiCategory,
        renderAllPoiToEngineByBuildingId,
        renderPoiByIdAddByMouse
    };
})();