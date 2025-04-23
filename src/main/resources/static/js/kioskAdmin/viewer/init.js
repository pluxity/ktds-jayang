'use strict';

(async function () {
    const cookieMatch = document.cookie.match('(^|;) ?USER_ID=([^;]*)(;|$)');
    const USER_ID = cookieMatch ? cookieMatch[2] : null;
    console.log("USER_ID = ",USER_ID);

    if (!USER_ID || USER_ID !== 'kiosk') {
        window.location.href = '/kiosk-login';
    }
    api.get(`/kiosk-user/userid/${USER_ID}`).then((result) => {
        const {result: data} = result.data;
        document.getElementById("userId").value = data;
    });
})();