'use strict';
(() => {

    const handleClickLogo = (event) => {
        // popup.closeAllPopup();
        // Init.initializeOutdoorBuilding();
        location.reload(true);
    }
    const handleClickAdmin = (event) => {
        window.open('/admin/building/outdoor')
    }
    const handleClickCCTVDownload = (event) => {
        const fileUrl = '/static/cctvplayer/Setup_VoostAppService.exe';

        const link = document.createElement('a');
        link.href = fileUrl;

        link.download = 'Setup_VoostAppService.exe';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    }

    const toggleActive = (event) => {
        const target = event.currentTarget;
        if(!target.classList.contains('active')) {
            popup.closeAllPopup();
        }
        target.classList.toggle('active');
    }

    const deactivateTarget = (event) => {
        const target = event.currentTarget;
        const targetId = target.closest('.layer-popup').getAttribute('data-deactivate-target');
        const deactivationTarget = targetId.includes('-')
            ? document.querySelectorAll(`.${targetId}`)
            : document.getElementById(targetId);

        deactivationTarget.length > 1
            ? deactivationTarget.forEach((targetClass) => {
                targetClass.classList.remove('active');
            })
            : deactivationTarget.classList.remove('active');
        Px.VirtualPatrol.Clear();
    }

    const saveNotepad = () => {
        const textArea = document.getElementById('notepad');
        localStorage.setItem('NOTEPAD', textArea.value);

        const btnNotepad = document.getElementById('btnNotepad');
        btnNotepad.classList.remove('active');
    }

    // NAVBAR 버튼
    document.getElementById('logo').addEventListener('click', handleClickLogo);
    document.querySelector('.admin-button').addEventListener('click', handleClickAdmin);
    document.querySelector('.download-button').addEventListener('click', handleClickCCTVDownload);
    document.getElementById('weatherWrap').addEventListener('click', toggleActive);
    document.getElementById('btnEarthquake').addEventListener('click', toggleActive);
    document.getElementById('btnNotepad').addEventListener('click', toggleActive);
    document.getElementById('btnUser').addEventListener('click', toggleActive);
    document.getElementById('recentWrap').addEventListener('click', toggleActive);
    document.getElementById('poiCategoryButton').addEventListener('click', toggleActive);


    // 팝업 버튼
    document.getElementById('btnSaveNotepad').addEventListener('click', saveNotepad);
    document.querySelectorAll('.close-button')
        .forEach(element => {
            element.addEventListener('click', deactivateTarget);
        });

    // document.querySelector('.popup-content.weather .calendar .button').addEventListener('click', () => popup.createWeatherPopup());

})();
