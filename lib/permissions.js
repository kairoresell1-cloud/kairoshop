// Regole permessi Kairo Shop
//
// SUPER_OWNER -> accesso totale, sempre, a tutto. Non rimuovibile.
// OWNER       -> accesso totale, può creare/rimuovere Admin e altri Owner.
// ADMIN       -> solo i permessi specifici assegnati (tabella Permission).
// USER        -> nessun permesso gestionale.

export const ALL_PERMISSIONS = [
  "USERS_VIEW", "USERS_EDIT", "USERS_DELETE",
  "PRODUCTS_VIEW", "PRODUCTS_EDIT", "PRODUCTS_DELETE",
  "ORDERS_VIEW", "ORDERS_EDIT", "ORDERS_DELETE",
  "INVENTORY_VIEW", "INVENTORY_EDIT",
  "PROMOTIONS_VIEW", "PROMOTIONS_EDIT",
  "COUPONS_VIEW", "COUPONS_EDIT",
  "ANALYTICS_VIEW",
  "FINANCE_VIEW",
  "SUPPLIERS_VIEW", "SUPPLIERS_EDIT", "SUPPLIERS_DELETE",
  "SUPPLIERS_COSTS_VIEW",
  "AUDIT_LOG_VIEW",
];

export function hasPermission(sessionUser, permissionKey) {
  if (!sessionUser) return false;
  if (sessionUser.role === "SUPER_OWNER" || sessionUser.role === "OWNER") return true;
  if (sessionUser.role === "ADMIN") {
    return sessionUser.permissions?.includes(permissionKey);
  }
  return false;
}

export function isStaff(sessionUser) {
  return ["ADMIN", "OWNER", "SUPER_OWNER"].includes(sessionUser?.role);
}

export function canManageRoles(sessionUser) {
  return ["OWNER", "SUPER_OWNER"].includes(sessionUser?.role);
}
