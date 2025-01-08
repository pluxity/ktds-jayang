let tags = {};

const createTagInput = (tagName, target, option, removeEvent) => {
    tags[tagName] = new Tagify(target, option);

    if(removeEvent) {
        tags[tagName].on('remove', removeEvent);
    }
}

const addTags = (tagName, data) => {
    tags[tagName].addTags(data);
}

const removeTags = (tagName, data) => {
    tags[tagName].removeTags(data);
}

const removeAllTags = (tagName) => {
    tags[tagName].removeAllTags();
}

const getAllTagValues = (tagName) => {
    return tags[tagName].getTagElms().map(el => el.title);
}