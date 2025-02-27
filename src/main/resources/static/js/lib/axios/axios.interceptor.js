const api = axios.create({
    // baseURL: globalThis.CONFIG.baseURL[ACTIVE_PROFILES],
    baseURL: CONTEXT_PATH,
    timeout: 3000000,
});

api.interceptors.request.use(
    // (config) => config,
    // (error) => error,
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => error,
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorData = error.response.data;
        if(typeof Swal !== 'undefined') {
            Swal.fire({
                width: 650,
                icon: 'error',
                title: `${errorData.message}`,
                text: `Error code : ${errorData.error} ( ${errorData.status} )`,

            });
        }
        console.error(error.response.data);

        return Promise.reject(error.response.data);
    },
);

globalThis.api = api;
