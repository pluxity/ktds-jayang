class PluxPlayer {
    constructor(options) {
        this.options = options;

        this.wsRelayUrl = options.wsRelayUrl
        this.wsRelayPort = options.wsRelayPort
        this.httpRelayUrl = options.httpRelayUrl
        this.httpRelayPort = options.httpRelayPort

        this.LG_server_ip = options.LG_server_ip
        this.LG_server_port = options.LG_server_port

        this.LG_live_port = options.LG_live_port
        this.LG_playback_port = options.LG_playback_port
        this.canvasDom = options.canvasDom;
        this.ctx = this.canvasDom.getContext('2d');
        this.decodeWorker = null
        this.streamServerIP = null
        this.recordServerIp = null
    }

    playBack(deviceId, startDate, endTime) {
        if (this.decodeWorker) {
            this.decodeWorker.terminate()
        }
        deviceId = deviceId.slice(0, -2) + "02";
        this.decodeWorker = new Worker("/static/js/map/cctv/plux-playback-worker.js");
        this.decodeWorker.postMessage({ relayServerUrl: this.wsRelayUrl + ":" + this.wsRelayPort, destinationIp:this.recordServerIp?.[deviceId], destinationPort: this.LG_playback_port, deviceId, startDate, endTime });
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
        deviceId = deviceId.slice(0, -2) + "02";
        console.log(this.streamServerIP?.[deviceId])
        this.decodeWorker.postMessage({ relayServerUrl: this.wsRelayUrl + ":" + this.wsRelayPort, destinationIp: this.streamServerIP?.[deviceId], destinationPort: this.LG_live_port, deviceId });
        this.decodeWorker.onmessage = (e) => {
            var eventData = e.data
            if (eventData.function == "decodeFrame") {
                let frame = eventData.frame
                this.ctx.drawImage(frame, 0, 0, this.canvasDom.width, this.canvasDom.height);
                frame.close();
            }
        };

    }

    async ptzControl(deviceUrl, devicePort, x, y, id, password) {
        console.log(deviceUrl, devicePort, x, y, id, password);

        try {
            const digest = await this.generatePasswordDigest(password);
            if (x == 0 && y == 0) {
                await this.ptzStop(deviceUrl, devicePort, id, password);
            } else {
                let soap_message = this.createDirectCamSoapBody(
                    `<ContinuousMove xmlns="http://www.onvif.org/ver20/ptz/wsdl">
                    <ProfileToken>DefaultProfile-01-0</ProfileToken>
                    <Velocity>
                        <PanTilt x="${x}" y="${y}"
                            space="http://www.onvif.org/ver10/tptz/PanTiltSpaces/VelocityGenericSpace"
                            xmlns="http://www.onvif.org/ver10/schema" />
                    </Velocity>
                </ContinuousMove>`,
                    id, digest.passwordDigest, digest.nonce, digest.created
                );
                const response = await this.sendSoapRequest(
                    this.httpRelayUrl + ":" + this.httpRelayPort,
                    "http://" + deviceUrl + ":" + devicePort + "/onvif/ptz_service",
                    soap_message
                );
                console.log(response);
            }
        } catch (error) {
            console.error("Error in ptzControl:", error);
        }
    }


    async zoom(deviceUrl, devicePort, id, password, zoom) {
        try {
            const digest = await this.generatePasswordDigest(password);
            if (zoom > 2) { zoom = 2 }
            else if (zoom < -2) { zoom = -2 }
            let soap_message = this.createDirectCamSoapBody(
                `<ContinuousMove xmlns="http://www.onvif.org/ver20/ptz/wsdl">
                    <ProfileToken>DefaultProfile-01-0</ProfileToken>
                    <Velocity>
                        <Zoom x="${zoom}"
                    space="http://www.onvif.org/ver10/tptz/PanTiltSpaces/VelocityGenericSpace"
                    xmlns="http://www.onvif.org/ver10/schema" />
                    </Velocity>
                </ContinuousMove>`,
                id, digest.passwordDigest, digest.nonce, digest.created
            );
            const response = await this.sendSoapRequest(
                this.httpRelayUrl + ":" + this.httpRelayPort,
                "http://" + deviceUrl + ":" + devicePort + "/onvif/ptz_service",
                soap_message
            );
            console.log(response);
        } catch (error) {
            console.error("Error in zoom:", error);
        }
    }

    async ptzStop(deviceUrl, devicePort, id, password) {
        try {
            const digest = await this.generatePasswordDigest(password);
            let soap_message = this.createDirectCamSoapBody(
                `<Stop xmlns="http://www.onvif.org/ver20/ptz/wsdl">
                    <ProfileToken>DefaultProfile-01-0</ProfileToken>
                    <PanTilt>true</PanTilt>
                    <Zoom>true</Zoom>
                </Stop>`,
                id, digest.passwordDigest, digest.nonce, digest.created
            );
            const response = await this.sendSoapRequest(
                this.httpRelayUrl + ":" + this.httpRelayPort,
                "http://" + deviceUrl + ":" + devicePort + "/onvif/ptz_service",
                soap_message
            );
            console.log(response);
        } catch (error) {
            console.error("Error in ptzStop:", error);
        }
    }


    async getDeviceInfo(callback) {
        const soapBody = this.createSoapBody("<ns1:GetDeviceInfoExt />")
        const response = await this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + this.LG_server_ip + ":" + this.LG_server_port, soapBody);
        let cameraList = this.parseResponse(response)["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:GetDeviceInfoExtResponse"]["ns1:GetDeviceInfoExtResult"]["ns1:CAMERA_DATA_EXT"];
        callback(cameraList);
    }

    async getMngServerInfo() {
        const soapBody = this.createSoapBody("<ns1:GetManagementServerInfo />")
        const response = await this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + this.LG_server_ip + ":" + this.LG_server_port, soapBody);
        console.log("GetManagementServerInfo response : ", response);
    }

    async getStreamUri(cameraIp, username, password) {
        const { nonce, created, passwordDigest } = await this.generatePasswordDigest(password);
        const operationBody = `
            <GetStreamUri xmlns="http://www.onvif.org/ver10/media/wsdl">
              <StreamSetup>
                <Stream xmlns="http://www.onvif.org/ver10/schema">RTP-Unicast</Stream>
                <Transport xmlns="http://www.onvif.org/ver10/schema">
                  <Protocol>UDP</Protocol>
                </Transport>
              </StreamSetup>
              <ProfileToken>DefaultProfile-03</ProfileToken>
            </GetStreamUri>`.trim();
        const soapBody = this.createDirectCamSoapBody(
            operationBody,
            username,
            passwordDigest,
            nonce,
            created
        );

        const response = await this.sendSoapRequest(
            this.httpRelayUrl + ":" + this.httpRelayPort,
            "http://" + cameraIp + ":" + 80 + "/onvif/media_service",
            soapBody
        );

        let uri = this.parseResponse(response)["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["trt:GetStreamUriResponse"]["trt:MediaUri"]["tt:Uri"];
        console.log("uri : ", uri);

        const resp = await fetch(
            `${this.httpRelayUrl}:${this.httpRelayPort}/start_stream`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cameraIp,
                    rtspUrl: uri,
                    username,
                    password
                })
            }
        );

        const { url: hlsUrl } = await resp.json();
        console.log("HLS URL:", hlsUrl);
        return hlsUrl;
    }

    async getLiveStreamUri(cameraIp, username, password) {
        const { nonce, created, passwordDigest } = await this.generatePasswordDigest(password);

        const operationBody = `
            <GetStreamUri xmlns="http://www.onvif.org/ver10/media/wsdl">
              <StreamSetup>
                <Stream xmlns="http://www.onvif.org/ver10/schema">RTP-Unicast</Stream>
                <Transport xmlns="http://www.onvif.org/ver10/schema">
                  <Protocol>UDP</Protocol>
                </Transport>
              </StreamSetup>
              <ProfileToken>DefaultProfile-03</ProfileToken>
            </GetStreamUri>`.trim();

        const soapBody = this.createDirectCamSoapBody(
            operationBody,
            username,
            passwordDigest,
            nonce,
            created
        );

        const response = await this.sendSoapRequest(
            `${this.httpRelayUrl}:${this.httpRelayPort}`,
            `http://${cameraIp}:80/onvif/media_service`,
            soapBody
        );

        const uri = this.parseResponse(response)["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["trt:GetStreamUriResponse"]["trt:MediaUri"]["tt:Uri"];

        const liveWsPort = this.wsRelayUrl.startsWith('https') ? 4013 : 4003;

        const liveUrl = `${this.wsRelayUrl}:${liveWsPort}/ws/live?rtsp=${encodeURIComponent(uri)}&user=${username}&pass=${password}`;
        console.log("Live RTSP URI:", uri);
        console.log("Live WS URL:", liveUrl);
        return liveUrl;
    }

    async GetUser() {
        const soapBody = this.createSoapBody("<ns1:GetUser />")
        const response = await this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + this.LG_server_ip + ":" + this.LG_server_port, soapBody);
        console.log("GetUser response : ", response);
    }

    async GetUserCamAssign() {
        const soapBody = this.createSoapBody("<ns1:GetUserCamAssign />")
        const response = await this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + this.LG_server_ip + ":" + this.LG_server_port, soapBody);
        console.log("GetUserCamAssign response : ", response);
    }

    async getRecordingServerList() {

        let getRecordCamBody = this.createSoapBody(
            `<ns1:GetRecordCam>
                    <ns1:ServerID>${this.LG_server_ip + ":" + this.LG_server_port}</ns1:ServerID>
                </ns1:GetRecordCam> `
        );
        let response = await this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + this.LG_server_ip + ":" + this.LG_server_port, getRecordCamBody);

        let parsedResponse = this.parseResponse(response);
        let camAssign = parsedResponse["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:GetRecordCamResponse"]["ns1:GetRecordCamResult"]["ns1:RECORDCAMASSIGN"];

        await new Promise(resolve => setTimeout(resolve, 100));

        const soapBody1 = this.createSoapBody("<ns1:GetRecordServerList/>");
        response = await this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + this.LG_server_ip + ":" + this.LG_server_port, soapBody1);
        parsedResponse = this.parseResponse(response);
        let recordServerList = parsedResponse["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:GetRecordServerListResponse"]["ns1:GetRecordServerListResult"]["ns1:RECORD_SERVER"];

        let recordServerIP = {}

        if (typeof recordServerList == "object" && recordServerList && recordServerList.hasOwnProperty("ns1:strRecServerName")) {
            recordServerIP[recordServerList["ns1:strRecServerName"]] = recordServerList["ns1:strRecServerIP"]
        }
        else{
            recordServerList?.map(item => {
                if(item.hasOwnProperty("ns1:strRecServerName")){
                    recordServerList[item["ns1:strRecServerName"]] = item["ns1:strRecServerIP"]
                }
            })
        }

        const camAssignList = Array.isArray(camAssign) ? camAssign : [camAssign];
        console.log("camAssignList : ", camAssignList);
        let recordServerIPFromCamId = {}

        camAssignList.map(item => {
            recordServerIPFromCamId[item["ns1:strCameraID"]] = item["ns1:strRecServerName"]
        })

        console.log("recordServerIPFromCamId : ", recordServerIPFromCamId);
        this.recordServerIP = recordServerIPFromCamId
        this.recordServerIP = Object.fromEntries(
            Object.entries(this.recordServerIP).map(([id, addr]) => [
                id.slice(0, -2) + "02",
                addr
            ])
        );
        return recordServerIPFromCamId
    }

    async streamRecServerSetting() {
        let getstreamcambody = this.createSoapBody("<ns1:GetStreamCam/>");
        let response = await this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + this.LG_server_ip + ":" + this.LG_server_port, getstreamcambody);

        console.log("streamRecServerSetting response : ", response);
        let parsedResponse = this.parseResponse(response);
        let camAssign = parsedResponse["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:GetStreamCamResponse"]["ns1:GetStreamCamResult"]["ns1:STREAMCAMASSIGN"];

        await new Promise(resolve => setTimeout(resolve, 100));

        const soapBody1 = this.createSoapBody("<ns1:GetStreamServerList/>");
        response = await this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + this.LG_server_ip + ":" + this.LG_server_port, soapBody1);
        parsedResponse = this.parseResponse(response);
        let streamServerList = parsedResponse["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:GetStreamServerListResponse"]["ns1:GetStreamServerListResult"]["ns1:STREAM_SERVER"];

        let streamServerIP = {}

        if (typeof streamServerList == "object" && streamServerList && streamServerList.hasOwnProperty("ns1:strStrServerName")) {
            streamServerIP[streamServerList["ns1:strStrServerName"]] = streamServerList["ns1:strStrServerIP"]
        }
        else{
            streamServerList?.map(item => {
                if(item.hasOwnProperty("ns1:strStrServerName")){    
                    streamServerIP[item["ns1:strStrServerName"]] = item["ns1:strStrServerIP"]
                }
            })
        }

        const camAssignList = Array.isArray(camAssign) ? camAssign : [camAssign];
        console.log("camAssignList : ", camAssignList);
        let streamServerIPFromCamId = {}
        camAssignList.map(item => {
            streamServerIPFromCamId[item["ns1:strCameraID"]] = streamServerIP[item["ns1:strStrServerName"]]
        })

        console.log("streamServerIPFromCamId : ", streamServerIPFromCamId);
        this.streamServerIP = streamServerIPFromCamId
        this.streamServerIP = Object.fromEntries(
            Object.entries(this.streamServerIP).map(([id, addr]) => [
                id.slice(0, -2) + "02",
                addr
            ])
        );
        return streamServerIPFromCamId
    }

    async getStrNameFromCamId(callback) {
        const serverId = "192.168.4.149:9100";
        const soapBody  = this.createSoapBody(
            `<ns1:GetRecordCam>
                        <ns1:ServerID>${serverId}</ns1:ServerID>
                    </ns1:GetRecordCam> `
        )
        const response = await this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + this.LG_server_ip + ":" + this.LG_server_port, soapBody)
        let camassign = this.parseResponse(response)["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:GetRecordCamResponse"]["ns1:GetRecordCamResult"]["ns1:RECORDCAMASSIGN"]
        const camAssignList = Array.isArray(camassign) ? camassign : [camassign];
        let strnamefromcamid = {}
        camAssignList.map(item => {
            strnamefromcamid[item["ns1:strCameraID"]] = item["ns1:strRecServerName"]
        })
        console.log("strnamefromcamid : ", strnamefromcamid);
        callback(strnamefromcamid)
    } 

    getIpFromStrName(callback) {
        const soapBody = this.createSoapBody("<ns1:GetStreamServerList/>")
        this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + this.LG_server_ip + ":" + this.LG_server_port, soapBody)
        .then(response => {
            let ssl= this.parseResponse(response)["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:GetStreamServerListResponse"]["ns1:GetStreamServerListResult"]["ns1:STREAM_SERVER"]
            let ipfromstrname = {}
            ssl.map(item => {
                ipfromstrname[item["ns1:strStrServerName"]] = item["ns1:strStrServerIP"]
            })
            callback(ipfromstrname)
        });
    }

    sendSoapRequest = async (relayUrl, targetServerUrl, soapBody) => {
        try {
            const response = await fetch(relayUrl, {
                method: "POST",  // POST 메서드 사용
                headers: {
                    "Content-Type": "application/json",  // JSON 형식으로 요청 전송
                },
                body: JSON.stringify({
                    url: targetServerUrl,
                    data: soapBody    // SOAP 요청 본문
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseText = await response.text();  // SOAP 응답 본문을 텍스트로 반환
            return responseText;  // 성공적인 응답 처리
        } catch (error) {
            throw error;  // 에러 처리
        }
    };

    async generatePasswordDigest(password) {

        const created = this.getUTCTimestamp();
        const nonceBytes = this.getRandomBytes();

        // base64로 인코딩
        let base64String = '';
        for (let i = 0; i < nonceBytes.length; i++) {
            base64String += String.fromCharCode(nonceBytes[i]);
        }
        const nonce = btoa(base64String);

        const encoder = new TextEncoder();
        const createdBytes = encoder.encode(created);
        const passwordBytes = encoder.encode(password);
        const digestSource = new Uint8Array([...nonceBytes, ...createdBytes, ...passwordBytes]);

        const hashBuffer = await crypto.subtle.digest("SHA-1", digestSource);
        // Step 3: 결과를 Base64로 인코딩
        const sha1Digest = new Uint8Array(hashBuffer);
        const passwordDigest = btoa(String.fromCharCode.apply(null, sha1Digest));

        return { nonce, created, passwordDigest };
    }

    createSoapBody(body) {
        return `<?xml version="1.0" encoding="UTF-8"?>
            <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://www.w3.org/2003/05/soap-envelope"
                            xmlns:SOAP-ENC="http://www.w3.org/2003/05/soap-encoding"
                            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                            xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                            xmlns:ns2="http://tempuri.org/VMSConfigWebServiceSoap"
                            xmlns:ns1="http://tempuri.org/"
                            xmlns:ns3="http://tempuri.org/VMSConfigWebServiceSoap12">
                <SOAP-ENV:Body>
                    ${body}
                </SOAP-ENV:Body>
            </SOAP-ENV:Envelope>`
    }

    createDirectCamSoapBody(body, id, passwordDigest, nonce, created) {
        return `<?xml version="1.0" encoding="utf-8"?>
        <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
            <s:Header>  
                <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                <wsse:UsernameToken><wsse:Username>${id}</wsse:Username>
                <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">${passwordDigest}</wsse:Password>
                <wsse:Nonce>${nonce}</wsse:Nonce><wsu:Created>${created}</wsu:Created></wsse:UsernameToken>
            </wsse:Security>
            </s:Header>
            <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                ${body}
            </s:Body>
        </s:Envelope>`
    }

    parseResponse(response) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(response, "text/xml");
        return this.xmlToJson(xml);
    }
    xmlToJson(xml) {

        // console.log(xml.hasChildNodes())
        // console.log(xml.childNodes)
        // Create the return object
        var obj = {};

        if (xml.nodeType == 1) {
            // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) {
            // text
            obj = xml.nodeValue;
        }

        // do children
        // If all text nodes inside, get concatenated text from them.
        var textNodes = [].slice.call(xml.childNodes).filter(function (node) {
            return node.nodeType === 3;
        });
        if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
            obj = [].slice.call(xml.childNodes).reduce(function (text, node) {
                return text + node.nodeValue;
            }, "");
        } else if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof obj[nodeName] == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof obj[nodeName].push == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }
        return obj;
    }

    sha1(str) {
        var buffer = new TextEncoder().encode(str);
        var hashBuffer = new Uint8Array(crypto.subtle.digestSync("SHA-1", buffer));
        return btoa(String.fromCharCode.apply(null, hashBuffer));
    }

    // UTC Timestamp 생성
    getUTCTimestamp() {
        var now = new Date();
        return now.toISOString().split('.')[0] + ".000Z";
    }

    getRandomBytes(length = 20) {
        // 무작위 바이트 16개 생성
        const nonceBytes = new Uint8Array(length);
        window.crypto.getRandomValues(nonceBytes);
        return nonceBytes;
    }

}