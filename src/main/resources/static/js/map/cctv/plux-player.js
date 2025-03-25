
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
    }

    playBack(deviceId, startDate, endTime) {
        if (this.decodeWorker) {
            this.decodeWorker.terminate()
        }
        this.decodeWorker = new Worker("./plux-playback-worker.js");
        this.decodeWorker.postMessage({ relayServerUrl: this.wsRelayUrl + ":" + this.wsRelayPort, destinationIp: this.LG_server_ip, destinationPort: this.LG_playback_port, deviceId, startDate, endTime });
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
        this.decodeWorker = new Worker("./plux-live-worker.js");
        this.decodeWorker.postMessage({ relayServerUrl: this.wsRelayUrl + ":" + this.wsRelayPort, destinationIp: this.LG_server_ip, destinationPort: this.LG_live_port, deviceId });
        this.decodeWorker.onmessage = (e) => {
            var eventData = e.data
            if (eventData.function == "decodeFrame") {
                let frame = eventData.frame

                this.ctx.drawImage(frame, 0, 0, this.canvasDom.width, this.canvasDom.height);
                frame.close();
            }
        };

    }

    ptzControl(deviceUrl, devicePort, x, y, id, password) {
        console.log(deviceUrl, devicePort, x, y, id, password)

        this.generatePasswordDigest(password).then(digest => {
            let bodyContent;
            if (x == 0 && y == 0) {
                this.ptzStop(deviceUrl, devicePort, id, password)
            } else {

                let soap_message = `<?xml version="1.0" encoding="utf-8"?>
            <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
                <s:Header>  
                    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                    <wsse:UsernameToken><wsse:Username>${id}</wsse:Username>
                    <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">${digest.passwordDigest}</wsse:Password>
                    <wsse:Nonce>${digest.nonce}</wsse:Nonce><wsu:Created>${digest.created}</wsu:Created></wsse:UsernameToken>
                </wsse:Security>
                </s:Header>
                <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                <ContinuousMove xmlns="http://www.onvif.org/ver20/ptz/wsdl">
                    <ProfileToken>DefaultProfile-01-0</ProfileToken>
                    <Velocity>
                        <PanTilt x="${x}" y="${y}"
                            space="http://www.onvif.org/ver10/tptz/PanTiltSpaces/VelocityGenericSpace"
                            xmlns="http://www.onvif.org/ver10/schema" />
                    </Velocity>
                </ContinuousMove>
            </s:Body>
            </s:Envelope>`

                this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + deviceUrl + ":" + devicePort + "/onvif/ptz_service", soap_message).then(response => {
                    console.log(response)
                });
            }
        })

    }
    zoom(deviceUrl, devicePort, id, password, zoom) {
        this.generatePasswordDigest(password).then(digest => {
            if (zoom > 2) {
                zoom = 2
            } else if (zoom < -2) {
                zoom = -2
            }
            let soap_message = `<?xml version="1.0" encoding="utf-8"?>
            <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
                <s:Header>  
                    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                    <wsse:UsernameToken><wsse:Username>${id}</wsse:Username>
                    <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">${digest.passwordDigest}</wsse:Password>
                    <wsse:Nonce>${digest.nonce}</wsse:Nonce><wsu:Created>${digest.created}</wsu:Created></wsse:UsernameToken>
                </wsse:Security>
                </s:Header>
                <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                <ContinuousMove xmlns="http://www.onvif.org/ver20/ptz/wsdl">
                    <ProfileToken>DefaultProfile-01-0</ProfileToken>
                    <Velocity>
                        <Zoom x="${zoom}"
                    space="http://www.onvif.org/ver10/tptz/PanTiltSpaces/VelocityGenericSpace"
                    xmlns="http://www.onvif.org/ver10/schema" />
                    </Velocity>
                </ContinuousMove>
            </s:Body>
            </s:Envelope>`

            this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + deviceUrl + ":" + devicePort + "/onvif/ptz_service", soap_message).then(response => {
                console.log(response)
            });

        })

    }

    ptzStop(deviceUrl, devicePort, id, password) {
        this.generatePasswordDigest(password).then(digest => {

            let soap_message = `<?xml version="1.0" encoding="utf-8"?>
            <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
                <s:Header>  
                    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
                    <wsse:UsernameToken><wsse:Username>${id}</wsse:Username>
                    <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">${digest.passwordDigest}</wsse:Password>
                    <wsse:Nonce>${digest.nonce}</wsse:Nonce><wsu:Created>${digest.created}</wsu:Created></wsse:UsernameToken>
                </wsse:Security>
                </s:Header>
                <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                    <Stop xmlns="http://www.onvif.org/ver20/ptz/wsdl">
                        <ProfileToken>DefaultProfile-01-0</ProfileToken>
                        <PanTilt>true</PanTilt>
                        <Zoom>true</Zoom>
                        </Stop>
                </s:Body>
            </s:Envelope>`

            this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + deviceUrl + ":" + devicePort + "/onvif/ptz_service", soap_message).then(response => {
                console.log(response)
            });

        })
    }


    getDeviceInfo(callback) {

        const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
            <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://www.w3.org/2003/05/soap-envelope"
                            xmlns:SOAP-ENC="http://www.w3.org/2003/05/soap-encoding"
                            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                            xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                            xmlns:ns2="http://tempuri.org/VMSConfigWebServiceSoap"
                            xmlns:ns1="http://tempuri.org/"
                            xmlns:ns3="http://tempuri.org/VMSConfigWebServiceSoap12">
                <SOAP-ENV:Body>
                    <ns1:GetDeviceInfoExt />
                </SOAP-ENV:Body>
            </SOAP-ENV:Envelope>`;

        this.sendSoapRequest(this.httpRelayUrl + ":" + this.httpRelayPort, "http://" + this.LG_server_ip + ":" + this.LG_server_port, soapBody).then(response => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(response, "text/xml");
            let json = this.xmlToJson(xml);
            let cameraList = json["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ns1:GetDeviceInfoExtResponse"]["ns1:GetDeviceInfoExtResult"]["ns1:CAMERA_DATA_EXT"]
            callback(cameraList)
        });

    }

    sendSoapRequest = (relayUrl, targetServerUrl, soapBody) => {
        return new Promise((resolve, reject) => {
            fetch(relayUrl, {
                method: "POST",  // POST 메서드 사용
                headers: {
                    "Content-Type": "application/json",  // JSON 형식으로 요청 전송
                },
                body: JSON.stringify({
                    url: targetServerUrl,
                    data: soapBody    // SOAP 요청 본문
                })
            })
                .then(response => {
                    if (!response.ok) {
                        return reject(`HTTP error! Status: ${response.status}`);
                    }

                    return response.text();  // SOAP 응답 본문을 텍스트로 반환
                })
                .then(responseText => {
                    resolve(responseText);  // 성공적인 응답 처리
                })
                .catch(error => {
                    reject(error);  // 에러 처리
                });
        });
    };



    generatePasswordDigest(password) {

        const created = this.getUTCTimestamp()
        const nonceBytes = this.getRandomBytes()

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

        return crypto.subtle.digest("SHA-1", digestSource).then(hashBuffer => {
            // Step 3: 결과를 Base64로 인코딩
            const sha1Digest = new Uint8Array(hashBuffer);
            const passwordDigest = btoa(String.fromCharCode.apply(null, sha1Digest));

            return { nonce, created, passwordDigest };
        });

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