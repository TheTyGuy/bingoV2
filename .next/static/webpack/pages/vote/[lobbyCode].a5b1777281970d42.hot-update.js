"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/vote/[lobbyCode]",{

/***/ "./pages/vote/[lobbyCode].js":
/*!***********************************!*\
  !*** ./pages/vote/[lobbyCode].js ***!
  \***********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _lib_firebase__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../lib/firebase */ \"./lib/firebase.js\");\n/* harmony import */ var firebase_firestore__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! firebase/firestore */ \"./node_modules/firebase/firestore/dist/esm/index.esm.js\");\n/* harmony import */ var _components_VoteCard__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../components/VoteCard */ \"./components/VoteCard.js\");\n\nvar _s = $RefreshSig$();\n\n\n\n\n\nconst VoteScreen = ()=>{\n    _s();\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    const { lobbyCode } = router.query;\n    const [gameData, setGameData] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [userName, setUserName] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');\n    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [countdown, setCountdown] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(60);\n    // Logging Helper\n    const debugLog = (message, data)=>console.log(\"[DEBUG]: \".concat(message), data);\n    // Fetch Game Data\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"VoteScreen.useEffect\": ()=>{\n            if (!lobbyCode) return;\n            const gameRef = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_4__.doc)(_lib_firebase__WEBPACK_IMPORTED_MODULE_3__.db, 'games', lobbyCode);\n            const unsubscribe = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_4__.onSnapshot)(gameRef, {\n                \"VoteScreen.useEffect.unsubscribe\": (snapshot)=>{\n                    if (snapshot.exists()) {\n                        const data = snapshot.data();\n                        debugLog('Fetched Game Data:', data);\n                        setGameData(data);\n                    } else {\n                        debugLog('Game Data Not Found.');\n                        setGameData(null);\n                    }\n                }\n            }[\"VoteScreen.useEffect.unsubscribe\"]);\n            return ({\n                \"VoteScreen.useEffect\": ()=>unsubscribe()\n            })[\"VoteScreen.useEffect\"];\n        }\n    }[\"VoteScreen.useEffect\"], [\n        lobbyCode\n    ]);\n    // Fetch Username from Local Storage\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"VoteScreen.useEffect\": ()=>{\n            const storedUserName = localStorage.getItem('userName') || 'Guest';\n            setUserName(storedUserName);\n            debugLog('Fetched Username:', storedUserName);\n        }\n    }[\"VoteScreen.useEffect\"], []);\n    // Countdown Timer\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"VoteScreen.useEffect\": ()=>{\n            if (!(gameData === null || gameData === void 0 ? void 0 : gameData.currentBingoBoard)) return;\n            const timer = setInterval({\n                \"VoteScreen.useEffect.timer\": ()=>{\n                    setCountdown({\n                        \"VoteScreen.useEffect.timer\": (prev)=>{\n                            if (prev > 0) return prev - 1;\n                            clearInterval(timer); // Stop Timer\n                            return 0;\n                        }\n                    }[\"VoteScreen.useEffect.timer\"]);\n                }\n            }[\"VoteScreen.useEffect.timer\"], 1000);\n            return ({\n                \"VoteScreen.useEffect\": ()=>clearInterval(timer)\n            })[\"VoteScreen.useEffect\"]; // Cleanup\n        }\n    }[\"VoteScreen.useEffect\"], [\n        gameData\n    ]);\n    // Finalize Vote After Countdown Ends\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"VoteScreen.useEffect\": ()=>{\n            if (countdown === 0) finalizeVote();\n        }\n    }[\"VoteScreen.useEffect\"], [\n        countdown\n    ]);\n    const finalizeVote = async ()=>{\n        if (!gameData) return;\n        const { votes = {}, bingoCaller } = gameData;\n        const approveCount = Object.values(votes || {}).filter((vote)=>vote === 'approve').length;\n        const rejectCount = Object.values(votes || {}).filter((vote)=>vote === 'reject').length;\n        const gameRef = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_4__.doc)(_lib_firebase__WEBPACK_IMPORTED_MODULE_3__.db, 'games', lobbyCode);\n        try {\n            if (approveCount >= rejectCount || approveCount === 0) {\n                // Bingo Approved\n                await (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_4__.updateDoc)(gameRef, {\n                    [\"players.\".concat(bingoCaller, \".score\")]: (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_4__.increment)(1),\n                    currentBingoBoard: null,\n                    bingoCaller: null,\n                    votes: {}\n                });\n                debugLog('Bingo Approved! Redirecting...');\n                router.push(\"/lobby/\".concat(lobbyCode));\n            } else {\n                // Bingo Rejected\n                await (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_4__.updateDoc)(gameRef, {\n                    currentBingoBoard: null,\n                    bingoCaller: null,\n                    votes: {}\n                });\n                debugLog('Bingo Rejected! Redirecting...');\n                router.push(\"/game/\".concat(lobbyCode));\n            }\n        } catch (err) {\n            console.error('Error Finalizing Vote:', err);\n            setError('Failed to finalize the vote.');\n        }\n    };\n    const castVote = async (vote)=>{\n        if (!gameData || gameData.bingoCaller === userName) return;\n        const gameRef = (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_4__.doc)(_lib_firebase__WEBPACK_IMPORTED_MODULE_3__.db, 'games', lobbyCode);\n        try {\n            await (0,firebase_firestore__WEBPACK_IMPORTED_MODULE_4__.updateDoc)(gameRef, {\n                [\"votes.\".concat(userName)]: vote\n            });\n            debugLog(\"Vote Cast: \".concat(vote, \" by \").concat(userName));\n        } catch (err) {\n            console.error('Error Casting Vote:', err);\n            setError('Failed to cast vote.');\n        }\n    };\n    // Debug Game Data\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)({\n        \"VoteScreen.useEffect\": ()=>{\n            if (gameData === null || gameData === void 0 ? void 0 : gameData.currentBingoBoard) {\n                debugLog('Current Bingo Board:', gameData.currentBingoBoard);\n            } else {\n                debugLog('No Current Bingo Board Found.');\n            }\n        }\n    }[\"VoteScreen.useEffect\"], [\n        gameData\n    ]);\n    if (!gameData) return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n        children: \"Loading game data...\"\n    }, void 0, false, {\n        fileName: \"C:\\\\Projects\\\\Bingo\\\\pages\\\\vote\\\\[lobbyCode].js\",\n        lineNumber: 127,\n        columnNumber: 25\n    }, undefined);\n    const { bingoCaller, currentBingoBoard } = gameData;\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        style: styles.container,\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                children: [\n                    \"Vote on \",\n                    bingoCaller,\n                    \"'s Board\"\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Projects\\\\Bingo\\\\pages\\\\vote\\\\[lobbyCode].js\",\n                lineNumber: 133,\n                columnNumber: 7\n            }, undefined),\n            currentBingoBoard ? /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_VoteCard__WEBPACK_IMPORTED_MODULE_5__[\"default\"], {\n                board: currentBingoBoard\n            }, void 0, false, {\n                fileName: \"C:\\\\Projects\\\\Bingo\\\\pages\\\\vote\\\\[lobbyCode].js\",\n                lineNumber: 135,\n                columnNumber: 9\n            }, undefined) : /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                children: \"No board to display. Please check Firestore.\"\n            }, void 0, false, {\n                fileName: \"C:\\\\Projects\\\\Bingo\\\\pages\\\\vote\\\\[lobbyCode].js\",\n                lineNumber: 137,\n                columnNumber: 9\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                children: [\n                    \"Time remaining: \",\n                    countdown,\n                    \"s\"\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Projects\\\\Bingo\\\\pages\\\\vote\\\\[lobbyCode].js\",\n                lineNumber: 139,\n                columnNumber: 7\n            }, undefined),\n            bingoCaller !== userName && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                style: styles.voteButtons,\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                        style: styles.approveButton,\n                        onClick: ()=>castVote('approve'),\n                        children: \"Approve\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Projects\\\\Bingo\\\\pages\\\\vote\\\\[lobbyCode].js\",\n                        lineNumber: 142,\n                        columnNumber: 11\n                    }, undefined),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                        style: styles.rejectButton,\n                        onClick: ()=>castVote('reject'),\n                        children: \"Reject\"\n                    }, void 0, false, {\n                        fileName: \"C:\\\\Projects\\\\Bingo\\\\pages\\\\vote\\\\[lobbyCode].js\",\n                        lineNumber: 145,\n                        columnNumber: 11\n                    }, undefined)\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Projects\\\\Bingo\\\\pages\\\\vote\\\\[lobbyCode].js\",\n                lineNumber: 141,\n                columnNumber: 9\n            }, undefined),\n            error && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                style: styles.error,\n                children: error\n            }, void 0, false, {\n                fileName: \"C:\\\\Projects\\\\Bingo\\\\pages\\\\vote\\\\[lobbyCode].js\",\n                lineNumber: 150,\n                columnNumber: 17\n            }, undefined)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Projects\\\\Bingo\\\\pages\\\\vote\\\\[lobbyCode].js\",\n        lineNumber: 132,\n        columnNumber: 5\n    }, undefined);\n};\n_s(VoteScreen, \"aZ3Gh29Go8GuM/4w9tmmg7RMfEM=\", false, function() {\n    return [\n        next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter\n    ];\n});\n_c = VoteScreen;\nconst styles = {\n    container: {\n        textAlign: 'center',\n        padding: '20px',\n        fontFamily: 'Arial, sans-serif'\n    },\n    voteButtons: {\n        marginTop: '20px'\n    },\n    approveButton: {\n        padding: '10px 20px',\n        marginRight: '10px',\n        backgroundColor: 'green',\n        color: 'white',\n        border: 'none',\n        borderRadius: '5px',\n        cursor: 'pointer',\n        fontSize: '1rem'\n    },\n    rejectButton: {\n        padding: '10px 20px',\n        backgroundColor: 'red',\n        color: 'white',\n        border: 'none',\n        borderRadius: '5px',\n        cursor: 'pointer',\n        fontSize: '1rem'\n    },\n    error: {\n        color: 'red',\n        marginTop: '20px'\n    }\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (VoteScreen);\nvar _c;\n$RefreshReg$(_c, \"VoteScreen\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyB1c2VSb3V0ZXIgfSBmcm9tICduZXh0L3JvdXRlcic7XHJcbmltcG9ydCB7IGRiIH0gZnJvbSAnLi4vLi4vbGliL2ZpcmViYXNlJztcclxuaW1wb3J0IHsgZG9jLCBvblNuYXBzaG90LCB1cGRhdGVEb2MsIGluY3JlbWVudCB9IGZyb20gJ2ZpcmViYXNlL2ZpcmVzdG9yZSc7XHJcbmltcG9ydCBWb3RlQ2FyZCBmcm9tICcuLi8uLi9jb21wb25lbnRzL1ZvdGVDYXJkJztcclxuXHJcbmNvbnN0IFZvdGVTY3JlZW4gPSAoKSA9PiB7XHJcbiAgY29uc3Qgcm91dGVyID0gdXNlUm91dGVyKCk7XHJcbiAgY29uc3QgeyBsb2JieUNvZGUgfSA9IHJvdXRlci5xdWVyeTtcclxuXHJcbiAgY29uc3QgW2dhbWVEYXRhLCBzZXRHYW1lRGF0YV0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbdXNlck5hbWUsIHNldFVzZXJOYW1lXSA9IHVzZVN0YXRlKCcnKTtcclxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIGNvbnN0IFtjb3VudGRvd24sIHNldENvdW50ZG93bl0gPSB1c2VTdGF0ZSg2MCk7XHJcblxyXG4gIC8vIExvZ2dpbmcgSGVscGVyXHJcbiAgY29uc3QgZGVidWdMb2cgPSAobWVzc2FnZSwgZGF0YSkgPT4gY29uc29sZS5sb2coYFtERUJVR106ICR7bWVzc2FnZX1gLCBkYXRhKTtcclxuXHJcbiAgLy8gRmV0Y2ggR2FtZSBEYXRhXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmICghbG9iYnlDb2RlKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgZ2FtZVJlZiA9IGRvYyhkYiwgJ2dhbWVzJywgbG9iYnlDb2RlKTtcclxuXHJcbiAgICBjb25zdCB1bnN1YnNjcmliZSA9IG9uU25hcHNob3QoZ2FtZVJlZiwgKHNuYXBzaG90KSA9PiB7XHJcbiAgICAgIGlmIChzbmFwc2hvdC5leGlzdHMoKSkge1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBzbmFwc2hvdC5kYXRhKCk7XHJcbiAgICAgICAgZGVidWdMb2coJ0ZldGNoZWQgR2FtZSBEYXRhOicsIGRhdGEpO1xyXG4gICAgICAgIHNldEdhbWVEYXRhKGRhdGEpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGRlYnVnTG9nKCdHYW1lIERhdGEgTm90IEZvdW5kLicpO1xyXG4gICAgICAgIHNldEdhbWVEYXRhKG51bGwpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gKCkgPT4gdW5zdWJzY3JpYmUoKTtcclxuICB9LCBbbG9iYnlDb2RlXSk7XHJcblxyXG4gIC8vIEZldGNoIFVzZXJuYW1lIGZyb20gTG9jYWwgU3RvcmFnZVxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBjb25zdCBzdG9yZWRVc2VyTmFtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyTmFtZScpIHx8ICdHdWVzdCc7XHJcbiAgICBzZXRVc2VyTmFtZShzdG9yZWRVc2VyTmFtZSk7XHJcbiAgICBkZWJ1Z0xvZygnRmV0Y2hlZCBVc2VybmFtZTonLCBzdG9yZWRVc2VyTmFtZSk7XHJcbiAgfSwgW10pO1xyXG5cclxuICAvLyBDb3VudGRvd24gVGltZXJcclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKCFnYW1lRGF0YT8uY3VycmVudEJpbmdvQm9hcmQpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCB0aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgc2V0Q291bnRkb3duKChwcmV2KSA9PiB7XHJcbiAgICAgICAgaWYgKHByZXYgPiAwKSByZXR1cm4gcHJldiAtIDE7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcik7IC8vIFN0b3AgVGltZXJcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfSk7XHJcbiAgICB9LCAxMDAwKTtcclxuXHJcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbCh0aW1lcik7IC8vIENsZWFudXBcclxuICB9LCBbZ2FtZURhdGFdKTtcclxuXHJcbiAgLy8gRmluYWxpemUgVm90ZSBBZnRlciBDb3VudGRvd24gRW5kc1xyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAoY291bnRkb3duID09PSAwKSBmaW5hbGl6ZVZvdGUoKTtcclxuICB9LCBbY291bnRkb3duXSk7XHJcblxyXG4gIGNvbnN0IGZpbmFsaXplVm90ZSA9IGFzeW5jICgpID0+IHtcclxuICAgIGlmICghZ2FtZURhdGEpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCB7IHZvdGVzID0ge30sIGJpbmdvQ2FsbGVyIH0gPSBnYW1lRGF0YTtcclxuICAgIGNvbnN0IGFwcHJvdmVDb3VudCA9IE9iamVjdC52YWx1ZXModm90ZXMgfHwge30pLmZpbHRlcigodm90ZSkgPT4gdm90ZSA9PT0gJ2FwcHJvdmUnKS5sZW5ndGg7XHJcbiAgICBjb25zdCByZWplY3RDb3VudCA9IE9iamVjdC52YWx1ZXModm90ZXMgfHwge30pLmZpbHRlcigodm90ZSkgPT4gdm90ZSA9PT0gJ3JlamVjdCcpLmxlbmd0aDtcclxuXHJcbiAgICBjb25zdCBnYW1lUmVmID0gZG9jKGRiLCAnZ2FtZXMnLCBsb2JieUNvZGUpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGlmIChhcHByb3ZlQ291bnQgPj0gcmVqZWN0Q291bnQgfHwgYXBwcm92ZUNvdW50ID09PSAwKSB7XHJcbiAgICAgICAgLy8gQmluZ28gQXBwcm92ZWRcclxuICAgICAgICBhd2FpdCB1cGRhdGVEb2MoZ2FtZVJlZiwge1xyXG4gICAgICAgICAgW2BwbGF5ZXJzLiR7YmluZ29DYWxsZXJ9LnNjb3JlYF06IGluY3JlbWVudCgxKSxcclxuICAgICAgICAgIGN1cnJlbnRCaW5nb0JvYXJkOiBudWxsLFxyXG4gICAgICAgICAgYmluZ29DYWxsZXI6IG51bGwsXHJcbiAgICAgICAgICB2b3Rlczoge30sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZGVidWdMb2coJ0JpbmdvIEFwcHJvdmVkISBSZWRpcmVjdGluZy4uLicpO1xyXG4gICAgICAgIHJvdXRlci5wdXNoKGAvbG9iYnkvJHtsb2JieUNvZGV9YCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gQmluZ28gUmVqZWN0ZWRcclxuICAgICAgICBhd2FpdCB1cGRhdGVEb2MoZ2FtZVJlZiwge1xyXG4gICAgICAgICAgY3VycmVudEJpbmdvQm9hcmQ6IG51bGwsXHJcbiAgICAgICAgICBiaW5nb0NhbGxlcjogbnVsbCxcclxuICAgICAgICAgIHZvdGVzOiB7fSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBkZWJ1Z0xvZygnQmluZ28gUmVqZWN0ZWQhIFJlZGlyZWN0aW5nLi4uJyk7XHJcbiAgICAgICAgcm91dGVyLnB1c2goYC9nYW1lLyR7bG9iYnlDb2RlfWApO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgRmluYWxpemluZyBWb3RlOicsIGVycik7XHJcbiAgICAgIHNldEVycm9yKCdGYWlsZWQgdG8gZmluYWxpemUgdGhlIHZvdGUuJyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgY2FzdFZvdGUgPSBhc3luYyAodm90ZSkgPT4ge1xyXG4gICAgaWYgKCFnYW1lRGF0YSB8fCBnYW1lRGF0YS5iaW5nb0NhbGxlciA9PT0gdXNlck5hbWUpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBnYW1lUmVmID0gZG9jKGRiLCAnZ2FtZXMnLCBsb2JieUNvZGUpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IHVwZGF0ZURvYyhnYW1lUmVmLCB7XHJcbiAgICAgICAgW2B2b3Rlcy4ke3VzZXJOYW1lfWBdOiB2b3RlLFxyXG4gICAgICB9KTtcclxuICAgICAgZGVidWdMb2coYFZvdGUgQ2FzdDogJHt2b3RlfSBieSAke3VzZXJOYW1lfWApO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIENhc3RpbmcgVm90ZTonLCBlcnIpO1xyXG4gICAgICBzZXRFcnJvcignRmFpbGVkIHRvIGNhc3Qgdm90ZS4nKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBEZWJ1ZyBHYW1lIERhdGFcclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKGdhbWVEYXRhPy5jdXJyZW50QmluZ29Cb2FyZCkge1xyXG4gICAgICBkZWJ1Z0xvZygnQ3VycmVudCBCaW5nbyBCb2FyZDonLCBnYW1lRGF0YS5jdXJyZW50QmluZ29Cb2FyZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkZWJ1Z0xvZygnTm8gQ3VycmVudCBCaW5nbyBCb2FyZCBGb3VuZC4nKTtcclxuICAgIH1cclxuICB9LCBbZ2FtZURhdGFdKTtcclxuXHJcbiAgaWYgKCFnYW1lRGF0YSkgcmV0dXJuIDxwPkxvYWRpbmcgZ2FtZSBkYXRhLi4uPC9wPjtcclxuXHJcbiAgY29uc3QgeyBiaW5nb0NhbGxlciwgY3VycmVudEJpbmdvQm9hcmQgfSA9IGdhbWVEYXRhO1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBzdHlsZT17c3R5bGVzLmNvbnRhaW5lcn0+XHJcbiAgICAgIDxoMT5Wb3RlIG9uIHtiaW5nb0NhbGxlcn0mYXBvcztzIEJvYXJkPC9oMT5cclxuICAgICAge2N1cnJlbnRCaW5nb0JvYXJkID8gKFxyXG4gICAgICAgIDxWb3RlQ2FyZCBib2FyZD17Y3VycmVudEJpbmdvQm9hcmR9IC8+XHJcbiAgICAgICkgOiAoXHJcbiAgICAgICAgPHA+Tm8gYm9hcmQgdG8gZGlzcGxheS4gUGxlYXNlIGNoZWNrIEZpcmVzdG9yZS48L3A+XHJcbiAgICAgICl9XHJcbiAgICAgIDxwPlRpbWUgcmVtYWluaW5nOiB7Y291bnRkb3dufXM8L3A+XHJcbiAgICAgIHtiaW5nb0NhbGxlciAhPT0gdXNlck5hbWUgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3N0eWxlcy52b3RlQnV0dG9uc30+XHJcbiAgICAgICAgICA8YnV0dG9uIHN0eWxlPXtzdHlsZXMuYXBwcm92ZUJ1dHRvbn0gb25DbGljaz17KCkgPT4gY2FzdFZvdGUoJ2FwcHJvdmUnKX0+XHJcbiAgICAgICAgICAgIEFwcHJvdmVcclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgPGJ1dHRvbiBzdHlsZT17c3R5bGVzLnJlamVjdEJ1dHRvbn0gb25DbGljaz17KCkgPT4gY2FzdFZvdGUoJ3JlamVjdCcpfT5cclxuICAgICAgICAgICAgUmVqZWN0XHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuICAgICAge2Vycm9yICYmIDxwIHN0eWxlPXtzdHlsZXMuZXJyb3J9PntlcnJvcn08L3A+fVxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufTtcclxuXHJcbmNvbnN0IHN0eWxlcyA9IHtcclxuICBjb250YWluZXI6IHtcclxuICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICBwYWRkaW5nOiAnMjBweCcsXHJcbiAgICBmb250RmFtaWx5OiAnQXJpYWwsIHNhbnMtc2VyaWYnLFxyXG4gIH0sXHJcbiAgdm90ZUJ1dHRvbnM6IHtcclxuICAgIG1hcmdpblRvcDogJzIwcHgnLFxyXG4gIH0sXHJcbiAgYXBwcm92ZUJ1dHRvbjoge1xyXG4gICAgcGFkZGluZzogJzEwcHggMjBweCcsXHJcbiAgICBtYXJnaW5SaWdodDogJzEwcHgnLFxyXG4gICAgYmFja2dyb3VuZENvbG9yOiAnZ3JlZW4nLFxyXG4gICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICBib3JkZXI6ICdub25lJyxcclxuICAgIGJvcmRlclJhZGl1czogJzVweCcsXHJcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgIGZvbnRTaXplOiAnMXJlbScsXHJcbiAgfSxcclxuICByZWplY3RCdXR0b246IHtcclxuICAgIHBhZGRpbmc6ICcxMHB4IDIwcHgnLFxyXG4gICAgYmFja2dyb3VuZENvbG9yOiAncmVkJyxcclxuICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICBib3JkZXJSYWRpdXM6ICc1cHgnLFxyXG4gICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICBmb250U2l6ZTogJzFyZW0nLFxyXG4gIH0sXHJcbiAgZXJyb3I6IHtcclxuICAgIGNvbG9yOiAncmVkJyxcclxuICAgIG1hcmdpblRvcDogJzIwcHgnLFxyXG4gIH0sXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWb3RlU2NyZWVuO1xyXG4iXSwibmFtZXMiOlsiUmVhY3QiLCJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsInVzZVJvdXRlciIsImRiIiwiZG9jIiwib25TbmFwc2hvdCIsInVwZGF0ZURvYyIsImluY3JlbWVudCIsIlZvdGVDYXJkIiwiVm90ZVNjcmVlbiIsInJvdXRlciIsImxvYmJ5Q29kZSIsInF1ZXJ5IiwiZ2FtZURhdGEiLCJzZXRHYW1lRGF0YSIsInVzZXJOYW1lIiwic2V0VXNlck5hbWUiLCJlcnJvciIsInNldEVycm9yIiwiY291bnRkb3duIiwic2V0Q291bnRkb3duIiwiZGVidWdMb2ciLCJtZXNzYWdlIiwiZGF0YSIsImNvbnNvbGUiLCJsb2ciLCJnYW1lUmVmIiwidW5zdWJzY3JpYmUiLCJzbmFwc2hvdCIsImV4aXN0cyIsInN0b3JlZFVzZXJOYW1lIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsImN1cnJlbnRCaW5nb0JvYXJkIiwidGltZXIiLCJzZXRJbnRlcnZhbCIsInByZXYiLCJjbGVhckludGVydmFsIiwiZmluYWxpemVWb3RlIiwidm90ZXMiLCJiaW5nb0NhbGxlciIsImFwcHJvdmVDb3VudCIsIk9iamVjdCIsInZhbHVlcyIsImZpbHRlciIsInZvdGUiLCJsZW5ndGgiLCJyZWplY3RDb3VudCIsInB1c2giLCJlcnIiLCJjYXN0Vm90ZSIsInAiLCJkaXYiLCJzdHlsZSIsInN0eWxlcyIsImNvbnRhaW5lciIsImgxIiwiYm9hcmQiLCJ2b3RlQnV0dG9ucyIsImJ1dHRvbiIsImFwcHJvdmVCdXR0b24iLCJvbkNsaWNrIiwicmVqZWN0QnV0dG9uIiwidGV4dEFsaWduIiwicGFkZGluZyIsImZvbnRGYW1pbHkiLCJtYXJnaW5Ub3AiLCJtYXJnaW5SaWdodCIsImJhY2tncm91bmRDb2xvciIsImNvbG9yIiwiYm9yZGVyIiwiYm9yZGVyUmFkaXVzIiwiY3Vyc29yIiwiZm9udFNpemUiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/vote/[lobbyCode].js\n"));

/***/ })

});