function JOYSTICK(parent) {
    this.dragStart = null;
    this.currentPos = { x: 0, y: 0 };
    this.maxDiff = 50;
    this.maxMove = 180;  //일정 범위
    this.tempAngle = "stop";
    this.stick = document.createElement('div');
    this.stick.classList.add('joystick-stick');
    parent.appendChild(this.stick);

    this.stick.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    this.stick.addEventListener('touchstart', this.handleMouseDown.bind(this));
    document.addEventListener('touchmove', this.handleMouseMove.bind(this));
    document.addEventListener('touchend', this.handleMouseUp.bind(this));

    this.stickMove = function (x, y) {
        if ((this.currentPos.x !== x) || (this.currentPos.y !== y)) {
            this.currentPos = { x, y };
            let customEvt = new CustomEvent('moveStick', {
                bubbles: true,
                detail: { x, y }
            });
            this.stick.dispatchEvent(customEvt);
        }
    }
};

JOYSTICK.prototype.handleMouseDown = function (event) {
    this.stick.style.transition = '0s';
    if (event.changedTouches) {
        this.dragStart = {
            x: event.changedTouches[0].clientX,
            y: event.changedTouches[0].clientY,
        };
        return;
    }
    this.dragStart = {
        x: event.clientX,
        y: event.clientY,
    };
};

JOYSTICK.prototype.handleMouseMove = function (event) {
    if (this.dragStart === null) return;
    event.preventDefault();
    if (event.changedTouches) {
        event.clientX = event.changedTouches[0].clientX;
        event.clientY = event.changedTouches[0].clientY;
    }
    const xDiff = event.clientX - this.dragStart.x;
    const yDiff = event.clientY - this.dragStart.y;

    if (Math.abs(xDiff) > this.maxMove || Math.abs(yDiff) > this.maxMove) {
        if (this.dragStart === null) return;
        this.stick.style.transition = '.2s';
        this.stick.style.transform = `translate3d(0px, 0px, 0px)`;
        this.dragStart = null;
        // this.currentPos = { x: 0, y: 0 };

        this.stickMove(0, 0);
        return;
    }
    const angle = Math.atan2(yDiff, xDiff);
    const distance = Math.min(this.maxDiff, Math.hypot(xDiff, yDiff));

    const xNew = distance * Math.cos(angle);
    const yNew = distance * Math.sin(angle);
    this.stick.style.transform = `translate3d(${xNew}px, ${yNew}px, 0px)`;

    this.stickMove(xNew, yNew);
};

JOYSTICK.prototype.handleMouseUp = function (event) {

    if (this.dragStart === null) return;

    this.stick.style.transition = '.2s';
    this.stick.style.transform = `translate3d(0px, 0px, 0px)`;
    this.dragStart = null;
    // this.currentPos = { x: 0, y: 0 };

    this.stickMove(0, 0);
};
