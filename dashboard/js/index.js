window.addEventListener('DOMContentLoaded', function(){
    // Toast
    let toast = document.querySelector('.toast');
    let toastCloseBtn = toast.querySelector('.toast__close');
    
    toast.classList.add('toast--active');
    toastCloseBtn.addEventListener('click', function() {
        toast.classList.remove('toast--active');
    });
});


