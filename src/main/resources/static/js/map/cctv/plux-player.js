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
    }

    playBack(deviceId, startDate, endTime) {
        if (this.decodeWorker) {
            this.decodeWorker.terminate()
        }
        deviceId = deviceId.slice(0, -2) + "00";
        this.decodeWorker = new Worker("/static/js/map/cctv/plux-playback-worker.js");
        this.decodeWorker.postMessage({ relayServerUrl: this.wsRelayUrl + ":" + this.wsRelayPort, destinationIp:this.streamServerIP[deviceId], destinationPort: this.LG_playback_port, deviceId, startDate, endTime });
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
        deviceId = deviceId.slice(0, -2) + "00";
        console.log(this.streamServerIP[deviceId])
        this.decodeWorker.postMessage({ relayServerUrl: this.wsRelayUrl + ":" + this.wsRelayPort, destinationIp: this.streamServerIP[deviceId], destinationPort: this.LG_live_port, deviceId });
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

    async streamRecServerSetting() {
        let getstreamcambody = this.createSoapBody("<ns1:GetStreamCam/>");
        let response = await this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + this.LG_server_ip + ":" + this.LG_server_port, getstreamcambody);
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
            streamServerList.map(item => {
                if(item.hasOwnProperty("ns1:strStrServerName")){    
                    streamServerIP[item["ns1:strStrServerName"]] = item["ns1:strStrServerIP"]
                }
            })
        }


        let streamServerIPFromCamId = {}
        camAssign.map(item => {
            streamServerIPFromCamId[item["ns1:strCameraID"]] = streamServerIP[item["ns1:strStrServerName"]]
        })
      
        this.streamServerIP = streamServerIPFromCamId
        return streamServerIPFromCamId

    }

    async getStrNameFromCamId(callback) {
        const serverId = "192.168.4.106";
        const soapBody  = this.createSoapBody(
            `<tns:GetRecordCam>
                <tns:ServerID>${serverId}</tns:ServerID>
            </tns:GetRecordCam> `
        )
        const response = await this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + this.LG_server_ip + ":" + this.LG_server_port, soapBody)
        let camassign = this.parseResponse(response)["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:GetStreamCamResponse"]["ns1:GetStreamCamResult"]["ns1:STREAMCAMASSIGN"]

        let strnamefromcamid = {}
        camassign.map(item => {
            strnamefromcamid[item["ns1:strCameraID"]] = item["ns1:strStrServerName"]
        })
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