/* Toast */
function Toast(){
    let toast = document.querySelector('.toast');
    let toastCloseBtn = document.querySelector('.toast__close');
    if(toast){
        toast.classList.add('toast--active');
        toastCloseBtn.addEventListener('click', function() {
            toast.classList.remove('toast--active');
        });
    }
}
Toast();

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
    const poiAllPopup = document.querySelector(".poi-menu__all .popup-basic--small");

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


  /* Event State */
  function EventState(){
    const eventStateCtrl = document.querySelector('.event-state__ctrl');
    const eventStateLayer = document.querySelector('.event-state');
    const floorInfo = document.querySelector('.floor-info');
    const toolBox = document.querySelector('.tool-box');

    if(eventStateLayer){
        eventStateCtrl.addEventListener('click', function () {
            eventStateLayer.classList.toggle('event-state--active');
            
            if (eventStateLayer.classList.contains('event-state--active')) {
                toolBox.classList.add('tool-box--active');
                floorInfo.classList.add('floor-info--active');
            } else {
                toolBox.classList.remove('tool-box--active');
                floorInfo.classList.remove('floor-info--active');
            }
        });

    }
  }
  EventState();

  