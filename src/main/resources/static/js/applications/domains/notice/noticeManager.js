const NoticeManager = (function () {
    let notice = {};
    let noticeList = [];

    const getNotices = () => {
        const uri = `/notices`;

        return new Promise((resolve) => {
            api.get(uri).then((result) => {
                const { result: data } = result.data;
                noticeList = data.map((notice) =>
                    new Notice(notice.id,
                        notice.title,
                        notice.content,
                        notice.isUrgent,
                        notice.isActive,
                        notice.expiredAt,
                        notice.createdAt,
                        notice.buildingIds));
                resolve(noticeList);
            });
        });
    };

    const findAll = () => {
        return noticeList;
    };

    return {
        getNotices,
        findAll,
    };
})();
