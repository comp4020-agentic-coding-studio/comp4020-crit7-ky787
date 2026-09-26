// The routes the invariants run against. When you add a page, add its route
// here, or the invariants stop covering it.
//
// One of each kind of page in the app: the two utility pages, both course
// contents views, a long article, a practical, an external-resource page, a
// released-feedback page, and search in both its empty and its answered state.
export const ROUTES = [
  "/",
  "/saved/",
  "/search/",
  "/search/?q=opaque",
  "/readme/",
  "/c/seeing-through-obfuscated-code/",
  "/c/seeing-through-obfuscated-code/?groups=collapsed",
  "/c/seeing-through-obfuscated-code/bogus-control-flow-and-opaque-predicates/",
  "/c/seeing-through-obfuscated-code/obfuscation-terminology/",
  "/c/seeing-through-obfuscated-code/llvm-language-reference/",
  "/c/seeing-through-obfuscated-code/feedback/a1/",
  "/c/foundations-of-programming/",
  "/c/foundations-of-programming/python-style-guide/",
];
