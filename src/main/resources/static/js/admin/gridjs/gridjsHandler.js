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
        noRecordsFound = '데이터가 존재하지 않습니다.'
    } = options;
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
        sort: true,
        fixedHeader: true,
        columns,
        data,
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
        columns,
        data
    } = option;

    grid.updateConfig({
        columns,
        data,
    }).forceRender();
};

const getSelectedId = () => {
    if (grid.config.plugin.get('checkbox').props.store === undefined) {
        return [];
    }
    return grid.config.plugin.get('checkbox').props.store._state.rowIds;
};
