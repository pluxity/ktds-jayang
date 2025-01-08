const _CURRENT_URL = window.location.pathname;
(function() {
    // 관리자 좌측 메뉴 처리
    document.querySelectorAll('#sidebar  ul > li.sidebar-item').forEach( elem => {
        if(elem.querySelector('.sidebar-link').getAttribute("href") === _CURRENT_URL) {
            elem.classList.add('active');
        } else {
            elem.classList.remove('active');
        }
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    }, true);

})();