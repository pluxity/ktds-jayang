const FireSensorEventHandler = (() => {
    const executeEvent = async (eventLevel, fireSensorData, force = false, closeRecentEventPopup = true) => {
        const { nmac, smoketype, temptype, tempvalue, datetime } = fireSensorData;
        const poi = PoiManager.findByCode(nmac);
        if(!poi) return;

        const { id: poiId, name, buildingId, floorId, poiCameras, position } = poi.property;

        if(!position) return;

        Px.VirtualPatrol.RemoveAll();
        popup.closeAllPopup(closeRecentEventPopup);
        const sensorPopup = document.querySelector('.popup.sensor');
        const sensorPopupHeader = sensorPopup.querySelector('.popup-header');
        if(!force && sensorPopup.classList.contains('open') && sensorPopupHeader.classList.contains('bg-danger-light')) return;
        document.querySelector('#sensorLayerPopup .motion-pictogram')?.remove();

        const { name: buildingName, floors } = BuildingManager.findById(buildingId);
        const { floorName } = floors.find(floor => floor.id === floorId);

        let smokeEvent = smoketype !== '11' ? '-' : '연기';
        let tempEvent = temptype !== '11' ? '-' : '온도';

        let combinedEvents = [];

        if (smokeEvent !== '-') combinedEvents.push(smokeEvent);
        if (tempEvent !== '-') combinedEvents.push(tempEvent);

        const eventData = {
            state: '위험',
            code: combinedEvents.length > 0 ? combinedEvents.join(', ') : '-',
            location: `${buildingName} ${floorName}`,
            datetime,
            smoketype,
            temptype,
            tempvalue
        };
        popup.moveToPoi(poiId, () => {
            popup.createSensorPopup(name, '위험', eventData);
            Px.Poi.SetIcon(poi.getIconDangerUrl(), poiId);
            document.getElementById('dimSensorLayerPopup').classList.add('on');
        }, 500, true);

        const timeOffset = 9 * 60 * 60 * 1000;

        const date = new Date(datetime);
        date.setSeconds(date.getSeconds() - 10);

        const eventTime = new Date(date.getTime() + timeOffset).toISOString();

        const playbackTime = eventTime.split('.')[0].replace(/-|T|:/g, '');

        CctvEventHandler.cctvPlayerClose();
        const ids = poiCameras.map((camera) => camera.code.split('-')[1]);
        CctvEventHandler.cctvPlayerOpen('live', ids, playbackTime);

        const width = 420;
        const height = 880;
        const top = screen.height - (height / 2 - 50 / 2);
        const left = screenLeft + screen.width - width - 60;

        // api.post(`${E_SOP_URL}/SOPAlone/SOPAlone/CloseAllSOP`).then(() => {
        //     window.open(`${E_SOP_URL}`,'_blank',`scrollbar=yes,width=${width},height=${height},top=${top},left=${left}`);
        //     const { code } = BuildingManager.findById(BUILDING_ID);
        //
        //     const buildingGroupId = code ? code.split('-')[2].slice(1,2) : 8;
        //     api.post(`${E_SOP_URL}/SOPAlone/SOPAlone/RunSOP`, {
        //         FacilityType: 0,
        //         BuildingGroupID: buildingGroupId,
        //     })
        // })
        window.open(`${E_SOP_URL}`,'_blank',`scrollbar=yes,width=${width},height=${height},top=${top},left=${left}`);
        const { code } = BuildingManager.findById(BUILDING_ID);

        const buildingGroupId = code ? code.split('-')[2].slice(1,2) : 8;
        api.post(`${E_SOP_URL}/SOPAlone/SOPAlone/RunSOP`, {
            FacilityType: 0,
            BuildingGroupID: buildingGroupId,
            ExitPreviousSop: true

        })
    }

    const missingEvent = async (poiCode, showPopup = false, closeRecentEventPopup = true) => {
        const poi = PoiManager.findByCode(poiCode);
        if(!poi) return;

        const { id, property } = poi;

        if(!property.position) return;

        Px.Poi.GetPoiDataByProperty('isMissing', true)?.forEach((poi) => {
            const targetPoi = PoiManager.findById(poi.id);
            Px.Poi.SetIcon(targetPoi.getIconNormalUrl(), poi.id);
        })

        Px.Poi.SetProperty(id, 'isMissing', true);
        Px.Poi.SetIcon(poi.getIconMissingUrl(), id);

        if(showPopup) {
            Px.VirtualPatrol.RemoveAll();
            popup.closeAllPopup(closeRecentEventPopup);
            await popup.moveToPoi(id, () => popup.setPoiEvent(id));
            document.getElementById('dimSensorLayerPopup').classList.add('on');
        }
    }

    return {
        executeEvent,
        missingEvent
    }
})();