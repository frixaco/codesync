(function () {
	const t = document.createElement("link").relList;
	if (t && t.supports && t.supports("modulepreload")) return;
	for (const i of document.querySelectorAll('link[rel="modulepreload"]'))
		s(i);
	new MutationObserver((i) => {
		for (const o of i)
			if (o.type === "childList")
				for (const r of o.addedNodes)
					r.tagName === "LINK" && r.rel === "modulepreload" && s(r);
	}).observe(document, { childList: !0, subtree: !0 });
	function n(i) {
		const o = {};
		return (
			i.integrity && (o.integrity = i.integrity),
			i.referrerpolicy && (o.referrerPolicy = i.referrerpolicy),
			i.crossorigin === "use-credentials"
				? (o.credentials = "include")
				: i.crossorigin === "anonymous"
				? (o.credentials = "omit")
				: (o.credentials = "same-origin"),
			o
		);
	}
	function s(i) {
		if (i.ep) return;
		i.ep = !0;
		const o = n(i);
		fetch(i.href, o);
	}
})();
const v = {};
function Ae(e) {
	v.context = e;
}
const Ee = (e, t) => e === t,
	Se = Symbol("solid-track"),
	D = { equals: Ee };
let de = be;
const N = 1,
	V = 2,
	he = { owned: null, cleanups: null, context: null, owner: null },
	ee = {};
var m = null;
let P = null,
	p = null,
	y = null,
	_ = null,
	ie = 0;
