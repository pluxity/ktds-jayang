const navigationSearch = () => {
    const searchWrap = document.querySelector('.navigation-search');
    const searchInput = document.querySelector('input[name="search"]');

    if(!searchWrap) {
        return;
    }

    searchInput.addEventListener('focus', () => {
        searchWrap.classList.add('navigation-search--active');
    })

    searchInput.addEventListener('blur', (e) => {
        if(e.target.value.trim()) {
            searchWrap.classList.remove('navigation-search--active');
            searchWrap.classList.add('navigation-search--complete');
        } else {
            searchWrap.classList.remove('navigation-search--active');
            searchWrap.classList.remove('navigation-search--complete');
        }
    })
};

const navigationCategory = () => {
    const categoryWrap = document.querySelector('.navigation-category');
    const categoryFloor = document.querySelector('#category-floor');
    const categoryStore = document.querySelector('#category-store');
    
    const categoryFloorBtns = categoryFloor.querySelectorAll('button');
    const categoryStoreBtns = categoryStore.querySelectorAll('button');

    const floorAllBtn = document.querySelector('#floor-all');
    const storeAllBtn = document.querySelector('#store-all');

    if(!categoryWrap) {
        return;
    }

    if(floorAllBtn || storeAllBtn) {
        floorAllBtn.classList.add('navigation-category__button--active');
        storeAllBtn.classList.add('navigation-category__button--active');
    }
    
    categoryFloorBtns.forEach(floorBtn => {
        floorBtn.addEventListener('click', () => {
            categoryFloorBtns.forEach(btn => {
                btn.classList.remove('navigation-category__button--active');
            })
            floorBtn.classList.add('navigation-category__button--active');
        });
    });
    categoryStoreBtns.forEach(storeBtn => {
        storeBtn.addEventListener('click', () => {
            categoryStoreBtns.forEach(btn => {
                btn.classList.remove('navigation-category__button--active');
            })
            storeBtn.classList.add('navigation-category__button--active');
        });
    });
}

const navigationListBanner = () => {
    const bannerWrap = document.querySelector('.navigation-list__banner');
    if(!bannerWrap) return;

    const bannerSlider = bannerWrap.querySelector('.slider');
    const bannerSliderItems = bannerSlider.querySelectorAll('li');
    const prevBtn = bannerWrap.querySelector('.button--left');
    const nextBtn = bannerWrap.querySelector('.button--right');

    const gap = parseFloat(getComputedStyle(bannerSlider).gap) || 0;
    const sliderWidth = bannerSliderItems[0].offsetWidth + gap;
    const totalWidth = sliderWidth * bannerSliderItems.length;
    const viewWidth = bannerWrap.offsetWidth;
    const maxTranslateX = Math.max(totalWidth - viewWidth, 0);

    let currentTranslateX = 0;

    function showButtons(){
        prevBtn.style.display = currentTranslateX === 0 ? 'none' : 'block';
        nextBtn.style.display = currentTranslateX >= maxTranslateX ? 'none' : 'block';
    }

    function moveSlider(direction) {
        if(direction === 'next') {
            currentTranslateX = Math.min(currentTranslateX + sliderWidth, maxTranslateX);
        } else if(direction === 'prev') {
            currentTranslateX = Math.max(currentTranslateX - sliderWidth, 0);
        }
        bannerSlider.style.transform = `translateX(-${currentTranslateX}px)`;
        showButtons();
    }

    nextBtn.addEventListener('click', () => moveSlider('next'));
    prevBtn.addEventListener('click', () => moveSlider('prev'));

    showButtons();
    
    // 배너 버튼 클릭 시 모달 열기
    const bannerButtons = document.querySelectorAll('.navigation-list__banner .slider button');
    bannerButtons.forEach(button => {
        button.addEventListener('click', () => {
            openModal();
        });
    });
};

const navigationViewButton = () => {
    const viewButtons = document.querySelectorAll('#view-button');
    const searchContent = document.querySelector('#search-content');
    const locationContent = document.querySelector('#location-content');

    if(!viewButtons || !searchContent || !locationContent) {return;}

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            searchContent.style.display = 'none';
            locationContent.style.display = 'flex';
        });
    })
}

const navigationLocationStep = () => {
    const startButton = document.querySelector('#start-button');
    const endButton = document.querySelector('#end-button');
    const navigationStart = document.querySelector('#navigation-start');
    const locationView = document.querySelector('#location-view');
    const locationSearch = document.querySelector('#location-search');
    const locationRoute = document.querySelector('#location-route');
    if(!startButton || !endButton || !locationView || !locationSearch || !locationRoute) {return;}

    [startButton, endButton].forEach(button => {
        button.addEventListener('click', () => {
            locationView.style.display = 'none';
            locationSearch.style.display = 'flex';
        });
    });

    navigationStart.addEventListener('click', () => {
        locationSearch.style.display = 'none';
        locationRoute.style.display = 'flex';
    })
}

