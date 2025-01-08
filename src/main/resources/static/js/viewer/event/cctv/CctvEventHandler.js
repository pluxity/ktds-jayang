const CctvEventHandler =  {
    executeEvent(eventLevel, eventData, force = false, closeRecentEventPopup = true)   {
        const { datetime, deviceId, vmsEventData } = eventData;

        const poi = PoiManager.findByCode(deviceId);
        if(!poi) return;

        const { id: poiId, name, buildingId, floorId, position } = poi.property;

        if(!position) return;

        Px.VirtualPatrol.RemoveAll();
        popup.closeAllPopup(closeRecentEventPopup);
        const sensorPopup = document.querySelector('.popup.sensor');
        const sensorPopupHeader = sensorPopup.querySelector('.popup-header');
        if(!force && sensorPopup.classList.contains('open') && sensorPopupHeader.classList.contains('bg-danger-light')) return;
        document.querySelector('#sensorLayerPopup .motion-pictogram')?.remove();


        const { name: eventName, eSopCode, iconFile } = vmsEventData;
        const { name: buildingName, floors } = BuildingManager.findById(buildingId);
        const { floorName } = floors.find(floor => floor.id === floorId);

        const timeOffset = 9 * 60 * 60 * 1000;

        const date = new Date(datetime);
        date.setSeconds(date.getSeconds() - 10);
        const eventTime = new Date(date.getTime() + timeOffset).toISOString();
        const playbackTime = eventTime.split('.')[0].replace(/-|T|:/g, '');

        // this.cctvPlayerClose();
        let type = 'live';
        if(force) {
            type = 'playback';
        }
        this.cctvPlayerOpen(type, deviceId.split('-')[1], playbackTime);

        const popupData = {
            code: eventName,
            location: `${buildingName} ${floorName}`,
            datetime
        }

        if(eventLevel.toLowerCase() === 'warning') {
            popupData.state = '경고';

            popup.moveToPoi(poiId, () => {
                Px.Poi.SetIcon(poi.getIconWarningUrl(), poi.id);
                popup.createSensorPopup(name, popupData.state, popupData);
                document.getElementById('dimSensorLayerPopup').classList.add('on');

                const {fileEntityType, directory, storedName, extension} = iconFile;
                const pictogram = document.createElement('div');
                pictogram.classList.add('motion-pictogram');
                pictogram.innerHTML = `<img src=${fileEntityType}/${directory}/${storedName}.${extension} alt=''>`;
                document.querySelector('#sensorLayerPopup').prepend(pictogram);
            }, 500, false);
        } else if(eventLevel.toLowerCase() === 'danger') {
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
            //         FacilityType: eSopCode,
            //         BuildingGroupID: buildingGroupId,
            //     })
            // })


            popupData.state = '위험';
            popup.moveToPoi(poiId, () => {
                Px.Poi.SetIcon(poi.getIconDangerUrl(), poi.id);
                popup.createSensorPopup(name, popupData.state, popupData);
                document.getElementById('dimSensorLayerPopup').classList.add('on');

                window.open(`${E_SOP_URL}`,'_blank',`scrollbar=yes,width=${width},height=${height},top=${top},left=${left}`);
                const { code } = BuildingManager.findById(BUILDING_ID);

                const buildingGroupId = code ? code.split('-')[2].slice(1,2) : 8;
                api.post(`${E_SOP_URL}/SOPAlone/SOPAlone/RunSOP`, {
                    FacilityType: eSopCode,
                    BuildingGroupID: buildingGroupId,
                    ExitPreviousSop: true
                })

            }, 500, true);
        }
    },

    // 테스트 방법
    // CctvEventHandler.cctvPlayerOpen("play",1);

    // 레이아웃1 - 세로형
    cctvPlayerOpen(type, ids, time = null) {
        // CCTV OPEN;
        if(!Array.isArray(ids)) ids = [ids];

        ids.forEach((id, index) => {
            const height = Math.round(screen.height / 4);
            const width = Math.round((600 * height) / 480);

            const x = screenLeft + 132;
            const y = (height * index);

            // 무조건 화면 가운데로 뜨려면 marginY 사용
            // const marginY = (screen.height - (height * ids.length)) / 2;
            // const y = (height * index) + marginY;

			let devices = [];
            const device = {};
            device.num = Number(id);
            device.location = {x, y};
            device.size = {w: width, h: height};
            devices.push(device);

            ids.forEach((deviceId, deviceIndex) => {

                if(deviceIndex === index) return;

                const device = {};
                device.num = Number(id);
                device.size = {w: width, h: height};
                devices.push(device);

            });


            const cctvData = {
                "request":{
                    "method":"popup",
                    "mode":type,  //live or playback
                    "ptz" : 0,
                    "devices": devices,
                    "client":{
                        "ip": VMS_CLIENT_IP,
                        "port": 11086,
                        "layout":1
                    }
                }
            }

            if(time) {
                cctvData.request.datetime = time;
            }

            cctvPlayerWebsocket.send(JSON.stringify(cctvData));
        })
    },

    // 레이아웃2 - 분산형
    cctvPlayerOpen2(type, ids, time = null) {
        // CCTV OPEN;
        if(!Array.isArray(ids)) ids = [ids];

        ids.forEach((id, index) => {
            const top = 70;
            const width = 500;
            const height = 400;

            let x;
            let y;

            if(index % 2 === 0) {
                x = screenLeft;
            } else {
                x = screenLeft + screen.width - width;
            }

            if(index < 2) {
                y = top;
            } else {
                y = screen.height - height - top;
            }

            let devices = [];
            const device = {};
            device.num = Number(id);
            device.location = {x, y};
            device.size = {w: width, h: height};
            devices.push(device);

            ids.forEach((deviceId, deviceIndex) => {

                if(deviceIndex === index) return;

                const device = {};
                device.num = Number(id);
                device.size = {w: width, h: height};
                devices.push(device);

            });



            const cctvData = {
                "request":{
                    "method":"popup",
                    "mode":type,  //live or playback
                    "ptz" : 0,
                    "devices":devices,
                    "client":{
                        "ip": VMS_CLIENT_IP,
                        "port": 11086,
                        "layout":1
                    }
                }
            }

            if(time) {
                cctvData.request.datetime = time;
            }

            cctvPlayerWebsocket.send(JSON.stringify(cctvData));
        })
    },
    cctvPlayerClose() {
        const cctvData = {
            "request":{
                "method":"close",
            }
        }
        cctvPlayerWebsocket.send(JSON.stringify(cctvData));
    },
    // 테스트 방법
    // CctvEventHandler.cctvLiveSendByVMSClient([1]);
    cctvLiveSendByVMSClient(ids) {

        //VMS 클라이언트에서 CCTV 띄우기

        const cctvData = {
            "request": {
                "command": "open",
                "method": "live",
                "devices": [],
                "ip": VMS_CLIENT_IP,
                "port": 11086,
                "layout": 2
                //TODO datetime 추가
            }
        };
        cctvData.request.devices = ids;

        cctvPlayerWebsocket.send(JSON.stringify(cctvData));
    },
    cctvLiveCloseSendByVMSClient() {

        //VMS 클라이언트에서 CCTV 띄우기

        const cctvData = {
            "request": {
                "command": "close",
            }
        };
        cctvPlayerWebsocket.send(JSON.stringify(cctvData));
    },

}


