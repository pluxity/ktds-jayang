'use strict';
const Cron = (() => {

    let mainInterval;
    let cronJobs = [];

    const initialize = (event) => {
        mainInterval = setInterval(fnCronjob, 1000);
    }

    const cronFilter = (cronjob) => {

        const cron = cronjob.cron;
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const second = now.getSeconds();
        const week = now.getDay();

        const cronArray = cron.split(' ');
        const cronYear = cronArray[5];
        const cronMonth = cronArray[4];
        const cronDay = cronArray[3];
        const cronHour = cronArray[2];
        const cronMinute = cronArray[1];
        const cronSecond = cronArray[0];

        if(cronYear !== '*' && cronYear !== year.toString()) return false;
        if(cronMonth !== '*' && cronMonth !== month.toString()) return false;
        if(cronDay !== '*' && cronDay !== day.toString()) return false;
        if(cronHour !== '*' && cronHour !== hour.toString()) return false;
        if(cronMinute !== '*' && cronMinute !== minute.toString()) return false;
        if(cronSecond !== '*' && cronSecond !== second.toString()) return false;

        return true;
    }

    const fnCronjob = (cron, event) => {
        cronJobs
            .filter(cronFilter)
            .forEach((cronjob) => { if(cronjob.callback) cronjob.callback() });
    }

    const addCronjob = (cron, callback) => {
        // Cron job 포맷: second, minute, hour, day of month, month, year
        // 0 0 0 1 1 * => 매년 1월 1일 0시 0분 0초
        cronJobs.push({ cron, callback })
    }

    const getCronJobs = () => {
        return cronJobs;
    }

    initialize();

    return {
        addCronjob,
        getCronJobs
    }
})();