function q(e, t) {
	const n = p,
		s = m,
		i = e.length === 0,
		o = i
			? he
			: { owned: null, cleanups: null, context: null, owner: t || s },
		r = i ? e : () => e(() => T(() => oe(o)));
	(m = o), (p = null);
	try {
		return L(r, !0);
	} finally {
		(p = n), (m = s);
	}
}
function k(e, t) {
	t = t ? Object.assign({}, D, t) : D;
	const n = {
			value: e,
			observers: null,
			observerSlots: null,
			comparator: t.equals || void 0,
		},
		s = (i) => (typeof i == "function" && (i = i(n.value)), ye(n, i));
	return [me.bind(n), s];
}
function le(e, t, n) {
	const s = X(e, t, !0, N);
	H(s);
}
function F(e, t, n) {
	const s = X(e, t, !1, N);
	H(s);
}
function pe(e, t, n) {
	de = je;
	const s = X(e, t, !1, N);
	(s.user = !0), _ ? _.push(s) : H(s);
}
function G(e, t, n) {
	n = n ? Object.assign({}, D, n) : D;
	const s = X(e, t, !0, 0);
	return (
		(s.observers = null),
		(s.observerSlots = null),
		(s.comparator = n.equals || void 0),
		H(s),
		me.bind(s)
	);
}
function _e(e, t, n) {
	let s, i, o;
	(arguments.length === 2 && typeof t == "object") || arguments.length === 1
		? ((s = !0), (i = e), (o = t || {}))
		: ((s = e), (i = t), (o = n || {}));
	let r = null,
		l = ee,
		u = null,
		c = !1,
		f = "initialValue" in o,
		g = typeof s == "function" && G(s);
	const a = new Set(),
		[h, x] = (o.storage || k)(o.initialValue),
		[C, O] = k(void 0),
		[I, A] = k(void 0, { equals: !1 }),
		[$, E] = k(f ? "ready" : "unresolved");
	if (v.context) {
		u = `${v.context.id}${v.context.count++}`;
		let d;
		o.ssrLoadFrom === "initial"
			? (l = o.initialValue)
			: v.load && (d = v.load(u)) && (l = d[0]);
	}
	function S(d, b, w, U) {
		return (
			r === d &&
				((r = null),
				(f = !0),
				(d === l || b === l) &&
					o.onHydrated &&
					queueMicrotask(() => o.onHydrated(U, { value: b })),
				(l = ee),
				Y(b, w)),
			b
		);
	}
	function Y(d, b) {
		L(() => {
			b || x(() => d), O(b), E(b ? "errored" : "ready");
			for (const w of a.keys()) w.decrement();
			a.clear();
		}, !1);
	}
	function Z() {
		const d = Te,
			b = h(),
			w = C();
		if (w && !r) throw w;
		return (
			p &&
				!p.user &&
				d &&
				le(() => {
					I(),
						r &&
							(d.resolved ||
								a.has(d) ||
								(d.increment(), a.add(d)));
				}),
			b
		);
	}
	function z(d = !0) {
		if (d !== !1 && c) return;
		c = !1;
		const b = g ? g() : s;
		if (b == null || b === !1) {
			S(r, T(h));
			return;
		}
		const w = l !== ee ? l : T(() => i(b, { value: h(), refetching: d }));
		return typeof w != "object" || !("then" in w)
			? (S(r, w), w)
			: ((r = w),
			  (c = !0),
			  queueMicrotask(() => (c = !1)),
			  L(() => {
					E(f ? "refreshing" : "pending"), A();
			  }, !1),
			  w.then(
					(U) => S(w, U, void 0, b),
					(U) => S(w, void 0, ve(U)),
			  ));
	}
	return (
		Object.defineProperties(Z, {
			state: { get: () => $() },
			error: { get: () => C() },
			loading: {
				get() {
					const d = $();
					return d === "pending" || d === "refreshing";
				},
			},
			latest: {
				get() {
					if (!f) return Z();
					const d = C();
					if (d && !r) throw d;
					return h();
				},
			},
		}),
		g ? le(() => z(!1)) : z(!1),
		[Z, { refetch: z, mutate: x }]
	);
}
function T(e) {
	let t,
		n = p;
	return (p = null), (t = e()), (p = n), t;
}
function Ne(e) {
	pe(() => T(e));
}
function ge(e) {
	return (
		m === null ||
			(m.cleanups === null ? (m.cleanups = [e]) : m.cleanups.push(e)),
		e
	);
}
let Te;
function me() {
	const e = P;
	if (this.sources && (this.state || e))
		if (this.state === N || e) H(this);
		else {
			const t = y;
			(y = null), L(() => W(this), !1), (y = t);
		}
	if (p) {
		const t = this.observers ? this.observers.length : 0;
		p.sources
			? (p.sources.push(this), p.sourceSlots.push(t))
			: ((p.sources = [this]), (p.sourceSlots = [t])),
			this.observers
				? (this.observers.push(p),
				  this.observerSlots.push(p.sources.length - 1))
				: ((this.observers = [p]),
				  (this.observerSlots = [p.sources.length - 1]));
	}
	return this.value;
}
function ye(e, t, n) {
	let s = e.value;
	return (
		(!e.comparator || !e.comparator(s, t)) &&
			((e.value = t),
			e.observers &&
				e.observers.length &&
				L(() => {
					for (let i = 0; i < e.observers.length; i += 1) {
						const o = e.observers[i],
							r = P && P.running;
						r && P.disposed.has(o),
							((r && !o.tState) || (!r && !o.state)) &&
								(o.pure ? y.push(o) : _.push(o),
								o.observers && we(o)),
							r || (o.state = N);
					}
					if (y.length > 1e6) throw ((y = []), new Error());
				}, !1)),
		t
	);
}
function H(e) {
	if (!e.fn) return;
	oe(e);
	const t = m,
		n = p,
		s = ie;
	(p = m = e), ke(e, e.value, s), (p = n), (m = t);
}
function ke(e, t, n) {
	let s;
	try {
		s = e.fn(t);
	} catch (i) {
		e.pure && (e.state = N), xe(i);
	}
	(!e.updatedAt || e.updatedAt <= n) &&
		(e.updatedAt != null && "observers" in e ? ye(e, s) : (e.value = s),
		(e.updatedAt = n));
}
function X(e, t, n, s = N, i) {
	const o = {
		fn: e,
		state: s,
		updatedAt: null,
		owned: null,
		sources: null,
		sourceSlots: null,
		cleanups: null,
		value: t,
		owner: m,
		context: null,
		pure: n,
	};
	return (
		m === null ||
			(m !== he && (m.owned ? m.owned.push(o) : (m.owned = [o]))),
		o
	);
}
function K(e) {
	const t = P;
	if (e.state === 0 || t) return;
	if (e.state === V || t) return W(e);
	if (e.suspense && T(e.suspense.inFallback))
		return e.suspense.effects.push(e);
	const n = [e];
	for (; (e = e.owner) && (!e.updatedAt || e.updatedAt < ie); )
		(e.state || t) && n.push(e);
	for (let s = n.length - 1; s >= 0; s--)
		if (((e = n[s]), e.state === N || t)) H(e);
		else if (e.state === V || t) {
			const i = y;
			(y = null), L(() => W(e, n[0]), !1), (y = i);
		}
}
function L(e, t) {
	if (y) return e();
	let n = !1;
	t || (y = []), _ ? (n = !0) : (_ = []), ie++;
	try {
		const s = e();
		return Pe(n), s;
	} catch (s) {
		y || (_ = null), xe(s);
	}
}
function Pe(e) {
	if ((y && (be(y), (y = null)), e)) return;
	const t = _;
	(_ = null), t.length && L(() => de(t), !1);
}
function be(e) {
	for (let t = 0; t < e.length; t++) K(e[t]);
}
function je(e) {
	let t,
		n = 0;
	for (t = 0; t < e.length; t++) {
		const s = e[t];
		s.user ? (e[n++] = s) : K(s);
	}
	for (v.context && Ae(), t = 0; t < n; t++) K(e[t]);
}
function W(e, t) {
	const n = P;
	e.state = 0;
	for (let s = 0; s < e.sources.length; s += 1) {
		const i = e.sources[s];
		i.sources &&
			(i.state === N || n
				? i !== t && K(i)
				: (i.state === V || n) && W(i, t));
	}
}
function we(e) {
	const t = P;
	for (let n = 0; n < e.observers.length; n += 1) {
		const s = e.observers[n];
		(!s.state || t) &&
			((s.state = V),
			s.pure ? y.push(s) : _.push(s),
			s.observers && we(s));
	}
}
function oe(e) {
	let t;
	if (e.sources)
		for (; e.sources.length; ) {
			const n = e.sources.pop(),
				s = e.sourceSlots.pop(),
				i = n.observers;
			if (i && i.length) {
				const o = i.pop(),
					r = n.observerSlots.pop();
				s < i.length &&
					((o.sourceSlots[r] = s),
					(i[s] = o),
					(n.observerSlots[s] = r));
			}
		}
	if (e.owned) {
		for (t = 0; t < e.owned.length; t++) oe(e.owned[t]);
		e.owned = null;
	}
	if (e.cleanups) {
		for (t = 0; t < e.cleanups.length; t++) e.cleanups[t]();
		e.cleanups = null;
	}
	(e.state = 0), (e.context = null);
}
function ve(e) {
	return e instanceof Error || typeof e == "string"
		? e
		: new Error("Unknown error");
}
function xe(e) {
	throw ((e = ve(e)), e);
}
const Le = Symbol("fallback");
function re(e) {
	for (let t = 0; t < e.length; t++) e[t]();
}
function Oe(e, t, n = {}) {
	let s = [],
		i = [],
		o = [],
		r = 0,
		l = t.length > 1 ? [] : null;
	return (
		ge(() => re(o)),
		() => {
			let u = e() || [],
				c,
				f;
			return (
				u[Se],
				T(() => {
					let a = u.length,
						h,
						x,
						C,
						O,
						I,
						A,
						$,
						E,
						S;
					if (a === 0)
						r !== 0 &&
							(re(o),
							(o = []),
							(s = []),
							(i = []),
							(r = 0),
							l && (l = [])),
							n.fallback &&
								((s = [Le]),
								(i[0] = q((Y) => ((o[0] = Y), n.fallback()))),
								(r = 1));
					else if (r === 0) {
						for (i = new Array(a), f = 0; f < a; f++)
							(s[f] = u[f]), (i[f] = q(g));
						r = a;
					} else {
						for (
							C = new Array(a),
								O = new Array(a),
								l && (I = new Array(a)),
								A = 0,
								$ = Math.min(r, a);
							A < $ && s[A] === u[A];
							A++
						);
						for (
							$ = r - 1, E = a - 1;
							$ >= A && E >= A && s[$] === u[E];
							$--, E--
						)
							(C[E] = i[$]), (O[E] = o[$]), l && (I[E] = l[$]);
						for (
							h = new Map(), x = new Array(E + 1), f = E;
							f >= A;
							f--
						)
							(S = u[f]),
								(c = h.get(S)),
								(x[f] = c === void 0 ? -1 : c),
								h.set(S, f);
						for (c = A; c <= $; c++)
							(S = s[c]),
								(f = h.get(S)),
								f !== void 0 && f !== -1
									? ((C[f] = i[c]),
									  (O[f] = o[c]),
									  l && (I[f] = l[c]),
									  (f = x[f]),
									  h.set(S, f))
									: o[c]();
						for (f = A; f < a; f++)
							f in C
								? ((i[f] = C[f]),
								  (o[f] = O[f]),
								  l && ((l[f] = I[f]), l[f](f)))
								: (i[f] = q(g));
						(i = i.slice(0, (r = a))), (s = u.slice(0));
					}
					return i;
				})
			);
			function g(a) {
				if (((o[f] = a), l)) {
					const [h, x] = k(f);
					return (l[f] = x), t(u[f], h);
				}
				return t(u[f]);
			}
		}
	);
}
function J(e, t) {
	return T(() => e(t || {}));
}
function Ie(e) {
	const t = "fallback" in e && { fallback: () => e.fallback };
	return G(Oe(() => e.each, e.children, t || void 0));
}
function Me(e) {
	let t = !1;
	const n = e.keyed,
		s = G(() => e.when, void 0, {
			equals: (i, o) => (t ? i === o : !i == !o),
		});
	return G(() => {
		const i = s();
		if (i) {
			const o = e.children,
				r = typeof o == "function" && o.length > 0;
			return (t = n || r), r ? T(() => o(i)) : o;
		}
		return e.fallback;
	});
}
function Be(e, t) {
	return G(e, void 0, t ? void 0 : { equals: t });
}
function He(e, t, n) {
	let s = n.length,
		i = t.length,
		o = s,
		r = 0,
		l = 0,
		u = t[i - 1].nextSibling,
		c = null;
	for (; r < i || l < o; ) {
		if (t[r] === n[l]) {
			r++, l++;
			continue;
		}
		for (; t[i - 1] === n[o - 1]; ) i--, o--;
		if (i === r) {
			const f = o < s ? (l ? n[l - 1].nextSibling : n[o - l]) : u;
			for (; l < o; ) e.insertBefore(n[l++], f);
		} else if (o === l)
			for (; r < i; ) (!c || !c.has(t[r])) && t[r].remove(), r++;
		else if (t[r] === n[o - 1] && n[l] === t[i - 1]) {
			const f = t[--i].nextSibling;
			e.insertBefore(n[l++], t[r++].nextSibling),
				e.insertBefore(n[--o], f),
				(t[i] = n[o]);
		} else {
			if (!c) {
				c = new Map();
				let g = l;
				for (; g < o; ) c.set(n[g], g++);
			}
			const f = c.get(t[r]);
			if (f != null)
				if (l < f && f < o) {
					let g = r,
						a = 1,
						h;
					for (
						;
						++g < i &&
						g < o &&
						!((h = c.get(t[g])) == null || h !== f + a);

					)
						a++;
					if (a > f - l) {
						const x = t[r];
						for (; l < f; ) e.insertBefore(n[l++], x);
					} else e.replaceChild(n[l++], t[r++]);
				} else r++;
			else t[r++].remove();
		}
	}
}
const fe = "_$DX_DELEGATE";
function Re(e, t, n) {
	let s;
	return (
		q((i) => {
			(s = i),
				t === document
					? e()
					: j(t, e(), t.firstChild ? null : void 0, n);
		}),
		() => {
			s(), (t.textContent = "");
		}
	);
}
function R(e, t, n) {
	const s = document.createElement("template");
	s.innerHTML = e;
	let i = s.content.firstChild;
	return n && (i = i.firstChild), i;
}
function $e(e, t = window.document) {
	const n = t[fe] || (t[fe] = new Set());
	for (let s = 0, i = e.length; s < i; s++) {
		const o = e[s];
		n.has(o) || (n.add(o), t.addEventListener(o, Ue));
	}
}
function te(e, t) {
	t == null ? e.removeAttribute("class") : (e.className = t);
}
function j(e, t, n, s) {
	if ((n !== void 0 && !s && (s = []), typeof t != "function"))
		return Q(e, t, s, n);
	F((i) => Q(e, t(), i, n), s);
}
function Ue(e) {
	const t = `$$${e.type}`;
	let n = (e.composedPath && e.composedPath()[0]) || e.target;
	for (
		e.target !== n &&
			Object.defineProperty(e, "target", { configurable: !0, value: n }),
			Object.defineProperty(e, "currentTarget", {
				configurable: !0,
				get() {
					return n || document;
				},
			}),
			v.registry &&
				!v.done &&
				((v.done = !0),
				document
					.querySelectorAll("[id^=pl-]")
					.forEach((s) => s.remove()));
		n !== null;

	) {
		const s = n[t];
		if (s && !n.disabled) {
			const i = n[`${t}Data`];
			if ((i !== void 0 ? s.call(n, i, e) : s.call(n, e), e.cancelBubble))
				return;
		}
		n =
			n.host && n.host !== n && n.host instanceof Node
				? n.host
				: n.parentNode;
	}
}
function Q(e, t, n, s, i) {
	for (v.context && !n && (n = [...e.childNodes]); typeof n == "function"; )
		n = n();
	if (t === n) return n;
	const o = typeof t,
		r = s !== void 0;
	if (
		((e = (r && n[0] && n[0].parentNode) || e),
		o === "string" || o === "number")
	) {
		if (v.context) return n;
		if ((o === "number" && (t = t.toString()), r)) {
			let l = n[0];
			l && l.nodeType === 3
				? (l.data = t)
				: (l = document.createTextNode(t)),
				(n = M(e, n, s, l));
		} else
			n !== "" && typeof n == "string"
				? (n = e.firstChild.data = t)
				: (n = e.textContent = t);
	} else if (t == null || o === "boolean") {
		if (v.context) return n;
		n = M(e, n, s);
	} else {
		if (o === "function")
			return (
				F(() => {
					let l = t();
					for (; typeof l == "function"; ) l = l();
					n = Q(e, l, n, s);
				}),
				() => n
			);
		if (Array.isArray(t)) {
			const l = [],
				u = n && Array.isArray(n);
			if (ne(l, t, n, i))
				return F(() => (n = Q(e, l, n, s, !0))), () => n;
			if (v.context) {
				if (!l.length) return n;
				for (let c = 0; c < l.length; c++)
					if (l[c].parentNode) return (n = l);
			}
			if (l.length === 0) {
				if (((n = M(e, n, s)), r)) return n;
			} else
				u
					? n.length === 0
						? ce(e, l, s)
						: He(e, n, l)
					: (n && M(e), ce(e, l));
			n = l;
		} else if (t instanceof Node) {
			if (v.context && t.parentNode) return (n = r ? [t] : t);
			if (Array.isArray(n)) {
				if (r) return (n = M(e, n, s, t));
				M(e, n, null, t);
			} else
				n == null || n === "" || !e.firstChild
					? e.appendChild(t)
					: e.replaceChild(t, e.firstChild);
			n = t;
		}
	}
	return n;
}
function ne(e, t, n, s) {
	let i = !1;
	for (let o = 0, r = t.length; o < r; o++) {
		let l = t[o],
			u = n && n[o];
		if (l instanceof Node) e.push(l);
		else if (!(l == null || l === !0 || l === !1))
			if (Array.isArray(l)) i = ne(e, l, u) || i;
			else if (typeof l == "function")
				if (s) {
					for (; typeof l == "function"; ) l = l();
					i =
						ne(
							e,
							Array.isArray(l) ? l : [l],
							Array.isArray(u) ? u : [u],
						) || i;
				} else e.push(l), (i = !0);
			else {
				const c = String(l);
				u && u.nodeType === 3 && u.data === c
					? e.push(u)
					: e.push(document.createTextNode(c));
			}
	}
	return i;
}
function ce(e, t, n) {
	for (let s = 0, i = t.length; s < i; s++) e.insertBefore(t[s], n);
}
function M(e, t, n, s) {
	if (n === void 0) return (e.textContent = "");
	const i = s || document.createTextNode("");
	if (t.length) {
		let o = !1;
		for (let r = t.length - 1; r >= 0; r--) {
			const l = t[r];
			if (i !== l) {
				const u = l.parentNode === e;
				!o && !r
					? u
						? e.replaceChild(i, l)
						: e.insertBefore(i, n)
					: u && l.remove();
			} else o = !0;
		}
	} else e.insertBefore(i, n);
	return [i];
}
const Ge = R(
		'<div class="py-2"><div class="flex flex-col items-stretch mb-4"><button>CREATE NEW PROJECT</button></div><p class="my-0">Choose a project</p><div class="flex flex-col mt-2"></div></div>',
	),
	qe = R("<span>Empty</span>"),
	De = R(
		'<div class="flex justify-between my-1"><span>)</span><div class="flex"><button></button></div></div>',
	);