const locationSearch = () => {
    const searchItems = document.querySelectorAll('#location-search .item');
    const changeBtn = document.querySelector('#location-search .change');
    const navigationStartBtn = document.querySelector('#navigation-start');
    
    if(!searchItems.length) {
        return;
    }

    // 입력 상태 체크 함수
    const checkInputStatus = () => {
        const allInputs = Array.from(searchItems).map(item => {
            const input = item.querySelector('input[name="search"]');
            return input ? input.value.trim() : '';
        });
        
        const hasInput = allInputs.some(value => value.length > 0);
        const allInputsFilled = allInputs.every(value => value.length > 0);
        
        // 전환 버튼 활성화 (하나라도 입력이 있으면)
        if(hasInput) {
            changeBtn.classList.add('change--active');
        } else {
            changeBtn.classList.remove('change--active');
        }
        
        // 길 안내 시작 버튼 활성화 (모두 입력이 완료되면)
        if(allInputsFilled) {
            navigationStartBtn.classList.add('location-search__button--active');
        } else {
            navigationStartBtn.classList.remove('location-search__button--active');
        }
    };

    searchItems.forEach(item => {
        const searchInput = item.querySelector('input[name="search"]');
        const closeBtn = item.querySelector('.item__close');
        
        if(!searchInput || !closeBtn) {
            return;
        }

        searchInput.addEventListener('focus', () => {
            item.classList.add('item--active');
        });

        searchInput.addEventListener('input', (e) => {
            if(e.target.value.trim()) {
                closeBtn.style.display = 'block';
            } else {
                closeBtn.style.display = 'none';
            }
            checkInputStatus();
        });

        searchInput.addEventListener('blur', (e) => {
            if(e.target.value.trim()) {
                item.classList.remove('item--active');
                item.classList.add('item--complete');
            } else {
                item.classList.remove('item--active');
                item.classList.remove('item--complete');
            }
            checkInputStatus();
        });

        closeBtn.addEventListener('click', () => {
            searchInput.value = '';
            item.classList.remove('item--complete');
            closeBtn.style.display = 'none';
            searchInput.focus();
            checkInputStatus();
        });
    });
};

const modalListSlider = () => {
    const modal = document.querySelector('#layer-store');
    const listContainer = modal?.querySelector('.list ul');
    const leftBtn = modal?.querySelector('.list__button--left');
    const rightBtn = modal?.querySelector('.list__button--right');
    const countSpan = modal?.querySelector('.list__count');
    
    if (!listContainer || !leftBtn || !rightBtn || !countSpan) {
        return;
    }
    
    const listItems = listContainer.querySelectorAll('li');
    const totalItems = listItems.length;
    let currentIndex = 0;
    
    // 초기 설정
    const initSlider = () => {
        listItems.forEach((item, index) => {
            item.style.display = 'none';
            if (index === 0) {
                item.style.display = 'block';
            }
        });
        updateCount();
        updateButtons();
    };
    
    // 카운트 업데이트
    const updateCount = () => {
        countSpan.textContent = `${currentIndex + 1}/${totalItems}`;
    };
    
    // 버튼 상태 업데이트
    const updateButtons = () => {
        leftBtn.disabled = currentIndex === 0;
        rightBtn.disabled = currentIndex === totalItems - 1;
    };
    
    // 슬라이드 이동
    const moveToSlide = (index) => {
        if (index < 0 || index >= totalItems) return;
        
        // 모든 아이템 숨기기
        listItems.forEach(item => {
            item.style.display = 'none';
        });
        
        // 선택된 아이템만 보이기
        listItems[index].style.display = 'block';
        
        // 인덱스 업데이트
        currentIndex = index;
        
        // 카운트와 버튼 상태 업데이트
        updateCount();
        updateButtons();
    };
    
    // 왼쪽 버튼 클릭
    leftBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            moveToSlide(currentIndex - 1);
        }
    });
    
    // 오른쪽 버튼 클릭
    rightBtn.addEventListener('click', () => {
        if (currentIndex < totalItems - 1) {
            moveToSlide(currentIndex + 1);
        }
    });
    
    // 초기화
    initSlider();
};

const modalLayer = () => {
    const modal = document.querySelector('#layer-store');
    const closeBtn = modal?.querySelector('.close');
    
    if (!modal || !closeBtn) {
        return;
    }
    
    // 모달 열기
    const openModal = () => {
        modal.style.display = 'flex';
        modal.classList.add('navigation-layer--active');
        document.body.style.overflow = 'hidden';
        // 모달이 열릴 때 슬라이더 초기화
        setTimeout(() => {
            modalListSlider();
        }, 100);
    };
    
    // 모달 닫기
    const closeModal = () => {
        modal.style.display = 'none';
        modal.classList.remove('navigation-layer--active');
        document.body.style.overflow = '';
    };
    
    // 닫기 버튼 클릭
    closeBtn.addEventListener('click', closeModal);
    
    // 오버레이 클릭으로 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('navigation-layer--active')) {
            closeModal();
        }
    });
    
    // 전역 함수로 모달 제어
    window.openModal = openModal;
    window.closeModal = closeModal;
};

const routeCloseAlert = () => {
    const routeCloseBtn = document.querySelector('#route-close');
    const alertModal = document.querySelector('#alert-stop');
    const confirmBtn = alertModal?.querySelector('.button--confirm');
    const cancelBtn = alertModal?.querySelector('.button--cancel');
    
    if (!routeCloseBtn || !alertModal || !confirmBtn || !cancelBtn) {
        return;
    }
    
    routeCloseBtn.addEventListener('click', () => {
        alertModal.style.display = 'block';
    });
    
    confirmBtn.addEventListener('click', () => {
        alertModal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        alertModal.style.display = 'none';
    });
};

const routeCategoryToggle = () => {
    const routeCategory = document.querySelector('#route-category');
    if (!routeCategory) return;
    
    const categoryItems = routeCategory.querySelectorAll('li');
    
    categoryItems.forEach(item => {
        const button = item.querySelector('button');
        if (!button) return;
        
        button.addEventListener('click', () => {
            if (item.classList.contains('active')) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
};

navigationSearch();
navigationCategory();
navigationListBanner();
navigationViewButton();
navigationLocationStep();
locationSearch();
modalLayer();
routeCloseAlert();
routeCategoryToggle(); // 새로 추가




