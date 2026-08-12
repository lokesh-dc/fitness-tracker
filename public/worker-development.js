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

eval(__webpack_require__.ts("// Custom Service Worker for Rest Timer & Push Notifications\n// Built for @ducanh2912/next-pwa\nlet restTimerTimeout = null;\n// Message listener for Rest Timer (Local SW Timeout)\nself.addEventListener('message', (event)=>{\n    if (event.data?.type === 'SCHEDULE_REST_NOTIFICATION') {\n        // Clear any existing timeout\n        if (restTimerTimeout) {\n            clearTimeout(restTimerTimeout);\n        }\n        const { delay, title, body } = event.data;\n        if (delay < 0 || delay > 600000) return;\n        event.waitUntil((async ()=>{\n            // Wait for the delay specified in the message\n            await new Promise((resolve)=>{\n                restTimerTimeout = setTimeout(async ()=>{\n                    await self.registration.showNotification(title, {\n                        body,\n                        icon: '/icons/icon-192x192.png',\n                        badge: '/icons/badge-72x72.png',\n                        tag: 'rest-timer',\n                        renotify: true,\n                        vibrate: [\n                            300,\n                            100,\n                            300,\n                            100,\n                            500\n                        ],\n                        data: {\n                            url: '/workout'\n                        }\n                    });\n                    restTimerTimeout = null;\n                    resolve();\n                }, delay);\n            });\n        })());\n    }\n    if (event.data?.type === 'CANCEL_REST_NOTIFICATION') {\n        if (restTimerTimeout) {\n            clearTimeout(restTimerTimeout);\n            restTimerTimeout = null;\n        }\n        event.waitUntil(self.registration.getNotifications({\n            tag: 'rest-timer'\n        }).then((notifications)=>{\n            notifications.forEach((n)=>n.close());\n        }));\n    }\n});\n// Push notification listener (VAPID Remote Push)\nself.addEventListener(\"push\", (event)=>{\n    let data = {\n        title: \"Rest Complete 🔥\",\n        body: \"Time to hit the next set!\",\n        url: \"/workout\"\n    };\n    try {\n        if (event.data) {\n            data = event.data.json();\n        }\n    } catch (e) {\n        console.warn(\"Push event data parse failed:\", e);\n    }\n    const options = {\n        body: data.body,\n        icon: \"/icons/icon-192x192.png\",\n        badge: \"/icons/badge-72x72.png\",\n        tag: 'rest-timer',\n        renotify: true,\n        vibrate: [\n            300,\n            100,\n            300,\n            100,\n            500\n        ],\n        data: {\n            url: data.url || '/workout'\n        }\n    };\n    event.waitUntil(self.registration.showNotification(data.title, options));\n});\n// Notification click listener\nself.addEventListener('notificationclick', (event)=>{\n    event.notification.close();\n    const urlToOpen = event.notification.data?.url || '/workout';\n    event.waitUntil(self.clients.matchAll({\n        type: 'window'\n    }).then((clientList)=>{\n        for (const client of clientList){\n            if (client.url.includes('/workout') && 'focus' in client) {\n                return client.focus();\n            }\n        }\n        if (self.clients.openWindow) {\n            return self.clients.openWindow(urlToOpen);\n        }\n    }));\n});\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                /* unsupported import.meta.webpackHot */ undefined.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QU8sS0FBY04sT0FBTyxDQUFDTSxVQUFVLENBQUNQO1FBQzFDO0lBQ0Y7QUFFSiIsInNvdXJjZXMiOlsiL1VzZXJzL2xva2VzaF9jaG91ZGhhcnkvRG9jdW1lbnRzL05ld19Qcm9qZWN0cy9GaXRuZXNzL2ZpdG5lc3MtdHJhY2tlci93b3JrZXIvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ3VzdG9tIFNlcnZpY2UgV29ya2VyIGZvciBSZXN0IFRpbWVyICYgUHVzaCBOb3RpZmljYXRpb25zXG4vLyBCdWlsdCBmb3IgQGR1Y2FuaDI5MTIvbmV4dC1wd2FcblxubGV0IHJlc3RUaW1lclRpbWVvdXQ6IGFueSA9IG51bGw7XG5cbi8vIE1lc3NhZ2UgbGlzdGVuZXIgZm9yIFJlc3QgVGltZXIgKExvY2FsIFNXIFRpbWVvdXQpXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQ6IGFueSkgPT4ge1xuICBpZiAoZXZlbnQuZGF0YT8udHlwZSA9PT0gJ1NDSEVEVUxFX1JFU1RfTk9USUZJQ0FUSU9OJykge1xuICAgIC8vIENsZWFyIGFueSBleGlzdGluZyB0aW1lb3V0XG4gICAgaWYgKHJlc3RUaW1lclRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dChyZXN0VGltZXJUaW1lb3V0KTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGRlbGF5LCB0aXRsZSwgYm9keSB9ID0gZXZlbnQuZGF0YTtcblxuICAgIGlmIChkZWxheSA8IDAgfHwgZGVsYXkgPiA2MDAwMDApIHJldHVybjtcblxuICAgIGV2ZW50LndhaXRVbnRpbChcbiAgICAgIChhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIFdhaXQgZm9yIHRoZSBkZWxheSBzcGVjaWZpZWQgaW4gdGhlIG1lc3NhZ2VcblxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgIHJlc3RUaW1lclRpbWVvdXQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IChzZWxmIGFzIGFueSkucmVnaXN0cmF0aW9uLnNob3dOb3RpZmljYXRpb24odGl0bGUsIHtcbiAgICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgICAgaWNvbjogJy9pY29ucy9pY29uLTE5MngxOTIucG5nJyxcbiAgICAgICAgICAgICAgYmFkZ2U6ICcvaWNvbnMvYmFkZ2UtNzJ4NzIucG5nJyxcbiAgICAgICAgICAgICAgdGFnOiAncmVzdC10aW1lcicsXG4gICAgICAgICAgICAgIHJlbm90aWZ5OiB0cnVlLFxuICAgICAgICAgICAgICB2aWJyYXRlOiBbMzAwLCAxMDAsIDMwMCwgMTAwLCA1MDBdLFxuICAgICAgICAgICAgICBkYXRhOiB7IHVybDogJy93b3Jrb3V0JyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXN0VGltZXJUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgIH0pO1xuICAgICAgfSkoKVxuICAgICk7XG4gIH1cblxuICBpZiAoZXZlbnQuZGF0YT8udHlwZSA9PT0gJ0NBTkNFTF9SRVNUX05PVElGSUNBVElPTicpIHtcbiAgICBpZiAocmVzdFRpbWVyVGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHJlc3RUaW1lclRpbWVvdXQpO1xuICAgICAgcmVzdFRpbWVyVGltZW91dCA9IG51bGw7XG4gICAgfVxuICAgIGV2ZW50LndhaXRVbnRpbChcbiAgICAgIChzZWxmIGFzIGFueSkucmVnaXN0cmF0aW9uLmdldE5vdGlmaWNhdGlvbnMoeyB0YWc6ICdyZXN0LXRpbWVyJyB9KS50aGVuKChub3RpZmljYXRpb25zOiBhbnlbXSkgPT4ge1xuICAgICAgICBub3RpZmljYXRpb25zLmZvckVhY2gobiA9PiBuLmNsb3NlKCkpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG59KTtcblxuLy8gUHVzaCBub3RpZmljYXRpb24gbGlzdGVuZXIgKFZBUElEIFJlbW90ZSBQdXNoKVxuc2VsZi5hZGRFdmVudExpc3RlbmVyKFwicHVzaFwiLCAoZXZlbnQ6IGFueSkgPT4ge1xuICBsZXQgZGF0YSA9IHsgdGl0bGU6IFwiUmVzdCBDb21wbGV0ZSDwn5SlXCIsIGJvZHk6IFwiVGltZSB0byBoaXQgdGhlIG5leHQgc2V0IVwiLCB1cmw6IFwiL3dvcmtvdXRcIiB9O1xuXG4gIHRyeSB7XG4gICAgaWYgKGV2ZW50LmRhdGEpIHtcbiAgICAgIGRhdGEgPSBldmVudC5kYXRhLmpzb24oKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLndhcm4oXCJQdXNoIGV2ZW50IGRhdGEgcGFyc2UgZmFpbGVkOlwiLCBlKTtcbiAgfVxuXG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgYm9keTogZGF0YS5ib2R5LFxuICAgIGljb246IFwiL2ljb25zL2ljb24tMTkyeDE5Mi5wbmdcIixcbiAgICBiYWRnZTogXCIvaWNvbnMvYmFkZ2UtNzJ4NzIucG5nXCIsXG4gICAgdGFnOiAncmVzdC10aW1lcicsIC8vIFNhbWUgdGFnIGVuc3VyZXMgaXQgcmVwbGFjZXMgdGhlIGxvY2FsICdUaW1lciBBY3RpdmUnIG5vdGlmaWNhdGlvblxuICAgIHJlbm90aWZ5OiB0cnVlLFxuICAgIHZpYnJhdGU6IFszMDAsIDEwMCwgMzAwLCAxMDAsIDUwMF0sXG4gICAgZGF0YToge1xuICAgICAgdXJsOiBkYXRhLnVybCB8fCAnL3dvcmtvdXQnLFxuICAgIH0sXG4gIH07XG5cbiAgZXZlbnQud2FpdFVudGlsKFxuICAgIChzZWxmIGFzIGFueSkucmVnaXN0cmF0aW9uLnNob3dOb3RpZmljYXRpb24oZGF0YS50aXRsZSwgb3B0aW9ucylcbiAgKTtcbn0pO1xuXG4vLyBOb3RpZmljYXRpb24gY2xpY2sgbGlzdGVuZXJcbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbm90aWZpY2F0aW9uY2xpY2snLCAoZXZlbnQ6IGFueSkgPT4ge1xuICBldmVudC5ub3RpZmljYXRpb24uY2xvc2UoKTtcblxuICBjb25zdCB1cmxUb09wZW4gPSBldmVudC5ub3RpZmljYXRpb24uZGF0YT8udXJsIHx8ICcvd29ya291dCc7XG5cbiAgZXZlbnQud2FpdFVudGlsKFxuICAgIChzZWxmIGFzIGFueSkuY2xpZW50cy5tYXRjaEFsbCh7IHR5cGU6ICd3aW5kb3cnIH0pLnRoZW4oKGNsaWVudExpc3Q6IGFueVtdKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGNsaWVudCBvZiBjbGllbnRMaXN0KSB7XG4gICAgICAgIGlmIChjbGllbnQudXJsLmluY2x1ZGVzKCcvd29ya291dCcpICYmICdmb2N1cycgaW4gY2xpZW50KSB7XG4gICAgICAgICAgcmV0dXJuIGNsaWVudC5mb2N1cygpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoKHNlbGYgYXMgYW55KS5jbGllbnRzLm9wZW5XaW5kb3cpIHtcbiAgICAgICAgcmV0dXJuIChzZWxmIGFzIGFueSkuY2xpZW50cy5vcGVuV2luZG93KHVybFRvT3Blbik7XG4gICAgICB9XG4gICAgfSlcbiAgKTtcbn0pO1xuIl0sIm5hbWVzIjpbInJlc3RUaW1lclRpbWVvdXQiLCJzZWxmIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwiZGF0YSIsInR5cGUiLCJjbGVhclRpbWVvdXQiLCJkZWxheSIsInRpdGxlIiwiYm9keSIsIndhaXRVbnRpbCIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsInJlZ2lzdHJhdGlvbiIsInNob3dOb3RpZmljYXRpb24iLCJpY29uIiwiYmFkZ2UiLCJ0YWciLCJyZW5vdGlmeSIsInZpYnJhdGUiLCJ1cmwiLCJnZXROb3RpZmljYXRpb25zIiwidGhlbiIsIm5vdGlmaWNhdGlvbnMiLCJmb3JFYWNoIiwibiIsImNsb3NlIiwianNvbiIsImUiLCJjb25zb2xlIiwid2FybiIsIm9wdGlvbnMiLCJub3RpZmljYXRpb24iLCJ1cmxUb09wZW4iLCJjbGllbnRzIiwibWF0Y2hBbGwiLCJjbGllbnRMaXN0IiwiY2xpZW50IiwiaW5jbHVkZXMiLCJmb2N1cyIsIm9wZW5XaW5kb3ciXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./worker/index.ts\n"));

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