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


/* PTZ Viewer */
function PTZViewer() {
    // PTZ 요소들이 있는지 확인
    const ptzViewer = document.querySelector('.ptz-viewer');
    if (!ptzViewer) return;

    // 현재 모드 상태 저장
    let currentMode = 'live'; // 기본값

    // 패널 토글 (현재 모드에 따라 다른 패널 표시)
    const handleToggleControlPanel = () => {
        const livePanel = document.getElementById('slidePanel');
        const playbackPanel = document.getElementById('playbackPanel');
        const container = document.getElementById('ptzContainer');
        
        if (currentMode === 'live') {
            // LIVE 모드일 때 slidePanel 토글
            if (livePanel) {
                const isActive = livePanel.classList.contains('ptz-viewer__panel--active');
                if (isActive) {
                    livePanel.classList.remove('ptz-viewer__panel--active');
                    if (container) container.classList.remove('ptz-container--panel-open');
                } else {
                    livePanel.classList.add('ptz-viewer__panel--active');
                    if (container) container.classList.add('ptz-container--panel-open');
                }
            }
        } else if (currentMode === 'playback') {
            // PLAYBACK 모드일 때 playbackPanel 토글
            if (playbackPanel) {
                const isActive = playbackPanel.classList.contains('ptz-viewer__panel--active');
                if (isActive) {
                    playbackPanel.classList.remove('ptz-viewer__panel--active');
                    if (container) container.classList.remove('ptz-container--panel-open');
                } else {
                    playbackPanel.classList.add('ptz-viewer__panel--active');
                    if (container) container.classList.add('ptz-container--panel-open');
                }
            }
        }
    };

    // LIVE/PLAYBACK 모드 전환
    const handleModeSwitch = (mode) => {
        currentMode = mode; // 현재 모드 업데이트
        
        const playbackContainer = document.querySelector('.playback');
        const modeBtns = document.querySelectorAll('.playback__mode .button');
        const actionGroup = document.querySelector('.playback__action');
        const actionButtons = actionGroup?.querySelectorAll('.playback__button');
        
        // 모든 모드 버튼 스타일 초기화
        modeBtns.forEach(btn => {
            btn.classList.remove('button--solid-middle', 'button--ghost-lower');
            const btnText = btn.textContent.trim().toLowerCase();
            if ((mode === 'live' && btnText === 'live') || 
                (mode === 'playback' && (btnText === 'play back' || btnText === 'playback'))) {
                btn.classList.add('button--solid-middle');
            } else {
                btn.classList.add('button--ghost-lower');
            }
        });
        
        // 컨테이너 클래스 변경
        if (playbackContainer) {
            playbackContainer.classList.remove('playback--live', 'playback--playback');
            playbackContainer.classList.add(`playback--${mode}`);
        }
        
        // 재생 컨트롤 버튼 활성화 상태 관리
        if (actionGroup) {
            if (mode === 'playback') {
                actionGroup.classList.add('playback__action--active');
                actionButtons?.forEach(btn => btn.removeAttribute('disabled'));
            } else {
                actionGroup.classList.remove('playback__action--active');
                actionButtons?.forEach(btn => btn.setAttribute('disabled', 'disabled'));
            }
        }
        
        // 모드 변경 시 열려있는 패널 닫기
        const livePanel = document.getElementById('slidePanel');
        const playbackPanel = document.getElementById('playbackPanel');
        const container = document.getElementById('ptzContainer');
        
        if (livePanel) livePanel.classList.remove('ptz-viewer__panel--active');
        if (playbackPanel) playbackPanel.classList.remove('ptz-viewer__panel--active');
        if (container) container.classList.remove('ptz-container--panel-open');
        
        console.log(`Mode switched to: ${mode.toUpperCase()}`);
    };

    // 슬라이더 진행도 업데이트 함수
    const updateSliderProgress = (slider) => {
        const progress = slider.parentElement.querySelector('.controls__progress');
        const value = slider.value;
        const max = slider.max;
        const percentage = (value / max) * 100;
        progress.style.width = percentage + '%';
        progress.setAttribute('data-progress', value);
    };

    // 슬라이더 값 변경 함수
    const changeSliderValue = (type, change) => {
        const slider = document.querySelector(`[data-type="${type}"]`);
        if (!slider) return;
        
        const currentValue = parseInt(slider.value);
        const newValue = Math.max(0, Math.min(100, currentValue + change));
        
        slider.value = newValue;
        updateSliderProgress(slider);
        
        const label = slider.closest('.controls__group')?.querySelector('.controls__label')?.textContent;
        console.log(`${label}: ${newValue}`);
    };

    // 조이스틱 기능 초기화
    const initJoystick = () => {
        const joystick = document.getElementById('joystickStick');
        if (!joystick) return;
        
        const container = joystick.parentElement;
        let isDragging = false;
        let centerX, centerY;

        // 조이스틱 중심점 계산
        const updateCenter = () => {
            const rect = container.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;
        };

        const moveJoystick = (clientX, clientY) => {
            updateCenter();
            
            const deltaX = clientX - centerX;
            const deltaY = clientY - centerY;
            const maxRadius = 60;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            let finalX = deltaX;
            let finalY = deltaY;
            
            if (distance > maxRadius) {
                const angle = Math.atan2(deltaY, deltaX);
                finalX = Math.cos(angle) * maxRadius;
                finalY = Math.sin(angle) * maxRadius;
            }
            
            joystick.style.transform = `translate(-50%, -50%) translate(${finalX}px, ${finalY}px)`;
            
            const panSpeed = Math.round((finalX / maxRadius) * 100);
            const tiltSpeed = Math.round((-finalY / maxRadius) * 100);
            
            console.log(`PTZ Command - Pan: ${panSpeed}, Tilt: ${tiltSpeed}`);
        };

        const resetJoystick = () => {
            joystick.style.transform = 'translate(-50%, -50%)';
            console.log('PTZ Command - Stop');
        };

        // 마우스 이벤트
        joystick.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateCenter();
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            moveJoystick(e.clientX, e.clientY);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                resetJoystick();
            }
        });

        // 터치 이벤트
        joystick.addEventListener('touchstart', (e) => {
            isDragging = true;
            updateCenter();
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            moveJoystick(touch.clientX, touch.clientY);
            e.preventDefault();
        });

        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                resetJoystick();
            }
        });

        window.addEventListener('resize', updateCenter);
        setTimeout(updateCenter, 100);
    };

    // 이벤트 리스너 설정
    const initEventListeners = () => {
        // 토글 버튼 이벤트 (모드에 따라 다른 패널 표시)
        const toggleBtn = document.getElementById('toggleControl');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', handleToggleControlPanel);
            
            // 토글 버튼 상태 업데이트
            const updateToggleButton = () => {
                const livePanel = document.getElementById('slidePanel');
                const playbackPanel = document.getElementById('playbackPanel');
                const isAnyPanelActive = (livePanel && livePanel.classList.contains('ptz-viewer__panel--active')) ||
                                       (playbackPanel && playbackPanel.classList.contains('ptz-viewer__panel--active'));
                
                if (isAnyPanelActive) {
                    toggleBtn.classList.add('playback__toggle--active');
                } else {
                    toggleBtn.classList.remove('playback__toggle--active');
                }
            };
            
            toggleBtn.addEventListener('click', () => {
                setTimeout(updateToggleButton, 10);
            });
        }

        // 모드 버튼 이벤트 리스너
        document.querySelectorAll('.playback__mode .button').forEach(btn => {
            btn.addEventListener('click', function() {
                const btnText = this.textContent.trim().toLowerCase();
                const mode = btnText === 'live' ? 'live' : 'playback';
                handleModeSwitch(mode);
            });
        });

        // 재생 컨트롤 버튼 이벤트 리스너
        document.querySelectorAll('.playback__button').forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.hasAttribute('disabled')) return;
                
                const btnClass = this.className;
                if (btnClass.includes('playback__button--play')) {
                    console.log('Playback: Play');
                } else if (btnClass.includes('playback__button--pause')) {
                    console.log('Playback: Pause');
                } else if (btnClass.includes('playback__button--stop')) {
                    console.log('Playback: Stop');
                }
            });
        });

        // 슬라이더 이벤트 리스너
        document.querySelectorAll('.controls__input').forEach(slider => {
            updateSliderProgress(slider);
            
            slider.addEventListener('input', function() {
                updateSliderProgress(this);
                const label = this.closest('.controls__group')?.querySelector('.controls__label')?.textContent;
                console.log(`${label}: ${this.value}`);
            });
        });

        // 컨트롤 버튼 이벤트 리스너
        ['rotation', 'focus', 'iris'].forEach(type => {
            document.querySelectorAll(`.controls__btn[data-target="${type}"]`).forEach(btn => {
                btn.addEventListener('click', function() {
                    const btnClass = this.className;
                    let change = 0;
                    
                    if (btnClass.includes('zoom-in') || btnClass.includes('focus-in') || btnClass.includes('iris-in')) {
                        change = -5; // in은 감소
                    } else if (btnClass.includes('zoom-out') || btnClass.includes('focus-out') || btnClass.includes('iris-out')) {
                        change = 5;  // out은 증가
                    }
                    
                    if (change !== 0) {
                        changeSliderValue(type, change);
                    }
                });
            });
        });

        // 카메라 리셋 버튼
        const resetBtn = document.querySelector('#resetCamera');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                console.log('Camera Reset');
                
                // 조이스틱 리셋
                const joystickStick = document.getElementById('joystickStick');
                if (joystickStick) {
                    joystickStick.style.transform = 'translate(-50%, -50%)';
                }
                
                // 슬라이더 리셋
                document.querySelectorAll('.controls__input').forEach(slider => {
                    slider.value = 0;
                    updateSliderProgress(slider);
                });
            });
        }
    };

    // 초기화
    initJoystick();
    initEventListeners();
    
    // 초기 설정 - LIVE 모드로 시작
    setTimeout(() => {
        handleModeSwitch('live');
    }, 100);
}
PTZViewer();