document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('.sidebar-brand').style.display = 'none';
    document.querySelectorAll('.sidebar-header').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            let el = header.nextElementSibling;
            while (el && !el.classList.contains('sidebar-header')) {
                el.style.display = (el.style.display === 'none') ? '' : 'none';
                el = el.nextElementSibling;
            }
        });
    });
});