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
    async (error) => {
        const errorData = error.response.data;
        const currentPath = window.location.pathname;
        console.log("currentPath : ", currentPath);

        // X-Skip-Error-Alert 헤더가 있으면 alert 제외
        const skipAlert = error.config?.headers?.['X-Skip-Error-Alert'] === 'true';

        if (!skipAlert) {
            if (currentPath.startsWith('/admin')) {
                await Swal.fire({
                    width: 650,
                    icon: 'error',
                    title: `${errorData.message}`
                });
            } else {
                await alertBox(`${errorData.message}`);
            }
        }
        console.error(error.response.data);

        return Promise.reject(error.response.data);
    },
);

globalThis.api = api;
