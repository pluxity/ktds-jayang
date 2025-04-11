(function () {

    class bytesReader {

        constructor(buffer) {
            this.buffer = buffer;
            this.dataView = new DataView(buffer)
            this.byteOffset = 0;
        }
        readTypes(type) {
            let parsedData = null

            switch (type) {
                case "WORD": // 2-byte unsigned integer
                    parsedData = this.dataView.getUint16(this.byteOffset, true); // Little-endian
                    this.byteOffset += 2
                    break;

                case "DWORD": // 4-byte unsigned integer
                    parsedData = this.dataView.getUint32(this.byteOffset, true); // Little-endian
                    this.byteOffset += 4
                    break;

                case "CHAR32": { // 32-byte character string
                    const charBuffer = new Uint8Array(32);
                    for (let i = 0; i < 32; i++) {
                        charBuffer[i] = this.dataView.getUint8(this.byteOffset + i); // Read each byte using DataView
                    }

                    const nullIndex = charBuffer.indexOf(0); // Find the first null terminator (\x00)
                    const validBuffer = nullIndex !== -1 ? charBuffer.slice(0, nullIndex) : charBuffer;

                    parsedData = new TextDecoder("ascii")
                        .decode(validBuffer)
                        .replace(/[^\x20-\x7E]/g, ""); // Remove invalid ASCII characters
                    this.byteOffset += 32;
                    break;
                }

                case "INT": // 4-byte signed integer
                    parsedData = this.dataView.getInt32(this.byteOffset, true); // Little-endian
                    this.byteOffset += 4
                    break;

                case "BOOL": // 1-byte boolean

                    parsedData = Boolean(this.dataView.getUint8(this.byteOffset));
                    this.byteOffset += 1

                    break;

                case "SYSTEMTIME": { // 16-byte SYSTEMTIME structure


                    const fields = {
                        year: this.readTypes("WORD"),
                        month: this.readTypes("WORD"),
                        dayOfWeek: this.readTypes("WORD"),
                        day: this.readTypes("WORD"),
                        hour: this.readTypes("WORD"),
                        minute: this.readTypes("WORD"),
                        second: this.readTypes("WORD"),
                        milliseconds: this.readTypes("WORD"),
                    };

                    // Validate and convert to Date object if applicable
                    if (fields.year >= 2000 && fields.year < 3000) {
                        parsedData = new Date(Date.UTC(
                            fields.year,
                            fields.month - 1, // Months are zero-based
                            fields.day,
                            fields.hour,
                            fields.minute,
                            fields.second,
                            fields.milliseconds
                        ));
                    } else {
                        parsedData = fields; // Return raw SYSTEMTIME object if year is invalid
                    }
                    break;
                }
            }
            return parsedData
        }
        readBytes(num) {
            return this.buffer.slice(this.byteOffset, this.byteOffset += num)
        }
        readToLasted() {
            return this.buffer.slice(this.byteOffset, this.buffer.byteLength)
        }

        skipBytes(num) {
            this.byteOffset += num;
        }
    }

    HEADER_SIZE = 16;
    VMS_SEPARATOR = 0x00BF00BF
    VMS_VERSION = 0x0001;

    let relaySocket
    let startPacket
    let retryCount = 0
    let bePacket
    let keepAllivePacket
    let keepAlliveCount = 0
    let relayServerUrl
    let destinationIp
    let destinationPort
    let deviceId
    let startDate

    let bufferQueue = new Uint8Array();


    const decoder = new VideoDecoder({
        output: (frame) => {
            // decodeFrameArr.push(frame);
            // frame.close()
            postMessage({ 'function': "decodeFrame", frame: frame }, frame);
        },
        error: (err) => {
            postMessage({ 'function': "error", err: err });
        }
    });

    decoder.configure({
        codec: 'avc1.42E01E', // H.264 기본 프로파일
        avc: "annexb",
        // hardwareAcceleration: "no-preference",
        // hardwareAcceleration: "prefer-hardware",
        hardwareAcceleration: "prefer-software",
        optimizeForLatency: false
    });

    function connectionRelay() {
        relaySocket = new WebSocket(`${relayServerUrl}/${destinationIp}/${destinationPort}`)
        relaySocket.binaryType = 'arraybuffer'
        relaySocket.addEventListener('open', () => {
            sendPlayReq()
        })
        relaySocket.addEventListener('message', (e) => {
            socketOnMessage(e)
        })
        relaySocket.addEventListener("close", () => {
            console.log('socket closed')
        });

        relaySocket.addEventListener("error", (e) => {
            console.log('socket err', e)
        });
    }

    function sendPlayReq() {
        relaySocket.send(startPacket)
    }

    function socketOnMessage(e) {
        let buffer = e.data
        //console.log(buffer)
        let b = Array.from(new Uint8Array(buffer)).map(byte => byte.toString(16).padStart(2, "0")+"-").join('')
        //console.log(b)
        bufferQueue = concatBuffers(bufferQueue, buffer);
        processBuffer()
    }

    function processBuffer() {

        if (bufferQueue.byteLength < HEADER_SIZE) {
            return;
        }
        // 헤더 추출
        let bufferByteReader = new bytesReader(bufferQueue)

        let dwSeparator = bufferByteReader.readTypes("DWORD")
        let wVersion = bufferByteReader.readTypes("WORD")
        let wHeaderSize = bufferByteReader.readTypes("WORD")

        let wReqType = bufferByteReader.readTypes("DWORD")
        let dwBodySize = bufferByteReader.readTypes("DWORD")

        // 데이터 부족 확인
        if (bufferQueue.byteLength < HEADER_SIZE + dwBodySize) {
            bufferByteReader = null
            return;
        }

        bufferQueue = bufferQueue.slice(HEADER_SIZE + dwBodySize);
        //console.log(bufferQueue)

        //console.log(wReqType)
        if (wReqType == 400) {
            console.log(wReqType)
            // parseLiveBuffer(bufferByteReader)
        } else if (wReqType == 402) {
             //console.log(wReqType)
             //relaySocket.send(startPacket)

            if (retryCount > 5000) {
                return
            } else {
                relaySocket.send(startPacket)
                retryCount++
            }
        } else if (wReqType == 403) {
            parseLiveBuffer(bufferByteReader)
        } else {
            console.log("unknown request type: ", wReqType)
            // parseLiveBuffer(bufferByteReader)
        }
        // 남은 데이터 처리
        processBuffer();
    }

    function bufferSerialize(value, type) {
        let buffer = null;

        switch (type) {
            case "WORD": { // 2-byte unsigned integer
                buffer = new ArrayBuffer(2); // 2바이트 크기의 버퍼 생성
                const dataView = new DataView(buffer);
                dataView.setUint16(0, value, true); // Little-endian 방식으로 설정
                break;
            }

            case "DWORD": { // 4-byte unsigned integer
                buffer = new ArrayBuffer(4); // 4바이트 크기의 버퍼 생성
                const dataView = new DataView(buffer);
                dataView.setUint32(0, value, true); // Little-endian 방식으로 설정
                break;
            }

            case "CHAR": { // 32-byte character
                buffer = new ArrayBuffer(32); // 32바이트 크기의 버퍼 생성
                const dataView = new DataView(buffer);
                const encoder = new TextEncoder();
                const charBytes = encoder.encode(value);
                for (let i = 0; i < 32; i++) {
                    dataView.setUint8(i, charBytes[i] || 0); // 0으로 패딩
                }
                break;
            }


            case "INT": { // 4-byte signed integer
                buffer = new ArrayBuffer(4); // 4바이트 크기의 버퍼 생성
                const dataView = new DataView(buffer);
                dataView.setInt32(0, value, true); // Little-endian 방식으로 설정
                break;
            }

            case "BOOL": { // 1-byte boolean
                buffer = new ArrayBuffer(1); // 1바이트 크기의 버퍼 생성
                const dataView = new DataView(buffer);
                dataView.setUint8(0, value ? 1 : 0); // true는 1, false는 0
                break;
            }

            case "SYSTEMTIME": { // 16-byte SYSTEMTIME structure
                buffer = new ArrayBuffer(16); // 16바이트 크기의 버퍼 생성
                const dataView = new DataView(buffer);
                dataView.setUint16(0, value.getUTCFullYear(), true);  // 연도
                dataView.setUint16(2, value.getUTCMonth() + 1, true);  // 월 (0부터 시작하므로 1을 더함)
                dataView.setUint16(4, value.getUTCDay(), true);  // 요일 (일요일 = 0, 월요일 = 1, ...)
                dataView.setUint16(6, value.getUTCDate(), true);  // 일 (1~31)
                dataView.setUint16(8, value.getUTCHours(), true);  // 시간 (0~23)
                dataView.setUint16(10, value.getUTCMinutes(), true);  // 분 (0~59)
                dataView.setUint16(12, value.getUTCSeconds(), true);  // 초 (0~59)
                dataView.setUint16(14, value.getMilliseconds(), true);  // 밀리초 (0~999)

                break;
            }

            case "BYTE4": { // 16-byte SYSTEMTIME structure
                buffer = new ArrayBuffer(4); // 16바이트 크기의 버퍼 생성
                const dataView = new DataView(buffer);
                dataView.setUint32(0, value);
                break;
            }

            default:
                throw new Error("Unsupported type: " + type);
        }
        return buffer;
    }

    function concatBuffers(buffer1, buffer2) {
        const result = new ArrayBuffer(buffer1.byteLength + buffer2.byteLength);
        const resultView = new Uint8Array(result);  // 새로운 ArrayBuffer에 대한 뷰 생성
        const buffer1View = new Uint8Array(buffer1);
        const buffer2View = new Uint8Array(buffer2);

        resultView.set(buffer1View, 0);  // 첫 번째 버퍼 복사
        resultView.set(buffer2View, buffer1.byteLength);  // 두 번째 버퍼 복사

        return result;  // 결합된 ArrayBuffer 반환
    }

    function appendBuffer(targetView, sourceBuffer, offset) {
        const sourceView = new Uint8Array(sourceBuffer); // 소스 버퍼를 Uint8Array로 변환
        targetView.set(sourceView, offset); // 대상 뷰에 복사
        return offset + sourceView.byteLength; // 새로운 오프셋 반환
    }

    function parseLiveBuffer(byteReader) {
        let dwSeparator = byteReader.readTypes("WORD") //2
        let cctvId = byteReader.readTypes("CHAR32"); // 32
        // console.log(cctvId)
        let type = byteReader.readTypes("WORD") // 2 
        // console.log(type)

        byteReader.skipBytes(16)  //can't find // 16 
        let length = byteReader.readTypes("DWORD") // 4 
        // console.log(length)

        byteReader.skipBytes(14) //can't find
        let isIframe = byteReader.readTypes("WORD")

        let width = byteReader.readTypes("WORD")
        let height = byteReader.readTypes("WORD")

        if (length < 100) {


            relaySocket.send(bePacket);
            return
        }

        if (keepAlliveCount > 100) {
            keepAlliveCount = 0
            keepAllivePacket = createKeepAllivePacket()
            console.log("keepAllivePacket")
            relaySocket.send(keepAllivePacket);
        }
        keepAlliveCount++

        let timeBuffer = byteReader.readBytes(12)

        let tView = new DataView(timeBuffer);
        let timezoneOffsetSeconds = tView.getInt32(0, true);
        let bufferDate = secondToDate(timezoneOffsetSeconds)
        // console.log(width + " width: " + width + " height: " + height, bufferDate)
        let totalDataLength = byteReader.readBytes(8)
        let length2 = byteReader.readTypes(4)
        let frameData = byteReader.readToLasted()


        const rawPacket = new Uint8Array(frameData);
        const chunk = new EncodedVideoChunk({
            timestamp: 0, // 각 패킷의 타임스탬프
            type: isIframe == 1 ? "key" : 'delta', // 또는 'delta'
            data: rawPacket, // raw H.264 데이터
            duration: 0
        });
        decoder.decode(chunk);

        // setTimeout(() => {
        //     relaySocket.send(bePacket)
        // }, 20)


    }

    function createPlayLivePacket(afterFlag = false) {
        // VMS_COMMON_HEADER constants

        // let reqtype = speed > 0 ? 101 : 103
        let reqtype, speed

        if (afterFlag) {
            reqtype = 304
            speed = 0
        } else {
            reqtype = 400
            speed = 1
        }


        // VMS_COMMON_HEADER_SEPARATOR를 ArrayBuffer로 변환

        let IdBuffer = bufferSerialize(deviceId, "CHAR")
        let cTypeBuffer = bufferSerialize(reqtype, "WORD")

        let dateBuffer = bufferSerialize(new Date(), "SYSTEMTIME")
        let speedBuffer = bufferSerialize(speed, "INT")
        let dtsTimeBuffer = bufferSerialize(0, "INT")
        let dtsStartBuffer = bufferSerialize(0, "BOOL")
        let reserved = bufferSerialize(0, "BYTE4")
        let temLength = bufferSerialize(0, "WORD")

        let tempLength = parseInt(IdBuffer.byteLength) + parseInt(cTypeBuffer.byteLength) + parseInt(dateBuffer.byteLength) + parseInt(speedBuffer.byteLength) + parseInt(dtsTimeBuffer.byteLength) + parseInt(dtsStartBuffer.byteLength) + parseInt(reserved.byteLength) + parseInt(temLength.byteLength)
        let subPaddingLength = 4 - (tempLength % 4)

        let subHeadSizeBuffer = bufferSerialize(tempLength + subPaddingLength, "WORD")
        let subHeadBuffer = new ArrayBuffer(tempLength + subPaddingLength);
        let subHeadView = new Uint8Array(subHeadBuffer);

        let offset = 0;
        offset = appendBuffer(subHeadView, subHeadSizeBuffer, offset);
        offset = appendBuffer(subHeadView, IdBuffer, offset);
        offset = appendBuffer(subHeadView, cTypeBuffer, offset);
        offset = appendBuffer(subHeadView, dateBuffer, offset);
        offset = appendBuffer(subHeadView, speedBuffer, offset);
        offset = appendBuffer(subHeadView, dtsTimeBuffer, offset);
        offset = appendBuffer(subHeadView, dtsStartBuffer, offset);
        offset = appendBuffer(subHeadView, reserved, offset);
        //console.log(IdBuffer)
        //printab(IdBuffer)

        if (subPaddingLength > 0) {
            subHeadView.set(new Uint8Array(subPaddingLength), offset);
        }
        let separatorBuffer = bufferSerialize(VMS_SEPARATOR, "DWORD")
        let versionBuffer = bufferSerialize(VMS_VERSION, "WORD")
        let ctTypeBuffer = bufferSerialize(reqtype, "DWORD")
        let wBodySizeBuffer = bufferSerialize(tempLength + subPaddingLength, "DWORD")
        let headerLength = parseInt(separatorBuffer.byteLength) + parseInt(versionBuffer.byteLength) + parseInt(temLength.byteLength) + parseInt(ctTypeBuffer.byteLength) + parseInt(wBodySizeBuffer.byteLength)

        let headSizeBuffer = bufferSerialize(headerLength, "WORD")

        let HeadBuffer = new ArrayBuffer(headerLength);
        let HeadView = new Uint8Array(HeadBuffer);

        let Hoffset = 0
        Hoffset = appendBuffer(HeadView, separatorBuffer, Hoffset);
        Hoffset = appendBuffer(HeadView, versionBuffer, Hoffset);
        Hoffset = appendBuffer(HeadView, headSizeBuffer, Hoffset);
        Hoffset = appendBuffer(HeadView, ctTypeBuffer, Hoffset);
        Hoffset = appendBuffer(HeadView, wBodySizeBuffer, Hoffset);


        let totalLength = HeadBuffer.byteLength + subHeadBuffer.byteLength;
        let packetBuffer = new ArrayBuffer(totalLength);
        let packetView = new Uint8Array(packetBuffer);
        

        // HeadBuffer 복사
        packetView.set(new Uint8Array(HeadBuffer), 0);

        // subHeadBuffer 복사
        packetView.set(new Uint8Array(subHeadBuffer), HeadBuffer.byteLength);

        return packetBuffer;
    }

    function createKeepAllivePacket() {
        // VMS_COMMON_HEADER constants

        // let reqtype = speed > 0 ? 101 : 103
        let reqtype = 308
        let speed = 0


        // VMS_COMMON_HEADER_SEPARATOR를 ArrayBuffer로 변환

        let IdBuffer = bufferSerialize("KEEP_ALLIVE", "CHAR")
        let cTypeBuffer = bufferSerialize(0, "WORD")
        let dateBuffer = bufferSerialize(new Date(), "SYSTEMTIME")
        let speedBuffer = bufferSerialize(speed, "INT")
        let temLength = bufferSerialize(0, "WORD")

        let tempLength = parseInt(IdBuffer.byteLength) + parseInt(cTypeBuffer.byteLength) + parseInt(dateBuffer.byteLength) + parseInt(speedBuffer.byteLength) + parseInt(temLength.byteLength)
        console.log(tempLength)
        // let subPaddingLength = 4 - (tempLength % 4)

        let subHeadSizeBuffer = bufferSerialize(tempLength, "WORD")
        let subHeadBuffer = new ArrayBuffer(tempLength);
        let subHeadView = new Uint8Array(subHeadBuffer);

        let offset = 0;
        offset = appendBuffer(subHeadView, subHeadSizeBuffer, offset);
        offset = appendBuffer(subHeadView, IdBuffer, offset);
        offset = appendBuffer(subHeadView, cTypeBuffer, offset);
        offset = appendBuffer(subHeadView, dateBuffer, offset);
        offset = appendBuffer(subHeadView, speedBuffer, offset);



        // if (subPaddingLength > 0) {
        //     subHeadView.set(new Uint8Array(subPaddingLength), offset);
        // }
        let separatorBuffer = bufferSerialize(VMS_SEPARATOR, "DWORD")
        let versionBuffer = bufferSerialize(VMS_VERSION, "WORD")
        let ctTypeBuffer = bufferSerialize(reqtype, "DWORD")
        let wBodySizeBuffer = bufferSerialize(tempLength, "DWORD")
        let headerLength = parseInt(separatorBuffer.byteLength) + parseInt(versionBuffer.byteLength) + parseInt(temLength.byteLength) + parseInt(ctTypeBuffer.byteLength) + parseInt(wBodySizeBuffer.byteLength)

        let headSizeBuffer = bufferSerialize(headerLength, "WORD")

        let HeadBuffer = new ArrayBuffer(headerLength);
        let HeadView = new Uint8Array(HeadBuffer);

        let Hoffset = 0
        Hoffset = appendBuffer(HeadView, separatorBuffer, Hoffset);
        Hoffset = appendBuffer(HeadView, versionBuffer, Hoffset);
        Hoffset = appendBuffer(HeadView, headSizeBuffer, Hoffset);
        Hoffset = appendBuffer(HeadView, ctTypeBuffer, Hoffset);
        Hoffset = appendBuffer(HeadView, wBodySizeBuffer, Hoffset);

        let totalLength = HeadBuffer.byteLength + subHeadBuffer.byteLength;
        let packetBuffer = new ArrayBuffer(totalLength);
        let packetView = new Uint8Array(packetBuffer);

        // HeadBuffer 복사
        packetView.set(new Uint8Array(HeadBuffer), 0);

        // subHeadBuffer 복사
        packetView.set(new Uint8Array(subHeadBuffer), HeadBuffer.byteLength);

        return packetBuffer;
    }

    function secondToDate(offsetSeconds) {
        let baseDate = new Date(Date.UTC(1970, 0, 1));
        baseDate.setSeconds(baseDate.getSeconds() + offsetSeconds);
        return baseDate;

    }

    function printab(buffer) {
        let sp = Array.from(new Uint8Array(buffer)).map(byte => byte.toString(16).padStart(2, "0") + " ").join('')
        console.log(sp)
    }


    onmessage = function (event) {
        var eventData = event.data
        relayServerUrl = eventData.relayServerUrl
        destinationIp = eventData.destinationIp
        destinationPort = eventData.destinationPort
        deviceId = eventData.deviceId
        startDate = eventData.startDate
        console.log(`connect to ${relayServerUrl}/${destinationIp}/${destinationPort} , ${deviceId}`)

        startPacket = createPlayLivePacket()
        bePacket = createPlayLivePacket(true)


        //bf00bf00010010009001000044000000440065343330323239383765303431300000000000000000000000000000000000009001e907040002000800060022001a002e0001000000000000000000000000000000
        //bf00bf00010010009001000044000000440065343330323239383765303431300000000000000000000000000000000000009001e90704000200080006001f000d00b20201000000000000000000000000000000
        //bf00bf00010010009001000044000000440065343330323239383765303430320000000000000000000000000000000000009001e90704000200080006000a002a00380201000000000000000000000000000000
        //bf00bf00010010009c01000044000000440065343330323239383765303430320000000000000000000000000000000000009c01e90704000200080006000a002a00190001000000000000000000000000000000
    
        connectionRelay()
    };



})(); 