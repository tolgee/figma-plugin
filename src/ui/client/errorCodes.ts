export function errorToText(code: string) {
  switch (code) {
    case "plan_translation_limit_exceeded":
      return "Plan translation limit exceeded (check your organization billing in Tolgee platform)";
    case "operation_not_permitted":
      return "Operation not permitted";
    default:
      return code || "Error status code from server";
  }
}
