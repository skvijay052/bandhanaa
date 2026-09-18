import "server-only";
// Audit records are written inside admin_mutate's database transaction, never in
// a second HTTP call. A failed audit insert rolls the entire operation back.
export function publicActionError(code?: string) {
  if (code === "42501")
    return "You do not have permission to perform this action.";
  if (code === "40001")
    return "This record changed. Refresh the page before trying again.";
  if (code === "23505")
    return "This request was already used for a different operation.";
  if (code === "P0002") return "The record could not be found.";
  if (code === "P0001")
    return "The change could not be completed. Check the balance and account restrictions.";
  return "The change was not saved. Refresh and try again.";
}
