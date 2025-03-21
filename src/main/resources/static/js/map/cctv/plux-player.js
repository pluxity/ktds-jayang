class PluxPlayer {
    constructor(options) {
        this.options = options;
        this.relayServerUrl = options.relayServerUrl
        this.destinationIp = options.destinationIp
        this.destinationPort = options.destinationPort
        this.canvasDom = options.canvasDom;
        this.ctx = this.canvasDom.getContext('2d');
        this.decodeWorker = null
    }

    playBack(deviceId, startDate, endTime) {
        if (this.decodeWorker) {
            this.decodeWorker.terminate()
        }
        this.decodeWorker = new Worker("/static/js/map/cctv/plux-playback-worker.js");
        this.decodeWorker.onerror = (e) => {
            console.log("error : ", e.message);
        }

        this.decodeWorker.postMessage({ relayServerUrl: this.relayServerUrl, destinationIp: this.destinationIp, destinationPort: this.destinationPort, deviceId, startDate, endTime });
        this.decodeWorker.onmessage = (e) => {
            var eventData = e.data
            if (eventData.function == "decodeFrame") {
                let frame = eventData.frame

                this.ctx.drawImage(frame, 0, 0, this.canvasDom.width, this.canvasDom.height);
                frame.close();
            }
        };

    }

    livePlay(deviceId) {
        if (this.decodeWorker) {
            this.decodeWorker.terminate()
        }
        this.decodeWorker = new Worker("/static/js/map/cctv/plux-live-worker.js");
        this.decodeWorker.onerror = (e) => {
            console.log("error : ", e);
        }
        this.decodeWorker.postMessage({ relayServerUrl: this.relayServerUrl, destinationIp: this.destinationIp, destinationPort: this.destinationPort, deviceId });
        this.decodeWorker.onmessage = (e) => {
            var eventData = e.data
            if (eventData.function == "decodeFrame") {
                let frame = eventData.frame

                this.ctx.drawImage(frame, 0, 0, this.canvasDom.width, this.canvasDom.height);
                frame.close();
            }
        };

    }

    cctvClose() {
        if (this.decodeWorker) {
            this.decodeWorker.terminate();
            this.decodeWorker = null;
        }
    }

}