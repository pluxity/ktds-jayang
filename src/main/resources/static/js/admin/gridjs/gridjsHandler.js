let grid;
/**
 *   <pre>
 *   dom =  그리드를 넣을 DOM
 *   columns =  컬럼 데이터
 *   data =  gridData 정보 데이터
 *   isPagination =  default : false / 페이징 사용여부 /  false 일 경우 아래 셋팅 무시됨
 *   limit =  default : 10 / Row 개수
 *   summary =  default : false / 합계 표시 여부
 *   buttonsCount =  default : 10 / 페이징 버튼 표시 개수
 *   previous =  이전 자리에 표시할 텍스트
 *   next =  다음 자리에 표시할 텍스트
 *   </pre>
 *
 */

function addHeaderSelectAll(columns) {
    if (!columns?.length) return columns;
    if (columns[0]?.id === 'checkbox') {
        return [
            {
                ...columns[0],
                name: gridjs.html(`
                    <div style="display:flex; justify-content:center; align-items:center; width:100%;">
                        <input type="checkbox" id="select-all-checkbox">
                    </div>`)
            },
            ...columns.slice(1),
        ];
    }
    return columns;
}

function wireSelectAll(dom) {
    if (!dom) return;
    if (dom.dataset.selectAllWired === '1') return;
    dom.addEventListener('change', (e) => {
        if (e.target.id === 'select-all-checkbox') {
            const on = e.target.checked;
            dom.querySelectorAll('.gridjs-table tbody td:first-child input[type="checkbox"]').forEach(cb => {
                if (cb.checked !== on) cb.click();
            });
        }
    });
    dom.dataset.selectAllWired = '1';
}

const createGrid = (options) => {
    const {
        dom,
        columns,
        data,
        isPagination = false,
        limit = 10,
        summary = false,
        buttonsCount = 10,
        previous,
        next,
        noRecordsFound = '데이터가 존재하지 않습니다.',
        withNumbering = true
    } = options;

    const total = data.length;

    const dataWithNumber = withNumbering
        ? data.map((row, idx) => [total - idx, ...row])
        : data;

    const cols = addHeaderSelectAll(columns);

    const numberedColumns = withNumbering
        ? [
            cols[0],
            {
                id: 'number',
                name: '번호',
                width: '6%',
            },
            ...cols.slice(1)
        ]
        : cols;

    grid = new gridjs.Grid({
        pagination: isPagination && {
            limit,
            summary,
            buttonsCount,
        },
        language: {
            pagination: isPagination && {
                previous: previous ? previous : '이전',
                next: next ? next : '다음',
            },
            noRecordsFound,
        },
        sort: false,
        fixedHeader: true,
        columns: numberedColumns,
        data: dataWithNumber,
        style: {
            td: {
                'text-align': 'center',
                'vertical-align': 'middle',
            },
            footer: {
                color: 'red',
            },
        },
    }).render(dom);
    const root = dom || document.querySelector('#wrapper');
    requestAnimationFrame(() => wireSelectAll(root));
};

/**
 *   <pre>
 *   columns =  컬럼 데이터
 *   data =  gridData 정보 데이터
 *   </pre>
 *
 */
const resizeGrid = (option) => {
    const {
        dom,
        columns,
        data,
        withNumbering = true
    } = option;

    const total = data.length;
    const dataWithNumber = withNumbering
        ? data.map((row, idx) => [total - idx, ...row])
        : data;
    const cols = addHeaderSelectAll(columns);
    const numberedColumns = withNumbering
        ? [
            cols[0],
            {
                id: 'number',
                name: '번호',
                width: '6%',
            },
            ...cols.slice(1)
        ]
        : cols;

    grid.updateConfig({
        columns: numberedColumns,
        data: dataWithNumber,
    }).forceRender();

    const root = dom || document.querySelector('#wrapper');
    requestAnimationFrame(() => wireSelectAll(root));
};

const getSelectedId = () => {
    if (grid.config.plugin.get('checkbox').props.store === undefined) {
        return [];
    }
    return grid.config.plugin.get('checkbox').props.store._state.rowIds;
};
