/**
 * @return {boolean}
 */
export function isXML(xmlStr) {
  let parseXml;

  if (typeof window.DOMParser !== "undefined") {
    parseXml = function (xmlStr) {
      return new window.DOMParser().parseFromString(xmlStr, "text/xml");
    };
  } else if (typeof window.ActiveXObject !== "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
    parseXml = function (xmlStr) {
      let xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = "false";
      xmlDoc.loadXML(xmlStr);
      return xmlDoc;
    };
  } else {
    return false;
  }

  try {
    parseXml(xmlStr);
  } catch (e) {
    return false;
  }
  return true;
}

export function xmlToJson(xml) {
  // Create the return object
  let obj = {};

  if (xml.nodeType === 1) {
    // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j += 1) {
        const attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    // text
    obj = xml.nodeValue;
  }

  // do children
  // If just one text node inside
  if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
    obj = xml.childNodes[0].nodeValue;
  } else if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i += 1) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;
      if (typeof obj[nodeName] === "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push === "undefined") {
          const old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

/**
 * @return {boolean}
 */
export function isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function csvToJson(csv, delimiter = ",") {
  if (!(typeof csv === "string" || csv instanceof String)) {
    console.error("CSV is not in string format. PLease provide csv in string format. format: ", typeof csv);
  }
  const [firstLine, ...lines] = csv.split("\n");
  return lines.map((line) =>
    firstLine.split(delimiter).reduce(
      (curr, next, index) => ({
        ...curr,
        [next]: line.split(delimiter)[index],
      }),
      {}
    )
  );
}
