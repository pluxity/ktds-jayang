/* Kiosk List Slider */
function KioskListSlider() {
    const listContainer = document.querySelector('.kiosk-list__info .list');
    const prevButton = document.querySelector('.kiosk-list__button--left');
    const nextButton = document.querySelector('.kiosk-list__button--right');
    const pagingContainer = document.querySelector('.kiosk-list__paging');
    
    let currentIndex = 0;
    let slides = [];
    
    let touchStartX = 0;
    let touchEndX = 0;
    let isTouching = false;
    let hasMoved = false;
    const minSwipeDistance = 50; 
    
    // 슬라이드 초기화 함수
    function initSlides() {
        slides = Array.from(listContainer.children).filter(child => child.tagName.toLowerCase() === 'ul');
        
        if (pagingContainer) {
            const pagingButtons = pagingContainer.querySelectorAll('.button');
            
            if (pagingButtons.length !== slides.length) {
                pagingContainer.innerHTML = '';
                slides.forEach((_, index) => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = index === currentIndex ? 'button button--active' : 'button';
                    
                    const span = document.createElement('span');
                    span.className = 'hide';
                    span.textContent = `page${index + 1}`;
                    
                    button.appendChild(span);
                    button.addEventListener('click', () => goToSlide(index));
                    
                    pagingContainer.appendChild(button);
                });
            } else {
                pagingButtons.forEach((button, index) => {
                    button.addEventListener('click', () => goToSlide(index));
                });
            }
        }
        
        if (slides.length <= 1) {
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            if (pagingContainer) pagingContainer.style.display = 'none';
        } 
        
        updateSlides();
    }
    
    function updateSlides() {
        slides.forEach((slide, index) => {
            if (index === currentIndex) {
                slide.style.display = '';
            } else {
                slide.style.display = 'none';
            }
        });
        
        if (pagingContainer) {
            const pagingButtons = pagingContainer.querySelectorAll('.button');
            pagingButtons.forEach((button, index) => {
                if (index === currentIndex) {
                    button.classList.add('button--active');
                } else {
                    button.classList.remove('button--active');
                }
            });
        }
    }
    
    function goToSlide(index) {
        if (index < 0) {
            currentIndex = slides.length - 1;
        } else if (index >= slides.length) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }
        
        updateSlides();
    }
    
    // 슬라이드 동작
    function goToPrevSlide() {
        goToSlide(currentIndex - 1);
    }
    
    function goToNextSlide() {
        goToSlide(currentIndex + 1);
    }
    
    // 터치 동작
    function handleTouchStart(e) {
        isTouching = true;
        hasMoved = false; 
        touchStartX = e.touches[0].clientX;
    }
    
    function handleTouchMove(e) {
        if (!isTouching) return;
        touchEndX = e.touches[0].clientX;
        
        if (Math.abs(touchEndX - touchStartX) > 10) {
            hasMoved = true;
        }
    }
    
    function handleTouchEnd(e) {
        if (!isTouching) return;
        
        if (hasMoved) {
            const swipeDistance = touchEndX - touchStartX;
            if (Math.abs(swipeDistance) >= minSwipeDistance) {
                if (swipeDistance > 0) {
                    goToPrevSlide();
                } else {
                    goToNextSlide();
                }
                
                e.preventDefault();
                e.stopPropagation();
            }
        }
        
        // 터치 상태 및 위치 초기화
        isTouching = false;
        hasMoved = false;
        touchStartX = 0;
        touchEndX = 0;
    }
    
    // 클릭 이벤트와 터치 이벤트 구분
    function handleTouchCancel() {
        isTouching = false;
        hasMoved = false;
        touchStartX = 0;
        touchEndX = 0;
    }
    
    if (prevButton) {prevButton.addEventListener('click', goToPrevSlide);}
    
    if (nextButton) {nextButton.addEventListener('click', goToNextSlide);}
    
    if (listContainer) {
        listContainer.addEventListener('touchstart', handleTouchStart);
        listContainer.addEventListener('touchmove', handleTouchMove);
        listContainer.addEventListener('touchend', handleTouchEnd);
        listContainer.addEventListener('touchcancel', handleTouchCancel);
        
        const listItems = listContainer.querySelectorAll('li');
        listItems.forEach(item => {
            item.addEventListener('click', function(e) {
                if (hasMoved) {
                    e.stopPropagation();
                }
            });
        });
    }
    
    initSlides();
}
KioskListSlider();

function KiostListLayer(){
   const locationButtons = document.querySelectorAll('.button--location');
   const kioskLayer = document.querySelector('.kiosk-layer');
   const kioskLayerClose = document.querySelector('.kiosk-layer__close');
   
   if (locationButtons.length > 0) {
       locationButtons.forEach(button => {
           button.addEventListener('click', function() {
               kioskLayer.style.display = 'block';
           });
       });
   }
   if (kioskLayerClose) {
       kioskLayerClose.addEventListener('click', function() {
           kioskLayer.style.display = 'none';
       });
   }
}
KiostListLayer();

function kioskTabs() {
    // 상단 탭 
    const tabItems = document.querySelectorAll('.kiosk-list__tab > li');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            tabItems.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 하단 탭
    const footerTabs = document.querySelectorAll('.kiosk-footer__buttons > button');
    const footerContents = document.querySelectorAll('.kiosk-footer__contents');
    
    footerTabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            footerTabs.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            footerContents.forEach(content => content.style.display = 'none');
            if (footerContents[index]) {
                footerContents[index].style.display = 'block';
            }
        });
    });
}
kioskTabs();