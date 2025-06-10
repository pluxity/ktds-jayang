/* 유효성 검사를 원하는 요소에 data-rules = "" 와 같이 속성 작성
   여러 개의 유효성 검사를 원하는 경우는 data-rules = "required,integer" 와 같이 작성 */

// null, undefined, 공백 여부 체크
const isDefined = (value) => {
    return !(value === '' || typeof value === 'undefined' || value === null);


};

// 폼 유효성 검사
const validationForm = (form) => {
    if (form.querySelectorAll('[data-rules]').length === 0) return true;

    const elements = form.querySelectorAll('[data-rules]');

    for (let i = 0; i < elements.length; i++) {
        if (isDefined(elements[i].dataset.rules)) {
            const validationArr = elements[i].dataset.rules.match(/\w+/g);

            for (let j = 0; j < validationArr.length; j++) {
                if (!validationCheck[validationArr[j]](elements[i], form))
                    return false;
            }
        }
    }

    return true;
};

// 일반 요소 유효성 검사
const validationDom = (dom) => {
    if (!isDefined(dom.value)) return false;

    const validationArr = dom.dataset.rules.match(/\w+/g);

    for (let i = 0; i < validationArr.length; i++) {
        if (!validationCheck[validationArr[i]](dom)) return false;
    }

    return true;
};

const validationCheck = {};

// 필수 체크
validationCheck.required = (element, form) => {
    if (element.disabled) return true;

    let value;

    if (element.getAttribute('type') === 'radio') {
        value =
            form.querySelector(
                `input[name="${element.getAttribute('name')}"]:checked`,
            ) === null
                ? ''
                : form.querySelector(
                      `input[name="${element.getAttribute('name')}"]:checked`,
                  ).value;
    } else {
        value = element.value;
    }
    if (!isDefined(value)) {
        const tagName = element.dataset.tagname;
        alertSwal(`필수 입력 항목입니다.\n(${tagName})`);
        element.focus();
        return false;
    } else if(!isDefined(value.trim())) {
        const tagName = element.dataset.tagname;
        alertSwal(`공백만 입력되었습니다.\n(${tagName})`);
        element.focus();
        return false;
    }
    return true;
};

// 특수 문자 체크
validationCheck.special = (element) => {
    const rgx = /[`~!@#$%^&*|\\'";:\/?]/gi;

    if (rgx.test(element.value)) {
        alertSwal('특수문자는 허용되지 않습니다.');
        element.focus();
        return false;
    }
    return true;
};

// 정수 체크
validationCheck.integer = (element) => {
    const rgx = /^[0-9-]/i;

    if (rgx.test(element.value)) {
        return true;
    }
    alertSwal('정수만 입력이 가능합니다.');
    element.focus();
    return false;
};

// 숫자 체크
validationCheck.number = (element) => {
    const rgx = /^[0-9]+$/;

    if (rgx.test(element.value)) {
        return true;
    }
    alertSwal('숫자만 입력이 가능합니다.');
    element.focus();
    return false;
};

// 이미지 파일 확장자 체크
validationCheck.imgFile = (element) => {
    const IMG_FORMAT = '\\.(jpg|jpeg|png|gif)$';

    if (
        element?.value.length === 0 ||
        new RegExp(IMG_FORMAT).test(element.value)
    ) {
        return true;
    }
    alertSwal('jpg, jpeg, png만 가능합니다.');
    return false;
};

// zip 파일 확장자 체크
validationCheck.zipFile = (element) => {
    const IMG_FORMAT = '\\.(zip)$';

    if (
        element?.value.length === 0 ||
        new RegExp(IMG_FORMAT).test(element.value)
    ) {
        return true;
    }
    alertSwal('압축파일만 등록 가능합니다.');
    return false;
};

// 도면 파일 확장자 체크
validationCheck.buildingFile = (element) => {
    const FILE_FORMAT = '\\.(zip|fbx|gltf|glb)$';

    if (
        element?.value.length === 0 ||
        new RegExp(FILE_FORMAT, 'i').test(element.value)
    ) {
        return true;
    }
    alertSwal('zip, FBX, glTF, glb만 등록 가능합니다.');
    return false;
}

// 엑셀 파일 확장자 체크
validationCheck.excelFile = (element) => {
    const FILE_FORMAT = '\\.(xlsx|xls|csv)$';

    if (
        element?.value.length === 0 ||
        new RegExp(FILE_FORMAT).test(element.value)
    ) {
        return true;
    }
    alertSwal('엑셀파일만 등록 가능합니다.');
    return false;
};