const TmsEventHandler = (() => {
    // SSE event 처리
   const executeEvent = async (eventDataList) => {

       let limitCode = 0;
       const poi = PoiManager.findByCode(`tms-${eventDataList[0].deviceCode}`);
       if(!poi) return;

       for (const eventData of eventDataList) {
           const tmsCodeLimit = tmsLimit[eventData.deviceCode];

           const currentValue = eventData.value;
           const limitValue = tmsCodeLimit[eventData.itemCode];

           if (limitValue !== null && currentValue !== null) {
               if (currentValue >= limitValue) limitCode = 1;
           } else if(eventData.itemCode === "SAM00") {
               if(currentValue > 5.0 || currentValue < 3.0) limitCode = 1;
           }
       }

       switch (limitCode) {
           case 1:
               Px.Poi.SetColor(poi.id, 'red');
               break;
           case 0:
               Px.Poi.RestoreColor(poi.id);
               break;
       }

   }

    const renderSetColor = (code) => {

        const tmsId = code.split('-')[1];

        PoiManager.getTmsCurrentData(tmsId).then((response) => {

            const poi = PoiManager.findByCode(`tms-${tmsId}`);
            if(!poi) return;

            const tmsCodeLimit = tmsLimit[tmsId];
            const dataList = response.data;
            let limitCode = 0;

            for (const data of dataList) {

                const currentValue = data.value;
                const limitValue = tmsCodeLimit[data.itemCode];
                if (limitValue !== null && currentValue !== null) {
                    if (currentValue >= limitValue) limitCode = 1;
                } else if(data.itemCode === "SAM00") {
                    if(currentValue > 5.0 || currentValue < 3.0) limitCode = 1;
                }

            }
            switch (limitCode) {
                case 1:
                    Px.Poi.SetColor(poi.id, 'red');
                    break;
                case 0:
                    Px.Poi.RestoreColor(poi.id);
                    break;
            }

        });
    }


    const tmsLimit = {
        "002": {
            "TSP": 15, "SO2": 20, "NOX": 47, "COb": 50, "HCL": 12
        }, "003": {
            "TSP": 20, "SO2": 30, "NOX": 65.8, "COb": 200, "HCL": 15
        }, "006": {
            "TSP": 10, "SO2": 20, "NOX": 47, "COb": 50, "HCL": 10
        }, "007": {
            "TSP": 10, "SO2": 20, "NOX": 47, "COb": 50, "HCL": 10
        }, "041": {
            "TSP": null, "SO2": null, "NOX": 141, "COb": null, "HCL": null
        }, "008": {
            "TSP": 4, "SO2": 15, "NOX": 50, "COb": 40, "HCL": 10
        },
        "0001": {
            "PHY00": 8, "SUS00": 30, "TON00": 25, "TOP00": 1.5, "TOC00": 30
        }
    };

   const tmsUnit = {

   }

    const tmsName = {
        "COb": "일산화탄소(ppm)",
        "HCL" : "염화수소(ppm)",
        "NOX": "질소산화물(ppm)",
        "O2b" : "산소(%)",
        "SO2": "황산화물(ppm)",
        "TSP": "먼지(mg/Sm3)",
        "TOC00" : "유기물(ppm)",
        "SUS00" : "부유물(ppm)",
        "TON00" : "총질소(ppm)",
        "TOP00" : "총인(ppm)",
        "PHY00" : "수소이온농도",
        "FLW00" : "유량적산값(㎥)",
        "SAM00" : "채수기온도(°C)",
    }



    return {
        executeEvent,
        renderSetColor,
        tmsLimit,
        tmsName,
    }
})();