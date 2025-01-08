let cctvPlayerWebsocket;

//CCTV 어플리케이션 OPEN
const initCctvWebsocket = () => {

    if(cctvPlayerWebsocket !== undefined) {
        if(cctvPlayerWebsocket.readyState === cctvPlayerWebsocket.OPEN) return false;
    }

    cctvPlayerWebsocket = new WebSocket('ws://127.0.0.1:21088/websocket', 'voost.api');
    cctvPlayerWebsocket.onmessage = (event) => {
    }

    cctvPlayerWebsocket.onclose = (event) => {
        cctvPlayerWebsocket = new WebSocket('ws://127.0.0.1:21088/websocket', 'voost.api');
        initCctvWebsocket();
    }

    cctvPlayerWebsocket.onerror = (event) => {
        cctvPlayerWebsocket = new WebSocket('ws://127.0.0.1:21088/websocket', 'voost.api');
        initCctvWebsocket();
    };
}


