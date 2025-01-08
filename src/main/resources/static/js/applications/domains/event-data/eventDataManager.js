const EventDataManager = (() => {
    const eventList = {
        search: [],
        latest: [],
    };

    const getEventListByDate = (type, startDate, endDate) => {
        const params = {
            startDate,
            endDate
        }
        return new Promise((resolve) => {
            api.get('/event-data/getDateTimeBetween', {params}).then((result) => {
                const { result: data } = result.data;
                const events = [];
                data.forEach(event => {
                    const eventData = new EventData(event);
                    eventData.setDetails(event);
                    events.push(eventData);
                })

                eventList[`${type}`] = events;
                resolve(eventList[`${type}`]);
            });
        })
    }

    const findEventListAll = (type) => {
        return eventList[`${type}`];
    }

    const findEventById = (type, eventId) => {
        return eventList[`${type}`].find((event) => event.id === Number(eventId));
    }

    const findEventByEventLevel = (type, level) => {
        if(level === 'total') {
            return eventList[`${type}`];
        }

        return eventList[`${type}`].filter(event => event.eventLevel.toLowerCase() === level);
    }

    const addLatestEventList = (event) => {
        event.setDetails(event);
        eventList['latest'].unshift(event);
        TimerHandler.addTimer(event);

        return event;
    }
    const removeLatestEventList = (eventId) => {
        eventList['latest'] = eventList['latest'].filter((event) => event.id !== Number(eventId));
    }

    const filteringEventList = (type, params) => {
        if (params.deviceType !== '') {
            if(params.deviceType.toLowerCase() === 'fire_sensor') {
                eventList[type] = eventList[type].filter((event) => {
                    return event.deviceType.toLowerCase() === params.deviceType.toLowerCase() && event.eventLevel.toLowerCase() !== 'warning'
                });
            } else if(params.deviceType.toLowerCase() === 'cctv') {
                eventList[type] = eventList[type].filter((event) => {
                    return event.deviceType.toLowerCase() === params.deviceType.toLowerCase() && event.eventLevel.toLowerCase() !== 'missing'
                });
            }
        }

        if (params.eventLevel !== '') {
            eventList[type] = eventList[type].filter((event) => event.eventLevel.toLowerCase() === params.eventLevel.toLowerCase());
        }

        if (params.searchValue !== '') {
            eventList[type] = eventList[type].filter((event) => {
                 return event.deviceName?.toLowerCase().includes(params.searchValue.toLowerCase())
                || event.eventType.toLowerCase().includes(params.searchValue.toLowerCase())
            });
        }

        return eventList[type];
    }

    return {
        getEventListByDate,
        findEventListAll,
        findEventById,
        findEventByEventLevel,
        addLatestEventList,
        removeLatestEventList,
        filteringEventList
    }
})();