function Ve(e) {
	const t = (n) => n === B()?.id;
	return (() => {
		const n = Ge.cloneNode(!0),
			s = n.firstChild,
			i = s.firstChild,
			o = s.nextSibling,
			r = o.nextSibling;
		return (
			(i.$$click = () => {
				vscodeApi.postMessage({ type: "openCreateProjectInput" });
			}),
			te(i, `bg-vsblue ${ue}`),
			j(
				r,
				J(Ie, {
					get each() {
						return Qe();
					},
					get fallback() {
						return qe.cloneNode(!0);
					},
					children: (l) =>
						(() => {
							const u = De.cloneNode(!0),
								c = u.firstChild,
								f = c.firstChild,
								g = c.nextSibling,
								a = g.firstChild;
							return (
								j(c, () => `${l.name} (${l.id}`, f),
								(a.$$click = () =>
									t(l.id) ? Ce(null) : e.onChoose(l)),
								j(a, () => (t(l.id) ? "Cancel" : "Choose")),
								F(
									(h) => {
										const x = t(l.id) ? "font-bold" : "",
											C = `mr-1 bg-vsgreen ${ue} ${
												t(l.id) ? "op-80" : ""
											}`;
										return (
											x !== h._v$ && te(c, (h._v$ = x)),
											C !== h._v$2 && te(a, (h._v$2 = C)),
											h
										);
									},
									{ _v$: void 0, _v$2: void 0 },
								),
								u
							);
						})(),
				}),
			),
			n
		);
	})();
}
$e(["click"]);
const Fe = R(
		'<div class="flex flex-col my-1"><div><p class="font-bold mt-4 mb-0">PROJECTS</p></div></div>',
	),
	Ke = R(
		'<div class="h-96 flex flex-col items-center justify-items-center my-12"><a class="bg-vsgreen rounded-0 border-none text-white text-center decoration-none cursor-pointer py-1 align-mid hover:op-80 py-2 px-6 hover:text-white" href="http://localhost:4000/login/oauth/github/authorize">LOGIN WITH GITHUB</a></div>',
	),
	We = R(
		'<div><div class="flex justify-between mt-2"><span class="font-bold">Project: </span></div><div class="flex flex-col mt-3 justify-center items-stretch gap-2"><button class="bg-vsgreen rounded-0 border-none text-white text-center decoration-none cursor-pointer py-1 align-mid hover:op-80 py-2 px-6">PUSH CHANGES TO SERVER</button><button title="Fetch changes for this " class="bg-vsblue rounded-0 border-none text-white text-center decoration-none cursor-pointer py-1 align-mid hover:op-80 py-2 px-4">FETCH CHANGES AND APPLY</button></div></div>',
	),
	ue =
		"rounded-0 border-none text-white text-center decoration-none cursor-pointer py-1 align-mid hover:op-80",
	[se, Je] = k({ isAuth: !1, refreshToken: "", accessToken: "" }),
	[Qe, { mutate: ze, refetch: ae }] = _e(async () =>
		se().isAuth
			? (
					await (
						await fetch("http://localhost:4000/project", {
							method: "GET",
							headers: {
								"Content-Type": "application/json",
								"authorization": se().accessToken,
							},
						})
					).json()
			  ).projects
			: [],
	),
	Xe = ({ projectId: e }) => {
		vscodeApi.postMessage({ type: "send", projectId: e });
	},
	Ye = ({ projectId: e }) => {
		vscodeApi.postMessage({ type: "receive", projectId: e });
	},
	[B, Ce] = k(null);
