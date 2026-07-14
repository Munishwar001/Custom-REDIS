const isString = (value) => {
    return typeof value === "string";
};

const isList = (value) => {
    return Array.isArray(value);
};

const isHash = (value) => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

module.exports = { isString, isList, isHash };