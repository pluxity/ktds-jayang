const isContainsOn = (target) => {
    return target.classList.contains('on');
};

const formToJSON = (elements) =>
    [].reduce.call(
        elements,
        (data, element) => {
            data[element.name] = element.value;
            return data;
        },
        {},
    );

const isEmpty = (str) => {
    return str === '' || str === undefined || str === null || str === 'null';
};
function formatDate(dateString) {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}