function Ze() {
	const e = (t) => {
		Ce(t);
	};
	return (
		Ne(() => {
			vscodeApi.postMessage({ type: "triggerGetAuth" });
		}),
		pe(() => {
			const t = (n) => {
				const s = n.data,
					{ command: i, ...o } = s;
				switch (i) {
					case "authorize":
						Je(o), ae();
						break;
					case "refetchProjects":
						ae();
						break;
					default:
						throw new Error(`Unknown command: ${i}`);
				}
			};
			window.addEventListener("message", t),
				ge(() => window.removeEventListener("message", t));
		}),
		J(Me, {
			get when() {
				return se().isAuth;
			},
			get fallback() {
				return (() => {
					const t = Ke.cloneNode(!0);
					return t.firstChild, t;
				})();
			},
			get children() {
				const t = Fe.cloneNode(!0),
					n = t.firstChild;
				return (
					n.firstChild,
					j(
						t,
						(() => {
							const s = Be(() => !!B(), !0);
							return () =>
								s() &&
								(() => {
									const i = We.cloneNode(!0),
										o = i.firstChild,
										r = o.firstChild;
									r.firstChild;
									const l = o.nextSibling,
										u = l.firstChild,
										c = u.nextSibling;
									return (
										j(
											r,
											() => `${B()?.name} (${B()?.id})`,
											null,
										),
										(u.$$click = () =>
											Xe({ projectId: B()?.id })),
										(c.$$click = () => {
											Ye({ projectId: B()?.id });
										}),
										i
									);
								})();
						})(),
						n,
					),
					j(n, J(Ve, { onChoose: e }), null),
					t
				);
			},
		})
	);
}
$e(["click"]);
Re(() => J(Ze, {}), document.getElementById("root"));
