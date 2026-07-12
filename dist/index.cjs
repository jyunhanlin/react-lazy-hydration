Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let react = require("react");
react = __toESM(react);
let react_jsx_runtime = require("react/jsx-runtime");
//#region src/LazyHydration.tsx
const isServer = typeof window === "undefined";
const WRAPPER_STYLE = { display: "contents" };
const LazyHydration = react.default.forwardRef(({ fallback, children, intersectionObserver, idleCallback, events = [], legacy = false }, ref) => {
	const id = (0, react.useId)();
	const htmlRef = (0, react.useRef)(null);
	const [shouldHydrate, setShouldHydrate] = (0, react.useState)(false);
	const elementRef = (0, react.useRef)(null);
	const isHydrated = (0, react.useRef)(false);
	const handleRef = (0, react.useCallback)((node) => {
		elementRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	}, [ref]);
	(0, react.useEffect)(() => {
		const cleanups = [];
		if (intersectionObserver && elementRef.current) {
			const observer = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting) {
					setShouldHydrate(true);
					observer.disconnect();
				}
			}, intersectionObserver);
			observer.observe(elementRef.current);
			cleanups.push(() => observer.disconnect());
		}
		if (idleCallback) {
			const { timeout = 0 } = idleCallback;
			if ("requestIdleCallback" in window) {
				const idleId = window.requestIdleCallback(() => setShouldHydrate(true), { timeout });
				cleanups.push(() => window.cancelIdleCallback(idleId));
			} else {
				const timeoutId = setTimeout(() => setShouldHydrate(true), timeout);
				cleanups.push(() => clearTimeout(timeoutId));
			}
		}
		if (events.length) {
			const handleEvent = () => setShouldHydrate(true);
			events.forEach((event) => {
				window.addEventListener(event, handleEvent, { once: true });
			});
			cleanups.push(() => {
				events.forEach((event) => {
					window.removeEventListener(event, handleEvent);
				});
			});
		}
		return () => {
			cleanups.forEach((cleanup) => {
				cleanup();
			});
		};
	}, [
		intersectionObserver,
		idleCallback,
		events
	]);
	if (isServer || shouldHydrate || isHydrated.current) {
		if (!isServer && !isHydrated.current) isHydrated.current = true;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			ref: handleRef,
			style: WRAPPER_STYLE,
			id,
			suppressHydrationWarning: true,
			children
		});
	}
	if (legacy) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		ref: handleRef,
		style: WRAPPER_STYLE,
		id,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: "" }
	});
	if (htmlRef.current === null) htmlRef.current = document.getElementById(id)?.innerHTML || "";
	if (htmlRef.current === "") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		ref: handleRef,
		style: WRAPPER_STYLE,
		id,
		suppressHydrationWarning: true,
		children: fallback
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		ref: handleRef,
		style: WRAPPER_STYLE,
		id,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: htmlRef.current }
	});
});
//#endregion
exports.LazyHydration = LazyHydration;

//# sourceMappingURL=index.cjs.map