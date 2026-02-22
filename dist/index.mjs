import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { jsx } from "react/jsx-runtime";

//#region src/LazyHydration.tsx
const isServer = typeof window === "undefined";
const WRAPPER_STYLE = { display: "contents" };
const LazyHydration = React.forwardRef(({ fallback, children, intersectionObserver, idleCallback, events = [], legacy = false }, ref) => {
	const id = useId();
	const htmlRef = useRef(null);
	const [shouldHydrate, setShouldHydrate] = useState(false);
	const elementRef = useRef(null);
	const isHydrated = useRef(false);
	const handleRef = useCallback((node) => {
		elementRef.current = node;
		if (typeof ref === "function") ref(node);
		else if (ref) ref.current = node;
	}, [ref]);
	useEffect(() => {
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
		return /* @__PURE__ */ jsx("div", {
			ref: handleRef,
			style: WRAPPER_STYLE,
			id,
			suppressHydrationWarning: true,
			children
		});
	}
	if (legacy) return /* @__PURE__ */ jsx("div", {
		ref: handleRef,
		style: WRAPPER_STYLE,
		id,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: "" }
	});
	if (htmlRef.current === null) htmlRef.current = document.getElementById(id)?.innerHTML || "";
	if (htmlRef.current === "") return /* @__PURE__ */ jsx("div", {
		ref: handleRef,
		style: WRAPPER_STYLE,
		id,
		suppressHydrationWarning: true,
		children: fallback
	});
	return /* @__PURE__ */ jsx("div", {
		ref: handleRef,
		style: WRAPPER_STYLE,
		id,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: htmlRef.current }
	});
});

//#endregion
export { LazyHydration };
//# sourceMappingURL=index.mjs.map