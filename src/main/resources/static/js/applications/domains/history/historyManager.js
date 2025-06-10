const HistoryManager = (()=> {
    let history = null;

    const getHistoryById = async (historyId) => {
        const uri = `/buildings/history/${historyId}`;

        return new Promise((resolve) => {
            api.get(uri).then((result) => {
                const { result: data } = result.data;
                console.log(result.data.result[0].buildingVersion);
                history = result.data.result[0].buildingVersion;
                resolve(history);
            }).catch(() => {
                resolve(null);
            });
        });
    }

    const findHistory = () => {
        return history;
    }


    return {
        getHistoryById,
        findHistory
    }
}) ();