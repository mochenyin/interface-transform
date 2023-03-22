let subRequest = [];
let subResponse = [];
let jsonCode;
let path;
let indent;
let semicolonEnd;

// 添加缩进
const addIndent = (identNum) => {
  let identStr = "";
  new Array(identNum).fill(1).forEach(() => {
    identStr += " ";
  });
  return identStr;
};

const breakLine = "\n";

// 添加注释
const addComment = (CommentStr) =>
  CommentStr ? ` // ${CommentStr}${breakLine}` : breakLine;

const addLeftBracket = ` {${breakLine}`;

const addRightBracket = `}${semicolonEnd ? ";" : ""}${breakLine}${breakLine}`;

const firstCharUpperCase = (v) => v.charAt(0).toLocaleUpperCase() + v.slice(1);

const checkRequired = (required) => required ? "" : "?";

const createInterfaceName = (name) => {
  let interfaceName = "";
  const nameList = name.split("-");
  console.log("nameList", nameList);
  nameList.forEach((v) => (interfaceName += firstCharUpperCase(v)));
  return interfaceName;
};

const getName = (path, typeName) => {
  const pathArray = path.split("/");
  if (typeName) {
    pathArray.push(typeName);
  }
  const pathStr = pathArray.slice(2).join("-");
  return createInterfaceName(pathStr);
};

const typeMap = {
  integer: "number",
  string: "string",
  boolean: "boolean",
  number: "number",
};

const singleItem = (item, interfaceType, requiredData) => {
  let type = typeMap[item.type];
  let interfaceName = type;
  let required = true;
  if (!type) {
    console.log("item", item);
    type = item.refType || (item.items ? item.items.originalRef : "");
    interfaceName = type;
    if (!interfaceName) {
      return "";
    }
    const target = interfaceType === "request" ? subRequest : subResponse;
    // if ((/[\u4e00-\u9fa5]/g).test(type)) {
    //     interfaceName = firstCharUpperCase(interfaceType) + target.length;
    // }
    interfaceName = interfaceName.replaceAll("«", "").replaceAll("»", "");
    const code = createSubInterface(type, interfaceType, interfaceName);
    target.push(code);
  }
  if (interfaceType === "request" && requiredData && requiredData.length) {
    required = requiredData.includes(item.name);
  }

  return `${addIndent(indent)}${item.name}${checkRequired(required)}: ${
    item.type === "array" ? interfaceName + "[]" : interfaceName
  };${addComment(item.description)}`;
};

const getCodeFromDefinitions = (
  resultCode,
  keyName,
  interfaceType,
  interfaceName
) => {
  const responsesThirdOriginalRef = jsonCode.definitions[keyName] === undefined ? {} : jsonCode.definitions[keyName];
  const requiredData = responsesThirdOriginalRef.required;
  console.log("keyName", keyName);
  const target = responsesThirdOriginalRef.properties;
  const responsesArray = Object.keys(target || {});
  if (responsesArray.length) {
    resultCode += `export interface ${
      interfaceName || getName(path, interfaceType)
    }${addLeftBracket}`;
    console.log("responsesArray", responsesArray);
    responsesArray.forEach((item) => {
      target[item].name = item;
      resultCode += singleItem(target[item], interfaceType, requiredData);
    });
    resultCode += addRightBracket;
  }
  return resultCode;
};

const createSubInterface = (type, interfaceType, interfaceName) => {
  let result = "";
  result = getCodeFromDefinitions(result, type, interfaceType, interfaceName);
  return result;
};

const interfaceBuilder = (code, config) => {
  try {
    subRequest = [];
    subResponse = [];
    jsonCode = JSON.parse(code);
    let resultCode = "";
    path = Object.keys(jsonCode.paths || {})[0];
    console.log("path", path);
    if (!path) {
      return { interfaceCode: resultCode, isError: false };
    }
    indent = config.indent;
    semicolonEnd = !!config.semicolonEnd;

    // 转换请求interface
    const target = jsonCode.paths[path].get || jsonCode.paths[path].post;
    const parameters = target.parameters;
    console.log("parameters", parameters);
    if (parameters && parameters.length) {
      const rArray = [];
      parameters.forEach((item) => {
        if (item.schema !== undefined) {
          const keyName = item.schema.originalRef;
          if (keyName) {
            resultCode = getCodeFromDefinitions(resultCode, keyName, "request");
          }
        } else {
          rArray.push(singleItem(item, "request"));
        }
      });
      if (rArray.length) {
        resultCode += `export interface ${getName(
          path,
          "request"
        )}${addLeftBracket}`;
        rArray.forEach((item) => (resultCode += item));
        resultCode += addRightBracket;
      }
    }

    // 转换响应interface
    if (
      target.responses["200"].schema &&
      target.responses["200"].schema.originalRef
    ) {
      const responsesFirstOriginalRef =
        target.responses["200"].schema.originalRef;
      let responsesSecondOriginalRef =
        jsonCode.definitions[responsesFirstOriginalRef].properties.data
          .originalRef;
      if (
        jsonCode.definitions[responsesFirstOriginalRef].properties.data.type ===
        "array"
      ) {
        responsesSecondOriginalRef =
          jsonCode.definitions[responsesFirstOriginalRef].properties.data.items
            .originalRef;
      }
      resultCode = getCodeFromDefinitions(
        resultCode,
        responsesSecondOriginalRef,
        "response"
      );
    }

    if (subResponse.length) {
      subResponse.forEach((item) => {
        resultCode = item + resultCode;
      });
    }
    if (subRequest.length) {
      subRequest.forEach((item) => {
        resultCode = item + resultCode;
      });
    }

    return { interfaceCode: resultCode, isError: false };
  } catch (e) {
    console.log("error:", e);
    return { interfaceCode: "", isError: true };
  }
};

module.exports = interfaceBuilder;
