// https://blog.lakbychance.com/implementing-pagination-feature-in-vanilla-js

class Paginator {
    #recordsPerPage;

    #totalRecords;

    #numberOfPages;

    #visiblePages;

    #activePage;

    #visiblePagesEndRange;

    constructor(totalRecords, recordsPerPage = 1, visiblePages = 1) {
        this.#recordsPerPage = recordsPerPage;
        this.#totalRecords = totalRecords;
        this.#numberOfPages = Math.ceil(
            this.#totalRecords / this.#recordsPerPage,
        );
        this.#visiblePages = visiblePages;
        this.#activePage = 1;
        this.#visiblePagesEndRange = visiblePages;
        this.#validate();
    }

    #validate() {
        if (this.#recordsPerPage <= 0) {
            this.#recordsPerPage = 1;
        }
        if (this.#visiblePages <= 0) {
            this.#visiblePages = 1;
        }
        if (this.#totalRecords <= 0) {
            this.#totalRecords = 1;
        }
        if (this.#numberOfPages <= 0) {
            this.#numberOfPages = Math.ceil(
                this.#totalRecords / this.#recordsPerPage,
            );
        }
        if (this.#visiblePagesEndRange <= 0) {
            this.#visiblePagesEndRange = this.#visiblePages;
        }
        if (this.#visiblePages > this.#numberOfPages) {
            this.#visiblePages = this.#numberOfPages;
            this.#visiblePagesEndRange = this.#visiblePages;
        }
        if (this.#recordsPerPage > this.#totalRecords) {
            this.#recordsPerPage = this.#totalRecords;
        }
    }

    getActivePage() {
        return this.#activePage;
    }

    gotoNextPage() {
        if (this.#activePage < this.#numberOfPages) {
            this.#activePage += 1;

            if (this.#activePage > this.#visiblePagesEndRange) {
                this.#visiblePagesEndRange += this.#visiblePages;
                this.#visiblePagesEndRange = Math.min(
                    this.#visiblePagesEndRange,
                    this.#numberOfPages,
                );
            }
        }
    }

    gotoPrevPage() {
        if (this.#activePage > 1) {
            this.#activePage -= 1;
            if (this.#activePage % this.#visiblePages === 0) {
                this.#visiblePagesEndRange = this.#activePage;
            }
        }
    }

    gotoFirstPage() {
        this.#activePage = 1;
        this.#visiblePagesEndRange = this.#visiblePages;
    }

    gotoLastPage() {
        this.#activePage = this.#numberOfPages;
        this.#visiblePagesEndRange = this.#numberOfPages;
    }

    gotoPage(page) {
        this.#activePage = page;
    }

    getVisiblePagesRange() {
        let beginningVisiblePage;
        if (this.#visiblePagesEndRange % this.#visiblePages !== 0) {
            beginningVisiblePage =
                this.#visiblePagesEndRange -
                (this.#visiblePagesEndRange % this.#visiblePages) +
                1;
        } else {
            beginningVisiblePage =
                this.#visiblePagesEndRange - this.#visiblePages + 1;
        }
        const endingVisiblePage = this.#visiblePagesEndRange;
        return {
            beginningVisiblePage,
            endingVisiblePage,
        };
    }

    getActiveRecordsIndices() {
        const beginningRecordIndex =
            (this.#activePage - 1) * this.#recordsPerPage;
        const endingRecordIndex = Math.min(
            beginningRecordIndex + this.#recordsPerPage,
            this.#totalRecords,
        );
        return { beginningRecordIndex, endingRecordIndex };
    }
}

function poiPaging(records) {
    const paginationPages = document.querySelector('.pagination__pages');

    paginationPages.addEventListener('pointerup', gotoPage);

    const paginator = new Paginator(records.length, 8, 5);

    function renderPages() {
        let html = '';
        const { beginningVisiblePage, endingVisiblePage } =
            paginator.getVisiblePagesRange();
        for (
            let page = beginningVisiblePage;
            page <= endingVisiblePage;
            page++
        ) {
            const pageClass =
                paginator.getActivePage() === page
                    ? 'pagination__page-btn--active'
                    : 'pagination__page-btn';
            html += `<li class='pagination__page'>
                        <button data-item=${page} class=${pageClass}>${page}</button>
                     </li>`;
        }
        paginationPages.innerHTML = html;
    }

    function renderList() {
        const { beginningRecordIndex, endingRecordIndex } =
            paginator.getActiveRecordsIndices();

        const poiListDiv = document.querySelector('#leftPoiList');
        const poiListTbody = poiListDiv.querySelector('table > tbody');
        poiListTbody.innerHTML = '';

        if (records.length === 0) {
            poiListTbody.innerHTML =
                '<div class="not-exist-poi">데이터가 존재하지 않습니다.</div>';
            return;
        }

        for (
            let index = beginningRecordIndex;
            index < endingRecordIndex;
            index++
        ) {
            const poiListFragment = document.createDocumentFragment();
            const poiTr = document.createElement('tr');
            const poiTd = document.createElement('td');
            poiTd.setAttribute('poiId', records[index].id);
            // poiTd.addEventListener('pointerup', moveToPoi);
            poiTd.textContent = `${records[index].name}`;

            const buttonTd = document.createElement('td');
            const dropdownDiv = document.createElement('DIV');
            dropdownDiv.classList.add('dropdown');
            const buttonDropdown = document.createElement('button');
            buttonDropdown.classList.add('dropdown-btn');
            buttonDropdown.textContent = '관리';

            buttonDropdown.addEventListener(
                'pointerup',
                (event) => {
                    const { currentTarget } = event;
                    currentTarget.classList.toggle('popup');
                    if (currentTarget.classList.contains('popup')) {
                        currentTarget.nextElementSibling.classList.remove(
                            'd-none',
                        );
                    } else {
                        currentTarget.nextElementSibling.classList.add(
                            'd-none',
                        );
                    }
                },
                false,
            );

            const dropdownContentDiv = document.createElement('div');
            dropdownContentDiv.classList.add('dropdown-content');
            dropdownContentDiv.classList.add('d-none');

            const dropdownItemAllocateA = document.createElement('a');
            dropdownItemAllocateA.classList.add('dropdown-item');
            dropdownItemAllocateA.textContent = 'POI 배치하기';
            dropdownItemAllocateA.addEventListener('click', () => {
                allocatePoi(records[index].id);
            });

            const dropdownItemDeleteA = document.createElement('a');
            dropdownItemDeleteA.classList.add('dropdown-item');
            dropdownItemDeleteA.textContent = 'POI 삭제하기';
            dropdownItemDeleteA.addEventListener('click', () => {
                deletePoi(records[index].id);
            });

            const dropdownItemUnAllocateA = document.createElement('a');
            dropdownItemUnAllocateA.classList.add('dropdown-item');
            dropdownItemUnAllocateA.textContent = 'POI 미배치로 변경';
            dropdownItemUnAllocateA.addEventListener('click', () => {
                unAllocatePoi([records[index].id]);
            });

            dropdownContentDiv.appendChild(dropdownItemAllocateA);
            dropdownContentDiv.appendChild(dropdownItemDeleteA);
            dropdownContentDiv.appendChild(dropdownItemUnAllocateA);

            dropdownDiv.append(buttonDropdown);
            dropdownDiv.append(dropdownContentDiv);

            buttonTd.appendChild(dropdownDiv);

            poiTr.appendChild(poiTd);
            poiTr.appendChild(buttonTd);

            poiListFragment.appendChild(poiTr);
            poiListTbody.appendChild(poiListFragment);
        }
    }

    function render() {
        renderPages();
        renderList();
    }

    render();

    function nextPage() {
        paginator.gotoNextPage();
        render();
    }

    function prevPage() {
        paginator.gotoPrevPage();
        render();
    }

    function lastPage() {
        paginator.gotoLastPage();
        render();
    }

    function firstPage() {
        paginator.gotoFirstPage();
        render();
    }

    function gotoPage(event) {
        if (event.target.nodeName === 'BUTTON') {
            const page = parseInt(event.target.dataset.item, 10);
            paginator.gotoPage(page);
            render();
        }
    }

    this.firstPage = firstPage;
    this.lastPage = lastPage;
    this.nextPage = nextPage;
    this.prevPage = prevPage;
    this.gotoPage = gotoPage;
}
