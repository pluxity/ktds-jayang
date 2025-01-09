'use strict';
// TODO Mutation 이나 상태 관리가 필요하면 것들 넣으세요

(() => {
    const observerRecentWrap = () => {
        const mutationCallback = (mutationRecordList) => {
            mutationRecordList
                .filter((mutationRecord) => mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'class')
                .forEach((mutationRecord) => {
                    const mutationTarget = mutationRecord.target;
                    const recentLayerPopup = document.getElementById('recentLayerPopup');

                    if (mutationTarget.classList.contains('active')) {
                        recentLayerPopup.classList.add('open');

                        document.querySelector('.event-list li.on').classList.remove('on');
                        document.querySelector('.event-list li[data-event-level="total"]').classList.add('on');
                        popup.updateRecentEventList(EventDataManager.findEventByEventLevel('latest', 'total'));

                        return false;
                    }
                    recentLayerPopup.classList.remove('open');
                });
        };

        const btnRecentEvent = document.querySelector(
            '.latest-event .btn-latest-event',
        );
        const recentWrapObserver = new MutationObserver(mutationCallback);
        recentWrapObserver.observe(btnRecentEvent, {attributes: true});
    };

    const observerSidebar = () => {
        const mutationCallback = (mutationRecordList) => {
            mutationRecordList
                .filter((mutationRecord) => mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'class')
                .forEach((mutationRecord) => {
                    const mutationTarget = mutationRecord.target;
                    const sidebarLayerPopup = document.getElementById('sidebarLayerPopup');

                    const isActive = mutationTarget.classList.contains('active');
                    const isEvaluationMenu = mutationTarget.dataset.menu === 'evaluation';
                    const isEsopMenu = mutationTarget.dataset.menu === 'e-sop';

                    if (isActive && !isEvaluationMenu && !isEsopMenu) {
                        sidebarLayerPopup.classList.add('open');
                        return false;
                    }
                    sidebarLayerPopup.classList.remove('open');
                });
        };

        const sidebarWrap = document.querySelectorAll('.sidebar-wrap');
        const sidebarWrapObserver = new MutationObserver(mutationCallback);
        sidebarWrap.forEach((sidebar) => {
            sidebarWrapObserver.observe(sidebar, {attributes: true});
        });
    };
    const observerDate = () => {
        const mutationCallback = (mutationRecordList) => {
            mutationRecordList
                .filter(mutationRecord => mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'value')
                .forEach(mutationRecord => {
                    const mutationTarget = mutationRecord.target;
                    const mutationTargetDate = new Date(mutationTarget.value);

                    const convertDate = new Date(mutationTargetDate.getTime() - mutationTargetDate.getTimezoneOffset() * 60000).toISOString().slice(0, -5);

                    if (mutationTarget.id === 'eventStart') {
                        const endDate = document.getElementById('eventFinish');
                        endDate.setAttribute('min', convertDate);
                    } else {
                        const startDate = document.getElementById('eventStart');
                        startDate.setAttribute('max', convertDate);
                    }
                });
        }

        const inputObserver = new MutationObserver(mutationCallback);
        document.querySelectorAll('.event-container input[type=datetime-local]').forEach(input => {
            inputObserver.observe(input, {
                attributes: true,
                attributeFilter: ['value']
            });
        });
        const sidebarWrap = document.querySelectorAll('.sidebar-wrap');
        const sidebarWrapObserver = new MutationObserver(mutationCallback);
        sidebarWrap.forEach((sidebar) => {
            sidebarWrapObserver.observe(sidebar, {attributes: true});
        });
    };

    const observerFloor = () => {

        const mutationCallback = (mutationRecordList) => {
            mutationRecordList
                .filter((mutationRecord) => mutationRecord.type === 'attributes' || mutationRecord.attributeName === 'class')
                .forEach((mutationRecord) => {
                    const mutationTarget = mutationRecord.target;
                    const targetValue = mutationTarget.dataset.floorName;

                    document.querySelectorAll("div.left-information > div.floor > ul li").forEach((li) => {
                        li.classList.remove("on");

                        if (li.dataset.floorName === targetValue) {
                            li.classList.add("on");
                            document.querySelector("div.left-information > div.floor > div > span.txt").innerHTML = li.innerHTML;
                        }

                    });


                });
        };

        const floorChangeBox = document.querySelector("div.left-information > div.floor");
        const floorChangeBoxObserver = new MutationObserver(mutationCallback);
        floorChangeBoxObserver.observe(floorChangeBox, {attributes: true});

    }

    // observerFloor();
    // observerRecentWrap();
    observerSidebar();
    observerDate();
})();
