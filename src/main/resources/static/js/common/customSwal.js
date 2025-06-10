const alertSwal = (title) => {
    return new Promise((resolve) => {
        Swal.fire({
            title,
            showCancelButton: false,
            confirmButtonText: `확인`,
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed || result.isDismissed) {
                resolve(true);
            }
        });
    });
};

const confirmSwal = (title) => {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title,
            showCancelButton: true,
            confirmButtonText: `확인`,
            cancelButtonText: `취소`,
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                resolve(true);
            } else if (result.isDenied) {
                reject(false);
            }
        });
    });
};
