/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
import * as __WEBPACK_EXTERNAL_MODULE__end_game_graph_e8f8b1e5__ from "@end-game/graph";
import * as __WEBPACK_EXTERNAL_MODULE_react__ from "react";
import * as __WEBPACK_EXTERNAL_MODULE_rxjs__ from "rxjs";
/******/ var __webpack_modules__ = ({

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ReactGraph\": () => (/* reexport safe */ _react_graph_jsx__WEBPACK_IMPORTED_MODULE_0__.ReactGraph),\n/* harmony export */   \"useGraph\": () => (/* reexport safe */ _react_graph_jsx__WEBPACK_IMPORTED_MODULE_0__.useGraph),\n/* harmony export */   \"useGraphGet\": () => (/* reexport safe */ _react_graph_jsx__WEBPACK_IMPORTED_MODULE_0__.useGraphGet),\n/* harmony export */   \"useGraphNodesByLabel\": () => (/* reexport safe */ _react_graph_jsx__WEBPACK_IMPORTED_MODULE_0__.useGraphNodesByLabel),\n/* harmony export */   \"useGraphPut\": () => (/* reexport safe */ _react_graph_jsx__WEBPACK_IMPORTED_MODULE_0__.useGraphPut)\n/* harmony export */ });\n/* harmony import */ var _react_graph_jsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./react-graph.jsx */ \"./src/react-graph.tsx\");\n\n\n\n//# sourceURL=webpack://@end-game/react-graph/./src/index.ts?");

/***/ }),

/***/ "./src/react-graph.tsx":
/*!*****************************!*\
  !*** ./src/react-graph.tsx ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"ReactGraph\": () => (/* binding */ ReactGraph),\n/* harmony export */   \"useGraph\": () => (/* binding */ useGraph),\n/* harmony export */   \"useGraphGet\": () => (/* binding */ useGraphGet),\n/* harmony export */   \"useGraphNodesByLabel\": () => (/* binding */ useGraphNodesByLabel),\n/* harmony export */   \"useGraphPut\": () => (/* binding */ useGraphPut)\n/* harmony export */ });\n/* harmony import */ var _end_game_graph__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @end-game/graph */ \"@end-game/graph\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ \"rxjs\");\n\n\n\n\n\n\n\nconst GraphContext = (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)({});\nconst useGraph = () => (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(GraphContext);\nconst useGraphNodesByLabel = (label) => {\n    const [nodes, setNodes] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)();\n    const graph = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(GraphContext);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {\n        if (graph) {\n            const sub = (0,rxjs__WEBPACK_IMPORTED_MODULE_2__.of)(true).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.switchMap)(() => (0,_end_game_graph__WEBPACK_IMPORTED_MODULE_0__.nodesByLabel)(graph, label))).subscribe(({ nodes }) => setNodes(nodes));\n            return () => sub.unsubscribe();\n        }\n    }, [graph]);\n    return nodes;\n};\nconst useGraphGet = (nodeId) => {\n    const [node, setNode] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)();\n    const graph = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(GraphContext);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {\n        if (graph) {\n            const sub = (0,_end_game_graph__WEBPACK_IMPORTED_MODULE_0__.graphGet)(graph, nodeId).subscribe(({ node }) => setNode(node));\n            return () => sub.unsubscribe();\n        }\n    }, [graph]);\n    return node;\n};\nconst useGraphPut = () => {\n    const graph = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(GraphContext);\n    return (label, nodeId, props) => {\n        return (0,_end_game_graph__WEBPACK_IMPORTED_MODULE_0__.graphPut)(graph, nodeId, label, props);\n    };\n};\nconst ReactGraph = ({ graph, children }) => {\n    const [myGraph, setMyGraph] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)();\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {\n        graph ? setMyGraph(graph) : createNewGraph();\n        function createNewGraph() {\n            const sub = (0,_end_game_graph__WEBPACK_IMPORTED_MODULE_0__.graphOpen)({\n                graphId: (0,_end_game_graph__WEBPACK_IMPORTED_MODULE_0__.newUid)(),\n                handlers: {\n                    putNode: (0,_end_game_graph__WEBPACK_IMPORTED_MODULE_0__.handlers)([(0,_end_game_graph__WEBPACK_IMPORTED_MODULE_0__.levelStorePutNodeHandler)({})]),\n                    getNode: (0,_end_game_graph__WEBPACK_IMPORTED_MODULE_0__.handlers)([(0,_end_game_graph__WEBPACK_IMPORTED_MODULE_0__.levelStoreGetNodeHandler)({})]),\n                    nodesByLabel: (0,_end_game_graph__WEBPACK_IMPORTED_MODULE_0__.handlers)([(0,_end_game_graph__WEBPACK_IMPORTED_MODULE_0__.levelStoreNodesByLabelHandler)({})])\n                }\n            }).subscribe(graph => setMyGraph(graph));\n            return () => sub.unsubscribe();\n        }\n    }, []);\n    return (myGraph === null || myGraph === void 0 ? void 0 : myGraph.graphId) ? (react__WEBPACK_IMPORTED_MODULE_1__.createElement(GraphContext.Provider, { value: myGraph }, children)) : react__WEBPACK_IMPORTED_MODULE_1__.createElement(\"div\", null, \"'No graph'\");\n};\n\n\n//# sourceURL=webpack://@end-game/react-graph/./src/react-graph.tsx?");

/***/ }),

/***/ "@end-game/graph":
/*!**********************************!*\
  !*** external "@end-game/graph" ***!
  \**********************************/
/***/ ((module) => {

var x = y => { var x = {}; __webpack_require__.d(x, y); return x; }
var y = x => () => x
module.exports = __WEBPACK_EXTERNAL_MODULE__end_game_graph_e8f8b1e5__;

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

var x = y => { var x = {}; __webpack_require__.d(x, y); return x; }
var y = x => () => x
module.exports = __WEBPACK_EXTERNAL_MODULE_react__;

/***/ }),

/***/ "rxjs":
/*!***********************!*\
  !*** external "rxjs" ***!
  \***********************/
/***/ ((module) => {

var x = y => { var x = {}; __webpack_require__.d(x, y); return x; }
var y = x => () => x
module.exports = __WEBPACK_EXTERNAL_MODULE_rxjs__;

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
/******/ 
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module can't be inlined because the eval devtool is used.
/******/ var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ var __webpack_exports__ReactGraph = __webpack_exports__.ReactGraph;
/******/ var __webpack_exports__useGraph = __webpack_exports__.useGraph;
/******/ var __webpack_exports__useGraphGet = __webpack_exports__.useGraphGet;
/******/ var __webpack_exports__useGraphNodesByLabel = __webpack_exports__.useGraphNodesByLabel;
/******/ var __webpack_exports__useGraphPut = __webpack_exports__.useGraphPut;
/******/ export { __webpack_exports__ReactGraph as ReactGraph, __webpack_exports__useGraph as useGraph, __webpack_exports__useGraphGet as useGraphGet, __webpack_exports__useGraphNodesByLabel as useGraphNodesByLabel, __webpack_exports__useGraphPut as useGraphPut };
/******/ 
