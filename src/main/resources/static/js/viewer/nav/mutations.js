'use strict';
(() => {

    const observerWeatherWrap = () => {
        const mutationCallback = (mutationRecordList) => {
            mutationRecordList
                .filter(mutationRecord => mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'class')
                .forEach(mutationRecord => {
                    const mutationTarget = mutationRecord.target;
                    const weatherLayerPopup = document.getElementById('weatherLayerPopup');
                    const dimmed = document.querySelector('.dimmed');

                    if(mutationTarget.classList.contains('active')) {
                        weatherLayerPopup.classList.add('open');

                        const timezoneOffset = new Date().getTimezoneOffset() * 60000;
                        const nowDate = new Date(Date.now() - timezoneOffset).toISOString().split('T')[0];
                        document.querySelector('.popup-content.weather .calendar [name=weather-finish]').setAttribute('value', nowDate);
                        document.querySelector('.popup-content.weather .calendar [name=weather-start]').setAttribute('value', nowDate);
                        dimmed.classList.add('show');
                        popup.createWeatherPopup();
                        return false;
                    }
                    weatherLayerPopup.classList.remove('open');
                    dimmed.classList.remove('show');
                });
        }

        const weatherWrap = document.getElementById('weatherWrap');
        const weatherWrapObserver = new MutationObserver(mutationCallback);
        weatherWrapObserver.observe(weatherWrap, {attributes: true});
    }

    const observerEarthquake = () => {
        const mutationCallback = (mutationRecordList) => {
            mutationRecordList
                .filter(mutationRecord => mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'class')
                .forEach(mutationRecord => {
                    const mutationTarget = mutationRecord.target;
                    const earthquakeLayerPopup = document.getElementById('earthquakeLayerPopup');
                    const dimmed = document.querySelector('.dimmed');
                    if (mutationTarget.classList.contains('active')) {
                        earthquakeLayerPopup.classList.add('open');
                        const earthquakeTable = document.querySelector('.popup-table.earthquake tbody');
                        earthquakeTable.querySelector('.selected-row')?.classList.remove('selected-row');
                        earthquakeTable.querySelector(':first-child').dispatchEvent(new Event('click'))
                        dimmed.classList.add('show');
                        return false;
                    }
                    earthquakeLayerPopup.classList.remove('open');
                    dimmed.classList.remove('show');
                });
        }
        const btnEarthquake = document.getElementById('btnEarthquake');
        const btnEarthquakeObserver = new MutationObserver(mutationCallback);
        btnEarthquakeObserver.observe(btnEarthquake, {attributes: true});
    }

    const observerNotepad = () => {
        const mutationCallback = (mutationRecordList) => {
            mutationRecordList
                .filter(mutationRecord => mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'class')
                .forEach(mutationRecord => {
                    const mutationTarget = mutationRecord.target;
                    const notepadBox = document.getElementById('notepadBox');

                    if(mutationTarget.classList.contains('active')) {
                        const value = localStorage.getItem('NOTEPAD');

                        notepadBox.classList.add('open');
                        notepadBox.querySelector('TEXTAREA').value = value;
                        return false;
                    }
                    notepadBox.classList.remove('open');
                });
        }
        const btnNotepad = document.getElementById('btnNotepad');
        const btnNotepadObserver = new MutationObserver(mutationCallback);
        btnNotepadObserver.observe(btnNotepad, {attributes: true});
    }

    const observerUser = () => {
        const mutationCallback = (mutationRecordList) => {
            mutationRecordList
                .filter(mutationRecord => mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'class')
                .forEach(mutationRecord => {
                    const userBox = document.getElementById('userBox');
                    const mutationTarget = mutationRecord.target;
                    if(mutationTarget.classList.contains('active')) {
                        userBox.classList.add('open');
                        return false;
                    }

                    userBox.classList.remove('open');
                });
        }
        const btnUser = document.getElementById('btnUser');
        const btnUserObserver = new MutationObserver(mutationCallback);
        btnUserObserver.observe(btnUser, {attributes: true});
    }

    const observerWeatherDate = () => {
        const mutationCallback = (mutationRecordList) => {
            mutationRecordList
                .filter(mutationRecord => mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'value')
                .forEach(mutationRecord => {
                    const mutationTarget = mutationRecord.target;
                    const mutationTargetDate = new Date(mutationTarget.value);

                    if (mutationTarget.id === 'start') {
                        const endDate = document.getElementById('finish');
                        endDate.setAttribute('min', mutationTarget.value);
                        endDate.setAttribute('max', new Date(mutationTargetDate.setFullYear(mutationTargetDate.getFullYear() + 1)).toISOString().split('T')[0]);
                    } else {
                        const startDate = document.getElementById('start');
                        startDate.setAttribute('max', mutationTarget.value);
                        startDate.setAttribute('min', new Date(mutationTargetDate.setFullYear(mutationTargetDate.getFullYear() - 1)).toISOString().split('T')[0]);
                    }
                });
        }


        const inputObserver = new MutationObserver(mutationCallback);
        document.querySelectorAll('.popup-content.weather .calendar input').forEach(input => {
            inputObserver.observe(input, {
                attributes: true,
                attributeFilter: ['value']
            });
        });
    }

    const observerPoiCategoryWrap = () => {
        const mutationCallback = (mutationRecordList) => {
            mutationRecordList
                .filter(mutationRecord => mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'class')
                .forEach(mutationRecord => {
                    const mutationTarget = mutationRecord.target;
                    const poiCategoryBox = document.getElementById('poiCategoryBox');

                    if(mutationTarget.classList.contains('active')) {
                        poiCategoryBox.classList.add('open');
                        return;
                    }
                    poiCategoryBox.classList.remove('open');
                });
        }
        const poiCategoryButton = document.getElementById('poiCategoryButton');
        const poiCategoryObserver = new MutationObserver(mutationCallback);
        poiCategoryObserver.observe(poiCategoryButton, {attributes: true});
    }

    observerWeatherWrap();
    observerEarthquake();
    observerNotepad();
    observerUser();
    observerWeatherDate();
    observerPoiCategoryWrap();
})();