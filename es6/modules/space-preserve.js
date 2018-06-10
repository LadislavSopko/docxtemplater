const wrapper = require("../module-wrapper");
const {
	isTextStart,
	isTextEnd,
	endsWith,
	startsWith,
} = require("../doc-utils");
const wTpreserve = '<w:t xml:space="preserve">';
const wTpreservelen = wTpreserve.length;
const wtEnd = "</w:t>";
const wtEndlen = wtEnd.length;

function isWtStart(part) {
	return isTextStart(part) && part.tag === "w:t";
}

function addXMLPreserve(chunk, index) {
	const tag = chunk[index].value;
	if (chunk[index + 1].value === "</w:t>") {
		return tag;
	}
	if (tag.indexOf('xml:space="preserve"') !== -1) {
		return tag;
	}
	return tag.substr(0, tag.length - 1) + ' xml:space="preserve">';
}

function isInsideLoop(meta, chunk) {
	return meta && meta.basePart && chunk.length > 1;
}

const spacePreserve = {
	name: "SpacePreserveModule",
	postparse(postparsed, meta) {
		let chunk = [],
			inTextTag = false,
			endLindex = 0,
			lastTextTag = 0;
		function isStartingPlaceHolder(part, chunk) {
			return (
				!endLindex &&
				part.type === "placeholder" &&
				(!part.module || part.module === "loop") &&
				chunk.length > 1
			);
		}
		const result = postparsed.reduce(function(postparsed, part) {
			if (isWtStart(part)) {
				inTextTag = true;
				lastTextTag = chunk.length;
			}
			if (!inTextTag) {
				postparsed.push(part);
				return postparsed;
			}
			chunk.push(part);
			if (isInsideLoop(meta, chunk)) {
				endLindex = meta.basePart.endLindex;
				chunk[0].value = addXMLPreserve(chunk, 0);
			}
			if (isStartingPlaceHolder(part, chunk)) {
				endLindex = part.endLindex;
				chunk[0].value = addXMLPreserve(chunk, 0);
			}
			if (isTextEnd(part) && part.lIndex > endLindex) {
				if (endLindex !== 0) {
					chunk[lastTextTag].value = addXMLPreserve(chunk, lastTextTag);
				}
				Array.prototype.push.apply(postparsed, chunk);
				chunk = [];
				inTextTag = false;
				endLindex = 0;
				lastTextTag = 0;
			}
			return postparsed;
		}, []);
		Array.prototype.push.apply(result, chunk);
		return result;
	},
	postrender(parts) {
		return parts
			.filter(p => p.length !== 0)
			.reduce(function(newParts, p, index, parts) {
				if (p.indexOf('<w:t xml:space="preserve"></w:t>') !== -1) {
					p = p.replace(/<w:t xml:space="preserve"><\/w:t>/g, "<w:t/>");
				}
				if (endsWith(p, wTpreserve) && startsWith(parts[index + 1], wtEnd)) {
					p = p.substr(0, p.length - wTpreservelen) + "<w:t/>";
					parts[index + 1] = parts[index + 1].substr(wtEndlen);
				}
				newParts.push(p);
				return newParts;
			}, []);
	},
};
module.exports = () => wrapper(spacePreserve);
