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

    class SPSParser {
        constructor(arrayBuffer) {
            this.data = new Uint8Array(arrayBuffer);
            this.bitOffset = 0;
            this.parseStart()
        }
        see() {
            let bitString = '';  // 비트 스트림을 저장할 문자열

            // 현재 bitOffset부터 끝까지 비트 읽기
            while (this.bitOffset < this.data.length * 8) {
                const byteIndex = Math.floor(this.bitOffset / 8);
                const bitIndex = 7 - (this.bitOffset % 8); // MSB부터 읽음
                const bitValue = (this.data[byteIndex] >> bitIndex) & 1;
                bitString += bitValue;  // 비트 값을 문자열에 추가
                this.bitOffset++;
            }

            // console.log(bitString);  // 출력된 비트 스트림을 콘솔에 표시
        }
        // n 비트 읽기 (u(n))
        readBits(n) {
            let value = 0;
            for (let i = 0; i < n; i++) {
                const byteIndex = Math.floor(this.bitOffset / 8);
                const bitIndex = 7 - (this.bitOffset % 8); // MSB 먼저 읽음
                value = (value << 1) | ((this.data[byteIndex] >> bitIndex) & 1);
                this.bitOffset++;
            }
            return value;
        }

        // ue(v) 읽기
        readUE() {
            let leadingZeros = 0;
            while (this.readBits(1) === 0) {
                leadingZeros++;
            }
            const value = (1 << leadingZeros) - 1 + this.readBits(leadingZeros);
            return value;
        }

        // se(v) 읽기
        readSE() {
            const ueValue = this.readUE();
            const sign = (ueValue % 2 === 0) ? -1 : 1;
            return sign * Math.ceil(ueValue / 2);
        }
        parseScalingList(size) {
            const scalingList = [];
            let lastScale = 8;
            let nextScale = 8;
            let useDefaultScalingMatrixFlag = false;

            for (let i = 0; i < size; i++) {
                if (nextScale !== 0) {
                    const deltaScale = this.readSE();
                    nextScale = (lastScale + deltaScale + 256) % 256;
                    useDefaultScalingMatrixFlag = (nextScale === 0);
                }
                scalingList[i] = nextScale === 0 ? lastScale : nextScale;
                lastScale = scalingList[i];
            }

            return { scalingList, useDefaultScalingMatrixFlag };
        }
        parseStart() {
            // this.nalUnitType = this.readBits(8);
            this.forbiddenZeroBit = this.readBits(1)
            this.nalRefIdc = this.readBits(2)
            this.nalUnitType = this.readBits(5)
            this.profileIdc = this.readBits(8)
            this.constaraintSet0Flag = this.readBits(1)
            this.constaraintSet1Flag = this.readBits(1)
            this.constaraintSet2Flag = this.readBits(1)
            this.constaraintSet3Flag = this.readBits(1)
            this.constaraintSet4Flag = this.readBits(1)
            this.constaraintSet5Flag = this.readBits(1)
            this.reserver_zero2Bit = this.readBits(2)
            this.levelIdc = this.readBits(8)
            this.seqParameterSetId = this.readUE()
            if ([100, 110, 122, 244, 44, 83, 86, 118, 128, 138, 139, 134, 135].includes(this.profileIdc)) {
                this.chromaFormatIdc = this.readUE()
                if (this.chromaFormatIdc == 3) {
                    this.separateColourPlaneFlag = this.readBits(1)
                }
                this.bitDepthLumaMinus8 = this.readUE()
                this.bitDepthChromaMinus8 = this.readUE()
                this.qppimeYZeroTransformBypassFlag = this.readBits(1)
                this.seqScalingMatrixPresentFlag = this.readBits(1)
                if (this.seqScalingMatrixPresentFlag) {
                    for (let i = 0; i < ((this.chromaFormatIdc != 3) ? 8 : 12); i++) {
                        let seqScalingListPresentFlag = this.readBits(1)
                        if (seqScalingListPresentFlag) {
                            if (i < 6) {
                                const { scalingList, useDefaultScalingMatrixFlag } = this.parseScalingList(16);
                                scalingMatrix4x4[i] = { scalingList, useDefaultScalingMatrixFlag };
                            } else {
                                const { scalingList, useDefaultScalingMatrixFlag } = this.parseScalingList(64);
                                scalingMatrix8x8[i - 6] = { scalingList, useDefaultScalingMatrixFlag };
                            }
                        }
                    }
                }

            }
            this.log2MaxFrameNumMinus4 = this.readUE()
            this.picOrderCntType = this.readUE()

            if (this.picOrderCntType === 0) {
                this.log2MinPicOrderCntLsbMinus4 = this.readUE()
            } else if (this.picOrderCntType === 1) {
                this.deltaPicOrderAwaysZeroFlag = this.readBits(1)
                this.offsetForNonRefPic = this.readSE()
                this.offsetForTopToBottomField = this.readSE()
                this.numRefFramesInPicOrderCntCycle = this.readUE()
                this.offsetForRefPic = []
                for (let i = 0; i < this.numRefFramesInPicOrderCntCycle; i++) {
                    this.offsetForRefPic[i] = this.readSE()
                }
            }
            this.maxNumRefFrames = this.readUE()
            this.gapsInFrameNumValueArrowFlag = this.readBits(1)

            this.picWidthInMbsMinus1 = this.readUE()
            this.picHeightInMapUnitsMinus1 = this.readUE()



            this.frameMbsOnlyFlag = this.readBits(1)
            if (!this.frameMbsOnlyFlag) {
                this.mbaffFrameFlag = this.readBits(1)
            }

            this.width = (this.picWidthInMbsMinus1 + 1) * 16
            this.height = (2 - this.frameMbsOnlyFlag) * (this.picHeightInMapUnitsMinus1 + 1) * 16

            this.direct8x8InferenceFlag = this.readBits(1)
            this.frameCroppingFlag = this.readBits(1)
            if (this.frameCroppingFlag) {
                this.frameCropLeftOffset = this.readUE()
                this.frameCropRightOffset = this.readUE()
                this.frameCropTopOffset = this.readUE()
                this.frameCropBottomOffset = this.readUE()

                let cropUnitX = 1;
                let cropUnitY = 2 - this.frameMbsOnlyFlag;
                if (this.chromaFormatIdc == 1) {
                    cropUnitX = 2
                    cropUnitY = 2 * (2 - this.frameMbsOnlyFlag);
                } else if (this.chromaFormatIdc == 2) {
                    cropUnitX = 2
                    cropUnitY = 2 - this.frameMbsOnlyFlag
                }
                this.width -= cropUnitX * (this.frameCropLeftOffset + this.frameCropRightOffset);
                this.height -= cropUnitY * (this.frameCropTopOffset + this.frameCropBottomOffset);

            }

            this.vuiParametersPresentFlag = this.readBits(1)

            if (this.vuiParametersPresentFlag) {
                this.vuiParamerters()
            }
        }
        vuiParamerters() {
            this.aspectRatioInfoPresentFlag = this.readBits(1)
            if (this.aspectRatioInfoPresentFlag) {
                this.aspectRatioIdc = this.readBits(8)
                // console.log(this.aspectRatioIdc, "이거 확인 필요")
                if (this.aspectRatioIdc === "Extended_SAR" || this.aspect_ratio_idc === 255) {
                    this.sarWidth = this.readBits(16)
                    this.sarHeight = this.readBits(16)
                    // console.log("sar : ", this.sarHeight, this.sarWidth)
                }
            }
            this.overscanInfoPresentFlag = this.readBits(1)
            if (this.overscanInfoPresentFlag) {
                this.overscanAppropriateFlag = this.readBits(1)
            }
            this.videoSignalTypePresentFlag = this.readBits(1)
            if (this.videoSignalTypePresentFlag) {
                this.videoFormat = this.readBits(3)
                this.videoFullRangeFlag = this.readBits(1)
                this.colourDescriptionPresentFlag = this.readBits(1)
                if (this.colourDescriptionPresentFlag) {
                    this.colourPrimaries = this.readBits(8)
                    this.transferCharacteristics = this.readBits(8)
                    this.matrixCoefficients = this.readBits(8)
                }
            }

            this.chromaLocInfoPresentFlag = this.readBits(1)
            if (this.chromaLocInfoPresentFlag) {
                this.chromaSampleLocationTypeTopField = this.readUE()
                this.chromaSampleLocationTypeBottomField = this.readUE()
            }
            this.timingInfoPresentFlag = this.readBits(1)
            if (this.timingInfoPresentFlag) {

                this.numUnitsInTick = this.readBits(32)
                this.timeScale = this.readBits(32)
                this.fixedFrameRateFlag = this.readBits(1)

                this.fps = (this.timeScale / (this.numUnitsInTick)) / 2

                if (this.fixedFrameRateFlag) {

                }
            }
            this.nalHrdParametersPresentFlag = this.readBits(1)
            if (this.nalHrdParametersPresentFlag) {
                console.log("run hrd parameters()")
            }
            this.vclHrdParametersPresentFlag = this.readBits(1)
            if (this.vclHrdParametersPresentFlag) {
                console.log("run hrd parameters()")
            }

            if (this.nalHrdParametersPresentFlag || this.vclHrdParametersPresentFlag) {
                this.lowDelayHrdFlag = this.readBits(1)
                console.log("load low delay")
            }
            this.picStructPresentFlag = this.readBits(1)
            this.bitstreamResticitionFlag = this.readBits(1)
            if (this.bitstreamResticitionFlag) {
                this.motionVectorOverPicBoundariesFlag = this.readBits(1)
                this.maxBytesPerPicDenom = this.readUE()
                this.maxBitsPerMbDenom = this.readUE()
                this.log2MaxMvLengthHorizontal = this.readUE()
                this.log2MaxMvLengthVertical = this.readUE()
                this.maxNumRecoderFrames = this.readUE()
                this.maxDecFrameBuffering = this.readUE()
            }
        }
    }

    const decoder = new VideoDecoder({
        output: (frame) => {
            if (startSeconds <= frame.timestamp) {
                decodeFrameArr.push(frame);
            }
            // frame.close()
            // postMessage({ 'function': "decodeFrame", frame: frame }, frame);
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

    HEADER_SIZE = 16;
    VMS_SEPARATOR = 0x00BF00BF
    VMS_VERSION = 0x0001;

    let decodeFrameArr = [];
    let fps = 0;

    let relaySocket
    let startPacket
    let bePacket
    let stopPacket
    let keepAllivePacket
    let relayServerUrl
    let destinationIp
    let destinationPort
    let deviceId
    let startDate
    let sendDate

    let endTime
    let endDate

    let isPauseRequested = false;

    let bufferQueue = new Uint8Array();
    let lastTime = performance.now();
    let pauseStartTime = null;
    function sendFrameInterval(currentTime) {

        if (fps) {
            let interval = 1000 / fps;

            if (decodeFrameArr.length > 0) {

                if (currentTime - lastTime >= interval) {
                    lastTime = currentTime;
                    let frame = decodeFrameArr.shift()

                    postMessage({ 'function': "decodeFrame", frame: frame }, frame);
                }
            }
        }
        requestAnimationFrame(sendFrameInterval);
    }


    function pausePlayback() {
        isPauseRequested = true;
        relaySocket.send(stopPacket);
    }

    function resumePlayback() {
        if (pauseStartTime) {
            sendDate = pauseStartTime;
            startDate = sendDate;

            startPacket = createPlayPacket();
            bePacket = createPlayPacket(true);
        }

        // 서버에 재시작 요청
        relaySocket.send(startPacket);

        pauseStartTime = null;
    }

    function stopPlayback() {
        console.log("CCTV 재생 워커 정지 요청")
        if (relaySocket) {
            relaySocket.send(stopPacket);
            relaySocket.close();
        }
    }

    requestAnimationFrame(sendFrameInterval);

    function connectionRelay() {
        relaySocket = new WebSocket(`${relayServerUrl}/${destinationIp}/${destinationPort}`)
        relaySocket.binaryType = 'arraybuffer'
        relaySocket.addEventListener('open', () => {
            console.log("open")
            sendPlayReq()
        })
        relaySocket.addEventListener('message', (e) => {
            socketOnMessage(e)
        })
        relaySocket.addEventListener("close", (event) => {
            console.log('WebSocket 연결 종료 - 코드:', event.code);
        });

        relaySocket.addEventListener("error", (e) => {
            console.error('WebSocket 에러 발생:', e)
        });
    }

    function sendPlayReq() {
        relaySocket.send(startPacket)
    }

    function socketOnMessage(e) {
        let buffer = e.data
        //console.log(buffer)
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

        // console.log('sep',dwSeparator)
        // console.log('version',wVersion)
        // console.log('headersize',wHeaderSize)

        // console.log('wreqtype',wReqType)
        // console.log('dwbodysize', dwBodySize)
        // console.log("====")
        // return

        // 데이터 부족 확인
        if (bufferQueue.byteLength < HEADER_SIZE + dwBodySize) {
            bufferByteReader = null
            return;
        }

        bufferQueue = bufferQueue.slice(HEADER_SIZE + dwBodySize);

        if (wReqType == 105 || wReqType == 102) {
            console.log("재생 packet");
            parsePlaybackBuffer(bufferByteReader)
        } else if (wReqType == 304) {
            // relaySocket.send(bePacket)
        } else if (wReqType == 108) {
            console.log("재생 중지 packet");
            startPacket = createPlayPacket()
            bePacket = createPlayPacket(true)
            stopPacket = createStopPacket()
        } else if (wReqType == 303) {

            if (!isPauseRequested) {
                self.postMessage({
                    function: "error",
                    errorType: "NO_DATA",
                    message: "해당 시간에 재생할 수 있는 데이터가 없습니다."
                });
            }
        } else if (wReqType == 1111) {
            console.log("네트워크가 불안정하여 재생이 중단됨");
        } else {
            console.log("unknown request type:", wReqType, "- 예상하지 못한 패킷 타입");
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

    function createPlayPacket(afterFlag = false) {
        // VMS_COMMON_HEADER constants

        // let reqtype = speed > 0 ? 101 : 103
        let reqtype, speed
        if (afterFlag) {
            reqtype = 102
            speed = 1
        } else {
            reqtype = 105
            speed = 0
        }

        // VMS_COMMON_HEADER_SEPARATOR를 ArrayBuffer로 변환

        let IdBuffer = bufferSerialize(deviceId, "CHAR")
        let cTypeBuffer = bufferSerialize(reqtype, "WORD")
        let dateBuffer = bufferSerialize(sendDate, "SYSTEMTIME")
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

    function createStopPacket() {
        // VMS_COMMON_HEADER constants

        // let reqtype = speed > 0 ? 101 : 103
        let reqtype = 108
        let speed = 0

        // VMS_COMMON_HEADER_SEPARATOR를 ArrayBuffer로 변환

        let IdBuffer = bufferSerialize(deviceId, "CHAR")
        let cTypeBuffer = bufferSerialize(reqtype, "WORD")
        let dateBuffer = bufferSerialize(sendDate, "SYSTEMTIME")
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

    let flag = false
    function parsePlaybackBuffer(byteReader) {
        let dwSeparator = byteReader.readTypes("WORD")
        let cctvId = byteReader.readTypes("CHAR32");

        let type = byteReader.readTypes("WORD")
        byteReader.skipBytes(16)  //can't find
        let length = byteReader.readTypes("DWORD")
        byteReader.skipBytes(14) //can't find
        let isIframe = byteReader.readTypes("WORD")

        let width = byteReader.readTypes("WORD")
        let height = byteReader.readTypes("WORD")

        let timeBuffer = byteReader.readBytes(12)

        let tView = new DataView(timeBuffer);
        let timezoneOffsetSeconds = tView.getInt32(0, true);
        let bufferDate = secondToDate(timezoneOffsetSeconds)

        let totalDataLength = byteReader.readBytes(8)
        let length2 = byteReader.readTypes(4)
        let frameData = byteReader.readToLasted()

        if (type == 105) {
            if (bufferDate > new Date(startDate.getTime() + 1000)) {
                console.warn("서버에서 받은 영상 프레임의 시간이 요청한 재생 시작 시간보다 늦음. 재생 중지.");
                console.warn("bufferDate:", bufferDate, "startDate:", startDate)
                relaySocket.send(stopPacket)
                sendDate.setSeconds(sendDate.getSeconds() - 5)
                return
            }
        }

        if (bufferDate <= endDate) {
            // 현재 프레임의 timestamp를 저장 (일시정지용)
            pauseStartTime = bufferDate;
            console.log("time : ",pauseStartTime);

            let spsParser = new SPSParser(frameData.slice(3, 27))
            // console.log(spsParser.fps)
            // console.log(spsParser.fps)
            if (spsParser.fps) {
                fps = spsParser.fps
            }
            const rawPacket = new Uint8Array(frameData);
            const chunk = new EncodedVideoChunk({
                timestamp: timezoneOffsetSeconds, // 각 패킷의 타임스탬프
                type: isIframe == 1 ? "key" : 'delta', // 또는 'delta'
                data: rawPacket, // raw H.264 데이터
                duration: 0
            });
            decoder.decode(chunk);

            setTimeout(() => {
                relaySocket.send(bePacket)
            }, 20)

        } else {
            relaySocket.close()
        }


    }

    function setEndDate() {
        endDate = new Date(startDate);

        // this.endTime.hour 값이 있을 경우에만 처리
        if (endTime.hour !== undefined && endTime.hour !== null) {
            endDate.setHours(endDate.getHours() + endTime.hour);
        }

        // this.endTime.minutes 값이 있을 경우에만 처리
        if (endTime.minutes !== undefined && endTime.minutes !== null) {
            endDate.setMinutes(endDate.getMinutes() + endTime.minutes);
        }

        // this.endTime.second 값이 있을 경우에만 처리
        if (endTime.second !== undefined && endTime.second !== null) {
            endDate.setSeconds(endDate.getSeconds() + endTime.second);
        }

    }
    function secondToDate(offsetSeconds) {
        let baseDate = new Date(Date.UTC(1970, 0, 1));
        baseDate.setSeconds(baseDate.getSeconds() + offsetSeconds);
        return baseDate;

    }

    function dateToSeconds(date) {

        return Math.floor(date.getTime() / 1000);
    }

    onmessage = function (event) {
        var eventData = event.data

        // 재생 제어 명령 처리
        if (eventData.command) {
            switch (eventData.command) {
                case 'pause':
                    pausePlayback();
                    break;
                case 'resume':
                    resumePlayback();
                    break;
                case 'stop':
                    stopPlayback();
                    break;

                default:
                    console.log("알 수 없는 명령:", eventData.command);
            }
            return; // 초기화 로직 건너뛰기
        }

        relayServerUrl = eventData.relayServerUrl
        destinationIp = eventData.destinationIp
        destinationPort = eventData.destinationPort
        deviceId = eventData.deviceId
        startDate = eventData.startDate
        startSeconds = dateToSeconds(startDate)

        sendDate = new Date(startDate)
        endTime = eventData.endTime


        setEndDate()
        console.log("endDate", endDate);

        startPacket = createPlayPacket()
        bePacket = createPlayPacket(true)
        stopPacket = createStopPacket()

        let sp = Array.from(new Uint8Array(startPacket)).map(byte => byte.toString(16).padStart(2, "0")).join('')
        connectionRelay()
    };

})();