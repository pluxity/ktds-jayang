const PoiManager = (() => {
    let poiList = [];

    const dtoToModel = (poiDto) => {
        const { id, name, code, poiCategoryId, poiMiddleCategoryId, iconSetId, buildingId, floorNo, position, rotation, scale, tagNames, cctvList } = poiDto;
        return new Poi(
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
            poiDto,
            tagNames,
            cctvList,
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

    const getAllocateFilterPoiList = (buildingId, isAllocate) => {
        return new Promise((resolve) => {
            api.get(`/poi/allocate`, {
                params: {
                    buildingId: buildingId,
                    isAllocate: isAllocate
                }
            }).then((result) => {
                const { result: data } = result.data;
                poiList = data.map(dtoToModel);
                resolve(poiList);
            });
        });
    };

    const getFilteredPoiList = () => {
        return new Promise((resolve) => {
            api.get(`/poi/filter`).then((result) => {
                const { result: data } = result.data;

                poiList = data.map(dtoToModel);
                resolve(poiList);
            });
        });
    };

    const getPoiByCategoryId = (id) => {
        return new Promise((resolve) => {
            api.get(`/poi/poi-category/${id}`).then((result) => {
                const { result: data } = result.data;

                poiList = data.map(dtoToModel);
                resolve(poiList);
            });
        });
    };

    // by buildingId
    const getPoisByBuildingId = (id) => {
        return new Promise((resolve) => {
            api.get(`/poi/building/${id}`).then((result) => {
                const { result: data } = result.data;

                poiList = data.map(dtoToModel);
                resolve(poiList);
            });
        });
    };
    // by floorNo
    const getPoisByFloorNo = (no) => {
        return new Promise((resolve) => {
            api.get(`/poi/floor/${no}`).then((result) => {
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


    const updatePoiWithPositionAndFloorNo = (id, position, floorNo) => {
        const poi = findById(id);
        if (!poi) {
            console.error('POI not found:', id);
            return Promise.reject('POI not found');
        }

        const extractedTagNames = poi.tagNames ? 
            poi.tagNames.map(tag => typeof tag === 'string' ? tag : tag.tagName) : [];

        const updateData = {
            code: poi.code,
            name: poi.name,
            buildingId: poi.property.buildingId,
            floorNo: floorNo,
            poiCategoryId: poi.poiCategory,
            poiMiddleCategoryId: poi.poiMiddleCategory,
            iconSetId: poi.iconSetId,
            position: position,
            tagNames: extractedTagNames,
            isLight: poi.property.isLight,
            lightGroup: poi.property.lightGroup,
            cameraIp: poi.property.cameraIp,
            cctvList: poi.property.cctvList || []
        };

        return new Promise((resolve, reject) => {
            api.put(`/poi/${id}`, updateData)
                .then((response) => {
                    // 로컬 데이터 업데이트
                    poi.floorNo = floorNo;
                    poi.property.floorNo = floorNo;
                    poi.position = position;
                    resolve(response);
                })
                .catch((error) => {
                    console.error('POI update failed:', error);
                    reject(error);
                });
        });
    };

    const deletePoi = (id) => {
        return new Promise((resolve, reject) => {
            api.delete(`/poi/${id}`)
                .then(() => {
                    poiList = poiList.filter((poi) => poi.id !== id);
                    resolve(id);
                    getPoiRenderingAndList();
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

    const findByPoiCategory = (buildingId = '', floorNo = '', poiCategoryId) => {
        let filteringPoiList = poiList;
        if (buildingId !== '') {
            filteringPoiList = filteringPoiList.filter((poi) => poi.buildingId === Number(buildingId));
        }

        if (floorNo !== '') {
            filteringPoiList = filteringPoiList.filter((poi) => poi.floorNo === Number(floorNo));
        }

        if (poiCategoryId !== '') {
            filteringPoiList = filteringPoiList.filter((poi) => poi.poiCategory === Number(poiCategoryId));
        }

        return filteringPoiList;
    }

    const renderAllPoiToEngineByBuildingId = (buildingId) => {
        return new Promise((resolve, reject) => {
            const poiData = [];
            poiList.filter((poi) => {
                return poi.property.buildingId === Number(buildingId);
            }).forEach((poi) => {
                if (poi.position === null) {
                    return;
                }
                poiData.push(poi.poiOptions);
            });

            Px.Poi.AddFromDataArray(poiData, () => {
                Px.Poi.GetDataAll().forEach((poi) => {
                    Px.Poi.SetIconSize(poi.id, SystemSettingManager.find().poiIconSizeRatio);
                    Px.Poi.SetTextSize(poi.id, SystemSettingManager.find().poiTextSizeRatio);
                    const isAdmin = window.location.href.includes('admin');
                    if (poi.property.isLight) {
                        Px.Poi.SetIconSize(poi.id, 50);
                        if (!isAdmin)
                            Px.Poi.SetTextSize(poi.id, 1);
                    }
                });
                resolve(); // 완료 시 resolve 호출
            });
        });
    };

    const renderPoiByIdAddByMouse = (id) => {
        const poiDataEngine = PoiManager.findById(id).poiOptions;

        Px.Poi.AddByMouse({
           ...poiDataEngine,
            onComplete: function (poiId) {
                const poiData = Px.Poi.GetData(poiId);
                const currentFloorNo = document.querySelector('#floorNo')?.value;

                if (!poiData.property.cameraId && poiData.property.cameraIp) {
                    initPlayer(poiData.property.cameraIp).then(player => {
                        player.getDeviceInfo(cameraList => {
                            const cam = cameraList.find(c => c["ns1:strIPAddress"] === poiData.property.cameraIp);
                            const cameraId = cam ? cam["ns1:strCameraID"] : null;

                            PoiManager.patchPoiCameraId(poiId, cameraId);
                            console.log("cameraId: ", cameraId);
                        });
                    });
                }
                if (currentFloorNo && currentFloorNo !== '') {
                    const floorNumber = Number(currentFloorNo);

                    // position과 floorNo를 한 번에 업데이트
                    PoiManager.updatePoiWithPositionAndFloorNo(poiId, poiData.position, floorNumber)
                        .then(() => {
                            getPoiRenderingAndList();
                        });
                }
            }
        });
    };

    const patchPoiCameraId = (id, params) => {
        return new Promise((resolve, reject) => {
            api.patch(`/poi/${id}/cameraId`, params).then(res => {
                console.log("res :", res);
            })
        });
    };

    const initPlayer = (cameraIp) => {
        return api.get("/cctv/config").then(res => {
            const cctvConfig = res.data.result;
            return new PluxPlayer({
                wsRelayUrl: cctvConfig.wsRelayUrl,
                wsRelayPort: cctvConfig.wsRelayPort,
                httpRelayUrl: cctvConfig.httpRelayUrl,
                httpRelayPort: cctvConfig.httpRelayPort,

                LG_server_ip: cctvConfig.lgServerIp,
                LG_server_port: cctvConfig.lgServerPort,

                LG_live_port: cctvConfig.lgLivePort,
                LG_playback_port: cctvConfig.lgPlaybackPort,
                canvasDom: document.createElement('canvas')
            });
        })
    }

    return {
        getPoiList,
        getPoiByCategoryId,
        getPoisByBuildingId,
        getPoi,
        getFireSensorCurrentData,
        getTmsCurrentData,
        postPoi,
        patchPoiPosition,
        patchPoiRotation,
        patchPoiScale,
        updatePoiWithPositionAndFloorNo,
        deletePoi,
        findAll,
        findById,
        findByBuilding,
        findByFloor,
        findByCode,
        findByPoiCategory,
        renderAllPoiToEngineByBuildingId,
        renderPoiByIdAddByMouse,
        getPoisByFloorNo,
        getFilteredPoiList,
        initPlayer,
        patchPoiCameraId,
        getAllocateFilterPoiList
    };
})();
