function KioskListSlider() {
    const listContainer = document.querySelector('.kiosk-list__info .list');
    const prevButton = document.querySelector('.kiosk-list__button--left');
    const nextButton = document.querySelector('.kiosk-list__button--right');
    const pagingContainer = document.querySelector('.kiosk-list__paging');
    
    let currentPage = 0;
    let allItems = [];
    let itemsPerPage = 10; // 기본값, 화면 방향에 따라 변경됨
    let pageCount = 0;
    
    let touchStartX = 0;
    let touchEndX = 0;
    let isTouching = false;
    let hasMoved = false;
    const minSwipeDistance = 50; 
    
    // 화면 방향에 따라 페이지당 아이템 수 결정
    function updateItemsPerPage() {
        const isLandscape = window.matchMedia('(orientation: landscape)').matches;
        itemsPerPage = isLandscape ? 10 : 6; // 가로형: 5x2=10, 세로형: 3x2=6
        return itemsPerPage;
    }
    
    // 슬라이드 초기화 함수
    function initSlides() {
        if (!listContainer) return;
        
        const itemsList = listContainer.querySelector('ul');
        if (!itemsList) return;
        
        // 메인 리스트 아이템만 선택 (list__footer의 li는 제외)
        allItems = Array.from(itemsList.querySelectorAll('li')).filter(item => 
            !item.closest('.list__footer')
        );
        
        updateItemsPerPage();
        pageCount = Math.ceil(allItems.length / itemsPerPage);
        
        // 페이징 버튼 생성
        if (pagingContainer) {
            pagingContainer.innerHTML = '';
            for (let i = 0; i < pageCount; i++) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = i === currentPage ? 'button button--active' : 'button';
                
                const span = document.createElement('span');
                span.className = 'hide';
                span.textContent = `page${i + 1}`;
                
                button.appendChild(span);
                button.addEventListener('click', () => goToSlide(i));
                
                pagingContainer.appendChild(button);
            }
        }
        
        // 버튼 표시 여부
        if (pageCount <= 1) {
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            if (pagingContainer) pagingContainer.style.display = 'none';
        } else {
            if (prevButton) prevButton.style.display = '';
            if (nextButton) nextButton.style.display = '';
            if (pagingContainer) pagingContainer.style.display = '';
        }
        
        updateSlides();
    }
    
    function updateSlides() {
        if (!listContainer) return;
        
        const startIdx = currentPage * itemsPerPage;
        const endIdx = Math.min(startIdx + itemsPerPage, allItems.length);
        
        // 모든 메인 아이템 숨김 (list__footer의 li는 제외)
        allItems.forEach(item => {
            item.style.display = 'none';
        });
        
        // 현재 페이지 아이템만 표시
        for (let i = startIdx; i < endIdx; i++) {
            allItems[i].style.display = '';
        }
        
        // 페이징 버튼 상태 업데이트
        if (pagingContainer) {
            const pagingButtons = pagingContainer.querySelectorAll('.button');
            pagingButtons.forEach((button, index) => {
                if (index === currentPage) {
                    button.classList.add('button--active');
                } else {
                    button.classList.remove('button--active');
                }
            });
        }
    }
    
    function goToSlide(index) {
        if (index < 0) {
            currentPage = pageCount - 1;
        } else if (index >= pageCount) {
            currentPage = 0;
        } else {
            currentPage = index;
        }
        
        updateSlides();
    }
    
    // 슬라이드 동작
    function goToPrevSlide() {
        goToSlide(currentPage - 1);
    }
    
    function goToNextSlide() {
        goToSlide(currentPage + 1);
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
    
    if (prevButton) {
        prevButton.addEventListener('click', goToPrevSlide);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', goToNextSlide);
    }
    
    if (listContainer) {
        listContainer.addEventListener('touchstart', handleTouchStart);
        listContainer.addEventListener('touchmove', handleTouchMove);
        listContainer.addEventListener('touchend', handleTouchEnd);
        listContainer.addEventListener('touchcancel', handleTouchCancel);
        
        // 메인 리스트 아이템만 선택 (list__footer의 li는 제외)
        const listItems = Array.from(listContainer.querySelectorAll('li')).filter(item => 
            !item.closest('.list__footer')
        );
        
        listItems.forEach(item => {
            item.addEventListener('click', function(e) {
                if (hasMoved) {
                    e.stopPropagation();
                }
            });
        });
    }
    
    // 화면 방향 변경 감지
    window.addEventListener('resize', function() {
        const oldItemsPerPage = itemsPerPage;
        updateItemsPerPage();
        
        // 아이템 수가 변경되면 슬라이드 재초기화
        if (oldItemsPerPage !== itemsPerPage) {
            const oldPageCount = pageCount;
            pageCount = Math.ceil(allItems.length / itemsPerPage);
            
            // 현재 페이지가 새 페이지 수를 초과하면 조정
            if (currentPage >= pageCount) {
                currentPage = pageCount - 1;
            }
            
            // 페이지 수가 변경되면 페이징 버튼 재생성
            if (oldPageCount !== pageCount) {
                if (pagingContainer) {
                    pagingContainer.innerHTML = '';
                    for (let i = 0; i < pageCount; i++) {
                        const button = document.createElement('button');
                        button.type = 'button';
                        button.className = i === currentPage ? 'button button--active' : 'button';
                        
                        const span = document.createElement('span');
                        span.className = 'hide';
                        span.textContent = `page${i + 1}`;
                        
                        button.appendChild(span);
                        button.addEventListener('click', () => goToSlide(i));
                        
                        pagingContainer.appendChild(button);
                    }
                }
                
                // 버튼 표시 여부
                if (pageCount <= 1) {
                    if (prevButton) prevButton.style.display = 'none';
                    if (nextButton) nextButton.style.display = 'none';
                    if (pagingContainer) pagingContainer.style.display = 'none';
                } else {
                    if (prevButton) prevButton.style.display = '';
                    if (nextButton) nextButton.style.display = '';
                    if (pagingContainer) pagingContainer.style.display = '';
                }
            }
            
            updateSlides();
        }
    });
    
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