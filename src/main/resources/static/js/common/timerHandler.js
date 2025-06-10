'use strict';
const TimerHandler = (() => {
    let timers = [];

    const addTimer = (event, callback) => {
        const endTime = new Date(new Date(event.datetime).getTime() + (24 * 60 * 60 * 1000));
        const timeout = endTime.getTime() - new Date().getTime();
        const timer = setTimeout(() => {
            removeTimer(timer, event);
            if(callback) callback();
        }, timeout);
        timers.push(timer);
        return timer;
    }

    const removeTimer = (timer, event) => {
        clearTimeout(timer);
        timers = timers.filter((t) => t !== timer);
        EventListHandler.removeLatestEvent(event);
    }

    const getTimers = () => {
        return timers;
    }
    return {
        addTimer,
        removeTimer,
        getTimers
    }
})();