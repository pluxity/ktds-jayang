(async () => {
    const eventSource = new EventSource(`${location.origin.replace(location.port, EVENT_SERVER_PORT)}/sse`);

    eventSource.onopen = (e) => {
    }

    eventSource.onerror = (e) => {
        console.log('onerror', e)
    }

    eventSource.onmessage = async (e) => {
        const {data} = e;
        if (data) {
            const {eventType, eventLevel, data: targetData, eventData} = JSON.parse(data);

            if(eventType === 'DISASTER_FREE_DATE') {
                CountTimer.setStartDate(targetData);
                CountTimer.render();
                return;
            }

            if (eventType === 'TMS') {
                await TmsEventHandler.executeEvent(eventData);
                return;
            }
            EventListHandler.addLatestEvent(eventLevel, eventData);
            if (eventType === 'FIRE_SENSOR') {
                await FireSensorEventHandler.executeEvent(eventLevel, targetData);
            } else if (eventType === 'CCTV') {
                const { eventType } = eventData;
                const vmsEventUsage = VmsEventUsageManager.findByName(eventType);
                if(vmsEventUsage.useYn) {
                    eventData.vmsEventData = vmsEventUsage;
                    CctvEventHandler.executeEvent(eventLevel, eventData);
                }
            } else if (eventType === 'FIRE_SENSOR_ERROR') {
                await FireSensorEventHandler.missingEvent(eventData.deviceId);
            }
        }
    }


})();

const EventListHandler = (() => {
    const addLatestEvent = (eventLevel, eventData) => {
        if (!eventData) {
            return;
        }

        const eventLevelCnts = document.querySelectorAll(`.latest-event > .count-area > div[data-event-level='${eventLevel.toLowerCase()}'] span.value, 
            #recentLayerPopup .event-list li[data-event-level='${eventLevel.toLowerCase()}'] span.value`);
        eventLevelCnts.forEach(count => count.innerText = Number(count.innerText) + 1);

        const eventLevelTotals = document.querySelectorAll(`.latest-event > .count-area > div[data-event-level='total'] span.value, 
            #recentLayerPopup .event-list li[data-event-level='total'] span.value`);
        eventLevelTotals.forEach(count => count.innerText = Number(count.innerText) + 1);

        const newData = EventDataManager.addLatestEventList(new EventData(eventData));
        popup.newRecentEvent(newData);

    }

    const removeLatestEvent = (event) => {
        const eventLevelCnts = document.querySelectorAll(`.latest-event > .count-area > div[data-event-level='${event.eventLevel.toLowerCase()}'] span.value, 
            #recentLayerPopup .event-list li[data-event-level='${event.eventLevel.toLowerCase()}'] span.value`);
        eventLevelCnts.forEach(count => count.innerText = Number(count.innerText) - 1);

        const eventLevelTotals = document.querySelectorAll(`.latest-event > .count-area > div[data-event-level='total'] span.value, 
            #recentLayerPopup .event-list li[data-event-level='total'] span.value`);
        eventLevelTotals.forEach(count => count.innerText = Number(count.innerText) - 1);

        EventDataManager.removeLatestEventList(event.id);

        document.querySelector(`#recentLayerPopup .recent-tbody tr[data-event-id='${event.id}']`)?.remove();
    }

    const clickEventList = (eventData, type) => {
        const { deviceType, deviceId, eventLevel, eventType, deviceName, location } = eventData;

        if(deviceName === undefined || location === undefined) return;

        if(deviceType.toLowerCase() === 'cctv') {
            eventData.vmsEventData = VmsEventUsageManager.findByName(eventType);
            if(type === 'latest') {
                CctvEventHandler.executeEvent(eventLevel, eventData, true, false);
            } else {
                CctvEventHandler.executeEvent(eventLevel, eventData, true);
            }
        } else if(deviceType.toLowerCase() === 'fire_sensor') {
            if(eventLevel.toLowerCase() === 'danger') {
                PoiManager.getFireSensorCurrentData(deviceId).then(async(currentData) => {
                    if(type === 'latest') {
                        await FireSensorEventHandler.executeEvent(eventLevel, currentData.data , true, false);
                    } else {
                        await FireSensorEventHandler.executeEvent(eventLevel, currentData.data , true);
                    }
                })
            } else if(eventLevel.toLowerCase() === 'missing') {
                if(type === 'latest') {
                    FireSensorEventHandler.missingEvent(deviceId, true, false);
                } else {
                    FireSensorEventHandler.missingEvent(deviceId, true);
                }
            }
        }
    }

    return {
        addLatestEvent,
        removeLatestEvent,
        clickEventList
    }
})();