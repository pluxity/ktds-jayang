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

// 무재해 현황 카운팅
const CountTimer = (() => {

    let _startDate;

    const initialize = () => {
        try {
            render();

            Cron.addCronjob('0 0 8 * * *', render);
        } catch (exception) {
            console.error(exception);
        }
    }

    const render = () => {

        const currentDate = new Date();
        const startDate = new Date(_startDate);

        const count = Math.floor((currentDate - startDate) / (60 * 60 * 24 * 1000));
        const countString = count > 9999 ? '9999' : count.toString();

        const countStringArray = countString.split('');
        countStringArray.reverse().forEach((count, index) => {
            document.querySelector(`.counter > STRONG[data-count-array-index="${index}"]`).innerHTML = count;
        }, false);
    }

    return {
        setStartDate: (startDate) => { _startDate = startDate },
        initialize,
        render
    }
})();