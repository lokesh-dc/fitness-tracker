/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./worker/index.ts":
/*!*************************!*\
  !*** ./worker/index.ts ***!
  \*************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval(__webpack_require__.ts("// Custom Service Worker for Rest Timer & Push Notifications\n// Built for @ducanh2912/next-pwa\nlet restTimerTimeout = null;\n// Message listener for Rest Timer (Local SW Timeout)\nself.addEventListener('message', (event)=>{\n    if (event.data?.type === 'SCHEDULE_REST_NOTIFICATION') {\n        // Clear any existing timeout\n        if (restTimerTimeout) {\n            clearTimeout(restTimerTimeout);\n        }\n        const { delay, title, body } = event.data;\n        if (delay < 0 || delay > 600000) return;\n        event.waitUntil((async ()=>{\n            // Wait for the delay specified in the message\n            await new Promise((resolve)=>{\n                restTimerTimeout = setTimeout(async ()=>{\n                    await self.registration.showNotification(title, {\n                        body,\n                        icon: '/icons/icon-192x192.png',\n                        badge: '/icons/badge-72x72.png',\n                        tag: 'rest-timer',\n                        renotify: true,\n                        vibrate: [\n                            300,\n                            100,\n                            300,\n                            100,\n                            500\n                        ],\n                        data: {\n                            url: '/workout'\n                        }\n                    });\n                    restTimerTimeout = null;\n                    resolve();\n                }, delay);\n            });\n        })());\n    }\n    if (event.data?.type === 'CANCEL_REST_NOTIFICATION') {\n        if (restTimerTimeout) {\n            clearTimeout(restTimerTimeout);\n            restTimerTimeout = null;\n        }\n        event.waitUntil(self.registration.getNotifications({\n            tag: 'rest-timer'\n        }).then((notifications)=>{\n            notifications.forEach((n)=>n.close());\n        }));\n    }\n});\n// Push notification listener (VAPID Remote Push)\nself.addEventListener(\"push\", (event)=>{\n    let data = {\n        title: \"Rest Complete 🔥\",\n        body: \"Time to hit the next set!\",\n        url: \"/workout\"\n    };\n    try {\n        if (event.data) {\n            data = event.data.json();\n        }\n    } catch (e) {\n        console.warn(\"Push event data parse failed:\", e);\n    }\n    const options = {\n        body: data.body,\n        icon: \"/icons/icon-192x192.png\",\n        badge: \"/icons/badge-72x72.png\",\n        tag: 'rest-timer',\n        renotify: true,\n        vibrate: [\n            300,\n            100,\n            300,\n            100,\n            500\n        ],\n        data: {\n            url: data.url || '/workout'\n        }\n    };\n    event.waitUntil(self.registration.showNotification(data.title, options));\n});\n// Notification click listener\nself.addEventListener('notificationclick', (event)=>{\n    event.notification.close();\n    const urlToOpen = event.notification.data?.url || '/workout';\n    event.waitUntil(self.clients.matchAll({\n        type: 'window'\n    }).then((clientList)=>{\n        for (const client of clientList){\n            if (client.url.includes('/workout') && 'focus' in client) {\n                return client.focus();\n            }\n        }\n        if (self.clients.openWindow) {\n            return self.clients.openWindow(urlToOpen);\n        }\n    }));\n});\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                /* unsupported import.meta.webpackHot */ undefined.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QU8sS0FBY04sT0FBTyxDQUFDTSxVQUFVLENBQUNQO1FBQzFDO0lBQ0Y7QUFFSiIsInNvdXJjZXMiOlsiL1VzZXJzL2xva2VzaF9jaG91ZGhhcnkvRG9jdW1lbnRzL05ldyBQcm9qZWN0cy9maXRuZXNzLXRyYWNrZXIvd29ya2VyL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEN1c3RvbSBTZXJ2aWNlIFdvcmtlciBmb3IgUmVzdCBUaW1lciAmIFB1c2ggTm90aWZpY2F0aW9uc1xuLy8gQnVpbHQgZm9yIEBkdWNhbmgyOTEyL25leHQtcHdhXG5cbmxldCByZXN0VGltZXJUaW1lb3V0OiBhbnkgPSBudWxsO1xuXG4vLyBNZXNzYWdlIGxpc3RlbmVyIGZvciBSZXN0IFRpbWVyIChMb2NhbCBTVyBUaW1lb3V0KVxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgaWYgKGV2ZW50LmRhdGE/LnR5cGUgPT09ICdTQ0hFRFVMRV9SRVNUX05PVElGSUNBVElPTicpIHtcbiAgICAvLyBDbGVhciBhbnkgZXhpc3RpbmcgdGltZW91dFxuICAgIGlmIChyZXN0VGltZXJUaW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQocmVzdFRpbWVyVGltZW91dCk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBkZWxheSwgdGl0bGUsIGJvZHkgfSA9IGV2ZW50LmRhdGE7XG5cbiAgICBpZiAoZGVsYXkgPCAwIHx8IGRlbGF5ID4gNjAwMDAwKSByZXR1cm47XG5cbiAgICBldmVudC53YWl0VW50aWwoXG4gICAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBXYWl0IGZvciB0aGUgZGVsYXkgc3BlY2lmaWVkIGluIHRoZSBtZXNzYWdlXG5cbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgICAgICByZXN0VGltZXJUaW1lb3V0ID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCAoc2VsZiBhcyBhbnkpLnJlZ2lzdHJhdGlvbi5zaG93Tm90aWZpY2F0aW9uKHRpdGxlLCB7XG4gICAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICAgIGljb246ICcvaWNvbnMvaWNvbi0xOTJ4MTkyLnBuZycsXG4gICAgICAgICAgICAgIGJhZGdlOiAnL2ljb25zL2JhZGdlLTcyeDcyLnBuZycsXG4gICAgICAgICAgICAgIHRhZzogJ3Jlc3QtdGltZXInLFxuICAgICAgICAgICAgICByZW5vdGlmeTogdHJ1ZSxcbiAgICAgICAgICAgICAgdmlicmF0ZTogWzMwMCwgMTAwLCAzMDAsIDEwMCwgNTAwXSxcbiAgICAgICAgICAgICAgZGF0YTogeyB1cmw6ICcvd29ya291dCcgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzdFRpbWVyVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pKClcbiAgICApO1xuICB9XG5cbiAgaWYgKGV2ZW50LmRhdGE/LnR5cGUgPT09ICdDQU5DRUxfUkVTVF9OT1RJRklDQVRJT04nKSB7XG4gICAgaWYgKHJlc3RUaW1lclRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dChyZXN0VGltZXJUaW1lb3V0KTtcbiAgICAgIHJlc3RUaW1lclRpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgICBldmVudC53YWl0VW50aWwoXG4gICAgICAoc2VsZiBhcyBhbnkpLnJlZ2lzdHJhdGlvbi5nZXROb3RpZmljYXRpb25zKHsgdGFnOiAncmVzdC10aW1lcicgfSkudGhlbigobm90aWZpY2F0aW9uczogYW55W10pID0+IHtcbiAgICAgICAgbm90aWZpY2F0aW9ucy5mb3JFYWNoKG4gPT4gbi5jbG9zZSgpKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufSk7XG5cbi8vIFB1c2ggbm90aWZpY2F0aW9uIGxpc3RlbmVyIChWQVBJRCBSZW1vdGUgUHVzaClcbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcihcInB1c2hcIiwgKGV2ZW50OiBhbnkpID0+IHtcbiAgbGV0IGRhdGEgPSB7IHRpdGxlOiBcIlJlc3QgQ29tcGxldGUg8J+UpVwiLCBib2R5OiBcIlRpbWUgdG8gaGl0IHRoZSBuZXh0IHNldCFcIiwgdXJsOiBcIi93b3Jrb3V0XCIgfTtcblxuICB0cnkge1xuICAgIGlmIChldmVudC5kYXRhKSB7XG4gICAgICBkYXRhID0gZXZlbnQuZGF0YS5qc29uKCk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS53YXJuKFwiUHVzaCBldmVudCBkYXRhIHBhcnNlIGZhaWxlZDpcIiwgZSk7XG4gIH1cblxuICBjb25zdCBvcHRpb25zID0ge1xuICAgIGJvZHk6IGRhdGEuYm9keSxcbiAgICBpY29uOiBcIi9pY29ucy9pY29uLTE5MngxOTIucG5nXCIsXG4gICAgYmFkZ2U6IFwiL2ljb25zL2JhZGdlLTcyeDcyLnBuZ1wiLFxuICAgIHRhZzogJ3Jlc3QtdGltZXInLCAvLyBTYW1lIHRhZyBlbnN1cmVzIGl0IHJlcGxhY2VzIHRoZSBsb2NhbCAnVGltZXIgQWN0aXZlJyBub3RpZmljYXRpb25cbiAgICByZW5vdGlmeTogdHJ1ZSxcbiAgICB2aWJyYXRlOiBbMzAwLCAxMDAsIDMwMCwgMTAwLCA1MDBdLFxuICAgIGRhdGE6IHtcbiAgICAgIHVybDogZGF0YS51cmwgfHwgJy93b3Jrb3V0JyxcbiAgICB9LFxuICB9O1xuXG4gIGV2ZW50LndhaXRVbnRpbChcbiAgICAoc2VsZiBhcyBhbnkpLnJlZ2lzdHJhdGlvbi5zaG93Tm90aWZpY2F0aW9uKGRhdGEudGl0bGUsIG9wdGlvbnMpXG4gICk7XG59KTtcblxuLy8gTm90aWZpY2F0aW9uIGNsaWNrIGxpc3RlbmVyXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ25vdGlmaWNhdGlvbmNsaWNrJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgZXZlbnQubm90aWZpY2F0aW9uLmNsb3NlKCk7XG5cbiAgY29uc3QgdXJsVG9PcGVuID0gZXZlbnQubm90aWZpY2F0aW9uLmRhdGE/LnVybCB8fCAnL3dvcmtvdXQnO1xuXG4gIGV2ZW50LndhaXRVbnRpbChcbiAgICAoc2VsZiBhcyBhbnkpLmNsaWVudHMubWF0Y2hBbGwoeyB0eXBlOiAnd2luZG93JyB9KS50aGVuKChjbGllbnRMaXN0OiBhbnlbXSkgPT4ge1xuICAgICAgZm9yIChjb25zdCBjbGllbnQgb2YgY2xpZW50TGlzdCkge1xuICAgICAgICBpZiAoY2xpZW50LnVybC5pbmNsdWRlcygnL3dvcmtvdXQnKSAmJiAnZm9jdXMnIGluIGNsaWVudCkge1xuICAgICAgICAgIHJldHVybiBjbGllbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKChzZWxmIGFzIGFueSkuY2xpZW50cy5vcGVuV2luZG93KSB7XG4gICAgICAgIHJldHVybiAoc2VsZiBhcyBhbnkpLmNsaWVudHMub3BlbldpbmRvdyh1cmxUb09wZW4pO1xuICAgICAgfVxuICAgIH0pXG4gICk7XG59KTtcbiJdLCJuYW1lcyI6WyJyZXN0VGltZXJUaW1lb3V0Iiwic2VsZiIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImRhdGEiLCJ0eXBlIiwiY2xlYXJUaW1lb3V0IiwiZGVsYXkiLCJ0aXRsZSIsImJvZHkiLCJ3YWl0VW50aWwiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFRpbWVvdXQiLCJyZWdpc3RyYXRpb24iLCJzaG93Tm90aWZpY2F0aW9uIiwiaWNvbiIsImJhZGdlIiwidGFnIiwicmVub3RpZnkiLCJ2aWJyYXRlIiwidXJsIiwiZ2V0Tm90aWZpY2F0aW9ucyIsInRoZW4iLCJub3RpZmljYXRpb25zIiwiZm9yRWFjaCIsIm4iLCJjbG9zZSIsImpzb24iLCJlIiwiY29uc29sZSIsIndhcm4iLCJvcHRpb25zIiwibm90aWZpY2F0aW9uIiwidXJsVG9PcGVuIiwiY2xpZW50cyIsIm1hdGNoQWxsIiwiY2xpZW50TGlzdCIsImNsaWVudCIsImluY2x1ZGVzIiwiZm9jdXMiLCJvcGVuV2luZG93Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./worker/index.ts\n"));

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/trusted types policy */
/******/ 	(() => {
/******/ 		var policy;
/******/ 		__webpack_require__.tt = () => {
/******/ 			// Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
/******/ 			if (policy === undefined) {
/******/ 				policy = {
/******/ 					createScript: (script) => (script)
/******/ 				};
/******/ 				if (typeof trustedTypes !== "undefined" && trustedTypes.createPolicy) {
/******/ 					policy = trustedTypes.createPolicy("nextjs#bundler", policy);
/******/ 				}
/******/ 			}
/******/ 			return policy;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script */
/******/ 	(() => {
/******/ 		__webpack_require__.ts = (script) => (__webpack_require__.tt().createScript(script));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/react refresh */
/******/ 	(() => {
/******/ 		if (__webpack_require__.i) {
/******/ 		__webpack_require__.i.push((options) => {
/******/ 			const originalFactory = options.factory;
/******/ 			options.factory = (moduleObject, moduleExports, webpackRequire) => {
/******/ 				if (!originalFactory) {
/******/ 					document.location.reload();
/******/ 					return;
/******/ 				}
/******/ 				const hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;
/******/ 				const cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : () => {};
/******/ 				try {
/******/ 					originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
/******/ 				} finally {
/******/ 					cleanup();
/******/ 				}
/******/ 			}
/******/ 		})
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	
/******/ 	// noop fns to prevent runtime errors during initialization
/******/ 	if (typeof self !== "undefined") {
/******/ 		self.$RefreshReg$ = function () {};
/******/ 		self.$RefreshSig$ = function () {
/******/ 			return function (type) {
/******/ 				return type;
/******/ 			};
/******/ 		};
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./worker/index.ts");
/******/ 	
/******/ })()
;