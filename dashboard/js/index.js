window.addEventListener('DOMContentLoaded', function(){
    // Toast
    let toast = document.querySelector('.toast');
    let toastCloseBtn = document.querySelector('.toast__close');
    
    toast.classList.add('toast--active');
    toastCloseBtn.addEventListener('click', function() {
        toast.classList.remove('toast--active');
    });
});

/* Header */
const profileBtn = document.querySelectorAll(".profile .profile__btn");
profileBtn.forEach(function(btns){ 
    btns.addEventListener ("click", function() { 
        btns.classList.toggle('profile__btn--active');
    });
})

/* POI Menu */
function PoiMenuAll() {
    const PoiAll = document.querySelector(".poi-menu__all .all a");
    const poiAllPopup = document.querySelector(".poi-menu__all .popup-basic--group");

    PoiAll.addEventListener ("click", function() { 
        if (poiAllPopup.style.display === "none") {
            PoiAll.classList.add('active');
            poiAllPopup.style.display = "block";
          } else {
            PoiAll.classList.remove('active');
            poiAllPopup.style.display = "none";
          }
    }); 
  }
  PoiMenuAll();
  


  